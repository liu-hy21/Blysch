"use client";

import { useEffect, useState } from "react";
import type { PetMood } from "@/lib/pet-rules";
import type { PetSpecies } from "@/generated/prisma/client";

const MOOD_ROW: Record<PetMood, number> = { calm: 0, content: 1, miss: 2 };

export function PixelPet({
  species,
  mood,
  scale = 6,
  className,
  label,
}: {
  species: PetSpecies;
  mood: PetMood;
  scale?: 2 | 4 | 6;
  className?: string;
  label?: string;
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % 4), 160);
    return () => window.clearInterval(id);
  }, []);

  const size = 32 * scale;
  const sheetW = 128 * scale;
  const sheetH = 96 * scale;
  const x = frame * 32 * scale;
  const y = MOOD_ROW[mood] * 32 * scale;

  return (
    <div
      role="img"
      aria-label={label ?? "像素宠物"}
      className={`pixelated overflow-hidden ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/pets/${species}.png)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${sheetW}px ${sheetH}px`,
        backgroundPosition: `-${x}px -${y}px`,
      }}
    />
  );
}
