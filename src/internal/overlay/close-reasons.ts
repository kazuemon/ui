// 重なる面（Dialog・Drawer）が閉じる合図のうち、Esc で閉じない設定（closeOnEscape={false}）のときに取り消すもの
// Esc と、Android の戻る操作（Base UI の close-watcher）
export const ESCAPE_REASONS = new Set<string>(['escape-key', 'close-watcher']);
