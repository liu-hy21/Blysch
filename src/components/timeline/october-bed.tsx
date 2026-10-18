import { PixelPet } from "@/components/pets/pixel-pet";

/** 排在现有回忆之上；更新的日期会排到它前面 */
export const OCTOBER_MEMORY_DATE = "2026-10-18";

/** 按日期插入。同一天的真实回忆在它前面；还没加载到这个位置时先不放。 */
export function octoberMemoryIndex(dates: string[], hasMore: boolean) {
  const older = dates.findIndex((date) => date < OCTOBER_MEMORY_DATE);
  if (older >= 0) return older;
  if (hasMore) return -1;
  return dates.length;
}

export function OctoberMemory() {
  return (
    <li className="pixel-box p-4">
      <h2 className="text-lg">魔幻的10月</h2>
      <div className="oct-bed mt-3" role="img" aria-label="小兔子和大牛子睡在左右相对的两张床上">
        <div className="home-bond-scene" aria-hidden>
          <Px className="oct-wall" t={0} l={0} r={0} b={12} />
          <span className="oct-win" />
          <Px className="oct-moon" t={12} w={10} h={10} />
          <Px className="oct-spark" t={10} l={14} w={4} h={4} />
          <Px className="oct-spark is-pink" t={18} l={28} w={4} h={4} />
          <Px className="oct-spark" t={8} r={16} w={4} h={4} />
          <Px className="oct-spark is-pink" t={20} r={30} w={4} h={4} />
          <span className="oct-lamp" />
          <span className="oct-twin is-left">
            <span className="oct-head" />
            <span className="oct-frame" />
            <span className="oct-sheet" />
            <span className="oct-pillow" />
          </span>
          <span className="oct-twin is-right">
            <span className="oct-head" />
            <span className="oct-frame" />
            <span className="oct-sheet" />
            <span className="oct-pillow" />
          </span>
          <Px className="oct-floor" b={0} l={0} r={0} h={12} />
        </div>
        <div className="oct-bed-pets" aria-hidden>
          <span className="oct-bed-pet is-rabbit">
            <PixelPet species="rabbit" mood="content" scale={2} label="小兔子" />
          </span>
          <span className="oct-bed-pet is-cow">
            <PixelPet species="cow" mood="content" scale={2} label="大牛子" />
          </span>
        </div>
        <span className="oct-blanket is-left" aria-hidden />
        <span className="oct-blanket is-right" aria-hidden />
      </div>
    </li>
  );
}

function Px({
  className,
  t,
  l,
  r,
  b,
  w,
  h,
}: {
  className: string;
  t?: number;
  l?: number;
  r?: number;
  b?: number;
  w?: number;
  h?: number;
}) {
  return (
    <span
      className={`home-bond-px ${className}`}
      style={{ top: t, left: l, right: r, bottom: b, width: w, height: h }}
    />
  );
}
