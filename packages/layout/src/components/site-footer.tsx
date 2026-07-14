import { Link } from "@vercel/microfrontends/next/client";
import { getProfile } from "@ykzts/supabase/queries";
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

export default async function SiteFooter() {
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
