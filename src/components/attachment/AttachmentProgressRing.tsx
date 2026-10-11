import { tv } from '../../internal/tv';

// 左の四角を囲む進み具合の円（progressIndicator="ring"）。四角の中のアイコン・縮小画像の上に重ねる
//   薄い白の幕で中身を少し引き、円の線を読みやすくする。線の色は primary（DropzoneFileList の Progress と同じ）
//   値が分からないとき（null）は、弧が回り続ける（Spinner と同じ動き。動きを減らす設定ではゆっくり回る — 原則14）
const ring = tv({
  slots: {
    root: 'absolute inset-0 flex items-center justify-center bg-surface/60',
    svg: 'size-full p-1 text-primary',
    track: 'stroke-line',
    arc: '[transition:stroke-dashoffset_var(--duration-normal)_var(--ease-press)] motion-reduce:[transition:none]',
  },
  variants: {
    indeterminate: {
      true: { svg: 'animate-spin motion-reduce:animate-spin-reduced' },
    },
  },
});

const RADIUS = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AttachmentProgressRing({ value, label }: { value: number | null; label: string }) {
  const s = ring({ indeterminate: value == null });
  const offset = value == null ? CIRCUMFERENCE * 0.75 : CIRCUMFERENCE * (1 - value / 100);
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value == null ? undefined : Math.round(value)}
      data-slot="attachment-progress-ring"
      className={s.root()}
    >
      <svg viewBox="0 0 32 32" aria-hidden className={s.svg()}>
        <circle className={s.track()} cx="16" cy="16" r={RADIUS} fill="none" strokeWidth="2.5" />
        <circle
          className={s.arc()}
          cx="16"
          cy="16"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 16 16)"
        />
      </svg>
    </span>
  );
}
