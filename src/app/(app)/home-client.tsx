"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOODS, MOOD_MAP, SHOW_TOGETHER_UI } from "@/lib/constants";
import { HomePets } from "@/components/pets/home-pets";
import { SpaceBanner } from "@/components/pets/space-banner";
import { RecentPhotos } from "@/components/app/recent-photos";
import type { SerializedPet } from "@/lib/pet-rules";

/** 时段场景横幅；与太空横幅不同时展示，恢复时改为 true */
const SHOW_HOME_PETS_BANNER = false;

export function HomeClient({
  coupleId,
  me,
  partner,
  togetherDays,
  startLabel,
  mineMood,
  partnerMood,
  nextDay,
  memories,
  doneWishes,
  minePet,
  partnerPet,
}: {
  coupleId: string;
  me: { nickname: string; username: string };
  partner: { nickname: string; username: string };
  togetherDays: number | null;
  startLabel: string | null;
  mineMood: string | null;
  partnerMood: string | null;
  nextDay: { title: string; remain: number } | null;
  memories: { id: string; title: string; cover: string | null }[];
  doneWishes: { id: string; title: string }[];
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

      {SHOW_TOGETHER_UI ? (
        <section className="pixel-box p-4">
          <p className="text-sm text-ink-soft">在一起</p>
          <p className="mt-1 text-4xl text-gold-deep">
            {togetherDays ?? "?"} 天
          </p>
          {startLabel ? (
            <p className="mt-1 text-xs text-ink-soft">{startLabel}</p>
          ) : null}
        </section>
      ) : null}

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

      <div className="flex items-start justify-between gap-3">
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
        <p className="shrink-0 pt-1 text-right">
          <span className="block text-2xl leading-none tabular-nums">{doneWishes.length}</span>
          <span className="mt-1 block text-[11px] text-ink-soft">已完成</span>
        </p>
      </div>

      {SHOW_HOME_PETS_BANNER ? (
        <HomePets
          coupleId={coupleId}
          me={me}
          partner={partner}
          minePet={minePet}
          partnerPet={partnerPet}
        />
      ) : null}

      <SpaceBanner />

      {nextDay && (
        <section className="pixel-box px-4 py-3 text-sm">
          下一个日子「{nextDay.title}」还有{" "}
          <span className="text-gold-deep">{nextDay.remain}</span> 天
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2>近照</h2>
          <Link href="/timeline" prefetch={false} className="text-xs text-gold-deep">
            时间轴
          </Link>
        </div>
        <RecentPhotos memories={memories} />
      </section>

      {doneWishes.length > 0 ? (
        <section>
          <h2 className="mb-3">已完成的心愿</h2>
          <ul className="space-y-2">
            {doneWishes.map((wish) => (
              <li key={wish.id} className="pixel-box px-3 py-2 text-sm">
                {wish.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
