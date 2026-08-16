"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { BackBar } from "../back-bar";

export function DaysClient({
  days,
}: {
  days: { id: string; title: string; targetDate: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10));

  async function add() {
    await fetch("/api/days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, targetDate }),
    });
    setOpen(false);
    setTitle("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("删除这个日子？")) return;
    await fetch(`/api/days/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <BackBar title="日子" />
      <Button className="w-full" onClick={() => setOpen(true)}>
        新日子
      </Button>
      <ul className="mt-4 space-y-2">
        {days.map((d) => {
          const remain = differenceInCalendarDays(new Date(d.targetDate), new Date());
          return (
            <li key={d.id} className="pixel-box flex items-center justify-between px-4 py-3">
              <div>
                <p>{d.title}</p>
                <p className="text-xs text-ink-soft">
                  {d.targetDate} · {remain >= 0 ? `还有 ${remain} 天` : `已过 ${-remain} 天`}
                </p>
              </div>
              <button className="text-xs text-rose" onClick={() => remove(d.id)}>
                删除
              </button>
            </li>
          );
        })}
      </ul>
      <Sheet open={open} onClose={() => setOpen(false)} title="新日子">
        <input
          className="pixel-field min-h-11 w-full px-3"
          placeholder="标题…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="pixel-field mt-3 min-h-11 w-full px-3"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
        <Button className="mt-4 w-full" disabled={!title} onClick={add}>
          保存
        </Button>
      </Sheet>
    </div>
  );
}
