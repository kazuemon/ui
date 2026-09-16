// 浮かぶ選択肢とシートの寸法の計算と、つまみを引く操作のしきい値。DOM を読むが、状態は持たない

// シートの高さの上限と、半分で開くときの目安（画面の高さに対する割合）
export const SHEET_FULL = 0.85;
export const SHEET_HALF = 0.5;
// シートのつまみを引く操作のしきい値。値は実機で詰める
// iOS・Android のシートと、vaul・Base UI の Drawer にならい、離す直前の速さで「はじいた」かを見る
//   flingVelocity: はじいたとみなす速さ（px/ms）。Base UI の Drawer は 0.5、vaul は 0.4、Android は 500px/s
//   velocityWindow: 離す直前のこの時間（ms）の動きから速さを出す。それより前から止まっていたら、はじいていない（Base UI は 80ms）
//   minVelocityDuration: 速さを出すときの時間の下限（ms）。動きの記録が1つしかないときに、速さが大きくなりすぎないようにする（Base UI は 16ms）
//   closeRatio: はじかずに離したとき、半分の高さのこの割合より低ければ閉じる
//   moveSlop: 動いた量がこれ以下（px）なら、引かずに押したとみなす
export const SHEET_DRAG = {
  flingVelocity: 0.5,
  velocityWindow: 80,
  minVelocityDuration: 16,
  closeRatio: 0.6,
  moveSlop: 4,
} as const;
// 続きの印が最も濃くなるまでのスクロールの量（px）
export const CUE_RAMP = 24;
// 浮かぶ選択肢の高さの上限（画面の高さに対する割合）。popoverMaxHeight="screen" のとき
export const POPOVER_MAX = 0.5;

// 画面の高さ。浮かぶ部分を描く場所（container）が画面より低いときは、その高さ（比較のストーリーの枠）
export function screenHeight(container: HTMLElement | null | undefined) {
  return Math.min(container?.clientHeight ?? Infinity, window.innerHeight);
}

// 選択肢の各項目の高さ。note のある項目は高いので、項目ごとに測る（design/adr/0044）。隠れた項目（高さ 0）は数えない
export function optionHeights(list: HTMLElement, fallback: number) {
  const heights = [...list.querySelectorAll<HTMLElement>('[role="option"]')]
    .map((el) => el.offsetHeight)
    .filter((height) => height > 0);
  return heights.length ? heights : [fallback];
}

// 項目 rows 個分の高さ（小数のときは、最後の項目のその割合）。項目が足りないときは、最後の項目の高さで数える
export function rowsLength(heights: number[], rows: number) {
  if (!Number.isFinite(rows)) return Infinity;
  const at = (i: number) => heights[Math.min(i, heights.length - 1)];
  const whole = Math.floor(rows);
  let length = 0;
  for (let i = 0; i < whole; i += 1) length += at(i);
  return length + (rows - whole) * at(whole);
}

// 高さ avail の中に入る項目を上から数え、次の項目を半分だけ見せる高さを返す（「まだ続きがある」ことを見せる）
// halfInside: true は、半分の項目まで avail に収める（浮かぶ選択肢）。false は、収まる項目のあとに半分を足す（シート）
// 少なくとも1項目は出す。項目の高さがすべて同じときは、これまでの計算（（項目の数 ＋ 0.5）× 高さ）と同じになる
export function peekLength(heights: number[], avail: number, halfInside: boolean) {
  const at = (i: number) => heights[Math.min(i, heights.length - 1)];
  let rows = 1;
  let used = at(0);
  while (used + at(rows) + (halfInside ? at(rows + 1) / 2 : 0) <= avail) {
    used += at(rows);
    rows += 1;
  }
  return used + at(rows) / 2;
}

// 一覧の中身の高さ（項目の高さの合計＋上下の余白）。scrollHeight は一覧が引き伸ばされると中身より大きくなるので使わない
export function listContentLength(list: HTMLElement) {
  const style = getComputedStyle(list);
  let length = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  for (const el of list.querySelectorAll<HTMLElement>('[role="option"]')) length += el.offsetHeight;
  return length;
}

// 一覧の下に置いた「読み込んでいます」の行の高さ（下の余白を含む）。高さの上限の計算に入れる（design/adr/0042）
export function loadingRowLength(list: HTMLElement) {
  const row = list.parentElement?.querySelector<HTMLElement>('[data-slot="select-loading"]');
  if (!row) return 0;
  return row.offsetHeight + parseFloat(getComputedStyle(row).marginBottom);
}

export interface DragSample {
  y: number;
  t: number;
}

// 離したときの縦の速さ（px/ms。下向きが正）。離す直前 velocityWindow の間の動きから出す
export function releaseVelocity(samples: DragSample[], y: number, t: number) {
  const first = samples.find((sample) => t - sample.t <= SHEET_DRAG.velocityWindow);
  if (!first) return 0;
  return (y - first.y) / Math.max(t - first.t, SHEET_DRAG.minVelocityDuration);
}
