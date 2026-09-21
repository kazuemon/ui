'use client';

import { useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type ReactElement, type ReactNode, useId, useState } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CaretLeftIcon, CaretRightIcon } from '../../internal/icons';
import { disabledLinkProps } from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { ellipsisRange, type PaginationSlot, paginationSlots } from './pagination-items';
import { PaginationEllipsisMenu } from './PaginationEllipsisMenu';
import { PaginationPageInput } from './PaginationPageInput';

// ページ番号のナビ（ブログの記事一覧など）— ADR-0177・0178 で決めた
//   構造: <nav aria-label><ul><li>。前へ・番号・省略（…）・次へを 1 行に並べる
//     リンク（href に番号から行き先を作る関数を渡す）とボタン（onPageChange）の両方で使える
//     いまのページは aria-current="page"。リンクのときもリンクのまま残す（Navbar のいまいるページと同じ）
//   番号と前へ・次へは平らな押すもの（原則3）。hover で文字の色を淡く敷き、押すと濃くして 1px 沈む。影はない（原則1）
//     高さと幅の下限は部品の高さ（原則11・原則17: 押せる範囲は見た目の範囲）。数字は等幅にし、ページを送っても幅が変わらない
//     形は shape と showOutline で選ぶ（ADR-0178）。square（既定）は部品の角（原則5「見た目がボタンなら部品の角」）、
//       circle は pill（Navbar の行き先・Calendar の circle と同じ）。showOutline は番号ごとに細い境界線を引く
//   いまのページの印は currentIndicator で選ぶ（ADR-0177。Navbar の currentIndicator と同じ名前）。どの印でも太字
//     neutral（既定）はグレーの塗りに本文の色（色を持たない部品の選んだ印はグレー — 原則6。Tree のいまいる行と同じ地）
//     neutral-strong は濃いグレーに白い文字（トグルの ON と同じ）、primary は淡い青に青い文字（Navbar の primary と同じ）
//     secondary は淡いピンクに、primary と同じ作りでピンクの文字
//   省略（…）は、ふだんは押せない。キャプションと同じグレーの文字で、読み上げでは読まない（番号の飛びで伝わる）
//     ellipsisMenu を付けると押して間のページを選べるメニューになり、押せるので番号と同じ大きさ（指で押せる大きさ）を取る（原則17）
//   前へ・次へは、端のページでは押せない見た目で残す（原則13。消すと並びの位置が動くため — 原則にない判断）
//     矢印は Caret（‹ ›）。Calendar の月送りと同じく、並びの中を一段ずつ送る印（記事の外へ移る Pager は Arrow）
//   狭いところ（置いた場所の幅。コンテナクエリ — 原則16）では:
//     32rem 未満: 前へ・次へを矢印だけにする（文字は読み上げに残す）。アイコンだけなので太い線（原則21）
//     28rem 未満: いまのページの左右の番号を出さない（1 … 5 … 10）。項目の数を 7 から 5 に減らす
//     24rem 未満: 番号をやめて「5 / 10」だけにする（narrowDisplay="summary"。既定）。前へ・次へは残す
//       番号が並ばない分、押せる場所が減るので、showPageInput（数を打って移る欄）か ellipsisMenu で間のページへ行けるようにする
//       narrowDisplay="pages" にすると、24rem 未満でも番号を並べたまま（28rem 未満と同じ並び）にする
//     幅ごとの並びを描き分け、幅でどれかを見せる（display: none の側は読み上げにも出ない）
//   どのページにいても項目の数は同じ（pagination-items.ts）。ページを送っても前へ・次へが動かない
const styles = tv({
  slots: {
    root: '@container/pagination text-fg',
    list: 'flex items-center gap-(--pagination-gap)',
    // 広い並び（いまのページの左右の番号あり）・狭い並び・いちばん狭い並び（「5 / 10」だけ）
    wideList: 'hidden @md/pagination:flex',
    narrowList: '',
    summaryList: 'flex @sm/pagination:hidden',
    item: [
      'relative inline-flex h-(--spacing-control) min-w-(--spacing-control) shrink-0 cursor-pointer items-center justify-center',
      'rounded-(--pagination-item-radius) px-(--pagination-item-px)',
      'text-(length:--text-control) leading-(--leading-control) whitespace-nowrap tabular-nums no-underline select-none',
      'text-(color:--pagination-item-color)',
      // 塗り: ふだんは透明、いまのページは --pagination-current-bg。hover と押下は、その上に文字の色を淡く敷く
      // 塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
      '[--pagination-item-ink:var(--color-fg)] [--pagination-item-rest:transparent]',
      'bg-(color:--flat-bg) [--flat-bg:var(--pagination-item-rest)]',
      'not-[:disabled,[data-disabled]]:hover:[--flat-bg:color-mix(in_oklab,var(--pagination-item-ink)_var(--flat-hover-mix),var(--pagination-item-rest))]',
      'not-[:disabled,[data-disabled]]:active:translate-y-(--flat-press-depth) not-[:disabled,[data-disabled]]:active:[--flat-bg:color-mix(in_oklab,var(--pagination-item-ink)_var(--flat-press-mix),var(--pagination-item-rest))]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
      // いまのページ: 印の塗りと文字の色（currentIndicator が root に置く）。どの印でも太字
      'aria-[current=page]:font-bold aria-[current=page]:text-(color:--pagination-current-fg)',
      'aria-[current=page]:[--pagination-item-ink:var(--pagination-current-fg)] aria-[current=page]:[--pagination-item-rest:var(--pagination-current-bg)]',
      // 押せない（端のページの前へ・次へ）: 押せない枠線のグレーのボタンと同じ文字の色（原則13）
      'disabled:cursor-not-allowed disabled:text-(color:--color-outline-neutral-disabled-text)',
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-outline-neutral-disabled-text)',
    ],
    // 前へ・次へ。広いところでは矢印と文字、狭いところでは矢印だけ（正方形）
    step: [
      'gap-(--pagination-step-gap) px-0 @lg/pagination:px-(--pagination-step-px)',
      // 矢印だけのときは太い線（原則21）。--icon-stroke は矢印の svg が読む
      '@max-lg/pagination:[--icon-stroke:var(--icon-stroke-standalone)]',
    ],
    stepLabel: 'sr-only @lg/pagination:not-sr-only',
    ellipsis: [
      'inline-flex h-(--spacing-control) w-(--pagination-ellipsis-width) shrink-0 items-center justify-center',
      'text-(length:--text-control) leading-(--leading-control) text-(color:--pagination-ellipsis-color) select-none',
    ],
    // いちばん狭いところの「5 / 10」
    count: [
      'inline-flex h-(--spacing-control) shrink-0 items-center justify-center gap-(--pagination-count-gap)',
      'px-(--pagination-item-px) text-(length:--text-control) leading-(--leading-control) whitespace-nowrap tabular-nums',
    ],
    countCurrent: 'font-bold text-fg',
    countTotal: 'text-(color:--pagination-item-color)',
  },
  variants: {
    // いまのページの印。塗りと文字の色を root に置き、番号が読む
    currentIndicator: {
      neutral: {
        root: '[--pagination-current-bg:var(--color-neutral)] [--pagination-current-fg:var(--color-fg)]',
      },
      'neutral-strong': {
        root: '[--pagination-current-bg:var(--color-neutral-strong)] [--pagination-current-fg:var(--color-on-neutral-strong)]',
      },
      primary: {
        root: '[--pagination-current-bg:var(--color-primary-subtle)] [--pagination-current-fg:var(--color-on-primary-subtle)]',
      },
      secondary: {
        root: '[--pagination-current-bg:var(--color-secondary-subtle)] [--pagination-current-fg:var(--color-on-secondary-subtle)]',
      },
    },
    // 番号と前へ・次への角
    shape: {
      square: { root: '[--pagination-item-radius:var(--radius-control)]' },
      circle: { root: '[--pagination-item-radius:var(--radius-pill)]' },
    },
    // 番号と前へ・次への細い境界線（押せる範囲をふだんから見せる — 原則17）
    outline: {
      true: { item: 'border-(length:--border-width-thin) border-line' },
      false: {},
    },
    // 並びの寄せ方（原則20: 置く場所は使う側が知っている）
    align: {
      start: { list: 'justify-start' },
      center: { list: 'justify-center' },
      end: { list: 'justify-end' },
    },
    // いちばん狭いところ（24rem 未満）の見せ方
    narrowDisplay: {
      // 24rem 以上 28rem 未満だけ、番号を並べた狭い並びを出す
      summary: { narrowList: 'hidden @sm/pagination:flex @md/pagination:hidden' },
      // 28rem 未満はいつも番号を並べる（いちばん狭い並びは描かない）
      pages: { narrowList: 'flex @md/pagination:hidden' },
    },
  },
  defaultVariants: {
    align: 'center',
    currentIndicator: 'neutral',
    shape: 'square',
    outline: false,
    narrowDisplay: 'summary',
  },
});

type Styles = ReturnType<typeof styles>;

export type PaginationAlign = 'start' | 'center' | 'end';
export type PaginationCurrentIndicator = 'neutral' | 'neutral-strong' | 'primary' | 'secondary';
export type PaginationShape = 'square' | 'circle';
export type PaginationNarrowDisplay = 'summary' | 'pages';

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'children' | 'onChange'> {
  /** いまのページ（1 から数える。制御） */
  page?: number;
  /**
   * はじめのページ（1 から数える。非制御）
   * @default 1
   */
  defaultPage?: number;
  /** ページが変わるときに、次の値を渡して呼びます */
  onPageChange?: (page: number) => void;
  /** ページの数 */
  count: number;
  /**
   * 番号から行き先を作る関数。渡すと、番号と前へ・次へをリンク（`<a>`）で描きます（例: `(page) => \`/blog/page/${page}\``）
   */
  href?: (page: number) => string;
  /**
   * 番号ごとに描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に見た目を重ねます
   * （例: `renderPage={(page) => <NextLink href={\`/blog/page/${page}\`} />}`）。渡すと、リンクで描きます
   */
  renderPage?: (page: number) => ReactElement;
  /**
   * いまのページの左右に出す番号の数。置いた場所が狭いとき（28rem 未満）は 0 にします
   * @default 1
   */
  siblings?: number;
  /**
   * 両端に出す番号の数
   * @default 1
   */
  boundaries?: number;
  /**
   * 並びの寄せ方
   * @default 'center'
   */
  align?: PaginationAlign;
  /**
   * いまのページの印。どれも文字は太字です。neutral はグレーの塗り、neutral-strong は濃いグレーの塗りに白い文字、
   * primary は淡い青の塗りに青い文字、secondary は淡いピンクの塗りにピンクの文字です。neutral-strong はいまの位置をいちばん強く見せます
   * @default 'neutral'
   */
  currentIndicator?: PaginationCurrentIndicator;
  /**
   * 番号と前へ・次への形。square はボタンと同じ角、circle は丸です（2 桁以上の番号と、文字の付いた前へ・次へは両端の丸い形）
   * @default 'square'
   */
  shape?: PaginationShape;
  /**
   * 番号と前へ・次へに細い枠線を引き、押せる範囲をふだんから見せます
   * @default false
   */
  showOutline?: boolean;
  /**
   * 置いた場所がいちばん狭いとき（24rem 未満）の見せ方。
   * `summary` は番号をやめて「5 / 10」だけを出します（前へ・次へは残ります）。
   * `pages` は 24rem 未満でも番号を並べたままにします（28rem 未満と同じ並び）
   * @default 'summary'
   */
  narrowDisplay?: PaginationNarrowDisplay;
  /**
   * 省略（…）を押して、間のページをメニューから選べるようにします。押せるので、番号と同じ大きさ（指で押せる大きさ）になります。
   * 付けないときの省略は押せない文字です
   * @default false
   */
  ellipsisMenu?: boolean;
  /**
   * いちばん狭いとき（`narrowDisplay="summary"`）の「5 / 10」の 5 を、数を打って移る欄にします。
   * Enter か IME の確定で移ります。ページの数より大きい数や 0 以下では移らず、欄を離すと打った値はいまのページに戻ります。
   * `href` だけを渡しているときはその行き先へそのまま移ります。ルーターで移すときは `onPageChange`（`renderPage` のときは `onPageChange` だけ）を渡します
   * @default false
   */
  showPageInput?: boolean;
  /**
   * 並び（nav）の読み上げの名前。画面には出ません
   * @default 'ページ送り'
   */
  accessibleName?: string;
  /**
   * 前へのボタンの文字。置いた場所が狭いとき（32rem 未満）は矢印だけになり、文字は読み上げにだけ残ります
   * @default '前へ'
   */
  prevLabel?: string;
  /**
   * 次へのボタンの文字
   * @default '次へ'
   */
  nextLabel?: string;
  /**
   * 番号の読み上げの名前を作る関数。見えている数字を含めます
   * @default (page) => `${page} ページ目`
   */
  pageName?: (page: number) => string;
  /**
   * いちばん狭いときの「5 / 10」を読み上げる文を作る関数。いまのページと総数を伝えます
   * @default (page, count) => `${count} ページ中 ${page} ページ目`
   */
  summaryText?: (page: number, count: number) => string;
  /**
   * `ellipsisMenu` のとき、省略（…）を開くボタンの読み上げの名前
   * @default '間のページ'
   */
  ellipsisName?: string;
  /**
   * `showPageInput` のとき、数を打って移る欄の読み上げの名前
   * @default 'ページ番号'
   */
  pageInputName?: string;
  /** いちばん外の要素（nav）に付きます */
  className?: string;
}

interface ControlProps {
  s: Styles;
  target: number;
  current?: boolean;
  disabled?: boolean;
  /** 前へ・次へ・番号（ストーリーで状態を当てるときの目印にもする） */
  kind: 'prev' | 'next' | 'page';
  ariaLabel?: string;
  children: ReactNode;
  href?: (page: number) => string;
  render?: (page: number) => ReactElement;
  onChange?: (page: number) => void;
}

// リンクで描く番号・前へ・次へ
function LinkControl({
  s,
  target,
  current,
  disabled,
  kind,
  ariaLabel,
  children,
  href,
  render,
  onChange,
}: ControlProps) {
  const className = s.item({ className: kind === 'page' ? undefined : s.step() });
  const element = useRender({
    // 押せないときは、渡された要素（Next.js の Link など）を描かず、href のない <a> にする
    render: disabled ? <a /> : render?.(target),
    defaultTagName: 'a',
    props: disabled
      ? {
          ...disabledLinkProps,
          'data-slot': 'pagination-item',
          'data-kind': kind,
          className,
          children,
        }
      : {
          ...(href && { href: href(target) }),
          'aria-current': current ? ('page' as const) : undefined,
          'aria-label': ariaLabel,
          // リンクでも onChange を渡したときは、移る前に知らせる（移る動きは止めない）
          onClick: onChange && !current ? () => onChange(target) : undefined,
          'data-slot': 'pagination-item',
          'data-kind': kind,
          className,
          children,
        },
  });
  return element;
}

// ボタンで描く番号・前へ・次へ
function ButtonControl({
  s,
  target,
  current,
  disabled,
  kind,
  ariaLabel,
  children,
  onChange,
}: ControlProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={current ? 'page' : undefined}
      aria-label={ariaLabel}
      data-slot="pagination-item"
      data-kind={kind}
      className={s.item({ className: kind === 'page' ? undefined : s.step() })}
      onClick={() => {
        if (!current) onChange?.(target);
      }}
    >
      {children}
    </button>
  );
}

/**
 * ページ番号のナビです。前へ・番号・省略・次へを 1 行に並べます。
 * リンク（href・renderPage）でもボタン（onPageChange）でも使えます。狭いところでは番号を減らし、前へ・次へを矢印だけにします。
 * いちばん狭いところでは「5 / 10」だけにし、数を打つ欄（`showPageInput`）や省略のメニュー（`ellipsisMenu`）で間のページへ行けます。
 */
export function Pagination({
  page: controlledPage,
  defaultPage = 1,
  onPageChange,
  count,
  href,
  renderPage,
  siblings = 1,
  boundaries = 1,
  align,
  currentIndicator,
  shape,
  showOutline,
  narrowDisplay = 'summary',
  ellipsisMenu = false,
  showPageInput = false,
  accessibleName = 'ページ送り',
  prevLabel = '前へ',
  nextLabel = '次へ',
  pageName = (value) => `${value} ページ目`,
  summaryText = (value, total) => `${total} ページ中 ${value} ページ目`,
  ellipsisName = '間のページ',
  pageInputName = 'ページ番号',
  className,
  ...props
}: PaginationProps) {
  const s = styles({ align, currentIndicator, shape, outline: showOutline, narrowDisplay });
  // 制御（page）と非制御（defaultPage）の両方で使える
  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const managed = controlledPage === undefined;
  const page = controlledPage ?? uncontrolledPage;
  // 外から page を持っていて、知らせ先もないときは、押しても何もしない（リンクの移動だけ）
  const changePage =
    managed || onPageChange
      ? (next: number) => {
          if (managed) setUncontrolledPage(next);
          onPageChange?.(next);
        }
      : undefined;
  const asLink = href != null || renderPage != null;
  const Control = asLink ? LinkControl : ButtonControl;
  const shared = { s, href, render: renderPage, onChange: changePage };
  const summaryId = useId();

  const steps = (children: ReactNode) => (
    <>
      <li className="flex">
        <Control {...shared} target={page - 1} disabled={page <= 1} kind="prev">
          <CaretLeftIcon />
          <span className={s.stepLabel()}>{prevLabel}</span>
        </Control>
      </li>
      {children}
      <li className="flex">
        <Control {...shared} target={page + 1} disabled={page >= count} kind="next">
          <span className={s.stepLabel()}>{nextLabel}</span>
          <CaretRightIcon />
        </Control>
      </li>
    </>
  );

  const list = (slots: PaginationSlot[], listClass: string) => (
    <ul className={s.list({ className: listClass })}>
      {steps(
        slots.map((slot, index) =>
          typeof slot === 'number' ? (
            <li key={slot} className="flex">
              <Control
                {...shared}
                target={slot}
                kind="page"
                current={slot === page}
                ariaLabel={pageName(slot)}
              >
                {slot}
              </Control>
            </li>
          ) : ellipsisMenu ? (
            <li key={slot} className="flex">
              <PaginationEllipsisMenu
                pages={ellipsisRange(slots, index, count)}
                className={s.item()}
                label={ellipsisName}
                pageLabel={pageName}
                href={href}
                render={renderPage}
                onChange={changePage}
              />
            </li>
          ) : (
            <li key={slot} aria-hidden="true" className="flex">
              <span data-slot="pagination-ellipsis" className={s.ellipsis()}>
                …
              </span>
            </li>
          )
        )
      )}
    </ul>
  );

  // いちばん狭い並び（narrowDisplay="summary"）。番号をやめ、「5 / 10」と前へ・次へだけにする
  const summaryList = (
    <ul className={s.list({ className: s.summaryList() })}>
      {steps(
        <li className="flex">
          <span data-slot="pagination-summary" className={s.count()}>
            <span id={summaryId} className="sr-only">
              {summaryText(page, count)}
            </span>
            {showPageInput ? (
              <PaginationPageInput
                page={page}
                count={count}
                label={pageInputName}
                describedBy={summaryId}
                href={href}
                render={renderPage}
                onChange={changePage}
              />
            ) : (
              <span aria-hidden="true" className={s.countCurrent()}>
                {page}
              </span>
            )}
            <span aria-hidden="true" className={s.countTotal()}>
              / {count}
            </span>
          </span>
        </li>
      )}
    </ul>
  );

  return (
    <nav
      {...props}
      aria-label={accessibleName}
      data-slot="pagination"
      className={s.root({ className })}
    >
      {list(paginationSlots(page, count, siblings, boundaries), s.wideList())}
      {list(paginationSlots(page, count, 0, boundaries), s.narrowList())}
      {narrowDisplay === 'summary' && summaryList}
    </nav>
  );
}
