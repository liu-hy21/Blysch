import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function shanghaiHour(date = new Date()): number {
  return shanghaiTimeOfDay(date).hour;
}

/** 上海时区当前时刻（用于每日 23:59 自动照料） */
export function shanghaiTimeOfDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return {
    hour: Number(parts.find((p) => p.type === "hour")?.value),
    minute: Number(parts.find((p) => p.type === "minute")?.value),
    second: Number(parts.find((p) => p.type === "second")?.value ?? 0),
  };
}

/** 当天是否已到自动照料时刻（上海 23:59:00 起） */
export function isAutoCareDueForDay(now = new Date()): boolean {
  const { hour, minute } = shanghaiTimeOfDay(now);
  return hour > 23 || (hour === 23 && minute >= 59);
}

export function addDaysKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function daysBetweenKeys(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86400000);
}

export function daysTogether(startDate: Date): number {
  const start = todayKey(startDate);
  const today = todayKey();
  const a = Date.parse(`${start}T00:00:00+08:00`);
  const b = Date.parse(`${today}T00:00:00+08:00`);
  return Math.max(1, Math.floor((b - a) / 86400000) + 1);
}

export function isTogetherRevealed(startDate: Date, revealKey: string): boolean {
  return todayKey(startDate) === revealKey;
}
