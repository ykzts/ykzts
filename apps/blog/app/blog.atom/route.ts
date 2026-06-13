import { getSiteName, getSiteOrigin } from "@ykzts/site-config";
import { getProfile } from "@ykzts/supabase/queries";
import { portableTextToHTML } from "@ykzts/utils/portable-text";
import { Feed } from "feed";
import { DEFAULT_POST_TITLE } from "@/lib/constants";
import { getPostsForFeed } from "@/lib/supabase/posts";

export async function GET() {
  const posts = await getPostsForFeed(20);

  let profileName: string | null = null;
  try {
    const profile = await getProfile();
    if (profile.name?.trim()) {
      profileName = profile.name.trim();
    }
  } catch (error) {
    console.error("Failed to load publisher profile for atom feed:", error);
  }

  const siteOrigin = getSiteOrigin();
  const baseUrl = new URL("/blog", siteOrigin).toString();

  const feedAuthor = profileName
    ? {
        name: profileName,
      }
    : undefined;

  const latestPostUpdatedAt =
    posts.length > 0
      ? posts.reduce((latest, post) => {
          const postDate = new Date(post.version_date ?? post.published_at);
          return postDate.getTime() > latest.getTime() ? postDate : latest;
        }, new Date(0))
      : undefined;

  const feedCopyright = profileName
    ? ["Copyright ©", latestPostUpdatedAt?.getFullYear(), profileName]
        .filter(Boolean)
        .join(" ")
    : undefined;

  const feed = new Feed({
    author: feedAuthor,
    copyright: feedCopyright,
    description: "Blog",
    favicon: new URL("/favicon.ico", siteOrigin).toString(),
    feedLinks: {
      atom: new URL("/blog.atom", siteOrigin).toString(),
    },
    generator: "Next.js with feed package",
    id: baseUrl,
    link: baseUrl,
    title: `Blog | ${getSiteName()}`,
    updated: latestPostUpdatedAt,
  });

  for (const post of posts) {
    const publishedDate = new Date(post.published_at);
    const year = String(publishedDate.getUTCFullYear());
    const month = String(publishedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(publishedDate.getUTCDate()).padStart(2, "0");
    const postUrl = new URL(
      `/blog/${year}/${month}/${day}/${encodeURIComponent(post.slug)}`,
      siteOrigin
    ).toString();

    feed.addItem({
      content: portableTextToHTML(post.content),
      date: post.version_date ? new Date(post.version_date) : publishedDate,
      description: post.excerpt || undefined,
      id: postUrl,
      link: postUrl,
      published: publishedDate,
      title: post.title || DEFAULT_POST_TITLE,
    });
  }

  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
