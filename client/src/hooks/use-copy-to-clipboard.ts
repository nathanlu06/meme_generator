"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface CopyToClipboardProps {
  timeout?: number;
}

export function useCopyToClipboard({
  timeout = 2000,
}: CopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyImageToClipboard = async (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard?.write) {
      return;
    }

    if (!value) {
      return;
    }

    try {
      const res = await fetch(value);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setIsCopied(true);
      toast.success("Image copied to clipboard");

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy image to clipboard");
    }
  };

  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    if (!value) {
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    });
  };

  return { isCopied, copyToClipboard, copyImageToClipboard };
}
