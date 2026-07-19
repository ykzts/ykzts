import { Link } from "@vercel/microfrontends/next/client";
import { getSiteName } from "@ykzts/site-config";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ykzts/ui/components/breadcrumb";
import { Skeleton } from "@ykzts/ui/components/skeleton";
import type { PortableTextValue } from "@ykzts/utils/portable-text";
import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PostCard from "@/components/post-card";
import YearNavigation from "@/components/year-navigation";
import {
  getAdjacentYears,
  getAvailableYears,
  getPostCountByYear,
  getPostsByYear,
} from "@/lib/supabase/posts";
import { PostsSkeleton } from "../_components/posts";

const YEAR_REGEX = /^\d{4}$/;

const siteName = getSiteName();

interface PageProps {
  params: Promise<{ year: string }>;
}

interface Post {
  content: PortableTextValue | null;
  excerpt: string | null;
  id: string;
  profile: {
    id: string;
    name: string;
  } | null;
  published_at: string | null;
  slug: string;
  status: string;
  tags: string[] | null;
  title: string;
  version_date: string | null;
}

interface MonthGroup {
  month: number;
  posts: Post[];
}

export async function generateStaticParams() {
  const years = await getAvailableYears();

  // Return a dummy entry if no years exist to satisfy Next.js Cache Components requirement
  if (years.length === 0) {
    return [{ year: "_placeholder" }];
  }

  return years.map((year) => ({
    year: String(year),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  "use cache";

  const { year: yearStr } = await params;

  if (yearStr === "_placeholder") {
    return {
      description: "年別アーカイブ",
      title: "アーカイブ",
    };
  }

  if (!YEAR_REGEX.test(yearStr)) {
    return {
      title: "Not Found",
    };
  }

  const year = Number.parseInt(yearStr, 10);

  const title = `${year}年の記事`;
  const description = `${year}年に公開された記事の一覧`;

  return {
    alternates: {
      canonical: `/blog/${year}`,
    },
    description,
    openGraph: {
      description,
      title: `${title} | Blog | ${siteName}`,
      type: "website",
      url: `/blog/${year}`,
    },
    title,
  };
}

async function resolveYear(params: PageProps["params"]) {
  const { year: yearStr } = await params;

  if (yearStr === "_placeholder" || !YEAR_REGEX.test(yearStr)) {
    notFound();
  }

  return Number.parseInt(yearStr, 10);
}

async function YearBreadcrumb({ params }: PageProps) {
  const year = await resolveYear(params);

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/blog" />}>ブログ</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{year}年</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function YearBreadcrumbFallback() {
  return (
    <div aria-hidden="true" className="mb-4">
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

async function YearHeading({ params }: PageProps) {
  const year = await resolveYear(params);
  const count = await getPostCountByYear(year);

  if (count === 0) {
    notFound();
  }

  return (
    <div className="mb-8 flex items-baseline justify-between">
      <h1 className="font-bold text-3xl">
        {year}年 ({count}件)
      </h1>
      <a
        aria-label="ブログのAtomフィードを購読"
        className="inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
        href="/blog.atom"
        rel="alternate"
        type="application/atom+xml"
      >
        <Rss className="h-4 w-4" />
        <span>Atom</span>
      </a>
    </div>
  );
}

function YearHeadingFallback() {
  return (
    <div
      aria-hidden="true"
      className="mb-8 flex items-baseline justify-between"
    >
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

function groupPostsByMonth(posts: Post[]): {
  availableMonths: number[];
  monthGroups: MonthGroup[];
  monthMap: Map<number, Post[]>;
} {
  const monthMap = new Map<number, Post[]>();
  for (const post of posts) {
    if (!post.published_at) {
      continue;
    }
    const month = new Date(post.published_at).getUTCMonth() + 1;
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }
    const arr = monthMap.get(month);
    if (arr) {
      arr.push(post);
    }
  }

  const monthGroups: MonthGroup[] = Array.from(monthMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([month, monthPosts]) => ({
      month,
      posts: monthPosts,
    }));

  const availableMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);

  return { availableMonths, monthGroups, monthMap };
}

async function YearMonthNav({ params }: PageProps) {
  const year = await resolveYear(params);
  const posts = (await getPostsByYear(year)) as Post[];
  const { availableMonths, monthMap } = groupPostsByMonth(posts);

  if (availableMonths.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="月別ナビゲーション" className="mb-8 border-b pb-4 text-sm">
      <span className="mr-2 text-muted-foreground">月:</span>
      {availableMonths.map((month, index) => {
        const monthCount = monthMap.get(month)?.length ?? 0;
        const anchor = `month-${String(month).padStart(2, "0")}`;
        return (
          <span key={month}>
            {index > 0 && <span className="mx-1 text-muted-foreground">/</span>}
            <a
              className="underline-offset-4 hover:text-foreground hover:underline"
              href={`#${anchor}`}
            >
              {month}月 ({monthCount})
            </a>
          </span>
        );
      })}
    </nav>
  );
}

async function YearPosts({ params }: PageProps) {
  const year = await resolveYear(params);
  const posts = (await getPostsByYear(year)) as Post[];

  if (posts.length === 0) {
    notFound();
  }

  const { monthGroups } = groupPostsByMonth(posts);

  return (
    <div className="space-y-12">
      {monthGroups.map((group) => {
        const anchor = `month-${String(group.month).padStart(2, "0")}`;
        return (
          <section className="group scroll-mt-16" id={anchor} key={group.month}>
            <h2 className="mb-6 font-bold text-2xl group-target:-ml-2 group-target:rounded group-target:border-primary group-target:border-l-4 group-target:bg-muted/60 group-target:pr-2 group-target:pl-3 group-target:font-semibold group-target:transition-colors">
              {group.month}月 ({group.posts.length}件)
            </h2>
            <div className="space-y-6">
              {group.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

async function YearNav({ params }: PageProps) {
  const year = await resolveYear(params);
  const { previousYear, nextYear } = await getAdjacentYears(year);

  return <YearNavigation nextYear={nextYear} previousYear={previousYear} />;
}

export default function YearArchivePage({ params }: PageProps) {
  return (
    <main className="px-6 py-8 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <Suspense fallback={<YearBreadcrumbFallback />}>
          <YearBreadcrumb params={params} />
        </Suspense>
        <Suspense fallback={<YearHeadingFallback />}>
          <YearHeading params={params} />
        </Suspense>
        <Suspense fallback={null}>
          <YearMonthNav params={params} />
        </Suspense>
        <Suspense fallback={<PostsSkeleton count={6} />}>
          <YearPosts params={params} />
        </Suspense>
        <Suspense fallback={null}>
          <YearNav params={params} />
        </Suspense>
      </div>
    </main>
  );
}
