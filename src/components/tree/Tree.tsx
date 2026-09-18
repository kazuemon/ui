import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CaretRightIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

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
//     行き先（href）を渡した行はリンクになり、Enter で移る。子を持つ行は Space で開け閉めする

const tree = tv({
  slots: {
    root: 'flex flex-col text-(length:--text-control) leading-(--leading-control)',
    group: [
      'relative flex flex-col',
      // 字下げの案内線（軸 149）。親の印の中心にそろえて縦線を引く
      // 行の塗り（hover・いまいる行）より手前に置く。線は行のうしろに隠れない
      "before:absolute before:inset-y-0 before:left-[calc(var(--tree-indent)*var(--tree-depth)+var(--tree-guide-left))] before:z-1 before:w-(--tree-guide-width) before:bg-(color:--tree-guide-color) before:content-['']",
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
      // いまいる行の左の印（軸 150 の候補で使う。既定は太さ 0）
      "aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-1 aria-[current=page]:before:left-0 aria-[current=page]:before:w-(--tree-current-bar) aria-[current=page]:before:rounded-pill aria-[current=page]:before:bg-(color:--tree-current-bar-color) aria-[current=page]:before:content-['']",
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
  },
  variants: {
    // いまいる行の色（原則6）。指定しないときはグレー
    color: {
      primary: {
        root: '[--tree-current-bar-color:var(--color-primary)] [--tree-current-bg:var(--color-primary-subtle)] [--tree-current-fg:var(--color-on-primary-subtle)]',
      },
      secondary: {
        root: '[--tree-current-bar-color:var(--color-fg-secondary)] [--tree-current-bg:var(--color-secondary-subtle)] [--tree-current-fg:var(--color-on-secondary-subtle)]',
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
          'transition-[height] duration-(--collapsible-duration) ease-(--collapsible-ease)',
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

interface TreeContextValue {
  depth: number;
  slots: ReturnType<typeof tree>;
  /** Tab で止まる行（roving tabindex）。null のときは最初の行 */
  active: string | null;
  setActive: (id: string) => void;
  rootRef: React.RefObject<HTMLUListElement | null>;
}

const TreeContext = createContext<TreeContextValue | null>(null);

/** いま見えている行を、上から順に集める。閉じている並びと、閉じている途中の並びの中は数えない */
function visibleRows(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('[role="treeitem"]')).filter(
    (row) =>
      !row.closest('[data-slot="tree-group"][hidden], [data-slot="tree-group"][data-ending-style]')
  );
}

export interface TreeProps extends Omit<ComponentProps<'ul'>, 'color'> {
  /** 木の読み上げの名前（「ドキュメント」「ファイル」など） */
  label: string;
  /**
   * いまいる行の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーです（原則6）
   * @default 'neutral'
   */
  color?: 'primary' | 'secondary' | 'neutral';
  /**
   * 字下げの案内線を引きます
   * @default true
   */
  guides?: boolean;
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
}

/**
 * 入れ子の行き先を木の形で並べます。ドキュメントの目次や、ファイルの一覧に使います
 */
export function Tree({
  label,
  color,
  guides,
  rowWidth,
  currentIndicator,
  panelMotion,
  selectable,
  className,
  children,
  ...props
}: TreeProps) {
  const slots = tree({ color, guides, rowWidth, currentIndicator, panelMotion, selectable });
  const rootRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<string | null>(null);
  // Tab で止まる行を 1 つ決める（roving tabindex）。いまいる行、なければ最初の行
  useEffect(() => {
    if (active !== null) return;
    const rows = visibleRows(rootRef.current);
    const target = rows.find((row) => row.getAttribute('aria-current') === 'page') ?? rows[0];
    if (target) setActive(target.id);
  }, [active]);
  return (
    <TreeContext value={{ depth: 0, slots, active, setActive, rootRef }}>
      <ul
        ref={rootRef}
        role="tree"
        aria-label={label}
        data-slot="tree"
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </ul>
    </TreeContext>
  );
}

export interface TreeItemProps {
  /** 行に出す文字 */
  label: ReactNode;
  /** 文字の前に置くアイコン（フォルダ・ファイルの印など）。渡さないと置きません */
  icon?: ReactNode;
  /** 行き先。渡すとリンクになり、Enter で移ります */
  href?: string;
  /** 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に行の見た目を重ねます */
  render?: ReactElement;
  /**
   * いまいるページか。true のとき aria-current="page" を付け、印を出します
   * @default false
   */
  current?: boolean;
  /**
   * はじめから開いておくか。子を持つ行だけに効きます
   * @default false
   */
  defaultExpanded?: boolean;
  /** 開いているか。自分で持つときに渡します */
  expanded?: boolean;
  /** 開け閉めしたときに呼ばれます */
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
  /** 行に足すクラス */
  className?: string;
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
  className,
}: TreeItemProps) {
  const context = use(TreeContext);
  const id = useId();
  // 入れ子の並び（group）は li の中、行（treeitem）の兄弟に置く（WAI-ARIA APG の Navigation Treeview）
  //   aria-owns で行に結び付けると、行の読み上げの名前に中の行き先が全部入ってしまう
  const groupId = `${id}-group`;
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  if (!context) throw new Error('TreeItem は Tree の中に置いてください');
  const { depth, slots, active, setActive, rootRef } = context;
  const hasChildren = children != null && children !== false;
  const open = expanded ?? uncontrolled;

  const setOpen = (next: boolean) => {
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
        // 閉じているときは開き、開いているときは最初の子へ移る
        if (hasChildren && !open) setOpen(true);
        else if (hasChildren) move(rows[index + 1]);
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
      default:
        break;
    }
  };

  const row = useRender({
    render,
    defaultTagName: href != null && !disabled ? 'a' : 'div',
    props: {
      id,
      role: 'treeitem',
      'aria-expanded': hasChildren ? open : undefined,
      'aria-current': current ? ('page' as const) : undefined,
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
          {hasChildren ? (
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
          <span className={slots.label()}>{label}</span>
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
        </BaseCollapsible.Panel>
      </TreeContext>
    </BaseCollapsible.Root>
  );
}
