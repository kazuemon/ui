import { Meter as BaseMeter } from '@base-ui/react/meter';
import { type ComponentProps, type ReactNode, useId } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { meterRegion } from './meter-region';
import { tv } from '../../internal/tv';

// 決まった範囲の中の量を示すバー（HTML の meter）。スキルの習熟度、ストレージの使用量など
// 進み具合（処理の進行・記事の読了）は Progress（まだない）として分ける。Meter は「いまの量」で、終わりに向かって進まない
// 押さないので、ページと同じレイヤー（原則1: 影なし）。枠線も付けない
// 並びは Field と同じ3層（原則4）: 上にラベル（太字）、真ん中にバー、下にキャプション（小さくグレー）
//   値の文字はラベルと同じ行の右端に、ラベルと同じ大きさで一段淡く置く（数字の幅をそろえる）— 原則にない判断（軸 162 のメモ）
// バー: 地（--color-meter-track）の上に、値までを部品の色で塗る。太さと角は --meter-height・--meter-radius — 軸 162
//   塗りは地の角で切り抜く（塗りの右端も地と同じ角になる）
// 色は利用者が選ぶ（原則6）。指定しないときは濃いグレー（トグルの ON と同じ）
//   ピンクは面用（文字を載せない塗り — 原則12）。トグルの ON と同じ
// low・high・optimum を渡すと、値のある範囲で塗りを変える（HTML の meter と同じ規則。meter-region.ts）— 軸 163
//   最適の範囲は --color-meter-optimum（initial で部品の色のまま）、隣の範囲は --color-meter-suboptimum、反対の端は --color-meter-even-less-good
//   色だけで伝えず、値の文字（数）でも読める（原則6）。範囲の意味は、使う側がキャプションなどの文で書く
// 値が変わったときは、塗りを --duration-meter で伸び縮みさせる。動きを減らす設定では、すぐ切り替える
const meter = tv({
  slots: {
    root: [
      'grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-(--spacing-field-gap)',
      '[--meter-fill:var(--meter-own)]',
      'data-[region=optimum]:[--meter-fill:var(--color-meter-optimum,var(--meter-own))]',
      'data-[region=suboptimum]:[--meter-fill:var(--color-meter-suboptimum,var(--meter-own))]',
      'data-[region=even-less-good]:[--meter-fill:var(--color-meter-even-less-good,var(--meter-own))]',
    ],
    label: 'col-start-1 text-(length:--text-label) leading-(--leading-label) font-bold text-fg',
    value:
      'col-start-2 justify-self-end text-(length:--text-label) leading-(--leading-label) whitespace-nowrap text-fg-muted tabular-nums',
    track:
      'relative col-span-full h-(--meter-height) overflow-hidden rounded-(--meter-radius) bg-(color:--color-meter-track)',
    indicator: [
      'absolute inset-y-0 rounded-(--meter-radius) bg-(color:--meter-fill)',
      'transition-[width,background-color] duration-(--duration-meter) ease-press motion-reduce:transition-none',
    ],
    caption:
      'col-span-full text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
  },
  variants: {
    color: {
      primary: { root: '[--meter-own:var(--color-primary)]' },
      secondary: { root: '[--meter-own:var(--color-secondary)]' },
      neutral: { root: '[--meter-own:var(--color-neutral-strong)]' },
    },
  },
  defaultVariants: { color: 'neutral' },
});

type MeterColor = NonNullable<VariantProps<typeof meter>['color']>;

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
   * これより下を「低い」範囲にします。low・high のどちらかを渡すと、値のある範囲で塗りの色が変わります（HTML の meter と同じ）
   */
  low?: number;
  /** これより上を「高い」範囲にします */
  high?: number;
  /**
   * 望ましい値。これがある範囲を「最適」とし、隣の範囲は警告の色、反対の端の範囲は危険の色で塗ります。
   * 渡さないときは min と max の真ん中です
   */
  optimum?: number;
  /** バーの上に置く太字のラベル。渡さないときは aria-label で名前を付けます */
  label?: ReactNode;
  /** バーの下に置く補足。範囲の意味（「90% を超えると保存できなくなります」など）もここに書きます */
  caption?: ReactNode;
  /**
   * 値の文字をラベルの行の右端に出すか
   * @default true
   */
  showValue?: boolean;
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
  showValue = true,
  getValueText,
  format,
  locale,
  color,
  className,
  'aria-describedby': describedByProp,
  ...props
}: MeterProps) {
  const styles = meter({ color });
  const captionId = `${useId()}caption`;
  const region = meterRegion({ value, min, max, low, high, optimum });
  const describedBy = [describedByProp, caption ? captionId : null].filter(Boolean).join(' ');
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
      aria-describedby={describedBy || undefined}
      className={styles.root({ className })}
      {...props}
    >
      {label ? <BaseMeter.Label className={styles.label()}>{label}</BaseMeter.Label> : null}
      {showValue ? (
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
