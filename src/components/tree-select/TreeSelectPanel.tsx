'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { typeaheadTarget, type Typeahead } from '../tree/Tree';
import {
  coveringAncestor,
  isParent,
  isUnder,
  type TreeIndex,
  type TreeNode,
  type TreeSelectParentSelect,
  visibleNodes,
} from './tree-select-items';
import { CheckboxMark } from '../../internal/choice/CheckboxMark';
import { choiceSize, choiceStyles } from '../../internal/choice/choice-styles';
import { CaretRightIcon } from '../../internal/icons';
import type { ListboxColor } from '../../internal/listbox/listbox-colors';
import type { ListboxValue } from '../../internal/listbox/use-listbox-option';
import { ScrollFrame } from '../../internal/ScrollFrame';
import { cn, tv } from '../../internal/tv';

// 開いた面の中の木
//   TreeSelect は木の全体を見て、点（行）を指す部品。親も 1 つの点で、特別な行（「〇〇 のすべて」）は作らない
//   行の形・字下げ・案内線・開け閉めの動きは Tree と同じ（tree.tokens.css の --tree-*）。行の手応えと選んだ印は選択肢の一覧と同じ
//   選べる行は、親子に関係なく左に印（1 つ選ぶ形は Radio と同じ丸、複数選ぶ形は Checkbox と同じ箱）
//   子を持つ行の開け閉めは、右端の正方形（行の高さいっぱい。上下・右とも行の端にそろう）だけ。それより左は押すと選ぶ
//   選べない親（ただのまとまり）は、印も左の余白もない。行のどこを押しても開け閉めする（右端の山形は向きの表示）
//   親の選び方（parentSelect）
//     none: 親は選べない。印は子だけ
//     label: 親も独立した項目。親を選んでも子は変わらない
//     scope: 親が子を覆う（複数選ぶ形）。親を入れると値は親 1 つになり、配下は「含まれる」見た目（塗らない箱に淡いチェック）
//       含まれる行を押すと個別の選択に切り替える（pressScope）。子を全部入れても親にはまとめない
//       1 つ選ぶ形では label と同じ
//   親の箱は親そのものの状態だけを表す（中間の − は使わない）。配下に選んだ行がある親は、開け閉めに関係なく名前の右に点（どのモードでも同じ）
//   読み上げと操作は WAI-ARIA の tree にならう
//     ↑↓ で行を移り、→ で開いて中へ、← で閉じて親へ、Home・End で端へ。文字を打つと、その文字で始まる行へ移る（Tree と同じ）
//     Enter・Space で選ぶ（選べない親では開け閉め）。右端の正方形にはフォーカスを止めない
//     1 つ選ぶ形は aria-selected、複数選ぶ形は aria-checked と aria-multiselectable

const panel = tv({
  slots: {
    root: [
      'flex flex-col text-input [--spacing-icon:var(--spacing-icon-input)]',
      choiceSize,
      // 字下げは「印の幅＋間」。子の印が、親の文字の頭にそろう。案内線は親の印の真ん中
      '[--tree-guide-left:calc(var(--tree-row-px)+var(--choice-size)/2)] [--tree-indent:calc(var(--choice-size)+var(--tree-gap))]',
    ],
    group: [
      'relative flex flex-col',
      // 字下げの案内線（Tree と同じ）。行の塗りより手前に引く
      "before:pointer-events-none before:absolute before:inset-y-0 before:left-[calc(var(--tree-indent)*var(--tree-depth)+var(--tree-guide-left))] before:z-1 before:w-(--tree-guide-width) before:bg-(color:--color-line) before:content-['']",
      // 開け閉めは中身の高さを動かす（Tree の panelMotion="collapse" と同じ）
      'h-(--collapsible-panel-height) [overflow:clip] [overflow-clip-margin:var(--tree-panel-clip-margin)]',
      'transition-[height] duration-(--duration-normal) ease-(--ease-sheet)',
      'data-ending-style:h-0 data-starting-style:h-0 motion-reduce:[transition:none]',
    ],
    row: [
      'group/tree-select-row relative flex min-h-(--spacing-control) cursor-pointer items-center gap-(--tree-gap) outline-none select-none',
      'rounded-[calc(var(--radius-control)-var(--spacing))] ps-(--tree-row-px)',
      // 字下げの分だけ左を空ける（Tree の rowWidth="indent" と同じ）
      'ms-[calc(var(--tree-indent)*var(--tree-depth))]',
      // 指している行（hover・キーボード）はグレーの塗り。押しているあいだは一段濃く（閉じない行の手応え — 原則3）
      'data-highlighted:bg-field data-highlighted:active:bg-(color:--tree-row-press)',
      // 選べない行: 押せない文字の色。マウスでは塗らず、キーボードで止まったときだけ塗る（選択肢の一覧と同じ）
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled)',
      'data-disabled:data-highlighted:bg-transparent data-disabled:data-highlighted:focus-visible:bg-field',
    ],
    mark: 'grid size-(--choice-size) shrink-0 place-items-center',
    icon: 'grid size-(--spacing-icon) shrink-0 place-items-center [&_svg]:size-(--spacing-icon)',
    label: [
      'min-w-0 flex-1 truncate',
      'group-aria-selected/tree-select-row:[font-weight:var(--select-item-selected-weight)]',
    ],
    // 親の配下に選んでいるものがある印
    dot: 'size-1.5 shrink-0 rounded-full bg-(color:--color-select-check)',
    // 右端の正方形の開け閉め。行の高さいっぱいの正方形で、上下・右とも行の端にそろえる
    toggle: [
      'grid size-(--spacing-control) shrink-0 place-items-center self-stretch text-fg-subtle',
      'rounded-e-[calc(var(--radius-control)-var(--spacing))] hover:bg-(color:--tree-row-press)',
    ],
    toggleIcon: [
      'grid place-items-center',
      '[transition:rotate_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-aria-expanded/tree-select-row:rotate-90',
    ],
  },
  variants: {
    // 1 つ選ぶ形の選んだ行。fill は Select と同じ淡い面と文字の色、text は面を敷かない（丸と太字だけ）
    selectedIndicator: {
      fill: {
        row: [
          'aria-selected:text-(color:--color-on-select-item-selected) aria-selected:not-data-highlighted:bg-(color:--color-select-item-selected)',
          'aria-selected:data-highlighted:bg-(color:--color-select-item-selected-highlight)',
        ],
      },
      text: {},
    },
  },
  defaultVariants: { selectedIndicator: 'fill' },
});

/** 1 つ選ぶ形の、選んだ行の見せ方。fill は淡い面と文字の色、text は面を敷かず丸と太字だけ */
export type TreeSelectSelectedIndicator = 'fill' | 'text';

// 「含まれる」箱の見た目（scope）。塗らない箱（選んでいない箱の塗り）に淡いチェックで、自分で入れたチェックと見分ける
const includedBox = '[--choice-mark:var(--color-fg-muted)]';

function keyOf(node: TreeNode) {
  return `${typeof node.value}:${String(node.value)}`;
}

export interface TreeSelectPanelProps {
  index: TreeIndex;
  multiple: boolean;
  /** 親の選び方 */
  parentSelect: TreeSelectParentSelect;
  /** 選んでいる値（1 つ選ぶ形は 0〜1 個） */
  values: ReadonlySet<ListboxValue>;
  expanded: ReadonlySet<ListboxValue>;
  onExpandedChange: (value: ListboxValue, open: boolean) => void;
  /** 行を選んだとき（1 つ選ぶ形は選ぶ、複数選ぶ形は入れ替える） */
  onPick: (node: TreeNode) => void;
  color: ListboxColor;
  /** 木の読み上げの名前 */
  label: string;
  /** 開いたときに、選んだ行（なければ最初の行）へフォーカスを移す */
  autoFocus: boolean;
  /** シートの中に置くか。シートは面がスクロールするので、木の高さを決めない */
  sheet: boolean;
  /** 1 つ選ぶ形の選んだ行の見せ方 */
  selectedIndicator: TreeSelectSelectedIndicator;
}

export function TreeSelectPanel({
  index,
  multiple,
  parentSelect,
  values,
  expanded,
  onExpandedChange,
  onPick,
  color,
  label,
  autoFocus,
  sheet,
  selectedIndicator,
}: TreeSelectPanelProps) {
  const slots = panel({ selectedIndicator });
  const visible = useMemo(() => visibleNodes(index, expanded), [index, expanded]);
  const box = choiceStyles({ color });
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const typeaheadRef = useRef<Typeahead>({ text: '', time: 0 });
  const scope = multiple && parentSelect === 'scope';

  // その行が選べるか（印を持つか）。none の親は、ただのまとまり
  const pickable = (node: TreeNode) => !isParent(node) || parentSelect !== 'none';
  // 複数選ぶ形の印の状態
  //   親の箱は親そのものの状態だけ。配下に選んだ子があっても中間（−）にはせず、点で示す
  const stateOf = (node: TreeNode): 'checked' | 'included' | 'unchecked' => {
    if (values.has(node.value)) return 'checked';
    if (scope && coveringAncestor(node, values)) return 'included';
    return 'unchecked';
  };
  // 親の配下に、選んでいるものがあるか
  const hasInside = (node: TreeNode) =>
    index.order.some((item) => values.has(item.value) && isUnder(item, node));

  // Tab で止まる行（roving tabindex）。最初に選んだ見えている行、なければ最初の行
  const [active, setActive] = useState<string | null>(() => {
    const first = visible.find((node) => values.has(node.value));
    return first ? keyOf(first) : visible[0] ? keyOf(visible[0]) : null;
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const highlighted = hovered ?? focused;
  // 閉じた枝の中に指している行が隠れたら、Tab で止まる行を見えている行へ戻す
  const tabbable = visible.some((node) => keyOf(node) === active)
    ? active
    : visible[0] && keyOf(visible[0]);

  useEffect(() => {
    if (!autoFocus || tabbable == null) return;
    rowRefs.current.get(tabbable)?.focus();
    // 開いたときだけ移す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (node: TreeNode | undefined) => {
    if (!node) return;
    setActive(keyOf(node));
    setHovered(null);
    rowRefs.current.get(keyOf(node))?.focus();
  };

  // 行を押したとき・Enter・Space。選べない親は開け閉め、ほかは選ぶ
  const press = (node: TreeNode) => {
    if (!pickable(node)) {
      onExpandedChange(node.value, !expanded.has(node.value));
      return;
    }
    if (node.disabled) return;
    onPick(node);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, node: TreeNode) => {
    const at = visible.findIndex((item) => keyOf(item) === keyOf(node));
    const parent = isParent(node);
    const open = parent && expanded.has(node.value);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(visible[at + 1]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(visible[at - 1]);
        break;
      case 'Home':
        event.preventDefault();
        move(visible[0]);
        break;
      case 'End':
        event.preventDefault();
        move(visible.at(-1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        // 閉じているときは開き、開いているときは最初の子へ
        if (parent && !open) onExpandedChange(node.value, true);
        else if (parent) move(visible[at + 1]);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (open) onExpandedChange(node.value, false);
        else move(node.parent ?? undefined);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        press(node);
        break;
      default: {
        // 型あたり（Tree と同じ）。修飾キーと、変換中の入力は相手にしない
        if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) break;
        if (event.nativeEvent.isComposing) break;
        const rows = visible
          .map((item) => rowRefs.current.get(keyOf(item)))
          .filter((row): row is HTMLElement => row != null);
        const target = typeaheadTarget(rows, at, event.key, typeaheadRef.current);
        const next = target ? visible[rows.indexOf(target)] : undefined;
        if (next) {
          event.preventDefault();
          move(next);
        }
      }
    }
  };

  const renderMark = (node: TreeNode) => {
    if (!multiple) {
      const on = values.has(node.value);
      return (
        <span aria-hidden className={slots.mark()}>
          <span
            data-slot="tree-select-radio"
            data-checked={on ? '' : undefined}
            data-unchecked={on ? undefined : ''}
            data-disabled={node.disabled ? '' : undefined}
            className={box.box({
              className:
                'pointer-events-none rounded-full group-data-highlighted/tree-select-row:[--color-choice:var(--color-choice-hover)]',
            })}
          >
            <span className={box.dot()} />
          </span>
        </span>
      );
    }
    const state = stateOf(node);
    return (
      <span aria-hidden className={slots.mark()}>
        <span
          data-slot="tree-select-box"
          data-checked={state === 'checked' ? '' : undefined}
          data-included={state === 'included' ? '' : undefined}
          data-unchecked={state === 'unchecked' ? '' : undefined}
          data-disabled={node.disabled ? '' : undefined}
          className={box.box({
            className: [
              'pointer-events-none rounded-(--checkbox-radius) group-data-highlighted/tree-select-row:[--color-choice:var(--color-choice-hover)]',
              state === 'included' && includedBox,
            ],
          })}
        >
          <span className={box.mark()}>
            <CheckboxMark />
          </span>
        </span>
      </span>
    );
  };

  const renderRow = (node: TreeNode) => {
    const key = keyOf(node);
    const parent = isParent(node);
    const open = parent && expanded.has(node.value);
    const canPick = pickable(node);
    const state = multiple && canPick ? stateOf(node) : undefined;
    const selected = !multiple && canPick && values.has(node.value);
    const showDot = parent && hasInside(node);
    return (
      <div
        ref={(element) => {
          if (element) rowRefs.current.set(key, element);
          else rowRefs.current.delete(key);
        }}
        role="treeitem"
        aria-expanded={parent ? open : undefined}
        aria-selected={multiple || !canPick ? undefined : selected}
        // 含まれる行は、選んだ範囲に入っているので checked と読む
        aria-checked={state == null ? undefined : state !== 'unchecked'}
        // 親の点と同じことを、読み上げでは補足の説明で伝える
        aria-description={showDot ? '配下に選択あり' : undefined}
        aria-disabled={node.disabled || undefined}
        data-slot="tree-select-item"
        data-highlighted={highlighted === key ? '' : undefined}
        data-disabled={node.disabled ? '' : undefined}
        data-included={state === 'included' ? '' : undefined}
        tabIndex={key === tabbable ? 0 : -1}
        className={slots.row({ className: parent ? undefined : 'pe-(--tree-row-px)' })}
        style={{ ['--tree-depth' as string]: node.depth }}
        onMouseMove={() => {
          if (hovered !== key) setHovered(key);
        }}
        onFocus={() => {
          setActive(key);
          setFocused(key);
        }}
        onBlur={() => setFocused((current) => (current === key ? null : current))}
        onKeyDown={(event) => handleKeyDown(event, node)}
        onClick={() => press(node)}
      >
        {canPick && renderMark(node)}
        {node.icon != null && (
          <span aria-hidden className={slots.icon()}>
            {node.icon}
          </span>
        )}
        <span data-slot="tree-label" className={slots.label()}>
          {node.label}
        </span>
        {showDot && <span aria-hidden data-slot="tree-select-dot" className={slots.dot()} />}
        {parent && (
          <span
            aria-hidden
            data-slot="tree-select-caret"
            className={slots.toggle()}
            onClick={(event) => {
              // 正方形は開け閉めだけ。行を選ばない
              event.stopPropagation();
              onExpandedChange(node.value, !open);
            }}
          >
            <span className={slots.toggleIcon()}>
              <CaretRightIcon />
            </span>
          </span>
        )}
      </div>
    );
  };

  const renderNode = (node: TreeNode): ReactNode => {
    if (!isParent(node))
      return (
        <li key={keyOf(node)} role="none" className="flex flex-col">
          {renderRow(node)}
        </li>
      );
    return (
      <BaseCollapsible.Root
        key={keyOf(node)}
        open={expanded.has(node.value)}
        onOpenChange={(next) => onExpandedChange(node.value, next)}
        render={<li role="none" className="flex flex-col" />}
      >
        {renderRow(node)}
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
      className={cn(slots.root())}
      onMouseLeave={() => setHovered(null)}
    >
      {index.roots.map(renderNode)}
    </ul>
  );
  // シートは面がスクロールするので、木はそのまま置く
  if (sheet) return tree;
  // 浮かべた面の高さは中身に合わせ、上限は行の数（--tree-select-max-rows）と、上下の空き（--available-height）の小さい方
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
