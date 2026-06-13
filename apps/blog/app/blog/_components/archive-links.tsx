import Link from "next/link";
import { getAvailableYears } from "@/lib/supabase/posts";

export async function YearArchiveLinks() {
  const availableYears = await getAvailableYears();
  if (availableYears.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-4 text-sm">
      <span className="text-muted-foreground">年別アーカイブ: </span>
      {availableYears.map((year, index) => (
        <span key={year}>
          {index > 0 && " / "}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href={`/blog/${year}`}
          >
            {year}年
          </Link>
        </span>
      ))}
    </div>
  );
}
