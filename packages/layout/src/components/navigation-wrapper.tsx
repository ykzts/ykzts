import { getProfileOptional, getWorksOptional } from "@ykzts/supabase/queries";
import SiteNavigation from "./site-navigation";

export default async function NavigationWrapper() {
  const [profile, works] = await Promise.all([
    getProfileOptional(),
    getWorksOptional(),
  ]);

  const hasAbout = !!profile?.about;
  const hasWorks = works.length > 0;

  return <SiteNavigation hasAbout={hasAbout} hasWorks={hasWorks} />;
}
