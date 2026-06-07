import { getProfileOptional, getWorksOptional } from "@ykzts/supabase/queries";
import { Suspense } from "react";
import SiteNavigation from "./site-navigation";

async function NavigationImpl() {
  const [profile, works] = await Promise.all([
    getProfileOptional(),
    getWorksOptional(),
  ]);

  const hasAbout = !!profile?.about;
  const hasWorks = works.length > 0;

  return <SiteNavigation hasAbout={hasAbout} hasWorks={hasWorks} />;
}

function NavigationSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-9 w-32 animate-pulse rounded-md bg-muted"
    />
  );
}

export default function NavigationWrapper() {
  return (
    <Suspense fallback={<NavigationSkeleton />}>
      <NavigationImpl />
    </Suspense>
  );
}
