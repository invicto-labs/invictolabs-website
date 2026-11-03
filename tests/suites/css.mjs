import stylelint from 'stylelint'
import { json } from '../helpers/evidence.mjs'
export async function run() {
  const strict = await stylelint.lint({ files:['src/**/*.css'], config:{extends:['stylelint-config-standard']} })
  await json('css-strict.json',{errored:strict.errored,results:strict.results.map(({source,warnings,parseErrors,invalidOptionWarnings})=>({source,warnings,parseErrors,invalidOptionWarnings}))})
  const result = await stylelint.lint({
    files: ['src/**/*.css'],
    configFile: 'tests/stylelint.config.mjs',
    formatter: 'json',
  })
  await json('css.json', {
    errored: result.errored,
    results: result.results.map(
      ({
        source,
        deprecations,
        invalidOptionWarnings,
        parseErrors,
        warnings,
        ignored,
        errored,
      }) => ({
        source,
        deprecations,
        invalidOptionWarnings,
        parseErrors,
        warnings,
        ignored,
        errored,
      }),
    ),
  })
  return {
    files: result.results.length,
    errors: result.results.reduce(
      (n, r) => n + r.warnings.filter((w) => w.severity === 'error').length,
      0,
    ),
    warnings: result.results.reduce((n, r) => n + r.warnings.length, 0),
    failures: result.errored ? 1 : 0,
  }
}
