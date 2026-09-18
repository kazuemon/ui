import { tv } from '../../internal/tv';

// Menu の項目の見た目
//   項目は入力欄の仲間（原則3）。hover とキーボードの選択はどちらも入力欄の塗り（--menu-item-highlight）
//   危険な項目（danger）は文字とアイコンを危険の色にし、赤い枠線のボタンの hover と同じく赤を淡く敷く（--menu-danger-highlight）
//   押しても沈まない（押した瞬間に閉じるため）
//   塗りは --menu-item-bg に置く。状態を固定して見せるとき（ストーリー）は、項目の style で --menu-item-bg を書けば塗れる
//   押せない項目: 押せない文字の色。マウスの hover では塗らず、キーボードで止まったとき（focus-visible）だけ塗る（Select の選べない選択肢と同じ）
//   高さは部品の高さ。角と左右の余白は面の余白（--menu-popup-padding）を引いた同心の角と、文字が本体の文字とそろう余白（Select の選択肢と同じ）
export const menuItem = tv({
  slots: {
    root: [
      'group/menu-item relative flex min-h-(--spacing-control) cursor-pointer items-center gap-2 rounded-[calc(var(--radius-control)-var(--menu-popup-padding))] px-[calc(var(--spacing-control-x)-var(--menu-popup-padding))] text-fg outline-none select-none',
      'bg-(color:--menu-item-bg) [--menu-item-bg:transparent]',
      'data-highlighted:[--menu-item-bg:var(--menu-item-highlight)] data-popup-open:[--menu-item-bg:var(--menu-item-highlight)]',
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled)',
      'data-disabled:data-highlighted:[--menu-item-bg:transparent] data-disabled:data-highlighted:focus-visible:[--menu-item-bg:var(--menu-item-highlight)]',
    ],
    // 前のアイコン。利用者が渡した <svg> を部品の中のアイコンの大きさにする
    icon: 'flex shrink-0 text-fg-muted group-data-disabled/menu-item:text-current [&>svg]:size-(--spacing-icon)',
    label: 'flex min-w-0 flex-1 flex-col',
    // 項目の文字（2 行目を除く）
    text: '',
    // 2 行目（押せない理由など）。キャプションと同じ文字（原則4）
    description: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    // ショートカットの文字。キャプションと同じ小さいグレーの文字だけ（原則4）。項目の文字より控えめにし、右端にそろえる
    shortcut: [
      'ms-2 shrink-0 text-(length:--text-caption) leading-(--leading-caption) whitespace-nowrap text-fg-subtle',
      'group-data-disabled/menu-item:text-current',
    ],
    // 後ろの印（入れ子のメニューの ›、新しいタブの ↗）
    trailing: 'ms-2 flex shrink-0 text-fg-muted group-data-disabled/menu-item:text-current',
    // チェックとラジオの印。前（アイコンより前）か後ろ（右端）かは Menu の markPlacement。選んでいなくても場所は取る
    mark: 'flex size-(--spacing-icon) shrink-0 items-center justify-center text-(color:--menu-mark-color) group-data-disabled/menu-item:text-current',
  },
  variants: {
    danger: {
      true: {
        root: 'text-fg-danger [--menu-item-highlight:var(--menu-danger-highlight)]',
        icon: 'text-current',
        shortcut: 'text-current',
      },
      false: {},
    },
    // 印の場所。DOM の並びは変えず（印は読み上げない）、flex の order で前へ出す
    markPlacement: {
      start: { mark: 'order-first' },
      end: {},
    },
    // 2 行目のある項目は、上下に余白を足して高さを伸ばす（1 行の項目は部品の高さのまま）
    described: {
      true: { root: 'py-1.5' },
      false: {},
    },
  },
  defaultVariants: { danger: false, described: false, markPlacement: 'start' },
});

// グループの見出し。左は項目の文字とそろえる
//   label: 入力欄のラベルと同じ文字（太字・一段淡い濃紺）。見出しとして目に入りやすい
//   caption: キャプションと同じ小さいグレーの文字。項目が主役になる
export const menuGroupLabel = tv({
  base: 'block px-[calc(var(--spacing-control-x)-var(--menu-popup-padding))] pt-2 pb-1 select-none',
  variants: {
    style: {
      label: 'text-(length:--text-label) leading-(--leading-label) font-bold text-fg-muted',
      caption: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    },
  },
  defaultVariants: { style: 'label' },
});

// 区切り線。面の端から端まで引く（面の内側の余白の分だけ外へ出す）。上下には面の余白と同じ間を空ける
export const menuSeparatorClass =
  'mx-[calc(var(--menu-popup-padding)*-1)] my-(--menu-popup-padding) h-(--border-width-thin) bg-surface-line';
