import { getSiteName, getSiteOrigin } from "@ykzts/site-config";
import type { NextRequest } from "next/server";
import { createAtomFeed } from "@/lib/feed";
import { getPostsByTagForFeed } from "@/lib/supabase/posts";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);

  const posts = await getPostsByTagForFeed(tag);

  if (posts.length === 0) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const siteOrigin = getSiteOrigin();
  const encodedTag = encodeURIComponent(tag);
  const tagUrl = new URL(`/blog/tags/${encodedTag}`, siteOrigin).toString();
  const atomUrl = new URL(
    `/blog/tags/${encodedTag}.atom`,
    siteOrigin
  ).toString();

  const atom = await createAtomFeed(posts, {
    atomLink: atomUrl,
    description: `${tag}タグの記事`,
    link: tagUrl,
    title: `${tag} | Blog | ${getSiteName()}`,
  });

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
