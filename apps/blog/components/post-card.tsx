import { Link } from "@vercel/microfrontends/next/client";
import { Badge } from "@ykzts/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ykzts/ui/components/card";
import { getPostUrl } from "@ykzts/utils/blog-urls";
import type { PortableTextValue } from "@ykzts/utils/portable-text";
import { extractFirstParagraph } from "@ykzts/utils/portable-text";
import DateDisplay from "./date-display";
import TagList from "./tag-list";

interface Post {
  content?: PortableTextValue | null;
  excerpt: string | null;
  profile?: {
    id: string;
    name: string;
  } | null;
  published_at: string | null;
  slug: string;
  status?: string | null;
  tags: string[] | null;
  title: string;
}

interface PostCardProps {
  isDraft?: boolean;
  post: Post;
}

function getPostStatusBadge(
  status: string | null | undefined,
  publishedAt: string | null
): { label: string; variant: "secondary" | "outline" } | null {
  if (status === "draft") {
    return { label: "下書き", variant: "secondary" };
  }
  if (publishedAt && new Date(publishedAt) > new Date()) {
    return { label: "予約投稿", variant: "outline" };
  }
  return null;
}

export default function PostCard({ isDraft = false, post }: PostCardProps) {
  const url = getPostUrl(post.slug, post.published_at);
  const previewText = post.excerpt || extractFirstParagraph(post.content);
  const statusBadge = isDraft
    ? getPostStatusBadge(post.status, post.published_at)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="hover:underline" href={url}>
            {post.title}
          </Link>
          {statusBadge && (
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          {post.profile?.name && <span>著者: {post.profile.name}</span>}
          <DateDisplay date={post.published_at} />
        </CardDescription>
      </CardHeader>
      {previewText && (
        <CardContent>
          <p className="text-muted-foreground">{previewText}</p>
        </CardContent>
      )}
      {post.tags && post.tags.length > 0 && (
        <CardFooter>
          <TagList className="flex flex-wrap gap-2" tags={post.tags} />
        </CardFooter>
      )}
    </Card>
  );
}
