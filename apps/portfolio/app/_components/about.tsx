import { getProfile } from "@ykzts/supabase/queries";
import PortableTextBlock from "./portable-text";

export default async function About() {
  const profile = await getProfile();

  if (!profile.about) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl py-20" id="about">
      <h2 className="mb-10 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        About
      </h2>
      <div className="prose prose-theme max-w-none prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
        <PortableTextBlock value={profile.about} />
      </div>
    </section>
  );
}
