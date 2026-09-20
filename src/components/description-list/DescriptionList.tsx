import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { tv } from '../../internal/tv';

// 用語と説明の組（dl・dt・dd）。経歴・技術・メタ情報のような「名前と値」の並び
// 押さないので hover も影もない。ページと同じレイヤー（原則1）
// 用語は値の名前なので太字（原則4）。説明は本文の大きさ（原則11）
// 並びと区切りは、すべてトークンで切り替える（既定の値は design/tokens.css の :root）
//   --description-direction: row なら用語が左・説明が右、column なら用語の下に説明
//   --description-divider-width: 行のあいだの線。--description-frame-width: 外枠
//   --description-leader-*: 用語の右から説明までをつなぐ薄い線（divider="leader-dotted"・"leader-solid"）
//   props は既定と違うときだけ、根の要素でトークンを上書きする（中の要素へは継承で届く）

const leaderRoot = [
  '[--description-column-gap:var(--description-leader-gap)]',
  '[--description-term-display:flex] [--description-term-grow:1] [--description-term-width:auto]',
  '[--description-details-flex:0_1_auto] [--description-leader-display:block]',
];

const descriptionList = tv({
  slots: {
    root: [
      'flex min-w-0 flex-col gap-(--description-item-gap) rounded-control',
      '[border-width:var(--description-frame-width)] [border-color:var(--color-description-line)]',
    ],
    item: [
      'flex min-w-0 gap-x-(--description-column-gap) gap-y-(--description-row-gap)',
      '[flex-direction:var(--description-direction)] [align-items:var(--description-item-align)]',
      'px-(--description-pad-x) py-(--description-pad-y)',
      '[border-top-width:var(--description-divider-width)] [border-top-color:var(--color-description-line)]',
      'first:[border-top-width:0px]',
    ],
    term: [
      '[display:var(--description-term-display)] w-(--description-term-width) shrink-0',
      '[flex-grow:var(--description-term-grow)] items-center',
      'gap-(--description-leader-gap)',
      'text-(length:--description-term-text) leading-(--description-term-leading)',
      '[text-align:var(--description-term-align)] font-bold text-fg',
      // 用語の右から説明までをつなぐ薄い線（divider="leader-dotted"・"leader-solid"）。行の上下中央に引く。装飾なので読み上げには出さない
      "after:[display:var(--description-leader-display)] after:grow after:content-['']",
      'after:[border-bottom-width:var(--description-leader-width)]',
      'after:[border-bottom-style:var(--description-leader-style)]',
      'after:[border-bottom-color:var(--color-description-leader)]',
    ],
    details: 'min-w-0 [flex:var(--description-details-flex)] text-body text-fg',
  },
  variants: {
    layout: {
      horizontal: {},
      stacked: {
        root: [
          '[--description-direction:column] [--description-item-align:stretch]',
          '[--description-term-align:start] [--description-term-width:auto]',
        ],
      },
    },
    termAlign: {
      start: {},
      end: { root: '[--description-term-align:end]' },
    },
    termStyle: {
      default: {},
      // Field のラベルと同じ見た目（14px・太字・本文の色）。density では変わらない
      label: {
        root: '[--description-term-leading:var(--leading-label)] [--description-term-text:var(--text-label)]',
      },
    },
    divider: {
      none: {},
      line: {
        root: [
          '[--description-divider-width:var(--border-width-thin)] [--description-item-gap:0px]',
          '[--description-pad-y:calc(var(--spacing)*3)]',
        ],
      },
      framed: {
        root: [
          '[--description-divider-width:var(--border-width-thin)] [--description-frame-width:var(--border-width-thin)]',
          '[--description-item-gap:0px] [--description-pad-x:calc(var(--spacing)*4)] [--description-pad-y:calc(var(--spacing)*3)]',
        ],
      },
      // 用語の右から説明の左までを、薄い線でつなぐ（目次の点線）。線は行の上下中央。用語の列の幅は使わず、
      // 用語は中身の幅、線が残りを埋め、説明は右に付く。線は装飾なので読み上げには出さない（::after）
      'leader-dotted': {
        root: leaderRoot,
      },
      'leader-solid': {
        root: [...leaderRoot, '[--description-leader-style:solid]'],
      },
    },
  },
  compoundVariants: [
    // 縦に並べたときは、用語と説明が上下なので線でつなげない
    {
      layout: 'stacked',
      divider: ['leader-dotted', 'leader-solid'],
      class: {
        root: [
          '[--description-leader-display:none] [--description-term-display:block]',
          '[--description-details-flex:1_1_0%] [--description-term-grow:0]',
        ],
      },
    },
  ],
  defaultVariants: {
    layout: 'horizontal',
    divider: 'none',
    termAlign: 'start',
    termStyle: 'default',
  },
});

type TokenStyle = CSSProperties & Record<`--${string}`, string>;

/** 用語と説明の並び */
export type DescriptionListLayout = NonNullable<VariantProps<typeof descriptionList>['layout']>;
/** 組と組の区切りの見せ方 */
export type DescriptionListDivider = NonNullable<VariantProps<typeof descriptionList>['divider']>;
/** 用語の列の中での寄せ方 */
export type DescriptionListTermAlign = NonNullable<
  VariantProps<typeof descriptionList>['termAlign']
>;
/** 用語の文字の見せ方 */
export type DescriptionListTermStyle = NonNullable<
  VariantProps<typeof descriptionList>['termStyle']
>;

export interface DescriptionListProps extends ComponentProps<'dl'> {
  /**
   * 用語と説明の並び。horizontal は用語を左の列に、説明をその右に置きます。stacked は用語の下に説明を置きます
   * @default 'horizontal'
   */
  layout?: DescriptionListLayout;
  /**
   * 組と組の区切り。none は余白だけ、line は行のあいだの細い線、framed は外枠と行のあいだの線、
   * leader-dotted・leader-solid は、用語の右から説明の左までを行の上下中央で点線・細い実線でつなぐ形です。
   * leader-* は横に並べたときだけ効きます（stacked では線を引きません）
   * @default 'none'
   */
  divider?: DescriptionListDivider;
  /**
   * 用語の列の中での寄せ方。end にすると用語を右へ寄せ、説明の左端との距離をそろえます。
   * horizontal で leader-* 以外のときだけ効きます
   * @default 'start'
   */
  termAlign?: DescriptionListTermAlign;
  /**
   * 用語の文字。default は本文と同じ大きさ、label は入力欄のラベルと同じ見た目（14px・太字）です。
   * 用語より説明を読ませたいときは label にします
   * @default 'default'
   */
  termStyle?: DescriptionListTermStyle;
  /**
   * 用語の列の幅（`'8rem'`・`'160px'` など）。horizontal で leader-* 以外のときだけ効きます。書かないときは 128px です
   */
  termWidth?: string;
}

/**
 * 用語と説明の組。経歴・技術・メタ情報のような「名前と値」を並べます
 */
export function DescriptionList({
  layout,
  divider,
  termAlign,
  termStyle,
  termWidth,
  className,
  style,
  ...props
}: DescriptionListProps) {
  const styles = descriptionList({ layout, divider, termAlign, termStyle });
  const termStyleToken: TokenStyle = { '--description-term-width': termWidth ?? '' };
  return (
    <dl
      data-slot="description-list"
      className={styles.root({ className })}
      style={termWidth ? { ...termStyleToken, ...style } : style}
      {...props}
    />
  );
}

export interface DescriptionItemProps extends ComponentProps<'div'> {
  /** 用語（dt）。値の名前です */
  term: ReactNode;
  /** 説明（dd）。値そのものです */
  children?: ReactNode;
}

/**
 * 用語と説明の 1 組。`term` が dt、`children` が dd になります
 */
export function DescriptionItem({ term, className, children, ...props }: DescriptionItemProps) {
  const styles = descriptionList();
  return (
    <div data-slot="description-item" className={styles.item({ className })} {...props}>
      <dt className={styles.term()}>{term}</dt>
      <dd className={styles.details()}>{children}</dd>
    </div>
  );
}
