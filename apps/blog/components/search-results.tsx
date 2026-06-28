import { Link } from "@vercel/microfrontends/next/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ykzts/ui/components/card";
import { cn } from "@ykzts/ui/lib/utils";
import { getPostUrl } from "@ykzts/utils/blog-urls";
import type { PortableTextValue } from "@ykzts/utils/portable-text";
import { extractFirstParagraph } from "@ykzts/utils/portable-text";
import DateDisplay from "./date-display";
import TagList from "./tag-list";

interface SearchResult {
  content?: PortableTextValue | null;
  excerpt: string | null;
  id: string;
  published_at: string | null;
  similarity: number;
  slug: string;
  tags: string[] | null;
  title: string;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
}

function SimilarityBadge({ similarity }: { similarity: number }) {
  const percentage = Math.round(similarity * 100);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 font-medium text-xs",
        {
          "bg-green-100 text-green-800": percentage >= 85,
          "bg-blue-100 text-blue-800": percentage >= 70 && percentage < 85,
          "bg-gray-100 text-gray-800": percentage < 70,
        }
      )}
    >
      関連度: {percentage}%
    </span>
  );
}

export default function SearchResults({ query, results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-muted-foreground">
          「{query}」の検索結果が見つかりませんでした
        </p>
        <p className="mt-2 text-muted-foreground text-sm">
          別のキーワードで検索してみてください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        {results.length}件の記事が見つかりました
      </p>
      {results.map((result) => {
        const url = getPostUrl(result);
        const previewText =
          result.excerpt || extractFirstParagraph(result.content);

        return (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="flex-1">
                  <Link className="hover:underline" href={url}>
                    {result.title}
                  </Link>
                </CardTitle>
                <SimilarityBadge similarity={result.similarity} />
              </div>
              <CardDescription>
                <DateDisplay date={result.published_at} />
              </CardDescription>
            </CardHeader>
            {previewText && (
              <CardContent>
                <p className="text-muted-foreground">{previewText}</p>
              </CardContent>
            )}
            {result.tags && result.tags.length > 0 && (
              <CardFooter>
                <TagList className="flex flex-wrap gap-2" tags={result.tags} />
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
