import { portableTextToMarkdown } from "@ykzts/portable-text-utils";
import type { NextRequest } from "next/server";
import { isPortableTextValue } from "@/lib/portable-text";
import { getPostBySlug } from "@/lib/supabase/posts";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/blog/markdown/[year]/[month]/[day]/[slug]">
) {
  const { day, month, slug, year } = await context.params;
  const post = await getPostBySlug(slug);

  if (!post?.published_at) {
    return new Response("# Not Found\n", {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
      status: 404,
    });
  }

  const publishedDate = new Date(post.published_at);
  const publishedAt = publishedDate.getTime();

  if (publishedAt > Date.now()) {
    return new Response("# Not Found\n", {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
      status: 404,
    });
  }

  const publishedYear = String(publishedDate.getUTCFullYear());
  const publishedMonth = String(publishedDate.getUTCMonth() + 1).padStart(
    2,
    "0"
  );
  const publishedDay = String(publishedDate.getUTCDate()).padStart(2, "0");

  if (
    year !== publishedYear ||
    month !== publishedMonth ||
    day !== publishedDay ||
    !isPortableTextValue(post.content)
  ) {
    return new Response("# Not Found\n", {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
      status: 404,
    });
  }

  const body = portableTextToMarkdown(post.content, { headingOffset: 0 });

  return new Response([`# ${post.title}`, `${body}\n`].join("\n\n"), {
    headers: {
      "Cache-Control": "max-age=600, stale-while-revalidate=3600",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
