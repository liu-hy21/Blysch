import type { PetSpecies } from "@/generated/prisma/client";
import { GEAR_PALETTE, gearSprite } from "@/lib/gear-sprites";
import type { RewardKind } from "@/lib/pet-rpg";

export function GearIcon({
  species,
  kind,
  label,
  size = 32,
}: {
  species: PetSpecies;
  kind: RewardKind;
  label: string;
  size?: number;
}) {
  const rows = gearSprite(species, kind);
  const cells = rows.flatMap((row, y) =>
    [...row].flatMap((ch, x) => {
      const fill = GEAR_PALETTE[ch];
      if (!fill) return [];
      return [<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />];
    }),
  );

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="pixelated shrink-0"
      shapeRendering="crispEdges"
    >
      {cells}
    </svg>
  );
}
