"use client";

import { useMemo, useState, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { MEMORY_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ImagePicker } from "@/components/app/image-picker";
import { ImageLightbox } from "@/components/app/image-lightbox";

type MemoryItem = {
  id: string;
  title: string;
  content: string | null;
  category: string;
  date: string;
  images: string[];
  author: string;
  placeId: string | null;
  placeName: string | null;
};

export function TimelineClient({
  memories,
  places,
}: {
  memories: MemoryItem[];
  places: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("全部");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MemoryItem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<(typeof MEMORY_CATEGORIES)[number]>("旅行");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [placeId, setPlaceId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ urls: string[]; index: number } | null>(null);

  const list = useMemo(
    () => (filter === "全部" ? memories : memories.filter((m) => m.category === filter)),
    [filter, memories],
  );

  function startCreate() {
    setEditing(null);
    setTitle("");
    setContent("");
    setCategory("旅行");
    setDate(new Date().toISOString().slice(0, 10));
    setPlaceId("");
    setImages([]);
    setOpen(true);
  }

  function startEdit(m: MemoryItem) {
    setEditing(m);
    setTitle(m.title);
    setContent(m.content ?? "");
    setCategory(
      (MEMORY_CATEGORIES as readonly string[]).includes(m.category)
        ? (m.category as typeof category)
        : "其他",
    );
    setDate(m.date);
    setPlaceId(m.placeId ?? "");
    setImages(m.images);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    const payload = { title, content, category, date, placeId: placeId || null, images };
    const res = await fetch(editing ? `/api/memories/${editing.id}` : "/api/memories", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) return;
    setOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("删除这条回忆？")) return;
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">时间轴</h1>
        <button
          onClick={startCreate}
          className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-card shadow-[3px_3px_0_var(--ink)]"
          aria-label="新增回忆"
        >
          <Plus className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto text-xs">
        {["全部", ...MEMORY_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
            className={`pixel-chip min-h-9 shrink-0 px-3 ${
              filter === c ? "is-on" : "text-ink-soft"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="space-y-4">
        {list.map((m) => (
          <li id={m.id} key={m.id} className="pixel-box p-4">
            <p className="text-xs text-ink-soft">
              {m.date} · {m.category} · {m.author}
              {m.placeName ? ` · ${m.placeName}` : ""}
            </p>
            <h2 className="mt-1 text-lg">{m.title}</h2>
            {m.content && <p className="mt-2 text-sm leading-6 text-ink-soft">{m.content}</p>}
            {m.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {m.images.map((url, i) => {
                  const img = (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="aspect-square w-full object-cover" />
                  );
                  const thumb =
                    i === 0 ? (
                      <ViewTransition name={`memory-${m.id}`} share="morph" default="none">
                        {img}
                      </ViewTransition>
                    ) : (
                      img
                    );
                  return (
                    <button
                      key={url}
                      type="button"
                      className="overflow-hidden"
                      aria-label={`查看原图 ${i + 1}`}
                      onClick={() => setPreview({ urls: m.images, index: i })}
                    >
                      {thumb}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-3 flex gap-3 text-xs text-gold-deep">
              <button onClick={() => startEdit(m)}>编辑</button>
              <button onClick={() => remove(m.id)}>删除</button>
            </div>
          </li>
        ))}
      </ul>
      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? "编辑回忆" : "新的回忆"}>
        <div className="space-y-3">
          <input
            className="pixel-field min-h-11 w-full px-3"
            placeholder="标题…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            className="pixel-field min-h-11 w-full px-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            className="pixel-field min-h-11 w-full px-3"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
          >
            {MEMORY_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className="pixel-field min-h-11 w-full px-3"
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
          >
            <option value="">不关联地点</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <textarea
            className="pixel-field min-h-24 w-full px-3 py-2"
            placeholder="发生了什么…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <ImagePicker value={images} onChange={setImages} />
          <Button className="w-full" disabled={busy || !title} onClick={save}>
            保存
          </Button>
        </div>
      </Sheet>
      {preview && (
        <ImageLightbox
          urls={preview.urls}
          index={preview.index}
          onClose={() => setPreview(null)}
          onIndex={(i) => setPreview((p) => (p ? { ...p, index: i } : p))}
        />
      )}
    </div>
  );
}
