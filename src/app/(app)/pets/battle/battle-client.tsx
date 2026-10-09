"use client";

import { useState } from "react";
import Link from "next/link";
import type { PetSpecies } from "@/generated/prisma/client";
import { PixelPet } from "@/components/pets/pixel-pet";
import { FoeIcon } from "@/components/pets/foe-icon";
import { Button } from "@/components/ui/button";
import { BOND_SKILL } from "@/lib/pet-rules";
import {
  castSkill,
  FOES,
  foeUnit,
  livingOrder,
  outcome,
  strike,
  type BattleSkill,
  type BattleUnit,
  type FoeKind,
} from "@/lib/pet-battle";

export type BattleAlly = {
  id: string;
  name: string;
  species: PetSpecies;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  intimacy: number;
  skills: BattleSkill[];
};

const FRONT: PetSpecies[] = ["cow", "rabbit"];

function orderAllies(allies: BattleAlly[]) {
  return allies.toSorted((a, b) => {
    const ai = FRONT.indexOf(a.species);
    const bi = FRONT.indexOf(b.species);
    return (ai === -1 ? 9 : ai) - (bi === -1 ? 9 : bi);
  });
}

function toAlly(ally: BattleAlly): BattleUnit {
  return {
    id: ally.id,
    name: ally.name,
    side: "ally",
    hp: ally.hp,
    maxHp: ally.hp,
    atk: ally.atk,
    def: ally.def,
    spd: ally.spd,
    species: ally.species,
    mp: ally.intimacy,
    maxMp: ally.intimacy,
  };
}

function Meter({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="h-2.5 border-2 border-ink bg-bg">
      <div className="h-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function BattleClient({ allies }: { allies: BattleAlly[] }) {
  const party = orderAllies(allies);
  const [units, setUnits] = useState<BattleUnit[] | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<"win" | "lose" | null>(null);

  function begin(kind: FoeKind) {
    const field = [...party.map(toAlly), foeUnit(kind)];
    const order = livingOrder(field);
    setUnits(field);
    setQueue(order.map((unit) => unit.id));
    setResult(null);
    setLog([`遭遇了${FOES[kind].name}。`, `出手顺序：${order.map((unit) => unit.name).join("、")}`]);
  }

  function readyQueue(field: BattleUnit[], current: string[]) {
    if (current.length > 0) return { queue: current, note: "" };
    const order = livingOrder(field);
    if (order.length === 0) return { queue: current, note: "" };
    return {
      queue: order.map((unit) => unit.id),
      note: `出手顺序：${order.map((unit) => unit.name).join("、")}`,
    };
  }

  function finish(field: BattleUnit[], nextQueue: string[], lines: string[]) {
    const end = outcome(field);
    setUnits(field);
    setQueue(end === "ongoing" ? nextQueue : []);
    setResult(end === "ongoing" ? null : end);
    const extra = [...lines];
    if (end === "win") extra.push("对手倒下了。");
    if (end === "lose") extra.push("我方都倒下了。");
    setLog((prev) => [...prev, ...extra.filter(Boolean)].slice(-8));
  }

  function advanceFoe() {
    if (!units || result) return;
    const opened = readyQueue(units, queue);
    const actor = units.find((unit) => unit.id === opened.queue[0] && unit.hp > 0);
    if (!actor) return;
    if (actor.side === "ally") {
      finish(units, opened.queue, opened.note ? [opened.note] : []);
      return;
    }
    const acted = strike(units, actor.id);
    const nextQueue = opened.queue
      .slice(1)
      .filter((id) => acted.units.some((unit) => unit.id === id && unit.hp > 0));
    finish(acted.units, nextQueue, [opened.note, acted.line]);
  }

  function allyAct(choice: "strike" | BattleSkill) {
    if (!units || result) return;
    const actor = units.find((unit) => unit.id === queue[0] && unit.hp > 0);
    if (!actor || actor.side !== "ally") return;
    const acted =
      choice === "strike"
        ? { ...strike(units, actor.id), ok: true }
        : castSkill(units, actor.id, choice);
    if (!acted.ok) {
      setLog((prev) => [...prev, acted.line].filter(Boolean).slice(-8));
      return;
    }
    const nextQueue = queue
      .slice(1)
      .filter((id) => acted.units.some((unit) => unit.id === id && unit.hp > 0));
    finish(acted.units, nextQueue, [acted.line]);
  }

  if (party.length === 0) {
    return (
      <div className="px-5 pb-8 pt-6">
        <h1 className="text-2xl">作战</h1>
        <p className="mt-4 text-sm text-ink-soft">还没有可以上场的守护。</p>
        <Link href="/pets" className="mt-4 inline-block text-sm text-gold-deep">
          返回守护
        </Link>
      </div>
    );
  }

  if (!units) {
    return (
      <div className="px-5 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">作战</h1>
          <Link href="/pets" className="text-sm text-ink-soft">
            返回
          </Link>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          我方 {party.map((ally) => ally.name).join("、")}。选一个对手。
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {(Object.keys(FOES) as FoeKind[]).map((kind) => {
            const foe = FOES[kind];
            return (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => begin(kind)}
                  className="flex w-full flex-col items-center gap-2 border-2 border-ink bg-card px-2 py-3"
                >
                  <FoeIcon kind={kind} label={foe.name} size={48} />
                  <span className="text-sm">{foe.name}</span>
                  <span className="text-[11px] text-ink-soft">
                    生命 {foe.hp} · 攻击 {foe.atk}
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    防御 {foe.def} · 速度 {foe.spd}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const foe = units.find((unit) => unit.side === "foe");
  const actorId = queue[0];
  const actor = units.find((unit) => unit.id === actorId);

  return (
    <div className="px-5 pb-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">作战</h1>
        <button type="button" className="text-sm text-ink-soft" onClick={() => setUnits(null)}>
          换对手
        </button>
      </div>

      {foe ? (
        <section className={`pixel-box mt-4 p-3 ${actorId === foe.id ? "bg-gold" : ""}`}>
          <div className="flex items-center gap-3">
            {foe.foeKind ? <FoeIcon kind={foe.foeKind} label={foe.name} size={56} /> : null}
            <div className="min-w-0 flex-1">
              <p className="text-sm">{foe.name}</p>
              <p className="text-[11px] text-ink-soft">
                {foe.hp}/{foe.maxHp}
              </p>
              <Meter value={foe.hp} max={foe.maxHp} color="#e07070" />
              <p className="mt-1 text-[11px] text-ink-soft">
                攻击 {foe.atk} · 防御 {foe.def} · 速度 {foe.spd}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="pixel-box mt-3 min-h-24 p-3">
        <ul className="space-y-1 text-sm">
          {log.map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
      </section>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {units
          .filter((unit) => unit.side === "ally")
          .map((unit) => (
            <li key={unit.id} className={`border-2 border-ink px-2 py-2 ${actorId === unit.id ? "bg-gold" : "bg-card"}`}>
              <div className="flex items-center gap-2">
                {unit.species ? (
                  <PixelPet species={unit.species} mood="calm" scale={2} label={unit.name} />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{unit.name}</p>
                  <p className="text-[11px] text-ink-soft">
                    {unit.hp}/{unit.maxHp}
                  </p>
                  <Meter value={unit.hp} max={unit.maxHp} color="#e07070" />
                  <p className="mt-1 text-[11px] text-ink-soft">
                    蓝 {unit.mp ?? 0}/{unit.maxMp ?? 0}
                  </p>
                  <Meter value={unit.mp ?? 0} max={unit.maxMp ?? 0} color="#3d6cb5" />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-ink-soft">
                攻击 {unit.atk} · 防御 {unit.def} · 速度 {unit.spd}
              </p>
            </li>
          ))}
      </ul>

      <div className="mt-4">
        {result ? (
          <Button className="w-full" onClick={() => setUnits(null)}>
            {result === "win" ? "胜利，再选一个对手" : "败北，再来一次"}
          </Button>
        ) : actor?.side === "ally" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => allyAct("strike")}
              className="border-2 border-ink bg-card px-2 py-2 text-sm"
            >
              打击
            </button>
            {party
              .find((ally) => ally.id === actor.id)
              ?.skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  disabled={(actor.mp ?? 0) < skill.cost}
                  onClick={() => allyAct(skill)}
                  className="border-2 border-ink bg-card px-2 py-2 text-sm disabled:opacity-40"
                >
                  {skill.name}
                </button>
              ))}
            {units.filter((unit) => unit.side === "ally" && unit.hp > 0).length >= 2 ? (
              <button
                type="button"
                disabled={units
                  .filter((unit) => unit.side === "ally" && unit.hp > 0)
                  .some((unit) => (unit.mp ?? 0) < BOND_SKILL.cost)}
                onClick={() => allyAct(BOND_SKILL)}
                className="col-span-2 border-2 border-ink bg-gold px-2 py-2 text-sm disabled:opacity-40"
              >
                {BOND_SKILL.name}
              </button>
            ) : null}
          </div>
        ) : (
          <Button className="w-full" onClick={advanceFoe}>
            下一动
          </Button>
        )}
      </div>
    </div>
  );
}
