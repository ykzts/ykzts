/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: ['eslint:recommended', 'next/core-web-vitals', 'prettier'],
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    {
      env: {
        commonjs: true
      },
      files: ['*.cjs'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  root: true
}
