import type { ReactNode } from "react";
import type { PetSpecies } from "@/generated/prisma/client";
import {
  intimacyBadgeList,
  intimacyMarkName,
  intimacyRankLabel,
  type IntimacyTier,
} from "@/lib/pet-rules";

function MarkSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={14}
      height={14}
      aria-hidden
      className="shrink-0 overflow-visible"
    >
      {children}
    </svg>
  );
}

function StarMark() {
  return (
    <MarkSvg>
      <path
        fill="#FFD429"
        stroke="#C49200"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M8 1.35 9.92 5.86l4.86.42-3.68 3.18 1.08 4.76L8 11.55l-4.18 2.67 1.08-4.76-3.68-3.18 4.86-.42Z"
      />
      <ellipse cx="7.1" cy="6.2" rx="1.15" ry="0.7" fill="#fff" opacity="0.55" />
    </MarkSvg>
  );
}

function MoonMark() {
  return (
    <MarkSvg>
      <path
        fill="#FFD429"
        stroke="#C49200"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M11.7 1.7c-3.4.9-5.9 4-5.9 7.6 0 3.6 2.5 6.7 5.9 7.6C8.7 15.8 6.4 12.8 6.4 9.3c0-3.5 2.3-6.5 5.3-7.6Z"
      />
      <ellipse cx="9.6" cy="5.4" rx="0.85" ry="1.35" fill="#fff" opacity="0.45" />
    </MarkSvg>
  );
}

function SunMark() {
  return (
    <MarkSvg>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="7.3"
          y="0.85"
          width="1.4"
          height="2.45"
          rx="0.55"
          fill="#F0A020"
          transform={`rotate(${i * 45} 8 8)`}
        />
      ))}
      <circle cx="8" cy="8" r="3.25" fill="#FFD429" stroke="#E09010" strokeWidth="0.7" />
      <ellipse cx="6.75" cy="6.7" rx="1.05" ry="0.75" fill="#fff" opacity="0.65" />
    </MarkSvg>
  );
}

function CrownMark() {
  return (
    <MarkSvg>
      <path
        fill="#FFD429"
        stroke="#C49200"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M2.15 11.35 2.85 7.05 5.55 9.7 8 4.2l2.45 5.5 2.7-2.65.7 4.3Z"
      />
      <rect
        x="2.05"
        y="11.15"
        width="11.9"
        height="2.35"
        rx="0.45"
        fill="#E8B400"
        stroke="#C49200"
        strokeWidth="0.55"
      />
      <circle cx="8" cy="6.15" r="0.85" fill="#E23D2A" />
      <circle cx="5.35" cy="9.35" r="0.7" fill="#E23D2A" />
      <circle cx="10.65" cy="9.35" r="0.7" fill="#E23D2A" />
      <ellipse cx="6.5" cy="8.4" rx="1.1" ry="0.55" fill="#fff" opacity="0.35" />
    </MarkSvg>
  );
}

function CarrotMark() {
  return (
    <MarkSvg>
      <path
        fill="#5FA03A"
        stroke="#3A6E22"
        strokeWidth="0.55"
        strokeLinejoin="round"
        d="M7.35 5.55C4.9 2.15 3.15 3.7 6.55 6.25Z"
      />
      <path
        fill="#73B84A"
        stroke="#3A6E22"
        strokeWidth="0.55"
        strokeLinejoin="round"
        d="M8.05 5.05C7.55 1.45 10.85 1.55 9.15 5.45Z"
      />
      <path
        fill="#4E8C30"
        stroke="#3A6E22"
        strokeWidth="0.55"
        strokeLinejoin="round"
        d="M8.55 5.55C11.25 2.45 13.05 4.65 9.65 6.25Z"
      />
      <path
        fill="#F07828"
        stroke="#C24A14"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M6.25 5.65c3.2.35 4.05 2.15 2.55 8.65l-2.35.55C4.85 9.55 4.35 6.45 6.25 5.65Z"
      />
      <ellipse cx="7.35" cy="8.35" rx="0.8" ry="1.35" fill="#fff" opacity="0.45" />
    </MarkSvg>
  );
}

function GobletMark() {
  return (
    <MarkSvg>
      <path
        fill="#F2E6C8"
        stroke="#8A6A38"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M3.55 2.2h8.9L11.25 7.45Q8 9.7 4.75 7.45Z"
      />
      <path fill="#C43A4A" d="M4.7 4.2h6.6L10.55 7.2Q8 8.75 5.45 7.2Z" />
      <path
        fill="#E8D4A8"
        stroke="#8A6A38"
        strokeWidth="0.65"
        strokeLinejoin="round"
        d="M7.25 8.25h1.5v3.55H7.25Z"
      />
      <path
        fill="#E8D4A8"
        stroke="#8A6A38"
        strokeWidth="0.65"
        strokeLinejoin="round"
        d="M4.55 12.55h6.9L12.15 14.45H3.85Z"
      />
      <ellipse cx="6.35" cy="3.45" rx="1.25" ry="0.5" fill="#fff" opacity="0.55" />
    </MarkSvg>
  );
}

function PomMark() {
  return (
    <MarkSvg>
      <path
        fill="#FFF4E8"
        stroke="#C9A070"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M8 2.55c1.15 0 1.9.8 2.05 1.7 1.15-.5 2.7.3 2.7 1.6.95.25 1.65 1.25 1.5 2.25.85.55.8 1.85.1 2.5.7.7.15 1.95-1 2.2.15 1.15-1.2 2.15-2.3 1.7-.5.95-1.9 1.1-2.6.3C7.7 15.55 6.2 15.3 5.7 14.25 4.4 14.75 3.15 13.5 3.4 12.3 2.25 11.95 1.7 10.45 2.4 9.4 1.65 8.55 2 6.95 3.25 6.8c0-1.25 1.3-2.05 2.35-1.55C5.8 4.1 6.75 2.55 8 2.55Z"
      />
      <ellipse cx="6.35" cy="6.55" rx="1.25" ry="0.8" fill="#fff" opacity="0.7" />
    </MarkSvg>
  );
}

function GoldBarMark() {
  return (
    <MarkSvg>
      <path
        fill="#FFD429"
        stroke="#C49200"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M3.15 9.15 4.55 5.25h6.9l1.4 3.9Z"
      />
      <path
        fill="#E8B400"
        stroke="#C49200"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M3.15 9.15h9.7L12.15 13.55H3.85Z"
      />
      <ellipse cx="7.15" cy="7.2" rx="1.45" ry="0.55" fill="#fff" opacity="0.5" />
    </MarkSvg>
  );
}

function DiamondMark() {
  return (
    <MarkSvg>
      <path
        fill="#7EC8F8"
        stroke="#2A6288"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M4.15 2.45h7.7L14.45 6.4 8 14.4 1.55 6.4Z"
      />
      <path fill="#D4F2FF" d="M4.15 2.45h7.7L10.45 6.4H5.55Z" />
      <path
        d="M1.55 6.4h12.9M8 2.45v11.95M4.15 2.45 5.55 6.4 8 14.4 10.45 6.4 11.85 2.45"
        fill="none"
        stroke="#2A6288"
        strokeWidth="0.45"
      />
      <ellipse cx="6.15" cy="4.2" rx="1.1" ry="0.55" fill="#fff" opacity="0.7" />
    </MarkSvg>
  );
}

function CloverMark() {
  return (
    <MarkSvg>
      <ellipse cx="8" cy="5.05" rx="2.55" ry="2.7" fill="#4CAF50" stroke="#2E6B32" strokeWidth="0.7" />
      <ellipse cx="5.35" cy="8.2" rx="2.55" ry="2.7" fill="#4CAF50" stroke="#2E6B32" strokeWidth="0.7" />
      <ellipse cx="10.65" cy="8.2" rx="2.55" ry="2.7" fill="#4CAF50" stroke="#2E6B32" strokeWidth="0.7" />
      <path
        d="M8 10.35q.2 2.85 2.15 3.7"
        fill="none"
        stroke="#2E6B32"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <ellipse cx="7.05" cy="4.35" rx="1" ry="0.65" fill="#fff" opacity="0.45" />
    </MarkSvg>
  );
}

function CloudMark() {
  return (
    <MarkSvg>
      <path
        fill="#FFF8F4"
        stroke="#8A7A68"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M4.35 11.55c-1.85 0-3.05-1.45-2.9-2.9.1-1.4 1.2-2.5 2.6-2.5.2-1.9 1.9-3.3 3.9-3.3 1.55 0 2.9.95 3.5 2.3.45-.3 1-.5 1.6-.5 1.7 0 3.1 1.35 3.1 3.05s-1.4 3-3.1 3H4.35Z"
      />
      <ellipse cx="5.45" cy="7.35" rx="1.3" ry="0.75" fill="#fff" opacity="0.75" />
    </MarkSvg>
  );
}

function MilkJugMark() {
  return (
    <MarkSvg>
      <path
        d="M11.15 6.7c2.65.2 2.75 5.45-.1 5.7"
        fill="none"
        stroke="#8A7060"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        fill="#FFF8F0"
        stroke="#8A7060"
        strokeWidth="0.7"
        strokeLinejoin="round"
        d="M4.95 6.2 5.4 14.25h5.55l.5-8.05Z"
      />
      <ellipse
        cx="8.15"
        cy="5.55"
        rx="3.55"
        ry="1.25"
        fill="#F0E6D4"
        stroke="#8A7060"
        strokeWidth="0.7"
      />
      <ellipse
        cx="8.15"
        cy="4.8"
        rx="2.1"
        ry="0.7"
        fill="#FFF8F0"
        stroke="#8A7060"
        strokeWidth="0.55"
      />
      <rect x="5.65" y="9.15" width="5.15" height="1.25" rx="0.3" fill="#D4E8F4" />
      <ellipse cx="6.7" cy="7.95" rx="1" ry="0.55" fill="#fff" opacity="0.55" />
    </MarkSvg>
  );
}

const DEFAULT_MARKS: Record<IntimacyTier, () => ReactNode> = {
  star: StarMark,
  moon: MoonMark,
  sun: SunMark,
  crown: CrownMark,
};

const RABBIT_MARKS: Record<IntimacyTier, () => ReactNode> = {
  star: CarrotMark,
  moon: GobletMark,
  sun: PomMark,
  crown: GoldBarMark,
};

const COW_MARKS: Record<IntimacyTier, () => ReactNode> = {
  star: CloverMark,
  moon: CloudMark,
  sun: MilkJugMark,
  crown: DiamondMark,
};

function marksFor(species: PetSpecies) {
  if (species === "rabbit") return RABBIT_MARKS;
  if (species === "cow") return COW_MARKS;
  return DEFAULT_MARKS;
}

function IntimacyMark({ tier, species }: { tier: IntimacyTier; species: PetSpecies }) {
  const Icon = marksFor(species)[tier];
  return (
    <span title={intimacyMarkName(tier, species)} className="inline-flex" aria-hidden>
      <Icon />
    </span>
  );
}

export function IntimacyRow({
  intimacy,
  species,
}: {
  intimacy: number;
  species: PetSpecies;
}) {
  const badges = intimacyBadgeList(intimacy);
  const label = intimacyRankLabel(intimacy, species);
  return (
    <div>
      <div className="mb-1 text-[11px] text-ink-soft">亲密度</div>
      {badges.length === 0 ? (
        <p className="text-[11px] text-ink-soft">还在熟络</p>
      ) : (
        <div className="flex flex-wrap items-center gap-px" role="img" aria-label={label}>
          {badges.map((tier, i) => (
            <IntimacyMark key={`${tier}-${i}`} tier={tier} species={species} />
          ))}
        </div>
      )}
    </div>
  );
}
