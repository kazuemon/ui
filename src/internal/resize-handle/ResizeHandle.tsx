'use client';

import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { tv } from '../tv';

/** つまみの見せ方。line はふだん見せず、載せる・動かす・フォーカスで境の線を出す。grip は境の真ん中に小さな縦のつまみをいつも出す */
export type ResizeHandleLook = 'line' | 'grip';

/** 矢印キーで動かす幅（px） */
export const RESIZE_KEY_STEP = 16;

/** キーで動かす向き。grow・shrink は RESIZE_KEY_STEP ずつ、min・max は範囲の端へ */
export type ResizeKeyAction = 'grow' | 'shrink' | 'min' | 'max';

// 幅を変えるつまみの見た目 — ADR-0362（Sidebar）。Inspector・DataTable の列も同じ形を使う
//   境の線の上に、つかめる幅（--resize-handle-hit）を半分ずつ重ねる。置き場所（inset・start・end）は使う側が className で決める
//   線: ふだんは --resize-handle-rest、載せたとき --resize-handle-hover、動かしているあいだ --resize-handle-active、
//     フォーカス（キーボード）で --resize-handle-focus。太さは --resize-handle-line-width
//   grip: ふだんから見せる小さな縦のつまみ（look="grip"）
const styles = tv({
  slots: {
    handle: [
      'group/resize-handle absolute z-3 w-(--resize-handle-hit) cursor-col-resize touch-none outline-none',
      "before:absolute before:inset-y-0 before:start-1/2 before:w-(--resize-handle-line-width) before:-translate-x-1/2 before:bg-(color:--resize-handle-rest) before:content-['']",
      'before:[transition:background-color_var(--duration-fast)_var(--ease-press)] motion-reduce:before:[transition:none]',
      'hover:before:bg-(color:--resize-handle-hover)',
      'focus-visible:before:bg-(color:--resize-handle-focus)',
      'data-resizing:before:bg-(color:--resize-handle-active)',
    ],
    grip: 'pointer-events-none absolute start-1/2 top-1/2 h-(--resize-handle-grip-height) w-(--resize-handle-grip-width) -translate-1/2 rounded-pill bg-(color:--resize-handle-grip)',
  },
});

export interface ResizeHandleProps {
  /** 読み上げの名前（「列の幅」など） */
  name: string;
  /** 幅を変える要素の id（aria-controls） */
  controls?: string;
  /** 幅を変える要素。まだ幅を決めていないときに、描いた幅を測る */
  target: RefObject<HTMLElement | null>;
  /** いまの幅（px）。まだ決めていないときは undefined（描いた幅を測る） */
  width: number | undefined;
  min: number;
  /** 上限。書かないときは上限なし（読み上げの最大値も付けない） */
  max?: number;
  /**
   * つまみが、幅を変える要素のどちらの端にあるか。end は要素の終わりの端（左から右へ書く向きでは右の端。右へ引くと広がる）、
   * start は始まりの端。left・right は書く向きによらない左右の端（右に置いたパネルの左の端は left。左へ引くと広がる）
   */
  edge: 'start' | 'end' | 'left' | 'right';
  /** @default 'line' */
  look?: ResizeHandleLook;
  /** 幅を変えたとき（範囲に収めた値） */
  onWidthChange: (width: number) => void;
  /** 動かしはじめ・動かし終わり。動かしているあいだ、幅の動き（transition）を止めるのに使う */
  onResizingChange?: (resizing: boolean) => void;
  /** ダブルクリックで呼ぶ（はじめの幅に戻す） */
  onReset?: () => void;
  /** 引いているあいだ、範囲に収める前の幅を先に渡す。true を返すと、既定の動き（範囲に収めて onWidthChange）をしない（Sidebar の畳む動き） */
  onDrag?: (raw: number) => boolean;
  /** キーで動かすとき、既定の動きの前に呼ぶ。true を返すと、既定の動きをしない */
  onKeyAction?: (action: ResizeKeyAction, current: number) => boolean;
  /** 引きはじめの幅。書かないときは width か、描いた幅 */
  startWidth?: () => number;
  /** 読み上げの値。書かないときは width か、描いた幅 */
  valueNow?: number;
  /** 置き場所のクラス（inset-y-0・-end-[calc(var(--resize-handle-hit)/2)] など） */
  className?: string;
  /** data-slot */
  slot?: string;
}

/**
 * 要素の端の幅を変えるつまみ（role="separator"）。ドラッグで幅を変え、← → で RESIZE_KEY_STEP ずつ、Home・End で最小・最大。
 * ダブルクリックで onReset を呼ぶ
 */
export function ResizeHandle({
  name,
  controls,
  target,
  width,
  min,
  max,
  edge,
  look = 'line',
  onWidthChange,
  onResizingChange,
  onReset,
  onDrag,
  onKeyAction,
  startWidth,
  valueNow,
  className,
  slot,
}: ResizeHandleProps) {
  const s = styles();
  const [resizing, setResizing] = useState(false);
  const drag = useRef<{ startX: number; startWidth: number; sign: number } | null>(null);
  const clamp = (value: number) =>
    Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, Math.round(value)));
  const current = () => width ?? target.current?.offsetWidth ?? min;
  // 右へ引いて広がるか（左から右へ書く向きで、終わりの端にあるつまみ）
  const growSign = (element: Element) => {
    if (edge === 'left') return -1;
    if (edge === 'right') return 1;
    const rtl = getComputedStyle(element).direction === 'rtl';
    return (edge === 'end' ? 1 : -1) * (rtl ? -1 : 1);
  };
  const changeResizing = (next: boolean) => {
    setResizing(next);
    onResizingChange?.(next);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startWidth: startWidth?.() ?? current(),
      sign: growSign(event.currentTarget),
    };
    changeResizing(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = d.startWidth + (event.clientX - d.startX) * d.sign;
    if (onDrag?.(raw)) return;
    onWidthChange(clamp(raw));
  };
  const onPointerEnd = () => {
    if (!drag.current) return;
    drag.current = null;
    changeResizing(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const sign = growSign(event.currentTarget);
    const right = sign > 0 ? 'grow' : 'shrink';
    const left = sign > 0 ? 'shrink' : 'grow';
    const action: ResizeKeyAction | undefined =
      event.key === 'ArrowRight'
        ? right
        : event.key === 'ArrowLeft'
          ? left
          : event.key === 'Home'
            ? 'min'
            : event.key === 'End' && max !== undefined
              ? 'max'
              : undefined;
    if (!action) return;
    event.preventDefault();
    const now = current();
    if (onKeyAction?.(action, now)) return;
    const next =
      action === 'grow'
        ? now + RESIZE_KEY_STEP
        : action === 'shrink'
          ? now - RESIZE_KEY_STEP
          : action === 'min'
            ? min
            : (max ?? now);
    onWidthChange(clamp(next));
  };

  // まだ幅を変えていないときの読み上げの値は、描いた幅を測って持つ
  const [measured, setMeasured] = useState<number>();
  useLayoutEffect(() => {
    const element = target.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(() => setMeasured(Math.round(element.offsetWidth)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={name}
      aria-controls={controls}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={valueNow ?? width ?? measured}
      tabIndex={0}
      data-slot={slot}
      data-resizing={resizing || undefined}
      className={s.handle({ className })}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onDoubleClick={onReset}
      onKeyDown={onKeyDown}
    >
      {look === 'grip' && <span aria-hidden="true" className={s.grip()} />}
    </div>
  );
}
