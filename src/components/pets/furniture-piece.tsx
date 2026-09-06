import type { CSSProperties } from "react";

/** Stardew-like 3/4 furniture: lighter top face, darker front, ink outline. */

function Px({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`border-2 border-ink ${className ?? ""}`} style={style} />;
}

function Iso({
  w,
  topH,
  frontH,
  top,
  front,
}: {
  w: number;
  topH: number;
  frontH: number;
  top: string;
  front: string;
}) {
  return (
    <div style={{ width: w }}>
      <Px
        className="box-border"
        style={{
          height: topH,
          background: top,
          boxShadow: "inset 2px 2px 0 rgba(255,248,220,0.35)",
        }}
      />
      <Px
        className="box-border border-t-0"
        style={{
          height: frontH,
          background: front,
          boxShadow: "inset 0 -2px 0 rgba(28,25,23,0.25)",
        }}
      />
    </div>
  );
}

export function FurniturePiece({
  id,
  slot,
}: {
  id: string;
  slot?: { top: number | string; left: number | string };
}) {
  return (
    <div
      aria-hidden
      className={slot ? "pointer-events-none absolute z-10" : "pointer-events-none"}
      style={slot ? { top: slot.top, left: slot.left } : undefined}
    >
      {shape(id)}
    </div>
  );
}

function shape(id: string) {
  switch (id) {
    case "rabbit-lamp":
      return (
        <div className="flex w-5 flex-col items-center">
          <Px className="h-2 w-4 bg-[#ffb347]" />
          <Px className="h-6 w-3 border-t-0 bg-[#e07a3a]" />
          <Px className="h-2 w-4 border-t-0 bg-[#5f6f64]" />
        </div>
      );
    case "rabbit-cushion":
      return (
        <Iso w={40} topH={10} frontH={12} top="#f4b6c4" front="#ee99ac" />
      );
    case "rabbit-sill":
      return (
        <div className="w-8">
          <div className="flex justify-center gap-0.5">
            <Px className="h-3 w-2 bg-[#78c850]" />
            <Px className="h-4 w-2 bg-[#4f9a32]" />
            <Px className="h-3 w-2 bg-[#8fd45a]" />
          </div>
          <Iso w={32} topH={6} frontH={8} top="#c4a06a" front="#8c6a45" />
        </div>
      );
    case "rabbit-tapestry":
      return (
        <div className="w-9">
          <Px className="h-2 w-9 bg-[#c4a06a]" />
          <Px
            className="h-14 w-9 border-t-0"
            style={{
              background:
                "repeating-linear-gradient(#2c3a6e 0 6px, #3d4a78 6px 8px), radial-gradient(circle at 50% 40%, #e4c36a 2px, transparent 3px)",
              backgroundBlendMode: "normal",
              backgroundColor: "#3d4a78",
            }}
          />
        </div>
      );
    case "rabbit-table":
      return (
        <div>
          <Iso w={48} topH={14} frontH={12} top="#c4a06a" front="#8b6239" />
          <div className="flex justify-between px-1">
            <Px className="h-3 w-2 border-t-0 bg-[#6b4a2a]" />
            <Px className="h-3 w-2 border-t-0 bg-[#6b4a2a]" />
          </div>
        </div>
      );
    case "rabbit-stool":
      return (
        <div className="flex w-8 flex-col items-center">
          <Px className="h-3 w-7 bg-[#d4784a]" />
          <Px className="h-4 w-8 border-t-0 bg-[#b85c38]" />
          <Px className="h-2 w-4 border-t-0 bg-[#6b4a2a]" />
        </div>
      );
    case "rabbit-star":
      return (
        <div className="flex w-7 flex-col items-center">
          <Px className="h-2 w-2 bg-[#fff4c8]" />
          <Px className="h-6 w-6 border-t-0 bg-[#e4c36a] shadow-[inset_2px_2px_0_rgba(255,248,220,0.5)]" />
          <Px className="h-2 w-3 border-t-0 bg-[#8c6a45]" />
        </div>
      );
    case "rabbit-chime":
      return (
        <div className="flex w-10 flex-col items-center">
          <Px className="h-1.5 w-10 bg-[#6b4a2a]" />
          <div className="mt-0.5 flex gap-1">
            <Px className="h-5 w-2 bg-[#e07a3a]" />
            <Px className="h-6 w-2 bg-[#ffb347]" />
            <Px className="h-5 w-2 bg-[#e07a3a]" />
          </div>
        </div>
      );
    case "rabbit-bed":
      return (
        <div className="flex items-end gap-0.5">
          <Px className="h-4 w-3 bg-[#8e5a5a]" />
          <Px className="h-6 w-3 bg-[#ee99ac]" />
          <Px className="h-5 w-3 bg-[#78c850]" />
          <Px className="h-3 w-3 bg-[#e4c36a]" />
        </div>
      );
    case "rabbit-swing":
      return (
        <div className="flex w-12 flex-col items-center">
          <div className="flex w-full justify-between">
            <Px className="h-10 w-1.5 bg-[#6b4a2a]" />
            <Px className="h-10 w-1.5 bg-[#6b4a2a]" />
          </div>
          <Px className="-mt-2 h-3 w-12 bg-[#fff8ec]" />
        </div>
      );
    case "cow-can":
      return (
        <div className="w-6">
          <Px className="h-2 w-6 bg-[#e8e8e4]" />
          <Px className="h-8 w-6 border-t-0 bg-[#c4c4c0] shadow-[inset_2px_0_0_rgba(255,255,255,0.35)]" />
          <Px className="h-1.5 w-6 border-t-0 bg-[#8a8a86]" />
        </div>
      );
    case "cow-hay":
      return (
        <Iso w={44} topH={10} frontH={10} top="#ecd07a" front="#e0c068" />
      );
    case "cow-bell":
      return (
        <div className="flex w-5 flex-col items-center">
          <Px className="h-1.5 w-4 bg-[#6b4a2a]" />
          <Px className="h-5 w-5 border-t-0 bg-[#c4a06a]" />
          <Px className="h-2 w-2 border-t-0 bg-[#e4c36a]" />
        </div>
      );
    case "cow-bed":
      return (
        <div className="w-[68px]">
          <Px className="h-3 w-[68px] bg-[#6b4a2a]" />
          <div className="flex">
            <Px className="h-5 w-5 border-t-0 bg-[#fff8ec]" />
            <Px
              className="h-5 flex-1 border-l-0 border-t-0"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #8c6a45 0 6px, #a07840 6px 8px)",
              }}
            />
          </div>
          <Px className="h-8 w-[68px] border-t-0 bg-[#6b4a2a]" />
        </div>
      );
    case "cow-lantern":
      return (
        <div className="flex w-6 flex-col items-center">
          <Px className="h-2 w-5 bg-[#6b4a2a]" />
          <Px className="h-6 w-6 border-t-0 bg-[#ffb347] shadow-[inset_2px_2px_0_rgba(255,248,200,0.55)]" />
          <Px className="h-2 w-4 border-t-0 bg-[#6b4a2a]" />
        </div>
      );
    case "cow-blanket":
      return (
        <Px
          className="h-5 w-11"
          style={{
            background:
              "repeating-linear-gradient(90deg, #efe6d4 0 6px, #d9cbb3 6px 8px)",
          }}
        />
      );
    case "cow-fountain":
      return (
        <div className="flex w-14 flex-col items-center">
          <div className="flex items-end gap-1">
            <Px className="h-1.5 w-1.5 bg-[#7eb3c9]" />
            <Px className="h-1.5 w-1.5 bg-[#f4fcfc]" />
          </div>
          <Px className="h-1.5 w-7 bg-[#e4c36a]" />
          <Px
            className="h-2.5 w-8 border-t-0"
            style={{
              background: "#efe6d4",
              boxShadow: "inset 2px 2px 0 rgba(255,248,220,0.65)",
            }}
          />
          <Px className="h-1.5 w-2.5 border-t-0 bg-[#e8e0d0]" />
          <div className="relative w-14">
            <Iso w={56} topH={6} frontH={10} top="#e8e0d0" front="#c4b49c" />
            <div className="absolute left-2 top-0.5 h-2 w-10 bg-[#6a9bb8]" />
            <div className="absolute left-3 top-1 h-1 w-2 bg-[#f4fcfc]" />
          </div>
        </div>
      );
    case "cow-box":
      return (
        <div className="w-9">
          <div className="flex justify-center gap-0.5">
            <Px className="h-3 w-2 bg-[#78c850]" />
            <Px className="h-4 w-2 bg-[#ee99ac]" />
            <Px className="h-3 w-2 bg-[#8fd45a]" />
          </div>
          <Iso w={36} topH={8} frontH={10} top="#c4a06a" front="#8b6239" />
        </div>
      );
    case "cow-mill":
      return (
        <div className="relative h-10 w-10">
          <Px className="absolute left-1 top-1 h-8 w-8 bg-[#b8a038]" />
          <Px className="absolute left-3 top-3 h-4 w-4 bg-[#8c6a45]" />
        </div>
      );
    case "cow-porch":
      return (
        <div className="flex w-8 flex-col items-center">
          <Px className="h-2 w-8 bg-[#6b4a2a]" />
          <Px className="h-4 w-5 border-t-0 bg-[#c4a06a]" />
        </div>
      );
    default:
      return <Px className="h-4 w-4 bg-gold" />;
  }
}
