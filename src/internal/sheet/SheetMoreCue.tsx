/**
 * シートで、中身の上下に続きがあることの見せ方。下の端はどれも内側の影
 * shadow: 上も内側の影。divider: 上は区切り線（スクロールすると出る）
 * divider-always: 上は区切り線（いつも出す）。divider-shadow: 上は区切り線と内側の影（スクロールすると出る）
 * divider-always-shadow: 上は区切り線（いつも出す）と内側の影（スクロールすると出る）
 */
export type SheetMoreCue =
  | 'shadow'
  | 'divider'
  | 'divider-always'
  | 'divider-shadow'
  | 'divider-always-shadow';

interface SheetMoreCueProps {
  edge: 'top' | 'bottom';
  /** シートか。浮かぶ面は見出しがないので、上も影だけ */
  sheet: boolean;
  sheetMoreCue: SheetMoreCue;
  /**
   * 区切り線を出す条件を、sheetMoreCue の代わりに決める（Drawer などのシート）
   * scrollable: 中身がスクロールできるあいだいつも出す。shadow: 影が出ているあいだ出す（下の端にも引く）
   */
  divider?: 'scrollable' | 'shadow';
}

// 中身が長いとき、上下に続きがあることを見せる印 — adr/0037
// 濃さはスクロールした量に合わせる（--cue-top・--cue-bottom。useMoreCues）
//   下の端はどれも内側の影（--color-sheet-edge-shadow）。上の端は、shadow: 内側の影、divider: 区切り線
//   divider-always: いつも出す区切り線、divider-shadow: 区切り線と内側の影
//   区切り線はシートの幅いっぱいに引き（面の内側の余白 --sheet-inset の分だけ外へ出す）、影はスクロールバーの手前で止める
export function SheetMoreCue({
  edge,
  sheet,
  sheetMoreCue,
  divider: dividerWhen,
}: SheetMoreCueProps) {
  const top = edge === 'top';
  const level = top ? 'var(--cue-top, 0)' : 'var(--cue-bottom, 0)';
  const shadow =
    !top ||
    !sheet ||
    sheetMoreCue === 'shadow' ||
    sheetMoreCue === 'divider-shadow' ||
    sheetMoreCue === 'divider-always-shadow';
  const divider = dividerWhen ? sheet : sheet && top && sheetMoreCue !== 'shadow';
  const dividerAlways =
    sheetMoreCue === 'divider-always' || sheetMoreCue === 'divider-always-shadow';
  // 区切り線の濃さ。影が出ているあいだは、影が淡くても線ははっきり出す
  const dividerOpacity =
    dividerWhen === 'scrollable'
      ? 'var(--cue-scrollable, 0)'
      : dividerWhen === 'shadow'
        ? `clamp(0, calc(${level} * 100), 1)`
        : dividerAlways
          ? 1
          : level;
  return (
    <div
      aria-hidden
      className={['pointer-events-none relative z-1 h-3 shrink-0', top ? '-mb-3' : '-mt-3'].join(
        ' '
      )}
    >
      {shadow && (
        <div
          className={[
            'absolute inset-y-0 right-[var(--cue-right,0px)] left-[var(--cue-left,0px)] from-(color:--color-sheet-edge-shadow) to-transparent',
            top ? 'bg-linear-to-b' : 'bg-linear-to-t',
          ].join(' ')}
          style={{ opacity: level }}
        />
      )}
      {divider && (
        <div
          className={[
            'absolute right-[calc(var(--sheet-inset,0px)*-1)] left-[calc(var(--sheet-inset,0px)*-1)] h-px bg-surface-line',
            top ? 'top-0' : 'bottom-0',
          ].join(' ')}
          style={{ opacity: dividerOpacity }}
        />
      )}
    </div>
  );
}
