import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settleAndSerialize } from "@/lib/pet-settle";
import { skillsFor } from "@/lib/pet-rules";
import { BattleClient, type BattleAlly } from "./battle-client";

const FRONT = ["cow", "rabbit"] as const;

export default async function BattlePage() {
  const user = await requireUser();
  const partner = user.memberships[0]?.couple.members.find((m) => m.userId !== user.id)?.user;
  const [mine, theirs] = await Promise.all([
    prisma.pet.findUnique({ where: { userId: user.id } }),
    partner ? prisma.pet.findUnique({ where: { userId: partner.id } }) : null,
  ]);
  const pets = (await Promise.all([settleAndSerialize(mine), settleAndSerialize(theirs)])).filter(
    (pet) => pet !== null,
  );
  const allies: BattleAlly[] = pets
    .map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      hp: pet.rpg.combat.hp,
      atk: pet.rpg.combat.atk,
      def: pet.rpg.combat.def,
      spd: pet.rpg.combat.spd,
      intimacy: pet.intimacy,
      skills: skillsFor(pet.species, pet.level)
        .filter((skill) => !skill.locked)
        .map((skill) => ({
          id: skill.id,
          name: skill.name,
          cost: skill.cost,
          power: skill.power,
          effect: skill.effect,
        })),
    }))
    .toSorted((a, b) => {
      const ai = FRONT.indexOf(a.species as (typeof FRONT)[number]);
      const bi = FRONT.indexOf(b.species as (typeof FRONT)[number]);
      return (ai === -1 ? 9 : ai) - (bi === -1 ? 9 : bi);
    });

  return <BattleClient allies={allies} />;
}
