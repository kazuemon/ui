import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from './focus-styles';
import { ArrowUpRightIcon } from './icons';
import {
  disabledAnchor,
  disabledLinkProps,
  endsWithElement,
  NewTabNote,
  opensNewTab,
  warnOnce,
  withoutNavigation,
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
    color: { primary: '', secondary: '', danger: '', neutral: '', white: '' },
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

// Props は、ボタン（render なし — ButtonProps）とリンク（render あり — ButtonLinkProps）の2つの形に分ける（design/adr/0046）
// リンクは送信中を持たないので、render と一緒には loading・loadingIndicator・inlineSpinner・type を渡せない（型で止める）
// ButtonProps は、いままでどおりボタンの props の名前（interface で extends できるよう、2つをまとめた union にはしない）
type ButtonBaseProps = Omit<ComponentProps<'button'>, 'color' | 'type'> &
  VariantProps<typeof button>;

/** ボタン（<button>）の props */
export interface ButtonProps extends ButtonBaseProps {
  /** @default 'button' */
  type?: ComponentProps<'button'>['type'];
  /**
   * 送信中。押せないボタンと同じ見た目になり、押しても onClick を呼ばない（フォームも送信しない）。
   * disabled と違い、フォーカスは外れない（aria-disabled・aria-busy）
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
export interface ButtonLinkProps extends ButtonBaseProps {
  /**
   * 描く要素（Base UI の render と同じ）。`<a href>` や Next.js の Link を渡すと、Button と同じ見た目のリンクになる。
   * href・target は渡す要素に書き（例: `render={<NextLink href="/works" />}`）、ラベルは Button の children に書く。
   * リンクのときは、右上向きの矢印（↗）を必ず最後に付ける。disabled は押せないリンクになる（design/adr/0046）
   */
  render: ReactElement;
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
 * 押せないとき（disabled）: 渡した要素は描かず、href のない <a role="link" aria-disabled="true"> にする
 *   見た目は <Button disabled> と同じ（data-disabled）。↗ は残す。Tab では止まらず、押しても何もしない（onClick も呼ばない）
 * リンクは送信中を持たない。loading・loadingIndicator・inlineSpinner・type は型で止める。型を外して渡されたときは、無視して開発時に警告する
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
  const newTab = !disabled && opensNewTab(render);
  return useRender({
    render: disabled ? disabledAnchor(render) : render,
    ref,
    props: {
      ...(disabled ? { ...withoutNavigation(props), ...disabledLinkProps } : props),
      rel: newTab ? 'noopener noreferrer' : undefined,
      className: button({ appearance, color, className }),
      children: (
        <>
          {children}
          {!endsWithElement(children, ArrowUpRightIcon) && <ArrowUpRightIcon />}
          {/* sr-only は絶対配置なので、位置の基準（relative）を持つ要素の中に置く（Button は relative） */}
          {newTab && <NewTabNote />}
        </>
      ),
    },
  });
}

/**
 * ボタン。render を渡すと、同じ見た目のリンクになる（上の ButtonLink）
 */
export function Button(allProps: ButtonProps | ButtonLinkProps) {
  // リンクのときは別の部品で描く。ボタンのときは <button> をそのまま返す（比較のストーリーが class を読むため）
  if (allProps.render) return <ButtonLink {...allProps} />;
  const {
    appearance,
    color,
    className,
    type = 'button',
    loading,
    loadingIndicator = 'spinner',
    inlineSpinner = false,
    onClick,
    children,
    render: _render,
    ...props
  } = allProps;
  const busy = !!loading;
  // 回る円は、ラベルに重ねる（既定）か、ラベルの左に置く（inlineSpinner）。線のときは inlineSpinner を見ない
  const overlay = busy && loadingIndicator === 'spinner' && !inlineSpinner;
  const inline = busy && loadingIndicator === 'spinner' && inlineSpinner;
  return (
    <button
      type={type}
      {...props}
      data-loading={busy || undefined}
      aria-busy={busy || undefined}
      aria-disabled={busy || props['aria-disabled']}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={button({ appearance, color, className })}
    >
      {inline && <Spinner className="text-(color:--button-ink)" />}
      {/* loading を使うボタンは、ラベルを包んで薄くできるようにする（包みは送信中でも変えない） */}
      {loading === undefined ? (
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
      {busy && loadingIndicator === 'bar' && <LoadingBar className="bg-(color:--button-accent)" />}
    </button>
  );
}
