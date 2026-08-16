"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ViewTransition } from "react";
import { ImageLightbox } from "@/components/app/image-lightbox";

const MAX = 10;
const VISIBLE = 3;

type Photo = { id: string; title: string; cover: string | null };

function PhotoFrame({
  cover,
}: {
  cover: string | null;
}) {
  return (
    <div className="relative aspect-square bg-bg">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          draggable={false}
          className="pixelated h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-1 text-center text-[11px] text-ink-soft">
          无封面
        </div>
      )}
    </div>
  );
}

export function RecentPhotos({ memories }: { memories: Photo[] }) {
  const photos = memories.slice(0, MAX);
  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, dx: 0, moved: false });
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const last = Math.max(0, photos.length - VISIBLE);
  const canSlide = last > 0;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (index > last) setIndex(last);
  }, [index, last]);

  function go(next: number) {
    setIndex(Math.max(0, Math.min(last, next)));
    setDx(0);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!canSlide) return;
    drag.current = { down: true, startX: e.clientX, dx: 0, moved: false };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.down) return;
    const next = e.clientX - drag.current.startX;
    drag.current.dx = next;
    if (Math.abs(next) > 8) drag.current.moved = true;
    setDx(next);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.down) return;
    const card = (viewportRef.current?.clientWidth ?? 1) / VISIBLE;
    const delta = drag.current.dx;
    drag.current.down = false;
    setDragging(false);
    if (delta < -card * 0.28) go(index + 1);
    else if (delta > card * 0.28) go(index - 1);
    else setDx(0);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  if (photos.length === 0) {
    return <p className="text-sm text-ink-soft">还没有回忆。</p>;
  }

  const covers = photos.map((p) => p.cover).filter((u): u is string => Boolean(u));
  const slots = Math.max(photos.length, VISIBLE);

  function openCover(id: string) {
    if (drag.current.moved) return;
    const photo = photos.find((p) => p.id === id);
    if (!photo?.cover) return;
    const i = covers.indexOf(photo.cover);
    if (i >= 0) setPreview(i);
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="近照"
      className="pixel-box overflow-hidden"
      onKeyDown={(e) => {
        if (preview !== null) return;
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      tabIndex={0}
    >
      <div
        ref={viewportRef}
        className={`relative overflow-hidden select-none ${canSlide ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ touchAction: canSlide ? "pan-x" : "auto" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="flex"
          style={{
            width: `${(slots / VISIBLE) * 100}%`,
            transform: `translateX(calc(${(-index / slots) * 100}% + ${dx}px))`,
            transition:
              dragging || reduceMotion
                ? "none"
                : "transform 220ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {Array.from({ length: slots }, (_, i) => {
            const m = photos[i];
            return (
              <div
                key={m?.id ?? `empty-${i}`}
                className="min-w-0 shrink-0 border-r-2 border-ink last:border-r-0"
                style={{ width: `${100 / slots}%` }}
              >
                {m ? (
                  <div>
                    <button
                      type="button"
                      className="block w-full"
                      draggable={false}
                      aria-label={`查看${m.title}原图`}
                      onClick={() => openCover(m.id)}
                    >
                      {i >= index && i < index + VISIBLE ? (
                        <ViewTransition name={`memory-${m.id}`} share="morph" default="none">
                          <PhotoFrame cover={m.cover} />
                        </ViewTransition>
                      ) : (
                        <PhotoFrame cover={m.cover} />
                      )}
                    </button>
                    <Link
                      href={`/timeline#${m.id}`}
                      className="block truncate border-t-2 border-ink px-1.5 py-1.5 text-[11px]"
                    >
                      {m.title}
                    </Link>
                  </div>
                ) : (
                  <div className="aspect-square bg-bg" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {canSlide && (
        <div className="flex items-center justify-between border-t-2 border-ink bg-card px-2 py-2">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-gold text-sm disabled:opacity-35"
            aria-label="上一组"
            disabled={index === 0}
            onClick={() => go(index - 1)}
          >
            ◀
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: last + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`h-2.5 w-2.5 border-2 border-ink ${i === index ? "bg-gold" : "bg-bg"}`}
                aria-label={`第 ${i + 1} 组`}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-gold text-sm disabled:opacity-35"
            aria-label="下一组"
            disabled={index === last}
            onClick={() => go(index + 1)}
          >
            ▶
          </button>
        </div>
      )}
      {preview !== null && covers[preview] && (
        <ImageLightbox
          urls={covers}
          index={preview}
          onClose={() => setPreview(null)}
          onIndex={setPreview}
        />
      )}
    </div>
  );
}
