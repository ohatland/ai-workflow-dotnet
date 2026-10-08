// Generates and checks the OpenFGA authorization model with the pinned fga CLI in Docker.
//
//   node scripts/authorization-model.mjs transform   writes authorization/model.json from model.fga
//   node scripts/authorization-model.mjs test        runs the model tests in model.fga.yaml
//   node scripts/authorization-model.mjs check       runs the tests and fails if model.json is stale
import { spawnSync } from 'node:child_process'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const FGA_CLI_IMAGE = 'openfga/cli:v0.8.1'

const directory = fileURLToPath(new URL('../authorization/', import.meta.url))
const modelJsonPath = `${directory}model.json`

function fga(...args) {
  const result = spawnSync('docker', ['run', '--rm', '-v', `${directory}:/model:ro,z`, '-w', '/model', FGA_CLI_IMAGE, ...args],
    { encoding: 'utf8' })
  const stdout = result.stdout ?? ''
  return { ok: !result.error && result.status === 0, stdout, output: `${stdout}${result.stderr ?? ''}${result.error ?? ''}` }
}

// Pretty-printed so diffs of the generated file stay readable. Only stdout is the model: Docker
// and the CLI write progress and warnings to stderr.
function transform() {
  const result = fga('model', 'transform', '--file', 'model.fga')
  if (!result.ok) return { ok: false, output: result.output }
  try {
    return { ok: true, json: `${JSON.stringify(JSON.parse(result.stdout), null, 2)}\n` }
  } catch (error) {
    return { ok: false, output: `${error.message}\n${result.output}` }
  }
}

function runTests() {
  const tests = fga('model', 'test', '--tests', 'model.fga.yaml')
  // Also read the summary, so a run that reports failures can never pass on its exit code alone.
  const summaries = [...tests.output.matchAll(/(\d+)\/(\d+) passing/g)]
  const ok = tests.ok && summaries.length > 0 && summaries.every(([, passed, total]) => passed === total)
  return { ok, output: tests.output }
}

// Returns { ok, output } so scripts/check.mjs can report the result.
export function checkModel() {
  const tests = runTests()
  if (!tests.ok) return { ok: false, output: `Model tests failed:\n${tests.output}` }

  const generated = transform()
  if (!generated.ok) return { ok: false, output: `fga model transform failed:\n${generated.output}` }
  let current = ''
  try { current = readFileSync(modelJsonPath, 'utf8') } catch { /* missing counts as stale */ }
  if (current !== generated.json)
    return { ok: false, output: `${tests.output}\nauthorization/model.json is stale. Run: node scripts/authorization-model.mjs transform` }
  return { ok: true, output: tests.output }
}

// Real paths on both sides, so a symlinked or percent-encoded path still runs the command
// instead of silently exiting 0.
const isEntrypoint = process.argv[1] !== undefined
  && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))

if (isEntrypoint) {
  const command = process.argv[2]
  if (command === 'transform') {
    const generated = transform()
    if (!generated.ok) {
      console.error(generated.output)
      process.exit(1)
    }
    writeFileSync(modelJsonPath, generated.json)
    console.log('Wrote authorization/model.json')
  } else if (command === 'test') {
    const tests = runTests()
    console.log(tests.output)
    process.exit(tests.ok ? 0 : 1)
  } else if (command === 'check') {
    const result = checkModel()
    console.log(result.output)
    process.exit(result.ok ? 0 : 1)
  } else {
    console.error('Usage: node scripts/authorization-model.mjs transform|test|check')
    process.exit(2)
  }
}
