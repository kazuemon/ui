/**
 * シートで、選択肢の上下に続きがあることの見せ方。下の端はどれも内側の影
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

interface SelectMoreCueProps {
  edge: 'top' | 'bottom';
  sheet: boolean;
  sheetMoreCue: SheetMoreCue;
}

// 選択肢が長いとき、上下に続きがあることを見せる印（sheetMoreCue）。濃さはスクロールした量に合わせる（usePopupLayout の updateCues）
//   下の端はどれも内側の影（--color-select-sheet-edge-shadow）。上の端は、shadow: 内側の影、divider: 区切り線
//   divider-always: いつも出す区切り線、divider-shadow: 区切り線と内側の影
//   区切り線はシートの幅いっぱいに引き、影はスクロールバーの手前で止める
export function SelectMoreCue({ edge, sheet, sheetMoreCue }: SelectMoreCueProps) {
  const top = edge === 'top';
  const level = top ? 'var(--cue-top, 0)' : 'var(--cue-bottom, 0)';
  // 浮かぶ選択肢は見出しがないので、上も影だけ
  const shadow =
    !top ||
    !sheet ||
    sheetMoreCue === 'shadow' ||
    sheetMoreCue === 'divider-shadow' ||
    sheetMoreCue === 'divider-always-shadow';
  const divider = sheet && top && sheetMoreCue !== 'shadow';
  const dividerAlways =
    sheetMoreCue === 'divider-always' || sheetMoreCue === 'divider-always-shadow';
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
            'absolute inset-y-0 right-[var(--cue-right,0px)] left-[var(--cue-left,0px)] from-(color:--color-select-sheet-edge-shadow) to-transparent',
            top ? 'bg-linear-to-b' : 'bg-linear-to-t',
          ].join(' ')}
          style={{ opacity: level }}
        />
      )}
      {divider && (
        <div
          className="absolute -inset-x-(--select-popup-padding) top-0 h-px bg-surface-line"
          style={{ opacity: dividerAlways ? 1 : level }}
        />
      )}
    </div>
  );
}
