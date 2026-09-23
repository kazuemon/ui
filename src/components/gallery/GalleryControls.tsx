'use client';

import { type CSSProperties, type FocusEvent, useLayoutEffect, useRef } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CaretLeftIcon, CaretRightIcon } from '../../internal/icons';
import { positionDotsWidth } from '../../internal/position-dots-width';
import { PositionCount, PositionDots } from '../../internal/position-indicator';

// 拡大した面の上に置く、前後に送るボタンと位置の示し（ImageZoomViewer の controls）
// 置き場所と形は --gallery-nav-*（軸 291。controlsPosition で選ぶ）
//   nav-bar が 1 のとき（bottom）は、下の帯の中央に「‹ 3 / 6 ›」とまとめる。帯は閉じる × の分として上下に取った場所の、下の側
//   0 のとき（sides・overlay）は、ボタンを左右の端の中央に、位置を左上（閉じる × と向かい合う角）に置く
//   ボタンは閉じる × と同じ、アイコンだけのボタン（線は Bold — ADR-0018）。hover と押下は文字の色を淡く敷く（ADR-0027）
//   沈みは付けない（押すと画像が入れ替わり、それ自体が手応えになる — 原則3）
//   nav-raised が 1 のとき（overlay）は、白い丸の面と影を持つ（閉じる × の raised と同じ形）
// 位置の示し（indicator）は、数（count: 3 / 6）・点（dots）・出さない（none）。見るためのもので、読み上げには出さない
//   点と数は Carousel と同じ（internal/position-indicator.tsx）。いまの 1 枚の点は横に伸ばして濃くする。色は文字の色から作る
//   読み上げは、送ったときに知らせの箱（aria-live）が 1 回だけ伝える（原則15）
// 送る先がないとき（端で loop しない）は、ボタンを消さずに押せない見た目で残す（Pagination・Carousel と同じ — 原則13）
//   押せなくなったボタンからはブラウザがフォーカスを外すので、反対のボタンへ移す

/** 位置の示し方。count は「3 / 6」、dots は点、none は出さない */
export type GalleryIndicator = 'dots' | 'count' | 'none';

const control = 'var(--spacing-control)';
const inset = 'var(--image-zoom-close-inset)';
const bar = 'var(--gallery-nav-bar)';

const navButtonClass = [
  'absolute flex size-(--spacing-control) cursor-pointer items-center justify-center rounded-pill',
  '[--gallery-nav-fg:color-mix(in_oklab,var(--color-fg)_calc(var(--gallery-nav-raised)*100%),var(--image-zoom-close-fg))]',
  'text-(color:--gallery-nav-fg) shadow-(--gallery-nav-shadow)',
  '[--color-focus-ring:var(--image-zoom-focus-ring)]',
  ...focusRing,
  '[--flat-bg:var(--gallery-nav-bg)] bg-(color:--flat-bg)',
  '[transition:--flat-bg_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press)]',
  'enabled:hover:[--flat-bg:color-mix(in_oklab,var(--gallery-nav-fg)_var(--flat-hover-mix),var(--gallery-nav-bg))] enabled:active:[--flat-bg:color-mix(in_oklab,var(--gallery-nav-fg)_var(--flat-press-mix),var(--gallery-nav-bg))] motion-reduce:[transition:none]',
  // 押せないときは、色を残さず薄くする（地が白でも暗くても薄く見えるよう、いまの文字の色を透かす）
  'disabled:cursor-not-allowed disabled:text-[color-mix(in_oklab,var(--gallery-nav-fg)_35%,transparent)]',
].join(' ');

export interface GalleryControlsProps {
  /** いまの番号（0 から） */
  index: number;
  count: number;
  hasPrev: boolean;
  hasNext: boolean;
  onNavigate: (direction: -1 | 1) => void;
  prevName: string;
  nextName: string;
  indicator: GalleryIndicator;
  /** 送ったときに読み上げで知らせる文。送るまでは空 */
  announcement: string;
}

export function GalleryControls({
  index,
  count,
  hasPrev,
  hasNext,
  onNavigate,
  prevName,
  nextName,
  indicator,
  announcement,
}: GalleryControlsProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // 位置の示しに取る幅。下の帯では、ボタンをその両側に置く
  const indicatorWidth =
    indicator === 'count'
      ? 'var(--gallery-counter-width)'
      : indicator === 'dots'
        ? `calc(${positionDotsWidth(count)} + var(--spacing) * 6)`
        : 'calc(var(--spacing) * 2)';
  const top = `calc(${bar} * (100% - ${inset} - ${control}) + (1 - ${bar}) * (50% - ${control} / 2))`;
  const side = `calc(${bar} * (50% - ${indicatorWidth} / 2 - ${control}) + (1 - ${bar}) * ${inset})`;
  const indicatorStyle: CSSProperties = {
    top: `calc(${bar} * (100% - ${inset} - ${control}) + (1 - ${bar}) * ${inset})`,
    left: `calc(${bar} * (50% - ${indicatorWidth} / 2) + (1 - ${bar}) * ${inset})`,
    minWidth: `calc(${bar} * ${indicatorWidth})`,
  };

  // 端に着いてボタンが押せなくなるとき、そのボタンにあったフォーカスを反対のボタンへ移す（見失わないように）
  //   押せなくなったボタンからは、描き直した時点でブラウザがフォーカスを外すので、どちらにフォーカスがあったかを覚えておく
  const focused = useRef<'prev' | 'next' | null>(null);
  const track = (which: 'prev' | 'next') => ({
    onFocus: () => {
      focused.current = which;
    },
    onBlur: (event: FocusEvent<HTMLButtonElement>) => {
      // 押せなくなったために外れたときは、覚えたままにする
      if (event.currentTarget.disabled) return;
      focused.current = null;
    },
  });
  useLayoutEffect(() => {
    if (!hasPrev && focused.current === 'prev') nextRef.current?.focus();
    if (!hasNext && focused.current === 'next') prevRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 押せなくなったときだけ動かす
  }, [hasPrev, hasNext]);

  return (
    <>
      <button
        ref={prevRef}
        type="button"
        data-zoom-chrome=""
        data-slot="gallery-prev"
        aria-label={prevName}
        disabled={!hasPrev}
        onClick={() => hasPrev && onNavigate(-1)}
        {...track('prev')}
        className={navButtonClass}
        style={{ top, left: side }}
      >
        <CaretLeftIcon standalone />
      </button>
      {indicator !== 'none' && (
        <div
          aria-hidden
          data-zoom-chrome=""
          data-slot="gallery-indicator"
          data-indicator={indicator}
          className={[
            'absolute flex h-(--spacing-control) items-center justify-center px-3 text-body-sm text-(color:--image-zoom-caption-color)',
            // 点と数は Carousel と同じ部品（internal/position-indicator.tsx）。色は、明るい面でも暗い面でも見えるよう文字の色から作る
            '[--position-dot-color:color-mix(in_oklab,currentColor_30%,transparent)] [--position-dot-current-color:currentColor]',
            '[--position-count-current-color:currentColor] [--position-count-total-color:currentColor] [--position-count-current-weight:var(--font-weight-normal)] [--position-count-display:inline]',
          ].join(' ')}
          style={indicatorStyle}
        >
          {indicator === 'count' ? (
            <PositionCount index={index} count={count} />
          ) : (
            <PositionDots index={index} count={count} />
          )}
        </div>
      )}
      <button
        ref={nextRef}
        type="button"
        data-zoom-chrome=""
        data-slot="gallery-next"
        aria-label={nextName}
        disabled={!hasNext}
        onClick={() => hasNext && onNavigate(1)}
        {...track('next')}
        className={navButtonClass}
        style={{ top, right: side }}
      >
        <CaretRightIcon standalone />
      </button>
      {/* 送ったときだけ、画像の名前と位置を知らせる（開いたときは、面の名前と説明が読まれる） */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </>
  );
}
