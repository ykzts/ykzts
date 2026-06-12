import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import { getSupabaseImageConfig } from "@ykzts/supabase/next-image-config";
import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: getSupabaseImageConfig(),
  reactCompiler: true,
  reactStrictMode: true,
  redirects: async () => [
    {
      destination: "/blog.atom",
      permanent: true,
      source: "/blog/atom.xml",
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
    ],
  }),
  typedRoutes: true,
};

export default withWorkflow(withMicrofrontends(nextConfig));
