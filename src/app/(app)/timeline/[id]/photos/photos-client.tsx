"use client";

import { useState, ViewTransition } from "react";
import { ImageLightbox } from "@/components/app/image-lightbox";
import { BackBar } from "../../../me/back-bar";

export function MemoryPhotosClient({
  id,
  title,
  images,
}: {
  id: string;
  title: string;
  images: string[];
}) {
  const [preview, setPreview] = useState<number | null>(null);

  return (
    <div className="px-5 pb-8 pt-6">
      <BackBar title="照片集" href={`/timeline#${id}`} />
      <p className="mb-4 text-sm text-ink-soft">
        {title}
        {images.length > 0 ? ` · ${images.length} 张` : ""}
      </p>
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => {
            const img = (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="aspect-square w-full object-cover" />
            );
            return (
              <button
                key={url}
                type="button"
                className="overflow-hidden"
                aria-label={`查看原图 ${i + 1}`}
                onClick={() => setPreview(i)}
              >
                {i === 0 ? (
                  <ViewTransition name={`memory-${id}`} share="morph" default="none">
                    {img}
                  </ViewTransition>
                ) : (
                  img
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-ink-soft">还没有照片</p>
      )}
      {preview !== null && (
        <ImageLightbox
          urls={images}
          index={preview}
          onClose={() => setPreview(null)}
          onIndex={setPreview}
        />
      )}
    </div>
  );
}
