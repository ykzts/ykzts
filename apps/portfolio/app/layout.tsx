import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import {
  PrefetchCrossZoneLinks,
  PrefetchCrossZoneLinksProvider,
} from "@vercel/microfrontends/next/client";
import { getSiteName, getSiteOrigin } from "@ykzts/site-config";
import { getProfile } from "@ykzts/supabase/queries";
import { Toaster } from "@ykzts/ui/components/sonner";
import type { Metadata, Viewport } from "next";
import SVGSymbols from "./_components/svg-symbols";
import ThemeProvider from "./_components/theme-provider";

const siteName = getSiteName();

export async function generateMetadata(): Promise<Metadata> {
  let fediverseCreator: string | null = null;

  try {
    const profile = await getProfile();
    fediverseCreator = profile.fediverse_creator?.trim() || null;
  } catch {
    console.error("Failed to load profile for portfolio layout metadata");
  }

  return {
    metadataBase: getSiteOrigin(),
    other: {
      ...(fediverseCreator ? { "fediverse:creator": fediverseCreator } : {}),
      "Hatena::Bookmark": "nocomment",
    },
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { color: "#fafafa", media: "(prefers-color-scheme: light)" },
    { color: "#0f0f1a", media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      className="scroll-smooth antialiased"
      lang="ja"
      suppressHydrationWarning
    >
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <PrefetchCrossZoneLinksProvider>
            <a
              className="absolute -top-20 left-2 z-1000 rounded bg-primary px-4 py-2 text-primary-foreground no-underline transition-[top] duration-300 focus-visible:top-2"
              href="#content"
            >
              メインコンテンツにスキップ
            </a>

            <SVGSymbols />

            {children}
            {modal}

            <Toaster />
            <Analytics />
            <PrefetchCrossZoneLinks />
          </PrefetchCrossZoneLinksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
