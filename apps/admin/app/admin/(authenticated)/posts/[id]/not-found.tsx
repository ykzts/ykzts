import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle
} from '@ykzts/ui/components/empty'

export default function NotFound() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">投稿が見つかりません</h1>
      <Empty>
        <EmptyContent>
          <EmptyTitle>投稿が見つかりません</EmptyTitle>
          <EmptyDescription>
            指定された投稿は存在しないか、アクセス権限がありません。
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  )
}
