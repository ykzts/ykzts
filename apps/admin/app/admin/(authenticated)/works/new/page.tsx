import { WorkForm } from './work-form'

export default function NewWorkPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品新規作成</h1>
      <div className="card">
        <WorkForm />
      </div>
    </div>
  )
}
