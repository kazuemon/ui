import { toMilliseconds } from './zoom-geometry';
import { prefersReducedMotion } from './zoom-motion';

// 拡大した面で、前後の画像へ送るときの動き（Gallery）。長さ・緩急・動き方はトークン（--gallery-slide-*）から読む
//   前の画像（leaving）は送る向きの反対へ出ていき、次の画像（box）は送る向きから入ってくる
//   distance: 動く距離。1 は画面の外まで（幅いっぱいに滑る）、0 はその場。途中の値は、その割合だけ滑る
//   fade: 1 は濃さも変える（出ていく画像は消え、入ってくる画像は現れる）、0 は濃さを変えない
//   duration が 0 のときと、動きを減らす設定では、動かさずにすぐ入れ替える（原則14）
// 指で横に引いたあとは、引いた位置から続けて動かす（出ていく画像の、いまの translate から始める）

export interface SlideMotion {
  distance: number;
  fade: number;
  duration: number;
  easing: string;
}

export function readSlideMotion(el: HTMLElement): SlideMotion {
  const style = getComputedStyle(el);
  const read = (name: string) => style.getPropertyValue(name).trim();
  const number = (name: string, fallback: number) => {
    const value = Number(read(name));
    return read(name) !== '' && Number.isFinite(value) ? value : fallback;
  };
  return {
    distance: number('--gallery-slide-distance', 0),
    fade: number('--gallery-slide-fade', 1),
    duration: toMilliseconds(read('--gallery-slide-duration'), 0),
    easing: read('--gallery-slide-ease') || 'ease-out',
  };
}

/** 動かすか。動きを減らす設定と、長さが 0 のときは動かさない */
export function slides(motion: SlideMotion) {
  return motion.duration > 0 && !prefersReducedMotion();
}

/** いまの translate の横の値（px）。指で引いた分や、動いている途中の位置 */
export function translateX(el: HTMLElement) {
  const value = getComputedStyle(el).translate;
  if (!value || value === 'none') return 0;
  return parseFloat(value) || 0;
}

/**
 * 送る動き。leaving（前の画像の枠。呼ぶ側が面に置き直したもの）を出し、box（次の画像の枠）を入れる
 * stageWidth は面の幅。distance が 1 のとき、画像が面の外に出きる距離を測るのに使う
 */
export function playSlide({
  leaving,
  box,
  extras,
  direction,
  from,
  stageWidth,
  motion,
}: {
  leaving: HTMLElement;
  box: HTMLElement;
  /** 入ってくる画像と一緒に、濃さだけで現れるもの（キャプション。滑らせると、文の入れ替わりが読みにくい） */
  extras: HTMLElement[];
  direction: -1 | 1;
  /** 出ていく画像の、いまの横の位置（指で引いた分） */
  from: number;
  stageWidth: number;
  motion: SlideMotion;
}) {
  const { distance, fade, duration, easing } = motion;
  const options: KeyframeAnimationOptions = { duration, easing, fill: 'both' };
  // 面の外まで: 面の半分と画像の半分（大きいほう）に、少し余白を足す
  const away =
    stageWidth / 2 + Math.max(leaving.offsetWidth, box.offsetWidth) / 2 + stageWidth * 0.04;
  const shift = away * distance;
  const fadeTo = 1 - fade;
  const leavingOpacity = Number(getComputedStyle(leaving).opacity) || 1;
  // 幅いっぱいに滑るときは、2 枚が並んだまま動く（入ってくる画像も、引いた分だけ近づいた位置から）
  const incomingFrom = direction * shift + (distance >= 1 ? from : 0);
  return [
    leaving.animate(
      [
        { translate: `${from}px 0`, opacity: leavingOpacity },
        { translate: `${from - direction * shift}px 0`, opacity: fadeTo },
      ],
      options
    ),
    box.animate(
      [
        { translate: `${incomingFrom}px 0`, opacity: fadeTo },
        { translate: '0px 0', opacity: 1 },
      ],
      { ...options, fill: 'backwards' }
    ),
    ...extras.map((el) =>
      el.animate([{ opacity: 0 }, { opacity: 1 }], { ...options, fill: 'backwards' })
    ),
  ];
}
