'use client';

import { createContext, type ReactNode } from 'react';

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
  /** 入れ替える相手を選ぶ項目の文字（相手の名前を受ける） */
  swap: (name: string) => string;
  /** ほかのリストへ移す項目の文字（移す先の名前を受ける） */
  moveTo: (label: string) => string;
  /** 移す先・入れ替える相手をまとめる見出し（submenu・group の形で使う） */
  moveToTitle: string;
  swapTitle: string;
}

/** ほかのリストへ移す先（item-menu の「〜へ移動」） */
export interface SortableMoveTarget {
  /** 移す先を見分ける値。onMoveToTarget に渡します */
  value: string;
  /** メニューに出す名前（「完了」→「完了へ移動」） */
  label: string;
}

/**
 * ︙ のメニューに、移す先・入れ替える相手をどう並べるか（軸 484 で比べるための切り替え）
 *   flat: 移動の項目のあとに区切り線を引き、1 つずつ並べる。submenu: 「〜へ移動 ›」の入れ子に入れる。group: 見出しを付けたまとまりにする
 */
export type SortableMenuLayout = 'flat' | 'submenu' | 'group';

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
  /** ほかのリストへ移す先。onMoveToTarget がないときは undefined */
  moveTargets: SortableMoveTarget[] | undefined;
  /** 入れ替える相手を選ぶ項目を出す */
  showSwapActions: boolean;
  /** 移す先・入れ替える相手の並べ方 */
  menuLayout: SortableMenuLayout;
  /** 項目の読み上げの名前（入れ替える相手の一覧に出す）。項目が描くたびに書き込む */
  names: Map<string, string>;
  /** 項目を、もう 1 つの項目と入れ替える */
  swap: (item: string, other: string) => void;
  /** 項目を、ほかのリストへ移す（onMoveToTarget を呼ぶ） */
  moveToTarget: (item: string, target: string) => void;
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
  /** ︙ のメニューに足す項目（SortableItem の menu） */
  menu: ReactNode;
  /** 表の行（tr）として描く。つまみと移動の操作は、置かれたセルの中に並ぶ */
  row: boolean;
}

export const ItemContext = createContext<ItemContextValue | null>(null);
