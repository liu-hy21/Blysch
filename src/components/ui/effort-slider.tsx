"use client";

import { useRef } from "react";
import { WISH_EFFORTS } from "@/lib/constants";

export function EffortSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const current = WISH_EFFORTS.find((e) => e.value === value) ?? WISH_EFFORTS[2];
  const fill = ((value - 1) / (WISH_EFFORTS.length - 1)) * 100;
  const golden = value === 5;

  function pickFromClientX(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onChange(1 + Math.round(t * (WISH_EFFORTS.length - 1)));
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm">重要程度</p>
        <p className="effort-ink text-sm" style={{ color: current.color }}>
          {current.label}
        </p>
      </div>
      <div className={golden ? "effort-golden relative" : "relative"}>
        {golden && <span className="effort-wave" />}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="重要程度"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={value}
          aria-valuetext={current.label}
          className="relative h-8 cursor-pointer select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pickFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            pickFromClientX(e.clientX);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(Math.max(1, value - 1));
            }
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(Math.min(5, value + 1));
            }
          }}
        >
          <div className="pointer-events-none absolute top-1/2 right-[7px] left-[7px] h-0.5 -translate-y-1/2 bg-ink" />
          <div
            className="pointer-events-none absolute top-1/2 left-[7px] h-0.5 -translate-y-1/2"
            style={{
              width: `calc((100% - 14px) * ${fill / 100})`,
              background: current.color,
            }}
          />
          <div className="relative flex h-full items-center justify-between">
            {WISH_EFFORTS.map((e) => {
              const on = e.value <= value;
              const active = e.value === value;
              return (
                <span
                  key={e.value}
                  className={`block border-2 border-ink ${active ? "h-3.5 w-3.5" : "h-2.5 w-2.5"}`}
                  style={{ background: on ? current.color : "var(--card)" }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[11px]">
        <span className="effort-ink" style={{ color: WISH_EFFORTS[0].color }}>
          普通
        </span>
        <span className="effort-ink" style={{ color: WISH_EFFORTS[4].color }}>
          金色传说
        </span>
      </div>
    </div>
  );
}
