import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { CaretDownIcon, CaretUpIcon, MinusIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';
import { Skeleton } from '../skeleton/Skeleton';

// 数字とラベル。実績・指標（公開記事の数、稼働率、売上）を 1 つだけ大きく見せる
// 押さないので hover も影もない。ページと同じレイヤー（原則1）。カードに載せたいときは Card と組み合わせる（原則9・原則20）
// 並びは Field・バーと同じ3層（原則4）: 上にラベル（太字）、真ん中に数字、下にキャプション（小さくグレー）
// 読み上げは dl・dt・dd で、ラベルと数字を組にする（原則15）
// 増減は、色だけでなく矢印の形でも見分ける（原則6）。上向き・下向き・横棒の3つ
//   増えたことが良いのか悪いのかは部品には分からないので、良し悪し（trend）は使う側が選ぶ（原則20）。書かなければ矢印の向き（deltaIndicator）から決める
// 数字の大きさは、文字の尺度の段をトークンで差し替える（size。既定は見出し1 — 密度で一緒に変わる）
// 増減は、矢印の有無（hideDeltaIcon）と淡い面の有無（deltaFill）を選べる。色は trend
// 読み込み中（loading）: 数字の場所に Skeleton の文字の行を置き、dl に aria-busy を付ける。帯の太さ・角は文字の行のまま、長さは --stat-loading-width（軸 431）
//   値がまだなく loading も渡さないときは、部品は何も足さない。使う側が「—」などを value に入れる
//   ラベル・単位・キャプションは読み込む前から分かっているので、そのまま出す。増減は数字と一緒に届くので、読み込むまで出さない（原則にない判断）
//   読み込み中であることは、数字の場所に読み上げだけの文（loadingText）を置いて知らせる

const stat = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-(--stat-gap)',
    label: 'text-(length:--text-label) leading-(--leading-label) font-bold text-fg',
    body: 'flex min-w-0 flex-col gap-(--stat-caption-gap)',
    valueRow: 'flex flex-wrap items-baseline gap-x-(--stat-value-gap) gap-y-1',
    value: [
      'text-(length:--stat-value-text) leading-(--stat-value-leading) [letter-spacing:var(--stat-value-tracking,normal)]',
      '[font-weight:var(--stat-value-weight)] text-fg tabular-nums',
    ],
    // 読み込み中の帯。文字の大きさと行の高さを数字から受け継ぐ（Skeleton の文字の行）
    loading: 'inline-block w-(--stat-loading-width) max-w-full align-bottom',
    unit: 'text-body text-fg-muted',
    delta: [
      'inline-flex items-center gap-(--stat-delta-gap) whitespace-nowrap tabular-nums',
      'text-(length:--stat-delta-text) leading-(--stat-delta-leading)',
      '[font-weight:var(--stat-delta-weight)] [color:var(--color-stat-delta)]',
    ],
    icon: 'size-[1.25em] shrink-0',
    caption: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
  },
  variants: {
    trend: {
      positive: {
        root: '[--color-stat-delta:var(--color-fg-success)] [--stat-delta-tint:var(--color-success-subtle)]',
      },
      negative: {
        root: '[--color-stat-delta:var(--color-fg-danger)] [--stat-delta-tint:var(--color-danger-subtle)]',
      },
      neutral: {
        root: '[--color-stat-delta:var(--color-fg-muted)] [--stat-delta-tint:var(--color-neutral)]',
      },
    },
    align: {
      start: {},
      center: { root: 'items-center text-center', valueRow: 'justify-center' },
      end: { root: 'items-end text-right', valueRow: 'justify-end' },
    },
    // 数字の大きさ。文字の尺度の段を指すので、密度でも一緒に変わる
    size: {
      // 大きい段は見出しと同じく字間を詰める（ADR-0368）
      '5xl': {
        root: '[--stat-value-leading:var(--leading-heading-5xl)] [--stat-value-text:var(--text-heading-5xl)] [--stat-value-tracking:var(--heading-large-tracking)]',
      },
      '4xl': {
        root: '[--stat-value-leading:var(--leading-heading-4xl)] [--stat-value-text:var(--text-heading-4xl)] [--stat-value-tracking:var(--heading-large-tracking)]',
      },
      '3xl': {
        root: '[--stat-value-leading:var(--leading-heading-3xl)] [--stat-value-text:var(--text-heading-3xl)] [--stat-value-tracking:var(--heading-large-tracking)]',
      },
      '2xl': {},
      xl: {
        root: '[--stat-value-leading:var(--leading-heading-xl)] [--stat-value-text:var(--text-heading-xl)]',
      },
      lg: {
        root: '[--stat-value-leading:var(--leading-heading-lg)] [--stat-value-text:var(--text-heading-lg)]',
      },
      md: {
        root: '[--stat-value-leading:var(--leading-body)] [--stat-value-text:var(--text-body)]',
      },
    },
    // 増減を、trend の淡い面（pill）に載せる
    fill: {
      true: {
        delta: 'rounded-pill bg-(color:--stat-delta-tint) px-2 py-0.5',
      },
      false: {},
    },
  },
  defaultVariants: { trend: 'neutral', align: 'start', size: '2xl', fill: false },
});

/** 増減の印の向き。up は上向き、down は下向き、flat は横棒の矢印になります */
export type StatDeltaIndicator = 'up' | 'down' | 'flat';
/** 増減の良し悪し */
export type StatTrend = NonNullable<VariantProps<typeof stat>['trend']>;
/** 中身の寄せ方 */
export type StatAlign = NonNullable<VariantProps<typeof stat>['align']>;
/** 数字の大きさ（文字の尺度の段） */
export type StatSize = NonNullable<VariantProps<typeof stat>['size']>;

const indicatorIcons = {
  up: CaretUpIcon,
  down: CaretDownIcon,
  flat: MinusIcon,
} as const;

const trendFromIndicator: Record<StatDeltaIndicator, StatTrend> = {
  up: 'positive',
  down: 'negative',
  flat: 'neutral',
};

export interface StatProps extends Omit<ComponentProps<'dl'>, 'children'> {
  /** 数字の名前。太字で数字の上に置きます */
  label: ReactNode;
  /** 数字そのもの。桁区切りや通貨は NumberFormat を渡します。読み込み中（loading）は出しません */
  value: ReactNode;
  /** 数字の後ろに小さく添える単位（「件」「%」「GB」など） */
  unit?: ReactNode;
  /** 数字の下に置く補足（「先月比」「直近 30 日」など） */
  caption?: ReactNode;
  /** 増減の文字（「12%」「+128」など）。書かないと増減は出ません */
  delta?: ReactNode;
  /**
   * 増減の印の向き。矢印の形になります。色だけで伝えないための印です
   * @default 'flat'
   */
  deltaIndicator?: StatDeltaIndicator;
  /**
   * 増減の良し悪し。色になります。増えたことが良いか悪いかは場面で違うので、使う側が選びます。
   * 書かないときは deltaIndicator から決めます（up は成功の緑、down は危険の赤、flat はグレー）
   */
  trend?: StatTrend;
  /**
   * 増減の読み上げの文（「先月比 12% 増」など）。書くと、見えている増減の代わりに読まれます
   */
  deltaText?: string;
  /**
   * 中身の寄せ方
   * @default 'start'
   */
  align?: StatAlign;
  /**
   * 数字の大きさ。文字の尺度の段で選びます（指で操作するときは、段ごと小さくなります）。
   * 数字をいくつも並べるときは小さい段にします
   * @default '2xl'
   */
  size?: StatSize;
  /**
   * 増減の矢印を出さないようにします。出さないときは、`delta` に符号（「+12%」「-4pt」）を書きます。
   * 色だけで増減を伝えないためです
   * @default false
   */
  hideDeltaIcon?: boolean;
  /**
   * 増減を、色に合わせた淡い面（pill）に載せるか。数字から切り離して読ませたいときに true にします
   * @default false
   */
  deltaFill?: boolean;
  /**
   * 読み込み中にします。数字の場所に読み込み中の帯（Skeleton）を置き、増減は出しません。
   * ラベル・単位・キャプションはそのまま出します
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込み中に、数字の代わりに読み上げる文
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /** 根の要素（dl）に付きます */
  className?: string;
}

/**
 * 数字とラベル。実績や指標を 1 つだけ大きく見せます
 */
export function Stat({
  label,
  value,
  unit,
  caption,
  delta,
  deltaIndicator = 'flat',
  trend,
  deltaText,
  align,
  size,
  hideDeltaIcon = false,
  deltaFill,
  loading = false,
  loadingText = '読み込んでいます',
  className,
  ...props
}: StatProps) {
  const styles = stat({
    trend: trend ?? trendFromIndicator[deltaIndicator],
    align,
    size,
    fill: deltaFill,
  });
  const DeltaIcon = indicatorIcons[deltaIndicator];
  return (
    <dl
      data-slot="stat"
      className={styles.root({ className })}
      {...props}
      // 読み込み中は、使う側が aria-busy を渡していても true にする
      aria-busy={loading || props['aria-busy']}
    >
      <dt className={styles.label()}>{label}</dt>
      <dd className={styles.body()}>
        <div className={styles.valueRow()}>
          <span className={styles.value()} data-slot="stat-value">
            {loading ? (
              <>
                <Skeleton variant="text" className={styles.loading()} />
                <span className="sr-only">{loadingText}</span>
              </>
            ) : (
              value
            )}
          </span>
          {unit == null ? null : <span className={styles.unit()}>{unit}</span>}
          {delta == null || loading ? null : (
            <span className={styles.delta()} data-slot="stat-delta">
              {hideDeltaIcon ? null : <DeltaIcon className={styles.icon()} />}
              {deltaText == null ? (
                delta
              ) : (
                <>
                  <span aria-hidden="true">{delta}</span>
                  <span className="sr-only">{deltaText}</span>
                </>
              )}
            </span>
          )}
        </div>
        {caption == null ? null : <p className={styles.caption()}>{caption}</p>}
      </dd>
    </dl>
  );
}
