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
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from './focus-styles';
import { FormSubmitContext } from './form-context';
import { ArrowUpRightIcon } from './icons';
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
} from './link-parts';
import { type LoadingIndicator, LoadingBar, Spinner } from './Loading';

// 原則1: 影は「押せること」の記号。塗りのボタンにだけ付ける（design/adr/0006）
// 原則3: hover で影が輪郭だけになり、押下で 1px 沈む（design/adr/0009）。押しても輪郭の線は残す（design/adr/0033）
// 原則7: 画面内で最も進めたい操作は塗り、それ以外は枠線
// 色は --button-fill・--button-text・--button-line に入れ、Disabled のときだけ差し替える
// 送信中（loading、design/adr/0034）: 押せないボタンと同じ見た目にし、送信中の印を出す。data-loading で表す
//   印（回る円・線）は薄くしないので、ボタン全体を薄くする opacity は使わず、塗り・文字・枠線の色を
//   Disabled の薄さ（--disabled-opacity）で混ぜた色にする。白地の上では Disabled と同じ色になる
//   印の色: 回る円は元の文字の色（--button-ink）、線はボタンの濃い色（--button-accent）
//   印は src/components/Loading.tsx（入力欄と共有）。動きを減らす設定では、回る円は3秒で1周、線は幅いっぱいで明滅する（design/adr/0042）
// hover と押下は、押せるとき（:disabled でも data-disabled でもない）で送信中でないとき（not-data-loading）だけ
//   not-[:disabled,[data-disabled]] は :not(:is(:disabled, [data-disabled]))。:not(:disabled) と詳細度は同じ
// ボタンの見た目のリンク（render — design/adr/0046）: 下の ButtonLink
//   押せないリンク（<a> は :disabled にならない）には data-disabled を付け、disabled: と同じ Disabled を data-disabled: で当てる
const button = tv({
  base: [
    'relative inline-flex h-(--size-control) shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control px-(--space-control-x) whitespace-nowrap',
    'text-(length:--text-control) leading-(--leading-control) font-bold select-none',
    // キーボードで操作したときのフォーカス（design/adr/0031）。線の隙間と色は --focus-ring-duration で動かす
    ...focusRing,
    // 押下は --duration-press、送信中への切り替わり（色・薄さ）は --duration-loading で動かす
    // 塗りは押下（枠線のボタン）と送信中の両方で変わるので、送信中だけ --duration-loading にする
    '[transition:box-shadow_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),background-color_var(--button-bg-duration)_var(--ease-press),color_var(--duration-loading)_var(--ease-press),border-color_var(--duration-loading)_var(--ease-press),opacity_var(--duration-loading)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    '[--button-bg-duration:var(--duration-press)] data-loading:[--button-bg-duration:var(--duration-loading)]',
    'motion-reduce:[transition:none]',
    // Disabled（原則1、design/adr/0026）: 影をなくす。塗り・文字の色と透明度はトークンで指定する（未設定なら部品の色のまま）
    'disabled:cursor-not-allowed disabled:opacity-(--disabled-opacity)',
    'data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity)',
    // 送信中: 押せない。下端の線を角丸で切り抜く
    'data-loading:cursor-progress data-loading:overflow-hidden',
  ],
  variants: {
    appearance: {
      filled: [
        'bg-(color:--button-fill) text-(color:--button-text)',
        '[--button-accent:var(--button-fill)] [--button-ink:var(--button-text)]',
        // 押したときの影は --shadow-raised-press（hover と同じ輪郭の線だけ — design/adr/0033）
        'shadow-raised not-[:disabled,[data-disabled]]:not-data-loading:hover:shadow-raised-hover not-[:disabled,[data-disabled]]:not-data-loading:active:translate-y-(--press-depth) not-[:disabled,[data-disabled]]:not-data-loading:active:shadow-(--shadow-raised-press)',
        'disabled:bg-[color:var(--color-disabled,var(--button-fill))] disabled:text-[color:var(--color-on-disabled,var(--button-text))] disabled:shadow-none',
        'data-disabled:bg-[color:var(--color-disabled,var(--button-fill))] data-disabled:text-[color:var(--color-on-disabled,var(--button-text))] data-disabled:shadow-none',
        // 送信中: Disabled の「本体を薄くする」を、塗りと文字の色で表す（文字は地の色に混ぜる）
        'data-loading:bg-[color:color-mix(in_oklab,var(--button-fill)_calc(var(--disabled-opacity)*100%),transparent)] data-loading:text-[color:color-mix(in_oklab,var(--button-text)_calc(var(--disabled-opacity)*100%),var(--color-bg))] data-loading:shadow-none',
      ],
      // 枠線のボタンは平らな要素（原則3）: hover と押下で文字の色を淡く敷き、押下で 1px 沈む（design/adr/0027）
      outline: [
        'border-[1.5px] border-(color:--button-line) bg-transparent text-(color:--button-line)',
        '[--button-accent:var(--button-line)] [--button-ink:var(--button-line)]',
        'not-[:disabled,[data-disabled]]:not-data-loading:hover:bg-flat-hover not-[:disabled,[data-disabled]]:not-data-loading:active:translate-y-(--flat-press-depth) not-[:disabled,[data-disabled]]:not-data-loading:active:bg-flat-press',
        'disabled:border-[color:var(--color-disabled-fg,var(--button-line))] disabled:text-[color:var(--color-disabled-fg,var(--button-line))]',
        'data-disabled:border-[color:var(--color-disabled-fg,var(--button-line))] data-disabled:text-[color:var(--color-disabled-fg,var(--button-line))]',
        'data-loading:border-[color:color-mix(in_oklab,var(--button-line)_calc(var(--disabled-opacity)*100%),transparent)] data-loading:text-[color:color-mix(in_oklab,var(--button-line)_calc(var(--disabled-opacity)*100%),transparent)]',
      ],
    },
    // 利用者が選ぶ色（原則6）。指定しないときはグレー（neutral）— design/adr/0028
    // white は白いボタン。白い地では影だけでは区別がつかないので、輪郭も付ける（design/adr/0024・0025）
    // --color-own-focus: フォーカスの線を部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）の線の色。ピンクは前景用
    //   neutral・white は置かない（線は --color-focus-ring のまま）
    color: {
      primary: '[--color-own-focus:var(--color-primary)]',
      secondary: '[--color-own-focus:var(--color-fg-secondary)]',
      danger: '[--color-own-focus:var(--color-danger)]',
      neutral: '',
      white: '',
    },
  },
  compoundVariants: [
    {
      appearance: 'filled',
      color: 'primary',
      class: '[--button-fill:var(--color-primary)] [--button-text:var(--color-on-primary)]',
    },
    // 白文字を載せるので、ピンクは前景用（原則12）
    {
      appearance: 'filled',
      color: 'secondary',
      class: '[--button-fill:var(--color-fg-secondary)] [--button-text:var(--color-on-secondary)]',
    },
    {
      appearance: 'filled',
      color: 'danger',
      class: '[--button-fill:var(--color-danger)] [--button-text:var(--color-on-danger)]',
    },
    {
      appearance: 'filled',
      color: 'neutral',
      // グレーのボタンの Disabled は、薄くせず、塗りと文字の色を近づける（design/adr/0026）
      class: [
        '[--button-accent:var(--color-fg)] [--button-fill:var(--color-neutral)] [--button-text:var(--color-fg)]',
        // 枠線（付けない）と影（ほかの塗りのボタンと同じ）。比べた案を比較のストーリーで再現するためトークンにしている — design/adr/0033
        'border-(length:--neutral-line-width) border-(color:--color-neutral-line)',
        'shadow-(--shadow-neutral) not-[:disabled,[data-disabled]]:not-data-loading:hover:shadow-(--shadow-neutral-hover) not-[:disabled,[data-disabled]]:not-data-loading:active:shadow-(--shadow-neutral-press)',
        'disabled:opacity-(--neutral-disabled-opacity)',
        'disabled:[--color-disabled:var(--color-neutral-disabled)] disabled:[--color-on-disabled:var(--color-on-neutral-disabled)]',
        'data-disabled:opacity-(--neutral-disabled-opacity)',
        'data-disabled:[--color-disabled:var(--color-neutral-disabled)] data-disabled:[--color-on-disabled:var(--color-on-neutral-disabled)]',
        'data-loading:bg-(color:--color-neutral-disabled) data-loading:text-(color:--color-on-neutral-disabled)',
      ],
    },
    {
      appearance: 'filled',
      color: 'white',
      class: [
        '[--button-accent:var(--color-fg)] [--button-fill:var(--color-surface)] [--button-text:var(--color-fg)]',
        'border-(length:--surface-line-width) border-surface-line',
        'data-loading:border-[color:color-mix(in_oklab,var(--color-surface-line)_calc(var(--disabled-opacity)*100%),transparent)]',
      ],
    },
    { appearance: 'outline', color: 'primary', class: '[--button-line:var(--color-primary)]' },
    {
      appearance: 'outline',
      color: 'secondary',
      class: '[--button-line:var(--color-fg-secondary)]',
    },
    { appearance: 'outline', color: 'danger', class: '[--button-line:var(--color-danger)]' },
    // 色を持たない枠線のボタンは、枠線を細い境界線の色に、文字を本文の色にする
    // Disabled は、色を持つ枠線のボタン（薄くする）とは別に指定する — design/adr/0029
    {
      appearance: 'outline',
      color: ['neutral', 'white'],
      class: [
        'text-fg [--button-accent:var(--color-fg)] [--button-ink:var(--color-fg)] [--button-line:var(--color-line)]',
        'disabled:bg-(color:--color-outline-neutral-disabled-fill) disabled:opacity-(--outline-neutral-disabled-opacity)',
        'disabled:border-(color:--color-outline-neutral-disabled-line) disabled:text-(color:--color-outline-neutral-disabled-text)',
        'disabled:border-(length:--outline-neutral-disabled-line-width)',
        'data-disabled:bg-(color:--color-outline-neutral-disabled-fill) data-disabled:opacity-(--outline-neutral-disabled-opacity)',
        'data-disabled:border-(color:--color-outline-neutral-disabled-line) data-disabled:text-(color:--color-outline-neutral-disabled-text)',
        'data-disabled:border-(length:--outline-neutral-disabled-line-width)',
        'data-loading:border-(color:--color-outline-neutral-disabled-line) data-loading:bg-(color:--color-outline-neutral-disabled-fill) data-loading:text-(color:--color-outline-neutral-disabled-text)',
        'data-loading:border-(length:--outline-neutral-disabled-line-width)',
      ],
    },
  ],
  defaultVariants: { appearance: 'filled', color: 'neutral' },
});

// キャプション（原則4）: ボタンの下に中央寄せで、小さくグレーの文字。間・大きさ・色は比べている途中（後半の軸 31）
// ボタンとキャプションを包み（root）、className は包みに付ける（Switch・TextField と同じく、いちばん外の要素に付く）
//   ボタンは包みの幅いっぱいに伸ばす（items-stretch）。包みに w-full を付けると、幅いっぱいのボタンになる
//   キャプションは包みの幅を広げない（w-0 min-w-full）。包みの幅はボタンの幅で決まり、長いキャプションは折り返す
// 間と文字の大きさは密度で変わる。指用（-coarse）とマウス用（-fine）のトークンを、--density-coarse（src/styles/globals.css。
//   指用 1・マウス用 0）でこの要素の中で選ぶ。:root で密度の値を var() で受けると、中の data-density に従わないため
// 押せないとき・送信中も、キャプションは薄くしない（原則1）。ボタンの外にあるので、ボタンの薄さを受けない
// 読み上げでは、キャプションをボタン（リンクのときは <a>）の説明（aria-describedby）につなぐ
//   渡された説明があるときは、その後ろに足す（TextField と同じく、渡された説明 → キャプションの順）
// ref は包みではなくボタン（<a>）に付く。className だけを包みに付けるのは、包みの幅（w-full など）を決められるようにするため
const captioned = tv({
  slots: {
    root: [
      'inline-flex flex-col items-stretch',
      'gap-[calc(var(--button-caption-gap-fine)_+_var(--density-coarse)_*_(var(--button-caption-gap-coarse)_-_var(--button-caption-gap-fine)))]',
    ],
    caption: [
      'w-0 min-w-full text-center font-normal',
      'text-[length:calc(var(--text-button-caption-fine)_+_var(--density-coarse)_*_(var(--text-button-caption-coarse)_-_var(--text-button-caption-fine)))]',
      'leading-(--leading-button-caption) text-(color:--color-button-caption)',
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

// Props は、ボタン（render なし — ButtonProps）とリンク（render あり — ButtonLinkProps）の2つの形に分ける（design/adr/0046）
// リンクは送信中を持たないので、render と一緒には loading・loadingIndicator・inlineSpinner・type を渡せない（型で止める）
// ButtonProps は、いままでどおりボタンの props の名前（interface で extends できるよう、2つをまとめた union にはしない）
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
  /** @default 'button' */
  type?: ComponentProps<'button'>['type'];
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
   * 見た目。filled は塗り、outline は枠線です。画面内で最も進めたい操作は filled、それ以外は outline にします（原則7）。
   * @default 'filled'
   */
  appearance?: VariantProps<typeof button>['appearance'];
  /**
   * 利用者が選ぶ色（原則6）。primary は進めたい操作、secondary は用途を限定しない選べる色、
   * danger は削除など危険な操作に使います。white は白いボタンで、枠線と影で押せることを示します
   * （design/adr/0024・0025）。指定しないときは既定のグレー（neutral）になります。
   * @default 'neutral'
   */
  color?: VariantProps<typeof button>['color'];
  render?: undefined;
}

/** ボタンの見た目のリンク（render を渡す）の props */
export interface ButtonLinkProps extends ButtonLinkBaseProps, ButtonCaptionProps {
  /**
   * 描く要素（Base UI の render と同じ）。`<a href>` や Next.js の Link を渡すと、Button と同じ見た目のリンクになる。
   * href・target は渡す要素に書き（例: `render={<NextLink href="/works" />}`）、ラベルは Button の children に書く。
   * リンクのときは、右上向きの矢印（↗）を必ず最後に付ける。disabled は押せないリンクになる（design/adr/0046）
   *
   * @deprecated 移動するものは Link で作ります（`<Link appearance="button">`）。この形は、Link が中で使うのと、
   * 過去の比較のストーリーを比べたときの見た目のまま描くために残しています
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
   * 見た目。filled は塗り、outline は枠線です。画面内で最も進めたい操作は filled、それ以外は outline にします（原則7）。
   * ボタンの見た目のリンクでも角丸は 12px のままで、リンクは pill という規則の例外にはなりません（design/adr/0046）。
   * @default 'filled'
   */
  appearance?: VariantProps<typeof button>['appearance'];
  /**
   * 利用者が選ぶ色（原則6）。primary は進めたい操作、secondary は用途を限定しない選べる色、
   * danger は削除など危険な操作に使います。white は白いボタンで、枠線と影で押せることを示します
   * （design/adr/0024・0025）。指定しないときは既定のグレー（neutral）になります。
   * @default 'neutral'
   */
  color?: VariantProps<typeof button>['color'];
}

/**
 * ボタンの見た目のリンク（Button に render を渡したとき — design/adr/0046）
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
function ButtonLink({
  appearance,
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
  ...props
}: ButtonLinkProps) {
  if (loading !== undefined || loadingIndicator !== undefined || inlineSpinner !== undefined)
    warnOnce(
      'Button: リンク（render）は送信中を持ちません。loading は無視します（design/adr/0046）'
    );
  if (type !== undefined)
    warnOnce('Button: リンク（render）には type を付けません（design/adr/0046）');
  const captionId = useId();
  const noteId = useId();
  // 新しいタブで開くかは、渡した要素（render）と、部品に渡された props の両方で見る
  // （Link の appearance="button" は、href・target を props で受けて、ここに渡す）
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
      // キャプションがあるときは、className は包みに付ける
      className: button({ appearance, color, className: caption ? undefined : className }),
      children: (
        <>
          {children}
          {!endsWithElement(children, ArrowUpRightIcon) && <ArrowUpRightIcon />}
          {/* sr-only は絶対配置なので、位置の基準（relative）を持つ要素の中に置く（Button は relative） */}
          {naming?.note}
        </>
      ),
    },
  });
  return withCaption(element, caption, className, captionId);
}

/**
 * ボタン。render を渡すと、同じ見た目のリンクになる（上の ButtonLink）
 * 型はボタンとリンクの2つの形で重ねる（overload）。props を union 1つにすると、render に要素（JSX）を渡したときに
 * どちらの形か決まらず、onClick={(e) => …} の e が any になる（JSX の要素は union を見分ける値にならない）
 */
export function Button(props: ButtonProps): ReactElement;
export function Button(props: ButtonLinkProps): ReactElement;
export function Button(allProps: ButtonProps | ButtonLinkProps) {
  // リンクのときは別の部品で描く。ボタンのときは、キャプションがなければ <button> をそのまま返す（比較のストーリーが class を読むため）
  if (allProps.render) return <ButtonLink {...allProps} />;
  return <NativeButton {...allProps} />;
}

/**
 * ボタン（<button>）。Button に render を渡さないとき
 * Form の中の送信のボタン（type="submit"）は、loading を渡さなければ Form の送信中（submitting）を受け取る
 *   押したボタン（Form が配る submitter）は送信中そのもの（印・aria-busy）。ほかの送信のボタンは、送信中と同じ押せない見た目にし、
 *   押しても送らない（aria-disabled）が、印は出さない。どのボタンが押されたかは、自分の要素と submitter を比べて決める
 *   loading を渡したときは、その値を優先する（false なら Form が送っていても押せる）
 */
function NativeButton({
  appearance,
  color,
  className,
  type = 'button',
  loading,
  loadingIndicator = 'spinner',
  inlineSpinner = false,
  caption,
  onClick,
  children,
  ref,
  render: _render,
  'aria-describedby': ariaDescribedBy,
  ...props
}: ButtonProps) {
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
      className={button({ appearance, color, className: caption ? undefined : className })}
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
