/// <reference types="mdx" />

// TODO(ykzts): Remove this shim once TS subpath type resolution for
// @vercel/microfrontends/* and @vercel/analytics/react is stable in monorepo typecheck.

declare module "@vercel/microfrontends/next/client" {
  export const Link: import("react").ComponentType<Record<string, unknown>>;
  export const PrefetchCrossZoneLinks: import("react").ComponentType<
    Record<string, never>
  >;
  export const PrefetchCrossZoneLinksProvider: import("react").ComponentType<{
    children?: import("react").ReactNode;
  }>;
}

declare module "@vercel/microfrontends/next/config" {
  export function withMicrofrontends<T>(config: T): T;
}

declare module "@vercel/analytics/react" {
  export const Analytics: import("react").ComponentType<
    Record<string, unknown>
  >;
}

declare module "*.svg" {
  const content: import("next/image").StaticImageData;

  export default content;
}
