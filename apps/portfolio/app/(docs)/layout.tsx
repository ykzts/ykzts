import { Link } from "@vercel/microfrontends/next/client";
import { proseContent } from "@ykzts/ui/lib/prose";
import { ArrowLeft } from "lucide-react";

export default function DocsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh px-6 py-16 md:px-12 lg:px-24">
      <main className={proseContent("mx-auto max-w-3xl")}>
        {children}

        <p className="mt-16">
          <Link
            className="inline-flex items-center gap-2 text-primary transition-colors duration-200 hover:text-primary/80"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            トップページに戻る
          </Link>
        </p>
      </main>
    </div>
  );
}
