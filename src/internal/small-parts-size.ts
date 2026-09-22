// 小物（Tag・Badge・Chip）の大きさの 1 本の軸 — ADR-0259
//   sm: 今の Tag（高さ 20px・左右 8px・キャプションの文字）。Tag・Badge の既定
//   md: 今の欄の中のチップ（部品の高さ − 12px・左右 8px・部品の中の文字）。Chip の既定
//   lg: 部品の高さ（今の単体 Chip。左右は部品の左右の余白）
//   inherit: 段を持たず、周りの文字の大きさに従う（em）。Prose の中などで使う
//
// クラスは、値ごとに 1 本の文字列として書きます（Tailwind はソースのテキストをそのまま読むので、
// テンプレート文字列の組み立てでは見つけられません。tv() の他の variants と同じく、ここも完成した文字列で持ちます）

export type SmallPartsSize = 'sm' | 'md' | 'lg' | 'inherit';

/** Tag の tv の size 変化に渡すクラス */
export const tagSizeClass: Record<SmallPartsSize, string> = {
  sm: '[--tag-height:20px] [--tag-pad-x:calc(var(--spacing)_*_2)] [--tag-font:var(--text-caption)] [--tag-leading:var(--leading-caption)]',
  md: '[--tag-height:calc(var(--spacing-control)_-_var(--spacing)_*_3)] [--tag-pad-x:calc(var(--spacing)_*_2)] [--tag-font:var(--text-control)] [--tag-leading:var(--leading-control)]',
  lg: '[--tag-height:var(--spacing-control)] [--tag-pad-x:var(--spacing-control-x)] [--tag-font:var(--text-control)] [--tag-leading:var(--leading-control)]',
  inherit:
    '[--tag-height:1.6667em] [--tag-pad-x:0.6667em] [--tag-font:0.75em] [--tag-leading:1.3334em]',
};

/** Chip の tv の size 変化に渡すクラス */
export const chipSizeClass: Record<SmallPartsSize, string> = {
  sm: '[--chip-height:20px] [--chip-pad-x:calc(var(--spacing)_*_2)] [--chip-font:var(--text-caption)] [--chip-leading:var(--leading-caption)]',
  md: '[--chip-height:calc(var(--spacing-control)_-_var(--spacing)_*_3)] [--chip-pad-x:calc(var(--spacing)_*_2)] [--chip-font:var(--text-control)] [--chip-leading:var(--leading-control)]',
  lg: '[--chip-height:var(--spacing-control)] [--chip-pad-x:var(--spacing-control-x)] [--chip-font:var(--text-control)] [--chip-leading:var(--leading-control)]',
  inherit: '[--chip-height:2em] [--chip-pad-x:0.5em] [--chip-font:1em] [--chip-leading:1.5em]',
};

/** Badge の tv の size 変化に渡すクラス */
export const badgeSizeClass: Record<SmallPartsSize, string> = {
  sm: '[--badge-size:16px] [--badge-dot:8px] [--badge-pad-x:var(--spacing)] [--badge-font:var(--text-caption)]',
  md: '[--badge-size:20px] [--badge-dot:10px] [--badge-pad-x:calc(var(--spacing)_*_1.5)] [--badge-font:var(--text-caption)]',
  lg: '[--badge-size:24px] [--badge-dot:12px] [--badge-pad-x:calc(var(--spacing)_*_2)] [--badge-font:14px]',
  inherit:
    '[--badge-size:1.3334em] [--badge-dot:0.5em] [--badge-pad-x:0.3334em] [--badge-font:0.75em]',
};

/**
 * Chip の高さの生の値（sm・md・lg のみ。inherit は欄の中で使わない）。
 * Combobox・TagsInput が、欄の中のチップと同じ高さに打つ欄をそろえるために、style（インラインの CSS 変数）へそのまま渡します。
 * ここはクラス名ではなく実行時の値として使うだけなので、tagSizeClass などと違ってスキャンされる必要はありません
 */
export const chipHeightValue: Record<Exclude<SmallPartsSize, 'inherit'>, string> = {
  sm: '20px',
  md: 'calc(var(--spacing-control) - var(--spacing) * 3)',
  lg: 'var(--spacing-control)',
};
