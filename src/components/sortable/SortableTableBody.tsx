'use client';

import { type ComponentProps, type ReactNode, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';
import type { SortableProps } from './Sortable';
import { ListContext } from './sortable-context';
import { defaultMovedText, useSortableList } from './use-sortable-list';

// 並べ替えられる表の本文（tbody）。Sortable と同じ並びの状態・キーボード・移動の操作を、表の行に使う
//   行は SortableItem に render（DataTableRow・tr）を渡して描く。つまみと移動の操作は、行の中のセルに置く
//   つまみの説明と読み上げの箱は、表の中に置けない（tbody の外の要素は表を壊す）ので、ページの末尾（body）に描く
//     サーバーでは描かず、画面に出たあとに足す

const body = tv({
  base: 'motion-reduce:[--sortable-move-duration:0ms]',
  variants: {
    motion: {
      slide: '',
      none: '[--sortable-move-duration:0ms]',
    },
  },
});

const subscribeNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

export interface SortableTableBodyProps
  extends
    Omit<ComponentProps<'tbody'>, 'defaultValue' | 'onChange' | 'children'>,
    Pick<
      SortableProps,
      | 'value'
      | 'onValueChange'
      | 'motion'
      | 'grabArea'
      | 'disabled'
      | 'movedText'
      | 'instructionText'
      | 'moveActions'
      | 'moveUpLabel'
      | 'moveDownLabel'
      | 'moveFirstLabel'
      | 'moveLastLabel'
      | 'moveMenuName'
      | 'hideMoveItems'
    > {
  /** 行（render に DataTableRow か tr を渡した SortableItem）を value の順に並べます */
  children?: ReactNode;
  /** 本文の要素（tbody）に付きます */
  className?: string;
}

/**
 * 並べ替えられる表の本文。DataTable（や Table）の TableBody の代わりに置き、行を SortableItem（render に DataTableRow）で描きます。
 * props は Sortable と同じです。つまみの列は足さないので、置きたいセルに SortableHandle を置きます。
 * ポインタで引く動きは持たないので、dnd-kit などとつなぎます（Recipes/Sortable の「表の行」）
 */
export function SortableTableBody({
  value,
  onValueChange,
  motion = 'slide',
  grabArea = 'handle',
  disabled = false,
  movedText = defaultMovedText,
  instructionText = '上下の矢印キーで並べ替えます',
  moveActions = 'none',
  moveUpLabel = '上へ移動',
  moveDownLabel = '下へ移動',
  moveFirstLabel = '先頭へ移動',
  moveLastLabel = '末尾へ移動',
  moveMenuName = '移動',
  hideMoveItems = false,
  className,
  children,
  ref,
  ...props
}: SortableTableBodyProps) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const mergedRef = useMergedRefs(ref, bodyRef);
  const instructionId = useId();
  const { context, announcement } = useSortableList(bodyRef, {
    value,
    onValueChange,
    variant: 'card',
    dragSourceVariant: 'outline',
    grabArea,
    disabled,
    instructionId,
    movedText,
    moveActions,
    labels: {
      up: moveUpLabel,
      down: moveDownLabel,
      first: moveFirstLabel,
      last: moveLastLabel,
      menu: moveMenuName,
    },
    hideMoveItems,
  });
  // サーバーと、画面に出る前の 1 回目の描画では false（ページの末尾に描くものは、出たあとに足す）
  const mounted = useSyncExternalStore(subscribeNothing, onClient, onServer);
  return (
    <ListContext value={context}>
      <tbody ref={mergedRef} className={body({ motion, className })} {...props}>
        {children}
      </tbody>
      {mounted &&
        createPortal(
          <>
            <span id={instructionId} hidden>
              {instructionText}
            </span>
            <VisuallyHidden role="status">{announcement}</VisuallyHidden>
          </>,
          document.body
        )}
    </ListContext>
  );
}
