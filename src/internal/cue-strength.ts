// 続きの印（内側の影）が最も濃くなるまでのスクロールの量（px）— adr/0037
// 上下（シート・浮かぶ選択肢・useMoreCues）も左右（useInlineCues）も、同じ量で濃くする
const CUE_RAMP = 24;

/** 端までの残りのスクロールの量（px）を、続きの印の濃さ（0〜1。CSS 変数に書く文字）にする */
export function cueStrength(distance: number) {
  return String(Math.min(1, distance / CUE_RAMP));
}
