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
import { FurniturePiece } from "@/components/pets/furniture-piece";
import { HouseScenery, YardScenery } from "./dream-scenery";
import { todayKey } from "@/lib/utils";
import { dreamPx } from "@/lib/dream-grid";

type DreamPet = SerializedPet & { room: DreamRoom };

type Spot = { top: number | string; left: number | string };

const PET_SPOTS: Record<DreamRoom, Spot[]> = {
  yard: [dreamPx(14, 48), dreamPx(36, 48)],
  kitchen: [
    { top: "18%", left: "12%" },
    { top: "18%", left: "32%" },
  ],
  bathroom: [
    { top: "18%", left: "78%" },
    { top: "18%", left: "88%" },
  ],
  living: [
    { top: "78%", left: "8%" },
    { top: "78%", left: "24%" },
  ],
  bedroom: [
    { top: "78%", left: "58%" },
    { top: "78%", left: "74%" },
  ],
};

function placedPets(pets: DreamPet[], room: DreamRoom) {
  return pets
    .filter((p) => p.room === room)
    .map((p, i) => ({ ...p, spot: PET_SPOTS[room][Math.min(i, 1)] }));
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
  furniture,
  pets,
  label,
  onLeave,
}: {
  furniture: FurnitureItem[];
  pets: DreamPet[];
  label: string;
  onLeave: () => void;
}) {
  const indoor = (["kitchen", "bathroom", "living", "bedroom"] as const).flatMap((room) =>
    placedPets(pets, room),
  );
  return (
    <div className="dream-stage -mx-5">
      <div className="dream-scene dream-house" role="group" aria-label={label}>
        <HouseScenery />

        {furniture.map((f) => (
          <FurniturePiece key={f.id} id={f.id} slot={f.slot} />
        ))}

        <button
          type="button"
          aria-label="出门"
          onClick={onLeave}
          className="dream-door absolute bottom-3 left-[17%] z-30 flex min-h-11 w-16 items-center justify-center text-[11px] text-[#fff8ec]"
        >
          出门
        </button>

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
  const dateKey = todayKey();
  const pets: DreamPet[] = [mine, partner]
    .filter((p): p is SerializedPet => p !== null)
    .map((p) => ({ ...p, room: dreamRoom(coupleId, p.id, dateKey) }));

  const furniture = pets
    .flatMap((p) => p.furniture)
    .filter((f) => !f.locked && f.scene === scene);

  const where = pets.map((p) => `${p.name}在${ROOM_LABEL[p.room]}`).join("，");
  const label =
    scene === "yard"
      ? `室外院子${where ? `，${where}` : ""}`
      : `室内厨房、客厅、卧室、浴室${where ? `，${where}` : ""}`;

  function go(next: DreamScene) {
    startTransition(() => setScene(next));
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <BackBar title="乐园" href="/me" />
      <p className="mb-3 text-xs text-ink-soft">
        {scene === "yard" ? "点屋门进屋" : "点门口出门"}
      </p>
      {scene === "yard" ? (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <YardScene
            pets={pets}
            label={label}
            onEnter={() => go("house")}
          />
        </ViewTransition>
      ) : (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <HouseScene
            furniture={furniture}
            pets={pets}
            label={label}
            onLeave={() => go("yard")}
          />
        </ViewTransition>
      )}
      {pets.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">还没有人认养宠物。</p>
      ) : null}
    </div>
  );
}
