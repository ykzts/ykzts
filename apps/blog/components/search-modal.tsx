"use client";

import { Link } from "@vercel/microfrontends/next/client";
import { getPostUrl } from "@ykzts/supabase/blog-urls";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@ykzts/ui/components/dialog";
import { Input } from "@ykzts/ui/components/input";
import { cn } from "@ykzts/ui/lib/utils";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import DateDisplay from "./date-display";

interface SearchResultItem {
  excerpt: string | null;
  id: string;
  published_at: string;
  similarity: number;
  slug: string;
  tags: string[] | null;
  title: string;
}

function SimilarityBadge({ similarity }: { similarity: number }) {
  const percentage = Math.round(similarity * 100);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 font-medium text-[10px]",
        {
          "bg-green-100 text-green-800": percentage >= 85,
          "bg-blue-100 text-blue-800": percentage >= 70 && percentage < 85,
          "bg-gray-100 text-gray-800": percentage < 70,
        }
      )}
    >
      {percentage}%
    </span>
  );
}

interface SearchPanelProps {
  onClose: () => void;
}

function SearchPanel({ onClose }: SearchPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-focus the search input when the modal/panel opens
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Debounced search (longer debounce + min length to avoid high-frequency
  // expensive embedding generation calls on every keystroke)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/blog/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: trimmed, limit: 6 }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Search request failed");
        }

        const data: { results?: SearchResultItem[] } = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("検索に失敗しました。もう一度お試しください。");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleResultClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleViewAll = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed) {
      onClose();
      router.push(`/blog/search?q=${encodeURIComponent(trimmed)}`);
    }
  }, [query, router, onClose]);

  const trimmedQuery = query.trim();
  const hasEffectiveQuery = trimmedQuery.length >= 2;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="検索キーワード"
          className="pl-9 text-base"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="記事を検索..."
          ref={inputRef}
          type="search"
          value={query}
        />
      </div>

      <section
        aria-label="検索結果"
        className="-mr-1 max-h-[50vh] overflow-y-auto pr-1"
      >
        {!hasEffectiveQuery && (
          <p className="py-8 text-center text-muted-foreground text-sm">
            2文字以上のキーワードを入力すると関連記事が表示されます
          </p>
        )}

        {hasEffectiveQuery && loading && (
          <div className="py-6 text-center text-muted-foreground text-sm">
            検索中...
          </div>
        )}

        {hasEffectiveQuery && !loading && error && (
          <div className="py-6 text-center text-destructive text-sm">
            {error}
          </div>
        )}

        {hasEffectiveQuery && !loading && !error && results.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              「{trimmedQuery}」の検索結果が見つかりませんでした
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              別のキーワードをお試しください
            </p>
          </div>
        )}

        {hasEffectiveQuery && !loading && !error && results.length > 0 && (
          <>
            <p className="mb-1 text-muted-foreground text-xs">
              {results.length}件の結果
            </p>
            <ul className="space-y-0.5">
              {results.map((result) => {
                const url = getPostUrl(result);
                return (
                  <li key={result.id}>
                    <Link
                      className="group flex flex-col gap-0.5 rounded-md px-2 py-1.5 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      href={url}
                      onClick={handleResultClick}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 font-medium text-sm group-hover:underline">
                          {result.title}
                        </span>
                        <SimilarityBadge similarity={result.similarity} />
                      </div>
                      <div className="text-muted-foreground text-xs">
                        <DateDisplay date={result.published_at} />
                      </div>
                      {result.excerpt && (
                        <p className="line-clamp-2 text-muted-foreground text-xs">
                          {result.excerpt}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 flex justify-end">
              <button
                className="text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
                onClick={handleViewAll}
                type="button"
              >
                すべての検索結果を見る →
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

interface SearchModalProps {
  className?: string;
}

export default function SearchModal({ className }: SearchModalProps) {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut: press "/" to open (when not typing in a field)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest('[role="dialog"]'))
      ) {
        return;
      }

      event.preventDefault();
      setOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      {/* Desktop: text-field-like button */}
      <button
        className={cn(
          "hidden h-8 w-48 items-center gap-2 rounded-lg border border-input bg-background/60 px-3 text-left text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:flex lg:w-64",
          className
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">記事を検索...</span>
        <kbd className="ml-auto hidden select-none rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground lg:inline">
          /
        </kbd>
      </button>

      {/* Mobile: icon button */}
      <button
        aria-label="検索"
        className={cn(
          "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden",
          className
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search className="size-4" />
      </button>

      <DialogContent
        className="sm:max-w-md md:max-w-lg"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">ブログ記事を検索</DialogTitle>
        <SearchPanel onClose={close} />
      </DialogContent>
    </Dialog>
  );
}
