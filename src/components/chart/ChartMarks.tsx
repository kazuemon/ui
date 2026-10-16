import type { ReactNode, SVGProps } from 'react';

import type { VariantProps } from 'tailwind-variants';

import { tv } from '../../internal/tv';

// グラフの SVG の中に置く小さな印。ライブラリの「点を描く関数」「ラベルを描く関数」から返す
//   Recharts なら <Line activeDot={(p) => <ChartDot cx={p.cx} cy={p.cy} color={p.stroke} />} />
// ライブラリが座標を計算し、この部品は見た目だけを持つ

// 値に置く点。周りを面の色で縁取り、重なった線から浮かせる
// 半径は CSS の r で持つ。md は hover した値（--chart-dot-radius）、sm は線の上にいつも置く点（--chart-dot-sm-radius）
const chartDot = tv({
  base: 'fill-(--chart-dot-color) stroke-surface [stroke-width:var(--border-width-thick)]',
  variants: {
    size: {
      md: '[r:var(--chart-dot-radius)]',
      sm: '[r:var(--chart-dot-sm-radius)]',
    },
  },
  defaultVariants: { size: 'md' },
});

/** 点の大きさ。md は hover した値、sm は線の上にいつも置く点 */
export type ChartDotSize = 'sm' | 'md';

export interface ChartDotProps extends Omit<SVGProps<SVGCircleElement>, 'color' | 'r'> {
  /** 中心の横の位置（SVG の座標） */
  cx?: number;
  /** 中心の縦の位置（SVG の座標） */
  cy?: number;
  /** 点の色（CSS の色）。線に渡した色と同じものを渡します */
  color?: string;
  /**
   * 大きさ。md は hover した値に置く点、sm は線の上にいつも置く点です
   * @default 'md'
   */
  size?: ChartDotSize;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * 値に置く点です。グラフの SVG の中に置きます
 */
export function ChartDot({
  cx,
  cy,
  color,
  size = 'md',
  className,
  style,
  ...props
}: ChartDotProps) {
  if (cx == null || cy == null) return null;
  return (
    <circle
      data-slot="chart-dot"
      cx={cx}
      cy={cy}
      className={chartDot({ size, className })}
      style={{ ...style, ['--chart-dot-color' as string]: color }}
      {...props}
    />
  );
}

// 線の右端に書く系列の名前。凡例と同じことを、線のそばで伝える（4 系列までは名前を直接書く）
// 文字はキャプションの大きさ。色は variant で選ぶ（ADR-0538）
//   tinted: 線の色に本文の濃紺を混ぜて濃くした色。既定。色相で線と結びつき、系列の 8 色どれでも小さな文字の 4.5:1 を満たす
//   series: 線と同じ色。結びつきはいちばん強いが、白地で 3:1 ほどなので、文字としては薄い
//   body・muted: 本文の色・淡い本文の色。線とは位置だけで結びつける
const chartLineLabel = tv({
  base: 'translate-x-(--chart-label-gap) text-(length:--text-caption) font-medium',
  variants: {
    variant: {
      tinted:
        '[fill:color-mix(in_oklab,var(--chart-line-color,var(--color-fg))_var(--chart-label-tint),var(--color-fg))]',
      series: '[fill:var(--chart-line-color,var(--color-fg-muted))]',
      body: 'fill-fg',
      muted: 'fill-fg-muted',
    },
  },
  defaultVariants: { variant: 'tinted' },
});

/** 線の端の名前の色。tinted は線の色を濃くした色、series は線と同じ色、body は本文の色、muted は淡い本文の色 */
export type ChartLineLabelVariant = NonNullable<VariantProps<typeof chartLineLabel>['variant']>;

export interface ChartLineLabelProps extends Omit<SVGProps<SVGTextElement>, 'x' | 'y'> {
  /** 線の端の横の位置（SVG の座標）。文字はここから --chart-label-gap だけ右に置きます */
  x?: number | string;
  /** 線の端の縦の位置（SVG の座標）。文字の縦の真ん中をそろえます */
  y?: number | string;
  /** 系列の名前 */
  children: ReactNode;
  /** 線の色（CSS の色）。線に渡した色と同じものを渡します */
  color?: string;
  /**
   * 文字の色。tinted は線の色を濃くした色、series は線と同じ色（文字としては薄い）、body は本文の色、muted は淡い本文の色
   * @default 'tinted'
   */
  variant?: ChartLineLabelVariant;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * 線の右端に書く系列の名前です。グラフの SVG の中に置きます。右に名前の入る余白を空けておきます
 */
export function ChartLineLabel({
  x,
  y,
  children,
  color,
  variant = 'tinted',
  className,
  style,
  ...props
}: ChartLineLabelProps) {
  if (x == null || y == null) return null;
  return (
    <text
      data-slot="chart-line-label"
      x={x}
      y={y}
      dominantBaseline="central"
      data-variant={variant}
      className={chartLineLabel({ variant, className })}
      style={{ ...style, ['--chart-line-color' as string]: color }}
      {...props}
    >
      {children}
    </text>
  );
}

// 軸の名前（「閲覧数」「週」）。ライブラリの軸のラベルを描く関数から返す
// 文字は目盛りと同じキャプションの大きさで、目盛りより一段濃い淡い本文の色
// orientation="vertical" で、縦の軸の左に 90 度回して置く（文字の縦の真ん中を x・y にそろえる）
const chartAxisLabel = tv({
  base: 'fill-fg-muted text-(length:--text-caption)',
});

export interface ChartAxisLabelProps extends Omit<
  SVGProps<SVGTextElement>,
  'x' | 'y' | 'textAnchor'
> {
  /** 文字を置く横の位置（SVG の座標） */
  x?: number | string;
  /** 文字を置く縦の位置（SVG の座標）。文字の縦の真ん中をそろえます */
  y?: number | string;
  /**
   * 横の寄せ。start は x から右へ、end は x で終わり、middle は x を真ん中にします
   * @default 'start'
   */
  textAnchor?: 'start' | 'middle' | 'end';
  /**
   * 文字の向き。vertical は左に 90 度回します（縦の軸の左に置くとき）
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /** 軸の名前 */
  children: ReactNode;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * 軸の名前です。グラフの SVG の中に置きます
 */
export function ChartAxisLabel({
  x,
  y,
  textAnchor = 'start',
  orientation = 'horizontal',
  children,
  className,
  ...props
}: ChartAxisLabelProps) {
  if (x == null || y == null) return null;
  return (
    <text
      data-slot="chart-axis-label"
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      transform={orientation === 'vertical' ? `rotate(-90 ${x} ${y})` : undefined}
      className={chartAxisLabel({ className })}
      {...props}
    >
      {children}
    </text>
  );
}

// 基準の線（目標・平均）に添える名前。線そのものはライブラリが --color-chart-reference で引く
//   plain: 線の上に、淡い本文の色の文字を右寄せで置く
//   halo: 線に重ねて置き、文字の周りを面の色で縁取って線を切る
const chartReferenceLabel = tv({
  base: 'text-(length:--text-caption) font-medium',
  variants: {
    variant: {
      plain: 'fill-fg-muted',
      halo: 'fill-fg-muted stroke-surface [stroke-width:var(--chart-reference-halo)] [paint-order:stroke] [stroke-linejoin:round]',
    },
  },
  defaultVariants: { variant: 'plain' },
});

/** 基準の線の名前の置き方。plain は線の上に、halo は線に重ねて縁取る */
export type ChartReferenceLabelVariant = 'plain' | 'halo';

export interface ChartReferenceLabelProps extends Omit<SVGProps<SVGTextElement>, 'x' | 'y'> {
  /** 基準の線の右端の横の位置（SVG の座標）。文字はここで終わります */
  x?: number | string;
  /** 基準の線の縦の位置（SVG の座標） */
  y?: number | string;
  /**
   * 置き方。plain は線の上に、halo は線に重ねて文字の周りを縁取ります
   * @default 'plain'
   */
  variant?: ChartReferenceLabelVariant;
  /** 基準の名前（「目標 2,000」など） */
  children: ReactNode;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * 基準の線（目標・平均）に添える名前です。グラフの SVG の中に置きます
 */
export function ChartReferenceLabel({
  x,
  y,
  variant = 'plain',
  children,
  className,
  ...props
}: ChartReferenceLabelProps) {
  if (x == null || y == null) return null;
  return (
    <text
      data-slot="chart-reference-label"
      data-variant={variant}
      x={x}
      y={y}
      dy={variant === 'plain' ? -6 : 0}
      textAnchor="end"
      dominantBaseline={variant === 'plain' ? 'auto' : 'central'}
      className={chartReferenceLabel({ variant, className })}
      {...props}
    >
      {children}
    </text>
  );
}
