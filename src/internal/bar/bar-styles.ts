import { tv } from '../tv';

// 地の上に値までを塗るバー。Meter（決まった範囲の中の量）と Progress（進み具合）が共有する — ADR-0179
// 押さないので、ページと同じレイヤー（原則1: 影なし）。枠線も付けない
// 並びは Field と同じ3層（原則4）: 上にラベル（太字）、真ん中にバー、下にキャプション（小さくグレー）
//   値の文字はラベルと同じ行の右端に、ラベルと同じ大きさで一段淡く置く（数字の幅をそろえる）— 原則にない判断（backlog）
// バー: 地（トグルの OFF・選んでいない箱と同じグレー）の上に、値までを部品の色で塗る。角は小物と同じ pill
//   Progress だけは、読了のバー向けに端を丸めない形（shape="square"）を持つ（Progress で rounded-none に差し替える）
//   塗りは地の角で切り抜く（塗りの右端も地と同じ角になる）
//   太さは size で 3 段（--bar-height-{sm,md,lg}）。太くしても角は pill のまま（原則5: 角は何であるかで決め、高さに比例させない）
// 色は利用者が選ぶ（原則6）。指定しないときは濃いグレー（トグルの ON と同じ）
//   ピンクは面用（文字を載せない塗り — 原則12）。トグルの ON と同じ
//   部品の色は --bar-own に置き、塗りは --bar-fill で描く。Meter は範囲ごとに --bar-fill を差し替える
// 値が変わったときは、塗りを --duration-bar で伸び縮みさせる。動きを減らす設定では、すぐ切り替える
export const barStyles = tv({
  slots: {
    root: [
      'grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-(--spacing-field-gap)',
      '[--bar-fill:var(--bar-own)]',
    ],
    label: 'col-start-1 text-(length:--text-label) leading-(--leading-label) font-bold text-fg',
    value:
      'col-start-2 justify-self-end text-(length:--text-label) leading-(--leading-label) whitespace-nowrap text-fg-muted tabular-nums',
    track: 'relative col-span-full h-(--bar-height) overflow-hidden rounded-pill bg-field-addon',
    indicator: [
      'absolute inset-y-0 rounded-pill bg-(color:--bar-fill)',
      'transition-[width,background-color] duration-(--duration-bar) ease-press motion-reduce:transition-none',
    ],
    caption:
      'col-span-full text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
  },
  variants: {
    color: {
      primary: { root: '[--bar-own:var(--color-primary)]' },
      secondary: { root: '[--bar-own:var(--color-secondary)]' },
      neutral: { root: '[--bar-own:var(--color-neutral-strong)]' },
    },
    size: {
      sm: { root: '[--bar-height:var(--bar-height-sm)]' },
      md: { root: '[--bar-height:var(--bar-height-md)]' },
      lg: { root: '[--bar-height:var(--bar-height-lg)]' },
    },
  },
  defaultVariants: { color: 'neutral', size: 'md' },
});

/** バーの色。primary・secondary は利用者が選ぶ色、neutral は色を持たない濃いグレー */
export type BarColor = 'primary' | 'secondary' | 'neutral';
/** バーの太さ */
export type BarSize = 'sm' | 'md' | 'lg';

/** ラベルとキャプションから、aria-describedby と キャプションの id を作る */
export function barDescribedBy(
  describedByProp: string | undefined,
  captionId: string,
  hasCaption: boolean
) {
  return [describedByProp, hasCaption ? captionId : null].filter(Boolean).join(' ') || undefined;
}
