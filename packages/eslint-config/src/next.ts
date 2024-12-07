import nextPlugin from '@next/eslint-plugin-next'
import * as tseslint from 'typescript-eslint'
import reactConfig from './react.js'

// see: https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1519138189
const eslintConfig: ReturnType<typeof tseslint.config> = tseslint.config(
  ...reactConfig,
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  }
)

export default eslintConfig
