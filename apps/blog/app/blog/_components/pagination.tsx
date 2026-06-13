import BlogPagination from "@/components/blog-pagination";
import { getTotalPages } from "@/lib/supabase/posts";

export async function Pagination() {
  const totalPages = await getTotalPages();
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8">
      <BlogPagination currentPage={1} totalPages={totalPages} />
    </div>
  );
}
