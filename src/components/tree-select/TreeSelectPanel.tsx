'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { typeaheadTarget, type Typeahead } from '../tree/Tree';
import {
  type TreeSelectParentSelect,
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
import { cn, tv } from '../../internal/tv';

// 開いた面の中の木
//   行の形・字下げ・案内線・開け閉めの動きは Tree と同じ（tree.tokens.css の --tree-*。ADR-0162）
//   行の手応えと選んだ印は、選択肢の一覧と同じ（原則3・6、ADR-0053）
//     指している行（hover・キーボード）はグレーの塗り。フォーカスは行そのものへ移すが、線ではなく塗りで見せる（TimePicker の一覧と同じ）
//     1 つ選ぶ形: 選んだ行は部品の色の淡い面・太字・右端のチェック（Select の選んだ選択肢と同じ）
//     複数選ぶ形: 行の頭にチェックボックスの箱（Checkbox と同じ見た目）。親の箱は中をすべて選ぶとチェック、一部なら横線。面は敷かない
//   親の行の選び方（parentSelect — 軸 645・646）
//     none: 1 つ選ぶ形では親の行は開け閉めだけ。複数選ぶ形では親の箱で中をすべて選ぶ
//     self: 親の行そのもので親の値を選ぶ。開け閉めは山形だけで行う
//     row: 親の行は開け閉めだけ。開いた子の先頭に「親そのものを選ぶ行」を置く（Cascader の row と同じ考え方）
//   行の中で山形だけが開け閉めする形（self と、複数選ぶ形の none）では、山形の押せる範囲を行の高さの正方形にし、左を行の端にそろえる（軸 645）
//     載せると、その範囲に塗りを敷いて押せる範囲を見せる（見えない広がりにしない — 原則17）。正方形が文字にかからないよう、
//     字下げと案内線の位置を正方形の幅から作り直す（Tree のトークンを、この木の中だけで上書きする）
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
    // 開閉の印。閉じているときは右、開くと下を向く（回すのは中の印だけ。押せる範囲の塗りは回さない）
    caret: 'grid size-(--spacing-icon) shrink-0 place-items-center text-fg-subtle',
    caretIcon: [
      'grid place-items-center',
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
  variants: {
    // 山形だけで開け閉めする行の、山形の押せる範囲（軸 645）。行の高さの正方形で、左は行の端にそろえる
    caretTarget: {
      true: {
        // 字下げは「正方形の幅＋間」、案内線は正方形の真ん中。子の行の正方形が、親の行の文字の頭にそろう
        root: '[--tree-guide-left:calc(var(--spacing-control)/2)] [--tree-indent:calc(var(--spacing-control)+var(--tree-gap))]',
        row: 'ps-0',
        caret:
          'size-(--spacing-control) rounded-[calc(var(--radius-control)-var(--spacing))] hover:bg-(color:--tree-row-press)',
        caretSpace: 'w-(--spacing-control)',
      },
      false: {},
    },
    // 行を 2 つに割る形（軸 645 の比較中の F）。行の本体を押すと選び、右端の区切った山形のボタンで開け閉めする
    split: {
      true: {
        root: '[--tree-guide-left:calc(var(--tree-row-px)/2)]',
        caret: [
          '-me-(--tree-row-px) size-auto h-(--spacing-control) w-(--spacing-control) self-stretch',
          'rounded-e-[calc(var(--radius-control)-var(--spacing))] border-s-(length:--border-width-thin) border-(color:--color-line)',
          'hover:bg-(color:--tree-row-press)',
        ],
      },
      false: {},
    },
    // 左の帯で選び、名前で開く形（軸 645 の比較中の L+）。帯は行の左端の列で、字下げは帯の右から数える
    band: {
      true: {
        root: '[--tree-guide-left:calc(var(--spacing-control)+var(--tree-gap)*2+var(--spacing-icon)/2)]',
        row: 'ms-0 ps-0',
      },
      false: {},
    },
    // 開け閉めをなくし、全部開いたまま字下げで見せる形（軸 645 の比較中の P）。案内線は引かない
    flat: {
      true: { root: '[--tree-guide-width:0px]' },
      false: {},
    },
  },
  defaultVariants: { caretTarget: false, split: false, band: false, flat: false },
});

/** 面の中の行の見た目。ほかの形（1 段ずつ進む形・検索の形）の行も同じ見た目にする */
export const treeSelectRowStyles = panel;

/**
 * 1 つ選ぶ形で、親も選べるときの面の形（軸 645 の比較中）。tree は今の木、split は行を 2 つに割る形、
 * drill は 1 段ずつ進む形、search は検索を主にした形
 */
export type TreeSelectLayout = 'tree' | 'split' | 'drill' | 'search' | 'band' | 'flat';

// 左の帯（L+・P）。行の高さいっぱい・幅一定で、左は行の端にそろえる。選べる行だけ印を置き、帯のどこを押しても選ぶ
const bandClass =
  'grid h-(--spacing-control) w-(--spacing-control) shrink-0 self-stretch place-items-center rounded-s-[calc(var(--radius-control)-var(--spacing))]';

/**
 * 1 つ選ぶ形の、選べる行の印（軸 645 の比較中）。check は選んだ行の右端にチェックだけ、
 * radio は選べる行の頭にラジオの丸、hover-check は指している行の右端に薄いチェックを出す
 */
export type TreeSelectItemIndicator = 'check' | 'radio' | 'hover-check';

/** 行の key。親そのものを選ぶ行は、親と値が同じなので印を付けて分ける */
function keyOf(node: TreeNode) {
  return `${node.selfOf ? 'self' : 'node'}:${typeof node.value}:${String(node.value)}`;
}

export interface TreeSelectPanelProps {
  index: TreeIndex;
  multiple: boolean;
  /** 1 つ選ぶ形の、選んだ値 */
  selected: ListboxValue | null;
  /** 複数選ぶ形の、行の箱の状態（中と連動する形では、中の葉から出す） */
  checkState: (node: TreeNode) => 'checked' | 'mixed' | 'unchecked';
  itemIndicator: TreeSelectItemIndicator;
  /** parentSelect="row" の、親そのものを選ぶ行の文字 */
  parentRowLabel: (node: TreeNode) => string;
  expanded: ReadonlySet<ListboxValue>;
  onExpandedChange: (value: ListboxValue, open: boolean) => void;
  /** 行を選んだとき（1 つ選ぶ形は選ぶ、複数選ぶ形は箱を切り替える） */
  onPick: (node: TreeNode) => void;
  /** 親の行の選び方 */
  parentSelect: TreeSelectParentSelect;
  color: ListboxColor;
  /** 木の読み上げの名前 */
  label: string;
  /** 開いたときに、選んだ行（なければ最初の行）へフォーカスを移す */
  autoFocus: boolean;
  /** シートの中に置くか。シートは面がスクロールするので、木の高さを決めない */
  sheet: boolean;
  /** 行を 2 つに割る形（F）。行の本体で選び、右端の山形のボタンで開け閉めする */
  split?: boolean;
  /** 左の帯で選び、名前で開く形（L+） */
  band?: boolean;
  /** 開け閉めをなくし、全部開いたまま見せる形（P）。帯は L+ と同じ */
  flat?: boolean;
}

export function TreeSelectPanel({
  index,
  multiple,
  selected,
  checkState,
  itemIndicator,
  parentRowLabel,
  expanded,
  onExpandedChange,
  onPick,
  parentSelect,
  color,
  label,
  autoFocus,
  sheet,
  split = false,
  band: bandProp = false,
  flat = false,
}: TreeSelectPanelProps) {
  const band = bandProp || flat;
  // 全部開いた形（P）では、いつもすべての親を開いておく
  const allParents = useMemo(
    () => new Set(index.order.filter(isParent).map((node) => node.value)),
    [index]
  );
  const openSet = flat ? allParents : expanded;
  // 親そのものを選ぶ行（parentSelect="row"）。親ごとに 1 つ作り、開いた子の先頭に置く
  const selfRows = useMemo(() => {
    const map = new Map<ListboxValue, TreeNode>();
    if (parentSelect !== 'row') return map;
    for (const node of index.order) {
      if (!isParent(node)) continue;
      map.set(node.value, {
        ...node,
        label: parentRowLabel(node),
        icon: undefined,
        depth: node.depth + 1,
        parent: node,
        children: [],
        selfOf: node,
      });
    }
    return map;
    // 文字の関数は描くたびに変わるので、木と選び方が変わったときだけ作り直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, parentSelect]);
  const visible = useMemo(
    () => visibleNodes(index, openSet, (node) => selfRows.get(node.value)),
    [index, openSet, selfRows]
  );
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const typeaheadRef = useRef<Typeahead>({ text: '', time: 0 });

  // 親の行が開け閉めだけをするか（選ぶ行・箱を持たない）
  const toggleOnly = (node: TreeNode) =>
    !split &&
    !band &&
    isParent(node) &&
    !node.selfOf &&
    (multiple ? parentSelect === 'row' : parentSelect !== 'self');
  // 1 つ選ぶ形で、その行を選んでいるか
  const isSelectedRow = (node: TreeNode) =>
    !multiple && selected != null && node.value === selected && !toggleOnly(node);
  // 複数選ぶ形の、行の箱の状態。開け閉めだけの親は箱を持たない
  const stateOf = (node: TreeNode) => (!multiple || toggleOnly(node) ? null : checkState(node));

  // Tab で止まる行（roving tabindex）。選んだ行、なければ最初に選んだ見えている行、なければ最初の行
  const [active, setActive] = useState<string | null>(() => {
    const first = visible.find((node) =>
      multiple ? (stateOf(node) ?? 'unchecked') !== 'unchecked' : isSelectedRow(node)
    );
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

  // 帯の形（L+・P）で、その行を選べるか。1 つ選ぶ形の親は parentSelect="self" のときだけ
  const canPick = (node: TreeNode) =>
    !node.disabled && (multiple || !isParent(node) || parentSelect === 'self');

  // 行を押したとき・Enter・Space。開け閉めだけの親は開け閉めし、ほかは選ぶ
  //   帯の形では、これは名前を押したとき。子を持つ行は開け閉め（P では開け閉めしない）、子がない行は選ぶ
  const activate = (node: TreeNode) => {
    if (band) {
      if (isParent(node) && !flat) onExpandedChange(node.value, !openSet.has(node.value));
      else if (canPick(node)) onPick(node);
      return;
    }
    if (toggleOnly(node)) {
      onExpandedChange(node.value, !expanded.has(node.value));
      return;
    }
    if (node.disabled) return;
    onPick(node);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, node: TreeNode) => {
    const at = visible.findIndex((item) => keyOf(item) === keyOf(node));
    const parent = isParent(node) && !node.selfOf;
    const open = parent && openSet.has(node.value);
    // 全部開いた形（P）では → ← は開け閉めせず、子と親へ移るだけ
    if (flat && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      move(
        event.key === 'ArrowRight'
          ? parent
            ? visible[at + 1]
            : undefined
          : (node.parent ?? undefined)
      );
      return;
    }
    // 帯の形では、Space は帯（選ぶ）、Enter は名前（開け閉めか選ぶ）と同じ
    if (band && event.key === ' ') {
      event.preventDefault();
      if (canPick(node)) onPick(node);
      return;
    }
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
        if (!parent) break;
        // 閉じているときは開き、開いているときは最初の子（親そのものを選ぶ行があればそれ）へ
        if (!open) onExpandedChange(node.value, true);
        else move(visible[at + 1]);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (open) onExpandedChange(node.value, false);
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

  const box = choiceStyles({ color });
  // 行の中で山形だけが開け閉めする形（self と、複数選ぶ形の none）。山形の押せる範囲を行の高さの正方形にする
  const caretTarget =
    !split && !band && (parentSelect === 'self' || (multiple && parentSelect === 'none'));
  const slots = panel({ caretTarget, split, band, flat });

  const renderRow = (node: TreeNode) => {
    const key = keyOf(node);
    const parent = isParent(node) && !node.selfOf;
    const open = parent && openSet.has(node.value);
    const state = stateOf(node);
    const pickInBand = band && canPick(node);
    // 全部開いた形（P）で選べない親は、押せない見出しの見た目（Select のまとまりの見出しと同じ文字）
    const heading = flat && parent && !pickInBand;
    const isSelected = isSelectedRow(node);
    // 1 つ選ぶ形で、この行を選べるか
    const pickable = !multiple && !node.disabled && !toggleOnly(node);
    const radio = !multiple && itemIndicator === 'radio';
    return (
      <div
        ref={(element) => {
          if (element) rowRefs.current.set(key, element);
          else rowRefs.current.delete(key);
        }}
        role="treeitem"
        aria-expanded={parent ? open : undefined}
        aria-selected={multiple ? undefined : isSelected}
        aria-checked={state == null ? undefined : state === 'mixed' ? 'mixed' : state === 'checked'}
        aria-disabled={node.disabled || undefined}
        data-slot="tree-select-item"
        data-self-row={node.selfOf ? '' : undefined}
        data-highlighted={highlighted === key && !heading ? '' : undefined}
        data-disabled={node.disabled ? '' : undefined}
        tabIndex={key === tabbable ? 0 : -1}
        className={slots.row({
          className: heading
            ? 'cursor-default text-(length:--text-label) leading-(--leading-label) font-bold text-fg-muted'
            : undefined,
        })}
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
        onClick={() => activate(node)}
      >
        {band && (
          // 左の帯（L+・P）。選べる行だけ印を置き、帯のどこを押しても選ぶ。載せると帯に塗りを敷く
          <span
            aria-hidden
            data-slot="tree-select-band"
            className={cn(
              bandClass,
              pickInBand
                ? 'cursor-pointer hover:bg-(color:--tree-row-press)'
                : 'pointer-events-none'
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (pickInBand) onPick(node);
            }}
          >
            {pickInBand &&
              (multiple ? (
                <span
                  data-checked={state === 'checked' ? '' : undefined}
                  data-indeterminate={state === 'mixed' ? '' : undefined}
                  data-unchecked={state === 'unchecked' ? '' : undefined}
                  className={box.box({
                    className:
                      'pointer-events-none rounded-(--checkbox-radius) group-data-highlighted/tree-select-row:[--color-choice:var(--color-choice-hover)]',
                  })}
                >
                  <span className={box.mark()}>
                    <CheckboxMark />
                  </span>
                </span>
              ) : (
                <span
                  data-checked={isSelected ? '' : undefined}
                  data-unchecked={isSelected ? undefined : ''}
                  className={box.box({
                    className:
                      'pointer-events-none rounded-full group-data-highlighted/tree-select-row:[--color-choice:var(--color-choice-hover)]',
                  })}
                >
                  <span className={box.dot()} />
                </span>
              ))}
          </span>
        )}
        {band && (
          // 字下げ（帯の右から数える）
          <span aria-hidden className="w-[calc(var(--tree-indent)*var(--tree-depth))] shrink-0" />
        )}
        {split || flat ? null : parent ? (
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
            <span className={slots.caretIcon()}>
              <CaretRightIcon />
            </span>
          </span>
        ) : (
          <span aria-hidden className={slots.caretSpace()} />
        )}
        {state != null && !band && (
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
        {radio && !band && (
          // 選べる行の頭のラジオの丸（itemIndicator="radio"）。開け閉めだけの親の行は、場所だけ空ける
          <span
            aria-hidden
            data-slot="tree-select-radio"
            data-checked={isSelected ? '' : undefined}
            data-unchecked={isSelected ? undefined : ''}
            data-disabled={node.disabled ? '' : undefined}
            className={box.box({
              className: [
                'pointer-events-none rounded-full group-data-highlighted/tree-select-row:[--color-choice:var(--color-choice-hover)]',
                pickable ? undefined : 'invisible',
              ],
            })}
          >
            <span className={box.dot()} />
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
        {!multiple && !radio && !band && (
          <span
            aria-hidden
            data-slot="tree-select-check"
            className={slots.check({
              className: isSelected
                ? undefined
                : itemIndicator === 'hover-check' && pickable
                  ? 'opacity-0 group-data-highlighted/tree-select-row:opacity-40'
                  : 'invisible',
            })}
          >
            <CheckIcon />
          </span>
        )}
        {split && parent && (
          // 右端の区切った山形のボタン（F）。押すと開け閉めだけをし、行を選ばない
          <span
            aria-hidden
            data-slot="tree-select-caret"
            className={slots.caret()}
            onClick={(event) => {
              event.stopPropagation();
              onExpandedChange(node.value, !open);
            }}
          >
            <span className={slots.caretIcon()}>
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
    const selfRow = selfRows.get(node.value);
    return (
      <BaseCollapsible.Root
        key={keyOf(node)}
        open={openSet.has(node.value)}
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
          {selfRow && (
            <li role="none" className="flex flex-col">
              {renderRow(selfRow)}
            </li>
          )}
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
