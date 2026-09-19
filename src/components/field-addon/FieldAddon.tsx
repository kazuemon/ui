import { type ComponentProps, type ReactNode, use } from 'react';
import { tv } from '../../internal/tv';

import { FieldAddonDisabled } from './field-addon-context';
import { focusRing } from '../../internal/focus-styles';

// 入力欄に付く prefix・suffix（原則8、design/adr/0024）。入力欄の本体（controlBox）の最初か最後の子に置く
// 色はグレー（--color-field-addon）で、エラーのときは赤み（--color-field-addon-invalid）にする
// 端に付くものは見た目で役目を分ける（軸 171）
//   文字 = 接頭辞・接尾辞（FieldAddon）。グレーの塊
//   グレー地＋アイコン = 押せるボタン（FieldAddonButton）。地は文字の塊と同じグレー
//   塗りのないアイコン = 意味の説明（押せない）。SearchField の虫眼鏡など、部品の側で置く
//   同じ端に文字とボタンが並ぶとき（「円」と ▲▼ など）は、文字の地を外し、グレー地はボタンだけにする
// 形はトークンで決める（design/tokens.css の --field-addon-*、design/adr/0035）。既定は本体の端に接する
//   本体の端に接するとき（inset が負）は、本体の枠線の場所に同じ太さの枠線を持ち、本体の枠線の色を受け継ぐ
//   外側の角は本体の角丸と同心。Select のボタンのように本体に左右の余白があるときは --field-addon-pad で打ち消す
// 地は --addon-base（文字の塊のグレー）を使う場所で読むので、読み取り専用（グレーを消す）や
// 押せない欄（エラーの赤みを外す）で --color-field-addon* を差し替えると、ボタンの地も一緒に変わる
const fieldAddon = tv({
  base: [
    'flex shrink-0 items-center self-stretch px-(--spacing-control-x) whitespace-nowrap',
    // 塗り。エラーのときは --color-field-addon-invalid に差し替える
    'bg-(color:--addon-fill) [--addon-base:var(--color-field-addon)] [--addon-fill:var(--addon-base)] group-data-invalid/field:[--addon-base:var(--color-field-addon-invalid)]',
    '[--addon-inset:var(--field-addon-inset)] [--addon-round-inner:var(--field-addon-round-inner)]',
    '[--addon-radius:calc(var(--radius-control)-var(--field-border-width)-var(--addon-inset))]',
    '[--addon-radius-inner:calc(var(--addon-radius)*var(--addon-round-inner))]',
    '[--addon-edge:max(0px,calc(-1*var(--addon-inset)))]',
    '[margin-block:var(--addon-inset)] [border-block-width:var(--addon-edge)] [border-block-color:inherit]',
    // prefix（本体の最初の子）
    'first:[margin-inline-start:calc(var(--addon-inset)-var(--field-addon-pad,0px))]',
    'first:[border-inline-start-width:var(--addon-edge)] first:[border-inline-start-color:inherit]',
    'first:[border-start-start-radius:var(--addon-radius)] first:[border-end-start-radius:var(--addon-radius)]',
    'first:[border-start-end-radius:var(--addon-radius-inner)] first:[border-end-end-radius:var(--addon-radius-inner)]',
    // suffix（本体の最後の子）
    'last:[margin-inline-end:calc(var(--addon-inset)-var(--field-addon-pad,0px))]',
    'last:[border-inline-end-width:var(--addon-edge)] last:[border-inline-end-color:inherit]',
    'last:[border-start-end-radius:var(--addon-radius)] last:[border-end-end-radius:var(--addon-radius)]',
    'last:[border-start-start-radius:var(--addon-radius-inner)] last:[border-end-start-radius:var(--addon-radius-inner)]',
  ],
  variants: {
    kind: {
      // 文字（ラベル）: 本文より一段淡い文字。押しても入力欄にフォーカスが移る（TextField）
      text: [
        'text-fg-muted group-data-invalid/field:text-[color:var(--color-on-field-addon-invalid,var(--color-fg-muted))]',
        'group-data-disabled/field:text-[color:var(--color-on-field-disabled,var(--color-fg-muted))]',
        // 待っているあいだ止める欄（design/adr/0042）も、押せない欄と同じ文字の色
        // エラーの色（group-data-invalid）より優先するため、本体の直下という条件を足して強くする
        '[[data-loading=blocking]_[data-slot=control]>&]:text-[color:var(--color-on-field-disabled,var(--color-fg-muted))]',
        // 同じ端でボタン（FieldAddonButton か、ボタンを並べた塊）と隣り合う文字は、地を外す（グレー地＝押せる、を崩さない）
        '[&:has(+[data-slot=field-addon-button])]:[--addon-fill:transparent] [&:has(+[data-slot=field-addon]_button)]:[--addon-fill:transparent]',
        '[[data-slot=field-addon-button]+&]:[--addon-fill:transparent] [[data-slot=field-addon]:has(button)+&]:[--addon-fill:transparent]',
      ],
      // ボタン: グレー地の塊（軸 171）。hover と押下で文字の色を淡く重ね、押下で中身が 1px 沈む（design/adr/0027）
      button: [
        'group/addon cursor-pointer font-bold text-fg select-none',
        'group-data-invalid/field:text-[color:var(--color-on-field-addon-invalid,var(--color-fg))]',
        // キーボードでフォーカスしているあいだは、本体の枠線を消してこの線だけにする（controlBox — design/adr/0040）
        ...focusRing,
        // 塗りは --addon-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
        // ふだんは文字の塊と同じグレー（--addon-fill）。hover・押下はその上に文字の色を重ねる
        'bg-(color:--addon-bg) [--addon-bg:var(--addon-fill)]',
        // 登録した変数は currentColor を補間できないので、文字の色を --addon-ink に置いて混ぜる（上の text-fg・エラーの色と同じ）
        '[--addon-ink:var(--color-fg)] group-data-invalid/field:[--addon-ink:var(--color-on-field-addon-invalid,var(--color-fg))]',
        '[transition:--addon-bg_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
        'motion-reduce:[transition:none]',
        // 淡く敷く濃さは --color-flat-hover・--color-flat-press と同じ（--flat-hover-mix・--flat-press-mix）。グレーの上に重ねた色にする
        'enabled:hover:[--addon-bg:color-mix(in_oklab,var(--addon-fill),var(--addon-ink)_var(--flat-hover-mix))]',
        'enabled:active:[--addon-bg:color-mix(in_oklab,var(--addon-fill),var(--addon-ink)_var(--flat-press-mix))]',
        'disabled:cursor-not-allowed disabled:text-[color:var(--color-on-field-disabled,var(--color-fg))]',
      ],
    },
  },
});

/**
 * 入力欄に付く文字（prefix・suffix）。TextField・Select の prefix・suffix に文字を渡すと、これで包む
 * TextField では入力欄の説明につなぎ、文字は読み上げから外す（design/adr/0040）。aria-hidden を渡すと、つながない
 */
export function FieldAddon({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span data-slot="field-addon" className={fieldAddon({ kind: 'text', className })} {...props} />
  );
}

export interface FieldAddonButtonProps extends ComponentProps<'button'> {
  children: ReactNode;
}

/**
 * 入力欄に付くボタン（消去・パスワードを表示など）。入力欄のすぐ横に置くボタンは、独立したボタンではなくこれで作る
 * グレー地の塊にアイコンを置きます。グレー地が「押せる」印で、塗りのないアイコンは押せない説明の印として使い分けます
 */
export function FieldAddonButton({
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: FieldAddonButtonProps) {
  const fieldDisabled = use(FieldAddonDisabled);
  return (
    <button
      type={type}
      data-slot="field-addon-button"
      disabled={disabled ?? fieldDisabled}
      className={fieldAddon({ kind: 'button', className })}
      {...props}
    >
      <span className="flex items-center gap-2 transition-[translate] duration-(--duration-press) ease-press group-active/addon:translate-y-(--flat-press-depth) group-disabled/addon:translate-y-0 motion-reduce:transition-none">
        {children}
      </span>
    </button>
  );
}
