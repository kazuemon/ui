'use client';

import type { CSSProperties, ReactElement, ReactNode, Ref, UIEventHandler } from 'react';

import { ScrollFrame } from '../ScrollFrame';

// 続きの印（SheetMoreCue）を上下に挟んで、中身をスクロールさせる枠
// 浮かぶ選択肢の一覧（Select・Combobox・TagsInput）・Menu・シート（Drawer・Inspector）・Dialog の中身が共有する
//   スクロールする要素は ScrollArea と同じ中身（ScrollFrame）。続きの印は前後（before・after）に置き、
//   濃さ（--cue-*）は viewportRef に付けた useMoreCues・updateCues が枠に書く
//   スクロールバーは ScrollArea のつまみ（軸 580・581）。ブラウザのスクロールバーは出さない
//   止まり先: 一覧は止まらない（項目へ矢印キーで移り、ブラウザが見える位置へ送る）。シート・Dialog の中身は、
//   ブラウザのスクロールする箱と同じく、あふれていて中に止まれるものがないときだけ止まる（focusable="auto"）

export interface MoreCueScrollProps {
  /**
   * つまみの出し方。scroll は載せたとき・スクロール中だけ、always はいつも
   * @default 'scroll'
   */
  scrollbar?: 'scroll' | 'always';
  /**
   * スクロールする要素をキーボードの止まり先にするか。auto は、あふれていて中に Tab で止まれるものがないときだけ止まる
   * （ブラウザのスクロールする箱と同じ。シート・Dialog の中身）。選択肢やメニューの一覧は false（項目へ矢印キーで移る）
   * @default false
   */
  focusable?: false | 'auto';
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
  scrollbar = 'scroll',
  focusable = false,
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
  return (
    <ScrollFrame
      slot="more-cue-scroll"
      className={className}
      style={style}
      focusable={focusable}
      scrollbar={scrollbar}
      edgeShadow={false}
      orientation="vertical"
      viewportClassName={viewportClassName}
      viewportSlot={viewportSlot}
      viewportRender={viewportRender}
      viewportProps={{ ref: viewportRef, onScroll }}
      // Base UI の既定（min-width: fit-content）は、長い文字で中身を広げてしまうので、枠の幅に収める
      contentStyle={{ minWidth: 0 }}
      scrollbarClassName={scrollbarClassName}
      before={before}
      after={after}
    >
      {children}
    </ScrollFrame>
  );
}
