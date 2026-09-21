'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  use,
  useCallback,
  useId,
  useState,
} from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { FormSubmitContext } from '../../internal/form-context';
import { ArrowUpRightIcon } from '../../internal/icons';
import {
  disabledAnchor,
  disabledLinkProps,
  endsWithElement,
  newTabNaming,
  opensNewTab,
  renderPropOf,
  warnOnce,
  withoutNavigation,
  withRenderOverrides,
} from '../../internal/link-parts';
import { type LoadingIndicator, LoadingBar, Spinner } from '../loading/Loading';
import { tv } from '../../internal/tv';

// 原則1: 影は「押せること」の記号。塗りのボタンにだけ付ける（design/adr/0006）
// 原則3: hover で影が輪郭だけになり、押下で 1px 沈む（design/adr/0009）。押しても輪郭の線は残す（design/adr/0033）
// 原則7: 押すものの強さは4段。色の塗り・グレーの塗り・枠線・下線（いちばん軽い押すもの — 軸 174）
//   下線（underline）は、塗りも枠線もなく、文字に淡い下線だけが付く。文字は枠線のボタンとまったく同じ
// 色は --button-fill・--button-text・--button-line に入れ、Disabled のときだけ差し替える
// 送信中（loading、design/adr/0034）: 押せないボタンと同じ見た目にし、送信中の印を出す。data-loading で表す
//   印（回る円・線）は薄くしないので、ボタン全体を薄くする opacity は使わず、塗り・文字・枠線の色を
//   Disabled の薄さ（--disabled-opacity）で混ぜた色にする。白地の上では Disabled と同じ色になる
//   印の色: 回る円は元の文字の色（--button-ink）、線はボタンの濃い色（--button-accent）
//   印は src/components/Loading.tsx（入力欄と共有）。動きを減らす設定では、回る円は3秒で1周、線は幅いっぱいで明滅する（design/adr/0042）
// hover と押下は、押せるとき（:disabled でも data-disabled でもない）で送信中でないとき（not-data-loading）だけ
//   not-[:disabled,[data-disabled]] は :not(:is(:disabled, [data-disabled]))。:not(:disabled) と詳細度は同じ
// ボタンの見た目のリンク（Link の variant="button" — design/adr/0046）: 下の ButtonLink。Link が中で使う
//   押せないリンク（<a> は :disabled にならない）には data-disabled を付け、disabled: と同じ Disabled を data-disabled: で当てる
const button = tv({
  base: [
    'relative inline-flex h-(--spacing-control) shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control px-(--spacing-control-x) whitespace-nowrap',
    'text-(length:--text-control) leading-(--leading-control) font-bold select-none',
    // キーボードで操作したときのフォーカス（design/adr/0031）。線の隙間と色は --focus-ring-duration で動かす
    ...focusRing,
    // 押下は --duration-press、送信中への切り替わり（色・薄さ）は --duration-loading で動かす
    // 塗りは押下（枠線のボタン）と送信中の両方で変わるので、送信中だけ --duration-loading にする
    '[transition:box-shadow_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),--button-bg_var(--button-bg-duration)_var(--ease-press),color_var(--duration-loading)_var(--ease-press),border-color_var(--duration-loading)_var(--ease-press),opacity_var(--duration-loading)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    '[--button-bg-duration:var(--duration-press)] data-loading:[--button-bg-duration:var(--duration-loading)]',
    // 塗りは --button-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
    'bg-(color:--button-bg)',
    'motion-reduce:[transition:none]',
    // Disabled（原則1、design/adr/0026）: 影をなくす。塗り・文字の色と透明度はトークンで指定する（未設定なら部品の色のまま）
    'disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity)',
    'data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity)',
    // 送信中: 押せない。下端の線を角丸で切り抜く
    'data-loading:cursor-progress data-loading:overflow-hidden',
  ],
  variants: {
    variant: {
      filled: [
        'text-(color:--button-text) [--button-bg:var(--button-fill)]',
        '[--button-accent:var(--button-fill)] [--button-ink:var(--button-text)]',
        // 押したときの影は --shadow-raised-press（hover と同じ輪郭の線だけ — design/adr/0033）
        'shadow-raised not-[:disabled,[data-disabled]]:not-data-loading:hover:shadow-raised-hover not-[:disabled,[data-disabled]]:not-data-loading:active:translate-y-(--press-depth) not-[:disabled,[data-disabled]]:not-data-loading:active:shadow-(--shadow-raised-press)',
        'disabled:text-[color:var(--color-on-disabled,var(--button-text))] disabled:shadow-none disabled:[--button-bg:var(--color-disabled,var(--button-fill))]',
        'data-disabled:text-[color:var(--color-on-disabled,var(--button-text))] data-disabled:shadow-none data-disabled:[--button-bg:var(--color-disabled,var(--button-fill))]',
        // 送信中: Disabled の「本体を薄くする」を、塗りと文字の色で表す（文字は地の色に混ぜる）
        'data-loading:text-[color:color-mix(in_oklab,var(--button-text)_calc(var(--disabled-opacity)*100%),var(--color-bg))] data-loading:shadow-none data-loading:[--button-bg:color-mix(in_oklab,var(--button-fill)_calc(var(--disabled-opacity)*100%),transparent)]',
      ],
      // 枠線のボタンは平らな要素（原則3）: hover と押下で文字の色を淡く敷き、押下で 1px 沈む（design/adr/0027）
      //   敷く色は --color-flat-hover・--color-flat-press と同じ濃さ。登録した変数（--button-bg）は currentColor を補間できないので、
      //   文字の色（--button-ink。色付きは --button-line、グレー・白は --color-fg）を --flat-hover-mix・--flat-press-mix で混ぜる（ADR-0112）
      outline: [
        'border-(length:--border-width-medium) border-(color:--button-line) text-(color:--button-line) [--button-bg:transparent]',
        '[--button-accent:var(--button-line)] [--button-ink:var(--button-line)]',
        'not-[:disabled,[data-disabled]]:not-data-loading:hover:[--button-bg:color-mix(in_oklab,var(--button-ink)_var(--flat-hover-mix),transparent)] not-[:disabled,[data-disabled]]:not-data-loading:active:translate-y-(--flat-press-depth) not-[:disabled,[data-disabled]]:not-data-loading:active:[--button-bg:color-mix(in_oklab,var(--button-ink)_var(--flat-press-mix),transparent)]',
        'disabled:border-[color:var(--color-disabled-fg,var(--button-line))] disabled:text-[color:var(--color-disabled-fg,var(--button-line))]',
        'data-disabled:border-[color:var(--color-disabled-fg,var(--button-line))] data-disabled:text-[color:var(--color-disabled-fg,var(--button-line))]',
        'data-loading:border-[color:color-mix(in_oklab,var(--button-line)_calc(var(--disabled-opacity)*100%),transparent)] data-loading:text-[color:color-mix(in_oklab,var(--button-line)_calc(var(--disabled-opacity)*100%),transparent)]',
      ],
      // いちばん軽い押すもの（軸 174）: 塗りも枠線もなく、文字に淡い下線だけが付く
      //   文字（色・太さ・大きさ・字間）と寸法・左右の余白・角丸・フォーカスの線は、枠線のボタンとまったく同じ。
      //   色は下の compoundVariants が枠線のボタンと共有して入れる（--button-line）
      //   下線は文字にだけ引く。inline-flex の中では、文字の項目にだけ線が引かれ、アイコンには付かない
      //     （アイコンだけのボタンは、下線も枠線もない形になる）
      //   色は文字のリンクの下線と同じ考えで、文字の色を透かした淡さ（--color-link-underline）。太さと位置も文字のリンクと同じ
      //   hover・押下は枠線のボタンと同じ（文字の色を淡く敷き、押下で 1px 沈む — design/adr/0027）。
      //     押せる範囲は部品の大きさのままなので、hover の塗りが押せる広さを見せる（原則17）
      //     下線は hover で変えない。塗りで手応えが伝わるので、二重に動かさない（文字のリンクとはここが違う）
      //   押せないとき・送信中: 押せないボタンと同じ文字の色にし、下線は外す
      underline: [
        'text-(color:--button-line) [--button-bg:transparent]',
        '[--button-accent:var(--button-line)] [--button-ink:var(--button-line)]',
        'underline [text-decoration-color:var(--color-link-underline)] decoration-1 underline-offset-4',
        'not-[:disabled,[data-disabled]]:not-data-loading:hover:[--button-bg:color-mix(in_oklab,var(--button-ink)_var(--flat-hover-mix),transparent)] not-[:disabled,[data-disabled]]:not-data-loading:active:translate-y-(--flat-press-depth) not-[:disabled,[data-disabled]]:not-data-loading:active:[--button-bg:color-mix(in_oklab,var(--button-ink)_var(--flat-press-mix),transparent)]',
        'disabled:text-[color:var(--color-disabled-fg,var(--button-line))] disabled:no-underline',
        'data-disabled:text-[color:var(--color-disabled-fg,var(--button-line))] data-disabled:no-underline',
        'data-loading:text-[color:color-mix(in_oklab,var(--button-line)_calc(var(--disabled-opacity)*100%),transparent)] data-loading:no-underline',
      ],
    },
    // 利用者が選ぶ色（原則6）。指定しないときはグレー（neutral）— design/adr/0028
    // white は白いボタン。白い地では影だけでは区別がつかないので、輪郭も付ける（design/adr/0024・0025）
    // --color-own-focus: フォーカスの線を部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）の線の色。ピンクは前景用
    //   neutral・white は置かない（線は --color-focus-ring のまま）
    color: {
      primary: '[--color-own-focus:var(--color-primary)]',
      secondary: '[--color-own-focus:var(--color-fg-secondary)]',
      danger: '[--color-own-focus:var(--color-fg-danger)]',
      neutral: '',
      white: '',
    },
  },
  compoundVariants: [
    {
      variant: 'filled',
      color: 'primary',
      class: '[--button-fill:var(--color-primary)] [--button-text:var(--color-on-primary)]',
    },
    // 白文字を載せるので、ピンクは前景用（原則12）
    {
      variant: 'filled',
      color: 'secondary',
      class: '[--button-fill:var(--color-fg-secondary)] [--button-text:var(--color-on-secondary)]',
    },
    {
      variant: 'filled',
      color: 'danger',
      class: '[--button-fill:var(--color-danger)] [--button-text:var(--color-on-danger)]',
    },
    {
      variant: 'filled',
      color: 'neutral',
      // グレーのボタンの Disabled は、薄くせず、塗りと文字の色を近づける（design/adr/0026）
      class: [
        '[--button-accent:var(--color-fg)] [--button-fill:var(--color-neutral)] [--button-text:var(--color-fg)]',
        // 枠線は付けず、影はほかの塗りのボタンと同じ — design/adr/0033
        'disabled:opacity-100',
        'disabled:[--color-disabled:var(--color-neutral-disabled)] disabled:[--color-on-disabled:var(--color-on-neutral-disabled)]',
        'data-disabled:opacity-100',
        'data-disabled:[--color-disabled:var(--color-neutral-disabled)] data-disabled:[--color-on-disabled:var(--color-on-neutral-disabled)]',
        'data-loading:text-(color:--color-on-neutral-disabled) data-loading:[--button-bg:var(--color-neutral-disabled)]',
      ],
    },
    {
      variant: 'filled',
      color: 'white',
      class: [
        '[--button-accent:var(--color-fg)] [--button-fill:var(--color-surface)] [--button-text:var(--color-fg)]',
        'border-(length:--border-width-thin) border-surface-line',
        'data-loading:border-[color:color-mix(in_oklab,var(--color-surface-line)_calc(var(--disabled-opacity)*100%),transparent)]',
      ],
    },
    // 枠線のボタンと下線のボタンは、文字の色を共有する（軸 174）。枠線のボタンの --button-line が、下線のボタンの文字の色になる
    {
      variant: ['outline', 'underline'],
      color: 'primary',
      class: '[--button-line:var(--color-primary)]',
    },
    {
      variant: ['outline', 'underline'],
      color: 'secondary',
      class: '[--button-line:var(--color-fg-secondary)]',
    },
    {
      variant: ['outline', 'underline'],
      color: 'danger',
      class: '[--button-line:var(--color-fg-danger)]',
    },
    // 色を持たない枠線のボタンは、枠線を細い境界線の色に、文字を本文の色にする
    // Disabled は、色を持つ枠線のボタン（薄くする）とは別に指定する — design/adr/0029
    {
      variant: ['outline', 'underline'],
      color: ['neutral', 'white'],
      class: [
        'text-fg [--button-accent:var(--color-fg)] [--button-ink:var(--color-fg)] [--button-line:var(--color-line)]',
        // 薄くせず、枠線と文字をグレーにする。枠線の太さと塗り（なし）は押せるときと同じ
        'disabled:opacity-100',
        'disabled:border-(color:--color-outline-neutral-disabled-line) disabled:text-(color:--color-outline-neutral-disabled-text)',
        'data-disabled:opacity-100',
        'data-disabled:border-(color:--color-outline-neutral-disabled-line) data-disabled:text-(color:--color-outline-neutral-disabled-text)',
        'data-loading:border-(color:--color-outline-neutral-disabled-line) data-loading:text-(color:--color-outline-neutral-disabled-text)',
      ],
    },
  ],
  defaultVariants: { variant: 'filled', color: 'neutral' },
});

// アイコンだけのボタン（iconOnly）: 部品の高さの正方形（幅の下限を高さと同じにし、左右の余白をなくす）
//   形（shape）: square（既定）は文字のボタンと同じ部品の角、circle は丸（pill）— 軸 101
//   中に文字が加わったとき（CopyButton の「コピーしました」）は、使う側が左右の余白を足して横に伸ばす
//   アイコンは単体なので太い線（design/adr/0018）。読み上げの名前（aria-label）は型で必須にする
const iconOnlyClass = {
  square: 'min-w-(--spacing-control) px-0 rounded-control',
  circle: 'min-w-(--spacing-control) px-0 rounded-pill',
} as const;

/** アイコンだけのボタンの形 */
export type ButtonShape = keyof typeof iconOnlyClass;

// キャプション（原則4）: ボタンの下に中央寄せで、小さくグレーの文字。間・大きさ・色は比べている途中（後半の軸 31）
// ボタンとキャプションを包み（root）、className は包みに付ける（Switch・TextField と同じく、いちばん外の要素に付く）
//   ボタンは包みの幅いっぱいに伸ばす（items-stretch）。包みに w-full を付けると、幅いっぱいのボタンになる
//   キャプションは包みの幅を広げない（w-0 min-w-full）。包みの幅はボタンの幅で決まり、長いキャプションは折り返す
// 間と文字の大きさは入力欄のキャプションと同じ（ADR-0052）。どちらも密度で変わる
// 押せないとき・送信中も、キャプションは薄くしない（原則1）。ボタンの外にあるので、ボタンの薄さを受けない
// 読み上げでは、キャプションをボタン（リンクのときは <a>）の説明（aria-describedby）につなぐ
//   渡された説明があるときは、その後ろに足す（TextField と同じく、渡された説明 → キャプションの順）
// ref は包みではなくボタン（<a>）に付く。className だけを包みに付けるのは、包みの幅（w-full など）を決められるようにするため
const captioned = tv({
  slots: {
    root: ['inline-flex flex-col items-stretch', 'gap-(--spacing-field-gap)'],
    caption: [
      'w-0 min-w-full text-center font-normal',
      'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
    ],
  },
});

/** ボタンとキャプションを包む。キャプションがないときは、ボタンをそのまま返す */
function withCaption(
  element: ReactElement,
  caption: ReactNode,
  className: string | undefined,
  captionId: string
) {
  if (!caption) return element;
  const s = captioned();
  return (
    <span data-slot="button-root" className={s.root({ className })}>
      {element}
      <span id={captionId} data-slot="button-caption" className={s.caption()}>
        {caption}
      </span>
    </span>
  );
}

/** id の並び（aria-describedby）をつなぐ。空のものは除き、同じ id は1回だけにする */
function joinIds(...lists: unknown[]) {
  const ids = lists.flatMap((list) =>
    typeof list === 'string' ? list.split(/\s+/).filter(Boolean) : []
  );
  return [...new Set(ids)].join(' ') || undefined;
}

// Button は押すもの（<button>）だけを描く。移動するものは Link で作る（`<Link variant="button">` — ADR-0253）
// ボタンの見た目のリンクは、Link が中で使う ButtonLink（この下）。公開の入口には出さない
// ButtonLinkProps は、リンク（<a>）の属性をもとにする。form・name などボタンだけの属性は通さず、onClick の要素は HTMLAnchorElement
type ButtonBaseProps = Omit<ComponentProps<'button'>, 'color' | 'type'> &
  VariantProps<typeof button>;
type ButtonLinkBaseProps = Omit<ComponentProps<'a'>, 'color' | 'type'> &
  VariantProps<typeof button>;

/** ボタンとボタンの見た目のリンクで共通の props */
interface ButtonCaptionProps {
  /**
   * キャプション（原則4）。ボタンの下に中央寄せで、小さくグレーの文字で出します。
   * 押せないとき・送信中も薄くしません（原則1）。「変更できません」などの理由を読めるままにするためです。
   * 読み上げでは、ボタンの説明（aria-describedby）になります。aria-describedby を渡したときは、その後ろにつなぎます。
   * 渡すと、ボタンとキャプションを包む要素ができ、className はその包みに付きます。包みの幅を決められるようにするためで、
   * 幅いっぱいにするときは className="w-full" を渡します。ref は包みではなく、ボタン（リンクのときは `<a>`）に付きます。
   * キャプションはボタンの幅に収め、長いときは折り返します
   */
  caption?: ReactNode;
}

/** ボタン（<button>）の props */
export interface ButtonProps extends ButtonBaseProps, ButtonCaptionProps {
  /**
   * ボタンの中身。文字と、その前後に置くアイコンを並べます。
   * アイコンは生の svg ではなく Icon で包みます（`<Icon icon={PlusIcon} />`。アイコンだけのボタンは `standalone` を付けます）。
   * 移動するもの（href で移るもの）はボタンではなく Link で作ります（`<Link variant="button">`）
   */
  children?: ReactNode;
  /**
   * いちばん外の要素（button）に付きます。caption を渡したときは、ボタンとキャプションの包みに付きます
   */
  className?: string;
  /**
   * ボタンの種類（素の HTML と同じ）。submit は Form を送ります
   * @default 'button'
   */
  type?: ComponentProps<'button'>['type'];
  /**
   * アイコンだけのボタンにします。部品の高さの正方形になります。
   * 文字がないので、読み上げの名前を aria-label で必ず付けます（ButtonIconOnlyProps）。
   * アイコンは単体の太い線（Icon の standalone）で置きます
   * @default false
   */
  iconOnly?: false;
  /** 形はアイコンだけのボタン（iconOnly）でだけ選べる */
  shape?: never;
  /**
   * 送信中。押せないボタンと同じ見た目になり、押しても onClick を呼ばない（フォームも送信しない）。
   * disabled と違い、フォーカスは外れない（aria-disabled・aria-busy）。
   * Form の中の送信のボタン（type="submit"）は、渡さなければ Form の submitting を受け取ります。
   * 送信中の印は押したボタン（Enter で送ったときはフォームの最初の送信のボタン）にだけ出し、ほかの送信のボタンは押せない見た目にするだけです。
   * 渡したときは、Form の submitting よりその値を優先します
   */
  loading?: boolean;
  /**
   * 送信中の印。spinner は回る円、bar は下端に流れる線です。回る円は、ふだんはラベルを55%に薄くして重ね、
   * inlineSpinner を付けるとラベルの左に置きます。印そのものは薄くしません（原則1、design/adr/0034）。
   * @default 'spinner'
   */
  loadingIndicator?: LoadingIndicator;
  /**
   * 回る円（loadingIndicator="spinner"）を、ラベルに重ねずにラベルの左に置きます。bar のときは使いません
   * @default false
   */
  inlineSpinner?: boolean;
  /**
   * 見た目。filled は塗り、outline は枠線、underline は塗りも枠線もなく文字に淡い下線だけが付く形です。
   * 画面内で最も進めたい操作は filled、それ以外は outline、いちばん軽く見せたい操作（カードの右上の操作、
   * 表の行末など密度の高い並び）は underline にします（原則7）。
   * underline の文字は outline とまったく同じで、hover と押下も同じです（押せる範囲は部品の大きさのまま）。
   * @default 'filled'
   */
  variant?: VariantProps<typeof button>['variant'];
  /**
   * 利用者が選ぶ色（原則6）。primary は進めたい操作、secondary は用途を限定しない選べる色、
   * danger は削除など危険な操作に使います。white は白いボタンで、枠線と影で押せることを示します
   * （design/adr/0024・0025）。指定しないときは既定のグレー（neutral）になります。
   * @default 'neutral'
   */
  color?: VariantProps<typeof button>['color'];
}

/** アイコンだけのボタン（iconOnly）の props。読み上げの名前（aria-label）が要ります */
export interface ButtonIconOnlyProps extends Omit<
  ButtonProps,
  'iconOnly' | 'shape' | 'aria-label'
> {
  /** アイコンだけのボタンにします。部品の高さの正方形になります */
  iconOnly: true;
  /**
   * 形。square は文字のボタンと同じ角の正方形、circle は丸です。
   * 中に文字が加わって横に伸びたときは、square は同じ角のまま、circle は両端の丸い形になります
   * @default 'square'
   */
  shape?: ButtonShape;
  /** 読み上げの名前。文字がないので必ず付けます（例: 「削除」「コピー」） */
  'aria-label': string;
}

/**
 * ボタンの見た目のリンク（ButtonLink）の props。公開しない
 * 利用者は Link（`<Link variant="button">`）を使う。この型は Link が中で使う
 */
export interface ButtonLinkProps extends ButtonLinkBaseProps, ButtonCaptionProps {
  /**
   * 描く要素（Base UI の render と同じ）。`<a href>` や Next.js の Link を渡すと、Button と同じ見た目のリンクになる。
   * href・target は渡す要素に書き（例: `render={<NextLink href="/works" />}`）、ラベルは children に書く。
   * リンクのときは、右上向きの矢印（↗）を必ず最後に付ける。disabled は押せないリンクになる（design/adr/0046）
   */
  render: ReactElement;
  /**
   * 押せないリンクにする。href のない `<a role="link" aria-disabled="true">` になり、Tab で止まらず、押しても何もしない。
   * 見た目は押せないボタンと同じ（design/adr/0046）
   */
  disabled?: boolean;
  /** リンクは送信中を持たない（型で止める。渡されても無視し、開発時に警告する） */
  loading?: never;
  loadingIndicator?: never;
  inlineSpinner?: never;
  /** リンクには付けない */
  type?: never;
  /**
   * アイコンだけのリンクにします。部品の高さの正方形になり、右上向きの矢印（↗）は付けません（入る場所がないため）。
   * 読み上げの名前は aria-label で付けます。移動するものは Link で作ります（`<Link variant="button">`）
   * @default false
   */
  iconOnly?: boolean;
  /**
   * アイコンだけのリンクの形。square は文字のボタンと同じ角の正方形、circle は丸です
   * @default 'square'
   */
  shape?: ButtonShape;
  /**
   * 見た目。filled は塗り、outline は枠線、underline は文字に淡い下線だけが付く形です。
   * 画面内で最も進めたい操作は filled、それ以外は outline、いちばん軽く見せたい操作は underline にします（原則7）。
   * ボタンの見た目のリンクでも角丸は 12px のままで、リンクは pill という規則の例外にはなりません（design/adr/0046）。
   * @default 'filled'
   */
  variant?: VariantProps<typeof button>['variant'];
  /**
   * 利用者が選ぶ色（原則6）。primary は進めたい操作、secondary は用途を限定しない選べる色、
   * danger は削除など危険な操作に使います。white は白いボタンで、枠線と影で押せることを示します
   * （design/adr/0024・0025）。指定しないときは既定のグレー（neutral）になります。
   * @default 'neutral'
   */
  color?: VariantProps<typeof button>['color'];
}

/**
 * ボタンの見た目のリンク（Link の variant="button"・"underline" — design/adr/0046）。公開しない
 * 利用者は Link で作る（`<Link variant="button">`）。Link がこの部品を描く
 * 見た目は Button と同じで、要素だけが渡した要素（<a>）になる。キーボードではリンクのまま（Enter で移り、Space では移らない）
 * 右上向きの矢印（↗）を必ず最後に付け、ボタンと見分ける。飾りなので読み上げない（aria-hidden）
 *   利用者が最後に ArrowUpRightIcon を置いたときは、足さない（2つにならない）。ほかのアイコンは、その後ろに ↗ が付く
 * 新しいタブで開く（渡した要素の target="_blank"）ときは、読み上げに「新しいタブで開きます」を足し、rel="noopener noreferrer" を付ける
 *   名前を aria-label・aria-labelledby で付けたときは、名前そのものに足す（Link と同じ。link-parts の newTabNaming）
 * 押せないとき（disabled）: 渡した要素は描かず、href のない <a role="link" aria-disabled="true"> にする。読み上げでは「リンク、利用不可」
 *   見た目は <Button disabled> と同じ（data-disabled）。↗ は残す。Tab では止まらず、押しても何もしない（onClick も呼ばない）
 * リンクは送信中を持たない。loading・loadingIndicator・inlineSpinner・type は型で止める。型を外して渡されたときは、無視して開発時に警告する
 * キャプション（caption）はボタンと同じく、リンクの下に出し、リンクの説明（aria-describedby）につなぐ（包みは withCaption）
 */
export function ButtonLink({
  variant,
  color,
  className,
  render,
  loading,
  loadingIndicator,
  inlineSpinner,
  disabled,
  type,
  caption,
  children,
  ref,
  iconOnly = false,
  shape = 'square',
  ...props
}: ButtonLinkProps) {
  if (loading !== undefined || loadingIndicator !== undefined || inlineSpinner !== undefined)
    warnOnce(
      'Link: ボタンの見た目のリンクは送信中を持ちません。loading は無視します（design/adr/0046）'
    );
  if (type !== undefined) warnOnce('Link: リンクには type を付けません（design/adr/0046）');
  const captionId = useId();
  const noteId = useId();
  // 新しいタブで開くかは、渡した要素（render）と、部品に渡された props の両方で見る
  // （Link の variant="button" は、href・target を props で受けて、ここに渡す）
  const newTab = !disabled && (opensNewTab(render) || props.target === '_blank');
  // 新しいタブで開くときの名前と、読み上げだけの文（Link と同じ）
  const naming = newTab ? newTabNaming(props, render, noteId) : null;
  // 説明は、渡された説明（部品の props と渡した要素の両方）→ キャプションの順
  const overrides = {
    ...naming?.props,
    'aria-describedby': joinIds(
      props['aria-describedby'],
      renderPropOf(render, 'aria-describedby'),
      caption ? captionId : undefined
    ),
  };
  const element = useRender({
    // 渡した要素にも名前・説明があるときは、要素の側を書き換える（要素の props が勝つため）
    render: withRenderOverrides(disabled ? disabledAnchor(render) : render, overrides),
    ref,
    props: {
      ...(disabled ? { ...withoutNavigation(props), ...disabledLinkProps } : props),
      ...overrides,
      rel: newTab ? 'noopener noreferrer' : undefined,
      'data-icon-only': iconOnly ? shape : undefined,
      // キャプションがあるときは、className は包みに付ける
      className: button({
        variant,
        color,
        className: [iconOnly && iconOnlyClass[shape], caption ? undefined : className],
      }),
      children: (
        <>
          {children}
          {/* アイコンだけのリンクには ↗ を足さない（正方形に 2 つのアイコンは入らない。枠線のリンクと同じ） */}
          {!iconOnly && !endsWithElement(children, ArrowUpRightIcon) && <ArrowUpRightIcon />}
          {/* sr-only は絶対配置なので、位置の基準（relative）を持つ要素の中に置く（Button は relative） */}
          {naming?.note}
        </>
      ),
    },
  });
  return withCaption(element, caption, className, captionId);
}

/**
 * ボタンです。移動するもの（href で移るもの）は Link で作ります（`<Link variant="button">`）。
 *
 * 中のアイコンは Icon で包みます（`<Icon icon={PlusIcon} />`）。アイコンだけのボタン（iconOnly）は、
 * 読み上げの名前を aria-label で付け、アイコンに `standalone` を付けます。
 *
 * 型はふつうのボタンとアイコンだけのボタンの 2 つで重ねます（overload）。アイコンだけのボタンでは aria-label が要ります
 */
export function Button(props: ButtonIconOnlyProps): ReactElement;
export function Button(props: ButtonProps): ReactElement;
export function Button(allProps: ButtonProps | ButtonIconOnlyProps) {
  // キャプションがなければ <button> をそのまま返す（比較のストーリーが class を読むため）
  return <NativeButton {...allProps} />;
}

/**
 * ボタン（<button>）
 * Form の中の送信のボタン（type="submit"）は、loading を渡さなければ Form の送信中（submitting）を受け取る
 *   押したボタン（Form が配る submitter）は送信中そのもの（印・aria-busy）。ほかの送信のボタンは、送信中と同じ押せない見た目にし、
 *   押しても送らない（aria-disabled）が、印は出さない。どのボタンが押されたかは、自分の要素と submitter を比べて決める
 *   loading を渡したときは、その値を優先する（false なら Form が送っていても押せる）
 */
function NativeButton({
  variant,
  color,
  className,
  type = 'button',
  loading,
  loadingIndicator = 'spinner',
  inlineSpinner = false,
  caption,
  iconOnly = false,
  shape = 'square',
  onClick,
  children,
  ref,
  'aria-describedby': ariaDescribedBy,
  ...props
}: ButtonProps | ButtonIconOnlyProps) {
  if (iconOnly && !props['aria-label'] && !props['aria-labelledby'])
    warnOnce('Button: アイコンだけのボタン（iconOnly）には aria-label で読み上げの名前を付けます');
  const captionId = useId();
  const form = use(FormSubmitContext);
  const submit = form !== null && type === 'submit';
  // 送信のボタンは、自分の要素を覚えて、Form の submitter と比べる（ref は利用者のものにもつなぐ）
  const [self, setSelf] = useState<HTMLButtonElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      setSelf(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const formBusy = submit && loading === undefined && form.submitting;
  // busy: 押せない見た目にし、押しても何もしない。marked: 送信中の印（回る円・線）を出す
  const busy = loading ?? formBusy;
  const marked = loading ?? (formBusy && self !== null && form.submitter === self);
  // 回る円は、ラベルに重ねる（既定）か、ラベルの左に置く（inlineSpinner）。線のときは inlineSpinner を見ない
  const overlay = marked && loadingIndicator === 'spinner' && !inlineSpinner;
  const inline = marked && loadingIndicator === 'spinner' && inlineSpinner;
  const element = (
    <button
      type={type}
      {...props}
      ref={submit ? setRefs : ref}
      aria-describedby={joinIds(ariaDescribedBy, caption ? captionId : undefined)}
      data-loading={busy || undefined}
      aria-busy={marked || undefined}
      aria-disabled={busy || props['aria-disabled']}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      // キャプションがあるときは、className は包みに付ける
      data-icon-only={iconOnly ? shape : undefined}
      className={button({
        variant,
        color,
        className: [iconOnly && iconOnlyClass[shape], caption ? undefined : className],
      })}
    >
      {inline && <Spinner className="text-(color:--button-ink)" />}
      {/* loading を使うボタン（Form の中の送信のボタンも）は、ラベルを包んで薄くできるようにする（包みは送信中でも変えない） */}
      {loading === undefined && !submit ? (
        children
      ) : (
        <span
          className={[
            'inline-flex items-center gap-2 [transition:opacity_var(--duration-loading)_var(--ease-press)] motion-reduce:[transition:none]',
            overlay && 'opacity-(--loading-label-opacity)',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </span>
      )}
      {overlay && (
        <span
          aria-hidden
          className="absolute inset-0 flex animate-loading-in items-center justify-center"
        >
          <Spinner className="text-(color:--button-ink)" />
        </span>
      )}
      {marked && loadingIndicator === 'bar' && (
        <LoadingBar className="bg-(color:--button-accent)" />
      )}
    </button>
  );
  return withCaption(element, caption, className, captionId);
}
