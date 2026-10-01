'use client';

import { type ComponentProps, type ReactNode, useId } from 'react';

import {
  type BarColor,
  type BarSize,
  barDescribedBy,
  barStyles,
} from '../../internal/bar/bar-styles';
import { tv } from '../../internal/tv';

// 1 本のバーを、内訳ごとに分けて塗る（ストレージの内訳、予算の使い道など）。Meter と同じバーの形・太さ・3 層の並び
// 区切りは地の上に左から順に並べ、残りは地のまま。区切りの間は --bar-group-gap で地の色を見せ、区切りに角は付けない（両端は地の pill で切り抜く）。凡例の印は丸（軸 433）
// 色だけで伝えない（原則6）: バーの下に凡例（色の印・名前・値の文字）をいつも出す。バーそのものは読み上げに出さず、凡例を読む
// 区切りの色は、書かないときは primary・secondary・neutral の順（原則にない判断。4 つ目からは color を書く）
const meterGroup = tv({
  extend: barStyles,
  slots: {
    track: 'flex gap-(--bar-group-gap)',
    segment: [
      'h-full min-w-0 shrink grow-0 bg-(color:--bar-segment)',
      'transition-[flex-basis] duration-(--duration-bar) ease-press motion-reduce:transition-none',
    ],
    legend: [
      'col-span-full flex flex-wrap gap-x-4 gap-y-1',
      'text-(length:--text-label) leading-(--leading-label)',
    ],
    legendItem: 'inline-flex min-w-0 items-center gap-1.5',
    marker: 'size-(--bar-group-marker-size) shrink-0 rounded-pill bg-(color:--bar-segment)',
    legendLabel: 'text-fg',
    legendValue: 'text-fg-muted tabular-nums',
  },
});

const segmentColor: Record<BarColor, string> = {
  primary: '[--bar-segment:var(--color-primary)]',
  secondary: '[--bar-segment:var(--color-secondary)]',
  neutral: '[--bar-segment:var(--color-neutral-strong)]',
  success: '[--bar-segment:var(--color-success)]',
  danger: '[--bar-segment:var(--color-danger)]',
};

const defaultColors: BarColor[] = ['primary', 'secondary', 'neutral'];

/** 分けて塗るバーの、内訳の 1 つ */
export interface MeterGroupItem {
  /** 内訳の名前。凡例に出ます */
  label: ReactNode;
  /** 内訳の量。0〜max の中で渡します */
  value: number;
  /**
   * 区切りの色。書かないときは、並びの順に primary・secondary・neutral です
   */
  color?: BarColor;
  /** 凡例に出す値の文字（「12 GB」など）。書かないときは、format で整えた値（format もなければ割合） */
  valueText?: string;
}

export interface MeterGroupProps extends Omit<ComponentProps<'div'>, 'color' | 'children'> {
  /** 内訳。左から順に塗ります */
  items: MeterGroupItem[];
  /**
   * 範囲の上端。内訳の合計がこれより小さいと、残りは地のままです
   * @default 100
   */
  max?: number;
  /** バーの上に置く太字のラベル。渡さないときは aria-label で名前を付けます */
  label?: ReactNode;
  /** 凡例の下に置く補足 */
  caption?: ReactNode;
  /**
   * 合計の値の文字を出さなくします。合計の値の文字は、ふだんラベルの行の右端に出ます
   * @default false
   */
  hideValue?: boolean;
  /**
   * 合計の値の文字を作る関数（例: (_, v) => `${v} / 64 GB`）。
   * 渡さないときは、format で整えた合計（format もなければ割合の「45%」）です
   */
  getValueText?: (formattedValue: string, value: number) => string;
  /** 値を整える Intl.NumberFormat の指定。渡さないときは割合（%）で出します */
  format?: Intl.NumberFormatOptions;
  /** 値を整えるときのロケール。既定はブラウザのロケールです */
  locale?: Intl.LocalesArgument;
  /**
   * バーの太さ。Meter と同じ段です
   * @default 'md'
   */
  size?: BarSize;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * 1 本のバーを内訳ごとに分けて塗ります（ストレージの内訳など）。バーの下に、色の印と名前と値の凡例を出します
 */
export function MeterGroup({
  items,
  max = 100,
  label,
  caption,
  hideValue = false,
  getValueText,
  format,
  locale,
  size,
  className,
  'aria-describedby': describedByProp,
  ...props
}: MeterGroupProps) {
  const styles = meterGroup({ size });
  const id = useId();
  const labelId = `${id}label`;
  const captionId = `${id}caption`;
  const range = max > 0 ? max : 1;
  const clamp = (value: number) => Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), range);
  const formatValue = (value: number) =>
    format
      ? new Intl.NumberFormat(locale, format).format(value)
      : new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(
          value / range
        );
  const total = clamp(items.reduce((sum, item) => sum + clamp(item.value), 0));
  const totalText = getValueText ? getValueText(formatValue(total), total) : formatValue(total);
  return (
    <div
      role="group"
      data-slot="meter-group"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={barDescribedBy(describedByProp, captionId, Boolean(caption))}
      className={styles.root({ className })}
      {...props}
    >
      {label ? (
        <span id={labelId} className={styles.label()}>
          {label}
        </span>
      ) : null}
      {!hideValue ? <span className={styles.value()}>{totalText}</span> : null}
      <div aria-hidden data-slot="meter-group-track" className={styles.track()}>
        {/* 0 の内訳は区切りを置かない（置くと、幅のない区切りの両側に間が 2 つ並ぶ）。凡例には出す */}
        {items.map((item, i) =>
          clamp(item.value) > 0 ? (
            <span
              key={i}
              data-slot="meter-group-segment"
              className={styles.segment({
                className: segmentColor[item.color ?? defaultColors[i % defaultColors.length]],
              })}
              style={{ flexBasis: `${(clamp(item.value) / range) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <ul data-slot="meter-group-legend" className={styles.legend()}>
        {items.map((item, i) => (
          <li
            key={i}
            className={styles.legendItem({
              className: segmentColor[item.color ?? defaultColors[i % defaultColors.length]],
            })}
          >
            <span aria-hidden className={styles.marker()} />
            <span className={styles.legendLabel()}>{item.label}</span>
            <span className={styles.legendValue()}>
              {item.valueText ?? formatValue(clamp(item.value))}
            </span>
          </li>
        ))}
      </ul>
      {caption ? (
        <p id={captionId} className={styles.caption()}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}
