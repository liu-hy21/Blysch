import { PARK_MODELS } from "./models";

export const PARK_PLACES = [
  { id: "home", label: "家", title: "家", kind: "home" },
  {
    id: "ryokan",
    label: "旅宿",
    title: "黄昏旅宿",
    kind: "diorama",
    src: "/lib/ryokan_dusk.glb",
  },
  {
    id: "konbini",
    label: "便利店",
    title: "夜便利店",
    kind: "diorama",
    src: "/lib/konbini_night.glb",
  },
  {
    id: "cottage",
    label: "小屋",
    title: "乡间小屋",
    kind: "diorama",
    src: "/lib/cottage_diorama.glb",
  },
] as const;

export type ParkPlace = (typeof PARK_PLACES)[number];
export type ParkPlaceId = ParkPlace["id"];
export type Story = 0 | 1 | 2;

const PLACE_BY_ID = new Map(PARK_PLACES.map((place) => [place.id, place]));

export function parseParkPlace(raw: string | null | undefined): ParkPlaceId {
  if (raw && PLACE_BY_ID.has(raw as ParkPlaceId)) return raw as ParkPlaceId;
  return "home";
}

export function parkPlaceById(id: ParkPlaceId): ParkPlace {
  return PLACE_BY_ID.get(id) ?? PARK_PLACES[0];
}

export function parkPlaceHref(id: ParkPlaceId): string {
  return id === "home" ? "/me/park" : `/me/park?place=${id}`;
}

export function parkDioramaUrls(): string[] {
  return PARK_PLACES.flatMap((place) =>
    place.kind === "diorama" ? [place.src] : [],
  );
}

export function parkModelFor(
  place: ParkPlaceId,
  scene: "yard" | "house",
  story: Story,
): string | null {
  const current = parkPlaceById(place);
  if (current.kind === "diorama") return current.src;
  if (scene === "yard") return PARK_MODELS.yard;
  if (story === 0) return PARK_MODELS.b1;
  if (story === 1) return PARK_MODELS.l1;
  if (story === 2) return PARK_MODELS.l2;
  return null;
}
