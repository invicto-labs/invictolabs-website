import { HtmlValidate } from 'html-validate'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { json } from '../helpers/evidence.mjs'
export async function run({ inventory }) {
  // React's valid HTML/SVG serialization and existing dynamic inline styles
  // differ from optional formatting conventions. Semantic rules stay enabled.
  const validator = new HtmlValidate({ extends: ['html-validate:recommended'], rules: {
    'doctype-style':'off', 'void-style':'off', 'attr-case':'off',
    'attribute-empty-style':'off', 'attribute-boolean-style':'off',
    'no-inline-style':'off', 'tel-non-breaking':'off',
    'long-title':'off', 'prefer-native-element':'off',
  } })
  const index = []
  for (const route of [...inventory.sitemap, '/404']) {
    const file =
      route === '/'
        ? 'dist/index.html'
        : route === '/404'
          ? 'dist/404.html'
          : path.join('dist', route.slice(1), 'index.html')
    const html = await readFile(file, 'utf8'),
      result = await validator.validateString(html, file)
    const evidence = await json(
      `html/${route === '/' ? 'home' : route.replaceAll('/', '_')}.json`,
      result,
    )
    index.push({
      route,
      file,
      valid: result.valid,
      errorCount: result.errorCount,
      warningCount: result.warningCount,
      evidence,
      rules: [...new Set(result.results.flatMap((r) => r.messages.map((m) => m.ruleId)))],
    })
  }
  await json('html-index.json', index)
  return {
    pages: index.length,
    errors: index.reduce((n, r) => n + r.errorCount, 0),
    warnings: index.reduce((n, r) => n + r.warningCount, 0),
    failures: index.filter((r) => !r.valid).length,
  }
}
