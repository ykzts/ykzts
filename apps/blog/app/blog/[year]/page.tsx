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
import type { PortableTextValue } from "@ykzts/utils/portable-text";
import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/post-card";
import YearNavigation from "@/components/year-navigation";
import {
  getAdjacentYears,
  getAvailableYears,
  getPostCountByYear,
  getPostsByYear,
} from "@/lib/supabase/posts";

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

export default async function YearArchivePage({ params }: PageProps) {
  const { year: yearStr } = await params;

  if (yearStr === "_placeholder") {
    notFound();
  }

  if (!YEAR_REGEX.test(yearStr)) {
    notFound();
  }

  const year = Number.parseInt(yearStr, 10);

  const posts = (await getPostsByYear(year)) as Post[];
  const count = await getPostCountByYear(year);

  if (count === 0 || posts.length === 0) {
    notFound();
  }

  const { previousYear, nextYear } = await getAdjacentYears(year);

  // Group posts by month (newest month first, within year newest first)
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
    .sort((a, b) => b[0] - a[0]) // desc month
    .map(([month, monthPosts]) => ({
      month,
      posts: monthPosts,
    }));

  const availableMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);

  return (
    <main className="px-6 py-8 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/blog" />}>
                ブログ
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{year}年</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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

        {availableMonths.length > 1 && (
          <nav
            aria-label="月別ナビゲーション"
            className="mb-8 border-b pb-4 text-sm"
          >
            <span className="mr-2 text-muted-foreground">月:</span>
            {availableMonths.map((month, index) => {
              const monthCount = monthMap.get(month)?.length ?? 0;
              const anchor = `month-${String(month).padStart(2, "0")}`;
              return (
                <span key={month}>
                  {index > 0 && (
                    <span className="mx-1 text-muted-foreground">/</span>
                  )}
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
        )}

        <div className="space-y-12">
          {monthGroups.map((group) => {
            const anchor = `month-${String(group.month).padStart(2, "0")}`;
            return (
              <section
                className="group scroll-mt-16"
                id={anchor}
                key={group.month}
              >
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

        <YearNavigation nextYear={nextYear} previousYear={previousYear} />
      </div>
    </main>
  );
}
