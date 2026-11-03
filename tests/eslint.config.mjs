import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
export default [
  { ignores: ['node_modules/**', 'dist/**', '.ssr/**', 'qa/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], languageOptions: { globals: globals.browser } },
]
