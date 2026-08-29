"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { WISH_CATEGORIES, WISH_EFFORTS, WISH_REGIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PixelSelect } from "@/components/ui/pixel-select";
import { EffortSlider } from "@/components/ui/effort-slider";
import { Sheet } from "@/components/ui/sheet";
import { BackBar } from "../back-bar";

type WishCategory = (typeof WISH_CATEGORIES)[number];
type WishRegion = (typeof WISH_REGIONS)[number];

type WishItem = {
  id: string;
  title: string;
  category: string;
  region: string | null;
  status: "PLANNED" | "DONE";
  stars: number;
  note: string | null;
};

function effortOf(stars: number) {
  return WISH_EFFORTS.find((e) => e.value === stars) ?? WISH_EFFORTS[2];
}

function splitTitle(title: string) {
  const i = title.indexOf(" ");
  if (i <= 0) return { lead: title, rest: "" };
  return { lead: title.slice(0, i), rest: title.slice(i + 1) };
}

function WishCard({
  wish,
  onEdit,
}: {
  wish: WishItem;
  onEdit: (wish: WishItem) => void;
}) {
  const effort = effortOf(wish.stars);
  const { lead, rest } = splitTitle(wish.title);
  const done = wish.status === "DONE";
  const legend = wish.stars === 5;
  const rail = wish.stars === 1 ? "var(--ink)" : effort.color;

  return (
    <li className="wish-item">
      <button
        type="button"
        aria-label={`编辑心愿 ${wish.title}`}
        onClick={() => onEdit(wish)}
        className={`wish-card pixel-box flex w-full cursor-pointer overflow-hidden p-0 text-left ${
          legend ? "is-legend" : ""
        } ${done ? "is-done" : ""}`}
      >
          <span className="w-1.5 shrink-0 self-stretch" style={{ background: rail }} aria-hidden />
          <span className="min-w-0 flex-1 px-4 py-3">
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span
                  className={`block text-pretty text-base ${done ? "text-sage line-through" : ""}`}
                >
                  {lead}
                </span>
                {rest ? (
                  <span className="mt-0.5 block wrap-break-word text-xs leading-5 text-ink-soft">
                    {rest}
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 flex shrink-0 gap-0.5" aria-hidden>
                {WISH_EFFORTS.map((e) => (
                  <span
                    key={e.value}
                    className="block h-1.5 w-1.5 border border-ink"
                    style={{
                      background: e.value <= wish.stars ? effort.color : "transparent",
                    }}
                  />
                ))}
              </span>
            </span>
            <span className="mt-2 block text-[11px]">
              <span className="effort-ink" style={{ color: effort.color }}>
                {effort.label}
              </span>
            </span>
          </span>
      </button>
    </li>
  );
}

export function WishesClient({ wishes }: { wishes: WishItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<WishCategory>("旅行");
  const [regionFilter, setRegionFilter] = useState<WishRegion>("国内");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WishItem | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WishCategory>("旅行");
  const [region, setRegion] = useState<WishRegion>("国内");
  const [stars, setStars] = useState(3);
  const [error, setError] = useState("");

  const list = useMemo(() => {
    return wishes.filter((w) => {
      if (w.category !== filter) return false;
      if (filter === "旅行" && w.region !== regionFilter) return false;
      return true;
    });
  }, [wishes, filter, regionFilter]);

  function startCreate() {
    setEditing(null);
    setTitle("");
    setCategory("旅行");
    setRegion("国内");
    setStars(3);
    setError("");
    setOpen(true);
  }

  function startEdit(w: WishItem) {
    setEditing(w);
    setTitle(w.title);
    setCategory(
      (WISH_CATEGORIES as readonly string[]).includes(w.category)
        ? (w.category as WishCategory)
        : "知识",
    );
    setRegion(w.region === "国外" ? "国外" : "国内");
    setStars(w.stars);
    setError("");
    setOpen(true);
  }

  function save() {
    const payload = {
      title,
      category,
      region: category === "旅行" ? region : null,
      stars,
    };
    setError("");
    startTransition(async () => {
      const res = await fetch(editing ? `/api/wishes/${editing.id}` : "/api/wishes", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("没保存上，再试一次");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const filterCaption = filter === "旅行" ? `${filter} · ${regionFilter}` : filter;

  return (
    <div className="px-5 pb-8 pt-6">
      <div className="relative">
        <BackBar title="心愿" />
        <button
          type="button"
          onClick={startCreate}
          className="absolute top-0 right-0 flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-ink bg-gold shadow-[3px_3px_0_var(--ink)] transition-[transform,box-shadow] duration-150 ease-out hover:bg-[#d4b07a] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          aria-label="新心愿"
        >
          <Plus className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <section className="pixel-box flex items-stretch">
        <div className="flex-1 px-4 py-3">
          <p className="text-[11px] text-ink-soft">心愿</p>
          <p className="mt-1 text-2xl leading-none tabular-nums">{list.length}</p>
        </div>
        <div className="w-0.5 self-stretch bg-ink" aria-hidden />
        <div className="min-w-0 flex-1 px-4 py-3">
          <p className="text-[11px] text-ink-soft">筛选</p>
          <p className="mt-1 truncate text-sm">{filterCaption}</p>
        </div>
      </section>

      <div className="pixel-box mt-3 p-2">
        <div role="toolbar" aria-label="心愿分类" className="grid grid-cols-3 gap-2">
          {WISH_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => {
                setFilter(c);
                if (c === "旅行") setRegionFilter("国内");
              }}
              className={`pixel-chip min-h-11 text-xs ${
                filter === c ? "is-on" : "text-ink-soft"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {filter === "旅行" ? (
          <div role="toolbar" aria-label="旅行范围" className="mt-2 grid grid-cols-2 gap-2">
            {WISH_REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={regionFilter === r}
                onClick={() => setRegionFilter(r)}
                className={`pixel-chip min-h-11 text-xs ${
                  regionFilter === r ? "is-on" : "text-ink-soft"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {list.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {list.map((w) => (
            <WishCard key={w.id} wish={w} onEdit={startEdit} />
          ))}
        </ul>
      ) : (
        <div className="pixel-box mt-4 px-4 py-10 text-center">
          <p>这一格还空着</p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">记下想一起做的事</p>
          <Button className="mt-4" onClick={startCreate}>
            新心愿
          </Button>
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? "编辑心愿" : "新心愿"}>
        <label className="block">
          <span className="mb-1 block text-sm">想一起做的事</span>
          <input
            name="title"
            autoComplete="off"
            className="pixel-field min-h-11 w-full px-3"
            placeholder="例如：云南 大理…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <PixelSelect
          className="mt-3"
          label="分类"
          value={category}
          onChange={(v) => setCategory(v as WishCategory)}
          options={WISH_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        {category === "旅行" ? (
          <PixelSelect
            className="mt-3"
            label="范围"
            value={region}
            onChange={(v) => setRegion(v as WishRegion)}
            options={WISH_REGIONS.map((r) => ({ value: r, label: r }))}
          />
        ) : null}
        <EffortSlider value={stars} onChange={setStars} />
        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="mt-4 w-full" disabled={!title || pending} onClick={save}>
          {pending ? "保存中…" : "保存心愿"}
        </Button>
      </Sheet>
    </div>
  );
}
