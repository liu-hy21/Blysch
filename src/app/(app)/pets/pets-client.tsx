"use client";

import { startTransition, useState, ViewTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PixelPet, GuardianPet } from "@/components/pets/pixel-pet";
import { FurniturePiece } from "@/components/pets/furniture-piece";
import { GearIcon } from "@/components/pets/gear-icon";
import { SkillIcon } from "@/components/pets/skill-icon";
import { IntimacyRow } from "@/components/pets/intimacy-badges";
import { Button } from "@/components/ui/button";
import {
  SPECIES,
  SPECIES_LABEL,
  BOND_SKILL,
  TYPE_COLOR,
  type SerializedPet,
} from "@/lib/pet-rules";
import type { PetSpecies } from "@/generated/prisma/client";

function Bar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-ink-soft">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2.5 border-2 border-ink bg-bg">
        <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function PetsClient({
  mine,
  partner,
  partnerNickname,
  initialTab,
}: {
  mine: SerializedPet | null;
  partner: SerializedPet | null;
  partnerNickname: string;
  initialTab: "mine" | "partner";
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"mine" | "partner">(initialTab);
  const [species, setSpecies] = useState<PetSpecies>("rabbit");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function hatch() {
    setError("");
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ species, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "认养失败");
      return;
    }
    router.refresh();
  }

  async function care() {
    setBusy(true);
    setNote("");
    const res = await fetch("/api/pets/care", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "照料失败");
      return;
    }
    const rewards = Array.isArray(data.rewards) ? data.rewards.join("、") : "";
    if (data.levelsGained && rewards) setNote(`升了 ${data.levelsGained} 级，获得 ${rewards}！`);
    else if (data.levelsGained) setNote(`升了 ${data.levelsGained} 级！`);
    router.refresh();
  }

  async function feed(foodId: string) {
    setBusy(true);
    setError("");
    setNote("");
    const res = await fetch("/api/pets/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodId }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "喂食失败");
      return;
    }
    const bits = [`吃了${data.food}`];
    if (data.levelsGained) bits.push(`升了 ${data.levelsGained} 级`);
    if (Array.isArray(data.rewards) && data.rewards.length > 0) {
      bits.push(`获得 ${data.rewards.join("、")}`);
    }
    if (shown && shown.moodLevel <= 1) bits.push("可是还在等你照料");
    setNote(bits.join("，") + "！");
    router.refresh();
  }

  const shown = tab === "mine" ? mine : partner;
  const mineView = tab === "mine";

  function switchTab(next: "mine" | "partner") {
    setTab(next);
    setError("");
    setNote("");
    startTransition(() => {
      router.replace(next === "partner" ? "/pets?side=partner" : "/pets");
    });
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <h1 className="text-2xl">守护</h1>
      <div className="mt-4 grid grid-cols-2 border-2 border-ink bg-card p-1 text-sm">
        <button
          type="button"
          aria-pressed={tab === "mine"}
          className={`min-h-11 ${tab === "mine" ? "bg-gold text-ink" : "text-ink-soft"}`}
          onClick={() => switchTab("mine")}
        >
          我的
        </button>
        <button
          type="button"
          aria-pressed={tab === "partner"}
          className={`min-h-11 ${tab === "partner" ? "bg-gold text-ink" : "text-ink-soft"}`}
          onClick={() => switchTab("partner")}
        >
          对方的
        </button>
      </div>

      {tab === "mine" && !mine && (
        <div className="mt-8">
          <p className="text-sm text-ink-soft">认一只像素宠物。选定物种后不能再改。</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {SPECIES.map((s) => (
              <button
                key={s}
                onClick={() => setSpecies(s)}
                className={`flex flex-col items-center gap-1 border-2 p-2 ${
                  species === s ? "border-ink bg-gold" : "border-ink bg-card"
                }`}
              >
                <PixelPet species={s} mood="calm" scale={2} />
                <span className="text-xs">{SPECIES_LABEL[s]}</span>
              </button>
            ))}
          </div>
          <input
            className="pixel-field mt-4 min-h-11 w-full px-3"
            placeholder="给它起名（2～8 字）…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && (
            <p className="mt-2 text-sm text-rose" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          <Button className="mt-4 w-full" onClick={hatch} disabled={name.length < 2}>
            认养
          </Button>
        </div>
      )}

      {tab === "partner" && !partner && (
        <p className="mt-10 text-center text-sm text-ink-soft">
          还在等 {partnerNickname} 认一只宠物。
        </p>
      )}

      {shown && (
        <div className="mt-5 space-y-4">
          <section className="pixel-box">
            <div className="flex items-stretch">
              <div className="flex w-[42%] items-center justify-center bg-bg py-4">
                <ViewTransition
                  name={tab === "mine" ? "pet-sprite-mine" : "pet-sprite-partner"}
                  share="morph"
                  default="none"
                >
                  <GuardianPet
                    species={shown.species}
                    moodLevel={shown.moodLevel}
                    name={shown.name}
                  />
                </ViewTransition>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 border-l-2 border-ink p-3">
                <p className="text-[11px] text-ink-soft">Lv.{shown.level}</p>
                <h2 className="truncate text-xl">{shown.name}</h2>
                <p className="text-xs text-ink-soft">
                  {shown.speciesLabel}
                  <span
                    className="ml-2 inline-block border-2 border-ink px-1 text-[10px]"
                    style={{ background: TYPE_COLOR[shown.speciesType] ?? "#c4c4c0" }}
                  >
                    {shown.speciesType}
                  </span>
                </p>
                <Bar label="经验" value={shown.exp} max={shown.expToNext} />
                <IntimacyRow intimacy={shown.intimacy} species={shown.species} />
              </div>
            </div>
            <p className="border-t-2 border-ink px-3 py-2 text-[11px] text-ink-soft">
              连续照料 {shown.careStreak} 天
              {shown.caredToday ? " · 今天已照料" : " · 今天还没照料"}
              {mineView ? ` · 还可喂 ${shown.feedsLeft} 次` : ""}
            </p>
          </section>

          <section className="pixel-box p-3">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h3 className="text-sm">{shown.rpg.classTitle}</h3>
              <span className="text-[11px] text-ink-soft">{shown.rpg.classBlurb}</span>
            </div>
            <dl className="grid grid-cols-4 gap-1 text-center">
              {(
                [
                  ["生命", shown.rpg.combat.hp],
                  ["攻击", shown.rpg.combat.atk],
                  ["防御", shown.rpg.combat.def],
                  ["速度", shown.rpg.combat.spd],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="border-2 border-ink bg-bg px-1 py-1">
                  <dt className="text-[10px] text-ink-soft">{label}</dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {shown.rpg.slots.map((slot) => (
                <li key={slot.kind} className="flex items-center gap-2 border-2 border-ink px-2 py-1">
                  <span className={slot.name ? "" : "opacity-30"}>
                    <GearIcon
                      species={shown.species}
                      kind={slot.kind}
                      label={slot.name ?? slot.kindLabel}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-ink-soft">{slot.kindLabel}</p>
                    <p className="truncate text-sm">{slot.name ?? "—"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="pixel-box p-3">
            <h3 className="mb-2 text-sm">技能</h3>
            <ul className="grid grid-cols-2 gap-2">
              {shown.skills.map((s) => (
                <li
                  key={s.id}
                  className={`flex min-w-0 items-center justify-between gap-1 border-2 border-ink px-2 py-1.5 ${s.locked ? "opacity-40" : "bg-bg"}`}
                >
                  <span className="flex min-w-0 items-center gap-1">
                    <SkillIcon species={shown.species} skillId={s.id} label={s.locked ? "未解锁技能" : s.name} size={22} />
                    <span className="min-w-0 truncate text-sm">{s.locked ? "？？？" : s.name}</span>
                  </span>
                  <span
                    className="shrink-0 border-2 border-ink px-1 text-[11px]"
                    style={{ background: TYPE_COLOR[s.type] ?? "#c4c4c0" }}
                  >
                    {s.locked ? `Lv.${s.unlockLevel}` : s.type}
                  </span>
                </li>
              ))}
              {shown.species === "rabbit" || shown.species === "cow" ? (
                <li className="col-span-2 flex min-w-0 items-center justify-between gap-1 border-2 border-ink bg-bg px-2 py-1.5">
                  <span className="flex min-w-0 items-center gap-1">
                    <SkillIcon species={shown.species} skillId={BOND_SKILL.id} label={BOND_SKILL.name} size={22} />
                    <span className="min-w-0 truncate text-sm">{BOND_SKILL.name}</span>
                  </span>
                  <span
                    className="shrink-0 border-2 border-ink px-1 text-[11px]"
                    style={{ background: TYPE_COLOR[BOND_SKILL.type] ?? "#c4c4c0" }}
                  >
                    {BOND_SKILL.type}
                  </span>
                </li>
              ) : null}
            </ul>
          </section>

          {mineView ? (
            <section className="pixel-box p-3">
              <h3 className="mb-2 text-sm">背包</h3>
              <div className="grid grid-cols-2 gap-2">
                {shown.backpack.map((f) => {
                  const gold = "gold" in f && f.gold;
                  const disabled =
                    busy ||
                    shown.feedsLeft <= 0 ||
                    (gold && !shown.goldFoodReady);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => feed(f.id)}
                      className="border-2 border-ink bg-card px-2 py-2 text-left disabled:opacity-40"
                    >
                      <p className="text-sm">{f.name}</p>
                      <p className="text-[11px] text-ink-soft">经验 +{f.exp}</p>
                      <p className="text-[11px] text-ink-soft">{f.desc}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Button className="flex-1" disabled={busy || shown.caredToday} onClick={care}>
                  照料
                </Button>
                <Link
                  href="/pets/battle"
                  className="inline-flex min-h-11 flex-1 items-center justify-center border-2 border-ink bg-gold px-4 text-sm text-ink shadow-[3px_3px_0_var(--ink)]"
                >
                  作战
                </Link>
              </div>
              {note && (
                <p className="mt-2 text-sm text-gold-deep" role="status">
                  {note}
                </p>
              )}
              {error && (
                <p className="mt-2 text-sm text-rose" role="alert">
                  {error}
                </p>
              )}
            </section>
          ) : (
            <p className="text-center text-xs text-ink-soft">只能看，不能喂对方的宠物。</p>
          )}

          <section className="pixel-box p-3">
            <h3 className="mb-2 text-sm">家具</h3>
            {shown.furniture.length === 0 ? (
              <p className="text-sm text-ink-soft">这个物种还没有家具图鉴。</p>
            ) : shown.furniture.some((f) => !f.locked) ? (
              <ul className="grid grid-cols-3 gap-2">
                {shown.furniture
                  .filter((f) => !f.locked)
                  .map((f) => (
                    <li
                      key={f.id}
                      className="flex flex-col items-center gap-1 border-2 border-ink bg-bg px-1 py-2"
                    >
                      <div className="flex h-14 w-full items-center justify-center overflow-hidden">
                        <FurniturePiece id={f.id} />
                      </div>
                      <span className="text-center text-[11px] leading-4">{f.name}</span>
                      <span className="text-[11px] text-ink-soft">
                        {f.scene === "house" ? "室内" : "室外"}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">
                还没有家具。升到 {shown.furniture[0]?.unlockLevel ?? 3} 级会解锁第一件。
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
