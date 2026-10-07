'use client';

import type { CSSProperties, ReactElement, ReactNode, Ref, UIEventHandler } from 'react';

import { ScrollFrame } from '../ScrollFrame';

// 続きの印（SheetMoreCue）を上下に挟んで、中身をスクロールさせる枠
// 浮かぶ選択肢の一覧（Select・Combobox・TagsInput）・Menu・シート（Drawer・Inspector）・Dialog の中身が共有する
//   スクロールする要素は ScrollArea と同じ中身（ScrollFrame）。続きの印は前後（before・after）に置き、
//   濃さ（--cue-*）は viewportRef に付けた useMoreCues・updateCues が枠に書く
//   スクロールする要素は、欄や面の中なので止まり先にしない（中の要素へ移ったときは、ブラウザが見える位置へ送る）
// 軸 580（popover）・581（sheet）の比較用: ブラウザのスクロールバーと ScrollArea のつまみ、どちらを出すかをトークンで切り替える。決まったら畳む
//   ブラウザのスクロールバーは Base UI が隠すので、隠す指定より強く scrollbar-width を戻す。色はブラウザの既定に近い灰色
//   （scrollbar-color を決めないと、Base UI の ::-webkit-scrollbar の指定で隠れたままになる）
const switches = {
  popover: {
    root: '[--scroll-area-scrollbar-idle:var(--listbox-scroll-thumb-idle)]',
    viewport: '[scrollbar-color:#8e8e8e_#f8f8f8]! [scrollbar-width:var(--listbox-scroll-native)]!',
    scrollbar: '[visibility:var(--listbox-scroll-thumb)]',
  },
  sheet: {
    root: '[--scroll-area-scrollbar-idle:var(--sheet-scroll-thumb-idle)]',
    viewport: '[scrollbar-color:#8e8e8e_#f8f8f8]! [scrollbar-width:var(--sheet-scroll-native)]!',
    scrollbar: '[visibility:var(--sheet-scroll-thumb)]',
  },
} as const;

export interface MoreCueScrollProps {
  /** どこのスクロールか。popover は浮かぶ面（軸 580）、sheet はシートと Dialog（軸 581） */
  surface: 'popover' | 'sheet';
  /** スクロールする要素の前・後ろに置く続きの印 */
  before?: ReactNode;
  after?: ReactNode;
  /** スクロールする要素の ref（続きの印の濃さを書く useMoreCues・一覧の高さを測る listRef） */
  viewportRef?: Ref<HTMLDivElement>;
  onScroll?: UIEventHandler<HTMLDivElement>;
  /** 枠のクラス（flex の伸び縮み・面の余白の分だけ外へ広げる指定など） */
  className?: string;
  style?: CSSProperties;
  /** スクロールする要素のクラス（内側の余白・高さの上限） */
  viewportClassName?: string;
  /** スクロールする要素の印（data-slot）。部品の中身の印をそのまま残す */
  viewportSlot?: string;
  /** スクロールする要素を、別の部品（Base UI の Drawer.Content など）で描く */
  viewportRender?: ReactElement;
  /** つまみの帯に足すクラス */
  scrollbarClassName?: string;
  children?: ReactNode;
}

export function MoreCueScroll({
  surface,
  before,
  after,
  viewportRef,
  onScroll,
  className,
  style,
  viewportClassName,
  viewportSlot,
  viewportRender,
  scrollbarClassName,
  children,
}: MoreCueScrollProps) {
  const s = switches[surface];
  return (
    <ScrollFrame
      slot="more-cue-scroll"
      className={[s.root, className].filter(Boolean).join(' ')}
      style={style}
      focusable={false}
      edgeShadow={false}
      orientation="vertical"
      viewportClassName={[viewportClassName, s.viewport].filter(Boolean).join(' ')}
      viewportSlot={viewportSlot}
      viewportRender={viewportRender}
      viewportProps={{ ref: viewportRef, onScroll }}
      // Base UI の既定（min-width: fit-content）は、長い文字で中身を広げてしまうので、枠の幅に収める
      contentStyle={{ minWidth: 0 }}
      scrollbarClassName={[s.scrollbar, scrollbarClassName].filter(Boolean).join(' ')}
      before={before}
      after={after}
    >
      {children}
    </ScrollFrame>
  );
}
