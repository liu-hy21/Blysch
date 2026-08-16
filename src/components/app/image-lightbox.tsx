"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export function ImageLightbox({
  urls,
  index,
  onClose,
  onIndex,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
  onIndex: (next: number) => void;
}) {
  const url = urls[index];
  const last = urls.length - 1;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onIndex(Math.min(last, index + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, last, onClose, onIndex]);

  if (!url) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="原图"
      className="fixed inset-0 z-80 flex flex-col bg-[rgba(28,25,23,0.92)]"
    >
      <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          className="flex h-11 min-w-11 items-center justify-center border-2 border-ink bg-gold px-3 text-sm"
          onClick={onClose}
        >
          关闭
        </button>
        {urls.length > 1 && (
          <p className="text-sm text-card">
            {index + 1}/{urls.length}
          </p>
        )}
        <span className="w-11" />
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {urls.length > 1 && (
          <button
            type="button"
            className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink bg-gold text-sm disabled:opacity-35"
            aria-label="上一张"
            disabled={index === 0}
            onClick={() => onIndex(index - 1)}
          >
            ◀
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="max-h-full max-w-full object-contain"
          style={{ imageRendering: "auto" }}
        />
        {urls.length > 1 && (
          <button
            type="button"
            className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink bg-gold text-sm disabled:opacity-35"
            aria-label="下一张"
            disabled={index === last}
            onClick={() => onIndex(index + 1)}
          >
            ▶
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
