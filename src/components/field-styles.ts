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
      // エラーかつ押せない欄は、押せない見た目を優先する（チェックボックス・ラジオと同じ）。エラー・警告の行（文）はそのまま出す
      //   赤い枠線は、押せないときは引かない（controlBox が --field-invalid-border を読む）
      //   エラーの塗り・prefix・suffix の赤みと文字の色は、押せないときの値に差し替える（読む側の規則はエラーのまま）
      'data-invalid:not-data-disabled:[--field-invalid-border:var(--color-danger)]',
      'data-disabled:[--color-field-invalid:var(--color-field-disabled,var(--color-field))]',
      'data-disabled:[--color-field-addon-invalid:var(--color-field-addon)] data-disabled:[--color-on-field-addon-invalid:var(--color-on-field-disabled)]',
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
    'transition-[background-color,border-color,outline-color,outline-offset,box-shadow] duration-(--duration-field) ease-press motion-reduce:transition-none',
    'hover:not-focus-within:bg-field-hover',
    // フォーカスは枠線だけで表す。ブラウザのフォーカスの線は出さない（Select のボタンで枠線と重なっていた）
    // 枠線の色は --color-focus（エラーのときは赤）。部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）は、
    // 部品が置いた自分の色（--color-own-focus。Select が color から置く）。0 と 1 を srgb で混ぜる
    // --focus-follow-color が未設定（既定）か、自分の色がないときは --control-focus-line が無効になり、--color-focus をそのまま使う
    // 部品の色（--control-own）は --color-own-focus。色なしの Select（aria-haspopup=listbox の本体。TextField は含まない）は、
    // --color-select-neutral-focus を自分の色にする（既定は未設定で、いまと同じく色を持たない — 後半の軸 41 の I・J）
    '[--control-own:var(--color-own-focus)] aria-[haspopup=listbox]:[--control-own:var(--color-own-focus,var(--color-select-neutral-focus))]',
    '[--control-focus-line:color-mix(in_srgb,var(--control-own)_calc(var(--focus-follow-color)*100%),var(--color-focus))]',
    // エラーのときは、部品の色に従わせる設定でも赤い枠線にする（エラーは状態 — 原則2。--color-focus は Field が赤にしている）
    'group-data-invalid/field:[--control-focus-line:var(--color-focus)]',
    'outline-none focus-within:border-[color:var(--control-focus-line,var(--color-focus))] focus-within:bg-field-focus',
    // 入力欄にもボタンと同じ離した線を引くとき（--field-focus-ring: 1 — 後半の軸 41 の E・F・G）。クリックでも出す（原則2）
    // 太さ・離し方・色はボタンの線（focusRing）と同じトークン。部品と線のあいだを埋める影（--focus-ring-inner-width）も同じ
    // 未設定（既定）と 0 は、線と影の太さが 0 になり、見た目は変わらない
    // Select の本体は、開いているあいだ（data-popup-open・data-closing）も同じ線を引く（Select.tsx）
    '[--control-ring-inner:calc(var(--field-focus-ring)*var(--focus-ring-inner-width))] [--control-ring-width:calc(var(--field-focus-ring,0)*var(--focus-ring-width))]',
    // エラーの欄だけに離した線を引くとき（--field-invalid-focus-ring: 1 — 後半の軸 41 の K・L・M）。赤い枠線（状態）はそのまま、その外に引く
    // 枠線と線のあいだは --field-invalid-focus-ring-inner-width（未設定なら --focus-ring-inner-width）の幅で埋める。ボタンの影は変えない
    // 未設定（既定）と 0 は --field-focus-ring に従う（どちらも未設定なら太さ 0 で、見た目は変わらない）
    // フォーカスしたままエラーが消える・出るときは、線を動かさずに切り替える（縮む動きは比べたが外した）
    'group-data-invalid/field:[--control-ring-inner:calc(max(var(--field-focus-ring,0),var(--field-invalid-focus-ring,0))*var(--field-invalid-focus-ring-inner-width,var(--focus-ring-inner-width)))]',
    'group-data-invalid/field:[--control-ring-width:calc(max(var(--field-focus-ring,0),var(--field-invalid-focus-ring,0))*var(--focus-ring-width))]',
    // 部品の色を持つ入力欄（Select）の離した線は --color-field-own-focus-ring（未設定なら --color-focus-ring — 後半の軸 41 の I）
    // 部品の色を 0% で混ぜるのは、部品の色があるときだけ有効にするため（TextField は色を持たないので、いつも --color-focus-ring）
    '[--control-ring-base:color-mix(in_srgb,var(--control-own)_0%,var(--color-field-own-focus-ring))]',
    '[--control-ring-color:color-mix(in_srgb,var(--control-own)_calc(var(--focus-ring-follow-color,var(--focus-follow-color))*100%),var(--control-ring-base,var(--color-focus-ring)))]',
    '[outline-offset:var(--focus-ring-offset-rest)] [outline-color:transparent]',
    // 線の種類は solid に固定する（--focus-ring-style が auto の比較の行では、太さ 0 でもブラウザの線が出るため）
    'focus-within:[outline-width:var(--control-ring-width,0px)] focus-within:[outline-offset:var(--focus-ring-offset)] focus-within:[outline-style:solid]',
    'focus-within:[outline-color:var(--control-ring-color,var(--color-focus-ring))]',
    'focus-within:ring-[length:var(--control-ring-inner,0px)] focus-within:ring-[color:var(--color-focus-ring-inner)]',
    // suffix のボタンにキーボードでフォーカスしているあいだは、枠線を消してボタンの線（focusRing）だけにする（design/adr/0040）
    // 端に接する塊の枠線は本体の色を受け継ぐので、一緒に消える。エラーの赤い枠線と、マウスで押したときの枠線は残す
    // 本体の離した線と影は、エラーのときも消す（いまいる場所を示す線は同時に1本 — 原則2）
    '[&:has([data-slot=field-addon-button]:focus-visible):not([data-invalid]_*)]:border-transparent',
    '[&:has([data-slot=field-addon-button]:focus-visible)]:ring-0 [&:has([data-slot=field-addon-button]:focus-visible)]:[outline-color:transparent]',
    // エラーの赤い枠線は、押せないときは引かない（fieldStyles の root が --field-invalid-border を置くのは、押せるエラーの欄だけ）
    'group-data-invalid/field:border-[color:var(--field-invalid-border,transparent)] group-data-invalid/field:bg-field-invalid',
    'group-data-disabled/field:cursor-not-allowed group-data-disabled/field:opacity-(--field-disabled-opacity)',
    'group-data-disabled/field:bg-[color:var(--color-field-disabled,var(--color-field))]',
    'group-data-disabled/field:text-[color:var(--color-on-field-disabled,var(--color-fg))]',
    // 待っているあいだ止める（loadingBehavior="blocking" — design/adr/0042）: 押せない欄と同じ塗りと文字（design/adr/0026）
    // 枠線（フォーカスの青・エラーの赤）は変えない。hover・フォーカス・開いている・エラーの塗りも押せない塗りにするため、
    // 塗りの色（bg-field・bg-field-hover・bg-field-focus・bg-field-invalid が読む値）をこの要素で差し替える
    'group-data-[loading=blocking]/field:cursor-progress group-data-[loading=blocking]/field:text-(color:--color-on-field-disabled)',
    'group-data-[loading=blocking]/field:[--color-field-hover:var(--color-field-disabled)] group-data-[loading=blocking]/field:[--color-field:var(--color-field-disabled)]',
    'group-data-[loading=blocking]/field:[--color-field-focus:var(--color-field-disabled)] group-data-[loading=blocking]/field:[--color-field-invalid:var(--color-field-disabled)]',
    // 成功のときのふだんの枠線（後半の軸 37 の B。採らなかったので既定は transparent で変わらない。比較のストーリーで再現するために残す）
    // フォーカス中は青い枠線（原則2）。端に接する prefix・suffix は本体の枠線の色を受け継ぐので、一緒に変わる
    // フォーカス中の青は、同じ条件にフォーカスを足して強くし、成功の枠線より優先する（suffix のボタンにフォーカスしているときの透明は、さらに強い）
    'group-data-success/field:border-(color:--color-field-success-line)',
    'group-data-success/field:focus-within:border-[color:var(--control-focus-line,var(--color-focus))]',
    // prefix・suffix を内側に浮かせる形（addonShape="floating" — design/adr/0035）。既定は端に接する
    'data-[addon-shape=floating]:[--field-addon-inset:var(--field-addon-floating-inset)] data-[addon-shape=floating]:[--field-addon-round-inner:1]',
    'data-[addon-shape=floating]:[--field-addon-button-inset:var(--field-addon-floating-inset)] data-[addon-shape=floating]:[--field-addon-button-round-inner:1]',
  ],
});
