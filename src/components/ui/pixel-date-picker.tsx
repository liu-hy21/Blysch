"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, todayKey } from "@/lib/utils";

type MenuPos = { top?: number; bottom?: number; left: number; width: number };

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function parseKey(key: string) {
  const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!hit) return null;
  const y = Number(hit[1]);
  const m = Number(hit[2]);
  const d = Number(hit[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function displayKey(key: string) {
  const p = parseKey(key);
  if (!p) return null;
  return `${p.y}.${String(p.m).padStart(2, "0")}.${String(p.d).padStart(2, "0")}`;
}

function shiftMonth(y: number, m: number, delta: number) {
  const idx = y * 12 + (m - 1) + delta;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

function monthCells(y: number, m: number) {
  const first = new Date(y, m - 1, 1).getDay();
  const count = new Date(y, m, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function PixelDatePicker({
  value,
  onChange,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const parsed = parseKey(value);
  const today = todayKey();
  const initial = parsed ?? parseKey(today) ?? { y: 2026, m: 8, d: 15 };
  const [cursor, setCursor] = useState({ y: initial.y, m: initial.m });
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const shown = displayKey(value);

  useEffect(() => {
    if (!open) return;
    const next = parseKey(value) ?? parseKey(todayKey());
    if (next) setCursor({ y: next.y, m: next.m });
  }, [open, value]);

  function placeMenu() {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const gap = 8;
    const estimate = 320;
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
  }, [open]);

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
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open]);

  const cells = useMemo(() => monthCells(cursor.y, cursor.m), [cursor.y, cursor.m]);

  const menu =
    open && pos ? (
      <div
        ref={menuRef}
        id={listId}
        role="dialog"
        aria-label="选择日期"
        style={{
          position: "fixed",
          top: pos.top,
          bottom: pos.bottom,
          left: pos.left,
          width: pos.width,
          zIndex: 70,
        }}
        className="border-2 border-ink bg-card p-3 shadow-[4px_4px_0_var(--ink)]"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="上个月"
            onClick={() => setCursor((c) => shiftMonth(c.y, c.m, -1))}
            className="flex h-9 w-9 items-center justify-center border-2 border-ink bg-bg active:translate-x-px active:translate-y-px"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <p className="text-sm">
            {cursor.y}.{String(cursor.m).padStart(2, "0")}
          </p>
          <button
            type="button"
            aria-label="下个月"
            onClick={() => setCursor((c) => shiftMonth(c.y, c.m, 1))}
            className="flex h-9 w-9 items-center justify-center border-2 border-ink bg-bg active:translate-x-px active:translate-y-px"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w) => (
            <p key={w} className="text-center text-[11px] text-ink-soft">
              {w}
            </p>
          ))}
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`e-${i}`} />;
            }
            const key = toKey(cursor.y, cursor.m, day);
            const selected = key === value;
            const isToday = key === today;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-9 items-center justify-center border-2 text-sm",
                  selected
                    ? "border-ink bg-gold text-ink"
                    : isToday
                      ? "border-gold bg-card text-gold-deep"
                      : "border-transparent bg-card text-ink",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={className}>
      {label ? <p className="mb-1 text-[11px] text-ink-soft">{label}</p> : null}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="pixel-field flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left active:translate-x-px active:translate-y-px"
      >
        <span className={shown ? "text-ink" : "text-ink-soft"}>
          {shown ?? "选择日期…"}
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
