import { Link } from "@vercel/microfrontends/next/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ykzts/ui/components/breadcrumb";
import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPagination from "@/components/blog-pagination";
import PostCard from "@/components/post-card";
import {
  getAllTags,
  getPostCountByTag,
  getPostsByTag,
  POSTS_PER_PAGE,
} from "@/lib/supabase/posts";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();

  // Return a dummy tag if no tags exist to satisfy Next.js Cache Components requirement
  if (tags.length === 0) {
    return [{ tag: "_placeholder" }];
  }

  return tags.map((tag) => ({
    tag,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    description: `${decodedTag}タグの記事一覧`,
    title: `${decodedTag}タグの記事`,
  };
}

export default async function TagArchivePage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const posts = await getPostsByTag(decodedTag, 1);
  const postCount = await getPostCountByTag(decodedTag);

  if (!posts || posts.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(postCount / POSTS_PER_PAGE);

  return (
    <main className="px-6 py-8 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/blog" />}>
                ブログ
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{decodedTag}タグ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="font-bold text-3xl">
            {decodedTag} ({postCount}件)
          </h1>
          <a
            aria-label={`${decodedTag}タグのAtomフィードを購読`}
            className="inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
            href={`/blog/tags/${encodeURIComponent(decodedTag)}.atom`}
            rel="alternate"
            type="application/atom+xml"
          >
            <Rss className="h-4 w-4" />
            <span>Atom</span>
          </a>
        </div>
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8">
            <BlogPagination
              baseUrl={`/blog/tags/${encodeURIComponent(decodedTag)}/page`}
              currentPage={1}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </main>
  );
}
