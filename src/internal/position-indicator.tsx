import { tv } from './tv';

// いまどの 1 枚かの印（点と「3 / 5」）。Carousel と Gallery が共有する。見るためのもので、読み上げには出さない
//   （読み上げは、それぞれの部品の知らせの箱が「3 / 5」を 1 回だけ伝える — 原則15）
//   点: 1 枚に 1 つ並べ、いまの 1 枚の点を横に伸ばして濃くする（原則5 の小物は pill。原則14: 場所を移る印は滑らせる）
//     形と間は --carousel-dot-*（tokens.css の Carousel の節）。色は置く部品が --position-dot-color・--position-dot-current-color で
//     差し替えられる（Gallery は、明るい面と暗い面の両方で見えるよう、文字の色から作る）。書かないときは Carousel の色
//   数: いまの数を太字・本文の色、「/ 全体」をグレーにする（Pagination のいちばん狭い形と同じ）。文字の大きさは置く場所から受け継ぐ
//     色と太さと並べ方は --position-count-current-color・--position-count-total-color・--position-count-current-weight・--position-count-display で差し替えられる

const styles = tv({
  slots: {
    dots: 'flex items-center gap-(--carousel-dot-gap)',
    dot: [
      'h-(--carousel-dot-size) w-(--carousel-dot-size) shrink-0 rounded-pill',
      'bg-[color:var(--position-dot-color,var(--carousel-dot-color))]',
      'data-current:w-(--carousel-dot-current-width) data-current:bg-[color:var(--position-dot-current-color,var(--carousel-dot-current-color))]',
      'transition-[width,background-color] duration-(--duration-normal) ease-(--ease-press) motion-reduce:transition-none',
    ],
    // 並べ方は --position-count-display で差し替えられる（inline にすると、間は gap ではなく文字の空白になる。Gallery）
    count:
      '[display:var(--position-count-display,inline-flex)] items-center gap-(--carousel-count-gap) whitespace-nowrap tabular-nums',
    countCurrent:
      '[font-weight:var(--position-count-current-weight,var(--font-weight-bold))] text-[color:var(--position-count-current-color,var(--color-fg))]',
    countTotal: 'text-[color:var(--position-count-total-color,var(--color-fg-muted))]',
  },
});

interface PositionProps {
  /** いまの 1 枚（0 から） */
  index: number;
  /** 全体の数 */
  count: number;
  /** いちばん外の要素に付く */
  className?: string;
  /** いちばん外の要素の data-slot */
  slot?: string;
}

/** 点。いまの 1 枚の点を横に伸ばして濃くする */
export function PositionDots({ index, count, className, slot }: PositionProps) {
  const s = styles();
  return (
    <div aria-hidden className={s.dots({ className })} data-slot={slot}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={s.dot()} data-current={i === index || undefined} />
      ))}
    </div>
  );
}

/** 「3 / 5」 */
export function PositionCount({ index, count, className, slot }: PositionProps) {
  const s = styles();
  return (
    <div aria-hidden className={s.count({ className })} data-slot={slot}>
      <span className={s.countCurrent()}>{index + 1}</span>
      {/* 並べて見せるあいだは、間を gap で取る（空白は flex が捨てる）。文字としては「3 / 5」と読めるよう、空白を置く */}{' '}
      <span className={s.countTotal()}>/ {count}</span>
    </div>
  );
}
