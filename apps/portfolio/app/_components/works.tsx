import { getWorks } from "@ykzts/supabase/queries";
import WorksList from "./works-list";

export default async function Works() {
  const works = await getWorks();

  return (
    <section className="mx-auto max-w-4xl py-20" id="works">
      <h2 className="mb-12 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Works
      </h2>
      <WorksList works={works} />
    </section>
  );
}
