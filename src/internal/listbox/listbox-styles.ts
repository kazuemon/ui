import { popupSurfaceClass } from '../overlay/popup-styles';
import { tv } from '../tv';

// 選択肢の一覧（listbox）の見た目 — adr/0036・0037・0044、ADR-0053・0054・0055
// Select・Combobox・Autocomplete・CommandPalette が共有する。Base UI のどの部品かは問わない
//   面は白・細い輪郭・やわらかい影（浮かぶ UI の影は重なりを表す — 原則1）。シートでは上の角だけカードの角にして下から滑り出る
//   項目の hover（キーボードで選んでいるときも同じ）は入力欄の塗り。選んだ項目は部品の色（listbox-colors の selectedTokens）
//   余白・高さ・角は --select-popup-padding と密度のトークンから作る（名前は Select が先に持っていたもの）

/** 選択肢の出し方。popover: 本体の下に浮かべる、sheet: 画面の下から出すシート */
export type ListboxPresentation = 'popover' | 'sheet';

/**
 * まとまりの見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレー
 * 選択肢の一覧と Menu で同じ2つから選ぶ（見出しの余白は部品ごとの面の余白から作る）
 */
export type GroupLabelStyle = 'label' | 'caption';

/**
 * 浮かぶ選択肢とシートの面（Base UI の Popup に渡す）
 * popover: 角は部品の角、影は --shadow-overlay。本体の側から離れる向きにずれた位置から、濃さと一緒に滑る（ADR-0054 の D）
 * sheet: 上の角だけカードの角、影は --shadow-sheet。下から滑り出て、つまみに合わせて高さが動く
 * 上下の余白は選択肢（List）の内側に持たせ、続きの印が面の端に接するようにする（py-0）
 */
export const listboxPopup = tv({
  base: [
    popupSurfaceClass,
    // 選択肢の文字は欄の値と同じ大きさ（指でも 16px）。選んだ値が欄に入っても大きさが変わらない
    'p-(--select-popup-padding) text-input [--sheet-inset:var(--select-popup-padding)] [--spacing-icon:var(--spacing-icon-input)]',
  ],
  variants: {
    presentation: {
      popover: [
        // 上下の余白は選択肢の内側に持たせ、続きの影が面の上下の端に接するようにする。角丸で切り抜く
        'min-w-(--anchor-width) overflow-clip py-0 shadow-overlay',
        // 開閉の動き（--popup-duration-in・-out・-ease・-shift — ADR-0054 の D）
        // 本体の側から離れる向きにずれた位置から、濃さと一緒に滑る
        // 動きを減らす設定では動かさず、すぐに出す・消す（原則3）
        'transition-[opacity,translate] duration-(--popup-duration-in) ease-(--popup-ease) data-ending-style:duration-(--popup-duration-out)',
        'data-ending-style:opacity-0 data-starting-style:opacity-0',
        'data-ending-style:[translate:0_calc(var(--popup-shift)*-1)] data-starting-style:[translate:0_calc(var(--popup-shift)*-1)]',
        'data-[side=top]:data-ending-style:[translate:0_var(--popup-shift)] data-[side=top]:data-starting-style:[translate:0_var(--popup-shift)]',
        'motion-reduce:[transition:none]',
      ],
      sheet: [
        // シート: 上の角だけ丸め（下の角は面の角を残さない）、下から滑り出る。高さはつまみに合わせて動く（引いているあいだは動きを止める）
        // 下端は端末の安全領域の分だけ空ける
        'flex min-h-0 w-full flex-col rounded-t-card rounded-b-none border-x-0 border-b-0 shadow-sheet',
        // 下端の余白（端末の安全領域の分）は選択肢の内側に持たせ、続きの印がシートの下端に接するようにする
        'py-0',
        '[transition:translate_var(--duration-sheet)_var(--ease-sheet),height_var(--duration-sheet)_var(--ease-sheet)] data-dragging:[transition:none] motion-reduce:[transition:none]',
        'data-ending-style:translate-y-full data-starting-style:translate-y-full',
      ],
    },
  },
  defaultVariants: { presentation: 'popover' },
});

/**
 * 選択肢の一覧（Base UI の List に渡す）。スクロールする箱
 * popover: 高さの上限は、本体の下の空き（--available-height）と、部品が測って書く --select-popup-max-height の小さい方
 *   （--select-popup-extra は一覧の外に出す読み込み中の行の高さ）
 * sheet: 面の残りいっぱいに伸ばす
 * loadingRow: 一覧の下に行（読み込み中など）を出すときは、下の余白をその行に持たせる
 */
export const listboxList = tv({
  base: 'overflow-y-auto',
  variants: {
    presentation: {
      popover:
        'max-h-[min(calc(var(--available-height)-var(--select-popup-extra,0px)),var(--select-popup-max-height,var(--available-height)))]',
      sheet: 'min-h-0 flex-1',
    },
    loadingRow: { true: '', false: '' },
  },
  compoundVariants: [
    { presentation: 'popover', loadingRow: true, class: 'pt-(--select-popup-padding)' },
    { presentation: 'popover', loadingRow: false, class: 'py-(--select-popup-padding)' },
    {
      presentation: 'sheet',
      loadingRow: false,
      class: 'pb-[max(var(--select-popup-padding),env(safe-area-inset-bottom))]',
    },
  ],
  defaultVariants: { presentation: 'popover', loadingRow: false },
});

// 選択肢の1項目（Base UI の Item・ItemText・ItemIndicator に渡す） — design/adr/0036・0044
// note のある項目だけ、ラベルの下に2行目を出して高さを伸ばす（1行の項目は --spacing-control のまま）
// 選べない項目（disabled）: ラベルは押せない文字の色。押しても選ばれない
//   マウスの hover では塗らない（押せないため）。矢印キーでは止まるので、キーボードで止まったとき（focus-visible）だけ、
//   ほかの項目と同じ hover の塗りで、いまの場所を見せる
export const listboxOption = tv({
  slots: {
    root: [
      'group/option flex min-h-(--spacing-control) cursor-pointer items-center gap-(--spacing-control-x) rounded-[calc(var(--radius-control)-var(--select-popup-padding))] px-[calc(var(--spacing-control-x)-var(--select-popup-padding))] outline-none select-none',
      // hover（キーボードで選んでいるときも同じ）は、選んだ項目の見た目より優先する
      'data-highlighted:bg-field',
      'data-selected:text-(color:--color-on-select-item-selected) data-selected:not-data-highlighted:bg-(color:--color-select-item-selected)',
      // 選んだ項目の hover（開いた直後は、選んだ項目が hover と同じ状態になる）
      'data-selected:data-highlighted:bg-(color:--color-select-item-selected-highlight)',
      // 選べない項目: hover の塗りを消し、キーボードで止まったとき（focus-visible）だけ付け直す
      // :not(:focus-visible) の形は使わない（Storybook の pseudo-states アドオンが書き換え、いつも塗りが消えていた）
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled) data-disabled:data-highlighted:bg-transparent',
      'data-disabled:data-highlighted:focus-visible:bg-field',
    ],
    // ラベルと2行目を包む
    body: 'flex min-w-0 flex-1 flex-col',
    // 選んだ項目のラベルの太さ（--select-item-selected-weight）。2行目（note）は変えない
    label: 'group-data-selected/option:[font-weight:var(--select-item-selected-weight)]',
    // 選んだ印（チェック）
    indicator: 'flex text-(color:--color-select-check)',
    // 2行目の「選べない理由」。キャプションと同じ灰色の文字だけ（原則4）
    reason: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
  },
  variants: {
    // 2行目のある項目は、上下に余白を足して高さを伸ばす（1行の項目は部品の高さのまま）
    described: {
      true: { root: 'py-1.5' },
      false: {},
    },
  },
  defaultVariants: { described: false },
});

/**
 * 選択肢のまとまりの見出し（Base UI の GroupLabel に渡す）。Menu のグループの見出しと同じ形
 * label: 入力欄のラベルと同じ文字（太字・一段淡い濃紺）。caption: キャプションと同じ小さいグレーの文字
 */
export const listboxGroupLabel = tv({
  base: 'block px-[calc(var(--spacing-control-x)-var(--select-popup-padding))] pt-2 pb-1 select-none',
  variants: {
    style: {
      label: 'text-(length:--text-label) leading-(--leading-label) font-bold text-fg-muted',
      caption: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    },
  },
  defaultVariants: { style: 'label' },
});

/**
 * まとまりの区切り線（Base UI の Separator に渡す）。面の端から端まで引く（面の内側の余白の分だけ外へ出す）
 * 上下には面の余白と同じ間を空ける。Menu の区切り線と同じ形
 */
export const listboxSeparatorClass =
  'mx-[calc(var(--select-popup-padding)*-1)] my-(--select-popup-padding) h-(--border-width-thin) bg-surface-line';

/**
 * 選ぶものがないときの行（Base UI の Empty に渡す）。文は呼び出し側が渡す（部品は文を組み立てない）
 * 高さと左右の余白は選択肢と同じで、文はキャプションと同じグレー。長い文は折り返す
 */
export const listboxEmptyClass =
  'flex min-h-(--spacing-control) items-center px-[calc(var(--spacing-control-x)-var(--select-popup-padding))] text-fg-muted select-none';

/**
 * 一覧の下に出す「読み込んでいます」の行（design/adr/0042）。選べない。高さと左の余白は項目と同じ
 * 選択肢の一覧（listbox）の中には選択肢しか置けないので、一覧のすぐ下に置く
 * 下の余白は、シートでは端末の安全領域の分を空ける
 */
export const listboxLoadingRow = tv({
  base: 'flex h-(--spacing-control) shrink-0 items-center gap-2 px-[calc(var(--spacing-control-x)-var(--select-popup-padding))] text-fg-muted select-none',
  variants: {
    presentation: {
      popover: 'mb-(--select-popup-padding)',
      sheet: 'mb-[max(var(--select-popup-padding),env(safe-area-inset-bottom))]',
    },
  },
  defaultVariants: { presentation: 'popover' },
});
