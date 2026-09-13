import type { ReactNode } from "react";
import { FurnitureObject, gridSlot, Iso, pctSlot, Px } from "./base";

/** 兔子的十件家具(数组顺序即解锁顺序,见 index.ts)。 */

export class RabbitLamp extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-lamp",
      name: "胡萝卜灯",
      desc: "一根胡萝卜立灯。",
      scene: "house",
      area: "living",
      slot: gridSlot(34, 50),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex w-5 flex-col items-center">
        <Px className="h-2 w-4 bg-[#ffb347]" />
        <Px className="h-6 w-3 border-t-0 bg-[#e07a3a]" />
        <Px className="h-2 w-4 border-t-0 bg-[#5f6f64]" />
      </div>
    );
  }
}

export class RabbitCushion extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-cushion",
      name: "绒垫",
      desc: "给蹦蹦跳跳歇脚。",
      scene: "house",
      area: "bedroom",
      slot: gridSlot(36, 52),
    });
  }
  render(): ReactNode {
    return <Iso w={40} topH={10} frontH={12} top="#f4b6c4" front="#ee99ac" />;
  }
}

export class RabbitSill extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-sill",
      name: "窗台花",
      desc: "窗边一小盆。",
      scene: "house",
      area: "living",
      slot: gridSlot(46, 16),
    });
  }
  render(): ReactNode {
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
  }
}

export class RabbitTapestry extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-tapestry",
      name: "月夜挂毯",
      desc: "挂在床边墙上。",
      scene: "house",
      area: "bedroom",
      slot: gridSlot(50, 8),
    });
  }
  render(): ReactNode {
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
  }
}

export class RabbitTable extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-table",
      name: "小木桌",
      desc: "刚好放得下一盏灯。",
      scene: "house",
      area: "kitchen",
      slot: gridSlot(8, 32),
    });
  }
  render(): ReactNode {
    return (
      <div>
        <Iso w={48} topH={14} frontH={12} top="#c4a06a" front="#8b6239" />
        <div className="flex justify-between px-1">
          <Px className="h-3 w-2 border-t-0 bg-[#6b4a2a]" />
          <Px className="h-3 w-2 border-t-0 bg-[#6b4a2a]" />
        </div>
      </div>
    );
  }
}

export class RabbitStool extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-stool",
      name: "蘑菇凳",
      desc: "软乎乎的座。",
      scene: "house",
      area: "kitchen",
      slot: gridSlot(6, 40),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex w-8 flex-col items-center">
        <Px className="h-3 w-7 bg-[#d4784a]" />
        <Px className="h-4 w-8 border-t-0 bg-[#b85c38]" />
        <Px className="h-2 w-4 border-t-0 bg-[#6b4a2a]" />
      </div>
    );
  }
}

export class RabbitStar extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-star",
      name: "星灯笼",
      desc: "夜里会亮一格。",
      scene: "house",
      area: "bathroom",
      slot: gridSlot(8, 8),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex w-7 flex-col items-center">
        <Px className="h-2 w-2 bg-[#fff4c8]" />
        <Px className="h-6 w-6 border-t-0 bg-[#e4c36a] shadow-[inset_2px_2px_0_rgba(255,248,220,0.5)]" />
        <Px className="h-2 w-3 border-t-0 bg-[#8c6a45]" />
      </div>
    );
  }
}

export class RabbitChime extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-chime",
      name: "胡萝卜风铃",
      desc: "挂在门边。",
      scene: "yard",
      area: "yard",
      slot: pctSlot("22%", "58%"),
    });
  }
  render(): ReactNode {
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
  }
}

export class RabbitBed extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-bed",
      name: "篱边花圃",
      desc: "篱笆根下的花。",
      scene: "yard",
      area: "yard",
      slot: pctSlot("42%", "10%"),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex items-end gap-0.5">
        <Px className="h-4 w-3 bg-[#8e5a5a]" />
        <Px className="h-6 w-3 bg-[#ee99ac]" />
        <Px className="h-5 w-3 bg-[#78c850]" />
        <Px className="h-3 w-3 bg-[#e4c36a]" />
      </div>
    );
  }
}

export class RabbitSwing extends FurnitureObject {
  constructor() {
    super({
      id: "rabbit-swing",
      name: "月亮秋千",
      desc: "院子角落。",
      scene: "yard",
      area: "yard",
      slot: pctSlot("28%", "8%"),
    });
  }
  render(): ReactNode {
    return (
      <div className="flex w-12 flex-col items-center">
        <div className="flex w-full justify-between">
          <Px className="h-10 w-1.5 bg-[#6b4a2a]" />
          <Px className="h-10 w-1.5 bg-[#6b4a2a]" />
        </div>
        <Px className="-mt-2 h-3 w-12 bg-[#fff8ec]" />
      </div>
    );
  }
}
