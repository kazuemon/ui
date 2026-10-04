'use client';

import { type RefObject, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { SortableDragSourceVariant, SortableGrabArea, SortableVariant } from './Sortable';
import type { ListContextValue, SortableMoveActions } from './sortable-context';
import { useMoveAnimation } from './use-move-animation';

// Sortable（ul）と SortableTableBody（tbody）が共有する、並びの状態とキーボード・移動の操作
//   value を並べ替えて onValueChange を呼び、動いた項目を滑らせ、何番目に移ったかを読み上げの文にする

export const defaultMovedText = (position: number, total: number) =>
  `${position} 番目に移しました（${total} 件中）`;

// Sortable と SortableTableBody の既定の文（どちらも同じ）
export const DEFAULT_INSTRUCTION_TEXT = '上下の矢印キーで並べ替えます';
export const DEFAULT_MOVE_LABELS = {
  up: '上へ移動',
  down: '下へ移動',
  first: '先頭へ移動',
  last: '末尾へ移動',
  menu: '移動',
} as const;

export interface SortableListOptions {
  value: string[];
  onValueChange?: (value: string[]) => void;
  variant: SortableVariant;
  dragSourceVariant: SortableDragSourceVariant;
  grabArea: SortableGrabArea;
  disabled: boolean;
  instructionId: string;
  movedText: (position: number, total: number) => string;
  moveActions: SortableMoveActions;
  labels: ListContextValue['labels'];
  hideMoveItems: boolean;
}

export function useSortableList(
  listRef: RefObject<HTMLElement | null>,
  {
    value,
    onValueChange,
    variant,
    dragSourceVariant,
    grabArea,
    disabled,
    instructionId,
    movedText,
    moveActions,
    labels,
    hideMoveItems,
  }: SortableListOptions
) {
  const focusAfterMove = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const { capture } = useMoveAnimation(listRef);

  // 描き直すたびに最新の value を読む（move を context に載せても、context を毎回作り直さない）
  const latest = useRef({ value, onValueChange, movedText });
  useLayoutEffect(() => {
    latest.current = { value, onValueChange, movedText };
  });

  const { up, down, first, last, menu } = labels;
  const context = useMemo<ListContextValue>(
    () => ({
      variant,
      dragSourceVariant,
      grabArea,
      disabled,
      instructionId,
      moveActions,
      labels: { up, down, first, last, menu },
      order: value,
      hideMoveItems,
      claimFocus: (item) => {
        if (item === undefined || focusAfterMove.current !== item) return false;
        focusAfterMove.current = null;
        return true;
      },
      moveTo: (item, to) => {
        const { value: order, onValueChange: notify, movedText: text } = latest.current;
        const from = order.indexOf(item);
        if (!notify || from < 0 || from === to || to < 0 || to >= order.length) return;
        const next = [...order];
        next.splice(from, 1);
        next.splice(to, 0, item);
        capture();
        focusAfterMove.current = item;
        notify(next);
        setAnnouncement(text(to + 1, order.length));
      },
    }),
    [
      variant,
      dragSourceVariant,
      grabArea,
      disabled,
      instructionId,
      moveActions,
      up,
      down,
      first,
      last,
      menu,
      value,
      hideMoveItems,
      capture,
    ]
  );
  return { context, announcement };
}
