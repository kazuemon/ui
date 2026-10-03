// チェック（✓）と中間の横線。Checkbox と DataTable の選択の箱が使う
// 線の太さは画面の px（--border-width-thick）で、箱の大きさによらない
// 箱（group/box）が中間の状態（data-indeterminate）のときは横線、それ以外はチェックを出す
export function CheckboxMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-full"
      style={{ strokeWidth: 'var(--border-width-thick)' }}
    >
      <polyline
        points="4 8.5 6.75 11.25 12 5.5"
        vectorEffect="non-scaling-stroke"
        className="group-data-indeterminate/box:hidden"
      />
      <line
        x1="4.5"
        y1="8"
        x2="11.5"
        y2="8"
        vectorEffect="non-scaling-stroke"
        className="hidden group-data-indeterminate/box:inline"
      />
    </svg>
  );
}
