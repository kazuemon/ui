'use client';

import type { ReactNode, Ref, UIEventHandler } from 'react';

import { type ListboxPresentation, listboxList } from './listbox-styles';
import { MoreCueScroll } from '../sheet/MoreCueScroll';

/**
 * 選択肢の一覧（Base UI の List）を包むスクロールの枠。Select・Combobox・TagsInput が共有する
 * スクロールする要素（Viewport）を、高さを測る一覧の ref（useListboxLayout の listRef）にする
 *   高さの上限と上下の余白は listboxList。枠は面の左右の余白の分だけ外へ広げ、つまみを面の端に寄せる（中身の余白は Viewport が持ち直す）
 *   区切り線は枠の幅いっぱいに引く（--sheet-inset を 0 にする。枠がすでに面の端まで届いている）
 *   続きの印は before・after に渡す（枠に書く --cue-* を読む）
 */
export function ListboxScroll({
  presentation,
  loadingRow,
  viewportRef,
  onScroll,
  before,
  after,
  viewportClassName,
  children,
}: {
  presentation: ListboxPresentation;
  /** 一覧の下に読み込み中の行を出すか（下の余白をその行に持たせる） */
  loadingRow: boolean;
  /** スクロールする要素を受け取る。useListboxLayout の listRef を渡す */
  viewportRef: Ref<HTMLDivElement>;
  onScroll?: UIEventHandler<HTMLDivElement>;
  before?: ReactNode;
  after?: ReactNode;
  /** スクロールする要素に足すクラス */
  viewportClassName?: string;
  /** 選択肢の一覧（Base UI の List） */
  children: ReactNode;
}) {
  const sheet = presentation === 'sheet';
  return (
    <MoreCueScroll
      surface={sheet ? 'sheet' : 'popover'}
      className={['-mx-(--spacing) [--sheet-inset:0px]', sheet && 'min-h-0 flex-1']
        .filter(Boolean)
        .join(' ')}
      viewportRef={viewportRef}
      onScroll={onScroll}
      viewportClassName={listboxList({
        presentation,
        loadingRow,
        className: ['px-(--spacing)', viewportClassName].filter(Boolean).join(' '),
      })}
      // 浮かぶ面では、つまみは最初の行の上端から最後の行の下端までの範囲を動く（面の角にかからない）
      scrollbarClassName={sheet ? undefined : 'my-(--spacing)'}
      before={before}
      after={after}
    >
      {children}
    </MoreCueScroll>
  );
}
