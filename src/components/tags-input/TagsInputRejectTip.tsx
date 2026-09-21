'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactNode } from 'react';

import { popupMotionClass, readTokenLength } from '../../internal/overlay/popup-styles';
import { tv } from '../../internal/tv';

// 弾いたことを、チップに付く小さな面で一瞬だけ見せる（軸 261 の比較用）
//   面・影・文字の大きさは Tooltip（src/components/tooltip/Tooltip.tsx・ADR-0106）と同じ。
//   Tooltip 部品は hover・フォーカス・長押しで開く前提なので、ここでは Base UI の Tooltip を open だけ制御して使う
//   決まったら、面のクラスは internal に出して Tooltip と 1 つにする
const rejectTip = tv({
  base: [
    // 出ているあいだ、その場所を押しても面には当たらない（すぐ下の欄やチップを押せるようにする）
    'pointer-events-none',
    'rounded-control border-(length:--border-width-thin) border-surface-line bg-surface text-fg outline-none',
    popupMotionClass,
    'max-w-(--tooltip-max-width) px-(--tooltip-padding-x) py-(--tooltip-padding-y) text-(length:--text-caption) leading-(--leading-caption) [box-shadow:var(--shadow-tooltip)]',
  ],
});

interface TagsInputRejectTipProps {
  /** 出しているあいだ true。閉じる長さは --tags-input-flash-duration（部品が測って消す） */
  open: boolean;
  /** チップのどちら側に出すか */
  side: 'top' | 'bottom';
  /** 付く先（弾かれたチップ。見つからないときは欄） */
  anchor: () => Element | null;
  /** 描く場所 */
  container?: HTMLElement | null;
  children: ReactNode;
}

/** 弾かれたチップに付く、一瞬の小さな面 */
export function TagsInputRejectTip({
  open,
  side,
  anchor,
  container,
  children,
}: TagsInputRejectTipProps) {
  return (
    <BaseTooltip.Root open={open}>
      <BaseTooltip.Portal container={container}>
        <BaseTooltip.Positioner
          anchor={anchor}
          side={side}
          sideOffset={() => readTokenLength('--tooltip-offset')}
          collisionPadding={8}
          className="pointer-events-none z-10"
        >
          <BaseTooltip.Popup data-slot="tags-input-reject-tip" className={rejectTip()}>
            {children}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
