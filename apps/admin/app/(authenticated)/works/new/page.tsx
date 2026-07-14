import { Suspense } from "react";
import { Panel } from "@/components/panel";
import { getAllTechnologies } from "@/lib/data";
import { WorkForm } from "../_components/work-form";
import { WorkFormSkeleton } from "../_components/work-form-skeleton";
import { createWork } from "./actions";

async function NewWorkForm() {
  const allTechnologies = await getAllTechnologies();

  return (
    <WorkForm allTechnologies={allTechnologies} createAction={createWork} />
  );
}

export default function NewWorkPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品新規作成</h1>
      <Panel>
        <Suspense fallback={<WorkFormSkeleton />}>
          <NewWorkForm />
        </Suspense>
      </Panel>
    </div>
  );
}
