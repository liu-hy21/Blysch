import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHOW_TOGETHER_UI } from "@/lib/constants";
import { daysTogether } from "@/lib/utils";
import { ChevronRight, ListChecks, MapPin, CalendarHeart, UserRound } from "lucide-react";

const links = [
  { href: "/me/wishes", label: "心愿", desc: "一起想做的事", icon: ListChecks },
  { href: "/me/places", label: "足迹", desc: "去过的地方", icon: MapPin },
  { href: "/me/days", label: "日子", desc: "重要的日期", icon: CalendarHeart },
  { href: "/me/profile", label: "我", desc: SHOW_TOGETHER_UI ? "昵称与起始日" : "昵称与头像", icon: UserRound },
];

export default async function MePage() {
  const user = await requireUser();
  const couple = user.memberships[0]?.couple;
  const memoryCount = couple
    ? await prisma.memory.count({ where: { coupleId: couple.id } })
    : 0;
  return (
    <div className="px-5 pb-8 pt-6">
      <h1 className="text-2xl">我的</h1>
      <section className="pixel-box mt-5 p-4">
        <p className="text-xl">{user.nickname}</p>
        <p className="text-xs text-ink-soft">{user.username}</p>
        <p className="mt-3 text-sm text-ink-soft">
          {SHOW_TOGETHER_UI
            ? `在一起 ${couple ? daysTogether(couple.startDate) : 0} 天 · 回忆 ${memoryCount}`
            : `回忆 ${memoryCount}`}
        </p>
      </section>
      <ul className="mt-4 space-y-2">
        {links.map(({ href, label, desc, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              transitionTypes={["nav-forward"]}
              className="pixel-box flex min-h-14 items-center gap-3 px-4"
            >
              <Icon className="h-4 w-4 text-gold-deep" aria-hidden />
              <span className="flex-1">
                <span className="block text-sm">{label}</span>
                <span className="text-xs text-ink-soft">{desc}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-ink-soft" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
