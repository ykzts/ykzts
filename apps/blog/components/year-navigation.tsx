import LinkButton from "./link-button";

interface YearNavigationProps {
  nextYear: number | null;
  previousYear: number | null;
}

export default function YearNavigation({
  previousYear,
  nextYear,
}: YearNavigationProps) {
  // Don't render if there are no adjacent years
  if (!(previousYear || nextYear)) {
    return null;
  }

  const prevUrl = previousYear ? `/blog/${previousYear}` : null;
  const nextUrl = nextYear ? `/blog/${nextYear}` : null;

  return (
    <nav
      aria-label="年別アーカイブナビゲーション"
      className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:justify-between"
    >
      {prevUrl && previousYear ? (
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted-foreground">前の年</span>
          <LinkButton
            className="h-auto justify-start p-4 text-left whitespace-normal"
            href={prevUrl}
            variant="outline"
          >
            {previousYear}年
          </LinkButton>
        </div>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}

      {nextUrl && nextYear ? (
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-muted-foreground sm:text-right">
            次の年
          </span>
          <LinkButton
            className="h-auto justify-start p-4 text-left whitespace-normal sm:text-right"
            href={nextUrl}
            variant="outline"
          >
            {nextYear}年
          </LinkButton>
        </div>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}
    </nav>
  );
}
