import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@ykzts/ui/components/card'
import { Skeleton } from '@ykzts/ui/components/skeleton'
import Header from '@/components/header'

export default function ArchiveLoading() {
  return (
    <>
      <Header />
      <main className="px-6 py-8 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 font-bold text-3xl">アーカイブ</h1>
          <div className="space-y-12">
            <section>
              <Skeleton className="mb-6 h-8 w-48" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card aria-hidden="true" key={`skeleton-${i}`}>
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
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
