import type { ReactNode } from "react";
import { FurnitureObject, gridSlot, Iso, pctSlot, Px } from "./base";

/** 牛的十件家具(数组顺序即解锁顺序,见 index.ts)。 */

export class CowCan extends FurnitureObject {
  constructor() {
    super({
      id: "cow-can",
      name: "牛奶罐",
      desc: "铁皮罐,沉甸甸。",
      scene: "house",
      area: "kitchen",
      slot: gridSlot(19, 14),
    });
  }
  render(): ReactNode {
    return (
      <div className="w-6">
        <Px className="h-2 w-6 bg-[#e8e8e4]" />
        <Px className="h-8 w-6 border-t-0 bg-[#c4c4c0] shadow-[inset_2px_0_0_rgba(255,255,255,0.35)]" />
        <Px className="h-1.5 w-6 border-t-0 bg-[#8a8a86]" />
      </div>
    );
  }
}

export class CowHay extends FurnitureObject {
  constructor() {
    super({
      id: "cow-hay",
      name: "干草垫",
      desc: "睡上去沙沙响。",
      scene: "house",
      area: "bedroom",
      slot: gridSlot(34, 56),
    });
  }
  render(): ReactNode {
    return <Iso w={44} topH={10} frontH={10} top="#ecd07a" front="#e0c068" />;
  }
}

export class CowBell extends FurnitureObject {
  constructor() {
    super({
      id: "cow-bell",
      name: "铃铛挂饰",
      desc: "轻轻一碰会响。",
      scene: "house",
      area: "living",
      slot: gridSlot(30, 8),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex w-5 flex-col items-center">
        <Px className="h-1.5 w-4 bg-[#6b4a2a]" />
        <Px className="h-5 w-5 border-t-0 bg-[#c4a06a]" />
        <Px className="h-2 w-2 border-t-0 bg-[#e4c36a]" />
      </div>
    );
  }
}

export class CowBed extends FurnitureObject {
  constructor() {
    super({
      id: "cow-bed",
      name: "厚实木床",
      desc: "占卧室主位。",
      scene: "house",
      area: "bedroom",
      slot: gridSlot(38, 44),
    });
  }
  render(): ReactNode {
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
  }
}

export class CowLantern extends FurnitureObject {
  constructor() {
    super({
      id: "cow-lantern",
      name: "谷仓灯",
      desc: "暖黄一盏。",
      scene: "house",
      area: "living",
      slot: gridSlot(36, 40),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex w-6 flex-col items-center">
        <Px className="h-2 w-5 bg-[#6b4a2a]" />
        <Px className="h-6 w-6 border-t-0 bg-[#ffb347] shadow-[inset_2px_2px_0_rgba(255,248,200,0.55)]" />
        <Px className="h-2 w-4 border-t-0 bg-[#6b4a2a]" />
      </div>
    );
  }
}

export class CowBlanket extends FurnitureObject {
  constructor() {
    super({
      id: "cow-blanket",
      name: "羊毛毯",
      desc: "搭在床尾。",
      scene: "house",
      area: "bedroom",
      slot: gridSlot(40, 60),
    });
  }
  render(): ReactNode {
    return (
      <Px
        className="h-5 w-11"
        style={{
          background:
            "repeating-linear-gradient(90deg, #efe6d4 0 6px, #d9cbb3 6px 8px)",
        }}
      />
    );
  }
}

export class CowFountain extends FurnitureObject {
  constructor() {
    super({
      id: "cow-fountain",
      name: "汉白玉喷泉",
      desc: "双层白石,水面会亮。",
      scene: "yard",
      area: "yard",
      slot: pctSlot("74%", "28%"),
    });
  }
  render(): ReactNode {
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
  }
}

export class CowBox extends FurnitureObject {
  constructor() {
    super({
      id: "cow-box",
      name: "栅栏花箱",
      desc: "钉在篱笆上。",
      scene: "yard",
      area: "yard",
      slot: pctSlot("18%", "72%"),
    });
  }
  render(): ReactNode {
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
  }
}

export class CowMill extends FurnitureObject {
  constructor() {
    super({
      id: "cow-mill",
      name: "石磨小景",
      desc: "角落一盘石。",
      scene: "yard",
      area: "yard",
      slot: pctSlot("78%", "58%"),
    });
  }
  render(): ReactNode {
    return (
      <div className="relative h-10 w-10">
        <Px className="absolute left-1 top-1 h-8 w-8 bg-[#b8a038]" />
        <Px className="absolute left-3 top-3 h-4 w-4 bg-[#8c6a45]" />
      </div>
    );
  }
}

export class CowPorch extends FurnitureObject {
  constructor() {
    super({
      id: "cow-porch",
      name: "铜铃门廊",
      desc: "门楣上的铜铃。",
      scene: "yard",
      area: "yard",
      slot: pctSlot("16%", "46%"),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex w-8 flex-col items-center">
        <Px className="h-2 w-8 bg-[#6b4a2a]" />
        <Px className="h-4 w-5 border-t-0 bg-[#c4a06a]" />
      </div>
    );
  }
}
