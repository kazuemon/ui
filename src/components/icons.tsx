import type { ReactNode } from 'react';

interface IconProps {
  /** アイコン単体で置くとき（アイコンだけのボタンなど）。線を Bold の太さにする */
  standalone?: boolean;
}

// Phosphor（viewBox 256）。テキストと並ぶときは Regular、アイコン単体は Bold の線幅（design/adr/0018）
function Icon({ children, standalone }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-(--size-icon) shrink-0"
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

export const CheckIcon = () => (
  <Icon>
    <polyline points="40 144 96 200 224 72" />
  </Icon>
);
