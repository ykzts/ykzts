import { getProfile } from "@ykzts/supabase/queries";
import Link from "@/components/link";
import { getSocialInfo } from "@/lib/social-services";

export default async function SocialLinks() {
  const profile = await getProfile();

  return (
    <ul className="flex gap-3">
      {profile.social_links.map((link) => {
        const { icon, label, url } = getSocialInfo(
          link.url,
          link.service,
          profile.name
        );

        return (
          <li key={link.id}>
            <Link
              aria-label={label}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href={url}
              rel="me"
              target="_blank"
            >
              {icon}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
