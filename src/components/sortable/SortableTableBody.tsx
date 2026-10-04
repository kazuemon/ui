'use client';

import {
  type ComponentProps,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';
import type { SortableProps } from './Sortable';
import { ListContext } from './sortable-context';
import {
  DEFAULT_INSTRUCTION_TEXT,
  DEFAULT_MOVE_LABELS,
  defaultMovedText,
  useSortableList,
} from './use-sortable-list';

// 並べ替えられる表の本文（tbody）。Sortable と同じ並びの状態・キーボード・移動の操作を、表の行に使う
//   行は SortableItem に render（DataTableRow・tr）を渡して描く。つまみと移動の操作は、行の中のセルに置く
//   つまみの説明と読み上げの箱は、表の中に置けない（tbody の外の要素は表を壊す）ので、ページの末尾（body）に描く
//     Dialog など aria-modal の面の中にあるときは、その面の中に描く（面の外は読み上げから隠れ、知らせが聞こえない）
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

// 読み上げの箱を置く場所。いちばん近い aria-modal の面（Dialog・AlertDialog・Drawer）か、なければページの末尾
const modalSurface = '[aria-modal="true"], [role="dialog"], [role="alertdialog"]';
const announcerContainer = (element: HTMLElement) =>
  element.closest<HTMLElement>(modalSurface) ?? element.ownerDocument.body;

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
  instructionText = DEFAULT_INSTRUCTION_TEXT,
  moveActions = 'none',
  moveUpLabel = DEFAULT_MOVE_LABELS.up,
  moveDownLabel = DEFAULT_MOVE_LABELS.down,
  moveFirstLabel = DEFAULT_MOVE_LABELS.first,
  moveLastLabel = DEFAULT_MOVE_LABELS.last,
  moveMenuName = DEFAULT_MOVE_LABELS.menu,
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
  // サーバーと、画面に出る前の 1 回目の描画では null（読み上げの箱は、出たあとに置き場所を決めて足す）
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (bodyRef.current != null) setContainer(announcerContainer(bodyRef.current));
  }, []);
  return (
    <ListContext value={context}>
      <tbody ref={mergedRef} className={body({ motion, className })} {...props}>
        {children}
      </tbody>
      {container != null &&
        createPortal(
          <>
            <span id={instructionId} hidden>
              {instructionText}
            </span>
            <VisuallyHidden role="status">{announcement}</VisuallyHidden>
          </>,
          container
        )}
    </ListContext>
  );
}
