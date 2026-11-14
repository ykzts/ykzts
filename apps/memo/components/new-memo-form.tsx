"use client";

import { RichTextEditor } from "@ykzts/editor";
import { uploadImage } from "@ykzts/supabase/image-upload";
import { useActionState } from "react";
import { createMemo } from "@/app/new/actions";
import Link from "@/components/link";

export function NewMemoForm() {
  const [state, formAction, isPending] = useActionState(createMemo, null);

  return (
    <form action={formAction}>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium" htmlFor="memo-path">
          パス
        </label>
        <input
          className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          id="memo-path"
          name="path"
          placeholder="my-memo または category/my-memo"
          required
          type="text"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          URLのパス部分です。英数字、ハイフン、アンダースコア、スラッシュが使用できます。
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium" htmlFor="memo-title">
          タイトル
        </label>
        <input
          className="w-full rounded border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          id="memo-title"
          name="title"
          required
          type="text"
        />
      </div>

      <div className="mb-4">
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="memo-content"
        >
          コンテンツ
        </label>
        <RichTextEditor
          id="memo-content"
          name="content"
          placeholder="メモの内容を入力してください..."
          uploadImage={uploadImage}
        />
      </div>

      <div className="mb-4">
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="memo-visibility"
        >
          公開設定
        </label>
        <select
          className="rounded border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          defaultValue="private"
          id="memo-visibility"
          name="visibility"
        >
          <option value="public">公開</option>
          <option value="private">非公開</option>
        </select>
      </div>

      {state?.error ? (
        <p className="mb-4 rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Link
          className="rounded border border-border px-4 py-2 text-sm hover:bg-muted/20"
          href="/"
        >
          キャンセル
        </Link>
        <button
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "作成中..." : "作成"}
        </button>
      </div>
    </form>
  );
}
