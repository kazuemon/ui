'use client';

import { Progress as BaseProgress } from '@base-ui/react/progress';
import { type ComponentProps, type ReactNode, useId } from 'react';

import {
  type BarColor,
  type BarSize,
  barDescribedBy,
  barStyles,
} from '../../internal/bar/bar-styles';
import { tv } from '../../internal/tv';

// 処理の進み具合を示すバー（HTML の progress）。アップロード、手順の進み、記事の読了など
// 決まった範囲の中の「いまの量」は Meter。Progress は終わりに向かって進むもの
// バーの形・色・太さ・3 層の並びは Meter と共有する（src/internal/bar/bar-styles.ts）
//   進み具合に良し悪しはないので、Meter の範囲による色（regionColor）は持たない。色は部品の色だけ
//   終わった（value が max）ときも見た目は変えない（原則にない判断）。data-complete を付けるので、使う側が変えられる
// 終わりの分からないとき（value が null）: 地の上で塗りの色が動き続ける。動き方は animation で選ぶ
//   sweep（既定）: 短い区切りが左から右へ流れる。送信中の流れる線（Loading の LoadingBar — adr/0034）と同じ動き
//   shuttle: 区切りが地の中に収まったまま、左右の端を往復する。流れる向き（進む感じ）はない
//   stripes: 幅いっぱいを斜めの縞で塗り、縞を左から右へ流す。細い xs・sm では短い点線が流れて見える
//   縞・区切りの色は currentColor から作る（:root のトークンから、部品の中の --bar-fill を指せないため）
//   動きを減らす設定では、どれも幅いっぱいに引いて、その場で明滅する（LoadingBar と同じ — adr/0042・原則14）。縞は止まる
//   値の文字は出さない。読み上げの値の文（aria-valuetext）も付けない（Base UI の英語の既定を出さない）
// 記事の読了のバー（Affix で上端に留める使い方）向けに、Progress だけが持つもの
//   size="xs": 2px。送信中の流れる線と同じ細さ。Meter は範囲の色を見せるので、この細さは持たない
//   track: 地を敷くか。地を消すと、読んだ分だけの線になる。Meter は範囲の中の位置を見せるので、地はいつも敷く
//   shape="square": 端を丸めない。画面の端に接する線なので、丸い端が浮いて見えないようにする。ふだんのバーは pill のまま
const progress = tv({
  extend: barStyles,
  slots: {
    root: '',
    track: '',
    indicator: [
      'data-indeterminate:left-0 data-indeterminate:text-(color:--bar-fill)',
      'motion-reduce:data-indeterminate:w-full motion-reduce:data-indeterminate:animate-loading-bar-reduced motion-reduce:data-indeterminate:opacity-60',
    ],
  },
  variants: {
    size: {
      xs: { root: '[--bar-height:var(--progress-height-xs)]' },
    },
    track: {
      true: {},
      false: { track: 'bg-transparent' },
    },
    animation: {
      sweep: {
        indicator:
          'data-indeterminate:w-(--progress-sweep-width) data-indeterminate:animate-loading-bar',
      },
      shuttle: {
        indicator:
          'data-indeterminate:w-(--progress-shuttle-width) data-indeterminate:animate-(--progress-shuttle-animation)',
      },
      stripes: {
        indicator: [
          'data-indeterminate:w-full data-indeterminate:[background:var(--progress-stripes)]',
          'data-indeterminate:animate-(--progress-stripes-animation)',
        ],
      },
    },
    shape: {
      round: {},
      square: { track: 'rounded-none', indicator: 'rounded-none' },
    },
  },
  defaultVariants: { track: true, animation: 'sweep', shape: 'round' },
});

/** Progress の太さ。xs は読了のバー向けのいちばん細い線です */
export type ProgressSize = 'xs' | BarSize;

/** 終わりが分からないとき（value が null）の動き */
export type ProgressAnimation = 'sweep' | 'shuttle' | 'stripes';

/** バーの端の形。square は読了のバーのための、端を丸めない形です */
export type ProgressShape = 'round' | 'square';

export interface ProgressProps extends Omit<
  ComponentProps<'div'>,
  'color' | 'children' | 'aria-valuetext'
> {
  /**
   * いまの値。min〜max の外の値は、端にそろえて描きます。
   * 終わりが分からないとき（どれだけかかるか分からない読み込み）は null を渡します
   */
  value: number | null;
  /**
   * 範囲の下端
   * @default 0
   */
  min?: number;
  /**
   * 範囲の上端。value がこの値になると、終わった（data-complete）とみなします
   * @default 100
   */
  max?: number;
  /** バーの上に置く太字のラベル。渡さないときは aria-label で名前を付けます */
  label?: ReactNode;
  /** バーの下に置く補足（「残り 3 ファイル」など） */
  caption?: ReactNode;
  /**
   * 値の文字をラベルの行の右端に出すか。終わりが分からないとき（value が null）は出しません
   * @default true
   */
  showValue?: boolean;
  /**
   * 値の文字を作る関数。見えている文字と読み上げの文の両方に使います（例: (_, v) => `${v} / 12 ファイル`）。
   * 渡さないときは、format で整えた値（format もなければ割合の「45%」）です
   */
  getValueText?: (formattedValue: string, value: number) => string;
  /** 値を整える Intl.NumberFormat の指定。渡さないときは割合（%）で出します */
  format?: Intl.NumberFormatOptions;
  /** 値を整えるときのロケール。既定はブラウザのロケールです */
  locale?: Intl.LocalesArgument;
  /**
   * 塗りの色。primary・secondary は利用者が選ぶ色、neutral は色を持たない濃いグレーです
   * @default 'neutral'
   */
  color?: BarColor;
  /**
   * バーの太さ。xs（2px）は記事の読了のバーのような細い線、sm（4px）は細いバー、md は標準、lg は太いバーです。
   * どの太さでも端は丸いままです（端を丸めないのは shape="square"）
   * @default 'md'
   */
  size?: ProgressSize;
  /**
   * 終わりが分からないとき（value が null）の動き。どれも、動きを減らす設定では幅いっぱいに引いてその場で明滅します
   * - sweep: 短い区切りが左から右へ流れます。ボタンの送信中の線と同じ動きです。ふだんはこれを使います
   * - shuttle: 区切りがバーの中に収まったまま、左右の端を往復します。いつも区切りが見えていますが、進む向きは見えません
   * - stripes: 幅いっぱいを斜めの縞で塗り、縞を左から右へ流します。長く待つ処理で、止まっていないことをはっきり見せたいときに使います。
   *   細い xs・sm では、縞は短い点線が流れるように見えます
   * @default 'sweep'
   */
  animation?: ProgressAnimation;
  /**
   * バーの端の形。round は丸い端です。square は端を丸めない形で、記事の上端に留める読了のバーのような、
   * 画面の端に接する線でだけ使います
   * @default 'round'
   */
  shape?: ProgressShape;
  /**
   * 地（まだ進んでいない分のグレー）を敷くか。false にすると、進んだ分だけの線になります。
   * 記事の上端に留める読了のバーを軽く見せたいときに使います
   * @default true
   */
  track?: boolean;
}

/**
 * 処理の進み具合を示すバー。終わりの分からない進み具合（value が null）では、地の上で塗りの色が動き続けます（animation）
 */
export function Progress({
  value,
  min = 0,
  max = 100,
  label,
  caption,
  showValue = true,
  getValueText,
  format,
  locale,
  color,
  size,
  track = true,
  animation,
  shape,
  className,
  'aria-describedby': describedByProp,
  ...props
}: ProgressProps) {
  const styles = progress({ color, size, track, animation, shape });
  const captionId = `${useId()}caption`;
  const indeterminate = value === null || !Number.isFinite(value);
  return (
    <BaseProgress.Root
      value={value}
      min={min}
      max={max}
      format={format}
      locale={locale}
      getAriaValueText={
        getValueText
          ? (formatted, raw) => (raw === null ? '' : getValueText(formatted, raw))
          : undefined
      }
      // 終わりが分からないときは値の文を付けない（Base UI の既定は英語の「indeterminate progress」）
      {...(indeterminate ? { 'aria-valuetext': undefined } : {})}
      data-slot="progress"
      aria-describedby={barDescribedBy(describedByProp, captionId, Boolean(caption))}
      className={styles.root({ className })}
      {...props}
    >
      {label ? <BaseProgress.Label className={styles.label()}>{label}</BaseProgress.Label> : null}
      {showValue && !indeterminate ? (
        <BaseProgress.Value className={styles.value()}>
          {getValueText
            ? (formatted, raw) => (raw === null ? '' : getValueText(formatted ?? '', raw))
            : undefined}
        </BaseProgress.Value>
      ) : null}
      <BaseProgress.Track data-slot="progress-track" className={styles.track()}>
        <BaseProgress.Indicator data-slot="progress-indicator" className={styles.indicator()} />
      </BaseProgress.Track>
      {caption ? (
        <p id={captionId} className={styles.caption()}>
          {caption}
        </p>
      ) : null}
    </BaseProgress.Root>
  );
}
