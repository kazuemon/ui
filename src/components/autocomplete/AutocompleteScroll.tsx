'use client';

import { type ReactNode, type RefObject, useCallback } from 'react';

import { listboxList } from '../../internal/listbox/listbox-styles';
import { ScrollFrame } from '../../internal/ScrollFrame';

/**
 * 浮かぶ候補の一覧を包むスクロールの枠。ScrollArea と同じ見た目（続きがある端の内側の影、載せたときとスクロール中に出るつまみ）
 * 枠は ScrollArea と同じ中身（internal/ScrollFrame）。スクロールする要素（Viewport）を、高さを測る一覧の ref にする
 *   Viewport は欄とは別のキーボードの止まり先にしない（focusable={false}）。印を移した候補は、Base UI が見える位置へ送る
 *   高さの上限と上下の余白は、選択肢の一覧（listboxList）と同じ。上限は部品が測って書く --select-popup-max-height
 */
export function AutocompleteScroll({
  viewportRef,
  loadingRow,
  children,
}: {
  /** スクロールする要素を受け取る。useListboxLayout の listRef を渡す */
  viewportRef: RefObject<HTMLDivElement | null>;
  /** 一覧の下に読み込み中の行を出すか（下の余白をその行に持たせる） */
  loadingRow: boolean;
  /** 選択肢の一覧（Base UI の List） */
  children: ReactNode;
}) {
  const setViewport = useCallback(
    (element: HTMLDivElement | null) => {
      viewportRef.current = element;
    },
    [viewportRef]
  );
  return (
    <ScrollFrame
      slot="autocomplete-scroll"
      // 面の左右の余白の分だけ外へ広げ、影とつまみを面の端に寄せる。中身の余白は Viewport が持ち直す
      className="-mx-(--select-popup-padding)"
      focusable={false}
      viewportClassName={listboxList({
        presentation: 'popover',
        loadingRow,
        className: 'px-(--select-popup-padding) has-data-empty:py-0',
      })}
      // Base UI の既定（min-width: fit-content）は、長い文字で中身を広げてしまうので、枠の幅に収める
      contentStyle={{ minWidth: 0 }}
      // 横にはスクロールしないので、左右の端の影とつまみは置かない
      inlineEdges={false}
      orientation="vertical"
      // つまみは、最初の行の上端から最後の行の下端までの範囲を動く（面の角にかからない）
      scrollbarClassName="my-(--select-popup-padding)"
      onViewport={setViewport}
    >
      {children}
    </ScrollFrame>
  );
}
