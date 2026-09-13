import { useRender } from '@base-ui/react/use-render';
import { Children, type ComponentProps, type ReactElement } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from './focus-styles';
import { ArrowUpRightIcon } from './icons';
import {
  disabledAnchor,
  disabledLinkProps,
  endsWithElement,
  NewTabNote,
  opensNewTab,
  splitTrailing,
  withoutNavigation,
} from './link-parts';

// 原則5: リンクなどの小物は pill。原則7の例外: 密度の高い並び（More、SNS のアカウント一覧）は枠線
// 影のない平らな要素なので、hover と押下は塗りの濃さで表し、押下で 1px 沈む（原則3、design/adr/0027）
// 文字のリンクの下線と hover は design/adr/0030
// 大きさ（design/adr/0039）: 枠線のリンクは、枠線のボタンと同じ寸法（--size-control ほか。密度で切り替わる）
//   文字のリンクは大きさを持たず、周りの文字のまま。押せる範囲も文字の行だけで、見えない広がりは付けない
//   広い範囲が要るときは、文字のリンクを広げずにボタンを使う（ボタンの見た目のリンクは Button の render — design/adr/0046）
// 幅いっぱいに広げた枠線のリンクの中身（contentAlign — design/adr/0046）。既定は center
//   center: 文字とアイコンをまとめて中央（ボタンと同じ寄せ方）
//   between: 文字は左、最後のアイコンは右端
//   center-end: 文字は箱全体の中央、最後のアイコンは右端。左にアイコンと隙間（8px）の幅を空けて、つり合わせる
//   幅が中身で決まるときは、center と between は同じ見た目。center-end は左の空きの分だけ広くなる
//   between・center-end では、文字を包み（data-slot="link-label"）、入りきらないときは「…」で切る
// render（design/adr/0046）: Base UI の部品と同じ。Next.js の Link などを渡すと、その要素に Link の見た目を重ねる
// 新しいタブで開く（target="_blank"）とき（design/adr/0046）: 読み上げに「新しいタブで開きます」を足し、rel="noopener noreferrer" を付ける
//   ↗ は、新しいタブで開くときだけ部品が付ける（同じタブで開くリンクには付けない）
//   文字のリンク: 文字の後ろに、文字より少し小さく（--link-external-icon-size。既定 0.85em）下寄せで付け、下線を ↗ の右端まで続ける。利用者が最後に ArrowUpRightIcon を置いたときは足さない
//   枠線のリンク: 利用者がアイコン（最後の子の要素。› でも ↗ でも）を置いたときは、それを使う。アイコンがなければ ↗ を付ける
//   読み上げの文は、アイコンにかかわらず、新しいタブで開くリンクすべてに足す
// 押せないとき（disabled — design/adr/0046）: href のない <a role="link" aria-disabled="true">。hover と押下は data-disabled で止める
//   文字のリンク: ただの文字と同じ見た目。下線・↗ を付けず、色は周りの文字を受け継ぐ（color: inherit）。カーソルも周りの文字と同じ（auto）
//   枠線のリンク: 押せないグレーの枠線のボタンと同じ（文字 --color-outline-neutral-disabled-text、枠線 --color-outline-neutral-disabled-line — design/adr/0029）
const link = tv({
  // キーボードで操作したときのフォーカス（design/adr/0031）。線は角丸（文字のリンクは --link-text-radius）に沿う
  base: ['cursor-pointer text-(color:--link-color)', ...focusRing],
  variants: {
    appearance: {
      // 文字のリンク。hover・押下で背景を敷かず、押下で沈むだけ（design/adr/0027。塗りのトークンは transparent）
      // 左右に 4px はみ出させ、フォーカスの線を文字から離す。前後の文字には少しかかる（design/adr/0031）
      // 文章の中で折り返せるよう inline のまま沈める
      // 下線の有無・太さ・色は、通常と hover でトークンから読む（ふだんは淡く、hover で下線だけ濃く — design/adr/0030）
      // 背景に線を描く仕組みは、比べたが採らなかった動き（F1〜F4）を比較のストーリーで再現するために残している
      text: [
        'relative -mx-1 rounded-(--link-text-radius) box-decoration-clone px-1 py-0.5 underline-offset-4',
        '[text-decoration-line:var(--link-decoration)] [text-decoration-color:var(--color-link-underline)] [text-decoration-thickness:var(--link-underline-width)]',
        'not-data-disabled:hover:[text-decoration-line:var(--link-decoration-hover)] not-data-disabled:hover:[text-decoration-color:var(--color-link-underline-hover)] not-data-disabled:hover:[text-decoration-thickness:var(--link-underline-width-hover)]',
        // hover で文字（と下線）を濃くする。リンクの色に黒を --link-hover-darken だけ混ぜる
        'not-data-disabled:hover:text-[color:color-mix(in_oklab,var(--link-color),black_var(--link-hover-darken))]',
        // 下線を動かすときは、背景に線を2本描く（上: hover で伸びる線、下: ふだんの線）。文字の幅だけに引く
        // 文字の下線の太さは、1 倍の画面では 1px から 2px へ一段で切り替わり、なめらかに動かせないため
        '[background-image:linear-gradient(color-mix(in_oklab,var(--color-link-grow)_var(--link-grow-alpha),transparent),color-mix(in_oklab,var(--color-link-grow)_var(--link-grow-alpha),transparent)),linear-gradient(var(--color-link-underline),var(--color-link-underline))]',
        '[--link-grow-alpha:var(--link-grow-alpha-rest)] not-data-disabled:hover:[--link-grow-alpha:var(--link-grow-alpha-hover)]',
        'bg-no-repeat bg-origin-content',
        '[background-size:var(--link-grow-size-rest),var(--link-base-line-size)] [background-position:var(--link-grow-pos-rest),0_100%]',
        'not-data-disabled:hover:[background-size:var(--link-grow-size-hover),var(--link-base-line-size)] not-data-disabled:hover:[background-position:var(--link-grow-pos-hover),0_100%]',
        'not-data-disabled:hover:bg-link-hover not-data-disabled:active:top-(--flat-press-depth) not-data-disabled:active:bg-link-press',
        // 下線の変化（伸びる線の大きさと濃さ、文字の下線の色）は --link-grow-duration で動かす
        // 位置は動かさない（離したときに抜ける向きを変えられる）
        '[transition:background-color_var(--duration-press)_var(--ease-press),top_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),background-size_var(--link-grow-duration)_var(--link-grow-ease),--link-grow-alpha_var(--link-grow-duration)_var(--link-grow-ease),text-decoration-color_var(--link-grow-duration)_var(--link-grow-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
        'motion-reduce:[transition:none]',
        // 押せないとき: ただの文字と同じ見た目（下線も、背景に描く線もなし。色とカーソルは周りの文字のまま）
        'data-disabled:cursor-auto data-disabled:bg-none data-disabled:text-inherit data-disabled:no-underline',
      ],
      // 枠線のリンク。枠線のボタンと同じく、文字の色を淡く敷く
      outline: [
        // pill（原則5）。文字のリンクの角丸は --link-text-radius（フォーカスの線が沿う — design/adr/0031）
        'inline-flex h-(--size-control) items-center gap-2 rounded-pill border-[1.5px] border-current px-(--space-control-x) whitespace-nowrap',
        'text-(length:--text-control) leading-(--leading-control) font-bold',
        'not-data-disabled:hover:bg-flat-hover not-data-disabled:active:translate-y-(--flat-press-depth) not-data-disabled:active:bg-flat-press',
        '[transition:background-color_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
        'motion-reduce:[transition:none]',
        // 押せないとき: 押せないグレーの枠線のボタンと同じ文字・枠線・塗り・薄さ（design/adr/0029）
        'data-disabled:cursor-not-allowed data-disabled:[--link-color:var(--color-outline-neutral-disabled-text)]',
        'data-disabled:border-(length:--outline-neutral-disabled-line-width) data-disabled:border-(color:--color-outline-neutral-disabled-line)',
        'data-disabled:bg-(color:--color-outline-neutral-disabled-fill) data-disabled:opacity-(--outline-neutral-disabled-opacity)',
      ],
    },
    // 利用者が選ぶ色（原則6）。指定しないときはグレー（neutral）— design/adr/0028
    // 色は --link-color に入れる（hover で濃くするときにもとの色を参照するため）
    color: {
      primary: '[--link-color:var(--color-primary)]',
      secondary: '[--link-color:var(--color-fg-secondary)]',
      neutral: '[--link-color:var(--color-fg-muted)]',
    },
    // 幅いっぱいに広げたときの中身の寄せ方。枠線のリンクだけに効く（design/adr/0046）
    contentAlign: { center: '', between: '', 'center-end': '' },
  },
  compoundVariants: [
    { appearance: 'outline', contentAlign: 'center', class: 'justify-center' },
    { appearance: 'outline', contentAlign: 'between', class: 'justify-between' },
    // center-end の左の空き（アイコンと隙間の幅）は、最後のアイコンがあるときだけ部品の中で足す
  ],
  defaultVariants: { appearance: 'text', color: 'neutral', contentAlign: 'center' },
});

export type LinkContentAlign = NonNullable<VariantProps<typeof link>['contentAlign']>;

export interface LinkProps extends Omit<ComponentProps<'a'>, 'color'>, VariantProps<typeof link> {
  /**
   * 幅いっぱいに広げた枠線のリンクで、文字とアイコンをどう寄せるか（design/adr/0046）。枠線のリンクだけに効き、文字のリンクには効きません。
   * center は文字とアイコンをまとめて中央に寄せます。between は文字を左、最後のアイコンを右端に置きます（並べて縦にそろえたいとき）。
   * center-end は文字を箱全体の中央、最後のアイコンを右端に置きます（1本をボタンのように中央に見せたいとき）。
   * @default 'center'
   */
  contentAlign?: VariantProps<typeof link>['contentAlign'];
  /**
   * 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に Link の見た目を重ねる。
   * href などは渡す要素に書く（例: `render={<NextLink href="/works" />}`）。ラベルは Link の children に書く
   * 渡さないときは `<a>` を描く（href は Link に書く）
   */
  render?: ReactElement;
  /**
   * 押せないリンク。href を外した `<a role="link" aria-disabled="true">` を描く（渡した要素は描かない）。
   * Tab では止まらず、押しても何もしない。読み上げでは「リンク、利用不可」（design/adr/0046）。
   * 文字のリンクは、ただの文字と同じ見た目になる（下線・↗ なし、色は周りの文字）。枠線のリンクは、押せないグレーの枠線のボタンと同じ見た目
   */
  disabled?: boolean;
}

// 文字のリンクで、新しいタブで開くときに部品が付ける ↗（design/adr/0046）
// 文字より少し小さく（箱は --link-external-icon-size。既定 0.85em）、線は Regular（文字と並ぶアイコン — design/adr/0018）
// 最後の語と一緒に折り返すよう、語をつなぐ文字（U+2060）を前に置き、改行させない
// 位置と下線の幅は、箱の大きさ（S）から計算する。線は viewBox 256 に対して 16（Regular）で、箱と一緒に大きさが変わるため、比はどの S でも同じ
//   矢印の線の下端は y = 192 + 16/2 = 200、右端は x = 192 + 16/2 = 200（端は丸い）
// 下寄せ: 矢印の線の下端（箱の下から 56/256 × S。0.85em なら約 0.186em）を、文字の基線にそろえる
// 下線は ↗ の右端まで続ける。SVG の下には文字の下線（text-decoration）が引かれないため、
//   ↗ の下に透明な文字「0」を置き、字間で幅を矢印の線の右端（200/256 × S。0.85em なら約 0.664em）までにする。↗ はその上に重ねる
//   リンクの下線がそのまま続くので、位置・太さ・色・hover の変化（design/adr/0030）が文字と同じになる
//   背景や枠線で線を描く形は、画素へのそろえ方が文字の下線と違い、位置の端数によって 1px の段ができたので採らなかった
//   「0」は ::before の content なので、選んでコピーしても入らない。字間は 1ch（「0」の幅）を引いて合わせる（小さい S では字間が負になる）
//   em はそれぞれの要素の文字の大きさで解決する（包み・「0」・↗ はリンクと同じ大きさ）。行ごとにトークンを上書きしても、そのまま効く
const TextNewTabArrow = () => (
  <span aria-hidden="true" className="whitespace-nowrap">
    {'\u2060'}
    <span className="[letter-spacing:calc(var(--link-external-icon-size)*200/256_-_1ch)] text-transparent normal-nums before:content-['0']" />
    <ArrowUpRightIcon className="-ms-[calc(var(--link-external-icon-size)*200/256)] inline-block size-(--link-external-icon-size) align-[calc(var(--link-external-icon-size)*-56/256)]" />
  </span>
);

/**
 * リンク
 */
export function Link({
  appearance,
  color,
  contentAlign,
  className,
  render,
  disabled,
  ref,
  children,
  ...props
}: LinkProps) {
  const outline = appearance === 'outline';
  const align = outline ? (contentAlign ?? 'center') : undefined;
  const blank = props.target === '_blank' || opensNewTab(render);
  const newTab = blank && !disabled;
  // 新しいタブで開くときの ↗。読み上げの文は、押せないときは足さない（開かないため）
  //   文字のリンク: 利用者が最後に ArrowUpRightIcon を置いたとき以外は、部品が文字より少し小さく付ける
  //     押せないときは付けない（ただの文字と同じ見た目にする。ただの文字に ↗ はない）
  //   枠線のリンク: 最後の子が要素（アイコン）なら、それを使う（› でも ↗ でも足さない）。アイコンがなければ、部品が付ける
  //     アイコンの見分け方は contentAlign の between・center-end と同じ（splitTrailing）。押せないときも残す
  const userArrow = endsWithElement(children, ArrowUpRightIcon);
  const textArrow = !outline && newTab && !userArrow;
  const outlineArrow = outline && blank && !userArrow && splitTrailing(children).trailing === null;
  // 部品が付ける ↗ も最後のアイコンとして扱い、between・center-end では右端に置く
  const items = outlineArrow
    ? [...Children.toArray(children), <ArrowUpRightIcon key="new-tab-arrow" />]
    : children;
  let content = items;
  let balance = false;
  if (align === 'between' || align === 'center-end') {
    const { lead, trailing } = splitTrailing(items);
    balance = align === 'center-end' && trailing !== null;
    content = (
      <>
        <span
          data-slot="link-label"
          className={
            align === 'center-end' ? 'min-w-0 grow truncate text-center' : 'min-w-0 truncate'
          }
        >
          {lead}
        </span>
        {trailing}
      </>
    );
  }
  const own = disabled ? { ...withoutNavigation(props), ...disabledLinkProps } : props;
  return useRender({
    render: disabled ? disabledAnchor(render) : render,
    defaultTagName: 'a',
    ref,
    props: {
      ...own,
      ...(newTab ? { rel: props.rel ?? 'noopener noreferrer' } : {}),
      className: link({
        appearance,
        color,
        contentAlign,
        className: [
          balance && 'ps-[calc(var(--space-control-x)+var(--size-icon)+0.5rem)]',
          // 読み上げだけの文（sr-only・絶対配置）の位置の基準。文字のリンクは、もとから relative
          newTab && appearance === 'outline' && 'relative',
          className,
        ]
          .filter(Boolean)
          .join(' '),
      }),
      children: (
        <>
          {content}
          {textArrow && <TextNewTabArrow />}
          {newTab && <NewTabNote />}
        </>
      ),
    },
  });
}
