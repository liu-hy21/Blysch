import { differenceInCalendarDays, format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HOME_REVEAL_START } from "@/lib/constants";
import { daysTogether, isTogetherRevealed, todayKey } from "@/lib/utils";
import { settleAndSerialize } from "@/lib/pet-settle";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const user = await requireUser();
  const couple = user.memberships[0]?.couple;
  if (!couple) return <p className="p-6">空间未就绪。</p>;
  const partner = couple.members.find((m) => m.userId !== user.id)?.user;
  const date = todayKey();
  const [moods, nextDay, memories, mineRaw, partnerRaw] = await Promise.all([
    prisma.mood.findMany({ where: { coupleId: couple.id, date } }),
    prisma.day.findFirst({
      where: { coupleId: couple.id, targetDate: { gte: new Date() } },
      orderBy: { targetDate: "asc" },
    }),
    prisma.memory.findMany({
      where: { coupleId: couple.id },
      orderBy: { date: "desc" },
      take: 10,
      include: { images: { where: { hidden: false }, take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.pet.findUnique({ where: { userId: user.id } }),
    partner
      ? prisma.pet.findUnique({ where: { userId: partner.id } })
      : Promise.resolve(null),
  ]);

  const remain = nextDay
    ? differenceInCalendarDays(nextDay.targetDate, new Date())
    : null;
  const revealed = isTogetherRevealed(couple.startDate, HOME_REVEAL_START);
  const [minePet, partnerPet] = await Promise.all([
    settleAndSerialize(mineRaw),
    settleAndSerialize(partnerRaw),
  ]);

  return (
    <HomeClient
      coupleId={couple.id}
      me={{ nickname: user.nickname, username: user.username }}
      partner={{
        nickname: partner?.nickname ?? "对方",
        username: partner?.username ?? "",
      }}
      togetherDays={revealed ? daysTogether(couple.startDate) : null}
      startLabel={revealed ? format(couple.startDate, "yyyy.MM.dd", { locale: zhCN }) : null}
      mineMood={moods.find((m) => m.userId === user.id)?.mood ?? null}
      partnerMood={moods.find((m) => m.userId === partner?.id)?.mood ?? null}
      nextDay={
        nextDay
          ? { title: nextDay.title, remain: remain ?? 0 }
          : null
      }
      memories={memories.map((m) => ({
        id: m.id,
        title: m.title,
        cover: m.coverImage ?? m.images[0]?.url ?? null,
      }))}
      minePet={minePet}
      partnerPet={partnerPet}
    />
  );
}
