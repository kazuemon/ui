// 動画の読み込みに失敗した・形式に対応していないときの面に置くアイコン。Phosphor からの転写ではなく、
// この部品のために描いた簡単な絵（カメラの枠・再生の三角・斜線）。ライセンスの記載は不要（Image の image-icons.tsx と対）

interface IconProps {
  className?: string;
}

export const VideoBrokenIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 256 256" fill="none" aria-hidden="true" className={className}>
    <rect x="24" y="64" width="152" height="128" rx="16" stroke="currentColor" strokeWidth="16" />
    <path
      d="M176 104 L224 72 V184 L176 152"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path d="M92 100 L92 156 L138 128 Z" fill="currentColor" />
    <line
      x1="24"
      y1="32"
      x2="224"
      y2="224"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
    />
  </svg>
);
