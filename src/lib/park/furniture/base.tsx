import type { CSSProperties, ReactNode } from "react";
import { dreamPx } from "../../dream-grid";
import type {
  DreamRoom,
  DreamScene,
  FurnitureSlot,
} from "../../dream-furniture";

/**
 * 解锁家具对象模型:每件家具都是一个对象。
 *
 * 家具类自己持有两样东西:
 * - meta:图鉴元数据(id / 名字 / 描述 / 所在场景 / 所在区域 / 摆放插槽)
 * - render():外观(JSX,Stardew 式 3/4 视角:亮顶面、暗正面、墨线描边)
 *
 * dream-furniture.ts 的目录与解锁逻辑从注册表派生纯数据(可序列化),
 * 渲染侧由 FurniturePiece 按 id 找到对象并调用 render()。
 *
 * 新增一件家具的步骤:
 *   1. 在 rabbit.tsx / cow.tsx(或新物种文件)里继承 FurnitureObject;
 *   2. 构造时传入 meta,实现 render();
 *   3. 在 index.ts 的注册表里 new 一个(数组顺序即解锁顺序)。
 */

/** 网格坐标转插槽位置。 */
export function gridSlot(c: number, r: number): FurnitureSlot {
  const { top, left } = dreamPx(c, r);
  return { top, left };
}

/** 百分比插槽(院子里不按网格摆放的家具)。 */
export function pctSlot(top: string, left: string): FurnitureSlot {
  return { top, left };
}

/** 图鉴元数据(纯数据,可序列化跨服务器/客户端边界)。 */
export type FurnitureMeta = {
  id: string;
  name: string;
  desc: string;
  scene: DreamScene;
  area: DreamRoom;
  slot: FurnitureSlot;
};

/** 墨线像素块。 */
export function Px({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`border-2 border-ink ${className ?? ""}`} style={style} />;
}

/** 3/4 视角方块:亮顶面 + 暗正面。 */
export function Iso({
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

export abstract class FurnitureObject {
  constructor(public readonly meta: FurnitureMeta) {}

  get id(): string {
    return this.meta.id;
  }

  /** 纯数据形式(目录/解锁用)。 */
  def(): FurnitureMeta {
    return this.meta;
  }

  /** 外观。 */
  abstract render(): ReactNode;
}
