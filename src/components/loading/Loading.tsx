// 送信中・読み込み中の印（design/adr/0034・0042）。Button・TextField・Select で共有する
// 回る円: 薄い輪の上を、濃い弧が1秒で1周する。色は置いた場所の文字の色（className で渡す）
// 流れる線: 下端を左から右へ流れる（--animate-loading-bar）。濃さは線の色の 60%
// 動きを減らす設定（prefers-reduced-motion: reduce）では、回る円は3秒で1周（--animate-spin-reduced）、
// 線は流さずに幅いっぱいに引いて明滅する（--animate-loading-bar-reduced、60% ↔ 20%）— design/adr/0042
// 回る円がふわっと出る動き（ボタンの overlay の --animate-loading-in、0.2 秒）も、この設定ではなくす（tokens.css で上書き）
// クラス名 animate-spin・animate-loading-bar は、比較のストーリーが印を探すのに使うので変えない

import { tv } from '../../internal/tv';

/** 送信中・読み込み中の印。spinner: 回る円（既定）、bar: 下端に流れる線。Button・TextField・Select で共通 */
export type LoadingIndicator = 'spinner' | 'bar';

interface IndicatorProps {
  /** 色と置き方。回る円の大きさの既定は --spacing-icon */
  className?: string;
}

// 回る円の大きさ（軸 434）。control は部品の中の文字と並ぶ大きさ（--spacing-icon。密度で変わる）、text は周りの文字に比例（Icon と同じ）
//   sm・md・lg は密度で変わらない段（--spinner-size-*）。面の真ん中に 1 つだけ置く読み込み中は lg
//   線の太さは viewBox 16 に対する幅（--spinner-stroke-*）。大きい段で線が太くなりすぎないよう、段ごとに持つ
//   薄い輪の濃さは --spinner-track-opacity。hideTrack で輪を出さず、弧だけにできる（既定は輪あり。ボタン・入力欄の中は輪あり）
const spinner = tv({
  slots: {
    root: 'inline-flex shrink-0',
    svg: 'size-(--spinner-size) shrink-0 animate-spin motion-reduce:animate-spin-reduced',
    track: '[stroke-width:var(--spinner-stroke)] [stroke-opacity:var(--spinner-track-opacity)]',
    arc: '[stroke-width:var(--spinner-stroke)]',
  },
  variants: {
    size: {
      control: { svg: '[--spinner-size:var(--spacing-icon)] [--spinner-stroke:2]' },
      text: { svg: '[--spinner-size:var(--icon-size-text)] [--spinner-stroke:2]' },
      sm: {
        svg: '[--spinner-size:var(--spinner-size-sm)] [--spinner-stroke:var(--spinner-stroke-sm)]',
      },
      md: {
        svg: '[--spinner-size:var(--spinner-size-md)] [--spinner-stroke:var(--spinner-stroke-md)]',
      },
      lg: {
        svg: '[--spinner-size:var(--spinner-size-lg)] [--spinner-stroke:var(--spinner-stroke-lg)]',
      },
    },
  },
  defaultVariants: { size: 'control' },
});

/** 回る円の大きさ */
export type SpinnerSize = 'control' | 'text' | 'sm' | 'md' | 'lg';

export interface SpinnerProps extends IndicatorProps {
  /**
   * 大きさ。control は部品の中の文字と並ぶ大きさ（指で操作するときは小さくなります）、text は周りの文字に合わせた大きさです。
   * sm・md・lg は決まった大きさで、面の真ん中に 1 つだけ置く読み込み中には lg を使います
   * @default 'control'
   */
  size?: SpinnerSize;
  /**
   * 読み上げだけの名前（「読み込んでいます」など）。書くと、回る円を role="status" の箱に入れて読み上げます。
   * ボタンや入力欄の中のように、周りが待っていることを伝えているときは書きません
   */
  accessibleName?: string;
  /**
   * 下地の薄い輪を出さず、回る弧だけにします
   * @default false
   */
  hideTrack?: boolean;
}

/** 回る円 */
export function Spinner({ className, size, accessibleName, hideTrack = false }: SpinnerProps) {
  const styles = spinner({ size });
  const svg = (
    <svg
      viewBox="0 0 16 16"
      data-slot="spinner"
      className={styles.svg({ className: accessibleName ? undefined : className })}
      aria-hidden
    >
      {hideTrack ? null : (
        <circle className={styles.track()} cx="8" cy="8" r="6" fill="none" stroke="currentColor" />
      )}
      <path
        className={styles.arc()}
        d="M8 2a6 6 0 0 1 6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
  if (!accessibleName) return svg;
  return (
    <span role="status" className={styles.root({ className })}>
      {svg}
      <span className="sr-only">{accessibleName}</span>
    </span>
  );
}

/** 下端に流れる線。位置の基準（relative）を持つ要素の中に置く。className で線の色（bg-*）を渡す */
export function LoadingBar({ className }: IndicatorProps) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
    >
      <span
        className={[
          'absolute inset-y-0 left-0 w-2/5 animate-loading-bar opacity-60 motion-reduce:w-full motion-reduce:animate-loading-bar-reduced',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </span>
  );
}
