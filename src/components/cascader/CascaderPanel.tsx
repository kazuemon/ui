'use client';

import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import {
  type CascaderItem,
  type CascaderValueItem,
  columnsOnPath,
  isParent,
  itemsOnPath,
  samePath,
} from './cascader-items';
import { CaretLeftIcon, CaretRightIcon, CheckIcon } from '../../internal/icons';
import { listboxEmptyClass } from '../../internal/listbox/listbox-styles';
import { MoreCueScroll } from '../../internal/sheet/MoreCueScroll';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import { useMoreCues } from '../../internal/sheet/use-more-cues';
import { cn, tv } from '../../internal/tv';
import { useIsomorphicLayoutEffect } from '../../internal/use-isomorphic-layout-effect';

// 開いた面の中身。段（列）ごとに、選択肢の一覧（listbox）を 1 つずつ置く
//   浮かべる形: 段を左から横に並べ、段のあいだに細い区切り線を引く。段ごとに縦にスクロールする
//   シート: 1 段ずつ出し、親を押すと次の段が右から滑り込む（原則16。Menu の入れ子のシートと同じ動き）。上の行の ‹ で戻る
// 項目の見た目は浮かぶ選択肢（Select）と同じ
//   いまたどっている行（道筋の親）と、hover・キーボードで止まった行は、入力欄の塗り（原則3）
//   選んだ値の行は、部品の色の淡い面・文字・チェックと太字（Select の選んだ項目と同じ。色は Popup に置いた selectedTokens）
//   親の行の右端に ›（入れ子のメニューの › と同じ）
// フォーカスは項目そのものに移す（項目は tabIndex を持ち、段ごとに 1 つだけ Tab で止まる）

/** 途中の段（親）で決められるか。none は最後の段だけ、row は次の段の先頭に親そのものを選ぶ行を置く */
export type CascaderParentSelect = 'none' | 'row';

/**
 * シートの高さ（比べている途中の切り替え。決まったら畳む）。root は 1 段目の高さのまま（Menu の入れ子の fixed）、
 * grow は長い段へ進むと伸ばし、縮めない、tallest は木のいちばん長い段に合わせて開いたときから決める、fit はいまの段に合わせて伸び縮みする（Menu の fit）
 */
export type CascaderSheetHeight = 'root' | 'grow' | 'tallest' | 'fit';

/** 段の中の 1 行。parentRow は、次の段の先頭に置く「親そのものを選ぶ」行（parentSelect="row"） */
interface Row<Value extends CascaderValueItem> {
  item: CascaderItem<Value>;
  /** この行までの道筋（親を選ぶ行では、親までの道筋） */
  path: Value[];
  label: string;
  parentRow: boolean;
}

// 項目の見た目（浮かぶ選択肢の項目と同じ寸法・色）
//   塗りは --cascader-option-bg に置き、状態ごとに差し替える。選んだ行の塗りは、ほかの状態より後ろに書いた複合の指定で勝たせる
const option = tv({
  slots: {
    root: [
      'group/option flex min-h-(--spacing-control) w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius-control)-var(--spacing))] px-[calc(var(--spacing-control-x)-var(--spacing))] text-start outline-none select-none',
      'bg-(color:--cascader-option-bg) [--cascader-option-bg:transparent]',
      // いまたどっている行・hover・キーボードで止まった行は入力欄の塗り
      'hover:[--cascader-option-bg:var(--color-field)] focus-visible:[--cascader-option-bg:var(--color-field)] data-active:[--cascader-option-bg:var(--color-field)]',
      // 選んだ値の行（Select の選んだ項目と同じ）。hover・たどっている・止まったときは一段濃く
      'data-selected:text-(color:--color-on-select-item-selected) data-selected:[--cascader-option-bg:var(--color-select-item-selected)]',
      'data-selected:hover:[--cascader-option-bg:var(--color-select-item-selected-highlight)] data-selected:focus-visible:[--cascader-option-bg:var(--color-select-item-selected-highlight)] data-selected:data-active:[--cascader-option-bg:var(--color-select-item-selected-highlight)]',
      // 選べない行: 押せない文字の色。hover では塗らず、キーボードで止まったときだけ塗る（Select の選べない選択肢と同じ）
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled)',
      'data-disabled:hover:[--cascader-option-bg:transparent] data-disabled:focus-visible:[--cascader-option-bg:var(--color-field)]',
    ],
    label:
      'min-w-0 flex-1 truncate group-data-selected/option:[font-weight:var(--select-item-selected-weight)]',
    // 右端の印（親の ›・選んだ値のチェック）
    trailing: 'flex shrink-0 text-fg-muted group-data-disabled/option:text-current',
    check: 'flex shrink-0 text-(color:--color-select-check)',
  },
});
const optionSlots = option();

// 段（浮かべる形）。幅は中身の長さで伸び、上限で切る。高さの上限は項目の数（最後の項目を半分見せる）と、画面の空き
const columnFrame =
  'min-w-(--cascader-column-min-width) max-w-(--cascader-column-max-width) shrink-0';
const columnDivider = 'border-s-(length:--border-width-thin) border-surface-line';
const columnViewport =
  'max-h-[min(var(--available-height,100vh),calc(var(--spacing-control)*var(--cascader-column-max-rows)+var(--spacing)*2))] p-(--spacing)';

// シートのパネル（Menu の入れ子のシートと同じ動き。src/internal/menu/MenuSlide.tsx）
//   高さは Menu の入れ子のシートの既定（submenuSheet="fixed"）と同じく、1 段目の高さのまま変えない。
//   パネルはどれも舞台いっぱいに重ね、1 段目より長い段はパネルの中でスクロールし、短い段は下が空く
type SlidePosition = 'current' | 'before' | 'after';
const panelPosition: Record<SlidePosition, string> = {
  current: 'visible translate-x-0',
  before: 'invisible -translate-x-full rtl:translate-x-full',
  after: 'invisible translate-x-full rtl:-translate-x-full',
};
const panelMotion: Record<SlidePosition, string> = {
  current:
    'motion-safe:[transition:translate_var(--duration-sheet)_var(--ease-sheet),visibility_0s]',
  before:
    'motion-safe:[transition:translate_var(--duration-sheet)_var(--ease-sheet),visibility_0s_linear_var(--duration-sheet)]',
  after:
    'motion-safe:[transition:translate_var(--duration-sheet)_var(--ease-sheet),visibility_0s_linear_var(--duration-sheet)]',
};
// シートの段の上の、親へ戻る行。行の高さと左の余白は項目と同じで、文字はラベルと同じ太字
//   段が長くても見えるよう、スクロールする一覧の外（パネルの上端）に置く
const backRow = [
  'flex min-h-(--spacing-control) w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius-control)-var(--spacing))] px-[calc(var(--spacing-control-x)-var(--spacing))] text-start font-bold text-fg-muted outline-none select-none',
  'hover:bg-field focus-visible:bg-field',
].join(' ');
const backRowWrap = 'shrink-0 px-(--spacing) pt-(--spacing)';

const OPTION = '[role="option"]';
// openOnHover: 載せてから開くまで（Menu の入れ子と同じ程度）と、次の段へ向かって動いているときに止まってから開くまで
const HOVER_DELAY = 100;
const AIM_DELAY = 300;

type Point = { x: number; y: number };
// 点 p が三角 abc の中か（辺の上を含む）
function inTriangle(p: Point, a: Point, b: Point, c: Point) {
  const side = (p1: Point, p2: Point, p3: Point) =>
    (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d1 = side(p, a, b);
  const d2 = side(p, b, c);
  const d3 = side(p, c, a);
  const negative = d1 < 0 || d2 < 0 || d3 < 0;
  const positive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(negative && positive);
}

export interface CascaderPanelProps<Value extends CascaderValueItem> {
  items: CascaderItem<Value>[];
  /** 決まっている値（段ごとの value） */
  value: Value[];
  /** いまたどっている道筋。開いたときは値から始まる */
  activePath: Value[];
  onActivePathChange: (path: Value[]) => void;
  /** 道筋で決める（面を閉じる） */
  onPick: (path: Value[]) => void;
  sheet: boolean;
  /** 1 段目の一覧の読み上げの名前（欄のラベル） */
  rootName: string;
  openOnHover: boolean;
  parentSelect: CascaderParentSelect;
  parentRowLabel: (item: CascaderItem<Value>) => string;
  emptyText: ReactNode;
  backName: string;
  /** 親の行の、読み上げだけの補足（次の段があること） */
  parentHintText: string;
  /** 開いた直後に、いまの道筋の最後の項目へフォーカスを移すか */
  autoFocus: boolean;
  /** まだ開いていない段の空の列を出さないか（浮かべる形）。true では、段の数に合わせて面が伸び縮みする */
  hideEmptyColumns?: boolean;
  sheetHeight?: CascaderSheetHeight;
}

export function CascaderPanel<Value extends CascaderValueItem>({
  items,
  value,
  activePath,
  onActivePathChange,
  onPick,
  sheet,
  rootName,
  openOnHover,
  parentSelect,
  parentRowLabel,
  emptyText,
  backName,
  parentHintText,
  autoFocus,
  hideEmptyColumns = false,
  sheetHeight = 'root',
}: CascaderPanelProps<Value>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const columns = useMemo(() => columnsOnPath(items, activePath), [items, activePath]);
  const pathItems = useMemo(() => itemsOnPath(items, activePath), [items, activePath]);
  // シートで出している段。開いたときは、道筋の最後の段（選んだ値が見える段）
  const [level, setLevel] = useState(() =>
    Math.max(0, Math.min(columns.length - 1, activePath.length - 1))
  );
  const [animated, setAnimated] = useState(false);
  // シートの舞台の高さ。段ごとの中身の高さ（戻る行を含む）を測り、sheetHeight で決める
  //   root: 1 段目のまま（Menu の入れ子のシートの fixed と同じ）。長い段はパネルの中でスクロールする
  const [panelHeights, setPanelHeights] = useState<Record<number, number>>({});
  const reportHeight = useCallback(
    (depth: number, height: number) =>
      setPanelHeights((current) =>
        current[depth] === height ? current : { ...current, [depth]: height }
      ),
    []
  );
  const [grownHeight, setGrownHeight] = useState(0);
  const levelHeight = panelHeights[level];
  useIsomorphicLayoutEffect(() => {
    if (levelHeight != null) setGrownHeight((current) => Math.max(current, levelHeight));
  }, [levelHeight]);
  // 木のいちばん長い段の行の数（親を選ぶ行を含む）。行はどれも 1 行の高さ
  const tallestRows = useMemo(() => {
    let most = items.length;
    const walk = (list: CascaderItem<Value>[]) => {
      for (const item of list) {
        if (!item.children) continue;
        most = Math.max(most, item.children.length + (parentSelect === 'row' ? 1 : 0));
        walk(item.children);
      }
    };
    walk(items);
    return most;
  }, [items, parentSelect]);
  const stageHeight: number | string | undefined =
    sheetHeight === 'tallest'
      ? // 上の余白・戻る行・行・下の余白
        `calc(var(--spacing) * 2 + var(--spacing-control) * ${tallestRows + 1})`
      : sheetHeight === 'grow'
        ? grownHeight || undefined
        : sheetHeight === 'fit'
          ? levelHeight
          : panelHeights[0];

  // 浮かべる形は、開いたときから木のいちばん深い段の数だけ列を置く（まだ開いていない段は空の列）
  //   段が増減しても面の幅が変わらず（右端でもずれない）、どこまで深く選ぶかも開いたときに分かる
  const treeDepth = useMemo(() => {
    const depthOf = (list: CascaderItem<Value>[]): number =>
      list.reduce(
        (most, item) => Math.max(most, item.children ? 1 + depthOf(item.children) : 1),
        0
      );
    return depthOf(items);
  }, [items]);

  const hoverTimer = useRef<number | null>(null);
  // 待っている行（段:行）と、前にポインターがあった点（openOnHover）
  const hoverKey = useRef<string | null>(null);
  const lastPoint = useRef<Point | null>(null);
  useEffect(
    () => () => {
      if (hoverTimer.current != null) window.clearTimeout(hoverTimer.current);
    },
    []
  );

  // 段ごとの行。parentSelect="row" では、2 段目から先頭に「親そのものを選ぶ」行を置く
  //   道筋を変えた直後（描き直す前）にも読むので、道筋を受け取って木から作る
  const rowsOf = (depth: number, path: Value[] = activePath): Row<Value>[] => {
    const parentPath = path.slice(0, depth);
    const rows: Row<Value>[] = (columnsOnPath(items, path)[depth] ?? []).map((item) => ({
      item,
      path: [...parentPath, item.value],
      label: item.label,
      parentRow: false,
    }));
    const parent = itemsOnPath(items, path)[depth - 1];
    if (depth > 0 && parentSelect === 'row' && parent) {
      rows.unshift({
        item: parent,
        path: parentPath,
        label: parentRowLabel(parent),
        parentRow: true,
      });
    }
    return rows;
  };

  // 段の中で Tab が止まる行: たどっている行、なければ選んだ値の行、なければ最初の行
  const currentIndex = (depth: number, rows: Row<Value>[], path: Value[] = activePath) => {
    const active = path[depth];
    const byActive = rows.findIndex((row) => !row.parentRow && row.item.value === active);
    if (active !== undefined && byActive >= 0) return byActive;
    const bySelected = rows.findIndex((row) => samePath(row.path, value));
    return bySelected >= 0 ? bySelected : 0;
  };

  const optionAt = (depth: number, index: number) =>
    rootRef.current
      ?.querySelector(`[data-depth="${depth}"]`)
      ?.querySelectorAll<HTMLElement>(OPTION)[index] ?? null;

  // 項目を、段（シートでは面の中身）の中だけで見える位置へ送る（ページは動かさない）。center は真ん中へ
  const reveal = (target: HTMLElement, center = false) => {
    // いちばん近い、実際にスクロールできる枠（段・シートのパネル・シートの中身）
    const selector =
      '[data-slot="cascader-column"], [data-slot="cascader-sheet-panel"], [data-slot="sheet-content"]';
    let scroller = target.closest<HTMLElement>(selector);
    while (scroller && scroller.scrollHeight <= scroller.clientHeight + 1)
      scroller = scroller.parentElement?.closest<HTMLElement>(selector) ?? null;
    if (!scroller) return;
    const rect = target.getBoundingClientRect();
    const view = scroller.getBoundingClientRect();
    if (center && (rect.bottom > view.bottom || rect.top < view.top)) {
      scroller.scrollBy({ top: rect.top - view.top - (view.height - rect.height) / 2 });
    } else if (rect.bottom > view.bottom) scroller.scrollBy({ top: rect.bottom - view.bottom });
    else if (rect.top < view.top) scroller.scrollBy({ top: rect.top - view.top });
  };
  const focusOption = (target: HTMLElement | null) => {
    if (!target) return;
    target.focus({ preventScroll: true });
    reveal(target);
  };

  // 開いた直後: 段ごとに、たどっている行（選んだ値）が見える位置へ送る。
  // 押して開いたときは、いまの道筋の最後の段の、Tab が止まる行へフォーカスを移す
  useEffect(() => {
    columns.forEach((_, depth) => {
      // シートで見えているのは 1 段だけ
      if (sheet && depth !== level) return;
      const target = optionAt(depth, currentIndex(depth, rowsOf(depth)));
      if (target) reveal(target, true);
    });
    if (!autoFocus) return;
    const depth = sheet ? level : Math.min(columns.length - 1, Math.max(0, activePath.length - 1));
    focusOption(optionAt(depth, currentIndex(depth, rowsOf(depth))));
    // 開いたときだけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 道筋を変えて描き直してから、フォーカスを移す
  const moveTo = (path: Value[], depth: number, index: number, nextLevel?: number) => {
    flushSync(() => {
      onActivePathChange(path);
      if (nextLevel !== undefined) {
        setAnimated(true);
        setLevel(nextLevel);
      }
    });
    focusOption(optionAt(depth, index));
  };

  // 行をたどる（道筋をこの行までにする）。親を選ぶ行は、親までの道筋（次の段を閉じる）
  const traceRow = (depth: number, rows: Row<Value>[], index: number) => {
    const row = rows[index];
    const path = row.parentRow ? row.path : [...activePath.slice(0, depth), row.item.value];
    moveTo(path, depth, index);
  };

  // 次の段へ入る。入った段では、道筋の続き（選んだ値）か最初の行に止まる
  const enter = (depth: number, row: Row<Value>, focus: 'option' | 'panel') => {
    const item = row.item;
    if (row.parentRow || !isParent(item) || item.disabled) return;
    const base = [...activePath.slice(0, depth), item.value];
    // 道筋の続きを残す（いま入る親が、すでにたどっていた親なら）
    const keep = samePath(activePath.slice(0, depth + 1), base) ? activePath : base;
    flushSync(() => onActivePathChange(keep));
    if (sheet) {
      // 次の段を右の外に置いて描いてから（はじめて開く段もここで作られる）、滑り込ませる
      void rootRef.current?.offsetWidth;
      flushSync(() => {
        setAnimated(true);
        setLevel(depth + 1);
      });
    }
    if (focus === 'panel' && sheet) {
      rootRef.current?.querySelector<HTMLElement>(`[data-panel-depth="${depth + 1}"]`)?.focus({
        preventScroll: true,
      });
      return;
    }
    focusOption(optionAt(depth + 1, currentIndex(depth + 1, rowsOf(depth + 1, keep), keep)));
  };

  // 前の段へ戻る。シートでは 1 段戻して、いま出ていた段の親の行へ
  const back = (depth: number) => {
    if (depth === 0) return;
    const parentDepth = depth - 1;
    const index = currentIndex(parentDepth, rowsOf(parentDepth));
    if (sheet) moveTo(activePath, parentDepth, index, parentDepth);
    else focusOption(optionAt(parentDepth, index));
  };

  // 行を押す・Enter で決める
  const activate = (depth: number, row: Row<Value>, focus: 'option' | 'panel') => {
    if (row.item.disabled && !row.parentRow) return;
    if (row.parentRow) {
      onPick(row.path);
      return;
    }
    if (isParent(row.item)) {
      enter(depth, row, focus);
      return;
    }
    onPick([...activePath.slice(0, depth), row.item.value]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, depth: number) => {
    const rows = rowsOf(depth);
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(OPTION));
    const index = options.indexOf(event.target as HTMLElement);
    if (index < 0) return;
    const row = rows[index];
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    const last = rows.length - 1;
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(last, index + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, index - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      case forward:
        event.preventDefault();
        enter(depth, row, 'option');
        return;
      case backward:
        event.preventDefault();
        back(depth);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(depth, row, 'option');
        return;
      default: {
        // 文字を打つと、その文字で始まる次の行へ
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const key = event.key.toLocaleLowerCase();
        for (let step = 1; step <= rows.length; step += 1) {
          const candidate = (index + step) % rows.length;
          if (rows[candidate].label.toLocaleLowerCase().startsWith(key)) {
            next = candidate;
            break;
          }
        }
        if (next === null) return;
      }
    }
    event.preventDefault();
    if (next !== index) traceRow(depth, rows, next);
  };

  // openOnHover: マウスを載せて少し待つと、その行をたどる（親なら次の段が開く。葉なら先の段を閉じる）
  //   Menu の入れ子（Base UI の hover の待ちと、斜めの通り道）と同じ考え方で、段が勝手に替わらないようにする
  //   - 実際にポインターが動いたときだけ数える（pointerenter は使わない）。開いた直後や、段が増えて面が広がり・ずれた直後に
  //     止まったポインターの下へ来た行では開かない
  //   - いま開いている次の段へ向かって斜めに動いているあいだは、途中でかすめた行を開かない。止まったら（AIM_DELAY）開く
  const onRowPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
    depth: number,
    rows: Row<Value>[],
    index: number
  ) => {
    if (!openOnHover || sheet || event.pointerType !== 'mouse') return;
    const point = { x: event.clientX, y: event.clientY };
    const previous = lastPoint.current;
    lastPoint.current = point;
    if (!previous || (previous.x === point.x && previous.y === point.y)) return;
    const row = rows[index];
    const key = `${depth}:${index}`;
    const traced = row.parentRow
      ? activePath.length === depth
      : activePath[depth] === row.item.value && activePath.length >= depth + 1;
    if (traced || (row.item.disabled && !row.parentRow)) {
      clearHover();
      return;
    }
    const aiming = aimsAtNextColumn(depth, previous, point);
    // 同じ行で待っているあいだは待ち直さない（動き続けても開ける）。次の段へ向かっているあいだは、止まるまで待ち直す
    if (hoverKey.current === key && !aiming) return;
    clearHover();
    hoverKey.current = key;
    hoverTimer.current = window.setTimeout(
      () => {
        hoverTimer.current = null;
        hoverKey.current = null;
        traceRow(depth, rows, index);
      },
      aiming ? AIM_DELAY : HOVER_DELAY
    );
  };
  const clearHover = () => {
    if (hoverTimer.current != null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    hoverKey.current = null;
  };

  // 前の点から今の点への動きが、いま開いている次の段（depth + 1）の手前の辺へ向かう三角の中か
  const aimsAtNextColumn = (depth: number, from: Point, to: Point) => {
    const next = rootRef.current
      ?.querySelector(`[data-depth="${depth + 1}"]`)
      ?.closest<HTMLElement>('[data-slot="cascader-column"]');
    if (!next) return false;
    const rect = next.getBoundingClientRect();
    // 次の段は右（RTL では左）にある。手前の辺の上下の角と、前の点で三角を作る
    const edge = rect.left >= from.x ? rect.left : rect.right;
    const toward = edge >= from.x ? to.x >= from.x : to.x <= from.x;
    if (!toward) return false;
    return inTriangle(to, from, { x: edge, y: rect.top }, { x: edge, y: rect.bottom });
  };

  const renderRows = (depth: number) => {
    const rows = rowsOf(depth);
    const tabIndex = currentIndex(depth, rows);
    if (rows.length === 0)
      return (
        <div data-slot="cascader-empty" className={listboxEmptyClass}>
          {emptyText}
        </div>
      );
    return rows.map((row, index) => {
      const parent = !row.parentRow && isParent(row.item);
      const selected = samePath(row.path, value) && !parent;
      // 読み上げの「選択済み」は、決まった値の道筋にある行（段ごとの選択）
      const onValuePath = row.parentRow
        ? samePath(row.path, value)
        : value[depth] === row.item.value &&
          samePath(value.slice(0, depth), row.path.slice(0, depth));
      const active = !row.parentRow && activePath[depth] === row.item.value;
      const disabled = !row.parentRow && !!row.item.disabled;
      return (
        <div
          key={row.parentRow ? '__parent' : String(row.item.value)}
          role="option"
          tabIndex={index === tabIndex ? 0 : -1}
          aria-selected={onValuePath}
          aria-disabled={disabled || undefined}
          aria-describedby={parent && !disabled ? hintId : undefined}
          data-slot="cascader-option"
          data-active={active || undefined}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          data-parent-row={row.parentRow || undefined}
          className={optionSlots.root()}
          onClick={(event) => activate(depth, row, event.detail === 0 ? 'option' : 'panel')}
          onPointerMove={(event) => onRowPointerMove(event, depth, rows, index)}
          onPointerLeave={clearHover}
        >
          <span className={optionSlots.label()}>{row.label}</span>
          {selected && (
            <span aria-hidden className={optionSlots.check()}>
              <CheckIcon />
            </span>
          )}
          {parent && (
            <span aria-hidden className={optionSlots.trailing()}>
              <CaretRightIcon className="size-(--spacing-icon) shrink-0 rtl:-scale-x-100" />
            </span>
          )}
        </div>
      );
    });
  };

  const columnName = (depth: number) => (depth === 0 ? rootName : pathItems[depth - 1]?.label);

  const hint = (
    <span id={hintId} hidden>
      {parentHintText}
    </span>
  );

  if (sheet) {
    return (
      <div
        ref={rootRef}
        data-slot="cascader-panel"
        // 面の端まで広げ、パネルの中の左右の余白（--spacing）で、項目の文字を見出しの文字にそろえる（Select のシートと同じ）
        //   上下は中身の余白を打ち消し、パネルの中でスクロールするときも続きの影が面の中身の端に来るようにする
        className={cn(
          'relative -mx-(--sheet-padding-x) -mt-(--sheet-padding-x) overflow-clip',
          animated && 'motion-safe:[transition:height_var(--duration-sheet)_var(--ease-sheet)]'
        )}
        style={stageHeight != null ? { height: stageHeight } : undefined}
      >
        {hint}
        {columns.map((_, depth) => {
          const position: SlidePosition =
            depth === level ? 'current' : depth < level ? 'before' : 'after';
          return (
            <SheetPanel
              // 段ごとに同じ要素を保つ（親が替わっても作り直さず、外から滑り込ませる）
              key={depth}
              depth={depth}
              position={position}
              animated={animated}
              onHeight={reportHeight}
              head={
                depth > 0 ? (
                  <div data-slot="cascader-sheet-head" className={backRowWrap}>
                    <button
                      type="button"
                      tabIndex={-1}
                      data-slot="cascader-back"
                      className={backRow}
                      onClick={() => back(depth)}
                    >
                      <CaretLeftIcon className="size-(--spacing-icon) shrink-0 rtl:-scale-x-100" />
                      <span className="min-w-0 flex-1 truncate">
                        {pathItems[depth - 1]?.label}
                        {/* 名前は見える文から始める（WCAG 2.5.3） */}
                        <span className="sr-only">（{backName}）</span>
                      </span>
                    </button>
                  </div>
                ) : (
                  <div data-slot="cascader-sheet-head" className="h-(--spacing) shrink-0" />
                )
              }
            >
              <div
                role="listbox"
                aria-label={columnName(depth)}
                data-depth={depth}
                data-slot="cascader-list"
                onKeyDown={(event) => onKeyDown(event, depth)}
              >
                {renderRows(depth)}
              </div>
            </SheetPanel>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      data-slot="cascader-panel"
      className="flex max-w-(--available-width) overflow-x-auto"
    >
      {hint}
      {columns.map((_, depth) => (
        <CascaderColumn
          key={depth}
          divider={depth > 0}
          name={columnName(depth)}
          depth={depth}
          onKeyDown={(event) => onKeyDown(event, depth)}
        >
          {renderRows(depth)}
        </CascaderColumn>
      ))}
      {/* まだ開いていない段の場所も、はじめから空の列として置く（hideEmptyColumns で出さない） */}
      {!hideEmptyColumns &&
        Array.from({ length: Math.max(0, treeDepth - columns.length) }, (_, i) => (
          <div key={`empty-${i}`} aria-hidden className={cn(columnFrame, columnDivider)} />
        ))}
    </div>
  );
}

// 浮かべる形の 1 段。続きがある端には内側の影、つまみは ScrollArea と同じ（浮かぶ選択肢と同じ）
function CascaderColumn({
  divider,
  name,
  depth,
  onKeyDown,
  children,
}: {
  divider: boolean;
  name: string | undefined;
  depth: number;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  children: ReactNode;
}) {
  const cues = useMoreCues();
  return (
    <MoreCueScroll
      className={cn(columnFrame, divider && columnDivider)}
      viewportRef={cues}
      viewportSlot="cascader-column"
      viewportClassName={columnViewport}
      scrollbarClassName="my-(--spacing)"
      before={<SheetMoreCue edge="top" sheet={false} sheetMoreCue="shadow" />}
      after={<SheetMoreCue edge="bottom" sheet={false} sheetMoreCue="shadow" />}
    >
      <div
        role="listbox"
        aria-label={name}
        data-depth={depth}
        data-slot="cascader-list"
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </MoreCueScroll>
  );
}

// シートの 1 段。舞台いっぱいに重ね、長い段はこの中でスクロールする（つまみと続きの影は浮かぶ選択肢と同じ）
function SheetPanel({
  depth,
  position,
  animated,
  onHeight,
  head,
  children,
}: {
  depth: number;
  position: SlidePosition;
  animated: boolean;
  /** 中身（一覧の上のものと一覧）の高さを知らせる。舞台の高さを決めるのに使う */
  onHeight: (depth: number, height: number) => void;
  /** 一覧の上に置くもの（親へ戻る行。1 段目は上の余白） */
  head: ReactNode;
  children: ReactNode;
}) {
  const cues = useMoreCues();
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    if (!content) return undefined;
    const read = () => onHeight(depth, content.offsetHeight + (headRef.current?.offsetHeight ?? 0));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(content);
    return () => observer.disconnect();
  }, [content, depth, onHeight]);
  return (
    <div
      data-panel-depth={depth}
      data-position={position}
      tabIndex={-1}
      className={cn(
        'absolute inset-0 flex flex-col outline-none',
        panelPosition[position],
        animated && panelMotion[position]
      )}
    >
      <div ref={headRef} className="flex shrink-0 flex-col">
        {head}
      </div>
      <MoreCueScroll
        className="min-h-0 flex-1"
        viewportRef={cues}
        viewportSlot="cascader-sheet-panel"
        viewportClassName="h-full"
        before={<SheetMoreCue edge="top" sheet={false} sheetMoreCue="shadow" />}
        after={<SheetMoreCue edge="bottom" sheet={false} sheetMoreCue="shadow" />}
      >
        <div ref={setContent} className="px-(--spacing) pb-(--spacing)">
          {children}
        </div>
      </MoreCueScroll>
    </div>
  );
}
