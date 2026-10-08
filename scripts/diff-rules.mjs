// Rules for added code that both the quality gate (check.mjs) and the pre-commit hook apply.

// Application and test code; scripts are command-line tools and may print.
export const isCode = path => /\.(cs|ts|tsx|mjs|js)$/.test(path) && !/\/Migrations\//.test(path) &&
  !path.startsWith('.claude/') && !path.startsWith('scripts/')
export const isTest = path => path.startsWith('tests/') || path.startsWith('web/e2e/') || /\.test\.tsx?$/.test(path)
const isTypeScript = path => /\.tsx?$/.test(path)
export const at = l => `${l.file}:${l.line}: ${l.text.trim()}`

// Lines of a `git diff -U0` as { file, line, text, sign }.
export function parseDiff(diff) {
  const lines = []
  let file = null
  let lineNumber = 0
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) file = line.slice(6)
    else if (line.startsWith('@@')) lineNumber = Number(line.match(/\+(\d+)/)[1])
    else if (line.startsWith('+')) lines.push({ file, line: lineNumber++, text: line.slice(1), sign: '+' })
    else if (line.startsWith('-') && !line.startsWith('---')) lines.push({ file, line: lineNumber, text: line.slice(1), sign: '-' })
  }
  return lines
}

function scan(lines, patterns, applies = isCode) {
  return lines.filter(l => l.sign === '+' && applies(l.file) && patterns.some(p => p.test(l.text))).map(at)
}

export const suppressions = lines => [
  ...scan(lines, [/#pragma\s+warning\s+disable/, /SuppressMessage/, /(oxlint|eslint)-disable/]),
  ...scan(lines, [/@ts-(ignore|expect-error|nocheck)/, /\bas any\b/, /:\s*any\b/], isTypeScript),
]

export const skippedTests = lines => scan(lines, [/Skip\s*=/, /\b(test|it|describe)\.(skip|only|fixme)\b/])

// A catch block whose body is only a comment, written over several added lines.
function commentOnlyCatches(lines) {
  const added = lines.filter(l => l.sign === '+' && isCode(l.file))
  return added.filter((l, i) => {
    const body = added[i + 1], close = added[i + 2]
    return /catch\s*(\([^)]*\))?\s*\{\s*$/.test(l.text) && body && close &&
      body.file === l.file && close.file === l.file && body.line === l.line + 1 && close.line === l.line + 2 &&
      /^\s*(\/\/.*|\/\*.*\*\/)\s*$/.test(body.text) && /^\s*\}/.test(close.text)
  }).map(at)
}

export const leftovers = lines => [
  ...scan(lines, [/console\.(log|debug)\(/, /\b(TODO|FIXME|HACK|XXX)\b/, /Console\.Write(Line)?\(/,
    /catch\s*(\([^)]*\))?\s*\{\s*(\/\*.*\*\/)?\s*\}/]),
  ...commentOnlyCatches(lines),
]
