import { ViewTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse border-2 border-ink bg-card",
        className,
      )}
      aria-hidden
    />
  );
}

export function LoadingShell({
  children,
  label = "加载中",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <ViewTransition exit="slide-down">
      <div className="px-5 pb-8 pt-6" aria-busy="true" aria-label={label}>
        {children}
      </div>
    </ViewTransition>
  );
}

export function HomeRouteLoading() {
  return (
    <LoadingShell label="加载首页">
      <div className="space-y-6 pt-1">
        <header>
          <Sk className="h-3 w-28 bg-bg" />
          <Sk className="mt-3 h-9 w-40 bg-bg" />
        </header>
        <div className="grid grid-cols-2 gap-3">
          <Sk className="h-16" />
          <Sk className="h-16" />
        </div>
        <div className="flex gap-2">
          <Sk className="h-11 w-14" />
          <Sk className="h-11 w-14" />
          <Sk className="h-11 w-14" />
          <Sk className="h-11 w-14" />
        </div>
        <Sk className="h-[188px] w-full" />
        <div>
          <Sk className="mb-3 h-6 w-16" />
          <div className="grid grid-cols-3 gap-2">
            <Sk className="aspect-square" />
            <Sk className="aspect-square" />
            <Sk className="aspect-square" />
          </div>
        </div>
      </div>
    </LoadingShell>
  );
}

export function TimelineRouteLoading() {
  return (
    <LoadingShell label="加载时间轴">
      <div className="mb-4 flex items-center justify-between">
        <Sk className="h-8 w-24 bg-bg" />
        <Sk className="h-11 w-11 shrink-0" />
      </div>
      <div className="mb-4 flex gap-2">
        <Sk className="h-9 w-12 shrink-0" />
        <Sk className="h-9 w-12 shrink-0" />
        <Sk className="h-9 w-12 shrink-0" />
        <Sk className="h-9 w-12 shrink-0" />
      </div>
      <div className="space-y-4">
        <Sk className="h-36 w-full" />
        <Sk className="h-36 w-full" />
        <Sk className="h-36 w-full" />
      </div>
    </LoadingShell>
  );
}

export function PetsRouteLoading() {
  return (
    <LoadingShell label="加载守护">
      <Sk className="mb-4 h-8 w-16 bg-bg" />
      <div className="grid grid-cols-2 gap-0 border-2 border-ink p-1">
        <Sk className="h-11" />
        <Sk className="h-11" />
      </div>
      <Sk className="mt-5 h-56 w-full" />
      <Sk className="mt-4 h-24 w-full" />
      <Sk className="mt-4 h-11 w-full" />
    </LoadingShell>
  );
}

export function BattleRouteLoading() {
  return (
    <LoadingShell label="加载战斗">
      <Sk className="mb-4 h-8 w-20 bg-bg" />
      <Sk className="h-48 w-full" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Sk className="h-11" />
        <Sk className="h-11" />
      </div>
    </LoadingShell>
  );
}

export function MeRouteLoading() {
  return (
    <LoadingShell label="加载我的">
      <Sk className="mb-5 h-8 w-16 bg-bg" />
      <Sk className="h-28 w-full" />
      <ul className="mt-4 space-y-2">
        <Sk className="h-14 w-full" />
        <Sk className="h-14 w-full" />
        <Sk className="h-14 w-full" />
        <Sk className="h-14 w-full" />
        <Sk className="h-14 w-full" />
      </ul>
    </LoadingShell>
  );
}

export function MeSubRouteLoading() {
  return (
    <LoadingShell label="加载中">
      <div className="mb-5 flex items-center gap-2">
        <Sk className="h-11 w-11 shrink-0" />
        <Sk className="h-8 w-24 bg-bg" />
      </div>
      <div className="space-y-2">
        <Sk className="h-20 w-full" />
        <Sk className="h-20 w-full" />
        <Sk className="h-20 w-full" />
      </div>
    </LoadingShell>
  );
}

export function ParkRouteLoading() {
  return (
    <LoadingShell label="加载乐园">
      <div className="mb-5 flex items-center gap-2">
        <Sk className="h-11 w-11 shrink-0" />
        <Sk className="h-8 w-16 bg-bg" />
      </div>
      <Sk className="h-[min(52vh,360px)] w-full" />
    </LoadingShell>
  );
}

export function PhotosRouteLoading() {
  return (
    <LoadingShell label="加载照片">
      <div className="mb-5 flex items-center gap-2">
        <Sk className="h-11 w-11 shrink-0" />
        <Sk className="h-8 w-20 bg-bg" />
      </div>
      <Sk className="mb-4 h-4 w-32 bg-bg" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <Sk key={i} className="aspect-square" />
        ))}
      </div>
    </LoadingShell>
  );
}
