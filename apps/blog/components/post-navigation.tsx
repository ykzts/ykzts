import { getPostUrl } from "@ykzts/utils/blog-urls";
import LinkButton from "./link-button";

interface PostNavigationItem {
  published_at: string | null;
  slug: string;
  title: string;
}

interface PostNavigationProps {
  nextPost: PostNavigationItem | null;
  previousPost: PostNavigationItem | null;
}

export default function PostNavigation({
  previousPost,
  nextPost,
}: PostNavigationProps) {
  // Don't render if there are no adjacent posts
  if (!(previousPost || nextPost)) {
    return null;
  }

  const prevUrl = previousPost ? getPostUrl(previousPost) : null;
  const nextUrl = nextPost ? getPostUrl(nextPost) : null;

  return (
    <nav
      aria-label="記事ナビゲーション"
      className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:justify-between"
    >
      {prevUrl && previousPost ? (
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted-foreground">前の記事</span>
          <LinkButton
            className="h-auto justify-start p-4 text-left whitespace-normal"
            href={prevUrl}
            variant="outline"
          >
            {previousPost.title}
          </LinkButton>
        </div>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}

      {nextUrl && nextPost ? (
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted-foreground sm:text-right">
            次の記事
          </span>
          <LinkButton
            className="h-auto justify-start p-4 text-left whitespace-normal sm:text-right"
            href={nextUrl}
            variant="outline"
          >
            {nextPost.title}
          </LinkButton>
        </div>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}
    </nav>
  );
}
