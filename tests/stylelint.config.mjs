// Match the existing BEM names, compact rules, legacy fallbacks and CSS cascade.
// Syntax, unknown properties/units and conflicting declarations remain checked.
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'selector-class-pattern': '^[a-z][a-z0-9_-]*$',
    'no-duplicate-selectors': [true, {severity:'warning'}],
    'no-descending-specificity': null,
    'at-rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'declaration-block-single-line-max-declarations': null,
    'media-feature-range-notation': null,
    'alpha-value-notation': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'font-family-name-quotes': null,
    'property-no-vendor-prefix': null,
  },
}
