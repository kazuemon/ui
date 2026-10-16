import type { ReactNode, SVGProps } from 'react';

import { tv } from '../../internal/tv';

// グラフの SVG の中に置く小さな印。ライブラリの「点を描く関数」「ラベルを描く関数」から返す
//   Recharts なら <Line activeDot={(p) => <ChartDot cx={p.cx} cy={p.cy} color={p.stroke} />} />
// ライブラリが座標を計算し、この部品は見た目だけを持つ

// hover した値に置く点。周りを面の色で縁取り、重なった線から浮かせる
// 半径は CSS の r で持つ（--chart-dot-radius）
const chartDot = tv({
  base: 'fill-(--chart-dot-color) stroke-surface [stroke-width:var(--border-width-thick)] [r:var(--chart-dot-radius)]',
});

export interface ChartDotProps extends Omit<SVGProps<SVGCircleElement>, 'color' | 'r'> {
  /** 中心の横の位置（SVG の座標） */
  cx?: number;
  /** 中心の縦の位置（SVG の座標） */
  cy?: number;
  /** 点の色（CSS の色）。線に渡した色と同じものを渡します */
  color?: string;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * hover した値に置く点です。グラフの SVG の中に置きます
 */
export function ChartDot({ cx, cy, color, className, style, ...props }: ChartDotProps) {
  if (cx == null || cy == null) return null;
  return (
    <circle
      data-slot="chart-dot"
      cx={cx}
      cy={cy}
      className={chartDot({ className })}
      style={{ ...style, ['--chart-dot-color' as string]: color }}
      {...props}
    />
  );
}

// 線の右端に書く系列の名前。凡例と同じことを、線のそばで伝える（4 系列までは名前を直接書く）
// 文字はキャプションの大きさ。色は、線の色（color）を --chart-label-tint だけ --chart-label-base に混ぜる（軸 666 の比較用）
const chartLineLabel = tv({
  base: [
    'translate-x-(--chart-label-gap) text-(length:--text-caption) font-medium',
    '[fill:color-mix(in_oklab,var(--chart-line-color,var(--chart-label-base))_var(--chart-label-tint),var(--chart-label-base))]',
  ],
});

export interface ChartLineLabelProps extends Omit<SVGProps<SVGTextElement>, 'x' | 'y'> {
  /** 線の端の横の位置（SVG の座標）。文字はここから --chart-label-gap だけ右に置きます */
  x?: number | string;
  /** 線の端の縦の位置（SVG の座標）。文字の縦の真ん中をそろえます */
  y?: number | string;
  /** 系列の名前 */
  children: ReactNode;
  /** 線の色（CSS の色）。線に渡した色と同じものを渡します */
  color?: string;
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
      className={chartLineLabel({ className })}
      style={{ ...style, ['--chart-line-color' as string]: color }}
      {...props}
    >
      {children}
    </text>
  );
}
