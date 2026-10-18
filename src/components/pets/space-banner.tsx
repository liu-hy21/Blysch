import { PixelPet } from "@/components/pets/pixel-pet";

export function SpaceBanner() {
  return (
    <section className="pixel-box">
      <div className="home-space" role="img" aria-label="大牛子和小兔子在星空中乘坐太空飞船">
        <span className="home-space-world" aria-hidden>
          <span className="home-space-ring" />
          <span className="home-space-planet" />
          <span className="home-space-ring is-front" />
        </span>
        <span className="home-space-planet is-far" aria-hidden />
        {STARS.map((star) => (
          <span
            key={`${star.t}-${star.l ?? star.r}`}
            className={`home-space-star${star.dim ? " is-dim" : ""}${star.pink ? " is-pink" : ""}`}
            style={{ top: star.t, left: star.l, right: star.r }}
            aria-hidden
          />
        ))}
        <div className="home-space-saucer" aria-hidden>
          <div className="home-space-dome">
            <span className="home-space-pet is-rabbit">
              <PixelPet species="rabbit" mood="content" scale={2} label="小兔子" />
            </span>
            <span className="home-space-pet is-cow">
              <PixelPet species="cow" mood="content" scale={2} label="大牛子" />
            </span>
          </div>
          <span className="home-space-disc">
            <span className="home-space-seam is-a" />
            <span className="home-space-seam is-b" />
            <span className="home-space-rivet is-a" />
            <span className="home-space-rivet is-b" />
            <span className="home-space-rivet is-c" />
            <span className="home-space-rivet is-d" />
          </span>
          <span className="home-space-rim" />
          <span className="home-space-port" />
          <span className="home-space-turret is-l" />
          <span className="home-space-turret is-r" />
          <span className="home-space-light is-a" />
          <span className="home-space-light is-b" />
          <span className="home-space-light is-c" />
        </div>
      </div>
      <div className="flex items-center justify-around border-t-2 border-ink px-2 py-2">
        <span className="text-[11px] text-ink-soft">小兔子</span>
        <span className="text-[11px] text-gold-deep">万有引力号</span>
        <span className="text-[11px] text-ink-soft">大牛子</span>
      </div>
    </section>
  );
}

const STARS = [
  { t: 14, l: 18 },
  { t: 28, l: 42, dim: true },
  { t: 12, l: 78, pink: true },
  { t: 36, l: 96 },
  { t: 48, l: 158 },
  { t: 64, l: 188, dim: true },
  { t: 40, l: 212, pink: true },
  { t: 78, l: 172 },
  { t: 56, l: 236, dim: true },
  { t: 18, r: 86, dim: true },
  { t: 44, r: 64, pink: true },
  { t: 16, r: 28 },
  { t: 52, l: 16, dim: true },
  { t: 64, r: 22, pink: true },
  { t: 78, l: 28 },
] as const;
