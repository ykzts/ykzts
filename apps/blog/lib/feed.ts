import type { PortableTextBlock } from "@portabletext/types";
import { getSiteOrigin } from "@ykzts/site-config";
import { getProfile } from "@ykzts/supabase/queries";
import { portableTextToHTML } from "@ykzts/utils/portable-text";
import { Feed } from "feed";
import { DEFAULT_POST_TITLE } from "@/lib/constants";

export interface FeedItemInput {
  content: PortableTextBlock[] | null | undefined;
  excerpt?: string | null;
  published_at: string;
  slug: string;
  title?: string | null;
  version_date?: string | null;
}

export async function createAtomFeed(
  items: FeedItemInput[],
  feedOptions: {
    title: string;
    description?: string;
    link: string;
    atomLink: string;
  }
): Promise<string> {
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

  const feedAuthor = profileName
    ? {
        name: profileName,
      }
    : undefined;

  const latestPostUpdatedAt =
    items.length > 0
      ? items.reduce((latest, post) => {
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
    description: feedOptions.description ?? "Blog",
    favicon: new URL("/favicon.ico", siteOrigin).toString(),
    feedLinks: {
      atom: feedOptions.atomLink,
    },
    generator: "Next.js with feed package",
    id: feedOptions.link,
    link: feedOptions.link,
    title: feedOptions.title,
    updated: latestPostUpdatedAt,
  });

  for (const post of items) {
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

  return feed.atom1();
}
