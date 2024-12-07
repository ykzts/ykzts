import importPlugin from 'eslint-plugin-import'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import * as tseslint from 'typescript-eslint'
import baseConfig from './index.js'
import type { Linter } from 'eslint'

// see: https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1519138189
const eslintConfig: ReturnType<typeof tseslint.config> = tseslint.config(
  ...baseConfig,
  importPlugin.flatConfigs.react,
  jsxA11yPlugin.flatConfigs.strict,
  reactPlugin.configs.flat?.recommended as Linter.Config,
  reactPlugin.configs.flat?.['jsx-runtime'] as Linter.Config,
  {
    plugins: {
      'react-hooks': reactHooksPlugin
    },
    rules: {
      'jsx-a11y/alt-text': [
        'warn',
        {
          elements: ['img'],
          img: ['Image']
        }
      ],
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
)

export default eslintConfig
