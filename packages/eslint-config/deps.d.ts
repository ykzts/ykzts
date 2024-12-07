declare module '@next/eslint-plugin-next' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: Omit<ESLint.Plugin, 'configs'> & {
    configs: {
      'core-web-vitals': Linter.LegacyConfig
      recommended: Linter.LegacyConfig
    }
  }

  export default plugin
}

declare module 'eslint-plugin-import' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: Omit<ESLint.Plugin, 'configs'> & {
    configs: {
      electron: Linter.LegacyConfig
      errors: Linter.LegacyConfig
      'stage-0': Linter.LegacyConfig
      react: Linter.LegacyConfig
      'react-native': Linter.LegacyConfig
      recommended: Linter.LegacyConfig
      typescript: Linter.LegacyConfig
      warnings: Linter.LegacyConfig
    }
    flatConfigs: {
      electron: Linter.Config
      errors: Linter.Config
      react: Linter.Config
      'react-native': Linter.Config
      recommended: Linter.Config
      typescript: Linter.Config
      warnings: Linter.Config
    }
  }

  export default plugin
}

declare module 'eslint-plugin-react-hooks' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: Omit<ESLint.Plugin, 'configs'> & {
    configs: {
      recommended: Linter.LegacyConfig
    }
  }

  export default plugin
}
