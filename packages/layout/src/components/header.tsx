import { Link } from "@vercel/microfrontends/next/client";
import { getSiteName } from "@ykzts/site-config";
import type { ReactNode } from "react";
import NavigationWrapper from "./navigation-wrapper";

interface Props {
  extra?: ReactNode;
}

export default function Header({ extra }: Props) {
  const siteName = getSiteName();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-6 backdrop-blur-sm md:px-12 lg:px-24">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between">
        <Link
          aria-label={siteName}
          className="text-lg font-semibold text-foreground"
          href="/"
        >
          {siteName}
        </Link>
        <div className="flex items-center gap-2">
          {extra}
          <NavigationWrapper />
        </div>
      </div>
    </header>
  );
}
