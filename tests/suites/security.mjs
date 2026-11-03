import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { json } from '../helpers/evidence.mjs'
import { command } from '../helpers/command.mjs'
const headerNames = [
  'strict-transport-security',
  'content-security-policy',
  'content-security-policy-report-only',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'cache-control',
  'content-encoding',
  'server',
]
async function responseInfo(url) {
  try {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
    return {
      url,
      status: r.status,
      location: r.headers.get('location'),
      headers: Object.fromEntries(headerNames.map((n) => [n, r.headers.get(n)])),
      cookies: r.headers.getSetCookie(),
    }
  } catch (error) {
    return { url, error: String(error) }
  }
}
export async function run({ base, inventory }) {
  const local = [],
    live = []
  for (const route of inventory.routes) {
    local.push(await responseInfo(base + route))
    live.push(await responseInfo('https://invictolabs.com' + route))
  }
  for (const url of [
    'http://invictolabs.com/',
    'https://www.invictolabs.com/',
    'https://invictolabs.com/robots.txt',
    'https://invictolabs.com/sitemap.xml',
    'https://invictolabs.com/not-a-real-qa-page',
  ])
    live.push(await responseInfo(url))
  const assets = await readdir('dist/assets')
  const sensitivePatterns = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
    ['openai-key', /sk-(?:proj-)?[A-Za-z0-9_-]{30,}/g],
    ['aws-access-id', /AKIA[A-Z0-9]{16}/g],
    ['github-token', /gh[pousr]_[A-Za-z0-9]{30,}/g],
  ]
  const findings = [],
    sourceMaps = []
  for (const file of assets) {
    if (file.endsWith('.map')) sourceMaps.push(file)
    if (!/\.(js|css)$/.test(file)) continue
    const text = await readFile(path.join('dist/assets', file), 'utf8')
    if (/sourceMappingURL=/.test(text)) sourceMaps.push(file)
    for (const [kind, pattern] of sensitivePatterns) {
      for (const match of text.matchAll(pattern))
        findings.push({ file, kind, offset: match.index, value: '[redacted; validate locally]' })
    }
  }
  const npmCLI = process.env.npm_execpath
  const audits = {}
  if (npmCLI) {
    for (const mode of ['all', 'production']) {
      const result = await command(process.execPath, [
        npmCLI,
        'audit',
        '--json',
        '--cache',
        '.npm-cache',
        ...(mode === 'production' ? ['--omit=dev'] : []),
      ])
      try {
        audits[mode] = { exitCode: result.exitCode, ...JSON.parse(result.stdout) }
      } catch {
        audits[mode] = result
      }
    }
    audits.outdated = await command(process.execPath, [
      npmCLI,
      'outdated',
      '--json',
      '--cache',
      '.npm-cache',
    ])
  }
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'))
  const licenses = {}
  for (const [name, p] of Object.entries(lock.packages)) {
    if (!name) continue
    const license = p.license || 'UNDECLARED'
    ;(licenses[license] ||= []).push({ package: name, version: p.version, dev: Boolean(p.dev) })
  }
  await json('security.json', {
    local,
    live,
    sourceMaps,
    secretPatternFindings: findings,
    audits,
    licenses,
    scope:
      'Read-only headers, build patterns and dependency advisories. Missing headers are defense-in-depth gaps; no exploit or server-side penetration test was performed. Fetch does not model browser CORS or HTTP/2, and no private data was submitted.',
  })
  return {
    liveResponses: live.filter((r) => r.status).length,
    unverifiedLive: live.filter((r) => r.error).length,
    productionVulnerabilities: audits.production?.metadata?.vulnerabilities,
    sourceMaps: sourceMaps.length,
    secretPatternFindings: findings.length,
    failures: findings.length,
  }
}
