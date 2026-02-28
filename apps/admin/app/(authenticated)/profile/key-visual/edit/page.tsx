import { Suspense } from 'react'
import { Panel } from '@/components/panel'
import { getKeyVisual } from '@/lib/data'
import { KeyVisualForm } from './_components/key-visual-form'

async function KeyVisualFormWrapper() {
  const keyVisual = await getKeyVisual()

  return <KeyVisualForm currentKeyVisual={keyVisual} />
}

export default function EditKeyVisualPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">キービジュアル編集</h1>
      <Panel>
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="aspect-video w-full max-w-sm rounded-lg border-2 border-border bg-muted/10" />
              <div className="h-32 w-full rounded-lg border-2 border-border border-dashed bg-muted/10" />
            </div>
          }
        >
          <KeyVisualFormWrapper />
        </Suspense>
      </Panel>
    </div>
  )
}
