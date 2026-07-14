import { Link } from "@vercel/microfrontends/next/client";
import { getProfile } from "@ykzts/supabase/queries";
import { Suspense } from "react";
import Footer from "./footer";
import FooterContent from "./footer-content";

// Cross-zone path (portfolio microfrontend). Use the microfrontends Link so
// navigation stays on the composed origin with client-side routing.
const privacyLink = (
  <Link
    className="transition-colors duration-200 hover:text-primary"
    href="/privacy"
  >
    プライバシーポリシー
  </Link>
);

async function SiteFooterImpl() {
  const profile = await getProfile();
  const kv = profile.key_visual;

  const artworkCredit = kv?.artist_name ? (
    <span className="text-sm">
      {kv.attribution ?? "Artwork by"}{" "}
      {kv.artist_url ? (
        <a
          className="text-primary transition-colors duration-200 hover:text-primary/80"
          href={kv.artist_url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {kv.artist_name}
        </a>
      ) : (
        kv.artist_name
      )}
    </span>
  ) : undefined;

  return (
    <Footer>
      <FooterContent
        artworkCredit={artworkCredit}
        copyright={<span>© {profile.name}</span>}
        privacyLink={privacyLink}
      />
    </Footer>
  );
}

function SiteFooterSkeleton() {
  return (
    <Footer>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>
    </Footer>
  );
}

export default function SiteFooter() {
  return (
    <Suspense fallback={<SiteFooterSkeleton />}>
      <SiteFooterImpl />
    </Suspense>
  );
}
