import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useId,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { newTabNaming, opensNewTab, renderPropOf } from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { Image, type ImageProps } from '../image/Image';

// カード — 軸 103・151
//   面は地と同じ白なので、細い輪郭で面を見せる。押せないカードはページと同じレイヤーなので影を付けない（原則1）
//   角はカードの角（ADR-0016）。画像は 16:9（ADR-0017）
//   型は 2 つ（ADR-0014）: default は画像をカードの端まで届かせ、nested は画像を内側に収める（周りの余白 --card-nested-inset）
//     nested の画像の角は、外の角から余白を引いた同心の角（原則5）。中身の余白は、画像の周りの余白を引いた分を足し、文字の位置を default とそろえる
//   押せるカード（href か、href を持つ render）は、カード全体が 1 つのリンクになる。押せる範囲は見た目の範囲（原則7）
//     浮いた押すもの（原則1・3、ADR-0169）: ボタンと同じ薄い影を付け、hover で落ち影を消して面を淡く塗り（--card-fill-hover）、
//     押すと沈む（影は hover のまま）。輪郭は hover でも変えない
//     hover で画像を少し大きくする動き（--card-hover-media-scale）は、imageZoom を渡したときだけ（既定はなし）
//     面の塗りは --card-fill（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
//   新しいタブで開くときは、読み上げに「新しいタブで開きます」を足す（Link と同じ。原則7）
const styles = tv({
  slots: {
    root: [
      'group/card relative flex flex-col overflow-hidden rounded-card text-fg',
      'border-(length:--border-width-thin) border-surface-line',
      'bg-(color:--card-fill) [--card-fill:var(--color-surface)]',
    ],
    body: 'flex flex-col gap-(--card-gap) p-(--card-body-padding)',
    image: [
      // imageZoom のとき、hover で画像を少し大きくする（--card-hover-media-scale）。枠（Image）が切り取る
      '[transition:scale_var(--duration-normal)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-data-image-zoom/card:group-hover/card:scale-(--card-hover-media-scale)',
    ],
  },
  variants: {
    appearance: {
      default: { root: '[--card-body-padding:var(--card-padding)]' },
      nested: {
        root: [
          'p-(--card-nested-inset)',
          '[--card-body-padding:calc(var(--card-padding)-var(--card-nested-inset))]',
        ],
      },
    },
    interactive: {
      true: {
        root: [
          'cursor-pointer no-underline',
          ...focusRing,
          'shadow-raised hover:shadow-raised-hover hover:[--card-fill:var(--card-fill-hover)]',
          'active:translate-y-(--press-depth) active:shadow-(--shadow-raised-press)',
          '[transition:--card-fill_var(--duration-press)_var(--ease-press),box-shadow_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
          'motion-reduce:[transition:none]',
        ],
      },
      false: {},
    },
  },
  defaultVariants: { appearance: 'default', interactive: false },
});

export type CardAppearance = 'default' | 'nested';

const CardContext = createContext<CardAppearance>('default');

export interface CardProps extends Omit<ComponentProps<'div'>, 'color'> {
  /**
   * 型。default は画像をカードの端まで届かせ、nested は画像をカードの内側に収めます
   * @default 'default'
   */
  appearance?: CardAppearance;
  /** 渡すと、カード全体が 1 つのリンクになります。一覧（記事・作品）のカードに使います */
  href?: string;
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
   * 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素にカードの見た目を重ねます（例: `render={<NextLink href="/works/1" />}`）。
   * article・li などにするときも使います
   */
  render?: ReactElement;
}

/**
 * 画像と文をまとめて見せる面。href を渡すと、カード全体が 1 つのリンクになります
 */
export function Card({
  appearance = 'default',
  href,
  target,
  rel,
  imageZoom = false,
  render,
  className,
  children,
  ...props
}: CardProps) {
  const interactive = href != null || renderPropOf(render, 'href') != null;
  const newTab = target === '_blank' || opensNewTab(render);
  const noteId = useId();
  const naming = newTab ? newTabNaming(props, render, noteId) : null;
  const s = styles({ appearance, interactive });
  const element = useRender({
    render,
    defaultTagName: href != null ? 'a' : 'div',
    props: {
      ...props,
      ...(href != null && { href, target, rel: newTab ? (rel ?? 'noopener noreferrer') : rel }),
      ...naming?.props,
      'data-slot': 'card',
      'data-appearance': appearance,
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
  return <CardContext value={appearance}>{element}</CardContext>;
}

export interface CardBodyProps extends ComponentProps<'div'> {
  children?: ReactNode;
}

/**
 * カードの文の部分。余白と、中の要素の縦の間を決めます
 */
export function CardBody({ className, ...props }: CardBodyProps) {
  return <div data-slot="card-body" className={styles().body({ className })} {...props} />;
}

export type CardImageProps = Omit<ImageProps, 'radius' | 'outline'>;

/**
 * カードの画像。比率はカードで共通の 16:9 で、はみ出た分を切ります。角はカードの型に合わせます
 */
export function CardImage({
  ratio = 'var(--card-media-aspect)',
  className,
  frameClassName,
  ...props
}: CardImageProps) {
  const appearance = useContext(CardContext);
  const nested = appearance === 'nested';
  return (
    <Image
      ratio={ratio}
      radius={nested ? 'nested' : 'none'}
      // 端まで届かせるときは、カードの輪郭がそのまま画像の縁になる
      outline={nested}
      className={styles().image({ className })}
      // hover で大きくした画像を、枠の角で切る（入れ子の型の同心の角を保つ）
      frameClassName={['rounded-(--image-radius)', frameClassName].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
