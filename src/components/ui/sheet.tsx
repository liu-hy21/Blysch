"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 mx-auto max-w-[480px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="absolute inset-0 bg-[rgba(28,25,23,0.45)]"
            aria-label="关闭"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            exit={{ y: 24 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-x-2 bottom-2 max-h-[86%] overflow-y-auto overscroll-contain border-2 border-ink bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[6px_6px_0_var(--ink)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="sheet-title" className="text-lg">
                ◆ {title}
              </h2>
              <button className="min-h-11 border-2 border-ink bg-bg px-2 text-sm" onClick={onClose}>
                关闭
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
