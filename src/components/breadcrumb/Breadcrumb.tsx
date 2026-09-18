import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  type ComponentProps,
  createContext,
  type ReactElement,
  type ReactNode,
  use,
} from 'react';

import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { CaretRightIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

// パンくずリスト — 軸 143・144
//   構造は <nav aria-label><ol><li>。いまいるページ（最後の項目）はリンクにせず、aria-current="page" を付ける
//   影は付けない（原則1: ページと同じレイヤーに置く案内で、浮かせるものではない）
//   文字は部品の文字（--text-control）ではなく、読む文字の小さいほう（--text-body-sm）にする — 原則11
//     パンくずは押すものの高さを持たない。中身は文字のリンクで、押せる範囲は文字の行だけ（原則7）。
//     置かれるのはページの本文の上で、本文より小さい注記にあたる。読む文字の尺度に乗せると、
//     置いた場所の文字とそろい、記事の中（読みもの）では指でもマウスと同じ大きさのままになる（原則11）
//   行き先のリンクは平らな押すもの（原則3）。押すと 1px 沈む。キーボードのフォーカスは、ボタン・リンクと同じ離した線（focusRing）
//     見た目は appearance で選ぶ（軸 144）。既定は underline（文字のリンクと同じ淡い下線で、hover で下線だけが濃くなる）
//       hover-underline: ふだんは下線を引かず、hover で濃い下線が出る
//       pill: Navbar の行き先と同じ平らな pill。下線を引かず、hover で文字の色を淡く敷き、押すと濃くする
//     どの見た目も、--breadcrumb-link-*（下線の色・敷く塗り・角丸・余白）の差だけで作る。値は design/tokens.css
//   いまいるページは Navbar の行き先と同じ考え方で、本文の色の太字にする
//   区切りの印は aria-hidden で読み上げから外す。形は separator で選ぶ（軸 143）
//     既定は caret（右向きの山。ページをたどる向きが出る）。slash（「/」）も選べ、ReactNode を渡せば任意の印にできる
//   長くて入りきらないときは折り返す（原則にない判断。横にスクロールする・中を「…」に畳む形は未決）
const breadcrumb = tv({
  slots: {
    root: 'text-body-sm text-fg-muted',
    list: 'flex flex-wrap items-center gap-x-(--breadcrumb-gap) gap-y-(--breadcrumb-row-gap)',
    item: 'flex items-center gap-x-(--breadcrumb-gap)',
    // 区切りの印。中に置いたアイコンは、周りの文字と同じ大きさにそろえる
    separator: [
      'flex shrink-0 items-center select-none',
      'text-(length:--breadcrumb-separator-size) text-(color:--color-breadcrumb-separator)',
      '[&_svg]:size-[1em]',
    ],
    link: [
      'inline-flex cursor-pointer items-center',
      'rounded-(--breadcrumb-link-radius) px-(--breadcrumb-link-px) py-(--breadcrumb-link-py)',
      'text-(color:--breadcrumb-link-color)',
      // 下線（原則3・ADR-0030）: ふだんは淡く、hover で下線だけが濃くなる。文字の色と太さは変えない
      'underline [text-decoration-color:var(--breadcrumb-link-underline)] decoration-1 underline-offset-4',
      'hover:text-(color:--breadcrumb-link-hover-color) hover:[text-decoration-color:var(--breadcrumb-link-underline-hover)]',
      // 塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'hover:[--flat-bg:var(--breadcrumb-link-hover-bg)]',
      'active:translate-y-(--flat-press-depth) active:[--flat-bg:var(--breadcrumb-link-press-bg)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),text-decoration-color_var(--link-underline-duration)_var(--link-underline-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
    ],
    // いまいるページ。行き先と文字の位置をそろえるため、余白は同じ
    current: [
      'inline-flex items-center px-(--breadcrumb-link-px) py-(--breadcrumb-link-py)',
      'font-bold text-fg',
    ],
  },
  variants: {
    // 行き先の見た目（軸 144）。差し替える値は nav に置き、行き先といまいるページの両方に効かせる
    appearance: {
      // 既定。design/tokens.css の値をそのまま使う
      underline: {},
      'hover-underline': { root: '[--breadcrumb-link-underline:transparent]' },
      pill: {
        root: [
          '[--breadcrumb-link-underline-hover:transparent] [--breadcrumb-link-underline:transparent]',
          '[--breadcrumb-link-radius:var(--breadcrumb-pill-radius)]',
          '[--breadcrumb-link-px:var(--breadcrumb-pill-px)] [--breadcrumb-link-py:var(--breadcrumb-pill-py)]',
          '[--breadcrumb-link-hover-bg:var(--breadcrumb-pill-hover-bg)] [--breadcrumb-link-press-bg:var(--breadcrumb-pill-press-bg)]',
        ],
      },
    },
  },
  defaultVariants: { appearance: 'underline' },
});

const BreadcrumbContext = createContext<{ first: boolean; separator: ReactNode }>({
  first: true,
  separator: null,
});

/** 用意してある区切りの印（軸 143） */
export type BreadcrumbSeparatorName = 'caret' | 'slash';

/** 行き先の見た目（軸 144） */
export type BreadcrumbAppearance = NonNullable<VariantProps<typeof breadcrumb>['appearance']>;

// 用意してある区切りの印。ほかの形は ReactNode を渡して差し替える
const separators: Record<BreadcrumbSeparatorName, ReactNode> = {
  caret: <CaretRightIcon />,
  slash: '/',
};

const isSeparatorName = (value: ReactNode): value is BreadcrumbSeparatorName =>
  value === 'caret' || value === 'slash';

export interface BreadcrumbProps extends Omit<ComponentProps<'nav'>, 'children'> {
  /**
   * 並び（nav）の読み上げの名前
   * @default '現在の場所'
   */
  label?: string;
  /**
   * 項目のあいだに置く区切りの印。読み上げからは外れます。
   * 用意してある印（BreadcrumbSeparatorName）は 'caret' と 'slash' で、caret は右向きの山（›。ページをたどる向きが出ます）、
   * slash は URL と同じ「/」です。ほかの形にするときは、文字やアイコンをそのまま渡します（アイコンは周りの文字と同じ大きさで描きます）
   * @default 'caret'
   */
  separator?: ReactNode;
  /**
   * 行き先の見た目。underline は文章の中の文字のリンクと同じ淡い下線で、hover で下線だけが濃くなります。
   * hover-underline はふだん下線を引かず、hover のときだけ下線が出ます（行を静かにしたいとき）。
   * pill は、ページの上の帯（Navbar）の行き先と同じ平らな pill です（帯とそろえたいとき）
   * @default 'underline'
   */
  appearance?: BreadcrumbAppearance;
  /** いまの場所までの道。BreadcrumbItem を、上の階層から順に並べます */
  children?: ReactNode;
}

/**
 * いまいるページまでの道を並べる案内です。最後の項目はいまいるページで、リンクにしません
 */
export function Breadcrumb({
  label = '現在の場所',
  separator = 'caret',
  appearance,
  children,
  className,
  ...props
}: BreadcrumbProps) {
  const s = breadcrumb({ appearance });
  const mark = isSeparatorName(separator) ? separators[separator] : separator;
  return (
    <nav aria-label={label} data-slot="breadcrumb" className={s.root({ className })} {...props}>
      <ol className={s.list()}>
        {Children.map(children, (child, index) => (
          <BreadcrumbContext value={{ first: index === 0, separator: mark }}>
            {child}
          </BreadcrumbContext>
        ))}
      </ol>
    </nav>
  );
}

export interface BreadcrumbItemProps extends ComponentProps<'a'> {
  /**
   * いまいるページか。true のときはリンクにせず、aria-current="page" を付けた文字にします
   * @default false
   */
  current?: boolean;
  /** 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に見た目を重ねます */
  render?: ReactElement;
}

/**
 * パンくずリストの 1 項目です。Breadcrumb の中に並べます
 */
export function BreadcrumbItem({
  current = false,
  render,
  className,
  children,
  ...props
}: BreadcrumbItemProps) {
  const { first, separator } = use(BreadcrumbContext);
  const s = breadcrumb();
  // いまいるページは <a> にしないので、リンクだけの props（href・target・rel）は外す
  const { href: _href, target: _target, rel: _rel, ...rest } = props;
  const link = useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...props,
      'data-slot': 'breadcrumb-link',
      className: s.link({ className }),
      children,
    },
  });
  return (
    <li className={s.item()}>
      {/* 区切りの印。separator に何も渡していないときは、印の箱ごと置かない（あいだが二重に空かないように） */}
      {!first && separator !== null && separator !== undefined && separator !== '' && (
        <span aria-hidden="true" data-slot="breadcrumb-separator" className={s.separator()}>
          {separator}
        </span>
      )}
      {current ? (
        <span
          {...rest}
          aria-current="page"
          data-slot="breadcrumb-current"
          className={s.current({ className })}
        >
          {children}
        </span>
      ) : (
        link
      )}
    </li>
  );
}
