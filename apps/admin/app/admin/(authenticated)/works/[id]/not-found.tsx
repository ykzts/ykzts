import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle
} from '@ykzts/ui/components/empty'

export default function NotFound() {
  return (
    <Empty>
      <EmptyContent>
        <EmptyTitle>作品が見つかりません</EmptyTitle>
        <EmptyDescription>
          指定された作品は存在しないか、アクセス権限がありません。
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
