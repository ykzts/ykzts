"use client";

import { getBlogPostUrl } from "@ykzts/supabase/blog-urls";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@ykzts/ui/components/field";
import { Input } from "@ykzts/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@ykzts/ui/components/input-group";
import { Check, Copy, ExternalLink, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function getURLDescription(
  url: string | null,
  draftPreviewUrl?: string | null
) {
  if (!url && draftPreviewUrl) {
    return "ドラフトプレビュー用のURL (公開前の確認に使用)";
  }

  return url && draftPreviewUrl
    ? "予約公開のURL (目のアイコンでドラフトプレビューを確認できます)"
    : "この投稿の公開URL";
}

interface PublicUrlFieldProps {
  draftPreviewUrl?: string | null;
  publishedAt: string | null;
  slug: string | null;
  status: "draft" | "scheduled" | "published";
}

export function PublicUrlField({
  slug,
  publishedAt,
  status,
  draftPreviewUrl,
}: PublicUrlFieldProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  if (!slug) {
    return (
      <Field>
        <FieldLabel>公開URL</FieldLabel>
        <Input disabled type="text" value="スラッグが設定されていません" />
        <FieldDescription>
          スラッグを設定すると、URLが表示されます
        </FieldDescription>
      </Field>
    );
  }

  const url = getBlogPostUrl(slug, publishedAt);
  const displayUrl = url ?? draftPreviewUrl ?? null;

  if (!displayUrl) {
    return (
      <Field>
        <FieldLabel>公開URL</FieldLabel>
        <Input disabled type="text" value="公開日時が設定されていません" />
        <FieldDescription>
          {status === "draft"
            ? "下書き状態のため、公開URLはありません"
            : "公開日時を設定すると、URLが表示されます"}
        </FieldDescription>
      </Field>
    );
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      toast.success("URLをコピーしました");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("URLのコピーに失敗しました");
    }
  };

  const handleOpenDraftPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(draftPreviewUrl ?? "", "_blank", "noopener,noreferrer");
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(displayUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Field>
      <FieldLabel>公開URL</FieldLabel>
      <InputGroup>
        <InputGroupInput
          onClick={(e) => e.currentTarget.select()}
          readOnly
          type="text"
          value={displayUrl}
        />
        <InputGroupAddon align="inline-end">
          {url && draftPreviewUrl && (
            <InputGroupButton
              aria-label="ドラフトプレビューを開く"
              onClick={handleOpenDraftPreview}
              title="ドラフトプレビューを開く"
              type="button"
              variant="ghost"
            >
              <Eye />
            </InputGroupButton>
          )}
          <InputGroupButton
            aria-label="新しいタブで開く"
            onClick={handleOpenInNewTab}
            title="新しいタブで開く"
            type="button"
            variant="ghost"
          >
            <ExternalLink />
          </InputGroupButton>
          <InputGroupButton
            aria-label="URLをコピー"
            onClick={handleCopy}
            title="URLをコピー"
            type="button"
            variant="ghost"
          >
            {copied ? <Check /> : <Copy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>
        {getURLDescription(url, draftPreviewUrl)}
      </FieldDescription>
    </Field>
  );
}
