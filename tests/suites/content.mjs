import ts from 'typescript'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { json, output } from '../helpers/evidence.mjs'
async function files(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await files(file)))
    else if (/\.(tsx?|css)$/.test(file)) result.push(file)
  }
  return result
}
export async function run() {
  const candidates = [],
    features = [],
    cssStats = []
  const sourceFiles = await files('src'),
    imports = new Map()
  for (const file of sourceFiles) {
    const text = await readFile(file, 'utf8')
    imports.set(
      path.resolve(file),
      [...text.matchAll(/(?:from\s*|import\s*\(?\s*)['"](\.[^'"]+)['"]/g)].map((m) => m[1]),
    )
    if (file.endsWith('.css')) {
      cssStats.push({
        file,
        lines: text.split('\n').length,
        important: (text.match(/!important/g) || []).length,
        zIndices: [...text.matchAll(/z-index:\s*([^;}]+)/g)].map((m) => m[1]),
        hundredVH: [...text.matchAll(/[^\n]*\b100vh\b[^\n]*/g)].map((m) => ({
          line: text.slice(0, m.index).split('\n').length,
          text: m[0].trim(),
        })),
        features: [
          ...new Set(
            [
              'backdrop-filter',
              'overflow-x: clip',
              'mask-image',
              'text-wrap',
              'dvh',
              'svh',
              'view-transition',
              'clamp(',
              'content-visibility',
            ].filter((f) => text.includes(f)),
          ),
        ],
      })
      continue
    }
    const source = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )
    function visit(node) {
      if (
        ts.isJsxText(node) ||
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node)
      ) {
        const value = node.text.replace(/\s+/g, ' ').trim()
        const technical =
          /^(https?:|\/|\.|#|data:|mailto:|tel:)/.test(value) || /^[a-z0-9_-]+$/.test(value)
        if (!technical && value.length >= 12 && value.split(/\s+/).length >= 3) {
          const position = source.getLineAndCharacterOfPosition(node.getStart(source))
          candidates.push({
            id: `COPY-${String(candidates.length + 1).padStart(4, '0')}`,
            file: file.replaceAll('\\', '/'),
            line: position.line + 1,
            text: value,
            status: 'Review candidate; not independently substantiated',
            owner: /privacy|legal|insurance|underwrit|certif|compliance/i.test(value)
              ? 'Legal / Security'
              : /coverage|nationwide|turnaround|capacity|quality|review|operations|search|mortgage|tax/i.test(
                    value,
                  )
                ? 'Operations / Product'
                : 'Marketing / Leadership',
          })
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    features.push({
      file,
      innerHTML: /dangerouslySetInnerHTML|\.innerHTML\s*=/.test(text),
      storage: /localStorage|sessionStorage|document.cookie/.test(text),
      externalScript: /createElement\(['"]script|<script.*src=/.test(text),
      scrollListeners: (text.match(/addEventListener\(['"]scroll/g) || []).length,
      animationFrames: (text.match(/requestAnimationFrame/g) || []).length,
      observers: [
        ...new Set(['IntersectionObserver', 'ResizeObserver'].filter((f) => text.includes(f))),
      ],
    })
  }
  await json('content-candidates.json', candidates)
  const known = new Set(sourceFiles.map((file) => path.resolve(file))),
    reachable = new Set()
  function visitImport(file) {
    if (reachable.has(file)) return
    reachable.add(file)
    for (const relative of imports.get(file) || []) {
      const base = path.resolve(path.dirname(file), relative),
        target = [
          base,
          base + '.ts',
          base + '.tsx',
          base + '.css',
          path.join(base, 'index.tsx'),
        ].find((p) => known.has(p))
      if (target) visitImport(target)
    }
  }
  visitImport(path.resolve('src/main.tsx'))
  const unreachableCandidates = sourceFiles.filter(
    (file) => !file.endsWith('.d.ts') && !reachable.has(path.resolve(file)),
  )
  await json('source-features.json', {
    features,
    cssStats,
    unreachableCandidates,
    note: 'Import-graph candidates only; verify runtime/dynamic conventions and obtain approval before deleting any file.',
  })
  const escape = (s) => s.replaceAll('|', '\\|').replaceAll('\n', ' ')
  await writeFile(
    path.join(output, 'content-candidates.md'),
    '# Source-copy review candidates\n\nThis AST inventory includes descriptive/instructional/illustrative text, metadata and factual-claim candidates, including potentially unreachable modules. It deliberately over-includes and is not a list of independently verified or necessarily published claims. The Phase 1 report, source-feature import graph and CONTENT_TODO.md identify reviewed gaps; this inventory is not a legal assessment.\n\n| ID | Source | Text | Suggested reviewer |\n| --- | --- | --- | --- |\n' +
      candidates
        .map((c) => `| ${c.id} | ${c.file}:${c.line} | ${escape(c.text)} | ${c.owner} |`)
        .join('\n') +
      '\n',
  )
  return {
    copyCandidates: candidates.length,
    cssFiles: cssStats.length,
    importantDeclarations: cssStats.reduce((n, c) => n + c.important, 0),
    hundredVH: cssStats.reduce((n, c) => n + c.hundredVH.length, 0),
    failures: 0,
  }
}
