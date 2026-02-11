import { Card } from '@ykzts/ui/components/card'
import { WorkForm } from './_components/work-form'

export default function NewWorkPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品新規作成</h1>
      <Card className="p-6">
        <WorkForm />
      </Card>
    </div>
  )
}
