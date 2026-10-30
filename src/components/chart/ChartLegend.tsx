'use client';

import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import { ChartLegendButton } from './ChartLegendButton';
import { chartMarker, type ChartMarkerType, seriesColor } from './ChartMarker';

// グラフの凡例。色の印と系列の名前を横に並べ、入りきらなければ折り返す
// 2 系列以上のグラフにはいつも置く（原則6: 色だけで系列を伝えない）。印は読み上げず、名前を読む
// 見た目は MeterGroup の凡例と同じ（丸い印・ラベルの大きさ・名前は本文の色、値は淡い色）
// onHiddenChange を渡すと、項目が系列を出し入れするボタンになる。押せることは、名前の淡い下線で見せる（下線のボタンと同じ）
// 消した系列の見せ方は hiddenVariant（ADR-0550）
//   faded: 項目全体を淡くする。既定
//   ring: 印を色の輪にし、名前を淡くする
//   strike: 名前に取り消し線を引き、印をグレーにする
const chartLegend = tv({
  slots: {
    root: [
      'm-0 flex list-none flex-wrap gap-x-(--chart-legend-gap-x) gap-y-1 p-0',
      'text-(length:--text-label) leading-(--leading-label)',
    ],
    item: 'inline-flex min-w-0 items-center gap-1.5',
    // 押せるときは、下線のボタン（Button の variant="underline"・size="sm"）と同じ高さ・左右の余白・角・手応えにする
    //   hover で文字の色を淡く敷き、押すと 1px 沈む。押せる範囲は敷いた色の広さ（原則17）
    button: [
      'inline-flex h-(--spacing-control-sm) min-w-0 cursor-pointer items-center gap-1.5 rounded-control px-(--spacing-control-x-sm)',
      'bg-transparent text-inherit hover:bg-(--color-flat-hover) active:translate-y-(--flat-press-depth) active:bg-(--color-flat-press)',
      '[transition:translate_var(--duration-press)_var(--ease-press)] motion-reduce:[transition:none]',
      focusRing,
    ],
    marker: '',
    label: 'text-fg',
    value: 'text-fg-muted tabular-nums',
  },
  variants: {
    pressable: {
      // ボタンの左右の余白が項目のあいだになるので、あいだを詰め、外へはみ出させて文字の位置をそろえる
      true: {
        root: '-mx-(--spacing-control-x-sm) gap-0',
        label:
          'underline [text-decoration-color:var(--color-link-underline)] decoration-1 underline-offset-4',
      },
      false: '',
    },
    hidden: { true: '', false: '' },
    hiddenVariant: { ring: '', faded: '', strike: '' },
  },
  // slot ごとの compound は class: { slot: … } の形で書く（slot 名を直に書くと効かない）
  compoundVariants: [
    {
      hidden: true,
      hiddenVariant: 'ring',
      class: {
        marker:
          'bg-transparent shadow-[inset_0_0_0_var(--border-width-medium)_var(--chart-marker-color)]',
        label: 'text-fg-subtle',
      },
    },
    { hidden: true, hiddenVariant: 'faded', class: { button: 'opacity-(--disabled-opacity)' } },
    {
      hidden: true,
      hiddenVariant: 'strike',
      class: {
        marker: '[--chart-marker-color:var(--color-line-strong)]',
        label: 'text-fg-subtle line-through',
      },
    },
  ],
  defaultVariants: { pressable: false, hidden: false, hiddenVariant: 'faded' },
});

/** 凡例の 1 項目 */
export interface ChartLegendItem {
  /** 系列の名前 */
  label: ReactNode;
  /**
   * 印の色（CSS の色。`var(--color-series-2)` など）。グラフの線に渡した色と同じものを渡します。
   * 渡さないときは、並びの順に系列の色（1 番から）です
   */
  color?: string;
  /** 名前のあとに淡く添える値（合計や最新の値） */
  value?: ReactNode;
  /** 系列を消しているか。onHiddenChange を渡したときに、消した見た目になります */
  hidden?: boolean;
}

/** 消した系列の見せ方。faded は項目全体を淡く、ring は印を輪に、strike は名前に取り消し線 */
export type ChartLegendHiddenVariant = 'ring' | 'faded' | 'strike';

export interface ChartLegendProps extends Omit<ComponentProps<'ul'>, 'children'> {
  /** 項目。左から順に並べます */
  items: readonly ChartLegendItem[];
  /**
   * 色の印の形。dot は丸、dash は短い線（線グラフ向き）、square は角の丸い四角（棒・円のグラフ向き）
   * @default 'dot'
   */
  markerType?: ChartMarkerType;
  /**
   * 項目を押したときに呼ばれます。渡すと、項目が系列を出し入れするボタンになります。
   * 何番目の項目か（0 から）と、押したあとに消すかを受け取ります
   */
  onHiddenChange?: (index: number, hidden: boolean) => void;
  /**
   * 消した系列の見せ方。faded は項目全体を淡く、ring は印を色の輪にして名前を淡く、strike は名前に取り消し線を引きます
   * @default 'faded'
   */
  hiddenVariant?: ChartLegendHiddenVariant;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * グラフの凡例です。色の印と系列の名前を並べます。ChartFrame の legend に置きます
 */
export function ChartLegend({
  items,
  markerType = 'dot',
  onHiddenChange,
  hiddenVariant = 'faded',
  className,
  ...props
}: ChartLegendProps) {
  const styles = chartLegend({ hiddenVariant, pressable: onHiddenChange != null });
  const content = (item: ChartLegendItem, i: number) => {
    // 消した見た目は compoundVariants なので、項目ごとに hidden を渡して作り直す（slot に渡しても compound は効かない）
    const pressable = onHiddenChange != null;
    const hidden = pressable && item.hidden === true;
    const itemStyles = chartLegend({ hiddenVariant, pressable, hidden });
    return (
      <>
        <span
          aria-hidden
          className={chartMarker({ markerType, className: itemStyles.marker() })}
          style={{ '--chart-marker-color': seriesColor(item.color, i) } as CSSProperties}
        />
        <span className={itemStyles.label()}>{item.label}</span>
        {item.value != null ? <span className={styles.value()}>{item.value}</span> : null}
      </>
    );
  };
  return (
    <ul
      data-slot="chart-legend"
      data-marker-type={markerType}
      className={styles.root({ className })}
      {...props}
    >
      {items.map((item, i) => (
        // 並びは系列の順で、入れ替わらない
        <li key={i} className={styles.item()}>
          {onHiddenChange ? (
            <ChartLegendButton
              hidden={item.hidden === true}
              className={chartLegend({
                hiddenVariant,
                pressable: true,
                hidden: item.hidden === true,
              }).button()}
              onToggle={() => onHiddenChange(i, item.hidden !== true)}
            >
              {content(item, i)}
            </ChartLegendButton>
          ) : (
            content(item, i)
          )}
        </li>
      ))}
    </ul>
  );
}
