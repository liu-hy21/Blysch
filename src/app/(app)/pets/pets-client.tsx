"use client";

import { startTransition, useState, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { PixelPet, GuardianPet } from "@/components/pets/pixel-pet";
import { FurniturePiece } from "@/components/pets/furniture-piece";
import { IntimacyRow } from "@/components/pets/intimacy-badges";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  SPECIES,
  SPECIES_LABEL,
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
  const pct = max <= 0 ? 100 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-ink-soft">
        <span>{label}</span>
        <span>{max <= 0 ? "MAX" : `${value}/${max}`}</span>
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
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(mine?.name ?? "");
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
    if (data.levelsGained) setNote(`升了 ${data.levelsGained} 级！`);
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
    if (shown && shown.moodLevel <= 1) bits.push("可是还在等你照料");
    setNote(bits.join("，") + "！");
    router.refresh();
  }

  async function rename() {
    const res = await fetch("/api/pets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      setRenameOpen(false);
      router.refresh();
    }
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
                <Bar
                  label="经验"
                  value={shown.maxLevel ? 1 : shown.exp}
                  max={shown.maxLevel ? 1 : shown.expToNext}
                />
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
            <h3 className="mb-2 text-sm">技能</h3>
            <ul className="space-y-2">
              {shown.skills.map((s) => (
                <li
                  key={s.id}
                  className={`border-2 border-ink px-2 py-2 ${s.locked ? "opacity-40" : "bg-bg"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{s.locked ? "？？？" : s.name}</span>
                    <span className="flex items-center gap-2 text-[11px] text-ink-soft">
                      <span
                        className="border-2 border-ink px-1"
                        style={{ background: TYPE_COLOR[s.type] ?? "#c4c4c0" }}
                      >
                        {s.locked ? "??" : s.type}
                      </span>
                      {s.locked ? `Lv.${s.unlockLevel}` : s.power ? `威力 ${s.power}` : "变化"}
                    </span>
                  </div>
                  {!s.locked && <p className="mt-1 text-[11px] text-ink-soft">{s.desc}</p>}
                </li>
              ))}
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
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setNewName(shown.name);
                    setRenameOpen(true);
                  }}
                >
                  改名
                </Button>
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

      <Sheet open={renameOpen} onClose={() => setRenameOpen(false)} title="改名">
        <input
          className="pixel-field min-h-11 w-full px-3"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button className="mt-4 w-full" onClick={rename}>
          保存
        </Button>
      </Sheet>
    </div>
  );
}
