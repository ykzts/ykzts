export function generateStaticParams() {
  // Return dummy param for build-time validation with Cache Components
  return [{ id: '_' }]
}

export default function EditWorkPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">作品編集</h1>
      <div className="card">
        <p className="text-muted">実装予定</p>
      </div>
    </div>
  )
}
