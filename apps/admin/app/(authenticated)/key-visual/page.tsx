import { Suspense } from "react";
import { Panel } from "@/components/panel";
import { getKeyVisual } from "@/lib/data";
import { KeyVisualForm } from "./_components/key-visual-form";

async function KeyVisualFormWrapper() {
  const keyVisual = await getKeyVisual();

  return <KeyVisualForm currentKeyVisual={keyVisual} />;
}

export default function KeyVisualPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">キービジュアル</h1>
      <Panel>
        <Suspense
          fallback={
            <div
              aria-label="読み込み中..."
              aria-live="polite"
              className="space-y-4"
              role="status"
            >
              <div
                aria-hidden="true"
                className="aspect-video w-full max-w-sm animate-pulse rounded-lg border-2 border-border bg-muted"
              />
              <div
                aria-hidden="true"
                className="h-32 w-full animate-pulse rounded-lg border-2 border-border border-dashed bg-muted"
              />
            </div>
          }
        >
          <KeyVisualFormWrapper />
        </Suspense>
      </Panel>
    </div>
  );
}
