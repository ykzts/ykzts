import { Card } from '@ykzts/ui/card'

export default function NotFound() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">投稿が見つかりません</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">
          指定された投稿は存在しないか、アクセス権限がありません。
        </p>
      </Card>
    </div>
  )
}
