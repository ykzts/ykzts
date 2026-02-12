import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-border border-b">
      <div className="container mx-auto px-4 py-6">
        <Link className="font-bold text-2xl hover:text-primary" href="/blog">
          ykzts.com/blog
        </Link>
      </div>
    </header>
  )
}
