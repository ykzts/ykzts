import docusaurusPlugin from '@docusaurus/eslint-plugin'
import * as tseslint from 'typescript-eslint'
import reactConfig from './react.js'
import type { Linter } from 'eslint'

// see: https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1519138189
const eslintConfig: ReturnType<typeof tseslint.config> = tseslint.config(
  ...reactConfig,
  {
    plugins: {
      '@docusaurus': docusaurusPlugin
    },
    rules: {
      ...(docusaurusPlugin.configs.recommended.rules as Linter.RulesRecord)
    }
  }
)

export default eslintConfig
