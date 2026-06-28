import { getSiteOrigin } from "@ykzts/site-config";
import { getPostUrl } from "@ykzts/utils/blog-urls";
import type { MetadataRoute } from "next";
import {
  getAllPosts,
  getAllTags,
  getAvailableYears,
} from "@/lib/supabase/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const tags = await getAllTags();

  const baseUrl = new URL("/blog", getSiteOrigin()).toString();

  // Homepage entry
  const homepageEntry: MetadataRoute.Sitemap[number] = {
    changeFrequency: "daily",
    lastModified: new Date(),
    priority: 1.0,
    url: baseUrl,
  };

  // Post detail pages
  const postEntries: MetadataRoute.Sitemap = posts.flatMap((post) => {
    const url = getPostUrl(post, { full: true, origin: getSiteOrigin() });
    if (!url) {
      return [];
    }

    return [
      {
        changeFrequency: "monthly" as const,
        lastModified: new Date(post.version_date || post.published_at),
        priority: 0.8,
        url,
      },
    ];
  });

  // Tag archive pages
  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    changeFrequency: "monthly",
    lastModified: new Date(),
    priority: 0.6,
    url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
  }));

  // Year archive pages
  const yearEntries: MetadataRoute.Sitemap = (await getAvailableYears()).map(
    (year) => ({
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 0.7,
      url: `${baseUrl}/${year}`,
    })
  );

  return [homepageEntry, ...postEntries, ...tagEntries, ...yearEntries];
}
