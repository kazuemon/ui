import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { tv } from '../../internal/tv';

// 軸も目盛りもない小さな折れ線。数字の横や表のセルに置き、増え方・減り方の形だけを見せる
// 押さないので hover も影もない。ページと同じレイヤー（原則1）
// 色は利用者が選ぶ（原則6）。指定しないときは brand（ADR-0532）。グラフの仲間なので、系列の 1 番の色にそろえる
//   brand はグラフの系列の 1 番（水色）。面用の水色（--color-brand）は白地で細い線に使えないので、系列の色を当てる（ADR-0531）
// 最後の点は既定で置く（ADR-0532）。線の右端が「いま」の値で、そばの数字と結びつく
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
      'absolute size-(--sparkline-end-point-size) -translate-1/2 rounded-full bg-current ring-(length:--border-width-thick) ring-surface',
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
  defaultVariants: { color: 'brand' },
});

/** 線の色。brand はグラフの系列の 1 番の水色、primary・secondary は利用者が選ぶ色、neutral は濃いグレー、success・danger は状態の色 */
export type SparklineColor = NonNullable<VariantProps<typeof sparkline>['color']>;
/** 見た目の型。line は線だけ、area は線の下を淡く塗る */
export type SparklineVariant = 'line' | 'area';

export interface SparklineProps extends Omit<ComponentProps<'span'>, 'color' | 'children'> {
  /** 値の並び。左から順に描きます。2 つ以上で線になり、1 つなら点だけです。NaN などの欠けた値のところでは線を切ります */
  data: readonly number[];
  /**
   * 線の色
   * @default 'brand'
   */
  color?: SparklineColor;
  /**
   * 見た目の型。line は線だけ、area は線の下を淡く塗ります
   * @default 'line'
   */
  variant?: SparklineVariant;
  /**
   * 最後の値の点を出さないようにします。点は、いまの値がどこかを示します。
   * 値が 1 つのときは、線が引けないので点を出します
   * @default false
   */
  hideEndPoint?: boolean;
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

interface Point {
  x: number;
  y: number;
}

/** 値を 100×100 の座標に置く。上が大きい値。数でない値（NaN・Infinity）は欠けた値として null にする */
function toPoints(data: readonly number[], min: number, max: number) {
  const span = max - min;
  const last = data.length - 1;
  return data.map((value, i): Point | null =>
    Number.isFinite(value)
      ? {
          x: last > 0 ? (i / last) * 100 : 50,
          // 値がみな同じときは、真ん中に横線を引く
          y: span > 0 ? 100 - ((Math.min(Math.max(value, min), max) - min) / span) * 100 : 50,
        }
      : null
  );
}

/** 欠けた値のところで線を切り、つながった区間ごとに分ける */
function toSegments(points: readonly (Point | null)[]) {
  const segments: Point[][] = [];
  let current: Point[] = [];
  for (const point of points) {
    if (point) {
      current.push(point);
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

const toPath = (segment: readonly Point[]) =>
  segment.map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');

/**
 * 軸のない小さな折れ線です。数字の横や表のセルに置き、増え方・減り方の形を見せます
 */
export function Sparkline({
  data,
  color,
  variant = 'line',
  hideEndPoint = false,
  min,
  max,
  accessibleName,
  className,
  ...props
}: SparklineProps) {
  const styles = sparkline({ color });
  // 最小・最大は引数に展開せずに数える（長い並びでも引数の上限を超えない）
  let lowest = Infinity;
  let highest = -Infinity;
  let count = 0;
  for (const value of data) {
    if (!Number.isFinite(value)) continue;
    lowest = Math.min(lowest, value);
    highest = Math.max(highest, value);
    count += 1;
  }
  const points = count > 0 ? toPoints(data, min ?? lowest, max ?? highest) : [];
  const segments = toSegments(points);
  const line = segments.map(toPath).join(' ');
  // 点は最後の値に置く。最後の値が欠けていれば置かない（[5, NaN] でも先頭に点を置かない）
  // 値が 1 つだけなら、線が引けないので hideEndPoint でもその点を出す
  const single = data.length === 1;
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
      {segments.some((segment) => segment.length > 1) ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={styles.svg()}
          aria-hidden
          focusable="false"
        >
          {variant === 'area' ? (
            <path
              d={segments
                .map(
                  (segment) => `${toPath(segment)} L${segment.at(-1)?.x} 100 L${segment[0].x} 100 Z`
                )
                .join(' ')}
              className={styles.area()}
              data-slot="sparkline-area"
            />
          ) : null}
          <path d={line} vectorEffect="non-scaling-stroke" className={styles.line()} />
        </svg>
      ) : null}
      {end && (!hideEndPoint || single) ? (
        <span
          data-slot="sparkline-end-point"
          className={styles.endPoint()}
          style={{ left: `${end.x}%`, top: `${end.y}%` }}
        />
      ) : null}
    </span>
  );
}
