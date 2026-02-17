import Link from 'next/link'
import SearchForm from './search-form'

export default function Header() {
  return (
    <header className="border-border border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link className="font-bold text-2xl hover:text-primary" href="/blog">
            Blog
          </Link>
          <SearchForm className="w-full md:max-w-md" />
        </div>
      </div>
    </header>
  )
}
