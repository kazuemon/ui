'use client';

import { type RefObject, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { SortableDragSourceVariant, SortableGrabArea, SortableVariant } from './Sortable';
import type {
  ListContextValue,
  SortableMenuLayout,
  SortableMoveActions,
  SortableMoveTarget,
} from './sortable-context';
import { useMoveAnimation } from './use-move-animation';

// Sortable（ul）と SortableTableBody（tbody）が共有する、並びの状態とキーボード・移動の操作
//   value を並べ替えて onValueChange を呼び、動いた項目を滑らせ、何番目に移ったかを読み上げの文にする

export const defaultMovedText = (position: number, total: number) =>
  `${position} 番目に移しました（${total} 件中）`;
export const defaultMoveToTargetLabel = (label: string) => `${label}へ移動`;
export const defaultSwapLabel = (name: string) => `${name}と入れ替え`;

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
  moveTargets?: SortableMoveTarget[];
  onMoveToTarget?: (item: string, target: string) => void;
  showSwapActions: boolean;
  menuLayout: SortableMenuLayout;
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
    moveTargets,
    onMoveToTarget,
    showSwapActions,
    menuLayout,
  }: SortableListOptions
) {
  const focusAfterMove = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const { capture } = useMoveAnimation(listRef);

  // 描き直すたびに最新の value を読む（move を context に載せても、context を毎回作り直さない）
  const latest = useRef({ value, onValueChange, movedText, onMoveToTarget });
  useLayoutEffect(() => {
    latest.current = { value, onValueChange, movedText, onMoveToTarget };
  });
  // 項目の読み上げの名前（入れ替える相手の一覧に出す）。項目が描くたびに書き込む
  const [names] = useState(() => new Map<string, string>());

  const { up, down, first, last, menu, swap, moveTo: moveToLabel, moveToTitle, swapTitle } = labels;
  const canMoveToTarget = onMoveToTarget != null;
  const context = useMemo<ListContextValue>(
    () => ({
      variant,
      dragSourceVariant,
      grabArea,
      disabled,
      instructionId,
      moveActions,
      labels: { up, down, first, last, menu, swap, moveTo: moveToLabel, moveToTitle, swapTitle },
      order: value,
      moveTargets: canMoveToTarget ? moveTargets : undefined,
      showSwapActions,
      menuLayout,
      names,
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
      swap: (item, other) => {
        const { value: order, onValueChange: notify, movedText: text } = latest.current;
        const from = order.indexOf(item);
        const to = order.indexOf(other);
        if (!notify || from < 0 || to < 0 || from === to) return;
        const next = [...order];
        next[from] = other;
        next[to] = item;
        capture();
        focusAfterMove.current = item;
        notify(next);
        setAnnouncement(text(to + 1, order.length));
      },
      moveToTarget: (item, target) => {
        latest.current.onMoveToTarget?.(item, target);
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
      swap,
      moveToLabel,
      moveToTitle,
      swapTitle,
      value,
      moveTargets,
      canMoveToTarget,
      showSwapActions,
      menuLayout,
      names,
      capture,
    ]
  );
  return { context, announcement };
}
