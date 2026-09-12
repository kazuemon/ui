import type { ReactNode } from 'react';

// Phosphor（viewBox 256）。テキストと並ぶときは Regular の線幅（design/adr/0018）
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-(--size-icon) shrink-0"
      style={{ strokeWidth: 'var(--icon-stroke)' }}
    >
      {children}
    </svg>
  );
}

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
