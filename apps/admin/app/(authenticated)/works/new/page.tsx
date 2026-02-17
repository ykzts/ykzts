import { WorkForm } from './_components/work-form'

export default function NewWorkPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品新規作成</h1>
      <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
        <WorkForm />
      </div>
    </div>
  )
}
