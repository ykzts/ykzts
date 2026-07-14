import { getWorks } from "@ykzts/supabase/queries";
import { Skeleton } from "@ykzts/ui/components/skeleton";
import { Suspense } from "react";
import WorksList from "./works-list";

function WorksListFallback() {
  return (
    <div className="space-y-8">
      {["a", "b"].map((key) => (
        <article
          className="rounded-xl border border-border bg-card p-8"
          key={key}
        >
          <Skeleton className="mb-4 h-6 w-1/3" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </article>
      ))}
    </div>
  );
}

/**
 * Works data is "use cache" and belongs in the static shell.
 * WorksList reads useSearchParams, so only that client island needs Suspense.
 */
export default async function Works() {
  const works = await getWorks();

  return (
    <section className="mx-auto max-w-4xl py-20" id="works">
      <h2 className="mb-12 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Works
      </h2>
      <Suspense fallback={<WorksListFallback />}>
        <WorksList works={works} />
      </Suspense>
    </section>
  );
}
