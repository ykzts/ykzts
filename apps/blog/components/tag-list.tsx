import { Link } from "@vercel/microfrontends/next/client";
import { Badge } from "@ykzts/ui/components/badge";
import type { Route } from "next";

interface TagListProps {
  className?: string;
  tags: string[];
}

export default function TagList({ tags, className }: TagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {tags.map((tag) => (
        <Link href={`/blog/tags/${encodeURIComponent(tag)}` as Route} key={tag}>
          <Badge variant="secondary">{tag}</Badge>
        </Link>
      ))}
    </div>
  );
}
