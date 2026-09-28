// 並べ替えの印。DataTable だけが使う（形は Phosphor Icons の SVG を写したもの。ライセンスは src/internal/icons.tsx の先頭）
// 文字と並ぶので Regular の線の太さ（原則21）。大きさは部品の中の文字と並ぶ大きさ（--spacing-icon）
import type { ReactNode } from 'react';

function SortIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={['size-(--spacing-icon) shrink-0', className].filter(Boolean).join(' ')}
      style={{ strokeWidth: 'var(--icon-stroke)' }}
    >
      {children}
    </svg>
  );
}

/** 小さい順（上向きの矢印） */
export const SortAscIcon = ({ className }: { className?: string }) => (
  <SortIcon className={className}>
    <line x1="128" y1="216" x2="128" y2="40" />
    <polyline points="56 112 128 40 200 112" />
  </SortIcon>
);

/** 大きい順（下向きの矢印） */
export const SortDescIcon = ({ className }: { className?: string }) => (
  <SortIcon className={className}>
    <line x1="128" y1="40" x2="128" y2="216" />
    <polyline points="56 144 128 216 200 144" />
  </SortIcon>
);

/** 並べ替えていない（上下の山） */
export const SortNoneIcon = ({ className }: { className?: string }) => (
  <SortIcon className={className}>
    <polyline points="80 176 128 224 176 176" />
    <polyline points="80 80 128 32 176 80" />
  </SortIcon>
);
