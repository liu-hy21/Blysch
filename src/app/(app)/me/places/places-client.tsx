"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ImagePicker } from "@/components/app/image-picker";
import { BackBar } from "../back-bar";

type PlaceItem = {
  id: string;
  name: string;
  city: string | null;
  note: string | null;
  images: string[];
};

export function PlacesClient({ places }: { places: PlaceItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);

  async function add() {
    await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city, note, images }),
    });
    setOpen(false);
    setName("");
    setCity("");
    setNote("");
    setImages([]);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("删除这个足迹？")) return;
    await fetch(`/api/places/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <BackBar title="足迹" />
      <Button className="w-full" onClick={() => setOpen(true)}>
        新地点
      </Button>
      <ul className="mt-4 grid grid-cols-2 gap-3">
        {places.map((p) => (
          <li key={p.id} className="pixel-box overflow-hidden">
            {p.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.images[0]} alt="" className="aspect-square w-full object-cover" />
            ) : (
              <div className="aspect-square bg-bg" />
            )}
            <div className="border-t-2 border-ink p-2">
              <p className="truncate text-sm">{p.name}</p>
              <p className="truncate text-[11px] text-ink-soft">{p.city}</p>
              {p.note && (
                <p className="mt-1 line-clamp-2 text-[11px] text-ink-soft">{p.note}</p>
              )}
              <button className="mt-1 text-[11px] text-rose" onClick={() => remove(p.id)}>
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Sheet open={open} onClose={() => setOpen(false)} title="新地点">
        <input
          className="pixel-field min-h-11 w-full px-3"
          placeholder="地点名…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="pixel-field mt-3 min-h-11 w-full px-3"
          placeholder="城市…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <textarea
          className="pixel-field mt-3 min-h-20 w-full px-3 py-2"
          placeholder="备注…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-3">
          <ImagePicker value={images} onChange={setImages} />
        </div>
        <Button className="mt-4 w-full" disabled={!name} onClick={add}>
          保存
        </Button>
      </Sheet>
    </div>
  );
}
