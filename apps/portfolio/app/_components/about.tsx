import { getProfile } from "@ykzts/supabase/queries";
import { proseContent } from "@ykzts/ui/lib/prose";
import PortableTextBlock from "./portable-text";

export default async function About() {
  const profile = await getProfile();

  if (!profile.about) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl py-20" id="about">
      <h2 className="mb-10 text-base font-semibold tracking-widest text-muted-foreground uppercase">
        About
      </h2>
      <div className={proseContent("max-w-none")}>
        <PortableTextBlock value={profile.about} />
      </div>
    </section>
  );
}
