// Dropzone だけが使うアイコン。ほかの部品が使うようになったら src/internal/icons.tsx へ移す（統合のときにまとめる）
// 線の描き方は src/internal/icons.tsx と同じ（viewBox 256、stroke currentColor、round の線）
import type { ReactNode } from 'react';

interface DropzoneIconProps {
  /** 大きさと置き方。既定は --spacing-icon */
  className?: string;
}

function Svg({
  children,
  className = 'size-(--spacing-icon) shrink-0',
}: DropzoneIconProps & { children: ReactNode }) {
  return (
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
      {children}
    </svg>
  );
}

/** 上向きの矢印とトレイ（Phosphor の UploadSimple 相当）。Dropzone の案内に置く */
export function UploadIcon(props: DropzoneIconProps) {
  return (
    <Svg {...props}>
      <line x1="128" y1="48" x2="128" y2="160" />
      <polyline points="80 96 128 48 176 96" />
      <polyline points="48 152 48 200 208 200 208 152" />
    </Svg>
  );
}
