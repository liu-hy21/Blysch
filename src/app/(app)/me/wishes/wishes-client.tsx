"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WISH_CATEGORIES, WISH_EFFORTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { EffortSlider } from "@/components/ui/effort-slider";
import { Sheet } from "@/components/ui/sheet";
import { BackBar } from "../back-bar";

type WishItem = {
  id: string;
  title: string;
  category: string;
  status: "PLANNED" | "DONE";
  stars: number;
  note: string | null;
};

export function WishesClient({ wishes }: { wishes: WishItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof WISH_CATEGORIES)[number]>("旅行");
  const [stars, setStars] = useState(3);

  async function add() {
    await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, stars }),
    });
    setOpen(false);
    setTitle("");
    router.refresh();
  }

  async function toggle(w: WishItem) {
    await fetch(`/api/wishes/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: w.status === "DONE" ? "PLANNED" : "DONE" }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("删除这个心愿？")) return;
    await fetch(`/api/wishes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const done = wishes.filter((w) => w.status === "DONE").length;

  return (
    <div className="px-5 pb-8 pt-6">
      <BackBar title="心愿" />
      <p className="text-sm text-ink-soft">
        已完成 {done} / {wishes.length}
      </p>
      <Button className="mt-4 w-full" onClick={() => setOpen(true)}>
        新心愿
      </Button>
      <ul className="mt-4 space-y-2">
        {wishes.map((w) => (
          <li key={w.id} className="pixel-box p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={w.status === "DONE" ? "text-sage line-through" : ""}>{w.title}</p>
                <p className="text-xs text-ink-soft">
                  {w.category} ·{" "}
                  <span
                    className="effort-ink"
                    style={{
                      color:
                        WISH_EFFORTS.find((e) => e.value === w.stars)?.color ??
                        WISH_EFFORTS[2].color,
                    }}
                  >
                    {WISH_EFFORTS.find((e) => e.value === w.stars)?.label ?? "史诗"}
                  </span>
                </p>
              </div>
              <button className="text-xs text-gold-deep" onClick={() => toggle(w)}>
                {w.status === "DONE" ? "未完成" : "完成"}
              </button>
            </div>
            <button className="mt-2 text-xs text-rose" onClick={() => remove(w.id)}>
              删除
            </button>
          </li>
        ))}
      </ul>
      <Sheet open={open} onClose={() => setOpen(false)} title="新心愿">
        <input
          className="pixel-field min-h-11 w-full px-3"
        placeholder="想一起做的事…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="pixel-field mt-3 min-h-11 w-full px-3"
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
        >
          {WISH_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <EffortSlider value={stars} onChange={setStars} />
        <Button className="mt-4 w-full" disabled={!title} onClick={add}>
          保存
        </Button>
      </Sheet>
    </div>
  );
}
