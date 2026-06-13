import { getSiteName } from "@ykzts/site-config";
import { getProfile } from "@ykzts/supabase/queries";
import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { YearArchiveLinks } from "./_components/archive-links";
import { Pagination } from "./_components/pagination";
import { Posts, PostsSkeleton } from "./_components/posts";

const siteName = getSiteName();

function buildDescription(profileName: string): string {
  return `${profileName}の個人ブログ。さまざまなトピックについて発信しています。`;
}

export async function generateMetadata(): Promise<Metadata> {
  let description = buildDescription("このサイト");

  try {
    const profile = await getProfile();
    description = buildDescription(profile.name);
  } catch (error) {
    console.error("Failed to load profile for blog metadata:", error);
  }

  return {
    alternates: {
      canonical: "/blog",
      types: {
        "application/atom+xml": "/blog.atom",
        "text/markdown": "/blog.md",
      },
    },
    description,
    openGraph: {
      description,
      title: `Blog | ${siteName}`,
      type: "website",
      url: "/blog",
    },
    title: {
      absolute: `Blog | ${siteName}`,
    },
  };
}

export default function HomePage() {
  return (
    <main className="px-6 py-8 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="font-bold text-3xl">ブログ</h1>
          <a
            aria-label="ブログのAtomフィードを購読"
            className="inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/blog.atom"
            rel="alternate"
            type="application/atom+xml"
          >
            <Rss className="h-4 w-4" />
            <span>Atom</span>
          </a>
        </div>
        <Suspense fallback={<PostsSkeleton count={5} />}>
          <Posts />
        </Suspense>

        <Suspense
          fallback={
            <div className="mt-8 border-t pt-4">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
          }
        >
          <YearArchiveLinks />
        </Suspense>

        <Suspense fallback={null}>
          <Pagination />
        </Suspense>
      </div>
    </main>
  );
}
