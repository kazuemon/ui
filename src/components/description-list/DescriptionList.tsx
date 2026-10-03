import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import {
  breakpoints,
  byBreakpoint,
  columnsClasses,
  breakpointVars,
  type GridBreakpoint,
  type GridColumns,
} from '../../internal/breakpoints';
import { tv } from '../../internal/tv';

// 用語と説明の組（dl・dt・dd）。経歴・技術・メタ情報のような「名前と値」の並び
// 押さないので hover も影もない。ページと同じレイヤー（原則1）
// 用語は値の名前なので太字（原則4）。説明は本文の大きさ（原則11）
// 並びと区切りは、すべてトークンで切り替える（既定の値は design/tokens.css の :root）
//   --description-direction: row なら用語が左・説明が右、column なら用語の下に説明
//   --description-divider-width: 行のあいだの線。--description-frame-width: 外枠
//   --description-leader-*: 用語の右から説明までをつなぐ薄い線（divider="leader-dotted"・"leader-solid"）
//   props は既定と違うときだけ、根の要素でトークンを上書きする（中の要素へは継承で届く）
//   columns: 組を Grid と同じ段ごとの列に並べる（src/internal/breakpoints.ts）。列のあいだは Grid の既定と同じ間隔
//     行のあいだの線は、1 列のときは 2 つ目からの組の上に引く。列に並べると、2 行目からの組の上に線を引き、
//     線の太さだけ上へずらす（前の行の下の余白に重ねて、行の高さを線の有無で変えない）。1 行目の組は、渡した段ごとの
//     列の数だけ前から選んで線を外す（firstRowClasses）。根を切り取らないので、値に置いたリンクのフォーカスの線が切れない。

const leaderRoot = [
  '[--description-column-gap:var(--description-leader-gap)]',
  '[--description-term-display:flex] [--description-term-grow:1] [--description-term-width:auto]',
  '[--description-details-flex:0_1_auto] [--description-leader-display:block]',
];

const descriptionList = tv({
  slots: {
    root: [
      'flex min-w-0 flex-col gap-(--description-item-gap) rounded-control',
      '[border-width:var(--description-frame-width)] [border-color:var(--color-line)]',
      // 列に並べるときだけ使う値。入れ子の DescriptionList が外の値を受け継がないよう、自分の要素で決め直す
      '[--description-divider-shift:0px] [--description-first-divider-width:0px] [--description-first-row:0]',
    ],
    item: [
      'flex min-w-0 gap-x-(--description-column-gap) gap-y-(--spacing)',
      '[flex-direction:var(--description-direction)] [align-items:var(--description-item-align)]',
      'px-(--description-pad-x) py-(--description-pad-y)',
      // --description-first-row は、列に並べたときの 1 行目の組だけ 1（firstRowClasses）
      '[border-top-width:calc(var(--description-divider-width)*(1-var(--description-first-row)))]',
      '[border-top-color:var(--color-line)]',
      'first:[border-top-width:var(--description-first-divider-width)]',
      'mt-[calc(var(--description-divider-shift)*(var(--description-first-row)-1))]',
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
      'after:[border-bottom-color:var(--color-line)]',
    ],
    details: 'min-w-0 [flex:var(--description-details-flex)] text-body text-fg',
  },
  variants: {
    columns: {
      false: {},
      true: {
        root: [
          'grid [grid-template-columns:repeat(var(--columns),minmax(0,1fr))] gap-x-(--stack-gap-md)',
          ...columnsClasses,
          '[--description-divider-shift:var(--description-divider-width)]',
        ],
      },
    },
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
    columns: false,
    layout: 'horizontal',
    divider: 'none',
    termAlign: 'start',
    termStyle: 'default',
  },
});

// 列に並べたときの 1 行目の組（前から列の数だけ）を、渡した段ごとに選ぶクラス。n 列のクラスは配列の n - 1 番目。
// 段の中で 1 行目を 1、それより後ろを 0 にし直すので、狭い段より列が少ない段でも、狭い段の選び方が残らない。
// Tailwind がクラスを見つけられるよう、列の数ごとに書き出す（13 列からは 12 列として扱う）
const FIRST_ROW_MAX = 12;
const firstRowClasses: Record<GridBreakpoint, readonly string[]> = {
  base: [
    '[&>:nth-child(-n+1)]:[--description-first-row:1] [&>:nth-child(n+2)]:[--description-first-row:0]',
    '[&>:nth-child(-n+2)]:[--description-first-row:1] [&>:nth-child(n+3)]:[--description-first-row:0]',
    '[&>:nth-child(-n+3)]:[--description-first-row:1] [&>:nth-child(n+4)]:[--description-first-row:0]',
    '[&>:nth-child(-n+4)]:[--description-first-row:1] [&>:nth-child(n+5)]:[--description-first-row:0]',
    '[&>:nth-child(-n+5)]:[--description-first-row:1] [&>:nth-child(n+6)]:[--description-first-row:0]',
    '[&>:nth-child(-n+6)]:[--description-first-row:1] [&>:nth-child(n+7)]:[--description-first-row:0]',
    '[&>:nth-child(-n+7)]:[--description-first-row:1] [&>:nth-child(n+8)]:[--description-first-row:0]',
    '[&>:nth-child(-n+8)]:[--description-first-row:1] [&>:nth-child(n+9)]:[--description-first-row:0]',
    '[&>:nth-child(-n+9)]:[--description-first-row:1] [&>:nth-child(n+10)]:[--description-first-row:0]',
    '[&>:nth-child(-n+10)]:[--description-first-row:1] [&>:nth-child(n+11)]:[--description-first-row:0]',
    '[&>:nth-child(-n+11)]:[--description-first-row:1] [&>:nth-child(n+12)]:[--description-first-row:0]',
    '[&>:nth-child(-n+12)]:[--description-first-row:1] [&>:nth-child(n+13)]:[--description-first-row:0]',
  ],
  sm: [
    'sm:[&>:nth-child(-n+1)]:[--description-first-row:1] sm:[&>:nth-child(n+2)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+2)]:[--description-first-row:1] sm:[&>:nth-child(n+3)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+3)]:[--description-first-row:1] sm:[&>:nth-child(n+4)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+4)]:[--description-first-row:1] sm:[&>:nth-child(n+5)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+5)]:[--description-first-row:1] sm:[&>:nth-child(n+6)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+6)]:[--description-first-row:1] sm:[&>:nth-child(n+7)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+7)]:[--description-first-row:1] sm:[&>:nth-child(n+8)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+8)]:[--description-first-row:1] sm:[&>:nth-child(n+9)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+9)]:[--description-first-row:1] sm:[&>:nth-child(n+10)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+10)]:[--description-first-row:1] sm:[&>:nth-child(n+11)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+11)]:[--description-first-row:1] sm:[&>:nth-child(n+12)]:[--description-first-row:0]',
    'sm:[&>:nth-child(-n+12)]:[--description-first-row:1] sm:[&>:nth-child(n+13)]:[--description-first-row:0]',
  ],
  md: [
    'md:[&>:nth-child(-n+1)]:[--description-first-row:1] md:[&>:nth-child(n+2)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+2)]:[--description-first-row:1] md:[&>:nth-child(n+3)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+3)]:[--description-first-row:1] md:[&>:nth-child(n+4)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+4)]:[--description-first-row:1] md:[&>:nth-child(n+5)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+5)]:[--description-first-row:1] md:[&>:nth-child(n+6)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+6)]:[--description-first-row:1] md:[&>:nth-child(n+7)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+7)]:[--description-first-row:1] md:[&>:nth-child(n+8)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+8)]:[--description-first-row:1] md:[&>:nth-child(n+9)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+9)]:[--description-first-row:1] md:[&>:nth-child(n+10)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+10)]:[--description-first-row:1] md:[&>:nth-child(n+11)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+11)]:[--description-first-row:1] md:[&>:nth-child(n+12)]:[--description-first-row:0]',
    'md:[&>:nth-child(-n+12)]:[--description-first-row:1] md:[&>:nth-child(n+13)]:[--description-first-row:0]',
  ],
  lg: [
    'lg:[&>:nth-child(-n+1)]:[--description-first-row:1] lg:[&>:nth-child(n+2)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+2)]:[--description-first-row:1] lg:[&>:nth-child(n+3)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+3)]:[--description-first-row:1] lg:[&>:nth-child(n+4)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+4)]:[--description-first-row:1] lg:[&>:nth-child(n+5)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+5)]:[--description-first-row:1] lg:[&>:nth-child(n+6)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+6)]:[--description-first-row:1] lg:[&>:nth-child(n+7)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+7)]:[--description-first-row:1] lg:[&>:nth-child(n+8)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+8)]:[--description-first-row:1] lg:[&>:nth-child(n+9)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+9)]:[--description-first-row:1] lg:[&>:nth-child(n+10)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+10)]:[--description-first-row:1] lg:[&>:nth-child(n+11)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+11)]:[--description-first-row:1] lg:[&>:nth-child(n+12)]:[--description-first-row:0]',
    'lg:[&>:nth-child(-n+12)]:[--description-first-row:1] lg:[&>:nth-child(n+13)]:[--description-first-row:0]',
  ],
  xl: [
    'xl:[&>:nth-child(-n+1)]:[--description-first-row:1] xl:[&>:nth-child(n+2)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+2)]:[--description-first-row:1] xl:[&>:nth-child(n+3)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+3)]:[--description-first-row:1] xl:[&>:nth-child(n+4)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+4)]:[--description-first-row:1] xl:[&>:nth-child(n+5)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+5)]:[--description-first-row:1] xl:[&>:nth-child(n+6)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+6)]:[--description-first-row:1] xl:[&>:nth-child(n+7)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+7)]:[--description-first-row:1] xl:[&>:nth-child(n+8)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+8)]:[--description-first-row:1] xl:[&>:nth-child(n+9)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+9)]:[--description-first-row:1] xl:[&>:nth-child(n+10)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+10)]:[--description-first-row:1] xl:[&>:nth-child(n+11)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+11)]:[--description-first-row:1] xl:[&>:nth-child(n+12)]:[--description-first-row:0]',
    'xl:[&>:nth-child(-n+12)]:[--description-first-row:1] xl:[&>:nth-child(n+13)]:[--description-first-row:0]',
  ],
};

// 列の数は 1〜FIRST_ROW_MAX に丸める（1 行目を選ぶクラスと、並べる列の数をそろえる）
function clampColumns(columns: GridColumns | undefined): GridColumns | undefined {
  if (columns == null) return undefined;
  const clamp = (n: number) => Math.min(Math.max(Math.trunc(n), 1), FIRST_ROW_MAX);
  if (typeof columns === 'number') return clamp(columns);
  return Object.fromEntries(
    Object.entries(columns).map(([bp, n]) => [bp, n == null ? n : clamp(n)])
  ) as GridColumns;
}

function firstRow(columns: GridColumns | undefined) {
  if (columns == null) return undefined;
  const byBp = byBreakpoint(columns);
  // base を渡していないときは、いちばん狭い画面では 1 列
  const counts = { ...byBp, base: byBp.base ?? 1 };
  return breakpoints.flatMap((bp) => {
    const n = counts[bp];
    if (n == null) return [];
    return [firstRowClasses[bp][Math.min(Math.max(Math.trunc(n), 1), FIRST_ROW_MAX) - 1]];
  });
}

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
  /**
   * 組を並べる列の数。渡さないときは 1 列です。数を渡すとどの画面の幅でも同じ（`columns={2}`）、
   * 画面の幅の段ごとの数を渡すと画面の幅で変わります（`columns={{ base: 1, md: 2 }}`）。段は Grid の columns と同じです。列は 12 までで、それより多い数は 12 列として扱います
   */
  columns?: GridColumns;
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
  columns: columnsProp,
  className,
  style,
  ...props
}: DescriptionListProps) {
  const columns = clampColumns(columnsProp);
  const styles = descriptionList({
    layout,
    divider,
    termAlign,
    termStyle,
    columns: columns != null,
  });
  const tokens: TokenStyle = {
    ...(termWidth && { '--description-term-width': termWidth }),
    ...breakpointVars('columns', columns),
  };
  return (
    <dl
      data-slot="description-list"
      className={styles.root({ className: [firstRow(columns), className] })}
      style={Object.keys(tokens).length > 0 ? { ...tokens, ...style } : style}
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
