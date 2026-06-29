import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import { getSupabaseImageConfig } from "@ykzts/supabase/next-image-config";
import { getSecurityHeaders } from "@ykzts/utils/security-headers";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  headers() {
    return Promise.resolve([
      {
        headers: getSecurityHeaders(),
        source: "/:path*",
      },
    ]);
  },
  images: getSupabaseImageConfig(),
  partialPrefetching: true,
  reactCompiler: true,
  reactStrictMode: true,
  redirects: async () => [
    {
      destination: "/blog.atom",
      permanent: true,
      source: "/blog/atom.xml",
    },
    {
      destination: "/blog/tags/:tag.atom",
      permanent: true,
      source: "/blog/tags/:tag/atom",
    },
    {
      destination: "/blog/tags/:tag.atom",
      permanent: true,
      source: "/blog/tags/:tag/atom.xml",
    },
  ],
  rewrites: async () => ({
    beforeFiles: [
      {
        destination: "/api/blog/markdown",
        source: "/blog.md",
      },
      {
        destination: "/api/blog/markdown/:year/:month/:day/:slug",
        source: "/blog/:year/:month/:day/:slug.md",
      },
      {
        destination: "/api/blog/tags/:tag/atom",
        source: "/blog/tags/:tag.atom",
      },
    ],
  }),
  typedRoutes: true,
};

export default withMicrofrontends(nextConfig);
