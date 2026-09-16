import type { ReactNode } from 'react';

interface IconProps {
  /** アイコン単体で置くとき（アイコンだけのボタンなど）。線を Bold の太さにする */
  standalone?: boolean;
  /** 大きさと置き方。既定は --spacing-icon（部品の中の文字と並ぶ大きさ） */
  className?: string;
}

// Phosphor（viewBox 256）。テキストと並ぶときは Regular、アイコン単体は Bold の線幅（design/adr/0018）
function Icon({
  children,
  standalone,
  className = 'size-(--spacing-icon) shrink-0',
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ strokeWidth: standalone ? 'var(--icon-stroke-standalone)' : 'var(--icon-stroke)' }}
    >
      {children}
    </svg>
  );
}

export const XIcon = ({ standalone }: IconProps) => (
  <Icon standalone={standalone}>
    <line x1="200" y1="56" x2="56" y2="200" />
    <line x1="200" y1="200" x2="56" y2="56" />
  </Icon>
);

export const EyeIcon = ({ standalone }: IconProps) => (
  <Icon standalone={standalone}>
    <path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z" />
    <circle cx="128" cy="128" r="40" />
  </Icon>
);

export const EyeSlashIcon = ({ standalone }: IconProps) => (
  <Icon standalone={standalone}>
    <line x1="48" y1="40" x2="208" y2="216" />
    <path d="M154.91,157.6a40,40,0,0,1-53.82-59.2" />
    <path d="M135.53,88.71a40,40,0,0,1,32.3,35.53" />
    <path d="M208.61,169.1C230.41,149.58,240,128,240,128S208,56,128,56a126,126,0,0,0-20.68,1.68" />
    <path d="M74,68.6C33.23,89.24,16,128,16,128s32,72,112,72a118.05,118.05,0,0,0,54-12.6" />
  </Icon>
);

export const CaretDownIcon = () => (
  <Icon>
    <polyline points="208 96 128 176 48 96" />
  </Icon>
);

export const CaretRightIcon = () => (
  <Icon>
    <polyline points="96 48 176 128 96 208" />
  </Icon>
);

// 右上向きの矢印（Phosphor の ArrowUpRight）。ボタンの見た目のリンクに部品が必ず付ける。外のサイトへのリンクにも置く（design/adr/0046）
// 文字のリンクは、新しいタブで開くときに部品が文字より少し小さく（0.85em）付ける（className で大きさと置き方を替える）
export const ArrowUpRightIcon = ({ className }: Pick<IconProps, 'className'>) => (
  <Icon className={className}>
    <line x1="64" y1="192" x2="192" y2="64" />
    <polyline points="88 64 192 64 192 168" />
  </Icon>
);

export const CheckIcon = () => (
  <Icon>
    <polyline points="40 144 96 200 224 72" />
  </Icon>
);

// 丸の「!」（Phosphor の WarningCircle）。入力欄のエラーの文の前に置く（design/adr/0041）
export const WarningCircleIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <line x1="128" y1="80" x2="128" y2="136" />
    <circle cx="128" cy="172" r="12" fill="currentColor" stroke="none" />
  </Icon>
);

// 丸の「i」（Phosphor の Info）。情報のお知らせに置く（design/adr/0043）
export const InfoIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8" />
    <circle cx="124" cy="84" r="12" fill="currentColor" stroke="none" />
  </Icon>
);

// 丸のチェック（Phosphor の CheckCircle）。成功のお知らせに置く（design/adr/0043）
export const CheckCircleIcon = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="88 136 112 160 168 104" />
    <circle cx="128" cy="128" r="96" />
  </Icon>
);

// 三角の注意（Phosphor の Warning）。入力欄の警告の文の前に置く（design/adr/0041）
export const WarningIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M114.15,39.98,26.36,191.93a16,16,0,0,0,13.84,24H215.8a16,16,0,0,0,13.84-24L141.85,39.98a16,16,0,0,0-27.7,0Z" />
    <line x1="128" y1="104" x2="128" y2="144" />
    <circle cx="128" cy="180" r="12" fill="currentColor" stroke="none" />
  </Icon>
);
