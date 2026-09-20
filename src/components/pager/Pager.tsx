'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { ArrowLeftIcon, ArrowRightIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

// 記事の前後へ移るナビ — 軸 145
//   構造: nav の中に、前と次の 2 つの行き先を横に並べる。幅が狭いときは縦に積む
//     並べ方は、画面ではなく置いた場所の幅で決める（コンテナクエリ。Navbar と同じ考え方 — 原則11）
//     ページ番号を並べるもの（Pagination）は別の部品。ここは行き先が 2 つだけ
//   矢印は外向き（前は左、次は右。Arrow）。文字は前が左寄せ、次が右寄せで、ページの外へ出る向きをそのまま表す
//     行き先ごとに icon で差し替えられる。置き場所は変えない
//   影は付けない（原則1: ページと同じレイヤー）
//   見た目は 2 つ（軸 145）。既定は押せるカード（card）で、矢印付きの文字のリンク（text）も選べる
//     card: 押せるカードと同じ面（Card と同じ作り）。地と同じ白なので細い輪郭で面を見せる（原則1）。角はカードの角（原則5）
//       浮いた押すもの（ADR-0169）: ボタンと同じ薄い影を付け、hover で落ち影を消して面を淡く塗る。押すと沈む（原則3）。輪郭は変えない
//       塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
//     text: 面も枠線も持たない。題は文字のリンクと同じで、ふだんは淡い下線、hover で下線だけが濃くなる（原則3）
//       押せる範囲は、矢印と文字の幅だけ（原則7: 押せる範囲は見た目の範囲と一致させる）。
//       左右に寄せた空きでは反応しないよう、行き先そのものを幅いっぱいに広げず、格子の中で外側へ寄せる（justify-self）
const styles = tv({
  slots: {
    root: '@container/pager text-fg',
    // 2 つの行き先。28rem（@md）より狭いところでは縦に積む
    list: 'grid gap-(--pager-gap)',
    item: [
      'group/pager-item flex cursor-pointer items-center gap-(--pager-item-gap) no-underline',
      'active:translate-y-(--pager-press-depth)',
      // キーボードで操作したときだけ線を出す（原則2）。色を持たない部品なので、線は本文と同じ濃紺
      ...focusRing,
    ],
    // 片方だけのときに、もう片方の場所を空けておく席（keepSpace）。縦に積むときは席を取らない
    placeholder: 'hidden @md/pager:block',
    // 矢印の入れ物。利用者が差し替えたアイコンも、部品の文字と並ぶ大きさ（--spacing-icon）にそろえる
    arrow: 'flex shrink-0 [&_svg]:size-(--spacing-icon)',
    body: 'flex min-w-0 flex-col gap-(--pager-label-gap)',
    // 小さい見出し（「前の記事」）。キャプションと同じ大きさ・同じグレー（原則4）
    label: '[display:var(--pager-label-display)] text-caption text-fg-subtle',
    title: 'text-control font-bold [overflow-wrap:anywhere]',
  },
  variants: {
    appearance: {
      card: {
        item: [
          'rounded-(--pager-card-radius) border-(length:--pager-card-line-width) border-(color:--pager-card-line)',
          'px-(--pager-card-padding-inline) py-(--pager-card-padding-block)',
          'bg-(color:--flat-bg) shadow-raised [--flat-bg:var(--pager-card-fill)]',
          'hover:shadow-raised-hover hover:[--flat-bg:var(--pager-card-fill-hover)]',
          'active:shadow-(--shadow-raised-press) active:[--flat-bg:var(--pager-card-fill-press)]',
          '[transition:--flat-bg_var(--duration-press)_var(--ease-press),box-shadow_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
          'motion-reduce:[transition:none]',
        ],
      },
      text: {
        item: [
          'rounded-(--pager-text-radius)',
          '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
          'motion-reduce:[transition:none]',
        ],
        title: [
          'underline [text-decoration-color:var(--pager-text-underline)] decoration-1 underline-offset-4',
          'group-hover/pager-item:[text-decoration-color:var(--pager-text-underline-hover)]',
          '[transition:text-decoration-color_var(--pager-text-underline-duration)_var(--pager-text-underline-ease)]',
          'motion-reduce:[transition:none]',
        ],
      },
    },
    // 矢印は外向き、文字は外側へ寄せる
    direction: {
      prev: { item: 'justify-start text-start' },
      next: { item: 'justify-end text-end' },
    },
    // 2 つ分の席を取るか（前後そろっているとき、または keepSpace のとき）
    columns: {
      one: { list: 'grid-cols-1' },
      two: { list: 'grid-cols-1 @md/pager:grid-cols-2' },
    },
  },
  compoundVariants: [
    // 文字のリンクは、席の幅いっぱいに広げず、中身の幅のまま外側へ寄せる（押せる範囲＝矢印と文字）
    { appearance: 'text', direction: 'prev', class: { item: 'justify-self-start' } },
    { appearance: 'text', direction: 'next', class: { item: 'justify-self-end' } },
  ],
  defaultVariants: { appearance: 'card', direction: 'prev', columns: 'two' },
});

export type PagerDirection = 'prev' | 'next';
export type PagerAppearance = 'card' | 'text';

export interface PagerDestination {
  /** 行き先。render に Next.js の Link などを渡すときは、href もその要素に書きます */
  href?: string;
  /** 記事の題。長いときは折り返します */
  title: ReactNode;
  /**
   * 題の上に出す小さい見出し
   * @default prev は '前の記事'、next は '次の記事'
   */
  label?: ReactNode;
  /**
   * 文字の外側に置くアイコン。渡すと矢印を差し替えます（`<Icon icon={CaretLeftIcon} />` など）。
   * 大きさは部品の中の文字と並ぶ大きさにそろえ、飾りとして読み上げから外します。置き場所は変わりません（前は左、次は右）
   * @default prev は左向きの矢印（←）、next は右向きの矢印（→）
   */
  icon?: ReactNode;
  /**
   * 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に行き先の見た目を重ねます
   * （例: `render={<NextLink href="/blog/1" />}`）
   */
  render?: ReactElement;
}

export interface PagerProps extends Omit<ComponentProps<'nav'>, 'title' | 'children'> {
  /**
   * 見た目。card は押せるカードと同じ面で、hover で面と輪郭が変わります。
   * text は面も枠線も持たない、矢印付きの文字のリンクで、hover で題の下線が濃くなります。
   * 記事の下で次に読むものを見せたいときは card、本文の終わりを静かに閉じたいときは text にします。
   * text の押せる範囲は、矢印と文字の幅だけです（左右に寄せた空きでは反応しません）
   * @default 'card'
   */
  appearance?: PagerAppearance;
  /**
   * 並び（nav）の読み上げの名前。記事の下に目次やパンくずが並んでも見分けられるよう、既定は前後へ移る並びだと分かる名前にしています
   * @default '前後の記事'
   */
  label?: string;
  /** 前の記事。渡さないと、前の行き先を出しません */
  prev?: PagerDestination;
  /** 次の記事。渡さないと、次の行き先を出しません */
  next?: PagerDestination;
  /**
   * 片方だけのときに、もう片方の場所を空けて位置を保つか。
   * true は、次の記事だけでも右半分に置きます（記事を続けて読むとき、行き先の位置が動きません）。
   * false は、1 つだけのときに場所を詰めます（card は幅いっぱいに広がります）。縦に積む幅では、どちらも同じ見た目です
   * @default true
   */
  keepSpace?: boolean;
}

function PagerItem({
  appearance,
  direction,
  destination,
}: {
  appearance: PagerAppearance;
  direction: PagerDirection;
  destination: PagerDestination;
}) {
  const s = styles({ appearance, direction });
  const { href, title, label, icon, render } = destination;
  // 矢印は外向き（前は左、次は右）。利用者がアイコンを渡したときは、置き場所は変えずに差し替える
  const arrow = (
    <span aria-hidden="true" className={s.arrow()}>
      {icon ?? (direction === 'prev' ? <ArrowLeftIcon /> : <ArrowRightIcon />)}
    </span>
  );
  // 読み上げでは、小さい見出しと題の両方がリンクの名前になる（「前の記事 トークンの決め方」）
  const body = (
    <span className={s.body()}>
      <span className={s.label()}>{label ?? (direction === 'prev' ? '前の記事' : '次の記事')}</span>
      <span className={s.title()}>{title}</span>
    </span>
  );
  return useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...(href != null && { href }),
      'data-slot': 'pager-item',
      'data-appearance': appearance,
      'data-direction': direction,
      className: s.item(),
      children:
        direction === 'prev' ? (
          <>
            {arrow}
            {body}
          </>
        ) : (
          <>
            {body}
            {arrow}
          </>
        ),
    },
  });
}

/**
 * 記事の前後へ移るナビです。前と次の 2 つの行き先を並べ、狭いところでは縦に積みます。
 *
 * ページ番号を並べる部品ではありません。行き先は前と次の 2 つだけです。
 */
export function Pager({
  appearance = 'card',
  label = '前後の記事',
  prev,
  next,
  keepSpace = true,
  className,
  ...props
}: PagerProps) {
  const both = prev != null && next != null;
  const s = styles({ appearance, columns: both || keepSpace ? 'two' : 'one' });
  return (
    <nav
      aria-label={label}
      data-slot="pager"
      data-appearance={appearance}
      className={s.root({ className })}
      {...props}
    >
      <div className={s.list()}>
        {prev ? (
          <PagerItem appearance={appearance} direction="prev" destination={prev} />
        ) : (
          keepSpace && <div className={s.placeholder()} />
        )}
        {next ? (
          <PagerItem appearance={appearance} direction="next" destination={next} />
        ) : (
          keepSpace && <div className={s.placeholder()} />
        )}
      </div>
    </nav>
  );
}
