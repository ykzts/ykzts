import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],

  // Keep custom configuration to the absolute minimum.
  // We ride the de-facto @commitlint/config-conventional preset as much as possible.
  // The only necessary overrides are:
  // - scope-enum (required for monorepo policy)
  // - body-max-line-length / footer-max-line-length (preset's 100 char limit is too strict
  //   once you start using trailers like Assisted-by or writing detailed bodies)
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        // Applications
        "admin",
        "blog",
        "blog-legacy",
        "memo",
        "portfolio",

        // Shared packages
        "ui",
        "layout",
        "supabase",
        "tsconfig",
        "editor",
        "utils",
        "site-config",

        // Cross-cutting
        "deps",
        "ci",
        "docs",
        "release",
      ],
    ],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};

export default config;
