// Creates or resets the Ory test users used by the Playwright tests.
// Each run sets a fresh random password and writes the credentials to
// web/e2e/.auth/test-users.json (gitignored). Only identities on TEST_DOMAIN are touched.
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const TEST_DOMAIN = 'test.myapp.example'
const TEST_USERS = [`user@${TEST_DOMAIN}`, `other@${TEST_DOMAIN}`]

const appHost = fileURLToPath(new URL('../MyApp.AppHost/', import.meta.url))
const output = fileURLToPath(new URL('../web/e2e/.auth/test-users.json', import.meta.url))

function userSecrets() {
  const result = spawnSync('dotnet', ['user-secrets', 'list', '--json', '--project', `${appHost}MyApp.AppHost.csproj`],
    { encoding: 'utf8' })
  if (result.error || result.status !== 0) return {}
  return JSON.parse(result.stdout.replace(/^\/\/.*$/gm, ''))
}

const settings = JSON.parse(readFileSync(`${appHost}appsettings.Development.json`, 'utf8')).Parameters
const sdkUrl = (process.env.ORY_SDK_URL ?? settings['ory-sdk-url']).replace(/\/$/, '')
const apiKey = process.env.ORY_PROJECT_API_KEY ?? userSecrets()['Parameters:ory-project-api-key']
if (!apiKey) {
  console.error('Missing Ory project API key. Set Parameters:ory-project-api-key in the AppHost user secrets.')
  process.exit(1)
}

async function ory(method, path, body) {
  const response = await fetch(`${sdkUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body && JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${method} ${path} failed with ${response.status}: ${await response.text()}`)
  return response.status === 204 ? null : response.json()
}

const users = []
for (const email of TEST_USERS) {
  if (!email.endsWith(`@${TEST_DOMAIN}`)) throw new Error(`Refusing to touch non-test identity ${email}`)
  const password = randomBytes(24).toString('base64url')
  const identity = {
    schema_id: 'preset://email',
    state: 'active',
    traits: { email },
    credentials: { password: { config: { password } } },
    verifiable_addresses: [{ value: email, via: 'email', verified: true, status: 'completed' }],
  }
  const [existing] = await ory('GET', `/admin/identities?credentials_identifier=${encodeURIComponent(email)}`)
  if (existing) {
    await ory('PUT', `/admin/identities/${existing.id}`, identity)
    console.log(`Reset password for ${email}`)
  } else {
    await ory('POST', '/admin/identities', identity)
    console.log(`Created ${email}`)
  }
  users.push({ email, password })
}

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, JSON.stringify({ users }, null, 2) + '\n', { mode: 0o600 })
console.log(`Wrote credentials to ${output}`)
