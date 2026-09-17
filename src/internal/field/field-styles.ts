import { tv } from '../tv';

// 原則4: ラベル / 本体 / キャプションの3層。エラー・警告は本体の下の行に、アイコン＋文で出す（design/adr/0041）
// エラーのときは、状態の枠線（--color-focus）を赤に、塗りをエラーの塗りに差し替える（原則2）
// hover でも塗りを変えず、エラーの見た目を保つ。警告のときは、欄の見た目を変えない
export const fieldStyles = tv({
  slots: {
    root: [
      'group/field flex flex-col gap-(--spacing-field-gap)',
      'data-invalid:[--color-focus:var(--color-fg-danger)]',
      'data-invalid:[--color-field-focus:var(--color-field-invalid)]',
      'data-invalid:[--color-field-hover:var(--color-field-invalid)]',
      // Disabled（原則1、design/adr/0026）: 本体の透明度・塗り・文字の色はトークンで指定する（未設定なら部品の色のまま）。hover でも変えない
      'data-disabled:[--color-field-hover:var(--color-field-disabled,var(--color-field))]',
      // エラーかつ押せない欄は、押せない見た目を優先する（チェックボックス・ラジオと同じ）。エラー・警告の行（文）はそのまま出す
      //   赤い枠線は、押せないときは引かない（controlBox が --field-invalid-border を読む）
      //   エラーの塗り・prefix・suffix の赤みと文字の色は、押せないときの値に差し替える（読む側の規則はエラーのまま）
      'data-invalid:not-data-disabled:[--field-invalid-border:var(--color-fg-danger)]',
      'data-disabled:[--color-field-invalid:var(--color-field-disabled,var(--color-field))]',
      'data-disabled:[--color-field-addon-invalid:var(--color-field-addon)] data-disabled:[--color-on-field-addon-invalid:var(--color-on-field-disabled)]',
    ],
    // ラベルとキャプションは、押せないときも薄くしない（原則1: 説明が読めるように）
    label: 'text-(length:--text-label) leading-(--leading-label) font-bold text-fg',
    caption: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    error: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-danger',
    // エラー・警告の行（design/adr/0041）。色は呼び出し側で足す（エラーは text-danger、警告は text-fg-warning）
    message:
      'flex items-start gap-(--field-message-gap) text-(length:--text-caption) leading-(--leading-caption)',
    messageIcon: 'size-(--leading-caption) shrink-0',
    // エラー・警告の行を包む箱（design/adr/0044）。文がなくてもいつも置き、読み上げの live region（polite）にする
    // 箱そのものは隠さない（隠した live region に文を入れると、読み上げソフトによっては知らせないため）
    // 行の高さ（grid の行 0fr ↔ 1fr）と濃さを、押下と同じ緩急で --duration-field-message の長さで動かす
    // 見えなくする（visibility）のは中身で、閉じ終えたとき。動きを減らす設定では、すぐ切り替える
    // 空のときに間（--spacing-field-gap）が増えないよう、箱の上の間を打ち消す。間は行の上に持たせる（messageLine）
    // 箱はエラー・警告で1つずつ続けて置く。両方開くと、エラーの行と警告の行の間も --spacing-field-gap になる（design/adr/0041 の追記）
    // --field-message-pull: すぐ上の部品の下に余りがあるとき、行の上の間から引く長さ（チェックボックスとラジオが入れる — design/adr/0101）
    //   間（--spacing-field-gap）までは行の上の間を減らし、超えた分（--field-message-overlap）は開いているあいだだけ箱を上に寄せる
    //   開いた行のあとに続く行（エラーのあとの警告）は、ふつうの間に戻す
    messageRegion: [
      'group/message -mt-(--spacing-field-gap) grid grid-rows-[0fr] data-open:grid-rows-[1fr]',
      '[--field-message-overlap:max(0px,var(--field-message-pull,0px)_-_var(--spacing-field-gap))]',
      'data-open:mt-[calc(-1*var(--spacing-field-gap)_-_var(--field-message-overlap))]',
      '[[data-slot=field-message][data-open]~&]:[--field-message-pull:0px]',
      'transition-[grid-template-rows,margin-top] duration-(--duration-field-message) ease-press motion-reduce:transition-none',
    ],
    messageClip: [
      'invisible min-h-0 overflow-hidden opacity-0 group-data-open/message:visible group-data-open/message:opacity-100',
      'transition-[opacity,visibility] duration-(--duration-field-message) ease-press motion-reduce:transition-none',
    ],
    messageLine: 'pt-[max(0px,var(--spacing-field-gap)_-_var(--field-message-pull,0px))]',
  },
});

// 編集できる入力欄の本体（原則8）。TextField と Select のボタンで共有する
// 文字は文字を打つ欄の大きさ（指でも 16px）。TextField と Select の値の大きさをそろえる（prefix・suffix の文字も同じ）
// 原則2: 通常はグレーの塗り・枠線なし。フォーカスでは塗りを変えず、2px の枠線を足す（design/adr/0019）
// 枠線は通常時も透明で確保しておき、フォーカスで文字がずれないようにする
export const controlBox = tv({
  base: [
    'flex h-(--spacing-control) w-full min-w-0 items-center gap-(--spacing-control-x) rounded-control',
    'border-(length:--field-border-width) border-transparent bg-field',
    'px-[calc(var(--spacing-control-x)-var(--field-border-width))] text-input text-fg',
    // 中のアイコン（▼・suffix のボタン・回る印・成功の印）は入力欄のアイコンの大きさ
    '[--spacing-icon:var(--spacing-icon-input)]',
    'transition-[background-color,border-color,outline-color,outline-offset,box-shadow] duration-(--duration-field) ease-press motion-reduce:transition-none',
    'hover:not-focus-within:bg-field-hover',
    // フォーカスは枠線だけで表す。ブラウザのフォーカスの線は出さない（Select のボタンで枠線と重なっていた）
    // 枠線の色は --color-focus（エラーのときは赤）。部品が自分の色（--color-own-focus。Select が color から置く）を置いたときは、
    // その色（ADR-0071 の M）。--focus-follow-color（1 か 0）で srgb で混ぜる
    // --focus-follow-color が未設定か、自分の色がないときは --control-focus-line が無効になり、--color-focus をそのまま使う
    '[--control-own:var(--color-own-focus)]',
    '[--control-focus-line:color-mix(in_srgb,var(--control-own)_calc(var(--focus-follow-color)*100%),var(--color-focus))]',
    // エラーのときは、部品の色に従わせる設定でも赤い枠線にする（エラーは状態 — 原則2。--color-focus は Field が赤にしている）
    'group-data-invalid/field:[--control-focus-line:var(--color-focus)]',
    'outline-none focus-within:border-[color:var(--control-focus-line,var(--color-focus))] focus-within:bg-field-focus',
    // エラーの欄だけ、赤い枠線の外にボタンと同じ離した線を引く（ADR-0071 の M。クリックでも出す — 原則2）
    // 枠線と線のあいだは --field-invalid-focus-ring-inner-width の幅で、--color-focus-ring-inner で埋める。ボタンの影は変えない
    // エラーでない欄は、線と影の太さが 0（未設定の fallback）で引かない
    // フォーカスしたままエラーが消える・出るときは、線を動かさずに切り替える（縮む動きは比べたが外した）
    // Select の本体は、開いているあいだ（data-popup-open・data-closing）も同じ線を引く（Select.tsx）
    'group-data-invalid/field:[--control-ring-inner:var(--field-invalid-focus-ring-inner-width)] group-data-invalid/field:[--control-ring-width:var(--focus-ring-width)]',
    // 線の色は、部品の色を持つ入力欄（Select）はその色、TextField は --color-focus-ring
    '[--control-ring-color:color-mix(in_srgb,var(--control-own)_calc(var(--focus-follow-color)*100%),var(--color-focus-ring))]',
    '[outline-offset:var(--focus-ring-offset)] [outline-color:transparent]',
    'focus-within:[outline-width:var(--control-ring-width,0px)] focus-within:[outline-style:solid]',
    'focus-within:[outline-color:var(--control-ring-color,var(--color-focus-ring))]',
    'focus-within:ring-[length:var(--control-ring-inner,0px)] focus-within:ring-[color:var(--color-focus-ring-inner)]',
    // suffix のボタンにキーボードでフォーカスしているあいだは、枠線を消してボタンの線（focusRing）だけにする（design/adr/0040）
    // 端に接する塊の枠線は本体の色を受け継ぐので、一緒に消える。エラーの赤い枠線と、マウスで押したときの枠線は残す
    // 本体の離した線と影は、エラーのときも消す（いまいる場所を示す線は同時に1本 — 原則2）
    '[&:has([data-slot=field-addon-button]:focus-visible):not([data-invalid]_*)]:border-transparent',
    '[&:has([data-slot=field-addon-button]:focus-visible)]:ring-0 [&:has([data-slot=field-addon-button]:focus-visible)]:[outline-color:transparent]',
    // エラーの赤い枠線は、押せないときは引かない（fieldStyles の root が --field-invalid-border を置くのは、押せるエラーの欄だけ）
    'group-data-invalid/field:border-[color:var(--field-invalid-border,transparent)] group-data-invalid/field:bg-field-invalid',
    'group-data-disabled/field:cursor-not-allowed',
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
  ],
});
