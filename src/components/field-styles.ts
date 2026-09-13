import { tv } from 'tailwind-variants';

// 原則4: ラベル / 本体 / キャプションの3層。エラー・警告は本体の下の行に、アイコン＋文で出す（design/adr/0041）
// エラーのときは、状態の枠線（--color-focus）を赤に、塗りをエラーの塗りに差し替える（原則2）
// hover でも塗りを変えず、エラーの見た目を保つ。警告のときは、欄の見た目を変えない
export const fieldStyles = tv({
  slots: {
    root: [
      'group/field flex flex-col gap-(--space-field-gap)',
      'data-invalid:[--color-focus:var(--color-danger)]',
      'data-invalid:[--color-field-focus:var(--color-field-invalid)]',
      'data-invalid:[--color-field-hover:var(--color-field-invalid)]',
      // Disabled（原則1、design/adr/0026）: 本体の透明度・塗り・文字の色はトークンで指定する（未設定なら部品の色のまま）。hover でも変えない
      'data-disabled:[--color-field-hover:var(--color-field-disabled,var(--color-field))]',
    ],
    label: [
      'text-(length:--text-label) leading-(--leading-label) font-bold text-fg',
      'group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    caption: [
      'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
      'group-data-disabled/field:opacity-(--disabled-label-opacity)',
    ],
    error: 'text-(length:--text-caption) leading-(--leading-caption) text-danger',
    // エラー・警告の行（design/adr/0041）。色は呼び出し側で足す（エラーは text-danger、警告は text-fg-warning）
    message:
      'flex items-start gap-(--field-message-gap) text-(length:--text-caption) leading-(--leading-caption)',
    messageIcon: 'size-(--field-message-icon-size) shrink-0',
    // エラー・警告の行を包む箱（design/adr/0044）。文がなくてもいつも置き、読み上げの live region（polite）にする
    // 箱そのものは隠さない（隠した live region に文を入れると、読み上げソフトによっては知らせないため）
    // 行の高さ（grid の行 0fr ↔ 1fr）と濃さを、押下と同じ緩急で --duration-field-message の長さで動かす
    // 見えなくする（visibility）のは中身で、閉じ終えたとき。動きを減らす設定では、すぐ切り替える
    // 空のときに間（--space-field-gap）が増えないよう、箱の上の間を打ち消す。間は行の上に持たせる（messageLine）
    // 箱はエラー・警告で1つずつ続けて置く。両方開くと、エラーの行と警告の行の間も --space-field-gap になる（design/adr/0041 の追記）
    messageRegion: [
      'group/message -mt-(--space-field-gap) grid grid-rows-[0fr] data-open:grid-rows-[1fr]',
      'transition-[grid-template-rows] duration-(--duration-field-message) ease-press motion-reduce:transition-none',
    ],
    messageClip: [
      'invisible min-h-0 overflow-hidden opacity-0 group-data-open/message:visible group-data-open/message:opacity-100',
      'transition-[opacity,visibility] duration-(--duration-field-message) ease-press motion-reduce:transition-none',
    ],
    messageLine: 'pt-(--space-field-gap)',
  },
});

// 編集できる入力欄の本体（原則8）。TextField と Select のボタンで共有する
// 原則2: 通常はグレーの塗り・枠線なし。フォーカスでは塗りを変えず、2px の枠線を足す（design/adr/0019）
// 枠線は通常時も透明で確保しておき、フォーカスで文字がずれないようにする
export const controlBox = tv({
  base: [
    'flex h-(--size-control) w-full min-w-0 items-center gap-(--space-control-x) rounded-control',
    'border-(length:--field-border-width) border-transparent bg-field',
    'px-[calc(var(--space-control-x)-var(--field-border-width))] text-(length:--text-control) leading-(--leading-control) text-fg',
    'transition-[background-color,border-color] duration-(--duration-field) ease-press motion-reduce:transition-none',
    'hover:not-focus-within:bg-field-hover',
    // フォーカスは枠線だけで表す。ブラウザのフォーカスの線は出さない（Select のボタンで枠線と重なっていた）
    'outline-none focus-within:border-focus focus-within:bg-field-focus',
    // suffix のボタンにキーボードでフォーカスしているあいだは、枠線を消してボタンの線（focusRing）だけにする（design/adr/0040）
    // 端に接する塊の枠線は本体の色を受け継ぐので、一緒に消える。エラーの赤い枠線と、マウスで押したときの枠線は残す
    '[&:has([data-slot=field-addon-button]:focus-visible):not([data-invalid]_*)]:border-transparent',
    'group-data-invalid/field:border-danger group-data-invalid/field:bg-field-invalid',
    'group-data-disabled/field:cursor-not-allowed group-data-disabled/field:opacity-(--field-disabled-opacity)',
    'group-data-disabled/field:bg-[color:var(--color-field-disabled,var(--color-field))]',
    'group-data-disabled/field:text-[color:var(--color-on-field-disabled,var(--color-fg))]',
    // 待っているあいだ止める（loadingBehavior="blocking" — design/adr/0042）: 押せない欄と同じ塗りと文字（design/adr/0026）
    // 枠線（フォーカスの青・エラーの赤）は変えない。hover・フォーカス・開いている・エラーの塗りも押せない塗りにするため、
    // 塗りの色（bg-field・bg-field-hover・bg-field-focus・bg-field-invalid が読む値）をこの要素で差し替える
    'group-data-[loading=blocking]/field:cursor-progress group-data-[loading=blocking]/field:text-(color:--color-on-field-disabled)',
    'group-data-[loading=blocking]/field:[--color-field-hover:var(--color-field-disabled)] group-data-[loading=blocking]/field:[--color-field:var(--color-field-disabled)]',
    'group-data-[loading=blocking]/field:[--color-field-focus:var(--color-field-disabled)] group-data-[loading=blocking]/field:[--color-field-invalid:var(--color-field-disabled)]',
    // prefix・suffix を内側に浮かせる形（addonShape="floating" — design/adr/0035）。既定は端に接する
    'data-[addon-shape=floating]:[--field-addon-inset:var(--field-addon-floating-inset)] data-[addon-shape=floating]:[--field-addon-round-inner:1]',
    'data-[addon-shape=floating]:[--field-addon-button-inset:var(--field-addon-floating-inset)] data-[addon-shape=floating]:[--field-addon-button-round-inner:1]',
  ],
});
