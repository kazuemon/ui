'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { popupMotionClass, readTokenLength } from '../../internal/overlay/popup-styles';
import { tv } from '../../internal/tv';
import { usePortalContainer } from '../../internal/ui-config';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

// 面はほかの浮かぶ面と同じ白に細い輪郭（原則1）。角は浮かぶ面なので部品の角（原則5）— ADR-0106
// 小さいので影は小さく淡い（--shadow-tooltip）。文字は部品のキャプションと同じ大きさ
// className は tv でまとめる（面の色だけを差し替えられるようにする。生の文字列で並べると、後ろに置いても打ち消せない）
const tooltipPopup = tv({
  base: [
    'rounded-control border-(length:--border-width-thin) border-surface-line bg-surface text-fg outline-none',
    popupMotionClass,
    'max-w-(--tooltip-max-width) px-(--tooltip-padding-x) py-(--tooltip-padding-y) text-(length:--text-caption) leading-(--leading-caption) [box-shadow:var(--shadow-tooltip)]',
  ],
  variants: {
    shadow: {
      true: '',
      false: '[--shadow-tooltip:none]',
    },
  },
  defaultVariants: { shadow: true },
});

export interface TooltipProps {
  /** 出す文。短い補足だけを書く。欠かせない情報は Tooltip に置かず、Popover で見せる */
  content: ReactNode;
  /** 本体。Button などの要素を1つ渡す（ref と props を受け取れる要素） */
  children: ReactElement;
  /**
   * 本体のどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 'bottom'
   */
  side?: TooltipSide;
  /**
   * マウスを載せてから出るまで（ms）。キーボードでフォーカスしたときは待たずに出ます
   * @default 400
   */
  delay?: number;
  /**
   * 指で長押ししてから出るまで（ms）。長押しで出したときは、本体を押しても実行せず、ほかの場所に触れると閉じます
   * @default 500
   */
  longPressDelay?: number;
  /**
   * 長押しで出したときの向き。指と手で隠れないよう、既定では上に出します。false を渡すと side のままにします
   * @default 'top'
   */
  longPressSide?: TooltipSide | false;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 出さない */
  disabled?: boolean;
  /**
   * 影を付けるか。false では細い輪郭だけで、下の内容と切り分けます
   * @default true
   */
  shadow?: boolean;
  /**
   * 描く場所。本体の祖先に付いた data-density と coarse-large は、描く場所がその外でも写します
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 面（Popup）に足すクラス */
  className?: string;
}

// 長押しとみなさない指の動き（px）。これより動いたらスクロールとみなし、長押しをやめる
const LONG_PRESS_SLOP = 10;

/**
 * 本体にマウスを載せたとき・キーボードでフォーカスしたとき・指で長押ししたときに出す、短い補足
 */
export function Tooltip({
  content,
  children,
  side = 'bottom',
  delay = 400,
  longPressDelay = 500,
  longPressSide = 'top',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled,
  shadow = true,
  container,
  className,
}: TooltipProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const portalContainer = usePortalContainer(container);
  const { anchorRef, scope } = useDensityScope(open);
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  // 指で長押ししたときに出す（Base UI の Tooltip は指では出ないため、ここで開く） — 原則11
  //   長押しで出したあとは、指を離して起きる click で本体を実行せず（押したつもりではないため）、閉じもしない
  //   ほかの場所に触れたら閉じる。端末の長押しのメニューと文字の選択は、本体の上では出さない
  const press = useRef<{ x: number; y: number; timer: number } | null>(null);
  const [longPressed, setLongPressed] = useState(false);
  const cancelPress = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  };
  useEffect(
    () => () => {
      if (press.current) window.clearTimeout(press.current.timer);
    },
    []
  );
  useEffect(() => {
    if (!longPressed) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && anchorRef.current?.contains(event.target)) return;
      setLongPressed(false);
      setOpenState(false);
      onOpenChange?.(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [longPressed, anchorRef, onOpenChange]);

  return (
    <BaseTooltip.Root
      open={open}
      disabled={disabled}
      onOpenChange={(next, details) => {
        // 長押しで出したあいだは、本体の押下（指を離したときの click）では閉じない
        if (!next && longPressed && details.reason === 'trigger-press') return;
        if (!next) setLongPressed(false);
        changeOpen(next);
      }}
    >
      <BaseTooltip.Trigger
        ref={anchorRef}
        render={children}
        delay={delay}
        style={{ WebkitTouchCallout: 'none' }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch' || disabled) return;
          cancelPress();
          const timer = window.setTimeout(() => {
            press.current = null;
            setLongPressed(true);
            changeOpen(true);
          }, longPressDelay);
          press.current = { x: event.clientX, y: event.clientY, timer };
        }}
        onPointerMove={(event) => {
          const start = press.current;
          if (!start) return;
          if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > LONG_PRESS_SLOP) {
            cancelPress();
          }
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(event) => {
          if (longPressed || press.current) event.preventDefault();
        }}
        onClickCapture={(event) => {
          if (!longPressed) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      />
      <BaseTooltip.Portal container={portalContainer}>
        <BaseTooltip.Positioner
          // 長押しで出したときは、指と手で隠れる向きを避ける（longPressSide）
          side={longPressed && longPressSide ? longPressSide : side}
          sideOffset={() => readTokenLength('--tooltip-offset')}
          collisionPadding={8}
          data-density={scope.density}
          className={['z-10', scope.large && 'coarse-large'].filter(Boolean).join(' ')}
        >
          {/* 面は浮かぶ面と同じ白・細い輪郭（原則1）。小さいので影は小さく淡い（--shadow-tooltip）。文字は部品のキャプションと同じ大きさ */}
          <BaseTooltip.Popup data-slot="tooltip" className={tooltipPopup({ shadow, className })}>
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
