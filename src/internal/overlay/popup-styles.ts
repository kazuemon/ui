// 浮かぶ面（Popover・Tooltip）の見た目。Select の浮かぶ選択肢と同じ作り — adr/0036・ADR-0054
//   面: 白・細い輪郭（重なりを表す影は部品が足す — 原則1）。角は浮かぶ面なので部品の角（原則5）
//   開閉: 本体の側に --popup-shift 寄った位置から、濃さと一緒に滑る。向きは出た側（data-side）で決める
//   動きを減らす設定では動かさず、すぐに出す・消す（原則3）
export const popupSurfaceClass =
  'rounded-control border-(length:--border-width-thin) border-surface-line bg-surface text-fg outline-none';

export const popupMotionClass = [
  'transition-[opacity,translate] duration-(--popup-duration-in) ease-(--popup-ease) data-ending-style:duration-(--popup-duration-out)',
  'data-ending-style:opacity-0 data-starting-style:opacity-0',
  'data-[side=bottom]:data-ending-style:[translate:0_calc(var(--popup-shift)*-1)] data-[side=bottom]:data-starting-style:[translate:0_calc(var(--popup-shift)*-1)]',
  'data-[side=top]:data-ending-style:[translate:0_var(--popup-shift)] data-[side=top]:data-starting-style:[translate:0_var(--popup-shift)]',
  'data-[side=left]:data-ending-style:[translate:var(--popup-shift)_0] data-[side=left]:data-starting-style:[translate:var(--popup-shift)_0]',
  'data-[side=right]:data-ending-style:[translate:calc(var(--popup-shift)*-1)_0] data-[side=right]:data-starting-style:[translate:calc(var(--popup-shift)*-1)_0]',
  'motion-reduce:[transition:none]',
].join(' ');

/**
 * 浮かぶ面と本体の間を、tokens.css の長さから px で読む。Base UI の sideOffset は数で受け取るため
 * calc() のままの値もあるので、見えない要素の幅にして測る。基準は浮かぶ面を描く場所（密度で値が変わらない長さに使う）
 */
export function readTokenLength(name: string) {
  if (typeof document === 'undefined') return 0;
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;width:var(${name})`;
  document.body.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
}
