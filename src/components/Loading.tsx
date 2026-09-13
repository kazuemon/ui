// 送信中・読み込み中の印（design/adr/0034・0042）。Button・TextField・Select で共有する
// 回る円: 薄い輪の上を、濃い弧が1秒で1周する。色は置いた場所の文字の色（className で渡す）
// 流れる線: 下端を左から右へ流れる（--animate-loading-bar）。濃さは線の色の 60%
// 動きを減らす設定（prefers-reduced-motion: reduce）では、回る円は3秒で1周（--animate-spin-reduced）、
// 線は流さずに幅いっぱいに引いて明滅する（--animate-loading-bar-reduced、60% ↔ 20%）— design/adr/0042
// 回る円がふわっと出る動き（ボタンの overlay の --animate-loading-in、0.2 秒）も、この設定ではなくす（tokens.css で上書き）
// クラス名 animate-spin・animate-loading-bar は、比較のストーリーが印を探すのに使うので変えない

/** 送信中・読み込み中の印。spinner: 回る円（既定）、bar: 下端に流れる線。Button・TextField・Select で共通 */
export type LoadingIndicator = 'spinner' | 'bar';

interface IndicatorProps {
  /** 色と置き方。回る円の大きさの既定は --size-icon */
  className?: string;
}

/** 回る円 */
export function Spinner({ className }: IndicatorProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={[
        'size-(--size-icon) shrink-0 animate-spin motion-reduce:animate-spin-reduced',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
