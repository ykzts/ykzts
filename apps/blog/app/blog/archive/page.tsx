import type { Metadata } from "next";
import {
  getLatestPostDate,
  getPostCountByYear,
  getPostsByYear,
} from "@/lib/supabase/posts";
import ArchiveList from "./archive-list";

export const metadata: Metadata = {
  description: "年別アーカイブ - すべての記事を年ごとに表示",
  title: "アーカイブ",
};

export default async function ArchivePage() {
  // Get the latest post's publication date
  const latestPostDate = await getLatestPostDate();

  if (!latestPostDate) {
    // No posts exist
    return (
      <main className="px-6 py-8 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 font-bold text-3xl">アーカイブ</h1>
          <p className="text-muted-foreground">記事がありません</p>
        </div>
      </main>
    );
  }

  // Extract the year from the latest post
  const latestYear = new Date(latestPostDate).getUTCFullYear();

  // Fetch posts for the latest year
  const posts = await getPostsByYear(latestYear);
  const count = await getPostCountByYear(latestYear);

  return (
    <main className="px-6 py-8 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl">アーカイブ</h1>
        <ArchiveList initialYearData={{ count, posts, year: latestYear }} />
      </div>
    </main>
  );
}
