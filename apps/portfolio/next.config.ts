import createMDX from "@next/mdx";
import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import { getSupabaseImageConfig } from "@ykzts/supabase/next-image-config";
import { getSecurityHeaders } from "@ykzts/utils/security-headers";
import { withBotId } from "botid/next/config";

import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    mdxRs: {
      mdxType: "gfm",
    },
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
  images: {
    ...getSupabaseImageConfig(),
    formats: ["image/avif", "image/webp"],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  pageExtensions: ["tsx", "ts", "mdx"],
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true,
};

export default withBotId(withMicrofrontends(withMDX(nextConfig)));
