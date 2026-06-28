import { getSiteOrigin } from "@ykzts/site-config";
import { getPostUrl } from "@ykzts/supabase/blog-urls";
import {
  getAllPublishedPosts,
  getProfile,
  getWorks,
} from "@ykzts/supabase/queries";
import { extractFirstParagraph } from "@ykzts/utils/portable-text";
import {
  buildWorkUrl,
  getLlmsHeaderLines,
  type ProfileForHeader,
} from "@/lib/llms";

export async function GET() {
  const [works, posts, profile] = await Promise.all([
    getWorks(),
    getAllPublishedPosts(),
    getProfile().catch((err: unknown) => {
      console.warn("Failed to fetch profile for llms.txt:", err);
      return null;
    }),
  ]);

  const profileForHeader: ProfileForHeader | null = profile
    ? {
        name: profile.name,
        occupation: profile.occupation,
        profile_technologies: profile.profile_technologies,
        social_links: profile.social_links,
        tagline: profile.tagline,
      }
    : null;

  const lines: string[] = [
    ...getLlmsHeaderLines(profileForHeader),
    "",
    "## Works",
    "",
  ];

  for (const work of works) {
    const url = buildWorkUrl(work.slug);
    const description = extractFirstParagraph(work.content);
    const suffix = description ? `: ${description}` : "";
    lines.push(`- [${work.title}](${url})${suffix}`);
  }

  lines.push("", "## Articles", "");

  for (const post of posts) {
    const url = getPostUrl(post, {
      full: true,
      markdown: true,
      origin: getSiteOrigin(),
    });
    const suffix = post.excerpt ? `: ${post.excerpt}` : "";
    lines.push(`- [${post.title}](${url})${suffix}`);
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
