import { flipFrame, restFrame, toMilliseconds } from './zoom-geometry';

// 拡大と縮小の動き。長さ・緩急・動き方はトークン（--image-zoom-*）から読み、Web Animations で動かす
//   expand: 元の位置の画像から広がり、閉じると元の位置へ戻る（原則14「ものがどこから来てどこへ行ったか」）
//     元の位置の画像は、開いているあいだ隠す（画像がそこから移ったように見せる）
//     元の位置が見えない（大きさがない）ときは fade で出す
//   fade: その場で、濃さと少し小さい姿から出る（浮かぶ面・Transition の scale と同じ形）
// 後ろの面・閉じる × は、どちらの形でも濃さだけを変える
// キャプションは、ページのものと拡大した面のものが同時に見えないようにする
//   ページのキャプションは、開いているあいだ消したまま（後ろの面から透けて二重に見えないように。呼ぶ側が style で持つ）
//   出方は 2 つ（captionMotion）。書かないときは画像の動きに従う（expand なら move、fade なら fade）。どちらの画像の動きとも組み合わせられる
//   move（ページのキャプションが見えるとき）: 拡大した面のキャプションが、ページのキャプションの位置から自分の位置へ移る（閉じると戻る）
//     画像と同じ長さ・緩急で動かし、画像の下についていくように見せる。動かすのは位置（translate）と色だけ
//     文字の大きさは同じ（どちらも注記の大きさ）なので縮めない。縮めると文字がにじむ
//     折り返しは行き先（拡大した面）のものに固定し、動いているあいだは変えない。ページと行の数が違うときは、
//     動きの始め（閉じるときは終わり）の入れ替わりの瞬間だけ折り返しが変わる。重ねる位置は、横は中央・縦は上端でそろえる
//   fade と、ページのキャプションが見えないとき: 時間をずらして入れ替える
//     開く: ページのキャプションは始めの 3 割で消え、拡大した面のキャプションは終わりの 4 割で出る
//     閉じる: 拡大した面のキャプションは始めの 3 割で消え、ページのキャプションは終わりの 4 割で出る
// 動きを減らす設定では、呼ぶ側が動かさずにすぐ出す・消す（原則14）

export type ZoomMotion = 'expand' | 'fade';
export type CaptionMotion = 'move' | 'fade';

export interface ZoomTargets {
  /** 拡大した画像の枠 */
  box: HTMLElement;
  /** 濃さだけを変えるもの（後ろの面・閉じる ×） */
  fades: HTMLElement[];
  /** 元の位置の画像 */
  origin: HTMLElement | null;
  /** 拡大した面のキャプション */
  caption?: HTMLElement | null;
  /** ページ（元の位置）のキャプション */
  originCaption?: HTMLElement | null;
  /** キャプションの出方。書かないときは画像の動きに従う */
  captionMotion?: CaptionMotion;
}

// キャプションの入れ替え（時間に対して線形に。緩急を掛けると、消える・出る時点がずれて重なる）
const CAPTION_OUT_END = 0.3;
const CAPTION_IN_START = 0.6;
const captionOut = (from: number): Keyframe[] => [
  { opacity: from, offset: 0 },
  { opacity: 0, offset: CAPTION_OUT_END },
  { opacity: 0, offset: 1 },
];
const captionIn = (to: number): Keyframe[] => [
  { opacity: 0, offset: 0 },
  { opacity: 0, offset: CAPTION_IN_START },
  { opacity: to, offset: 1 },
];

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function readZoomMotion(el: HTMLElement): {
  motion: ZoomMotion;
  durationIn: number;
  durationOut: number;
  easing: string;
  fadeScale: number;
} {
  const style = getComputedStyle(el);
  const read = (name: string) => style.getPropertyValue(name).trim();
  return {
    motion: read('--image-zoom-motion') === 'fade' ? 'fade' : 'expand',
    durationIn: toMilliseconds(read('--image-zoom-duration-in'), 250),
    durationOut: toMilliseconds(read('--image-zoom-duration-out'), 200),
    easing: read('--image-zoom-ease') || 'ease-out',
    fadeScale: Number(read('--image-zoom-fade-scale')) || 0.96,
  };
}

/** 元の位置の画像が画面に描かれているか（大きさがあるか） */
export function visibleRect(el: HTMLElement | null) {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? rect : null;
}

const radiusOf = (el: HTMLElement) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;

/** 指で引いてずらした縦の距離（style.translate の 2 つ目の値） */
function draggedY(box: HTMLElement) {
  const [, y] = box.style.translate.split(' ');
  return parseFloat(y ?? '') || 0;
}

/**
 * 開く・閉じる動きを始め、動かした Animation を返す。閉じる動きは終わった姿のまま止める（呼ぶ側が面を消す）
 * 開く動きは、終わるとトークンの見た目（CSS）に戻る
 */
export function playZoom(
  direction: 'in' | 'out',
  { box, fades, origin, caption, originCaption, captionMotion }: ZoomTargets
) {
  const { motion, durationIn, durationOut, easing, fadeScale } = readZoomMotion(box);
  const duration = direction === 'in' ? durationIn : durationOut;
  const fill: FillMode = direction === 'in' ? 'backwards' : 'forwards';
  const options = { duration, easing, fill };
  const dy = direction === 'out' ? draggedY(box) : 0;
  const animations: Animation[] = [];

  // 後ろの面などは、濃さだけを変える。閉じるときは、いまの濃さ（引いているあいだに薄くした分）から
  // 開くときの行き先は、その要素のふだんの濃さ（キーボードで来たときだけ見せる × は 0 のまま）
  for (const el of fades) {
    const current = Number(getComputedStyle(el).opacity);
    el.style.opacity = '';
    const keyframes =
      direction === 'in'
        ? [{ opacity: 0 }, { opacity: current }]
        : [{ opacity: current }, { opacity: 0 }];
    animations.push(el.animate(keyframes, options));
  }

  const originRect = motion === 'expand' ? visibleRect(origin) : null;

  // キャプション。move のときは、1 つのキャプションがページの位置から移る
  const captionMoves = (captionMotion ?? (motion === 'expand' ? 'move' : 'fade')) === 'move';
  const originCaptionRect = captionMoves ? visibleRect(originCaption ?? null) : null;
  if (caption && originCaption && originCaptionRect) {
    const shown = Number(getComputedStyle(caption).opacity);
    caption.style.opacity = '';
    const here = caption.getBoundingClientRect();
    const page = getComputedStyle(originCaption);
    const away = {
      translate: `${originCaptionRect.left + originCaptionRect.width / 2 - (here.left + here.width / 2)}px ${originCaptionRect.top - here.top}px`,
      color: page.color,
      opacity: 1,
    };
    const home = { translate: '0px 0px', color: getComputedStyle(caption).color, opacity: 1 };
    animations.push(
      caption.animate(
        direction === 'in' ? [away, home] : [{ ...home, opacity: shown }, away],
        options
      )
    );
  }
  // 入れ替え。ページのキャプションは、開いたあとも消したまま（閉じ終わるまで forwards で持つ）
  const linear = { duration, easing: 'linear' };
  if (caption && !originCaptionRect) {
    const shown = Number(getComputedStyle(caption).opacity);
    caption.style.opacity = '';
    animations.push(
      caption.animate(direction === 'in' ? captionIn(1) : captionOut(shown), {
        ...linear,
        fill,
      })
    );
  }
  if (originCaption && !originCaptionRect) {
    animations.push(
      originCaption.animate(direction === 'in' ? captionOut(1) : captionIn(1), {
        ...linear,
        fill: 'forwards',
      })
    );
  }

  if (originRect && origin) {
    const radius = radiusOf(box);
    // 引いてずらした分を除いた、拡大した画像の位置
    const current = box.getBoundingClientRect();
    const rest = {
      left: current.left,
      top: current.top - dy,
      width: current.width,
      height: current.height,
    };
    const from = flipFrame(originRect, rest, radiusOf(origin));
    const to = restFrame(radius, dy);
    box.style.translate = '';
    animations.push(box.animate(direction === 'in' ? [from, to] : [to, from], options));
  } else {
    const hidden = {
      opacity: 0,
      transform: `translate(0px, ${dy}px) scale(${fadeScale})`,
    };
    const shown = { opacity: 1, transform: `translate(0px, ${dy}px) scale(1)` };
    box.style.translate = '';
    animations.push(box.animate(direction === 'in' ? [hidden, shown] : [shown, hidden], options));
  }
  return animations;
}

/** 開いているあいだ、元の位置の画像を隠すか（元の位置から広がる形で、動かすときだけ）。読み上げから外さないよう、濃さで隠す */
export function hidesOrigin(box: HTMLElement, origin: HTMLElement | null) {
  return (
    !prefersReducedMotion() &&
    readZoomMotion(box).motion === 'expand' &&
    visibleRect(origin) !== null
  );
}
