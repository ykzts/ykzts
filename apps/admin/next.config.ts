import { getSupabaseImageConfig } from "@ykzts/supabase/next-image-config";
import { getSupabaseHost } from "@ykzts/utils/csp";
import { getSecurityHeaders } from "@ykzts/utils/security-headers";

import type { NextConfig } from "next";

const HTTPS_PROTOCOL_RE = /^https:/;

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  headers() {
    const supabaseHost = getSupabaseHost();
    const connectAdditions: string[] = [];
    if (supabaseHost) {
      connectAdditions.push(
        supabaseHost,
        supabaseHost.replace(HTTPS_PROTOCOL_RE, "wss:")
      );
    }
    return Promise.resolve([
      {
        headers: getSecurityHeaders({
          cspDirectives: connectAdditions.length
            ? { connectSrc: connectAdditions }
            : undefined,
        }),
        source: "/:path*",
      },
    ]);
  },
  images: getSupabaseImageConfig(),
  partialPrefetching: true,
  reactCompiler: true,
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
