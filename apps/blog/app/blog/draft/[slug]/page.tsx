import { isPortableTextValue } from "@ykzts/utils/portable-text";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ArticleContent from "@/components/article-content";
import DraftModeBanner from "@/components/draft-mode-banner";
import PostNavigation from "@/components/post-navigation";
import SimilarPosts from "@/components/similar-posts";
import TableOfContents from "@/components/table-of-contents";
import { DEFAULT_POST_TITLE } from "@/lib/constants";
import { extractHeadings } from "@/lib/extract-headings";
import {
  getAdjacentPosts,
  getPostBySlug,
  getSimilarPosts,
} from "@/lib/supabase/posts";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Return a placeholder to satisfy the Next.js Cache Components requirement.
// Draft slugs are not known at build time, so all actual paths are rendered
// dynamically on request.
export async function generateStaticParams() {
  return [{ slug: "_placeholder" }];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "_placeholder") {
    return { title: "Not Found" };
  }

  const draft = await draftMode();

  if (!draft.isEnabled) {
    return {
      title: "Not Found",
    };
  }

  const post = await getPostBySlug(slug, true);

  if (!post) {
    return {
      title: "Not Found",
    };
  }

  const fediverseCreator = post.profile?.fediverse_creator?.trim();

  return {
    other: fediverseCreator
      ? { "fediverse:creator": fediverseCreator }
      : undefined,
    title: post.title || DEFAULT_POST_TITLE,
  };
}

function DraftPostSkeleton() {
  return (
    <main className="px-6 py-8 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
        <div className="space-y-3 pt-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </main>
  );
}

async function DraftPostContent({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "_placeholder") {
    notFound();
  }

  const draft = await draftMode();

  // Draft posts are only accessible in draft mode
  if (!draft.isEnabled) {
    notFound();
  }

  const post = await getPostBySlug(slug, true);

  if (!post) {
    notFound();
  }

  // Validate content is valid PortableText
  if (!(post.content && isPortableTextValue(post.content))) {
    notFound();
  }

  // Profile is required for author information
  if (!post.profile?.name) {
    notFound();
  }

  // Fetch adjacent posts
  const { previousPost, nextPost } = await getAdjacentPosts(slug, true);

  // Extract headings for Table of Contents
  const headings = extractHeadings(post.content);
  const hasHeadings = headings.length > 0;

  return (
    <main className="px-6 py-8 md:px-12 lg:px-24">
      <DraftModeBanner />

      <div className="mx-auto max-w-4xl">
        {hasHeadings ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_12rem]">
            <ArticleContent
              authorName={post.profile.name}
              className="min-w-0"
              content={post.content}
              headings={headings}
              publishedAt={post.published_at}
              tags={post.tags}
              title={post.title}
              versionDate={post.version_date}
            />
            <div className="hidden lg:block">
              <TableOfContents headings={headings} variant="desktop" />
            </div>
          </div>
        ) : (
          <ArticleContent
            authorName={post.profile.name}
            content={post.content}
            headings={headings}
            publishedAt={post.published_at}
            tags={post.tags}
            title={post.title}
            versionDate={post.version_date}
          />
        )}
      </div>

      <div className="mx-auto max-w-4xl">
        <PostNavigation nextPost={nextPost} previousPost={previousPost} />
      </div>

      <div className="mx-auto max-w-4xl">
        <div aria-atomic="false" aria-live="polite">
          <SimilarPostsSection postId={post.id} />
        </div>
      </div>
    </main>
  );
}

export default function DraftPostPage({ params }: PageProps) {
  return (
    <Suspense fallback={<DraftPostSkeleton />}>
      <DraftPostContent params={params} />
    </Suspense>
  );
}

const SIMILAR_POSTS_LIMIT = 3;
const SIMILAR_POSTS_THRESHOLD = 0.5;

async function SimilarPostsSection({ postId }: { postId: string }) {
  const result = await getSimilarPosts(
    postId,
    SIMILAR_POSTS_LIMIT,
    SIMILAR_POSTS_THRESHOLD
  ).then(
    (posts) => ({ ok: true as const, posts }),
    () => ({ ok: false as const })
  );

  if (!result.ok) {
    return null;
  }

  return <SimilarPosts posts={result.posts} />;
}
