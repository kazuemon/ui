// 位置の点（internal/position-indicator.tsx の PositionDots）の並びが取る幅。Gallery が、下の帯で点の両側にボタンを置くときに使う

/** 点の並びが取る幅（CSS の式）。いまの 1 枚の点だけ横に長い */
export const positionDotsWidth = (count: number) =>
  `calc(${Math.max(count - 1, 0)} * (var(--carousel-dot-size) + var(--carousel-dot-gap)) + var(--carousel-dot-current-width))`;
