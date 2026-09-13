"use client";

import dynamic from "next/dynamic";
import { startTransition, useState, ViewTransition, type ReactNode } from "react";
import { PixelPet } from "@/components/pets/pixel-pet";
import { BackBar } from "../back-bar";
import {
  dreamRoom,
  ROOM_LABEL,
  type DreamRoom,
  type DreamScene,
} from "@/lib/dream-furniture";
import { PARK_MODELS } from "@/lib/park/models";
import type { SerializedPet } from "@/lib/pet-rules";
import { cn, todayKey } from "@/lib/utils";

const ParkCanvas = dynamic(
  () => import("./park-canvas").then((m) => m.ParkCanvas),
  { ssr: false },
);

type DreamPet = SerializedPet & { room: DreamRoom };
type Story = 0 | 1 | 2;
type Spot = { top: string; left: string };

const PET_SPOTS: Record<DreamRoom, Spot[]> = {
  yard: [
    { top: "62%", left: "28%" },
    { top: "62%", left: "55%" },
  ],
  kitchen: [
    { top: "48%", left: "18%" },
    { top: "52%", left: "28%" },
  ],
  living: [
    { top: "68%", left: "62%" },
    { top: "62%", left: "78%" },
  ],
  bathroom: [
    { top: "32%", left: "18%" },
    { top: "48%", left: "22%" },
  ],
  bedroom: [
    { top: "52%", left: "62%" },
    { top: "52%", left: "74%" },
  ],
};

const STORY_ROOMS: Record<Story, DreamRoom[]> = {
  0: [],
  1: ["kitchen", "living"],
  2: ["bathroom", "bedroom"],
};

function placedPets(pets: DreamPet[], room: DreamRoom) {
  return pets
    .filter((p) => p.room === room)
    .map((p, i) => ({
      ...p,
      spot: PET_SPOTS[room][Math.min(i, 1)],
    }));
}

function PetMarker({ pet, spot }: { pet: DreamPet; spot: Spot }) {
  return (
    <div
      className="dream-pet-idle pointer-events-none absolute z-20 flex flex-col items-center"
      style={{ top: spot.top, left: spot.left }}
    >
      <PixelPet species={pet.species} mood={pet.mood} scale={2} label={pet.name} />
      <span className="mt-0.5 border-2 border-ink bg-card px-1 text-[11px] leading-4">
        {pet.name}
      </span>
    </div>
  );
}

function FloorBtn({
  label,
  ariaLabel,
  disabled,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center border-2 border-ink px-2 text-sm",
        disabled
          ? "cursor-default bg-[#efe6d4] text-[#c4b49c] shadow-none"
          : "bg-gold text-ink shadow-[3px_3px_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      )}
    >
      {label}
    </button>
  );
}

function ParkFrame({
  label,
  model,
  children,
}: {
  label: string;
  model: string | null;
  children?: ReactNode;
}) {
  return (
    <div className="dream-stage -mx-5">
      <div className="dream-scene" role="group" aria-label={label}>
        <div className="absolute inset-0">
          <ParkCanvas src={model} />
        </div>
        {children}
      </div>
    </div>
  );
}

function YardScene({
  pets,
  label,
  onEnter,
}: {
  pets: DreamPet[];
  label: string;
  onEnter: () => void;
}) {
  const here = placedPets(pets, "yard");
  return (
    <ParkFrame label={label} model={PARK_MODELS.yard}>
      <button
        type="button"
        aria-label="进屋"
        onClick={onEnter}
        className="dream-door-hotspot absolute z-30 cursor-pointer"
        style={{ left: "42%", top: "34%", width: "16%", height: "22%", minHeight: 44 }}
      />
      {here.map((p) => (
        <PetMarker key={p.id} pet={p} spot={p.spot} />
      ))}
    </ParkFrame>
  );
}

function HouseScene({
  story,
  pets,
  label,
  onLeave,
}: {
  story: Story;
  pets: DreamPet[];
  label: string;
  onLeave: () => void;
}) {
  const indoor = STORY_ROOMS[story].flatMap((room) => placedPets(pets, room));
  const model =
    story === 1 ? PARK_MODELS.l1 : story === 2 ? PARK_MODELS.l2 : null;
  return (
    <ParkFrame label={label} model={model}>
      {story === 1 ? (
        <button
          type="button"
          aria-label="出门"
          onClick={onLeave}
          className="dream-door-hotspot absolute z-30 cursor-pointer"
          style={{ left: "40%", top: "70%", width: "20%", height: "22%", minHeight: 44 }}
        />
      ) : null}
      {indoor.map((p) => (
        <PetMarker key={p.id} pet={p} spot={p.spot} />
      ))}
    </ParkFrame>
  );
}

export function DreamClient({
  coupleId,
  mine,
  partner,
}: {
  coupleId: string;
  mine: SerializedPet | null;
  partner: SerializedPet | null;
}) {
  const [scene, setScene] = useState<DreamScene>("yard");
  const [story, setStory] = useState<Story>(1);
  const dateKey = todayKey();
  const pets: DreamPet[] = [mine, partner]
    .filter((p): p is SerializedPet => p !== null)
    .map((p) => ({
      ...p,
      room: dreamRoom(coupleId, p.id, dateKey),
    }));

  const where = pets.map((p) => `${p.name}在${ROOM_LABEL[p.room]}`).join("，");
  const label =
    scene === "yard"
      ? `室外院子${where ? `，${where}` : ""}`
      : story === 0
        ? "负一楼娱乐层"
        : story === 1
          ? `一楼厨房与客厅${where ? `，${where}` : ""}`
          : `二楼浴室与卧室${where ? `，${where}` : ""}`;

  function goYard() {
    startTransition(() => {
      setStory(1);
      setScene("yard");
    });
  }

  function goHouse() {
    startTransition(() => {
      setStory(1);
      setScene("house");
    });
  }

  function goStory(next: Story) {
    startTransition(() => setStory(next));
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <BackBar title="乐园" href="/me" />
      <p className="mb-3 flex items-center text-xs text-ink-soft">
        {scene === "yard" ? (
          "点屋门进屋"
        ) : (
          <>
            点门口出门
            <span className="ml-3 inline-flex gap-1">
              <FloorBtn
                label="上"
                ariaLabel="上楼"
                disabled={story === 2}
                onClick={() => goStory((story + 1) as Story)}
              />
              <FloorBtn
                label="下"
                ariaLabel="下楼"
                disabled={story === 0}
                onClick={() => goStory((story - 1) as Story)}
              />
            </span>
          </>
        )}
      </p>
      {scene === "yard" ? (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <YardScene pets={pets} label={label} onEnter={goHouse} />
        </ViewTransition>
      ) : (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <HouseScene
            key={story}
            story={story}
            pets={pets}
            label={label}
            onLeave={goYard}
          />
        </ViewTransition>
      )}
      {pets.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">还没有人认养宠物。</p>
      ) : null}
    </div>
  );
}
