"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ykzts/ui/components/dialog";
import { proseContent } from "@ykzts/ui/lib/prose";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PrivacyContent from "@/docs/privacy.mdx";

export default function PrivacyModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      router.back();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>プライバシーポリシー</DialogTitle>
        </DialogHeader>
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-8">
          <div className={proseContent("max-w-none")}>
            <PrivacyContent />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
