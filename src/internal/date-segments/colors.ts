/** 区切りの欄の色。Select の color と同じ名前・同じ意味（neutral は色を持たない） */
export type DateSegmentColor = 'neutral' | 'primary' | 'secondary';

// 欄の本体（FieldBox）に置くクラス（軸 172）
// いま打っている区切りの塗り: neutral はグレー（--date-segment-focus-bg の既定）、primary・secondary はその色の淡い塗り
// --color-own-focus: フォーカスの枠線を部品の色に従わせるとき（--focus-follow-color: 1 — ADR-0071 の M）の色。Select の OWN_FOCUS と同じ値。neutral は置かない
export const dateSegmentColorClass: Record<DateSegmentColor, string> = {
  neutral: '',
  primary:
    '[--date-segment-focus-bg:var(--date-segment-focus-bg-primary)] [--color-own-focus:var(--color-primary)]',
  secondary:
    '[--date-segment-focus-bg:var(--date-segment-focus-bg-secondary)] [--color-own-focus:var(--color-fg-secondary)]',
};
