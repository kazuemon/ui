'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { typeaheadTarget, type Typeahead } from '../tree/Tree';
import {
  checkStateOf,
  isParent,
  type TreeIndex,
  type TreeNode,
  visibleNodes,
} from './tree-select-items';
import { CheckboxMark } from '../../internal/choice/CheckboxMark';
import { choiceSize, choiceStyles } from '../../internal/choice/choice-styles';
import { CaretRightIcon, CheckIcon } from '../../internal/icons';
import type { ListboxColor } from '../../internal/listbox/listbox-colors';
import type { ListboxValue } from '../../internal/listbox/use-listbox-option';
import { ScrollFrame } from '../../internal/ScrollFrame';
import { tv } from '../../internal/tv';

// 開いた面の中の木
//   行の形・字下げ・案内線・開け閉めの動きは Tree と同じ（tree.tokens.css の --tree-*。ADR-0162）
//   行の手応えと選んだ印は、選択肢の一覧と同じ（原則3・6、ADR-0053）
//     指している行（hover・キーボード）はグレーの塗り。フォーカスは行そのものへ移すが、線ではなく塗りで見せる（TimePicker の一覧と同じ）
//     1 つ選ぶ形: 選んだ行は部品の色の淡い面・太字・右端のチェック（Select の選んだ選択肢と同じ）
//     複数選ぶ形: 行の頭にチェックボックスの箱（Checkbox と同じ見た目）。親の箱は中をすべて選ぶとチェック、一部なら横線。面は敷かない
//   文字は欄の値と同じ大きさ（指でも小さくしない — 原則11。選択肢の一覧と同じ）
//   読み上げと操作は WAI-ARIA の tree にならう
//     ↑↓ で行を移り、→ で開いて中へ、← で閉じて親へ、Home・End で端へ。文字を打つと、その文字で始まる行へ移る（Tree と同じ）
//     Enter・Space で選ぶ（1 つ選ぶ形は選んで閉じ、複数選ぶ形は箱を切り替える）
//     1 つ選ぶ形は aria-selected、複数選ぶ形は aria-checked（中間は mixed）と aria-multiselectable

const panel = tv({
  slots: {
    // 面の中の字下げは、面の中のアイコンの大きさ（欄と同じ）から作り直す（:root の --tree-indent は :root のアイコンの大きさで決まるため）
    root: [
      'flex flex-col text-input [--spacing-icon:var(--spacing-icon-input)]',
      '[--tree-guide-left:calc(var(--tree-row-px)+var(--spacing-icon)/2)] [--tree-indent:calc(var(--spacing-icon)+var(--tree-gap))]',
      choiceSize,
    ],
    group: [
      'relative flex flex-col',
      // 字下げの案内線（Tree と同じ）。親の印の中心にそろえ、行の塗りより手前に引く
      "before:pointer-events-none before:absolute before:inset-y-0 before:left-[calc(var(--tree-indent)*var(--tree-depth)+var(--tree-guide-left))] before:z-1 before:w-(--tree-guide-width) before:bg-(color:--color-line) before:content-['']",
      // 開け閉めは中身の高さを動かす（Tree の panelMotion="collapse" と同じ）
      'h-(--collapsible-panel-height) [overflow:clip] [overflow-clip-margin:var(--tree-panel-clip-margin)]',
      'transition-[height] duration-(--duration-normal) ease-(--ease-sheet)',
      'data-ending-style:h-0 data-starting-style:h-0 motion-reduce:[transition:none]',
    ],
    row: [
      'group/tree-select-row relative flex min-h-(--spacing-control) cursor-pointer items-center gap-(--tree-gap) outline-none select-none',
      'rounded-[calc(var(--radius-control)-var(--spacing))] ps-(--tree-row-px) pe-(--tree-row-px)',
      // 字下げの分だけ左を空ける（Tree の rowWidth="indent" と同じ）
      'ms-[calc(var(--tree-indent)*var(--tree-depth))]',
      // 指している行（hover・キーボード）はグレーの塗り。押しているあいだは一段濃く（閉じない行の手応え — 原則3）
      'data-highlighted:bg-field data-highlighted:active:bg-(color:--tree-row-press)',
      // 選んだ行（1 つ選ぶ形）: 部品の色の淡い面と文字。指しているときは面を一段濃く
      'aria-selected:text-(color:--color-on-select-item-selected) aria-selected:not-data-highlighted:bg-(color:--color-select-item-selected)',
      'aria-selected:data-highlighted:bg-(color:--color-select-item-selected-highlight)',
      // 選べない行: 押せない文字の色。マウスでは塗らず、キーボードで止まったときだけ塗る（選択肢の一覧と同じ）
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled)',
      'data-disabled:data-highlighted:bg-transparent data-disabled:data-highlighted:focus-visible:bg-field',
    ],
    // 開閉の印。閉じているときは右、開くと下を向く。押すと開け閉めだけをする（行を選ばない）
    //   押せる範囲を見せるため、載せると印のまわりに塗りを敷く（原則17）
    caret: [
      'grid size-(--spacing-icon) shrink-0 place-items-center rounded-[calc(var(--radius-control)-var(--spacing)*2)] text-fg-subtle',
      'hover:bg-(color:--tree-row-press)',
      '[transition:rotate_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-aria-expanded/tree-select-row:rotate-90',
    ],
    caretSpace: 'size-(--spacing-icon) shrink-0',
    icon: 'grid size-(--spacing-icon) shrink-0 place-items-center [&_svg]:size-(--spacing-icon)',
    label: [
      'min-w-0 flex-1 truncate',
      'group-aria-selected/tree-select-row:[font-weight:var(--select-item-selected-weight)]',
    ],
    check: 'flex shrink-0 text-(color:--color-select-check)',
  },
});

const slots = panel();

export interface TreeSelectPanelProps {
  index: TreeIndex;
  multiple: boolean;
  /** 1 つ選ぶ形の、選んだ値 */
  selected: ListboxValue | null;
  /** 複数選ぶ形の、選んだ葉 */
  checkedLeaves: ReadonlySet<ListboxValue>;
  expanded: ReadonlySet<ListboxValue>;
  onExpandedChange: (value: ListboxValue, open: boolean) => void;
  /** 行を選んだとき（1 つ選ぶ形は選ぶ、複数選ぶ形は箱を切り替える） */
  onPick: (node: TreeNode) => void;
  /** 親の行を選べるか（1 つ選ぶ形）。false では、親の行を押すと開け閉めだけをする */
  parentSelectable: boolean;
  color: ListboxColor;
  /** 木の読み上げの名前 */
  label: string;
  /** 開いたときに、選んだ行（なければ最初の行）へフォーカスを移す */
  autoFocus: boolean;
  /** シートの中に置くか。シートは面がスクロールするので、木の高さを決めない */
  sheet: boolean;
}

export function TreeSelectPanel({
  index,
  multiple,
  selected,
  checkedLeaves,
  expanded,
  onExpandedChange,
  onPick,
  parentSelectable,
  color,
  label,
  autoFocus,
  sheet,
}: TreeSelectPanelProps) {
  const visible = useMemo(() => visibleNodes(index, expanded), [index, expanded]);
  const rowRefs = useRef(new Map<ListboxValue, HTMLElement>());
  const typeaheadRef = useRef<Typeahead>({ text: '', time: 0 });
  // Tab で止まる行（roving tabindex）。選んだ行、なければ最初に選んだ葉の見えている行、なければ最初の行
  const [active, setActive] = useState<ListboxValue | null>(() => {
    if (!multiple && selected != null && visible.some((node) => node.value === selected))
      return selected;
    if (multiple) {
      const first = visible.find((node) => checkStateOf(node, checkedLeaves) !== 'unchecked');
      if (first) return first.value;
    }
    return visible[0]?.value ?? null;
  });
  const [hovered, setHovered] = useState<ListboxValue | null>(null);
  const [focused, setFocused] = useState<ListboxValue | null>(null);
  const highlighted = hovered ?? focused;
  // 閉じた枝の中に指している行が隠れたら、Tab で止まる行を見えている行へ戻す
  const tabbable = visible.some((node) => node.value === active) ? active : visible[0]?.value;

  useEffect(() => {
    if (!autoFocus || tabbable == null) return;
    rowRefs.current.get(tabbable)?.focus();
    // 開いたときだけ移す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (node: TreeNode | undefined) => {
    if (!node) return;
    setActive(node.value);
    setHovered(null);
    rowRefs.current.get(node.value)?.focus();
  };

  // 行を押したとき・Enter・Space。親の行を選べない形では、開け閉めだけをする
  const activate = (node: TreeNode) => {
    if (!multiple && isParent(node) && !parentSelectable) {
      onExpandedChange(node.value, !expanded.has(node.value));
      return;
    }
    if (node.disabled) return;
    onPick(node);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, node: TreeNode) => {
    const at = visible.findIndex((item) => item.value === node.value);
    const open = expanded.has(node.value);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(visible[at + 1]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(visible[at - 1]);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (!isParent(node)) break;
        if (!open) onExpandedChange(node.value, true);
        else move(node.children[0]);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (isParent(node) && open) onExpandedChange(node.value, false);
        else move(node.parent ?? undefined);
        break;
      case 'Home':
        event.preventDefault();
        move(visible[0]);
        break;
      case 'End':
        event.preventDefault();
        move(visible.at(-1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(node);
        break;
      default: {
        // 型あたり（Tree と同じ）。修飾キーと、変換中の入力は相手にしない
        if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) break;
        if (event.nativeEvent.isComposing) break;
        const rows = visible
          .map((item) => rowRefs.current.get(item.value))
          .filter((row): row is HTMLElement => row != null);
        const target = typeaheadTarget(rows, at, event.key, typeaheadRef.current);
        const value = target ? visible[rows.indexOf(target)]?.value : undefined;
        if (value !== undefined) {
          event.preventDefault();
          move(index.byValue.get(value));
        }
      }
    }
  };

  const box = choiceStyles({ color });

  const renderNode = (node: TreeNode): ReactNode => {
    const parent = isParent(node);
    const open = parent && expanded.has(node.value);
    const state = multiple ? checkStateOf(node, checkedLeaves) : null;
    const isSelected = !multiple && node.value === selected;
    const row = (
      <div
        ref={(element) => {
          if (element) rowRefs.current.set(node.value, element);
          else rowRefs.current.delete(node.value);
        }}
        role="treeitem"
        aria-expanded={parent ? open : undefined}
        aria-selected={multiple ? undefined : isSelected}
        aria-checked={state == null ? undefined : state === 'mixed' ? 'mixed' : state === 'checked'}
        aria-disabled={node.disabled || undefined}
        data-slot="tree-select-item"
        data-highlighted={highlighted === node.value ? '' : undefined}
        data-disabled={node.disabled ? '' : undefined}
        tabIndex={node.value === tabbable ? 0 : -1}
        className={slots.row()}
        style={{ ['--tree-depth' as string]: node.depth }}
        onMouseMove={() => {
          if (hovered !== node.value) setHovered(node.value);
        }}
        onFocus={() => {
          setActive(node.value);
          setFocused(node.value);
        }}
        onBlur={() => setFocused((current) => (current === node.value ? null : current))}
        onKeyDown={(event) => handleKeyDown(event, node)}
        onClick={() => activate(node)}
      >
        {parent ? (
          <span
            aria-hidden
            data-slot="tree-select-caret"
            className={slots.caret()}
            onClick={(event) => {
              // 印は開け閉めだけ。行を選ばない
              event.stopPropagation();
              onExpandedChange(node.value, !open);
            }}
          >
            <CaretRightIcon />
          </span>
        ) : (
          <span aria-hidden className={slots.caretSpace()} />
        )}
        {state != null && (
          // 箱は見た目だけ（読み上げは行の aria-checked）。Checkbox と同じ見た目
          <span
            aria-hidden
            data-slot="tree-select-box"
            data-checked={state === 'checked' ? '' : undefined}
            data-indeterminate={state === 'mixed' ? '' : undefined}
            data-unchecked={state === 'unchecked' ? '' : undefined}
            data-disabled={node.disabled ? '' : undefined}
            className={box.box({
              className:
                'pointer-events-none rounded-(--checkbox-radius) group-data-highlighted/tree-select-row:[--color-choice:var(--color-choice-hover)]',
            })}
          >
            <span className={box.mark()}>
              <CheckboxMark />
            </span>
          </span>
        )}
        {node.icon != null && (
          <span aria-hidden className={slots.icon()}>
            {node.icon}
          </span>
        )}
        <span data-slot="tree-label" className={slots.label()}>
          {node.label}
        </span>
        {!multiple && (
          <span
            aria-hidden
            className={slots.check({ className: isSelected ? undefined : 'invisible' })}
          >
            <CheckIcon />
          </span>
        )}
      </div>
    );
    if (!parent)
      return (
        <li key={String(node.value)} role="none" className="flex flex-col">
          {row}
        </li>
      );
    return (
      <BaseCollapsible.Root
        key={String(node.value)}
        open={open}
        onOpenChange={(next) => onExpandedChange(node.value, next)}
        render={<li role="none" className="flex flex-col" />}
      >
        {row}
        <BaseCollapsible.Panel
          role="group"
          data-slot="tree-select-group"
          className={slots.group()}
          style={{ ['--tree-depth' as string]: node.depth }}
          render={<ul />}
        >
          {node.children.map(renderNode)}
        </BaseCollapsible.Panel>
      </BaseCollapsible.Root>
    );
  };

  const tree = (
    <ul
      role="tree"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      data-slot="tree-select-tree"
      className={slots.root()}
      onMouseLeave={() => setHovered(null)}
    >
      {index.roots.map(renderNode)}
    </ul>
  );

  // シートは面がスクロールするので、木はそのまま置く
  if (sheet) return tree;
  return (
    <ScrollFrame
      slot="tree-select-scroll"
      className="min-h-0 flex-1"
      focusable={false}
      viewportClassName="max-h-[min(var(--available-height,100dvh),calc(var(--spacing-control)*var(--tree-select-max-rows)+var(--spacing)*2))] p-(--spacing)"
      contentStyle={{ minWidth: 0 }}
      inlineEdges={false}
      orientation="vertical"
      scrollbarClassName="my-(--spacing)"
    >
      {tree}
    </ScrollFrame>
  );
}
