import createMDX from "@next/mdx";
import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import { getSupabaseImageConfig } from "@ykzts/supabase/next-image-config";
import {
  buildCsp,
  getSupabaseStorageSrc,
  NONE,
  SELF,
  UNSAFE_EVAL,
  UNSAFE_INLINE,
} from "@ykzts/utils/csp";
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
    const isDevelopment = process.env.NODE_ENV === "development";

    const csp = buildCsp({
      baseUri: [NONE],
      connectSrc: [
        SELF,
        "https://vitals.vercel-insights.com",
        "https://challenges.cloudflare.com",
        isDevelopment && "ws:",
        isDevelopment && "wss:",
      ],
      defaultSrc: [NONE],
      fontSrc: [SELF],
      formAction: [NONE],
      frameAncestors: [NONE],
      frameSrc: ["https://challenges.cloudflare.com"],
      imgSrc: getSupabaseStorageSrc(),
      scriptSrc: [
        SELF,
        UNSAFE_INLINE,
        isDevelopment && UNSAFE_EVAL,
        "https://challenges.cloudflare.com",
      ],
      styleSrc: [SELF, UNSAFE_INLINE],
    });

    return Promise.resolve([
      {
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=()",
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
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
