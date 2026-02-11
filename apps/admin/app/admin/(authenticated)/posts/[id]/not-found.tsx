export default function NotFound() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">投稿が見つかりません</h1>
      <div className="card">
        <p className="text-muted">
          指定された投稿は存在しないか、アクセス権限がありません。
        </p>
      </div>
    </div>
  )
}
