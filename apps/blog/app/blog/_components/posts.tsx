import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@ykzts/ui/components/card";
import { Skeleton } from "@ykzts/ui/components/skeleton";
import PostCard from "@/components/post-card";
import { getPosts } from "@/lib/supabase/posts";

export function PostsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't need unique keys
        <Card aria-hidden="true" key={`skeleton-${index}`}>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export async function Posts() {
  const posts = await getPosts(1);
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
