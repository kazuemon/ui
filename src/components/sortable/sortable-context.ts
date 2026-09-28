'use client';

import { createContext } from 'react';

import type { SortableDragSourceVariant, SortableGrabArea, SortableVariant } from './Sortable';

/**
 * 引かずに並べ替える操作の出し方（WCAG 2.2 の 2.5.7。ポインタだけで、引かずに並べ替えを終えられるようにする）
 *   none: 出さない（既定）。item-menu: 項目の末尾に ︙ のボタンを置き、その中に移動の操作を入れる
 *   buttons: 項目の末尾に「上へ」「下へ」のボタンを出す
 */
export type SortableMoveActions = 'none' | 'item-menu' | 'buttons';

/** 移動の操作の文字 */
export interface MoveLabels {
  up: string;
  down: string;
  first: string;
  last: string;
  /** ︙ のボタンの読み上げの名前 */
  menu: string;
}

export interface ListContextValue {
  variant: SortableVariant;
  dragSourceVariant: SortableDragSourceVariant;
  grabArea: SortableGrabArea;
  disabled: boolean;
  instructionId: string;
  moveActions: SortableMoveActions;
  labels: MoveLabels;
  /** いまの並び（移動の操作を押せるかを決める） */
  order: readonly string[];
  /** 項目を to（0 から数える）へ動かし、onValueChange で知らせて、何番目に移ったかを読み上げる */
  moveTo: (item: string, to: number) => void;
  /** 動かしたのがこの項目なら true を返し、覚えていた項目を忘れる。描き直したあと、つまみにフォーカスを戻すのに使う */
  claimFocus: (item: string | undefined) => boolean;
}

export const ListContext = createContext<ListContextValue | null>(null);

export interface ItemContextValue {
  value: string;
  /** この項目だけを止めた（つまみの場所は残し、並ぶ文の頭をそろえる） */
  locked: boolean;
  /** 項目の読み上げの名前。つまみと移動のボタンの名前に入れる */
  name: string | undefined;
}

export const ItemContext = createContext<ItemContextValue | null>(null);
