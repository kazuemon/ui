// 外を押して閉じる合図（ADR-0251 の dismissible）。Base UI の Select・Combobox には
// disablePointerDismissal がないので、閉じる合図の理由を見て取り消す
// modal でないときにフォーカスが外へ出て閉じるのも、外を押して閉じるのと同じ扱いにする（Dialog の dismissible と同じ）
export const OUTSIDE_REASONS = new Set<string>(['outside-press', 'focus-out']);
