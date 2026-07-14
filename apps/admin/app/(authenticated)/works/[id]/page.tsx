import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Panel } from "@/components/panel";
import { getAllTechnologies, getWork } from "@/lib/data";
import { WorkForm } from "../_components/work-form";
import { WorkFormSkeleton } from "../_components/work-form-skeleton";
import { deleteWork, updateWork } from "./actions";

export function generateStaticParams() {
  // Return dummy param for build-time validation with Cache Components
  return [{ id: "_" }];
}

async function WorkEditContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [work, allTechnologies] = await Promise.all([
    getWork(id),
    getAllTechnologies(),
  ]);

  if (!work) {
    notFound();
  }

  return (
    <Panel>
      <WorkForm
        allTechnologies={allTechnologies}
        deleteAction={deleteWork}
        updateAction={updateWork}
        work={work}
      />
    </Panel>
  );
}

export default function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品編集</h1>
      <Suspense
        fallback={
          <Panel>
            <WorkFormSkeleton />
          </Panel>
        }
      >
        <WorkEditContent params={params} />
      </Suspense>
    </div>
  );
}
