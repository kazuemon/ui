// 拡大した画像の大きさと、元の位置から広がる動き（FLIP）の計算。DOM を読んだ値を受け取って数を返すだけ

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Size {
  left: number;
  top: number;
}

/**
 * 拡大したときの画像の大きさ。画像の比のまま、使える広さ（avail）に収める
 * limit を渡すと、それより大きくしない（画像本来の大きさを超えて引き伸ばさない）。
 * ただし元の位置に見えていた大きさ（shown）よりは小さくしない。押して小さくなると、拡大にならないため
 */
export function fitSize(image: Size, avail: Size, limit?: Size, shown?: Size): Size {
  if (image.width <= 0 || image.height <= 0 || avail.width <= 0 || avail.height <= 0) {
    return { width: 0, height: 0 };
  }
  let scale = Math.min(avail.width / image.width, avail.height / image.height);
  if (limit && limit.width > 0) {
    const floor = shown ? Math.max(shown.width / image.width, shown.height / image.height) : 0;
    scale = Math.min(scale, Math.max(limit.width / image.width, floor));
  }
  return { width: image.width * scale, height: image.height * scale };
}

/**
 * 拡大した画像（box）を、元の位置の画像（origin）に重ねて見せる変形と切り抜き
 *   box は画像の比のまま拡大した枠。origin は元の位置で見えている範囲（ratio で切り取っていれば切り取った範囲）
 *   box を origin を覆う大きさまで縮め（cover）、はみ出た分を clip-path で切ると、元の位置の見え方とそろう
 *   角は、縮めた分だけ大きくして、縮めたあとに元の角と同じに見えるようにする
 * dy は、指で引いているあいだにずらした縦の距離（閉じる動きをそこから始める）
 */
export function flipFrame(origin: Rect, box: Rect, originRadius: number) {
  const scale = Math.max(origin.width / box.width, origin.height / box.height);
  const dx = origin.left + origin.width / 2 - (box.left + box.width / 2);
  const dy = origin.top + origin.height / 2 - (box.top + box.height / 2);
  const insetX = Math.max(0, (box.width - origin.width / scale) / 2);
  const insetY = Math.max(0, (box.height - origin.height / scale) / 2);
  return {
    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
    clipPath: `inset(${insetY}px ${insetX}px round ${originRadius / scale}px)`,
  };
}

/** 拡大し終えた姿。dy は指で引いてずらした距離 */
export function restFrame(radius: number, dy = 0) {
  return {
    transform: `translate(0px, ${dy}px) scale(1)`,
    clipPath: `inset(0px 0px round ${radius}px)`,
  };
}

/** トークンの長さ（250ms・0.25s）をミリ秒に直す */
export function toMilliseconds(value: string, fallback: number) {
  const match = value.trim().match(/^(-?[\d.]+)(ms|s)$/);
  if (!match) return fallback;
  const n = Number(match[1]);
  return match[2] === 's' ? n * 1000 : n;
}
