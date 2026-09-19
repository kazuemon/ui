import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CaretLeftIcon, CaretRightIcon } from '../../internal/icons';
import { disabledLinkProps } from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { type PaginationSlot, paginationSlots } from './pagination-items';

// ページ番号のナビ（ブログの記事一覧など）— 軸 160・161
//   構造: <nav aria-label><ul><li>。前へ・番号・省略（…）・次へを 1 行に並べる
//     リンク（href に番号から行き先を作る関数を渡す）とボタン（onChange）の両方で使える
//     いまのページは aria-current="page"。リンクのときもリンクのまま残す（Navbar のいまいるページと同じ）
//   番号と前へ・次へは平らな押すもの（原則3）。hover で文字の色を淡く敷き、押すと濃くして 1px 沈む。影はない（原則1）
//     高さと幅の下限は部品の高さ（原則11・原則17: 押せる範囲は見た目の範囲）。数字は等幅にし、ページを送っても幅が変わらない
//     角は --pagination-item-radius（軸 161 で比べている。既定は部品の角 — 原則5「見た目がボタンなら部品の角」）
//   いまのページの印は --pagination-current-*（軸 160 で比べている。既定はグレーの塗り＋本文の色の太字。
//     色を持たない部品の選んだ印はグレー — 原則6。Navbar の neutral・Tree のいまいる行と同じ地）
//   省略（…）は押せない。キャプションと同じグレーの文字で、読み上げでは読まない（番号の飛びで伝わる）
//   前へ・次へは、端のページでは押せない見た目で残す（原則13。消すと並びの位置が動くため — 原則にない判断）
//     矢印は Caret（‹ ›）。Calendar の月送りと同じく、並びの中を一段ずつ送る印（記事の外へ移る Pager は Arrow）
//   狭いところ（置いた場所の幅。コンテナクエリ — 原則16）では:
//     28rem 未満: いまのページの左右の番号を出さない（1 … 5 … 10）。項目の数を 7 から 5 に減らす
//     32rem 未満: 前へ・次へを矢印だけにする（文字は読み上げに残す）。アイコンだけなので太い線（原則21）
//     2 つの並びを描いて、幅でどちらかを見せる（display: none の側は読み上げにも出ない）
//   どのページにいても項目の数は同じ（pagination-items.ts）。ページを送っても前へ・次へが動かない
const styles = tv({
  slots: {
    root: '@container/pagination text-fg',
    list: 'flex items-center gap-(--pagination-gap)',
    // 広い並び（いまのページの左右の番号あり）と、狭い並び
    wideList: 'hidden @md/pagination:flex',
    narrowList: 'flex @md/pagination:hidden',
    item: [
      'relative inline-flex h-(--spacing-control) min-w-(--spacing-control) shrink-0 cursor-pointer items-center justify-center',
      'rounded-(--pagination-item-radius) px-(--pagination-item-px)',
      // 枠線（軸 161 の比較のためだけ。既定は太さ 0 で線なし）
      'border-(length:--pagination-item-line-width) border-(color:--pagination-item-line)',
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
      // いまのページ: 印の塗りと文字の色（軸 160）。どの印でも太字
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
  },
  variants: {
    // 並びの寄せ方（原則20: 置く場所は使う側が知っている）
    align: {
      start: { list: 'justify-start' },
      center: { list: 'justify-center' },
      end: { list: 'justify-end' },
    },
  },
  defaultVariants: { align: 'center' },
});

type Styles = ReturnType<typeof styles>;

export type PaginationAlign = 'start' | 'center' | 'end';

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'children' | 'onChange'> {
  /** いまのページ（1 から数える） */
  page: number;
  /** ページの数 */
  count: number;
  /**
   * 番号から行き先を作る関数。渡すと、番号と前へ・次へをリンク（`<a>`）で描きます（例: `(page) => \`/blog/page/${page}\``）
   */
  href?: (page: number) => string;
  /**
   * 番号ごとに描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に見た目を重ねます
   * （例: `render={(page) => <NextLink href={\`/blog/page/${page}\`} />}`）。渡すと、リンクで描きます
   */
  render?: (page: number) => ReactElement;
  /**
   * 番号・前へ・次へを押したときに、行き先のページを渡して呼びます。href も render も渡さないときは、ボタン（`<button>`）で描きます。
   * リンクのときも呼びます（移る動きは止めません）。いまのページを押しても呼びません
   */
  onChange?: (page: number) => void;
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
   * 並び（nav）の読み上げの名前
   * @default 'ページ送り'
   */
  label?: string;
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
  pageLabel?: (page: number) => string;
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
 * リンク（href・render）でもボタン（onChange）でも使えます。狭いところでは番号を減らし、前へ・次へを矢印だけにします。
 */
export function Pagination({
  page,
  count,
  href,
  render,
  onChange,
  siblings = 1,
  boundaries = 1,
  align,
  label = 'ページ送り',
  prevLabel = '前へ',
  nextLabel = '次へ',
  pageLabel = (value) => `${value} ページ目`,
  className,
  ...props
}: PaginationProps) {
  const s = styles({ align });
  const asLink = href != null || render != null;
  const Control = asLink ? LinkControl : ButtonControl;
  const shared = { s, href, render, onChange };

  const list = (slots: PaginationSlot[], listClass: string) => (
    <ul className={s.list({ className: listClass })}>
      <li className="flex">
        <Control {...shared} target={page - 1} disabled={page <= 1} kind="prev">
          <CaretLeftIcon />
          <span className={s.stepLabel()}>{prevLabel}</span>
        </Control>
      </li>
      {slots.map((slot) =>
        typeof slot === 'number' ? (
          <li key={slot} className="flex">
            <Control
              {...shared}
              target={slot}
              kind="page"
              current={slot === page}
              ariaLabel={pageLabel(slot)}
            >
              {slot}
            </Control>
          </li>
        ) : (
          <li key={slot} aria-hidden="true" className="flex">
            <span data-slot="pagination-ellipsis" className={s.ellipsis()}>
              …
            </span>
          </li>
        )
      )}
      <li className="flex">
        <Control {...shared} target={page + 1} disabled={page >= count} kind="next">
          <span className={s.stepLabel()}>{nextLabel}</span>
          <CaretRightIcon />
        </Control>
      </li>
    </ul>
  );

  return (
    <nav aria-label={label} data-slot="pagination" className={s.root({ className })} {...props}>
      {list(paginationSlots(page, count, siblings, boundaries), s.wideList())}
      {list(paginationSlots(page, count, 0, boundaries), s.narrowList())}
    </nav>
  );
}
