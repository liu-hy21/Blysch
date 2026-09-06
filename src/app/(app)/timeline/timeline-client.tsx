"use client";

import { useEffect, useRef, useState, ViewTransition } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MEMORY_CATEGORIES, MEMORY_IMAGE_MAX, MEMORY_IMAGE_PREVIEW } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PixelSelect } from "@/components/ui/pixel-select";
import { Sheet } from "@/components/ui/sheet";
import { ImagePicker } from "@/components/app/image-picker";
import { ImageLightbox } from "@/components/app/image-lightbox";
import { mergeMemoryPages, type MemoryCard } from "@/lib/memory-paging";
import { todayKey } from "@/lib/utils";

type PagePayload = {
  memories: MemoryCard[];
  total: number;
  page: number;
  pageCount: number;
};

export function TimelineClient({
  initial,
  places,
}: {
  initial: PagePayload;
  places: { id: string; name: string }[];
}) {
  const [filter, setFilter] = useState("全部");
  const [page, setPage] = useState(initial.page);
  const [total, setTotal] = useState(initial.total);
  const [list, setList] = useState(initial.memories);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MemoryCard | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<(typeof MEMORY_CATEGORIES)[number]>("旅行");
  const [date, setDate] = useState(() => todayKey());
  const [placeId, setPlaceId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [preview, setPreview] = useState<{ urls: string[]; index: number } | null>(null);
  const aroundDone = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);
  const loadingMoreRef = useRef(false);
  const pageRef = useRef(page);
  const totalRef = useRef(total);
  const filterRef = useRef(filter);
  const listLenRef = useRef(list.length);

  pageRef.current = page;
  totalRef.current = total;
  filterRef.current = filter;
  listLenRef.current = list.length;

  const hasMore = list.length < total;

  async function fetchPage(opts: {
    page: number;
    filter: string;
    around?: string;
    through?: boolean;
    append?: boolean;
  }) {
    if (opts.append) {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }
    const id = opts.append ? reqId.current : ++reqId.current;
    const params = new URLSearchParams({
      page: String(opts.page),
      category: opts.filter,
    });
    if (opts.around) params.set("around", opts.around);
    if (opts.through) params.set("through", "1");
    try {
      const res = await fetch(`/api/memories?${params}`);
      const data = (await res.json()) as PagePayload & { error?: string };
      if (!res.ok || id !== reqId.current) return;
      setFilter(opts.filter);
      setPage(data.page);
      setList((prev) => {
        const next = opts.append ? mergeMemoryPages(prev, data.memories) : data.memories;
        if (opts.append && next.length === prev.length) {
          setTotal(prev.length);
        } else {
          setTotal(data.total);
        }
        return next;
      });
    } finally {
      if (opts.append) {
        loadingMoreRef.current = false;
        if (id === reqId.current) setLoadingMore(false);
      }
    }
  }

  async function loadMore() {
    if (listLenRef.current >= totalRef.current) return;
    await fetchPage({
      page: pageRef.current + 1,
      filter: filterRef.current,
      append: true,
    });
  }

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const around = window.location.hash.slice(1);
    if (!around || aroundDone.current) return;
    aroundDone.current = true;
    void fetchPage({ page: 0, filter: "全部", around }).then(() => {
      document.getElementById(around)?.scrollIntoView({ block: "start" });
    });
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    const root = document.getElementById("main");
    if (!el || !root || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        void loadMoreRef.current();
      },
      { root, rootMargin: "160px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, filter, list.length]);

  function startCreate() {
    setEditing(null);
    setTitle("");
    setContent("");
    setCategory("旅行");
    setDate(todayKey());
    setPlaceId("");
    setImages([]);
    setOpen(true);
  }

  async function startEdit(m: MemoryCard) {
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
    const res = await fetch(`/api/memories/${m.id}`);
    if (!res.ok) return;
    const full = (await res.json()) as { images?: string[]; content?: string | null };
    setImages(full.images ?? m.images);
    if (full.content !== undefined) setContent(full.content ?? "");
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
    await fetchPage({
      page: editing ? page : 0,
      filter,
      through: Boolean(editing),
    });
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
            onClick={() => {
              if (c === filter) return;
              void fetchPage({ page: 0, filter: c });
            }}
            className={`pixel-chip min-h-9 shrink-0 px-3 ${
              filter === c ? "is-on" : "text-ink-soft"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-ink-soft">还没有回忆</p>
      ) : (
        <ul className="space-y-4">
          {list.map((m) => (
            <li id={m.id} key={m.id} className="pixel-box p-4">
              <p className="text-xs text-ink-soft">
                {m.category}
                {m.placeName ? ` · ${m.placeName}` : ""}
              </p>
              <h2 className="mt-1 text-lg">{m.title}</h2>
              {m.content ? <p className="mt-2 text-sm leading-6 text-ink-soft">{m.content}</p> : null}
              {m.images.length > 0 ? (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {m.images.slice(0, MEMORY_IMAGE_PREVIEW).map((url, i) => {
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
                          onClick={() =>
                            setPreview({
                              urls: m.images.slice(0, MEMORY_IMAGE_PREVIEW),
                              index: i,
                            })
                          }
                        >
                          {thumb}
                        </button>
                      );
                    })}
                  </div>
                  {m.imageCount > MEMORY_IMAGE_PREVIEW ? (
                    <Link
                      href={`/timeline/${m.id}/photos`}
                      transitionTypes={["nav-forward"]}
                      className="mt-2 inline-block text-xs text-ink-soft"
                    >
                      查看更多
                    </Link>
                  ) : null}
                </>
              ) : null}
              <div className="mt-3 flex gap-3 text-xs text-gold-deep">
                <button type="button" onClick={() => void startEdit(m)}>
                  编辑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore ? (
        <div ref={sentinelRef} className="pt-4 text-center text-xs text-ink-soft">
          {loadingMore ? "加载中…" : null}
        </div>
      ) : null}
      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? "编辑回忆" : "新的回忆"}>
        <div className="space-y-3">
          <input
            className="pixel-field min-h-11 w-full px-3"
            placeholder="标题…"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <PixelSelect
            label="分类"
            value={category}
            onChange={(v) => setCategory(v as typeof category)}
            options={MEMORY_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <PixelSelect
            label="地点"
            value={placeId}
            onChange={setPlaceId}
            options={[
              { value: "", label: "不关联地点" },
              ...places.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
          <textarea
            className="pixel-field min-h-24 w-full px-3 py-2"
            placeholder="发生了什么…"
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
          />
          <ImagePicker value={images} onChange={setImages} max={MEMORY_IMAGE_MAX} />
          <Button className="w-full" disabled={busy || !title} onClick={() => void save()}>
            保存
          </Button>
        </div>
      </Sheet>
      {preview ? (
        <ImageLightbox
          urls={preview.urls}
          index={preview.index}
          onClose={() => setPreview(null)}
          onIndex={(i) => setPreview((p) => (p ? { ...p, index: i } : p))}
        />
      ) : null}
    </div>
  );
}
