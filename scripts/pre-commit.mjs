// Pre-commit hook (.githooks/pre-commit): fast checks that hold in every phase of a step.
// Blocks warning suppressions and skipped or focused tests in the staged changes, and code
// that does not compile. Warnings are allowed here; the quality gate (check.mjs) fails on them.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseDiff, skippedTests, suppressions } from './diff-rules.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  return { ok: !result.error && result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const staged = run('git', ['diff', '--cached', '--name-only']).output.trim().split('\n').filter(Boolean)
const lines = parseDiff(run('git', ['diff', '--cached', '-U0']).output)
const problems = []

for (const found of suppressions(lines)) problems.push(`Warning suppression: ${found}`)
for (const found of skippedTests(lines)) problems.push(`Skipped or focused test: ${found}`)

if (staged.some(path => /\.(cs|csproj|props|slnx)$/.test(path))) {
  const build = run('dotnet', ['build', 'MyApp.slnx', '-m:1', '-v:q', '-clp:ErrorsOnly'])
  if (!build.ok) problems.push(`.NET build failed:\n${build.output.trim().split('\n').slice(-15).join('\n')}`)
}
if (staged.some(path => /^web\/.*\.(ts|tsx)$/.test(path))) {
  const types = run('bun', ['x', 'tsc', '-b'], `${root}web`)
  if (!types.ok) problems.push(`TypeScript type check failed:\n${types.output.trim().split('\n').slice(-15).join('\n')}`)
}

if (problems.length) {
  console.error(`Commit blocked by the pre-commit hook:\n\n${problems.join('\n')}\n`)
  process.exit(1)
}
