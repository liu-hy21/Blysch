"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ViewTransition } from "react";
import { MOODS, MOOD_MAP } from "@/lib/constants";
import { PixelPet } from "@/components/pets/pixel-pet";
import { RecentPhotos } from "@/components/app/recent-photos";
import type { SerializedPet } from "@/lib/pet-rules";

export function HomeClient({
  me,
  partner,
  togetherDays,
  startLabel,
  mineMood,
  partnerMood,
  nextDay,
  memories,
  minePet,
  partnerPet,
}: {
  me: { nickname: string; username: string };
  partner: { nickname: string; username: string };
  togetherDays: number;
  startLabel: string;
  mineMood: string | null;
  partnerMood: string | null;
  nextDay: { title: string; remain: number } | null;
  memories: { id: string; title: string; cover: string | null }[];
  minePet: SerializedPet | null;
  partnerPet: SerializedPet | null;
}) {
  const router = useRouter();

  async function setMood(mood: string) {
    await fetch("/api/mood", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 px-5 pb-8 pt-7">
      <header>
        <p className="text-[11px] text-gold-deep">★ PLAYER 1 + 2 ★</p>
        <h1 className="mt-1 text-3xl">Blysch</h1>
      </header>

      <section className="pixel-box p-4">
        <p className="text-sm text-ink-soft">在一起</p>
        <p className="mt-1 text-4xl text-gold-deep">{togetherDays} 天</p>
        <p className="mt-1 text-xs text-ink-soft">{startLabel}</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="pixel-box p-3">
          <p className="text-xs text-ink-soft">{me.nickname}</p>
          <p className="mt-1 text-sm">{MOOD_MAP[mineMood ?? ""]?.label ?? "还没写"}</p>
        </div>
        <div className="pixel-box p-3">
          <p className="text-xs text-ink-soft">{partner.nickname}</p>
          <p className="mt-1 text-sm">
            {MOOD_MAP[partnerMood ?? ""]?.label ?? "还没写"}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            aria-pressed={mineMood === m.value}
            onClick={() => setMood(m.value)}
            className={`pixel-chip min-h-11 px-3 text-xs ${
              mineMood === m.value ? "is-on" : "text-ink-soft"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <section className="flex items-end justify-around pixel-box py-4">
        <Link href="/pets" className="flex flex-col items-center gap-1">
          <ViewTransition name="pet-sprite-mine" share="morph" default="none">
            {minePet ? (
              <PixelPet
                species={minePet.species}
                mood={minePet.mood}
                scale={2}
                label={me.nickname}
              />
            ) : (
              <div className="h-16 w-16 border-2 border-dashed border-ink" />
            )}
          </ViewTransition>
          <span className="text-[11px] text-ink-soft">{me.nickname}</span>
        </Link>
        <Link href="/pets?side=partner" className="flex flex-col items-center gap-1">
          <ViewTransition name="pet-sprite-partner" share="morph" default="none">
            {partnerPet ? (
              <PixelPet
                species={partnerPet.species}
                mood={partnerPet.mood}
                scale={2}
                label={partner.nickname}
              />
            ) : (
              <div className="h-16 w-16 border-2 border-dashed border-ink" />
            )}
          </ViewTransition>
          <span className="text-[11px] text-ink-soft">{partner.nickname}</span>
        </Link>
      </section>

      {nextDay && (
        <section className="pixel-box px-4 py-3 text-sm">
          下一个日子「{nextDay.title}」还有{" "}
          <span className="text-gold-deep">{nextDay.remain}</span> 天
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2>近照</h2>
          <Link href="/timeline" className="text-xs text-gold-deep">
            时间轴
          </Link>
        </div>
        <RecentPhotos memories={memories} />
      </section>
    </div>
  );
}
