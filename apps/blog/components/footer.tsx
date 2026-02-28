import Footer from '@ykzts/layout/components/footer'
import Link from '@/components/link'

export default function BlogFooter() {
  return (
    <Footer>
      <div className="flex items-center justify-end">
        <Link
          className="transition-colors duration-200 hover:text-primary"
          href="/privacy"
        >
          プライバシーポリシー
        </Link>
      </div>
    </Footer>
  )
}
