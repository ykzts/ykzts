import { getOwnerProfile } from "@ykzts/supabase/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/header";
import { NewMemoForm } from "@/components/new-memo-form";

function NewMemoSkeleton() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 font-bold text-2xl">新規メモ作成</h1>
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-40 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded bg-muted" />
        </div>
      </main>
    </>
  );
}

async function NewMemoContent() {
  const ownerProfile = await getOwnerProfile();

  if (!ownerProfile) {
    redirect("/login");
  }

  return (
    <>
      <Header canEdit={true} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 font-bold text-2xl">新規メモ作成</h1>
        <NewMemoForm />
      </main>
    </>
  );
}

export default function NewMemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<NewMemoSkeleton />}>
        <NewMemoContent />
      </Suspense>
    </div>
  );
}
