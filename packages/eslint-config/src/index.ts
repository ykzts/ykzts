import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import * as tseslint from 'typescript-eslint'

// see: https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1519138189
const eslintConfig: ReturnType<typeof tseslint.config> = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc'
          },
          groups: [
            ['builtin', 'external'],
            'internal',
            'parent',
            ['index', 'sibling'],
            'unknown',
            'type'
          ],
          'newlines-between': 'never'
        }
      ],
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true
        }
      ],
      'sort-keys': [
        'error',
        'asc',
        {
          natural: true
        }
      ],
      'sort-vars': 'error'
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true
        }
      }
    }
  },
  eslintConfigPrettier
)

export default eslintConfig
