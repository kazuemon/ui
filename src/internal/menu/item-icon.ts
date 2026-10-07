// 一覧の行の頭のアイコンの見せ方（Menu の項目・NavigationMenuLink の行で共有する — ADR-0486）
//   plain: アイコンだけ
//   soft: 入力欄と同じグレーの角丸の箱（40px）に、部品の中のアイコンの大きさ（20px）のアイコンを入れる
//     角は部品の角から 1 段引いた同心の角。塗りは行が hover・キーボードで止まると --item-icon-box-bg-active に替わる（行が止まった状態で --item-icon-box-current を --item-icon-box-bg-active にする。クラスは Tailwind が拾えるよう、使う側に文字のまま書く）
/** 一覧の行（Menu の項目・NavigationMenuLink）の頭のアイコンの見せ方。plain はアイコンだけ、soft はグレーの角丸の箱に入れる */
export type ItemIconVariant = 'plain' | 'soft';

/** soft の箱（大きさ・塗り・角・中のアイコンの大きさ）。箱の中央にアイコンを置く */
export const softIconBoxClass =
  'size-10 items-center justify-center rounded-[calc(var(--radius-control)-var(--spacing))] bg-[var(--item-icon-box-current,var(--item-icon-box-bg))] shadow-[inset_0_0_0_var(--item-icon-box-ring-width)_var(--item-icon-box-ring-color)] [&>svg]:size-(--spacing-icon)';
