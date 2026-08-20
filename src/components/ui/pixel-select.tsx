"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };
type MenuPos = { top?: number; bottom?: number; left: number; width: number };

export function PixelSelect({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  function placeMenu() {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const gap = 8;
    const estimate = Math.min(208, Math.max(options.length, 1) * 44);
    const spaceBelow = window.innerHeight - r.bottom - gap;
    const openUp = spaceBelow < estimate && r.top > spaceBelow;
    setPos(
      openUp
        ? { bottom: window.innerHeight - r.top + gap, left: r.left, width: r.width }
        : { top: r.bottom + gap, left: r.left, width: r.width },
    );
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    placeMenu();
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    }
    function onReposition() {
      placeMenu();
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, options.length]);

  const menu =
    open && pos ? (
      <ul
        ref={menuRef}
        id={listId}
        role="listbox"
        style={{
          position: "fixed",
          top: pos.top,
          bottom: pos.bottom,
          left: pos.left,
          width: pos.width,
          zIndex: 70,
        }}
        className="max-h-52 overflow-y-auto border-2 border-ink bg-card shadow-[4px_4px_0_var(--ink)]"
      >
        {options.map((o) => {
          const on = o.value === value;
          return (
            <li key={o.value || "__empty"} role="option" aria-selected={on}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2 px-3 text-left",
                  on ? "bg-gold text-ink" : "bg-card text-ink hover:bg-bg",
                )}
              >
                <span className="w-4 shrink-0 text-[11px]" aria-hidden>
                  {on ? "◆" : ""}
                </span>
                {o.label}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className={className}>
      {label ? <p className="mb-1 text-[11px] text-ink-soft">{label}</p> : null}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="pixel-field flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left active:translate-x-px active:translate-y-px"
      >
        <span className={selected ? "text-ink" : "text-ink-soft"}>
          {selected?.label ?? "选择…"}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0", open ? "rotate-180" : "")}
          aria-hidden
        />
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
