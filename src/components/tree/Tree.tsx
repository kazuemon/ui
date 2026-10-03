'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import type { FieldLoadingBehavior } from '../../internal/field/Field';
import { focusRing } from '../../internal/focus-styles';
import { ArrowUpRightIcon, CaretRightIcon } from '../../internal/icons';
import { newTabNaming, opensNewTab, withRenderOverrides } from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { Spinner } from '../loading/Loading';
import { Skeleton } from '../skeleton/Skeleton';

// 入れ子の行き先を木の形で並べる（ドキュメントの目次、ファイルの一覧）— 軸 149・150
//   行は一覧の項目の仲間（原則3）。hover は入力欄の塗り、いまいる行は部品の色に従う（原則6）。影は付けない（原則1）
//   行の高さは部品の高さ（原則11）。角は部品の角（原則5）
//   開閉の印は行の左に置き、閉じているときは右、開くと下を向く（Collapsible の indicator="start" と同じ。入れ子で並べるときの向き）
//   1 段の字下げは「印の幅＋印と文字の間」。子の行の印が、親の行の文字の頭と同じ位置に来る（軸 149）
//   行の塗りは、既定では字下げの分だけ左を空ける（rowWidth="full" で木の幅いっぱい）。案内線は塗りより手前に引く（軸 149）
//   開け閉ては中身の高さを動かす（Accordion と同じ。panelMotion="none" ですぐ切り替え）。土台は Base UI の Collapsible
//   いまいる行の印は軸 150。既定は淡い面＋太字（currentIndicator="text" で太字だけ）
//   行の文字は既定では選べない（開け閉めのために続けて押すと選ばれてしまうため）。selectable で選べるようにできる
//   読み上げと操作は WAI-ARIA の tree にならう（www.w3.org/WAI/ARIA/apg の Navigation Treeview）
//     ul[role=tree] > li[role=none] > 行[role=treeitem][aria-expanded] ＋ ul[role=group]（並びは行の兄弟）
//     Tab で入るのは 1 行だけ（roving tabindex）。↑↓ で行を移り、→ で開いて中へ、← で閉じて親へ、Home・End で端へ移る
//     文字を打つと、その文字で始まる行へ移る（型あたり）。続けて打った文字は 1 語にまとめ、間が空いたら打ち直し。開いていない枝の中は相手にしない
//     行き先（href）を渡した行はリンクになり、Enter で移る。子を持つ行は Space で開け閉めする
//   子をあとから読み込む行（hasChildren・loading）: children がまだなくても開け閉めできる行にし、開いたら使う側が読み込む
//     読み込んでいるあいだは、行に aria-busy を付け、読み上げにだけ届ける文（loadingText）を説明にする。見える印は読み上げに出さない
//     読み込みが始まったことは、木のそばにいつも置いた status の箱が 1 回だけ伝える（原則15）。行の説明は、あとで行に戻ったとき用に残す
//       終わったときは知らせない（子の行が現れることで分かる）。箱は空に戻すだけ
//     見える印は、閉じられるか（loadingBehavior）で替える（軸 454・決定）
//       non-blocking（既定）: 読み込んでいるあいだも閉じられる。行の右端に回る円を出す（開閉の印は閉じるために残す）
//       blocking: 読み込み終わるまで閉じられない。開閉の印を回る円に替える（閉じる印を見せない）
//     開いた中の「読み込んでいます」の行・場所取りの行は、使う側が足したいときだけ出す（loadingPlaceholder）

const tree = tv({
  slots: {
    root: 'flex flex-col text-(length:--text-control) leading-(--leading-control)',
    group: [
      'relative flex flex-col',
      // 字下げの案内線（軸 149）。親の印の中心にそろえて縦線を引く
      // 行の塗り（hover・いまいる行）より手前に置く。線は行のうしろに隠れない
      "before:absolute before:inset-y-0 before:left-[calc(var(--tree-indent)*var(--tree-depth)+var(--tree-guide-left))] before:z-1 before:w-(--tree-guide-width) before:bg-(color:--color-line) before:content-['']",
    ],
    row: [
      'group/tree-row relative flex h-(--spacing-control) cursor-pointer items-center gap-(--tree-gap)',
      'rounded-control pe-(--tree-row-px) no-underline',
      // 行の文字は選べなくする（開け閉めのために続けて押すと、文字が選ばれてしまうため）
      'select-none',
      'text-fg-muted',
      // 塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
      'bg-(color:--flat-bg) [--flat-bg:var(--tree-row-rest)]',
      'hover:[--flat-bg:var(--tree-row-hover)]',
      'active:translate-y-(--flat-press-depth) active:[--flat-bg:var(--tree-row-press)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      // いまいる行（軸 150）: 文字を本文の色で太くし、淡い面を敷く
      'aria-[current=page]:font-bold aria-[current=page]:text-(color:--tree-current-fg)',
      'aria-[current=page]:[--tree-row-rest:var(--tree-current-bg)]',
      'aria-[current=page]:hover:[--flat-bg:var(--tree-current-hover)]',
      // 押せない行: 押せない文字の色。塗りも動かさない
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled)',
      'data-disabled:hover:[--flat-bg:var(--tree-row-rest)] data-disabled:active:translate-y-0',
      ...focusRing,
      // フォーカスしている行は、案内線（手前に引いている）より上に出す。線が輪郭を横切らない
      'focus-visible:z-2',
    ],
    // 開閉の印。閉じているときは右、開くと下を向く
    caret: [
      'grid size-(--spacing-icon) shrink-0 place-items-center text-fg-subtle',
      '[transition:rotate_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-aria-expanded/tree-row:rotate-90',
    ],
    // 子を持たない行の、印と同じ幅の空き（文字の頭をそろえる）
    caretSpace: 'size-(--spacing-icon) shrink-0',
    icon: 'grid size-(--spacing-icon) shrink-0 place-items-center [&_svg]:size-(--spacing-icon)',
    label: 'min-w-0 flex-1 truncate',
    // 読み込み中の印。blocking は開閉の印の場所に、non-blocking は行の右端に回る円を置く
    caretSpinner: 'grid size-(--spacing-icon) shrink-0 place-items-center text-fg-subtle',
    endSpinner: 'grid shrink-0 place-items-center text-fg-subtle',
    // 開いた中に置く、読み込み中の行（loadingPlaceholder）。行と同じ字下げ・高さで、押せない
    loadingItem: 'flex flex-col',
    loadingRow: [
      'flex h-(--spacing-control) items-center gap-(--tree-gap) pe-(--tree-row-px) text-fg-subtle',
      'ms-[calc(var(--tree-indent)*var(--tree-depth))] ps-(--tree-row-px)',
    ],
    loadingSkeleton:
      'ms-[calc(var(--tree-indent)*var(--tree-depth))] flex flex-col ps-(--tree-row-px) pe-(--tree-row-px)',
    loadingSkeletonRow: 'flex h-(--spacing-control) items-center gap-(--tree-gap)',
  },
  variants: {
    // いまいる行の色（原則6）。指定しないときはグレー
    color: {
      primary: {
        root: '[--tree-current-bg:var(--color-primary-subtle)] [--tree-current-fg:var(--color-on-primary-subtle)]',
      },
      secondary: {
        root: '[--tree-current-bg:var(--color-secondary-subtle)] [--tree-current-fg:var(--color-on-secondary-subtle)]',
      },
      neutral: {},
    },
    guides: {
      true: {},
      false: { group: '[--tree-guide-width:0px]' },
    },
    // 行の塗りの範囲（軸 149）。indent は字下げの分だけ左を空け、full は木の幅いっぱいに塗る
    rowWidth: {
      indent: { row: 'ms-[calc(var(--tree-indent)*var(--tree-depth))] ps-(--tree-row-px)' },
      full: { row: 'ps-[calc(var(--tree-row-px)+var(--tree-indent)*var(--tree-depth))]' },
    },
    // いまいる行の印（軸 150）。fill は淡い面＋太字、text は太字だけ
    currentIndicator: {
      fill: {},
      text: {
        row: 'aria-[current=page]:[--tree-row-rest:transparent] aria-[current=page]:hover:[--flat-bg:var(--tree-row-hover)]',
      },
    },
    // 行の文字を選べるようにするか。既定は選べない（続けて押しても文字が選ばれない）
    selectable: {
      true: { row: 'select-text' },
      false: {},
    },
    // 開け閉めの動き（軸 149）。collapse は Accordion と同じく高さが動き、none はすぐ切り替わる
    panelMotion: {
      collapse: {
        group: [
          'h-(--collapsible-panel-height)',
          // 高さを動かすあいだ、中身をはみ出させない。フォーカスの線が切れないよう、切る場所はその外側に取る
          '[overflow:clip] [overflow-clip-margin:var(--tree-panel-clip-margin)]',
          'transition-[height] duration-(--duration-normal) ease-(--ease-sheet)',
          'data-ending-style:h-0 data-starting-style:h-0',
          'motion-reduce:[transition:none]',
        ],
      },
      none: {},
    },
  },
  defaultVariants: {
    color: 'neutral',
    guides: true,
    rowWidth: 'indent',
    currentIndicator: 'fill',
    panelMotion: 'collapse',
    selectable: false,
  },
});

export type TreeRowWidth = 'indent' | 'full';
export type TreeCurrentIndicator = 'fill' | 'text';
export type TreePanelMotion = 'collapse' | 'none';
export type TreeLoadingPlaceholder = 'none' | 'text' | 'skeleton';

interface TreeContextValue {
  depth: number;
  slots: ReturnType<typeof tree>;
  /** Tab で止まる行（roving tabindex）。null のときは最初の行 */
  active: string | null;
  setActive: (id: string) => void;
  rootRef: React.RefObject<HTMLUListElement | null>;
  /** 型あたり（文字を打って行へ移る）の、打っている途中の文字。木で 1 つ持つ */
  typeaheadRef: React.RefObject<Typeahead>;
  /** 読み込みが始まったことを、木の status の箱で 1 回だけ伝える。text が空のときは箱を空に戻す */
  announce: (text: string) => void;
}

/** 木の status の箱の中身。count は、同じ文を続けて知らせるときに中身を入れ替えるための番号 */
interface TreeAnnouncement {
  text: string;
  count: number;
}

/** 型あたりの状態。text は打っている途中の語、time は最後に打った時刻 */
interface Typeahead {
  text: string;
  time: number;
}

// 続けて打った文字を 1 語にまとめる時間。これより間が空いたら、打ち直しとみなす（木の標準のふるまい）
const TYPEAHEAD_RESET = 1000;

const TreeContext = createContext<TreeContextValue | null>(null);

/** いま見えている行を、上から順に集める。閉じている並びと、閉じている途中の並びの中は数えない */
function visibleRows(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('[role="treeitem"]')).filter(
    (row) =>
      !row.closest('[data-slot="tree-group"][hidden], [data-slot="tree-group"][data-ending-style]')
  );
}

/** 行の文字。アイコンや印は読まず、文字の部分だけを見る */
function rowText(row: HTMLElement) {
  const label = row.querySelector<HTMLElement>('[data-slot="tree-label"]');
  return (label?.textContent ?? row.textContent ?? '').trim().toLowerCase();
}

/**
 * 型あたり（文字を打つと、その文字で始まる行へ移る）。木の標準のふるまい
 * 続けて打った文字は 1 語にまとめ、間が空いたら打ち直しとみなす
 * 同じ文字を続けて打ったときは、その文字で始まる行を順に送る
 * 見えている行（visibleRows）だけが相手なので、開いていない枝の中は当たらない
 */
function typeaheadTarget(
  rows: HTMLElement[],
  index: number,
  key: string,
  state: Typeahead
): HTMLElement | undefined {
  const now = Date.now();
  const char = key.toLowerCase();
  const fresh = now - state.time > TYPEAHEAD_RESET;
  state.text = fresh ? char : state.text + char;
  state.time = now;
  // 同じ文字を続けて打ったときは 1 文字として扱い、次の行へ送る。ほかは、いまの行から見て最初に当たる行へ
  const first = state.text.slice(0, 1);
  const repeated = state.text.length > 1 && state.text === first.repeat(state.text.length);
  const text = repeated ? first : state.text;
  const from = repeated || fresh || state.text.length === 1 ? index + 1 : index;
  for (let step = 0; step < rows.length; step += 1) {
    const row = rows[(from + step + rows.length) % rows.length];
    if (row && rowText(row).startsWith(text)) return row;
  }
  return undefined;
}

export interface TreeProps extends Omit<ComponentProps<'ul'>, 'color'> {
  /** 木の読み上げの名前（「ドキュメント」「ファイル」など）。画面には出ません */
  accessibleName: string;
  /**
   * いまいる行の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーです（原則6）
   * @default 'neutral'
   */
  color?: 'primary' | 'secondary' | 'neutral';
  /**
   * 字下げの案内線を消します。案内線は既定で引きます
   * @default false
   */
  hideGuides?: boolean;
  /**
   * 行の塗り（hover・いまいる行）の範囲。indent は字下げの分だけ左を空け、full は木の幅いっぱいに塗ります
   * @default 'indent'
   */
  rowWidth?: TreeRowWidth;
  /**
   * いまいる行の印。fill は淡い面と太字、text は太字だけです
   * @default 'fill'
   */
  currentIndicator?: TreeCurrentIndicator;
  /**
   * 開け閉めの動き。collapse は中身の高さが動き（Accordion と同じ）、none はすぐ切り替わります
   * @default 'collapse'
   */
  panelMotion?: TreePanelMotion;
  /**
   * 行の文字を選べるようにします。既定では選べません（開け閉めのために続けて押したとき、文字が選ばれないようにするため）
   * @default false
   */
  selectable?: boolean;
  /** 行（TreeItem）を並べます */
  children?: ReactNode;
  /** いちばん外の要素（ul）に付きます */
  className?: string;
}

/**
 * 入れ子の行き先を木の形で並べます。ドキュメントの目次や、ファイルの一覧に使います
 *
 * Tab で入るのは 1 行だけです。↑ ↓ で行を移り、→ で開いて中へ、← で閉じて親へ、Home・End で端へ移ります。
 * 文字を打つと、その文字で始まる行へ移ります（続けて打った文字は 1 語として扱い、少し間が空くと打ち直しです）
 */
export function Tree({
  accessibleName,
  color,
  hideGuides,
  rowWidth,
  currentIndicator,
  panelMotion,
  selectable,
  className,
  children,
  ref,
  ...props
}: TreeProps) {
  const slots = tree({
    color,
    guides: !hideGuides,
    rowWidth,
    currentIndicator,
    panelMotion,
    selectable,
  });
  const rootRef = useRef<HTMLUListElement>(null);
  // 内部の ref（キーボードの操作に使う）と、利用者が渡した ref をつなぐ（ADR-0250）
  const mergedRef = useMergedRefs(rootRef, ref);
  // 型あたりの途中の文字は、木で 1 つ持つ（どの行で打っても同じ語になる）
  const typeaheadRef = useRef<Typeahead>({ text: '', time: 0 });
  const [active, setActive] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<TreeAnnouncement>({ text: '', count: 0 });
  // 同じ文が続いても読まれるよう、知らせるたびに中身の要素を入れ替える（key）
  const announce = useCallback(
    (text: string) => setAnnouncement((prev) => ({ text, count: prev.count + 1 })),
    []
  );
  // Tab で止まる行を 1 つ決める（roving tabindex）。いまいる行、なければ最初の行
  useEffect(() => {
    if (active !== null) return;
    const rows = visibleRows(rootRef.current);
    const target = rows.find((row) => row.getAttribute('aria-current') === 'page') ?? rows[0];
    if (target) setActive(target.id);
  }, [active]);
  return (
    <TreeContext value={{ depth: 0, slots, active, setActive, rootRef, typeaheadRef, announce }}>
      <ul
        {...props}
        ref={mergedRef}
        role="tree"
        aria-label={accessibleName}
        data-slot="tree"
        className={slots.root({ className })}
      >
        {children}
      </ul>
      {/* 読み込みの知らせ。木を描いているあいだずっと置く、見えない status の箱（木の外。tree の中には行と並びしか置けない） */}
      <span role="status" data-slot="tree-status" className="sr-only">
        {announcement.text && <span key={announcement.count}>{announcement.text}</span>}
      </span>
    </TreeContext>
  );
}

export interface TreeItemProps extends Omit<
  ComponentProps<'a'>,
  'children' | 'className' | 'onClick' | 'ref'
> {
  /** 行に出す文字 */
  label: ReactNode;
  /** 文字の前に置くアイコン（フォルダ・ファイルの印など）。渡さないと置きません */
  icon?: ReactNode;
  /**
   * 行き先。渡すとリンクになり、Enter で移ります。
   * `target="_blank"` を足すと、右上向きの矢印（↗）が付き、読み上げに「新しいタブで開きます」が入ります
   */
  href?: string;
  /** 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に行の見た目を重ねます */
  render?: ReactElement;
  /**
   * いまいるページか。true のとき aria-current="page" を付け、印を出します
   * @default false
   */
  current?: boolean;
  /**
   * はじめは開いているか（非制御）。子を持つ行だけに効きます
   * @default false
   */
  defaultExpanded?: boolean;
  /** 開いているか（制御） */
  expanded?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * 押せなくします
   * @default false
   */
  disabled?: boolean;
  /** 押したときに呼ばれます。子を持つ行では、開け閉めと一緒に呼ばれます */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** 入れ子の行（TreeItem）。渡すと開け閉めできる行になります */
  children?: ReactNode;
  /**
   * 子をあとから読み込む行にします。children がまだなくても開け閉めできる行になり、開いたとき（`onExpandedChange`）に読み込みます
   * @default false
   */
  hasChildren?: boolean;
  /**
   * 子を読み込んでいます。読み込み中の印を出し、行に aria-busy を付けます
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込んでいるあいだに閉じられるか。`non-blocking` は閉じられ、行の右端に回る円を出します。`blocking` は読み込み終わるまで閉じられず、開閉の印を回る円に替えます
   * @default 'non-blocking'
   */
  loadingBehavior?: FieldLoadingBehavior;
  /**
   * 読み込んでいるあいだ、開いた中に置く仮の行。`text` は「読み込んでいます」の行、`skeleton` は場所取りの行です
   * @default 'none'
   */
  loadingPlaceholder?: TreeLoadingPlaceholder;
  /**
   * 読み込んでいるあいだ、読み上げにだけ届ける文。読み込みが始まったときに 1 回だけ知らせ、行に戻ったときは行の説明として読みます
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /** 行の要素に付きます。知らない props（id・data-*・aria-*）も行の要素に流します */
  className?: string;
  /** 行の要素に付きます */
  ref?: React.Ref<HTMLElement>;
}

/**
 * 木の 1 行。中に TreeItem を入れると、開け閉めできる行になります
 */
export function TreeItem({
  label,
  icon,
  href,
  render,
  current = false,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  disabled = false,
  onClick,
  children,
  hasChildren: hasChildrenProp = false,
  loading = false,
  loadingBehavior = 'non-blocking',
  loadingPlaceholder = 'none',
  loadingText = '読み込んでいます',
  className,
  ref,
  ...props
}: TreeItemProps) {
  const context = use(TreeContext);
  const id = useId();
  const noteId = useId();
  const loadingId = useId();
  // 入れ子の並び（group）は li の中、行（treeitem）の兄弟に置く（WAI-ARIA APG の Navigation Treeview）
  //   aria-owns で行に結び付けると、行の読み上げの名前に中の行き先が全部入ってしまう
  const groupId = `${id}-group`;
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  if (!context) throw new Error('TreeItem は Tree の中に置いてください');
  const { depth, slots, active, setActive, rootRef, typeaheadRef, announce } = context;
  const hasChildren = hasChildrenProp || (children != null && children !== false);
  const busy = hasChildren && loading;
  const blocking = busy && loadingBehavior === 'blocking';
  const open = expanded ?? uncontrolled;

  // 読み込みが始まったときだけ、木の status の箱で知らせる。はじめから読み込んでいる行は知らせない。終わったら箱を空に戻す
  const wasBusy = useRef(busy);
  useEffect(() => {
    if (busy === wasBusy.current) return;
    wasBusy.current = busy;
    announce(busy ? loadingText : '');
  }, [busy, loadingText, announce]);

  const setOpen = (next: boolean) => {
    // blocking で読み込んでいるあいだは閉じない
    if (blocking && !next) return;
    if (expanded === undefined) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  // Tab で止まるのは 1 行だけ（roving tabindex）。どの行かは Tree が決める
  const tabbable = active === id;

  const move = (to: HTMLElement | undefined) => {
    if (!to) return;
    setActive(to.id);
    to.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const rows = visibleRows(rootRef.current);
    const index = rows.findIndex((row) => row.id === id);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(rows[index + 1]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(rows[index - 1]);
        break;
      case 'ArrowRight':
        event.preventDefault();
        // 閉じているときは開き、開いているときは最初の子へ移る（子がまだ届いていなければ移らない）
        if (hasChildren && !open) setOpen(true);
        else if (hasChildren && Number(rows[index + 1]?.dataset.depth) === depth + 1)
          move(rows[index + 1]);
        break;
      case 'ArrowLeft': {
        event.preventDefault();
        if (hasChildren && open) {
          setOpen(false);
          break;
        }
        // 親の行（1 つ上の段で、いちばん近いもの）へ移る
        const parent = rows
          .slice(0, index)
          .reverse()
          .find((row) => Number(row.dataset.depth) === depth - 1);
        move(parent);
        break;
      }
      case 'Home':
        event.preventDefault();
        move(rows[0]);
        break;
      case 'End':
        event.preventDefault();
        move(rows.at(-1));
        break;
      case ' ':
        // 子を持つ行は Space で開け閉め。リンクの行は Space では移らない（原則7）
        if (hasChildren) {
          event.preventDefault();
          setOpen(!open);
        }
        break;
      default: {
        // 型あたり: 文字を打つと、その文字で始まる行へ移る（原則15: キーボードの振る舞いは働きに従う）
        // 修飾キーと、日本語などの変換中の入力は相手にしない
        if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) break;
        if (event.nativeEvent.isComposing) break;
        const target = typeaheadTarget(rows, index, event.key, typeaheadRef.current);
        if (target) {
          event.preventDefault();
          move(target);
        }
        break;
      }
    }
  };

  // 新しいタブで開く行（Link と同じ扱い — ADR-0254 の M-17）
  //   ↗ を文字の後ろに付け、読み上げに「新しいタブで開きます」を足し、rel="noopener noreferrer" を付ける
  const newTab = !disabled && href != null && (props.target === '_blank' || opensNewTab(render));
  const naming = newTab ? newTabNaming(props, render, noteId) : null;

  const row = useRender({
    // 渡した要素に名前（aria-label・aria-labelledby）があるときは、要素の側も書き換える（要素の props が勝つため）
    render: naming ? withRenderOverrides(render, naming.props) : render,
    defaultTagName: href != null && !disabled ? 'a' : 'div',
    ref,
    props: {
      ...props,
      ...naming?.props,
      ...(newTab ? { rel: props.rel ?? 'noopener noreferrer' } : {}),
      id,
      role: 'treeitem',
      'aria-expanded': hasChildren ? open : undefined,
      'aria-current': current ? ('page' as const) : undefined,
      'aria-busy': busy || undefined,
      'aria-describedby': busy
        ? [props['aria-describedby'], loadingId].filter(Boolean).join(' ')
        : props['aria-describedby'],
      'aria-disabled': disabled || undefined,
      'data-slot': 'tree-item',
      'data-depth': depth,
      'data-disabled': disabled ? '' : undefined,
      tabIndex: disabled ? -1 : tabbable ? 0 : -1,
      ...(href != null && !disabled && { href }),
      onFocus: () => setActive(id),
      onKeyDown: handleKeyDown,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        if (hasChildren) setOpen(!open);
        onClick?.(event);
      },
      className: slots.row({ className }),
      style: { ['--tree-depth' as string]: depth },
      children: (
        <>
          {blocking ? (
            <span aria-hidden="true" className={slots.caretSpinner()}>
              <Spinner />
            </span>
          ) : hasChildren ? (
            <span aria-hidden="true" className={slots.caret()}>
              <CaretRightIcon />
            </span>
          ) : (
            <span aria-hidden="true" className={slots.caretSpace()} />
          )}
          {icon ? (
            <span aria-hidden="true" className={slots.icon()}>
              {icon}
            </span>
          ) : null}
          <span data-slot="tree-label" className={slots.label()}>
            {label}
          </span>
          {/* 新しいタブで開く行の ↗（飾り。読み上げは下の文で足す） */}
          {newTab && (
            <span aria-hidden="true" className={slots.icon()}>
              <ArrowUpRightIcon />
            </span>
          )}
          {naming?.note}
          {busy && !blocking && (
            <span aria-hidden="true" className={slots.endSpinner()}>
              <Spinner />
            </span>
          )}
          {busy && (
            <span id={loadingId} hidden>
              {loadingText}
            </span>
          )}
        </>
      ),
    },
  });

  if (!hasChildren) {
    return (
      <li role="none" className="flex flex-col">
        {row}
      </li>
    );
  }

  // 開け閉めは Base UI の Collapsible に任せる（中身の高さを動かす。Accordion と同じ）
  //   開閉のボタンは行そのものなので Trigger は使わず、open を渡して使う
  return (
    <BaseCollapsible.Root
      open={open}
      onOpenChange={(next) => setOpen(next)}
      render={<li role="none" className="flex flex-col" />}
    >
      {row}
      <TreeContext value={{ ...context, depth: depth + 1 }}>
        <BaseCollapsible.Panel
          id={groupId}
          role="group"
          data-slot="tree-group"
          className={slots.group()}
          style={{ ['--tree-depth' as string]: depth }}
          render={<ul />}
        >
          {children}
          {busy && loadingPlaceholder !== 'none' && (
            <li
              role="none"
              aria-hidden="true"
              data-slot="tree-loading"
              className={slots.loadingItem()}
              style={{ ['--tree-depth' as string]: depth + 1 }}
            >
              {loadingPlaceholder === 'text' ? (
                <div className={slots.loadingRow()}>
                  <Spinner />
                  {loadingText}
                </div>
              ) : (
                <div className={slots.loadingSkeleton()}>
                  {['w-2/3', 'w-1/2'].map((width) => (
                    <div key={width} className={slots.loadingSkeletonRow()}>
                      <span className={slots.caretSpace()} />
                      <Skeleton variant="text" className={width} />
                    </div>
                  ))}
                </div>
              )}
            </li>
          )}
        </BaseCollapsible.Panel>
      </TreeContext>
    </BaseCollapsible.Root>
  );
}
