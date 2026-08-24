"use client";

import { startTransition, useState, ViewTransition } from "react";
import { PixelPet } from "@/components/pets/pixel-pet";
import { BackBar } from "../back-bar";
import {
  dreamRoom,
  ROOM_LABEL,
  type DreamRoom,
  type DreamScene,
  type FurnitureItem,
} from "@/lib/dream-furniture";
import type { SerializedPet } from "@/lib/pet-rules";
import type { PetSpecies } from "@/generated/prisma/client";
import { FurniturePiece } from "@/components/pets/furniture-piece";
import { HouseScenery, YardScenery } from "./dream-scenery";
import { cn, todayKey } from "@/lib/utils";
import { dreamPx } from "@/lib/dream-grid";

type DreamPet = SerializedPet & { room: DreamRoom };
type Story = 1 | 2;
type Spot = { top: number | string; left: number | string };

const PET_SPOTS: Record<DreamRoom, Spot[]> = {
  yard: [dreamPx(14, 48), dreamPx(36, 48)],
  kitchen: [dreamPx(8, 50), dreamPx(14, 58)],
  living: [dreamPx(36, 54), dreamPx(48, 50)],
  bathroom: [dreamPx(8, 50), dreamPx(14, 58)],
  bedroom: [dreamPx(36, 54), dreamPx(48, 50)],
};

const YARD_BY_SPECIES: Partial<Record<PetSpecies, Spot>> = {
  rabbit: dreamPx(26, 32),
  cow: dreamPx(43, 26),
};

const STORY_ROOMS: Record<Story, DreamRoom[]> = {
  1: ["kitchen", "living"],
  2: ["bathroom", "bedroom"],
};

function placedPets(pets: DreamPet[], room: DreamRoom) {
  return pets
    .filter((p) => p.room === room)
    .map((p, i) => ({
      ...p,
      spot:
        room === "yard"
          ? (YARD_BY_SPECIES[p.species] ?? PET_SPOTS.yard[Math.min(i, 1)])
          : PET_SPOTS[room][Math.min(i, 1)],
    }));
}

function PetMarker({ pet, spot }: { pet: DreamPet; spot: Spot }) {
  return (
    <div
      className="dream-pet-idle absolute z-20 flex flex-col items-center"
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
    <div className="dream-stage -mx-5">
      <div className="dream-scene dream-yard" role="group" aria-label={label}>
        <YardScenery />

        <button
          type="button"
          aria-label="进屋"
          onClick={onEnter}
          className="dream-door-hotspot absolute z-30 cursor-pointer"
          style={{
            ...dreamPx(26, 21, 8, 13),
            minHeight: 44,
          }}
        />

        {here.map((p) => (
          <PetMarker key={p.id} pet={p} spot={p.spot} />
        ))}
      </div>
    </div>
  );
}

function HouseScene({
  story,
  furniture,
  pets,
  label,
  onLeave,
}: {
  story: Story;
  furniture: FurnitureItem[];
  pets: DreamPet[];
  label: string;
  onLeave: () => void;
}) {
  const indoor = STORY_ROOMS[story].flatMap((room) => placedPets(pets, room));
  const areas = new Set<DreamRoom>(STORY_ROOMS[story]);
  return (
    <div className="dream-stage -mx-5">
      <div className="dream-scene dream-house" role="group" aria-label={label}>
        <HouseScenery story={story} />

        {furniture
          .filter((f) => areas.has(f.area) && f.id !== "cow-bed")
          .map((f) => (
            <FurniturePiece key={f.id} id={f.id} slot={f.slot} />
          ))}

        {story === 1 ? (
          <button
            type="button"
            aria-label="出门"
            onClick={onLeave}
            className="dream-door-hotspot absolute z-30 cursor-pointer"
            style={{
              ...dreamPx(26, 70, 8, 10),
              minHeight: 44,
            }}
          />
        ) : null}

        {indoor.map((p) => (
          <PetMarker key={p.id} pet={p} spot={p.spot} />
        ))}
      </div>
    </div>
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
      room:
        p.species === "rabbit" || p.species === "cow"
          ? "yard"
          : dreamRoom(coupleId, p.id, dateKey),
    }));

  const furniture = pets
    .flatMap((p) => p.furniture)
    .filter((f) => !f.locked && f.scene === scene);

  const where = pets.map((p) => `${p.name}在${ROOM_LABEL[p.room]}`).join("，");
  const label =
    scene === "yard"
      ? `室外院子${where ? `，${where}` : ""}`
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
                onClick={() => goStory(2)}
              />
              <FloorBtn
                label="下"
                ariaLabel="下楼"
                disabled={story === 1}
                onClick={() => goStory(1)}
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
            furniture={furniture}
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
