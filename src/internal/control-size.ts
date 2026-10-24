// 部品の大きさの段 size="sm" の差し替え（軸 461）。Button と、枠線のリンク（Link の variant="outline"）が使う
//   密度の寸法（高さ・左右の余白・文字・アイコン）を、自分の中だけ小さい段に差し替える。値は design/tokens.css の *-sm
export const controlSizeSm = [
  '[--spacing-control:var(--spacing-control-sm)]',
  '[--spacing-control-x:var(--spacing-control-x-sm)] [--spacing-icon:var(--spacing-icon-sm)]',
  '[--leading-control:var(--leading-control-sm)] [--text-control:var(--text-control-sm)]',
];
