"use server";

import type { Json } from "@ykzts/supabase/types";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deletePost, updatePost } from "@/lib/posts";
import { invalidateCaches } from "@/lib/revalidate";
import { postUpdateSchema } from "@/lib/validations";

export type ActionState = {
  error?: string;
} | null;

function parsePublishedAt(publishedAtRaw: FormDataEntryValue | null): {
  error?: string;
  value?: string;
} {
  if (!publishedAtRaw || publishedAtRaw === "") {
    return {};
  }

  try {
    return { value: new Date(publishedAtRaw.toString()).toISOString() };
  } catch {
    return { error: "無効な公開日時形式です" };
  }
}

function parseOptionalJson<T>(
  raw: string | undefined,
  errorMessage: string
): { error?: string; value?: T } {
  if (!raw) {
    return {};
  }

  try {
    return { value: JSON.parse(raw) as T };
  } catch {
    return { error: errorMessage };
  }
}

export async function updatePostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const publishedAtResult = parsePublishedAt(formData.get("published_at"));
  if (publishedAtResult.error) {
    return { error: publishedAtResult.error };
  }

  const excerptValue = formData.get("excerpt");
  const validation = postUpdateSchema.safeParse({
    change_summary: formData.get("change_summary") || undefined,
    content: formData.get("content"),
    // Pass empty string for empty excerpt (to trigger auto-generation)
    // Pass undefined only if excerpt field is not present (to preserve existing)
    excerpt: excerptValue === null ? undefined : excerptValue || "",
    id: formData.get("id"),
    published_at: publishedAtResult.value,
    slug: formData.get("slug"),
    status: formData.get("status") || undefined,
    tags: formData.get("tags") || undefined,
    title: formData.get("title"),
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError?.message ?? "バリデーションエラー" };
  }

  const validatedData = validation.data;

  try {
    const contentResult = parseOptionalJson<Json>(
      validatedData.content,
      "コンテンツのJSON形式が不正です"
    );
    if (contentResult.error) {
      return { error: contentResult.error };
    }

    const tagsResult = parseOptionalJson<string[]>(
      validatedData.tags,
      "タグのJSON形式が不正です"
    );
    if (tagsResult.error) {
      return { error: tagsResult.error };
    }

    await updatePost({
      changeSummary: validatedData.change_summary || "投稿を更新",
      content: contentResult.value,
      excerpt: validatedData.excerpt,
      postId: validatedData.id,
      publishedAt: validatedData.published_at,
      slug: validatedData.slug,
      status: validatedData.status,
      tags: tagsResult.value,
      title: validatedData.title,
    });

    revalidateTag("posts", "max");
    await invalidateCaches("posts");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }

  redirect("/posts");
}

export async function deletePostAction(id: string): Promise<void> {
  // Validate ID as UUID before querying the database
  const idValidation = z
    .string()
    .uuid({ message: "無効なIDです" })
    .safeParse(id);

  if (!idValidation.success) {
    const firstError = idValidation.error.issues[0];
    throw new Error(firstError?.message ?? "無効なIDです");
  }

  try {
    await deletePost(idValidation.data);

    revalidateTag("posts", "max");
    revalidateTag("counts", "max");
    await invalidateCaches("posts");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("不明なエラー");
  }

  redirect("/posts");
}
