import { portableTextToMarkdown } from "@ykzts/portable-text-utils";
import { connection } from "next/server";
import { getPostUrl } from "@/lib/blog-urls";
import { isPortableTextValue } from "@/lib/portable-text";
import { getPosts } from "@/lib/supabase/posts";

const textEncoder = new TextEncoder();

function isAbailablePost(
  post: Awaited<ReturnType<typeof getPosts>>[number],
  { now }: { now: number }
): boolean {
  if (!post.published_at) {
    return false;
  }

  const publishedDate = new Date(post.published_at).getTime();

  return publishedDate <= now;
}

export async function GET(request: Request) {
  await connection();

  const now = Date.now();

  const body = new ReadableStream({
    cancel(controller) {
      controller.close();
    },
    async start(controller) {
      controller.enqueue(textEncoder.encode("# Blog Posts\n\n"));

      const posts = await getPosts();

      for (const post of posts) {
        if (!isAbailablePost(post, { now })) {
          continue;
        }

        const url = `${getPostUrl(post.slug, post.published_at)}.md`;

        controller.enqueue(
          textEncoder.encode(`## [${post.title}](${url})\n\n`)
        );

        const body = isPortableTextValue(post.content)
          ? portableTextToMarkdown(post.content, { headingOffset: 1 })
          : post.excerpt;

        controller.enqueue(textEncoder.encode(`${body}\n\n`));
      }

      controller.close();
    },
  });

  request.signal.addEventListener("abort", () => {
    body.cancel();
  });

  return new Response(body, {
    headers: {
      "Cache-Control": "max-age=600, stale-while-revalidate=3600",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
