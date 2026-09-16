import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { Button } from './Button';
import { focusRing } from './focus-styles';
import { ArrowUpRightIcon } from './icons';
import {
  disabledAnchor,
  disabledLinkProps,
  disabledTextLinkProps,
  endsWithElement,
  flattenChildren,
  newTabNaming,
  opensNewTab,
  splitLeading,
  splitTrailing,
  withoutNavigation,
  withRenderOverrides,
} from './link-parts';

// 原則5: リンクなどの小物は pill。原則7の例外: 密度の高い並び（More、SNS のアカウント一覧）は枠線
// 影のない平らな要素なので、hover と押下は塗りの濃さで表し、押下で 1px 沈む（原則3、design/adr/0027）
// 文字のリンクの下線と hover は design/adr/0030
// 大きさ（design/adr/0039）: 枠線のリンクは、枠線のボタンと同じ寸法（--spacing-control ほか。密度で切り替わる）
//   文字のリンクは大きさを持たず、周りの文字のまま。押せる範囲も文字の行だけで、見えない広がりは付けない
//   広い範囲が要るときは、文字のリンクを広げずに、ボタンの見た目（appearance="button"）にする
// ボタンの見た目のリンク（appearance="button" — design/adr/0046）: 見た目は Button（塗り）に任せ、要素は <a> のまま
//   見た目のコードは Button に1つだけ置く。Link は Button を描くので、ボタンとリンクで見た目がずれない
//   押せないときは、色を指定していても押せないグレーのボタンと同じ見た目にする（原則7）。Button に color="neutral" を渡して描く
//   キャプション（caption）はこの見た目のときだけ使える。↗・新しいタブの名前・押せないリンクの作り方は Button のリンクの道と同じ
// 幅いっぱいに広げた枠線のリンクの中身（contentAlign — design/adr/0046）。既定は center
//   center: 文字とアイコンをまとめて中央（ボタンと同じ寄せ方）
//   between: 文字は左、最後のアイコンは右端
//   center-end: 文字は箱全体の中央、最後のアイコンは右端。左にアイコンと隙間（8px）の幅を空けて、つり合わせる
//   幅が中身で決まるときは、center と between は同じ見た目。center-end は左の空きの分だけ広くなる
//   between・center-end では、文字を包み（data-slot="link-label"）、入りきらないときは「…」で切る
//   前のアイコン（最初の子の要素で、後ろに文字などが続くとき。サービスのアイコンなど）は、包みの外に置く（data-slot="link-lead"）
//     between: 前のアイコンは左端、文字はそのすぐ後ろ（8px）
//     center-end: 既定は文字と一緒に中央へ動く。leadIconPlacement="start" で左端に残す（--link-lead-icon-follow の 1 と 0 — 後半の軸 35）
//   最初・最後のアイコンを見分けるときは、Fragment（<>…</>）を開いて中の子を見る
// render（design/adr/0046）: Base UI の部品と同じ。Next.js の Link などを渡すと、その要素に Link の見た目を重ねる
// 新しいタブで開く（target="_blank"）とき（design/adr/0046）: 読み上げに「新しいタブで開きます」を足し、rel="noopener noreferrer" を付ける
//   名前を付けていないリンクは、中の読み上げだけの文（NewTabNote）が名前に入る
//   名前を aria-label・aria-labelledby で付けたリンクは、中の文が名前に入らないので、名前そのものに足す（link-parts の newTabNaming）
//     aria-label は名前の後ろに文を足し、aria-labelledby は並びの後ろに中の文の id を足す
//   ↗ は、新しいタブで開くときだけ部品が付ける（同じタブで開くリンクには付けない）
//   文字のリンク: 文字の後ろに、文字より少し小さく（--link-external-icon-size。既定 0.85em）下寄せで付け、下線を ↗ の右端まで続ける。利用者が最後に ArrowUpRightIcon を置いたときは足さない
//   枠線のリンク: 利用者がアイコン（最後の子の要素。› でも ↗ でも）を置いたときは、それを使う。アイコンがなければ ↗ を付ける
//     アイコンだけのリンク（aria-label か aria-labelledby があり、子が要素1つだけ）も、そのアイコンを使い ↗ を付けない（後半の軸 35）
//   読み上げの文は、アイコンにかかわらず、新しいタブで開くリンクすべてに足す
// 押せないとき（disabled — design/adr/0046）: href のない <a>。Tab で止まらず、押しても何もしない。hover と押下は data-disabled で止める
//   文字のリンク: ただの文字と同じ見た目。下線・↗ を付けず、色は周りの文字を受け継ぐ（color: inherit）。カーソルも周りの文字と同じ（auto）
//     読み上げでもただの文字にする。role・aria-disabled を付けない（href のない <a> は HTML-AAM では generic になり、リンクと読まれない）
//   枠線のリンク: 押せないグレーの枠線のボタンと同じ（文字 --color-outline-neutral-disabled-text、枠線 --color-outline-neutral-disabled-line — design/adr/0029）
//     読み上げでは「リンク、利用不可」（role="link" aria-disabled="true"）
const link = tv({
  // キーボードで操作したときのフォーカス（design/adr/0031）。線は角丸（文字のリンクは --link-text-radius）に沿う
  base: ['cursor-pointer text-(color:--link-color)', ...focusRing],
  variants: {
    appearance: {
      // 文字のリンク。hover・押下で背景を敷かず、押下で沈むだけ（design/adr/0027。塗りのトークンは transparent）
      // 左右に 4px はみ出させ、フォーカスの線を文字から離す。前後の文字には少しかかる（design/adr/0031）
      // 文章の中で折り返せるよう inline のまま沈める
      // 下線はふだん淡く、hover で下線だけ濃くする。文字の色と下線の太さは変えない（design/adr/0030）
      text: [
        // group/link: 新しいタブの ↗ の下線のつなぎ目を、hover のあいだだけ重ねる（下の TextNewTabArrow）
        'group/link relative -mx-1 rounded-(--link-text-radius) box-decoration-clone px-1 py-0.5 underline-offset-4',
        // 色は [text-decoration-color:…] で書く。decoration-(color:…) は tailwind-merge が太さ（decoration-1）と同じ種類とみなして消す
        'underline [text-decoration-color:var(--color-link-underline)] decoration-1',
        'not-data-disabled:hover:[text-decoration-color:var(--color-link-underline-hover)]',
        'not-data-disabled:active:top-(--flat-press-depth)',
        // 下線の色の変化は --link-underline-duration で動かす
        // 位置は動かさない（離したときに抜ける向きを変えられる）
        '[transition:top_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),text-decoration-color_var(--link-underline-duration)_var(--link-underline-ease),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
        'motion-reduce:[transition:none]',
        // 押せないとき: ただの文字と同じ見た目（下線なし。色とカーソルは周りの文字のまま）
        'data-disabled:cursor-auto data-disabled:text-inherit data-disabled:no-underline',
      ],
      // 枠線のリンク。枠線のボタンと同じく、文字の色を淡く敷く
      outline: [
        // pill（原則5）。文字のリンクの角丸は --link-text-radius（フォーカスの線が沿う — design/adr/0031）
        'inline-flex h-(--spacing-control) items-center gap-2 rounded-pill border-(length:--border-width-medium) border-current px-(--spacing-control-x) whitespace-nowrap',
        'text-(length:--text-control) leading-(--leading-control) font-bold',
        'not-data-disabled:hover:bg-flat-hover not-data-disabled:active:translate-y-(--flat-press-depth) not-data-disabled:active:bg-flat-press',
        '[transition:background-color_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
        'motion-reduce:[transition:none]',
        // 押せないとき: 押せないグレーの枠線のボタンと同じ文字と枠線（design/adr/0029）
        'data-disabled:cursor-not-allowed data-disabled:[--link-color:var(--color-outline-neutral-disabled-text)]',
        'data-disabled:border-(color:--color-outline-neutral-disabled-line)',
      ],
      // ボタンの見た目のリンク。見た目は Button（塗り）に任せるので、ここには置かない（下の Link が Button を描く）
      button: '',
    },
    // 利用者が選ぶ色（原則6）。指定しないときはグレー（neutral）— design/adr/0028
    // 色は --link-color に入れる（hover で濃くするときにもとの色を参照するため）
    // --color-own-focus: フォーカスの線を部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）の線の色。neutral は置かない
    color: {
      primary: '[--color-own-focus:var(--color-primary)] [--link-color:var(--color-primary)]',
      secondary:
        '[--color-own-focus:var(--color-fg-secondary)] [--link-color:var(--color-fg-secondary)]',
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
   * 見た目。text は文章の中の文字のリンク、outline は枠線の pill、button はボタンと同じ見た目（塗り）です。
   * 画面内で最も進めたい移動は button、密度の高い並び（More、SNS の一覧）は outline にします（原則5・原則7）。
   * button は Button と同じ見た目・同じ寸法で描き、右上向きの矢印（↗）が付いてボタンと見分けられます。
   * 押せないとき（disabled）は、色を指定していても押せないグレーのボタンと同じ見た目になります（原則7）
   * @default 'text'
   */
  appearance?: VariantProps<typeof link>['appearance'];
  /**
   * キャプション（原則4）。ボタンの見た目（appearance="button"）のときだけ使えます。リンクの下に中央寄せで、小さくグレーの文字で出します。
   * 「外部のサイトに移動します」のような補足に使います。押せないときも薄くしません（原則1）。
   * 読み上げでは、リンクの説明（aria-describedby）になります。
   * 渡すと、リンクとキャプションを包む要素ができ、className はその包みに付きます（幅いっぱいにするときは className="w-full"）
   */
  caption?: ReactNode;
  /**
   * 幅いっぱいに広げた枠線のリンクで、文字とアイコンをどう寄せるか（design/adr/0046）。枠線のリンクだけに効き、文字のリンクには効きません。
   * center は文字とアイコンをまとめて中央に寄せます。between は文字を左、最後のアイコンを右端に置きます（並べて縦にそろえたいとき）。
   * center-end は文字を箱全体の中央、最後のアイコンを右端に置きます（1本をボタンのように中央に見せたいとき）。
   * @default 'center'
   */
  contentAlign?: VariantProps<typeof link>['contentAlign'];
  /**
   * contentAlign="center-end" で、文字の前にアイコン（サービスのアイコンなど）を置いたときの置き場所。
   * with-label は前のアイコンを文字と一緒に中央へ寄せます。start は前のアイコンを左端に残し、文字だけを中央に寄せます（縦に並べて前のアイコンをそろえたいとき）。
   * between では、どちらでも前のアイコンは左端です。
   * @default 'with-label'
   */
  leadIconPlacement?: 'with-label' | 'start';
  /**
   * 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素に Link の見た目を重ねる。
   * href などは渡す要素に書く（例: `render={<NextLink href="/works" />}`）。ラベルは Link の children に書く
   * 渡さないときは `<a>` を描く（href は Link に書く）
   */
  render?: ReactElement;
  /**
   * 押せないリンクにします。href を外した `<a>` を描き（渡した要素は描きません）、Tab では止まらず、押しても何もしません（design/adr/0046）。
   * 文字のリンクは、見た目も読み上げもただの文字になります。下線と ↗ を付けず、色は周りの文字のままで、リンクとは読まれません（role・aria-disabled を付けません）。
   * 枠線のリンクは、押せないグレーの枠線のボタンと同じ見た目になり、読み上げでは「リンク、利用不可」です（`role="link"`・`aria-disabled="true"`）
   * @default false
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
// \u3064\u306a\u304e\u76ee: \u6587\u5b57\u306e\u4e0b\u7dda\u3068\u300c0\u300d\u306e\u4e0b\u7dda\u306f\u5225\u3005\u306b\u63cf\u304b\u308c\u3001\u3064\u306a\u304e\u76ee\u304c\u753b\u7d20\u306e\u9014\u4e2d\u306b\u6765\u308b\u3068\u3001\u305d\u306e\u753b\u7d20\u306f\u4e21\u65b9\u304c\u534a\u7aef\u306b\u5857\u3063\u3066\u5c11\u3057\u660e\u308b\u304f\u306a\u308b
//   hover \u306e\u4e0b\u7dda\u306f\u4e0d\u900f\u660e\u306a\u306e\u3067\u3001\u305d\u3053\u3060\u3051\u76ee\u7acb\u3064\u3002hover \u306e\u3042\u3044\u3060\u306f\u300c0\u300d\u3092 1px \u5de6\u3078\u51fa\u3057\u3066\uff08\u5b57\u9593\u3092 1px \u8db3\u3057\u3001\u7d42\u308f\u308a\u306e\u4f4d\u7f6e\u306f\u5909\u3048\u306a\u3044\uff09\u3001
//   \u6587\u5b57\u306e\u4e0b\u7dda\u306b\u91cd\u306d\u308b\u3002\u3075\u3060\u3093\u306e\u4e0b\u7dda\u306f\u534a\u900f\u660e\u3067\u3001\u91cd\u306d\u308b\u3068\u6fc3\u304f\u306a\u308b\u306e\u3067\u91cd\u306d\u306a\u3044
//   \u91cd\u306d\u308b\u306e\u306f\u3001\u4e0b\u7dda\u304c\u6fc3\u304f\u306a\u308a\u304d\u3063\u3066\u304b\u3089\uff08--link-underline-duration \u306e\u3042\u3068\uff09\u3002\u6fc3\u304f\u306a\u308b\u9014\u4e2d\u3067\u91cd\u306d\u308b\u3068\u3001\u91cd\u306a\u308a\u304c\u6fc3\u304f\u898b\u3048\u308b\u305f\u3081
const TextNewTabArrow = () => (
  <span aria-hidden="true" className="whitespace-nowrap">
    {'\u2060'}
    <span className="[letter-spacing:calc(var(--link-external-icon-size)*200/256_-_1ch)] text-transparent normal-nums group-hover/link:-ms-px group-hover/link:[letter-spacing:calc(var(--link-external-icon-size)*200/256_-_1ch_+_1px)] group-hover/link:[transition:margin-inline-start_0s_linear_var(--link-underline-duration),letter-spacing_0s_linear_var(--link-underline-duration)] before:content-['0'] motion-reduce:group-hover/link:[transition:none]" />
    <ArrowUpRightIcon className="-ms-[calc(var(--link-external-icon-size)*200/256)] inline-block size-(--link-external-icon-size) align-[calc(var(--link-external-icon-size)*-56/256)]" />
  </span>
);

/**
 * リンクです。
 *
 * アイコンだけのリンクは、名前を aria-label で付けます（svg の title や見えない文字では付けません）。そのときは ↗ を足しません。
 *
 * 新しいタブで開く（`target="_blank"`）ときは、名前に「（新しいタブで開きます）」が入ります。
 * aria-label で名前を付けたときは名前の後ろに足し、aria-labelledby で付けたときは、読み上げだけの文を並びの後ろに足します。
 */
export function Link(props: LinkProps) {
  // 見た目ごとに部品を分ける（Button と同じ形）。1つの部品の中で分けると、道によってフックの数と順が変わるため
  if (props.appearance === 'button') return <ButtonLookLink {...props} />;
  return <PlainLink {...props} />;
}

// ボタンの見た目のリンク（appearance="button"）: 見た目は Button に任せ、要素は <a>（render を渡したときはその要素）
//   ↗・新しいタブの名前・キャプション・押せないリンクの作り方は、Button のリンクの道（ButtonLink）と同じものを使う
//   押せないときは、色を指定していても押せないグレーのボタンと同じ見た目にする（原則7）。Button の neutral がその見た目
//   contentAlign・leadIconPlacement は枠線のリンクのものなので、ここでは効かない
//   <a> の type（MIME タイプ）は使わない（Button の型でも止めている）
function ButtonLookLink({
  appearance: _appearance,
  color,
  contentAlign: _contentAlign,
  leadIconPlacement: _leadIconPlacement,
  className,
  render,
  disabled,
  caption,
  ref,
  children,
  type: _type,
  ...anchor
}: LinkProps) {
  return (
    <Button
      appearance="filled"
      color={disabled ? 'neutral' : (color ?? 'neutral')}
      caption={caption}
      className={className}
      disabled={disabled}
      render={render ?? <a />}
      ref={ref}
      {...anchor}
    >
      {children}
    </Button>
  );
}

// 文字のリンク（text）と枠線のリンク（outline）
function PlainLink({
  appearance,
  color,
  contentAlign,
  leadIconPlacement = 'with-label',
  className,
  render,
  disabled,
  caption: _caption,
  ref,
  children,
  ...props
}: LinkProps) {
  const noteId = useId();
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
  // アイコンだけのリンク: 名前を aria-label・aria-labelledby で付け、子が要素1つだけのとき。そのアイコンを使い、↗ を足さない
  //   文字の要素1つだけのリンクには名前を付けないので、いままでどおり ↗ が付く
  const only = flattenChildren(children);
  const iconOnly =
    outline &&
    (props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined) &&
    only.length === 1 &&
    isValidElement(only[0]);
  const outlineArrow =
    outline && blank && !userArrow && !iconOnly && splitTrailing(children).trailing === null;
  // 部品が付ける ↗ も最後のアイコンとして扱い、between・center-end では右端に置く
  const items = outlineArrow
    ? [...flattenChildren(children), <ArrowUpRightIcon key="new-tab-arrow" />]
    : children;
  let content = items;
  // center-end で、文字を箱全体の中央に置くために左右につり合わせる余白（アイコンと隙間 8px の幅）
  let balance: string | false = false;
  if (align === 'between' || align === 'center-end') {
    const { lead, trailing } = splitTrailing(items);
    // 前のアイコン（最初の子の要素。後ろに文字などが続くとき）は、包みの外の自分の場所に置く
    const { icon: leadIcon, label } = splitLeading(lead);
    const centerEnd = align === 'center-end';
    if (centerEnd && trailing !== null) {
      // 右端のアイコンの分を左に足す。前のアイコンが左端に残るとき（--link-lead-icon-follow: 0）は、それがつり合うので足さない
      balance = leadIcon
        ? 'ps-[calc(var(--spacing-control-x)+var(--link-lead-icon-follow)*(var(--spacing-icon)+var(--spacing)*2))]'
        : 'ps-[calc(var(--spacing-control-x)+var(--spacing-icon)+var(--spacing)*2)]';
    } else if (centerEnd && leadIcon) {
      // 前のアイコンだけのとき。左端に残るなら、その分を右に足す
      balance =
        'pe-[calc(var(--spacing-control-x)+(1-var(--link-lead-icon-follow))*(var(--spacing-icon)+var(--spacing)*2))]';
    }
    content = (
      <>
        {leadIcon && (
          <span
            data-slot="link-lead"
            className={['flex shrink-0', centerEnd && 'ms-auto'].filter(Boolean).join(' ')}
          >
            {leadIcon}
          </span>
        )}
        <span
          data-slot="link-label"
          className={[
            'min-w-0 truncate',
            centerEnd && 'text-center',
            // 前のアイコンがないとき: center-end は箱いっぱいに広げて中央、between は広げない（右端のアイコンと離す）
            // 前のアイコンがあるとき: between は広げて左寄せ。center-end は --link-lead-icon-follow で決める
            //   1: 広げず、左右の auto の余白で、前のアイコンと文字をまとめて中央に置く（アイコンは文字と一緒に動く）
            //   0: 広げて、前のアイコンは左端に残り、文字だけが中央に寄る
            leadIcon === null
              ? centerEnd && 'grow'
              : centerEnd
                ? 'me-auto grow-[calc(1-var(--link-lead-icon-follow))]'
                : 'grow',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </span>
        {trailing}
      </>
    );
  }
  // 押せないとき: 文字のリンクはただの文字（role・aria-disabled なし）、枠線のリンクは「リンク、利用不可」
  const own = disabled
    ? {
        ...withoutNavigation(props),
        ...(outline ? disabledLinkProps : disabledTextLinkProps),
      }
    : props;
  // 新しいタブで開くときの名前と、読み上げだけの文。名前を aria-label・aria-labelledby で付けたときは、名前そのものに足す
  const naming = newTab ? newTabNaming(props, render, noteId) : null;
  return useRender({
    // 渡した要素に名前（aria-label・aria-labelledby）があるときは、要素の側を書き換える（要素の props が勝つため）
    render: withRenderOverrides(disabled ? disabledAnchor(render) : render, naming?.props ?? {}),
    defaultTagName: 'a',
    ref,
    props: {
      ...own,
      ...naming?.props,
      ...(newTab ? { rel: props.rel ?? 'noopener noreferrer' } : {}),
      className: link({
        appearance,
        color,
        contentAlign,
        className: [
          balance,
          leadIconPlacement === 'start' && '[--link-lead-icon-follow:0]',
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
          {naming?.note}
        </>
      ),
    },
  });
}
