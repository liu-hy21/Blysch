import type { PetSpecies } from "@/generated/prisma/client";
import { GEAR_PALETTE } from "@/lib/gear-sprites";
import { skillSprite } from "@/lib/skill-sprites";

export function SkillIcon({
  species,
  skillId,
  label,
  size = 16,
}: {
  species: PetSpecies;
  skillId: string;
  label: string;
  size?: number;
}) {
  const rows = skillSprite(species, skillId);
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
