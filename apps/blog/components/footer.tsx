import Link from '@/components/link'

export default function Footer() {
  return (
    <footer className="border-border border-t px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-4xl items-center justify-end text-base text-muted-foreground">
        <Link
          className="transition-colors duration-200 hover:text-primary"
          href="/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
