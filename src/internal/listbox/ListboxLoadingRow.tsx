'use client';

import type { ReactNode, Ref } from 'react';

import { Spinner } from '../../components/loading/Loading';
import { listboxLoadingRow, type ListboxPresentation } from './listbox-styles';

interface ListboxLoadingRowProps {
  presentation: ListboxPresentation;
  /** 出す文（「読み込んでいます」など）。部品は文を組み立てない */
  children: ReactNode;
  /**
   * 読み上げの印（data-slot）。部品ごとの名前を付ける
   * @default 'listbox-loading'
   */
  slot?: string;
  /** 高さを測るための ref（useListboxLayout の loadingRowRef） */
  ref?: Ref<HTMLDivElement>;
}

/**
 * 止めずに読み込んでいるあいだ、選択肢の最後に出す行（design/adr/0042）。選べない
 * 選択肢の一覧（listbox）の中には選択肢しか置けないので、一覧のすぐ下（面の直下）に置く
 * 読み上げは本体のそばの status の箱が知らせるので、この行は role の箱にしない（二重に読まないため）
 * シートでも浮かぶ選択肢と同じ行（ADR-0055）。下の余白だけ、端末の安全領域の分を空ける
 */
export function ListboxLoadingRow({
  presentation,
  children,
  slot = 'listbox-loading',
  ref,
}: ListboxLoadingRowProps) {
  return (
    <div ref={ref} data-slot={slot} className={listboxLoadingRow({ presentation })}>
      <Spinner />
      {children}
    </div>
  );
}
