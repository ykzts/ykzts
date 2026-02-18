import Link from '@/components/link'

export default function Footer() {
  return (
    <footer className="border-border border-t px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-base text-muted-foreground md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span>© Yamagishi Kazutoshi</span>
          <span className="text-sm">
            Artwork by{' '}
            <Link
              className="text-primary transition-colors duration-200 hover:text-primary/80"
              href="https://x.com/diru_k1005"
            >
              Kannazuki Diru
            </Link>
          </span>
        </div>
        <Link
          className="transition-colors duration-200 hover:text-primary"
          href="https://ykzts.com/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
