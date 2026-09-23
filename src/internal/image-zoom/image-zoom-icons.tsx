// 押すと拡大することを示す印のアイコン。形は Phosphor Icons（MagnifyingGlassPlus）の SVG を写したもの
// ライセンスは src/internal/icons.tsx の先頭（MIT License, Copyright (c) 2023 Phosphor Icons）
// 画像の隅に 1 つだけ置く、文字と並ばないアイコンなので、線は Bold の太さ（ADR-0018）

interface IconProps {
  className?: string;
}

export const MagnifyingGlassPlusIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    style={{ strokeWidth: 'var(--icon-stroke-standalone)' }}
  >
    <line x1="80" y1="112" x2="144" y2="112" />
    <line x1="112" y1="80" x2="112" y2="144" />
    <circle cx="112" cy="112" r="80" />
    <line x1="168.57" y1="168.57" x2="224" y2="224" />
  </svg>
);
