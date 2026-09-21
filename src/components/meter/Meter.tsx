'use client';

import { Meter as BaseMeter } from '@base-ui/react/meter';
import { type ComponentProps, type ReactNode, useId } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { meterRegion } from './meter-region';
import { barDescribedBy, barStyles } from '../../internal/bar/bar-styles';
import { tv } from '../../internal/tv';

// 決まった範囲の中の量を示すバー（HTML の meter）。スキルの習熟度、ストレージの使用量など
// 進み具合（処理の進行・記事の読了）は Progress として分ける。Meter は「いまの量」で、終わりに向かって進まない
// バーの形・色・太さ・3 層の並びは Progress と共有する（src/internal/bar/bar-styles.ts）
// low・high・optimum を渡すと、値のある範囲で塗りを変える（HTML の meter と同じ規則。meter-region.ts）
//   範囲ごとの色は regionColor で選ぶ。部品の中の --meter-{optimum,suboptimum,even-less-good} に入れ、data-region で塗り（--bar-fill）に渡す
//     status: 最適は成功、隣は警告（前景用のオリーブ）、反対の端は危険（既定）
//     color: 最適は部品の色のまま。隣・反対の端は status と同じ
//   色だけで伝えず、値の文字（数）でも読める（原則6）。範囲の意味は、使う側がキャプションなどの文で書く
const meter = tv({
  extend: barStyles,
  slots: {
    root: [
      '[--meter-even-less-good:var(--color-danger)] [--meter-suboptimum:var(--color-fg-warning)]',
      'data-[region=optimum]:[--bar-fill:var(--meter-optimum)]',
      'data-[region=suboptimum]:[--bar-fill:var(--meter-suboptimum)]',
      'data-[region=even-less-good]:[--bar-fill:var(--meter-even-less-good)]',
    ],
  },
  variants: {
    regionColor: {
      status: { root: '[--meter-optimum:var(--color-success)]' },
      color: { root: '[--meter-optimum:var(--bar-own)]' },
    },
  },
  defaultVariants: { regionColor: 'status' },
});

/** 塗りの色。primary・secondary は利用者が選ぶ色、neutral は色を持たない濃いグレー */
export type MeterColor = NonNullable<VariantProps<typeof meter>['color']>;
/** バーの太さ */
export type MeterSize = NonNullable<VariantProps<typeof meter>['size']>;
/** low・high・optimum を渡したときの、範囲ごとの塗りの色 */
export type MeterRegionColor = NonNullable<VariantProps<typeof meter>['regionColor']>;

export interface MeterProps extends Omit<
  ComponentProps<'div'>,
  'color' | 'children' | 'aria-valuetext'
> {
  /** いまの値。min〜max の外の値は、端にそろえて描きます */
  value: number;
  /**
   * 範囲の下端
   * @default 0
   */
  min?: number;
  /**
   * 範囲の上端
   * @default 100
   */
  max?: number;
  /**
   * これより下を「低い」範囲にします。low・high のどちらかを渡すと、値のある範囲で塗りの色が変わります（HTML の meter と同じ。色は regionColor）
   */
  low?: number;
  /** これより上を「高い」範囲にします */
  high?: number;
  /**
   * 望ましい値。これがある範囲を「最適」、その隣を「隣の範囲」、反対の端を「反対の端」とします。
   * 渡さないときは min と max の真ん中です
   */
  optimum?: number;
  /** バーの上に置く太字のラベル。渡さないときは aria-label で名前を付けます */
  label?: ReactNode;
  /** バーの下に置く補足。範囲の意味（「90% を超えると保存できなくなります」など）もここに書きます */
  caption?: ReactNode;
  /**
   * 値の文字を出さなくします。値の文字は、ふだんラベルの行の右端に出ます
   * @default false
   */
  hideValue?: boolean;
  /**
   * 値の文字を作る関数。見えている文字と読み上げの文の両方に使います（例: (_, v) => `${v} / 50 GB`）。
   * 渡さないときは、format で整えた値（format もなければ割合の「45%」）です
   */
  getValueText?: (formattedValue: string, value: number) => string;
  /** 値を整える Intl.NumberFormat の指定。渡さないときは割合（%）で出します */
  format?: Intl.NumberFormatOptions;
  /** 値を整えるときのロケール。既定はブラウザのロケールです */
  locale?: Intl.LocalesArgument;
  /**
   * 塗りの色。primary・secondary は利用者が選ぶ色、neutral は色を持たない濃いグレーです（原則6）
   * @default 'neutral'
   */
  color?: MeterColor;
  /**
   * バーの太さ。sm は細い線に近いバー（一覧に多く並べるとき）、md は標準、lg は太いバー（1 つだけ大きく見せるとき）です。
   * どの太さでも角は丸いままです
   * @default 'md'
   */
  size?: MeterSize;
  /**
   * low・high・optimum を渡したときの、範囲ごとの塗りの色。
   * status は最適を成功の緑、隣の範囲を警告のオリーブ、反対の端を危険の赤にします。
   * color は最適の範囲を color の色のままにし、隣と反対の端は status と同じです。
   * low・high のどちらも渡さないときは、いつも color の色です
   * @default 'status'
   */
  regionColor?: MeterRegionColor;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * 決まった範囲の中の量を示すバー（スキルの習熟度、ストレージの使用量など）
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  caption,
  hideValue = false,
  getValueText,
  format,
  locale,
  color,
  size,
  regionColor,
  className,
  'aria-describedby': describedByProp,
  ...props
}: MeterProps) {
  const styles = meter({ color, size, regionColor });
  const captionId = `${useId()}caption`;
  const region = meterRegion({ value, min, max, low, high, optimum });
  const describedBy = barDescribedBy(describedByProp, captionId, Boolean(caption));
  return (
    <BaseMeter.Root
      value={value}
      min={min}
      max={max}
      format={format}
      locale={locale}
      getAriaValueText={getValueText}
      data-slot="meter"
      data-region={region}
      aria-describedby={describedBy}
      className={styles.root({ className })}
      {...props}
    >
      {label ? <BaseMeter.Label className={styles.label()}>{label}</BaseMeter.Label> : null}
      {!hideValue ? (
        <BaseMeter.Value className={styles.value()}>
          {getValueText ? (formatted, raw) => getValueText(formatted, raw) : undefined}
        </BaseMeter.Value>
      ) : null}
      <BaseMeter.Track data-slot="meter-track" className={styles.track()}>
        <BaseMeter.Indicator data-slot="meter-indicator" className={styles.indicator()} />
      </BaseMeter.Track>
      {caption ? (
        <p id={captionId} className={styles.caption()}>
          {caption}
        </p>
      ) : null}
    </BaseMeter.Root>
  );
}
