import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],

  // Keep custom configuration to the absolute minimum.
  // The project aims to ride the de-facto @commitlint/config-conventional preset as much as possible.
  // Only the scope list is unavoidable for monorepo policy.
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // Applications
        'admin',
        'blog',
        'blog-legacy',
        'memo',
        'portfolio',

        // Shared packages
        'ui',
        'layout',
        'supabase',
        'tsconfig',
        'portable-text-editor',
        'portable-text-utils',
        'pagination-utils',
        'fediverse',
        'site-config',

        // Cross-cutting
        'deps',
        'ci',
        'docs',
        'release',
      ],
    ],
  },
};

export default config;
