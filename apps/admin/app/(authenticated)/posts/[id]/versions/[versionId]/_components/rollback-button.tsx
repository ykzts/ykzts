"use client";

import { Button } from "@ykzts/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ykzts/ui/components/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { rollbackAction } from "../actions";

interface RollbackButtonProps {
  postId: string;
  versionId: string;
  versionNumber: number;
}

export function RollbackButton({
  postId,
  versionId,
  versionNumber,
}: RollbackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRollback = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await rollbackAction(postId, versionId);
      setIsConfirmOpen(false);
      router.push(`/posts/${postId}/versions`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ロールバックに失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="mb-2 text-error text-sm">{error}</div>}
      <Button
        disabled={isLoading}
        onClick={() => setIsConfirmOpen(true)}
        size="sm"
        variant="outline"
      >
        {isLoading ? "ロールバック中..." : "このバージョンにロールバック"}
      </Button>

      <Dialog onOpenChange={setIsConfirmOpen} open={isConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>ロールバックの確認</DialogTitle>
            <DialogDescription>
              バージョン {versionNumber}
              にロールバックしますか？新しいバージョンとして保存され、履歴は保持されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isLoading}
              onClick={() => setIsConfirmOpen(false)}
              type="button"
              variant="outline"
            >
              キャンセル
            </Button>
            <Button disabled={isLoading} onClick={handleRollback} type="button">
              {isLoading ? "ロールバック中..." : "実行する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
