import { getSiteName, getSiteOrigin } from "@ykzts/site-config";
import { createAtomFeed } from "@/lib/feed";
import { getPostsForFeed } from "@/lib/supabase/posts";

export async function GET() {
  const posts = await getPostsForFeed(20);

  const siteOrigin = getSiteOrigin();
  const baseUrl = new URL("/blog", siteOrigin).toString();

  const atom = await createAtomFeed(posts, {
    atomLink: new URL("/blog.atom", siteOrigin).toString(),
    link: baseUrl,
    title: `Blog | ${getSiteName()}`,
  });

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
