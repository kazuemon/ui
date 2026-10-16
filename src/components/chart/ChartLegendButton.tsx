'use client';

import type { ReactNode } from 'react';

// 凡例の項目を、系列を出し入れするボタンにする（ChartLegend の onHiddenChange）
// 押すものの仲間は「平らな押すもの」（原則1・3）: 塗りも影もなく、hover で文字の色を淡く敷く
// 出しているかは aria-pressed で読み上げる（押されている = 出している）
export function ChartLegendButton({
  hidden,
  className,
  onToggle,
  children,
}: {
  hidden: boolean;
  className: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={!hidden} className={className} onClick={onToggle}>
      {children}
    </button>
  );
}
