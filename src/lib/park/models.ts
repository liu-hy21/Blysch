export const PARK_MODELS = {
  yard: "/models/park/yard.glb",
  l1: "/models/park/house-l1.glb",
  l2: "/models/park/house-l2.glb",
} as const;

export type ParkModelId = keyof typeof PARK_MODELS;
