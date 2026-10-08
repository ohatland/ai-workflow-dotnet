// Quality gate for a step: builds, lints and tests the working tree, and checks the changes
// since the step's base commit. Prints a compact report and writes full logs to a temporary
// folder. Any build or lint warning fails: the code base is kept at zero warnings.
// FAIL blocks the step. FLAG must be justified by the step file or approved by the user.
//
// Usage: bun scripts/check.mjs --base <commit> [--no-tests] [--e2e]
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkModel } from './authorization-model.mjs'
import { isTest, leftovers, parseDiff, skippedTests, suppressions } from './diff-rules.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
const base = args[args.indexOf('--base') + 1]
if (!args.includes('--base') || !base) {
  console.error('Usage: bun scripts/check.mjs --base <commit> [--no-tests] [--e2e]')
  process.exit(2)
}

const logs = mkdtempSync(join(tmpdir(), 'myapp-check-'))
const results = []
const report = (status, title, details = []) => results.push({ status, title, details })

function run(command, commandArgs, cwd = root, log) {
  const result = spawnSync(command, commandArgs, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (log) writeFileSync(join(logs, log), output)
  return { ok: !result.error && result.status === 0, output }
}

const git = (...gitArgs) => run('git', gitArgs).output

function dotnetWarnings() {
  const build = run('dotnet', ['build', 'MyApp.slnx', '--no-incremental', '-m:1'], root, 'dotnet-build.log')
  const warnings = new Set()
  for (const line of build.output.split('\n')) {
    const match = line.match(/^(.+?)\(\d+,\d+\): warning (\w+): (.+?) \[.+\]$/)
    if (match) warnings.add(`${match[1].replace(root, '')}: ${match[2]} ${match[3]}`)
  }
  return { ok: build.ok, warnings: [...warnings] }
}

function checkWarnings() {
  const dotnet = dotnetWarnings()
  if (!dotnet.ok) report('FAIL', '.NET build failed', ['See dotnet-build.log'])
  report(dotnet.warnings.length ? 'FAIL' : 'PASS', `.NET build warnings: ${dotnet.warnings.length}`, dotnet.warnings)

  const lint = run(join(root, 'web/node_modules/.bin/oxlint'), ['--format', 'json'], join(root, 'web'), 'oxlint.log')
  let diagnostics = null
  try { diagnostics = JSON.parse(lint.output).diagnostics } catch { /* reported below */ }
  if (!diagnostics) report('FAIL', 'oxlint failed', ['See oxlint.log'])
  else {
    const warnings = diagnostics.map(d => `web/${d.filename}: ${d.code} ${d.message}`)
    report(warnings.length ? 'FAIL' : 'PASS', `oxlint warnings: ${warnings.length}`, warnings)
  }
}

async function checkBuildsAndTests() {
  const web = run('bun', ['run', '--cwd', 'web', 'build'], root, 'web-build.log')
  report(web.ok ? 'PASS' : 'FAIL', 'Frontend type check and build', web.ok ? [] : ['See web-build.log'])

  const pending = run('dotnet', ['ef', 'migrations', 'has-pending-model-changes',
    '--project', 'src/MyApp.Infrastructure', '--startup-project', 'src/MyApp.Infrastructure'], root, 'ef.log')
  report(pending.ok ? 'PASS' : 'FAIL', 'EF Core model matches the migrations', pending.ok ? [] : ['See ef.log'])

  const model = checkModel()
  writeFileSync(join(logs, 'authorization-model.log'), model.output)
  report(model.ok ? 'PASS' : 'FAIL', 'Authorization model tests pass and model.json is up to date',
    model.ok ? [] : ['See authorization-model.log'])

  if (!args.includes('--no-tests')) {
    const tests = run('dotnet', ['test', '--project', 'tests/MyApp.Api.Tests'], root, 'api-tests.log')
    report(tests.ok ? 'PASS' : 'FAIL', 'API tests', tests.ok ? [] : ['See api-tests.log'])
  }
  if (args.includes('--e2e')) {
    if (!await waitForOry()) report('FAIL', 'E2E tests', ['Ory tunnel did not serve login flows within 60 s'])
    else {
      const e2e = run('bun', ['run', '--cwd', 'web', 'e2e'], root, 'e2e.log')
      report(e2e.ok ? 'PASS' : 'FAIL', 'E2E tests', e2e.ok ? [] : ['See e2e.log'])
    }
  }
}

// The tunnel reports Healthy before it serves login flows; e2e setup then gets a 502.
async function waitForOry() {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch('http://localhost:4000/self-service/login/browser', { headers: { Accept: 'application/json' } })
      if (response.ok) return true
    } catch { /* tunnel not up yet */ }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  return false
}

// Changed files and added lines since base, including uncommitted and untracked files.
function collectChanges() {
  const files = git('diff', '--name-status', base).trim().split('\n').filter(Boolean)
    .map(line => line.split('\t'))
    .map(([status, ...paths]) => ({ status: status[0], path: paths.at(-1) }))
  const untracked = git('ls-files', '--others', '--exclude-standard').trim().split('\n').filter(Boolean)
  files.push(...untracked.map(path => ({ status: 'A', path })))

  const lines = parseDiff(git('diff', '-U0', base))
  for (const path of untracked) {
    readFileSync(join(root, path), 'utf8').split('\n')
      .forEach((text, index) => lines.push({ file: path, line: index + 1, text, sign: '+' }))
  }
  return { files, lines }
}

function checkDiff({ files, lines }) {
  const suppressed = suppressions(lines)
  report(suppressed.length ? 'FAIL' : 'PASS', 'No new warning suppressions', suppressed)

  const skipped = skippedTests(lines)
  report(skipped.length ? 'FAIL' : 'PASS', 'No skipped or focused tests', skipped)

  const leftover = leftovers(lines)
  report(leftover.length ? 'FLAG' : 'PASS', 'Leftovers: console output, TODOs, empty or comment-only catch', leftover)

  const changedTests = files.filter(f => isTest(f.path) && f.status !== 'A').map(f => `${f.status} ${f.path}`)
  report(changedTests.length ? 'FLAG' : 'PASS', 'Changes to existing tests (justify each)', changedTests)

  const migrations = files.filter(f => /\/Migrations\/\d+_\w+\.cs$/.test(f.path) && !f.path.endsWith('.Designer.cs'))
    .map(f => `${f.status} ${f.path}`)
  report(migrations.length ? 'FLAG' : 'PASS', 'Migrations (must match the approved data model)', migrations)

  // The OpenAPI snapshot test fails on any contract change until the snapshot is updated.
  const contract = files.filter(f => f.path.endsWith('/openapi.snapshot.json')).map(f => `${f.status} ${f.path}`)
  report(contract.length ? 'FLAG' : 'PASS', 'API contract snapshot changed (must match the approved API)', contract)

  const authorizationModel = files.filter(f => f.path.startsWith('authorization/')).map(f => `${f.status} ${f.path}`)
  report(authorizationModel.length ? 'FLAG' : 'PASS', 'Authorization model changes (every relation must be in an ADR or the step\'s Clarifications)', authorizationModel)
}

function packageNames(read) {
  const names = new Set()
  try {
    const json = JSON.parse(read('web/package.json'))
    for (const key of ['dependencies', 'devDependencies']) Object.keys(json[key] ?? {}).forEach(n => names.add(`npm ${n}`))
  } catch { /* no package.json at this commit */ }
  const msbuild = ['Directory.Packages.props', ...git('ls-files', '*.csproj').trim().split('\n')]
  for (const path of msbuild) {
    let text = ''
    try { text = read(path) } catch { continue }
    for (const match of text.matchAll(/<(?:PackageVersion|PackageReference|GlobalPackageReference) Include="([^"]+)"/g)) {
      names.add(`nuget ${match[1]}`)
    }
  }
  return names
}

function checkPackages() {
  const head = packageNames(path => readFileSync(join(root, path), 'utf8'))
  const before = packageNames(path => {
    const shown = run('git', ['show', `${base}:${path}`])
    if (!shown.ok) throw new Error('missing')
    return shown.output
  })
  const newPackages = [...head].filter(name => !before.has(name))
  report(newPackages.length ? 'FLAG' : 'PASS', 'New packages (each needs the user\'s approval)', newPackages)
}

checkWarnings()
await checkBuildsAndTests()
checkDiff(collectChanges())
checkPackages()

const order = { FAIL: 0, FLAG: 1, PASS: 2 }
console.log(`Quality gate against ${base}`)
console.log('FAIL blocks the step. FLAG must be justified in the step file or approved by the user.\n')
for (const { status, title, details } of results.sort((a, b) => order[a.status] - order[b.status])) {
  console.log(`${status}  ${title}`)
  for (const detail of details.slice(0, 25)) console.log(`      ${detail}`)
  if (details.length > 25) console.log(`      ... ${details.length - 25} more`)
}
console.log(`\nLogs: ${logs}`)
process.exit(results.some(r => r.status === 'FAIL') ? 1 : 0)
