import Link from '@/components/link'

export default function DraftModeBanner() {
  return (
    <div className="bg-yellow-500 px-4 py-2 text-center font-medium text-black text-sm">
      ドラフトモード有効中 - 下書きと予約投稿が表示されます
      <Link
        className="ml-4 underline hover:no-underline"
        href="/api/draft/disable"
      >
        無効化
      </Link>
    </div>
  )
}
