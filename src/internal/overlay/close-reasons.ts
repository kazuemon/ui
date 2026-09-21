// 重なる面（Dialog・Drawer・Popover・Menu）が閉じる合図のうち、設定で取り消すもの

// Esc で閉じない設定（closeOnEscape={false}）のときに取り消すもの
// Esc と、Android の戻る操作（Base UI の close-watcher）
export const ESCAPE_REASONS = new Set<string>(['escape-key', 'close-watcher']);

// 外を押して閉じない設定（dismissible={false}・modal="passive"）のときに取り消すもの
// 外の押下と、裏を止めない面でフォーカスが外へ出たとき（Base UI の disablePointerDismissal と同じ組）
export const DISMISS_REASONS = new Set<string>(['outside-press', 'focus-out']);
