"use client";

import Link from "next/link";
import { useEffect, useState, ViewTransition } from "react";
import { PixelPet } from "@/components/pets/pixel-pet";
import {
  BOND_LABEL,
  currentBond,
  type BondKind,
} from "@/lib/home-bond";
import type { SerializedPet } from "@/lib/pet-rules";
import type { PetSpecies } from "@/generated/prisma/client";
import { shanghaiHour, todayKey } from "@/lib/utils";

export function HomePets({
  coupleId,
  me,
  partner,
  minePet,
  partnerPet,
}: {
  coupleId: string;
  me: { nickname: string };
  partner: { nickname: string };
  minePet: SerializedPet | null;
  partnerPet: SerializedPet | null;
}) {
  const [hour, setHour] = useState(() => shanghaiHour());
  const [dateKey, setDateKey] = useState(() => todayKey());
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const tick = () => {
      setHour(shanghaiHour());
      setDateKey(todayKey());
    };
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const ready = Boolean(minePet && partnerPet);
  const bond = ready ? currentBond(coupleId, dateKey, hour) : null;

  function play() {
    if (!bond) return;
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 700);
  }

  if (!bond || !minePet || !partnerPet) {
    return (
      <section className="flex items-end justify-around pixel-box py-4">
        <IdlePet href="/pets" pet={minePet} nickname={me.nickname} transition="pet-sprite-mine" />
        <IdlePet
          href="/pets?side=partner"
          pet={partnerPet}
          nickname={partner.nickname}
          transition="pet-sprite-partner"
        />
      </section>
    );
  }

  return (
    <section className="pixel-box">
      <button
        type="button"
        className={`home-bond is-${bond.kind}${playing ? " is-play" : ""}`}
        onClick={play}
        aria-label={`${BOND_LABEL[bond.kind]}，点一下互动`}
      >
        <BondScenery kind={bond.kind} />
        <div className="home-bond-actors">
          <ViewTransition name="pet-sprite-mine" share="morph" default="none">
            <div className="home-bond-me">
              <PixelPet
                species={minePet.species}
                mood={minePet.mood}
                scale={2}
                label={me.nickname}
              />
              {bond.kind === "fight" ? <BondWeapon species={minePet.species} /> : null}
            </div>
          </ViewTransition>
          <ViewTransition name="pet-sprite-partner" share="morph" default="none">
            <div className="home-bond-them">
              <PixelPet
                species={partnerPet.species}
                mood={partnerPet.mood}
                scale={2}
                label={partner.nickname}
              />
              {bond.kind === "fight" ? <BondWeapon species={partnerPet.species} /> : null}
            </div>
          </ViewTransition>
        </div>
      </button>
      <div className="flex items-center justify-around border-t-2 border-ink px-2 py-2">
        <Link href="/pets" className="text-[11px] text-ink-soft">
          {me.nickname}
        </Link>
        <span className="text-[11px] text-gold-deep">{BOND_LABEL[bond.kind]}</span>
        <Link href="/pets?side=partner" className="text-[11px] text-ink-soft">
          {partner.nickname}
        </Link>
      </div>
    </section>
  );
}

function IdlePet({
  href,
  pet,
  nickname,
  transition,
}: {
  href: string;
  pet: SerializedPet | null;
  nickname: string;
  transition: string;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1">
      <ViewTransition name={transition} share="morph" default="none">
        {pet ? (
          <PixelPet species={pet.species} mood={pet.mood} scale={2} label={nickname} />
        ) : (
          <div className="h-16 w-16 border-2 border-dashed border-ink" />
        )}
      </ViewTransition>
      <span className="text-[11px] text-ink-soft">{nickname}</span>
    </Link>
  );
}

function BondScenery({ kind }: { kind: BondKind }) {
  if (kind === "fight") {
    return (
      <div className="home-bond-scene" aria-hidden>
        <span className="home-bond-garage-door" />
        <span className="home-bond-garage-lamp" />
        <span className="home-bond-garage-chest" />
        <span className="home-bond-garage-floor" />
      </div>
    );
  }
  if (kind === "tree") {
    return (
      <div className="home-bond-scene" aria-hidden>
        <Px className="hb-hill" t={58} l={0} w={170} h={58} />
        <Px className="hb-hill hb-hill-far" t={70} r={0} w={150} h={46} />
        <Px className="hb-sun" t={8} r={14} w={14} h={14} />
        <Px className="hb-sun-hi" t={10} r={20} w={6} h={4} />
        <Px className="hb-sun-ray" t={4} r={18} w={4} h={4} />
        <Px className="hb-sun-ray" t={12} r={6} w={4} h={4} />
        <Px className="hb-sun-ray" t={22} r={18} w={4} h={4} />
        <Px className="hb-cloud" t={12} l={52} w={22} h={8} />
        <Px className="hb-cloud" t={8} l={62} w={18} h={8} />
        <Px className="hb-cloud" t={14} l={76} w={14} h={8} />
        <Px className="hb-cloud" t={20} l={108} w={16} h={6} />
        <Px className="hb-cloud" t={16} l={118} w={12} h={6} />
        <Px className="hb-leaf-dk" b={42} l={8} w={18} h={16} />
        <Px className="hb-leaf" b={50} l={16} w={28} h={20} />
        <Px className="hb-leaf-hi" b={58} l={22} w={16} h={12} />
        <Px className="hb-leaf" b={44} l={36} w={16} h={14} />
        <Px className="hb-leaf-dk" b={38} l={28} w={10} h={10} />
        <Px className="hb-apple" b={48} l={24} w={4} h={4} />
        <Px className="hb-apple" b={54} l={34} w={4} h={4} />
        <Px className="hb-bark" b={16} l={24} w={10} h={28} />
        <Px className="hb-bark-hi" b={20} l={26} w={4} h={18} />
        <Px className="hb-leaf-dk" b={28} r={18} w={12} h={10} />
        <Px className="hb-leaf" b={34} r={14} w={16} h={10} />
        <Px className="hb-bark" b={16} r={24} w={6} h={14} />
        <Px className="hb-grass" b={0} l={0} r={0} h={16} />
        <Px className="hb-tuft" b={14} l={6} w={4} h={6} />
        <Px className="hb-tuft" b={16} l={40} w={4} h={4} />
        <Px className="hb-tuft" b={14} l={88} w={6} h={6} />
        <Px className="hb-tuft" b={16} r={36} w={4} h={4} />
        <Px className="hb-flower" b={16} l={12} w={4} h={4} />
        <Px className="hb-flower hb-flower-b" b={14} r={48} w={4} h={4} />
      </div>
    );
  }
  if (kind === "rain") {
    return (
      <div className="home-bond-scene" aria-hidden>
        <span className="hb-rain" />
        <Px className="hb-brick" t={0} l={0} w={40} b={16} />
        <Px className="hb-window" t={18} l={10} w={18} h={22} />
        <Px className="hb-pane" t={20} l={12} w={6} h={8} />
        <Px className="hb-pane" t={20} l={20} w={6} h={8} />
        <Px className="hb-pane" t={30} l={12} w={6} h={8} />
        <Px className="hb-pane" t={30} l={20} w={6} h={8} />
        <Px className="hb-sill" t={40} l={8} w={22} h={4} />
        <Px className="hb-roof" t={22} l={0} w={168} h={10} />
        <Px className="hb-shingle" t={24} l={4} w={10} h={6} />
        <Px className="hb-shingle hb-shingle-dk" t={24} l={16} w={10} h={6} />
        <Px className="hb-shingle" t={24} l={28} w={10} h={6} />
        <Px className="hb-shingle hb-shingle-dk" t={24} l={40} w={10} h={6} />
        <Px className="hb-shingle" t={24} l={52} w={10} h={6} />
        <Px className="hb-shingle hb-shingle-dk" t={24} l={64} w={10} h={6} />
        <Px className="hb-shingle" t={24} l={76} w={10} h={6} />
        <Px className="hb-shingle hb-shingle-dk" t={24} l={88} w={10} h={6} />
        <Px className="hb-shingle" t={24} l={100} w={10} h={6} />
        <Px className="hb-shingle hb-shingle-dk" t={24} l={112} w={10} h={6} />
        <Px className="hb-shingle" t={24} l={124} w={10} h={6} />
        <Px className="hb-shingle hb-shingle-dk" t={24} l={136} w={10} h={6} />
        <Px className="hb-shingle" t={24} l={148} w={10} h={6} />
        <Px className="hb-post" t={32} l={154} w={6} b={16} />
        <Px className="hb-drip" t={32} l={48} w={4} h={10} />
        <Px className="hb-drip" t={34} l={96} w={4} h={8} />
        <Px className="hb-wet" b={0} l={0} r={0} h={16} />
        <Px className="hb-puddle" b={10} l={120} w={28} h={6} />
        <Px className="hb-puddle" b={8} r={24} w={18} h={4} />
      </div>
    );
  }
  if (kind === "hearth") {
    return (
      <div className="home-bond-scene" aria-hidden>
        <Px className="hb-room" t={0} l={0} r={0} b={16} />
        <Px className="hb-night-win" t={10} l={12} w={28} h={24} />
        <Px className="hb-pane hb-pane-night" t={12} l={14} w={10} h={8} />
        <Px className="hb-pane hb-pane-night" t={12} l={26} w={10} h={8} />
        <Px className="hb-pane hb-pane-night" t={22} l={14} w={10} h={8} />
        <Px className="hb-pane hb-pane-night" t={22} l={26} w={10} h={8} />
        <Px className="hb-sill hb-sill-dark" t={34} l={10} w={32} h={4} />
        <Px className="hb-mantel" b={64} r={12} w={58} h={6} />
        <Px className="hb-kettle" b={70} r={28} w={10} h={8} />
        <Px className="hb-kettle-nub" b={78} r={32} w={4} h={4} />
        <Px className="hb-hearth" b={16} r={16} w={50} h={48} />
        <Px className="hb-hearth-in" b={20} r={22} w={38} h={28} />
        <Px className="hb-log" b={22} r={28} w={18} h={6} />
        <Px className="hb-log hb-log-b" b={24} r={36} w={14} h={6} />
        <span className="hb-flame" />
        <Px className="hb-flame-core" b={28} r={34} w={10} h={10} />
        <Px className="hb-smoke hb-smoke-a" t={18} r={28} w={6} h={6} />
        <Px className="hb-smoke hb-smoke-b" t={10} r={22} w={6} h={6} />
        <Px className="hb-smoke hb-smoke-c" t={4} r={30} w={4} h={4} />
        <Px className="hb-boards" b={0} l={0} r={0} h={16} />
        <Px className="hb-rug" b={14} l={28} w={52} h={8} />
      </div>
    );
  }
  return (
    <div className="home-bond-scene" aria-hidden>
      <Px className="hb-night-hill" t={64} l={0} w={140} h={52} />
      <Px className="hb-night-hill hb-night-hill-b" t={76} r={0} w={160} h={40} />
      <Px className="hb-moon" t={8} r={16} w={24} h={24} />
      <Px className="hb-moon-hi" t={12} r={28} w={7} h={6} />
      <Px className="hb-crater" t={16} r={22} w={5} h={5} />
      <Px className="hb-crater" t={22} r={30} w={4} h={4} />
      <Px className="hb-star" t={12} l={22} w={4} h={4} />
      <Px className="hb-star hb-star-dim" t={8} l={48} w={4} h={4} />
      <Px className="hb-star" t={22} l={64} w={4} h={4} />
      <Px className="hb-star hb-star-dim" t={14} l={92} w={4} h={4} />
      <Px className="hb-star" t={28} l={118} w={4} h={4} />
      <Px className="hb-star hb-star-tiny" t={18} l={140} w={4} h={4} />
      <Px className="hb-sil-leaf" b={28} l={6} w={14} h={12} />
      <Px className="hb-sil-leaf" b={36} l={10} w={10} h={8} />
      <Px className="hb-sil-trunk" b={16} l={12} w={6} h={16} />
      <Px className="hb-sil-leaf" b={26} r={8} w={12} h={10} />
      <Px className="hb-sil-trunk" b={16} r={14} w={4} h={12} />
      <Px className="hb-path" b={0} l={0} r={0} h={16} />
      <Px className="hb-path-hi" b={6} l={40} r={36} h={4} />
      <Px className="hb-stone" b={14} l={18} w={8} h={4} />
      <Px className="hb-stone" b={12} r={52} w={6} h={4} />
      <Px className="hb-lamp-pole" b={16} r={40} w={4} h={36} />
      <Px className="hb-lamp-glow" b={48} r={36} w={12} h={10} />
    </div>
  );
}

function Px({
  className,
  t,
  l,
  r,
  b,
  w,
  h,
}: {
  className: string;
  t?: number;
  l?: number;
  r?: number;
  b?: number;
  w?: number;
  h?: number;
}) {
  return (
    <span
      className={`home-bond-px ${className}`}
      style={{
        top: t,
        left: l,
        right: r,
        bottom: b,
        width: w,
        height: h,
      }}
    />
  );
}

function BondWeapon({ species }: { species: PetSpecies }) {
  if (species === "cow") {
    return (
      <span className="home-bond-weapon is-bell">
        <span className="home-bond-bell-stick" />
        <span className="home-bond-bell-head" />
      </span>
    );
  }
  return (
    <span className="home-bond-weapon is-carrot">
      <span className="home-bond-carrot-leaf" />
      <span className="home-bond-carrot-blade" />
    </span>
  );
}
