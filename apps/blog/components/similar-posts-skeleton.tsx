import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@ykzts/ui/components/card'
import { Skeleton } from '@ykzts/ui/components/skeleton'

type SimilarPostsSkeletonProps = {
  count?: number
}

export default function SimilarPostsSkeleton({
  count = 3
}: SimilarPostsSkeletonProps) {
  return (
    <div className="mt-16">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't need unique keys
          <Card aria-hidden="true" key={`skeleton-${index}`}>
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
