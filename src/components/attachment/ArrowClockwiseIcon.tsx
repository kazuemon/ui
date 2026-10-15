// 時計回りの矢印（Phosphor の ArrowClockwise）。Attachment の「もう一度送る」ボタンに置く
// 形と線の太さは src/internal/icons.tsx と同じ決まり（アイコンだけのボタンなので Bold の線幅）。
// 2 つ目の部品が使うようになったら src/internal/icons.tsx へ移す
export const ArrowClockwiseIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-(--spacing-icon) shrink-0"
    style={{ strokeWidth: 'var(--icon-stroke-standalone)' }}
  >
    <polyline points="184 104 232 104 232 56" />
    <path d="M188.4,192a88,88,0,1,1,1.83-126.23L232,104" />
  </svg>
);
