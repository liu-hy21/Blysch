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
  if (kind === "tree") {
    return (
      <div className="home-bond-scene" aria-hidden>
        <span className="home-bond-sun" />
        <span className="home-bond-cloud home-bond-cloud-a" />
        <span className="home-bond-cloud home-bond-cloud-b" />
        <span className="home-bond-tree">
          <span className="home-bond-crown" />
          <span className="home-bond-trunk" />
        </span>
      </div>
    );
  }
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
  if (kind === "rain") {
    return (
      <div className="home-bond-scene" aria-hidden>
        <span className="home-bond-rain" />
        <span className="home-bond-eave-wall" />
        <span className="home-bond-eave-roof" />
        <span className="home-bond-eave-ground" />
      </div>
    );
  }
  if (kind === "hearth") {
    return (
      <div className="home-bond-scene" aria-hidden>
        <span className="home-bond-hearth-wall" />
        <span className="home-bond-hearth-box" />
        <span className="home-bond-hearth-fire" />
        <span className="home-bond-hearth-floor" />
      </div>
    );
  }
  return (
    <div className="home-bond-scene" aria-hidden>
      <span className="home-bond-moon-disc" />
      <span className="home-bond-star home-bond-star-a" />
      <span className="home-bond-star home-bond-star-b" />
    </div>
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
