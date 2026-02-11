import { Card } from '@ykzts/ui/card'

export default function NotFound() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品が見つかりません</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">
          指定された作品は存在しないか、アクセス権限がありません。
        </p>
      </Card>
    </div>
  )
}
