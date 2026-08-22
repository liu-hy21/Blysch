function Flower({ top, left, color }: { top: string; left: string; color: string }) {
  return (
    <div className="pointer-events-none absolute z-[6]" style={{ top, left }} aria-hidden>
      <div className="h-2 w-2 border-2 border-ink" style={{ background: color }} />
      <div className="mx-auto h-2 w-1 bg-[#2f6a22]" />
    </div>
  );
}

function Tree({ top, left, scale = 1 }: { top: string; left: string; scale?: number }) {
  return (
    <div
      className="pointer-events-none absolute z-[9]"
      style={{ top, left, transform: `scale(${scale})`, transformOrigin: "bottom center" }}
      aria-hidden
    >
      <div className="relative h-16 w-16">
        <div className="absolute left-4 top-0 h-10 w-10 border-2 border-ink bg-[#2f6a22]" />
        <div className="absolute left-1 top-3 h-9 w-9 border-2 border-ink bg-[#3d7a28]" />
        <div className="absolute left-7 top-2 h-8 w-8 border-2 border-ink bg-[#5a9a38]" />
        <div className="absolute left-6 top-1 h-3 w-3 bg-[#8fd45a]" />
        <div className="absolute bottom-0 left-1/2 h-7 w-3 -translate-x-1/2 border-2 border-ink bg-[#6b4a2a]" />
      </div>
    </div>
  );
}

export function YardScenery() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="dream-fence-h absolute inset-x-0 top-0" />
      <div className="dream-fence-h absolute inset-x-0 bottom-0" />
      <div className="dream-fence-v absolute inset-y-0 left-0" />
      <div className="dream-fence-v absolute inset-y-0 right-0" />

      <div className="dream-grass-patch absolute left-[26%] top-[40%] h-[12%] w-[48%]" />
      <div className="dream-grass-patch absolute left-[8%] top-[18%] h-[14%] w-[16%]" />
      <div className="dream-grass-patch absolute left-[76%] top-[72%] h-[12%] w-[16%]" />

      <div className="dream-cobble absolute bottom-[6%] left-[40%] h-[18%] w-[20%]" />
      <div className="absolute left-[4%] top-[54%] h-[2%] w-[92%] bg-[#8c6a45]" />
      <div className="dream-river absolute left-[4%] top-[56%] h-[9%] w-[92%]" />
      <div className="absolute left-[4%] top-[65%] h-[2%] w-[92%] bg-[#8c6a45]" />
      <div className="dream-bridge absolute left-[36%] top-[53%] z-[8] h-[14%] w-[28%]" />
      <div className="dream-cobble absolute left-[42%] top-[42%] h-[12%] w-[16%]" />

      <div className="dream-roof-cute absolute left-[18%] top-[5%] h-[15%] w-[64%]" />
      <div className="absolute left-[44%] top-[3%] h-[5%] w-[12%] border-2 border-ink bg-[#fff8ec]" />
      <div className="absolute left-[47%] top-[4%] h-2 w-6 bg-[#ee99ac]" />
      <div className="absolute left-[58%] top-[4%] h-[10%] w-[9%] border-2 border-ink bg-[#ee99ac]" />
      <div className="absolute left-[59%] top-[2%] h-[4%] w-[7%] border-2 border-ink bg-[#fff8ec]" />

      <div className="dream-wall-cute absolute left-[24%] top-[18%] h-[22%] w-[52%]">
        <div className="absolute left-[8%] top-[16%] h-9 w-9 border-2 border-ink bg-[#c8e8ff] shadow-[inset_2px_2px_0_rgba(255,255,255,0.55)]" />
        <div className="absolute right-[8%] top-[16%] h-9 w-9 border-2 border-ink bg-[#c8e8ff] shadow-[inset_2px_2px_0_rgba(255,255,255,0.55)]" />
        <div className="absolute left-[8%] top-[16%] h-2 w-9 border-2 border-ink bg-[#fff8ec]" />
        <div className="absolute right-[8%] top-[16%] h-2 w-9 border-2 border-ink bg-[#fff8ec]" />
        <div className="absolute left-[8%] top-[42%] h-3 w-9 border-2 border-ink bg-[#ee99ac]" />
        <div className="absolute right-[8%] top-[42%] h-3 w-9 border-2 border-ink bg-[#f0a0b0]" />
        <div className="absolute left-[10%] top-[40%] h-2 w-2 bg-[#78c850]" />
        <div className="absolute right-[10%] top-[40%] h-2 w-2 bg-[#e4c36a]" />
        <div className="absolute bottom-0 left-1/2 h-[58%] w-10 -translate-x-1/2 border-2 border-ink bg-[#8b4a3a]" />
        <div className="absolute bottom-[28%] left-1/2 h-2 w-2 -translate-x-[14px] bg-[#e4c36a]" />
      </div>

      <Tree top="20%" left="6%" />
      <Tree top="22%" left="78%" scale={0.9} />
      <Tree top="68%" left="8%" scale={0.85} />
      <Tree top="66%" left="78%" />

      <Flower top="42%" left="30%" color="#ee99ac" />
      <Flower top="44%" left="36%" color="#e4c36a" />
      <Flower top="43%" left="62%" color="#fff8ec" />
      <Flower top="46%" left="68%" color="#ee99ac" />
      <Flower top="20%" left="12%" color="#f0a0b0" />
      <Flower top="24%" left="16%" color="#e4c36a" />
      <Flower top="74%" left="80%" color="#ee99ac" />
      <Flower top="78%" left="84%" color="#fff8ec" />
      <Flower top="82%" left="28%" color="#78c850" />
    </div>
  );
}

function Room({
  name,
  floor,
  paper,
  className,
}: {
  name: string;
  floor: string;
  paper: string;
  className: string;
}) {
  return (
    <div className={`dream-room absolute ${floor} ${className}`}>
      <div className={`absolute inset-x-0 top-0 h-[28%] border-b-2 border-ink ${paper}`} />
      <p className="absolute left-2 top-1 z-[1] text-[11px] text-[#4a3a2c]">{name}</p>
    </div>
  );
}

function Doorway({ className }: { className: string }) {
  return <div className={`dream-doorway absolute z-[8] ${className}`} />;
}

export function HouseScenery() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Room
        name="厨房"
        floor="dream-floor-kitchen"
        paper="dream-paper-kitchen"
        className="left-0 top-0 h-[40%] w-[70%]"
      />
      <Room
        name="浴室"
        floor="dream-floor-bath"
        paper="dream-paper-bath"
        className="right-0 top-0 h-[40%] w-[30%]"
      />
      <Room
        name="客厅"
        floor="dream-floor-living"
        paper="dream-paper-living"
        className="bottom-0 left-0 h-[60%] w-1/2"
      />
      <Room
        name="卧室"
        floor="dream-floor-bedroom"
        paper="dream-paper-bedroom"
        className="bottom-0 right-0 h-[60%] w-1/2"
      />

      <Doorway className="left-[18%] top-[calc(40%-22px)] h-11 w-9" />
      <Doorway className="left-[calc(70%-18px)] top-[12%] h-9 w-11" />
      <Doorway className="left-[calc(50%-18px)] top-[68%] h-9 w-11" />
      <Doorway className="left-[82%] top-[calc(40%-22px)] h-11 w-9" />

      <div className="absolute left-[6%] top-[7%] h-8 w-28 border-2 border-ink bg-[#8b6239]" />
      <div className="absolute left-[8%] top-[5%] h-3 w-6 border-2 border-ink bg-[#7ec8ff]" />

      <div className="dream-hearth absolute bottom-[26%] left-[3%] h-[14%] w-[14%]">
        <div className="dream-flame absolute bottom-2 left-1/2 h-5 w-4 -translate-x-1/2" />
      </div>
      <div className="absolute left-[8%] top-[48%] h-10 w-8 border-2 border-ink bg-[#7ec8ff] shadow-[inset_2px_2px_0_rgba(255,255,255,0.45)]" />

      <div className="absolute right-[8%] top-[48%] h-10 w-8 border-2 border-ink bg-[#c8d8e8] shadow-[inset_2px_2px_0_rgba(255,255,255,0.5)]" />

      <div className="absolute right-[4%] top-[8%] h-10 w-12 border-2 border-ink bg-[#9bb0bc]" />
      <div className="absolute right-[6%] top-[10%] h-3 w-8 border-2 border-ink bg-[#c5d0d8]" />
      <div className="absolute right-[5%] top-[24%] h-5 w-4 border-2 border-ink bg-[#fff8ec]" />
    </div>
  );
}
