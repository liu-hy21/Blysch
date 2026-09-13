import { Px } from "@/lib/park/furniture/base";
import { furnitureById } from "@/lib/park/furniture";

/**
 * 家具渲染薄壳:按 id 找到家具对象,调用它的 render()。
 * 家具的外观与元数据由 src/lib/park/furniture/ 下的对象类持有。
 */
export function FurniturePiece({
  id,
  slot,
}: {
  id: string;
  slot?: { top: number | string; left: number | string };
}) {
  const piece = furnitureById(id);
  return (
    <div
      aria-hidden
      className={slot ? "pointer-events-none absolute z-10" : "pointer-events-none"}
      style={slot ? { top: slot.top, left: slot.left } : undefined}
    >
      {piece ? piece.render() : <Px className="h-4 w-4 bg-gold" />}
    </div>
  );
}
