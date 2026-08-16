"use client";

import { startTransition, useState, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { PixelPet } from "@/components/pets/pixel-pet";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { SPECIES, SPECIES_LABEL, type SerializedPet } from "@/lib/pet-rules";
import type { PetSpecies } from "@/generated/prisma/client";

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
    const res = await fetch("/api/pets/care", { method: "POST" });
    if (res.ok) router.refresh();
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

  function switchTab(next: "mine" | "partner") {
    setTab(next);
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
        <div className="mt-8 flex flex-col items-center">
          <ViewTransition
            name={tab === "mine" ? "pet-sprite-mine" : "pet-sprite-partner"}
            share="morph"
            default="none"
          >
            <PixelPet
              species={shown.species}
              mood={shown.mood}
              scale={6}
              label={shown.name}
            />
          </ViewTransition>
          <h2 className="mt-4 text-2xl">{shown.name}</h2>
          <p className="text-sm text-ink-soft">
            {shown.speciesLabel} · 亲密度 {shown.intimacy}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {shown.caredToday ? "今天已经照料过" : "今天还没有照料"}
          </p>
          {tab === "mine" && (
            <div className="mt-6 flex w-full gap-3">
              <Button className="flex-1" disabled={shown.caredToday} onClick={care}>
                今日照料
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
          )}
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
