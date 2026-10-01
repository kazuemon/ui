'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  type MouseEventHandler,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useId,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import {
  newTabNaming,
  opensNewTab,
  resolveLink,
  warnOnce,
  withoutLinkAttributes,
} from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { Image, type ImageProps } from '../image/Image';

// カード — 軸 103・151
//   面は地と同じ白なので、細い輪郭で面を見せる。押せないカードはページと同じレイヤーなので影を付けない（原則1）
//   角はカードの角（ADR-0016）。画像は 16:9（ADR-0017）
//   型は 2 つ（ADR-0014）: default は画像をカードの端まで届かせ、nested は画像を内側に収める（周りの余白 --card-nested-inset）
//     nested の画像の角は、外の角から余白を引いた同心の角（原則5）。中身の余白は、画像の周りの余白を引いた分を足し、文字の位置を default とそろえる
//   押せるカード（リンクのカード）は、カード全体が 1 つのリンクになる。押せる範囲は見た目の範囲（原則7）
//     リンクにするかは link で決める。既定は href があるか。render に渡した要素の props（href・to）は読まない（link-parts の resolveLink）
//     link={false} のときは、href・target・rel を描く要素に渡さない
//     浮いた押すもの（原則1・3、ADR-0169）: ボタンと同じ薄い影を付け、hover で落ち影を消して面を淡く塗り（--card-fill-hover）、
//     押すと沈む（影は hover のまま）。輪郭は hover でも変えない
//     hover で画像を少し大きくする動き（--card-hover-media-scale）は、imageZoom を渡したときだけ（既定はなし）
//     面の塗りは --card-fill（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
//   新しいタブで開くときは、読み上げに「新しいタブで開きます」を足す（Link と同じ。原則7）
//   押せる Card を Prose の中に置いても崩れないようにする（LinkCard と同じ書き方）
//     Prose は中の a に文字のリンクの見た目を当てる。ここで同じ性質を書いて打ち消す（下線・余白・色）
//     Prose は押した文字のリンクを top で沈める（詳細度が高い）。Card も translate ではなく top で同じだけ沈め、二重に沈まないようにする
const styles = tv({
  slots: {
    root: [
      'group/card relative flex flex-col overflow-hidden rounded-card text-fg',
      'border-(length:--card-line-width) border-(color:--card-line)',
      '[--card-line-width:var(--border-width-thin)] [--card-line:var(--color-surface-line)]',
      'bg-(color:--card-fill) [--card-fill:var(--color-surface)]',
      // 選んでいる印（selected）。輪郭の上に重ねて線を引く。寸法は変えない。線の色は color から作る（--card-selected-line）
      "data-selected:after:pointer-events-none data-selected:after:absolute data-selected:after:-inset-(--card-line-width) data-selected:after:z-1 data-selected:after:content-['']",
      'data-selected:after:rounded-card data-selected:after:border-(length:--card-selected-line-width) data-selected:after:border-(color:--card-selected-line)',
    ],
    body: 'flex flex-col gap-(--card-gap) p-(--card-body-padding)',
    // 頭の帯。左右の余白は中身とそろえ、上下は --card-header-padding-y。下の線（輪郭と同じ細い線）で中身と分ける
    header: [
      'flex items-center justify-between gap-(--card-header-gap)',
      'px-(--card-body-padding) py-(--card-header-padding-y)',
      'border-b-(length:--border-width-thin) border-(color:--color-surface-line)',
    ],
    image: [
      // imageZoom のとき、hover で画像を少し大きくする（--card-hover-media-scale）。枠（Image）が切り取る
      '[transition:scale_var(--duration-normal)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-data-image-zoom/card:group-hover/card:scale-(--card-hover-media-scale)',
    ],
  },
  variants: {
    variant: {
      default: { root: '[--card-body-padding:var(--card-padding)]' },
      nested: {
        root: [
          'p-(--card-nested-inset)',
          '[--card-body-padding:calc(var(--card-padding)-var(--card-nested-inset))]',
        ],
        // 内側に収めた帯は、下の画像と入れ子の余白だけ離す。角は下の compoundVariants で決める
        header: 'mb-(--card-nested-inset)',
      },
      // 強調の形。並べたカードのうち 1 枚（おすすめなど）を目立たせる。画像の置き方は default と同じ
      emphasis: {
        root: [
          '[--card-body-padding:var(--card-padding)]',
          '[--card-line-width:var(--card-emphasis-line-width)] [--card-line:var(--card-emphasis-line)]',
          '[--card-fill:var(--card-emphasis-fill)]',
          // 輪郭の外の淡い輪（Timeline の強調と同じ考え方）。輪の色は --card-emphasis-halo-base を薄めた色。影と重ねて描く
          'ring-(length:--card-emphasis-halo) ring-(color:--card-halo-color)',
          '[--card-halo-color:color-mix(in_oklab,var(--card-emphasis-halo-base)_var(--card-emphasis-halo-mix),transparent)]',
        ],
      },
    },
    // 余白の段。sm は一覧に詰めて並べるときの、中身の余白・縦の間・入れ子の余白
    size: {
      sm: {
        root: '[--card-nested-inset:var(--card-nested-inset-sm)] [--card-padding:var(--card-padding-sm)]',
      },
      md: {},
    },
    // 選んでいる見た目の色。線は前景の色、淡い面はその色の淡い面。neutral は色を持たないグレーと濃紺（原則6）
    color: {
      primary: {
        root: '[--card-selected-line:var(--color-primary)] [--card-selected-tint:var(--color-primary-subtle)]',
      },
      secondary: {
        root: '[--card-selected-line:var(--color-fg-secondary)] [--card-selected-tint:var(--color-secondary-subtle)]',
      },
      neutral: {
        root: '[--card-selected-line:var(--color-neutral-strong)] [--card-selected-tint:var(--color-select-neutral-selected)]',
      },
    },
    // 選んでいる見た目の形。fill は面を淡く塗って線を重ね、line は面を変えずに線だけを重ねる
    selectedIndicator: {
      fill: { root: 'data-selected:[--card-fill:var(--card-selected-tint)]' },
      line: {},
    },
    // 帯の塗り。default はカードの面のまま、filled は入力欄と同じ淡いグレー
    headerVariant: {
      default: {},
      filled: { header: 'bg-(color:--color-field)' },
    },
    // 帯の下の線を引かない
    hideDivider: {
      true: { header: 'border-b-0' },
      false: {},
    },
    interactive: {
      true: {
        root: [
          'top-0 m-0 cursor-pointer no-underline',
          ...focusRing,
          'shadow-raised hover:shadow-raised-hover hover:[--card-fill:var(--card-fill-hover)]',
          'active:top-(--press-depth) active:shadow-(--shadow-raised-press)',
          '[transition:--card-fill_var(--duration-press)_var(--ease-press),box-shadow_var(--duration-press)_var(--ease-press),top_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
          'motion-reduce:[transition:none]',
        ],
      },
      false: {},
    },
    // button として描くとき（onClick）。ボタンの既定の寄せと幅を、カードに合わせる
    button: {
      true: { root: 'w-full text-left' },
      false: {},
    },
  },
  compoundVariants: [
    // Prose の a に当たる px-1 py-0.5 を打ち消す（nested は --card-nested-inset を持つので触らない）
    { variant: ['default', 'emphasis'], interactive: true, class: { root: 'p-0' } },
    {
      variant: 'emphasis',
      interactive: true,
      class: { root: 'hover:[--card-fill:var(--card-emphasis-fill-hover)]' },
    },
    // 塗って選んでいる押せるカードの hover。淡い面に線の色を少し混ぜる
    {
      interactive: true,
      selectedIndicator: 'fill',
      class: {
        root: 'data-selected:hover:[--card-fill:color-mix(in_oklab,var(--card-selected-tint),var(--card-selected-line)_var(--card-selected-hover-mix))]',
      },
    },
    // 入れ子の帯の角。上の角は画像と同じ同心の角。下の線があるときは下の角を丸めず、線をまっすぐ端まで引く
    {
      variant: 'nested',
      hideDivider: false,
      class: { header: 'rounded-t-[calc(var(--radius-card)-var(--card-nested-inset))]' },
    },
    {
      variant: 'nested',
      hideDivider: true,
      class: { header: 'rounded-[calc(var(--radius-card)-var(--card-nested-inset))]' },
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'md',
    color: 'primary',
    selectedIndicator: 'fill',
    headerVariant: 'default',
    hideDivider: false,
    interactive: false,
    button: false,
  },
});

/** 値が undefined の属性を除く */
function definedOnly(props: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
}

export type CardVariant = 'default' | 'nested' | 'emphasis';
export type CardSize = 'sm' | 'md';
export type CardColor = 'primary' | 'secondary' | 'neutral';
export type CardSelectedIndicator = 'fill' | 'line';
export type CardHeaderVariant = 'default' | 'filled';

const CardContext = createContext<CardVariant>('default');

export interface CardProps extends Omit<ComponentProps<'div'>, 'color' | 'onClick'> {
  /**
   * 型
   * - default: 画像をカードの端まで届かせます
   * - nested: 画像をカードの内側に、余白を空けて収めます
   * - emphasis: default の置き方のまま、面と輪郭で目立たせます。並べたカードのうち、おすすめの 1 枚などに使います
   * @default 'default'
   */
  variant?: CardVariant;
  /**
   * 余白の段。sm は中身の余白と縦の間を詰めます。狭い列や、たくさん並べる一覧に使います
   * @default 'md'
   */
  size?: CardSize;
  /**
   * 選んでいる見た目にします。押せるカードを選択肢として並べるときに使います。
   * onClick で button として描くときは、読み上げに押している状態（aria-pressed）として伝えます
   */
  selected?: boolean;
  /**
   * 選んでいる見た目の形（selected のとき）
   * - fill: 面を淡く塗り、輪郭の上に線を重ねます
   * - line: 面は変えず、輪郭の上に線だけを重ねます。画像のあるカードや、面の色を変えたくないときに使います
   * @default 'fill'
   */
  selectedIndicator?: CardSelectedIndicator;
  /**
   * 選んでいる見た目の色（selected のとき）。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーと濃紺です
   * @default 'primary'
   */
  color?: CardColor;
  /** 渡すと、カード全体が 1 つのリンクになります。一覧（記事・作品）のカードに使います */
  href?: string;
  /**
   * カード全体をリンクとして描くか。渡さないときは、href があればリンクにします。
   * render にルーターのリンク（Next.js・TanStack Router の Link など）を渡すときは、`link` を付けます（`<Card link render={<NextLink href="/works/1" />}>`）。
   * render に渡した要素の href は見ません。
   * false にすると、href を渡していてもリンクにせず、ただのカード（div）として描きます
   */
  link?: boolean;
  /**
   * リンクにしない（href も link も渡さない）カードにこれを渡すと、カード全体が 1 つのボタン（button）になります。選ぶ・開くなど、ページを移らない操作に使います。
   * 中にほかのリンクやボタンは置けません
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /** href と一緒に渡すと、リンクの開き方になります（'_blank' で新しいタブ） */
  target?: string;
  /** href と一緒に渡すリンクの rel。新しいタブで開くときは noopener noreferrer を付けます */
  rel?: string;
  /**
   * 押せるカードで、hover したときに画像を少し大きくします。影と面の変化に、画像の動きを足したいときに使います
   * @default false
   */
  imageZoom?: boolean;
  /**
   * 描く要素（Base UI の render と同じ）。article・li などにするときに使います。
   * Next.js の Link などを渡してカード全体をリンクにするときは、`link` も付けます（例: `<Card link render={<NextLink href="/works/1" />}>`）
   */
  render?: ReactElement;
  /** カードの中身。CardHeader・CardImage・CardBody を並べます */
  children?: ReactNode;
  /** いちばん外の要素（リンクのときは a）に付きます */
  className?: string;
}

/**
 * 画像と文をまとめて見せる面。href を渡すと、カード全体が 1 つのリンクになります。
 * ルーターのリンクを render に渡すときは link を付けます
 */
export function Card({
  variant = 'default',
  size = 'md',
  href,
  link: linkProp,
  target,
  rel,
  onClick,
  selected,
  selectedIndicator = 'fill',
  color = 'primary',
  imageZoom = false,
  render,
  className,
  children,
  ...props
}: CardProps) {
  const link = resolveLink(linkProp, href);
  if (link && href == null && render == null)
    warnOnce('Card: link を付けたカードには、href か、リンクの要素（render）を渡します');
  // リンクにせず onClick だけのときは、カード全体を 1 つのボタンにする
  const button = !link && onClick != null && render == null;
  const interactive = link || onClick != null;
  const newTab = link && (target === '_blank' || opensNewTab(render));
  const noteId = useId();
  const naming = newTab ? newTabNaming(props, render, noteId) : null;
  const s = styles({ variant, size, color, selectedIndicator, interactive, button });
  const element = useRender({
    render,
    defaultTagName: link ? 'a' : button ? 'button' : 'div',
    props: {
      // link={false} のときは、リンクだけの属性（download など）も描く要素に渡さない
      ...(link ? props : withoutLinkAttributes(props)),
      // 渡していない属性は置かない（undefined を置くと、渡した要素が自分で付ける href などを消すため）
      ...(link &&
        definedOnly({ href, target, rel: newTab ? (rel ?? 'noopener noreferrer') : rel })),
      ...(onClick != null && { onClick }),
      ...(button && { type: 'button', 'aria-pressed': selected }),
      ...naming?.props,
      'data-slot': 'card',
      'data-variant': variant,
      'data-size': size,
      'data-selected': selected || undefined,
      'data-interactive': interactive || undefined,
      'data-image-zoom': (interactive && imageZoom) || undefined,
      className: s.root({ className }),
      children: (
        <>
          {children}
          {naming?.note}
        </>
      ),
    },
  });
  return <CardContext value={variant}>{element}</CardContext>;
}

export interface CardHeaderProps extends ComponentProps<'div'> {
  /**
   * 帯の塗り
   * - default: カードの面のまま塗りません
   * - filled: 淡いグレーで塗り、帯であることをはっきり見せます
   * @default 'default'
   */
  variant?: CardHeaderVariant;
  /**
   * 帯の下の線を引きません。塗りの境目や、すぐ下の画像で中身と分かれるときに使います
   * @default false
   */
  hideDivider?: boolean;
  /** 帯に置く中身。題と、右端に寄せる操作（Button など）を並べます */
  children?: ReactNode;
  /** 帯の要素（div）に付きます */
  className?: string;
}

/**
 * カードの頭の帯。題や操作を置き、下の線で中身と分けます。カードのいちばん上に置きます
 */
export function CardHeader({
  variant = 'default',
  hideDivider = false,
  className,
  ...props
}: CardHeaderProps) {
  const cardVariant = useContext(CardContext);
  const s = styles({ variant: cardVariant, headerVariant: variant, hideDivider });
  return (
    <div
      data-slot="card-header"
      data-variant={variant}
      className={s.header({ className })}
      {...props}
    />
  );
}

export interface CardBodyProps extends ComponentProps<'div'> {
  /** カードの文。見出し・本文・操作を縦に並べます */
  children?: ReactNode;
  /** 文の部分の要素（div）に付きます */
  className?: string;
}

/**
 * カードの文の部分。余白と、中の要素の縦の間を決めます
 */
export function CardBody({ className, ...props }: CardBodyProps) {
  return <div data-slot="card-body" className={styles().body({ className })} {...props} />;
}

export type CardImageProps = Omit<ImageProps, 'radius' | 'hideOutline'>;

/**
 * カードの画像。比率はカードで共通の 16:9 で、はみ出た分を切ります。角はカードの型に合わせます
 */
export function CardImage({
  ratio = 'var(--card-media-aspect)',
  className,
  frameProps,
  ...props
}: CardImageProps) {
  const variant = useContext(CardContext);
  const nested = variant === 'nested';
  return (
    <Image
      ratio={ratio}
      radius={nested ? 'nested' : 'none'}
      // 端まで届かせるときは、カードの輪郭がそのまま画像の縁になる
      hideOutline={!nested}
      className={styles().image({ className })}
      {...props}
      // hover で大きくした画像を、枠の角で切る（入れ子の型の同心の角を保つ）
      frameProps={{
        ...frameProps,
        className: ['rounded-(--image-radius)', frameProps?.className].filter(Boolean).join(' '),
      }}
    />
  );
}
