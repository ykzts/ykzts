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
  typedRoutes: true,
};

export default withWorkflow(nextConfig);
