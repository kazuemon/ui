import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { tv } from '../../internal/tv';

// 軸も目盛りもない小さな折れ線。数字の横や表のセルに置き、増え方・減り方の形だけを見せる
// 押さないので hover も影もない。ページと同じレイヤー（原則1）
// 色は利用者が選ぶ（原則6）。指定しないときは濃いグレー（Meter と同じ）
//   brand はグラフの系列の 1 番（水色）。面用の水色（--color-brand）は白地で細い線に使えないので、系列の色を当てる（ADR-0531）
// 線はグラフの線と同じ 2px（--border-width-thick）
// 線は 100×100 の座標で描き、SVG を箱いっぱいに伸ばす。線の太さは伸ばしても変えない（vector-effect）
//   最後の点は伸ばすと楕円になるので、SVG ではなく箱の上に重ねた丸で描く
// 読み上げ: accessibleName を渡すと 1 枚の絵（role="img"）として読む。渡さないときは飾りとして読まない
//   値は読み上げないので、数字そのものはそばの文字（Stat など）で伝える（原則6: 色や形だけで伝えない）
const sparkline = tv({
  slots: {
    root: [
      'relative inline-block h-(--sparkline-height) w-(--sparkline-width) shrink-0 align-(--sparkline-vertical-align)',
      'text-(color:--sparkline-color)',
    ],
    svg: 'absolute inset-0 size-full overflow-visible',
    line: 'fill-none stroke-current [stroke-width:var(--border-width-thick)] [stroke-linecap:round] [stroke-linejoin:round]',
    area: 'fill-current stroke-none opacity-(--sparkline-area-opacity)',
    endPoint:
      'absolute size-(--sparkline-end-point-size) -translate-1/2 rounded-full bg-current ring-2 ring-surface',
  },
  variants: {
    color: {
      brand: { root: '[--sparkline-color:var(--color-series-1)]' },
      primary: { root: '[--sparkline-color:var(--color-primary)]' },
      secondary: { root: '[--sparkline-color:var(--color-secondary)]' },
      neutral: { root: '[--sparkline-color:var(--color-neutral-strong)]' },
      success: { root: '[--sparkline-color:var(--color-success)]' },
      danger: { root: '[--sparkline-color:var(--color-danger)]' },
    },
  },
  defaultVariants: { color: 'neutral' },
});

/** 線の色。brand は水色、primary・secondary は利用者が選ぶ色、neutral は濃いグレー、success・danger は状態の色 */
export type SparklineColor = NonNullable<VariantProps<typeof sparkline>['color']>;
/** 見た目の型。line は線だけ、area は線の下を淡く塗る */
export type SparklineVariant = 'line' | 'area';

export interface SparklineProps extends Omit<ComponentProps<'span'>, 'color' | 'children'> {
  /** 値の並び。左から順に描きます。2 つ以上で線になり、1 つなら点だけです */
  data: readonly number[];
  /**
   * 線の色
   * @default 'neutral'
   */
  color?: SparklineColor;
  /**
   * 見た目の型。line は線だけ、area は線の下を淡く塗ります
   * @default 'line'
   */
  variant?: SparklineVariant;
  /**
   * 最後の値に点を置きます。いまの値がどこかを示します
   * @default false
   */
  showEndPoint?: boolean;
  /** 縦の下端の値。渡さないときは data の最小値です。0 から描きたいときは 0 を渡します */
  min?: number;
  /** 縦の上端の値。渡さないときは data の最大値です */
  max?: number;
  /**
   * 読み上げの名前（「直近 12 週の閲覧数の推移」など）。渡すと 1 枚の絵として読まれ、渡さないと飾りとして読まれません
   */
  accessibleName?: string;
  /** いちばん外の要素に付きます。大きさ（w-*・h-*）もここで変えます */
  className?: string;
}

/** 値を 100×100 の座標に置く。上が大きい値 */
function toPoints(data: readonly number[], min: number, max: number) {
  const span = max - min;
  const last = data.length - 1;
  return data.map((value, i) => ({
    x: last > 0 ? (i / last) * 100 : 50,
    // 値がみな同じときは、真ん中に横線を引く
    y: span > 0 ? 100 - ((Math.min(Math.max(value, min), max) - min) / span) * 100 : 50,
  }));
}

/**
 * 軸のない小さな折れ線です。数字の横や表のセルに置き、増え方・減り方の形を見せます
 */
export function Sparkline({
  data,
  color,
  variant = 'line',
  showEndPoint = false,
  min,
  max,
  accessibleName,
  className,
  ...props
}: SparklineProps) {
  const styles = sparkline({ color });
  const values = data.filter(Number.isFinite);
  const lower = min ?? Math.min(...values);
  const upper = max ?? Math.max(...values);
  const points = values.length > 0 ? toPoints(values, lower, upper) : [];
  const line = points.map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const end = points.at(-1);
  const a11y = accessibleName
    ? ({ role: 'img', 'aria-label': accessibleName } as const)
    : ({ 'aria-hidden': true } as const);
  return (
    <span
      data-slot="sparkline"
      data-variant={variant}
      className={styles.root({ className })}
      {...a11y}
      {...props}
    >
      {points.length > 1 ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={styles.svg()}
          aria-hidden
          focusable="false"
        >
          {variant === 'area' ? (
            <path
              d={`${line} L100 100 L0 100 Z`}
              className={styles.area()}
              data-slot="sparkline-area"
            />
          ) : null}
          <path d={line} vectorEffect="non-scaling-stroke" className={styles.line()} />
        </svg>
      ) : null}
      {end && (showEndPoint || points.length === 1) ? (
        <span
          data-slot="sparkline-end-point"
          className={styles.endPoint()}
          style={{ left: `${end.x}%`, top: `${end.y}%` }}
        />
      ) : null}
    </span>
  );
}
