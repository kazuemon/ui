'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  type ReactNode,
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { VariantProps } from 'tailwind-variants';

import { figureImageStyles } from '../../internal/reading/blocks';
import { tv } from '../../internal/tv';
import { AspectRatio } from '../aspect-ratio/AspectRatio';
import { skeletonMotion, skeletonSurface } from '../../internal/skeleton-styles';
import { ImageBrokenIcon } from './image-icons';

// 画像（軸 90）。角はカードの角、輪郭は Figure と同じ（原則5。見た目のクラス列は src/internal/reading/blocks.ts）
// 読み込むまでは Skeleton と同じ面を置き、読み込んだら画像をすぐ出す。失敗したら、面の上に破れた画像のアイコンと文を出す
// 枠は読み込む前から決める: ratio を書けばその比、width・height を書けばその比（どちらも切り取って埋める）
//   どれもなければ、16:9 の画像だと仮定して読み込み中（と失敗したとき）は 16:9 の枠を取り、読み込めたら画像本来の比の高さに変える
//   （スクリプトが動かない描き方でも、画像本来の比で描く）
//   このとき高さが変わり、下の内容が跳ぶ。寸法を書かない以上しかたがないので、跳ばせたくないときは width・height か ratio を書く
// 面を出すのは、描いたあとに読み込みが終わっていないと分かったときだけ。スクリプトが動かない描き方（Astro の静的な出力など）では、
//   素の画像のまま出す（面を置かないだけで、画像は隠さない）

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

// サーバーで描くときは useLayoutEffect が警告を出すので、ブラウザでだけ使う
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const styles = tv({
  slots: {
    frame: 'group/image relative block',
    image: [
      figureImageStyles.base,
      'rounded-(--image-radius)',
      'group-data-[status=error]/image:opacity-0 group-data-[status=loading]/image:opacity-0',
      // 本来の比で描くときは、枠いっぱいに重ねず、画像の高さで枠を広げる（AspectRatio の *:absolute より強く効かせる）
      'group-data-natural/image:relative group-data-natural/image:h-auto',
    ],
    // 面は画像の上に重ね、読み込み中と失敗のときだけ見せる
    placeholder: [
      skeletonSurface,
      skeletonMotion.sweep,
      'absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-(--image-radius) p-4 text-fg-subtle',
      // 失敗した面は動かさない
      'group-data-[status=error]/image:animate-none group-data-[status=error]/image:after:hidden',
      'group-data-[status=loaded]/image:invisible group-data-[status=loaded]/image:animate-none group-data-[status=loaded]/image:after:hidden',
    ],
    errorIcon: 'hidden size-(--image-icon-size) shrink-0 group-data-[status=error]/image:block',
    // 長い文は 2 行で切る（line-clamp は display を持つので、出し分けの要素の内側に置く）
    errorText:
      'hidden max-w-full text-center text-(length:--text-caption) leading-(--leading-caption) group-data-[status=error]/image:block',
    errorTextClamp: 'line-clamp-2',
  },
  variants: {
    outline: {
      true: { image: figureImageStyles.outline },
      false: {},
    },
    // 角。card はカードの角、nested は入れ子のカードの内側の角（外の角から余白を引いた同心の角）、none はカードの端まで届かせるとき
    radius: {
      card: { frame: '[--image-radius:var(--radius-card)]' },
      nested: {
        frame: '[--image-radius:calc(var(--radius-card)-var(--card-nested-inset))]',
      },
      none: { frame: '[--image-radius:0px]' },
    },
  },
  defaultVariants: { outline: true, radius: 'card' },
});

// width・height から枠の比を作る（数か、数だけの文字のとき）
const toSize = (value: unknown) => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : undefined;
};

export interface ImageProps extends Omit<ComponentProps<'img'>, 'alt' | 'src'> {
  /** 画像の URL。まだ決まっていない（データを読み込んでいる）あいだは書かずにおくと、読み込み中の面を出します。render を渡すときは、渡す要素に書きます */
  src?: string;
  /** 画像の代わりの文。飾りだけの画像は空文字にします。render を渡すときは、渡す要素に書きます */
  alt?: string;
  /**
   * 描く画像の要素（Base UI の render と同じ）。Next.js の Image などを渡すと、その要素に画像の見た目を重ねます。
   * src・alt・width などは渡す要素に書きます（例: `render={<NextImage src={photo} alt="…" />}`）
   */
  render?: ReactElement;
  /**
   * 幅に対する高さの比（16 / 9 など）。書くと、その比の枠に収め、はみ出た分を切ります。
   * 書かないときは width・height の比の枠を取ります。
   * どれもないときは、読み込み中と失敗したときは 16:9 の枠を取り、読み込めたら画像本来の比の高さに変えます。
   * そのとき高さが変わり、下の内容が動きます。動かしたくないときは width・height か ratio を書きます
   */
  ratio?: number | string;
  /**
   * 読み込みに失敗したときに、面の上に出す文。読み上げでは、画像の alt のあとに読まれます
   * @default '読み込みに失敗しました'
   */
  errorText?: ReactNode;
  /**
   * 細い輪郭を付けるか。白っぽい画像が白地に溶けないように付けます
   * @default true
   */
  outline?: boolean;
  /**
   * 角。card はカードの角、nested は入れ子のカードの内側の角、none は角なし（カードの端まで届かせる画像）です
   * @default 'card'
   */
  radius?: VariantProps<typeof styles>['radius'];
  /** 画像を包む枠に付けるクラス。className は画像の要素に付きます */
  frameClassName?: string;
}

/**
 * 画像。読み込むまでは、同じ場所に読み込み中の面を置きます。読み込みに失敗したときは、面の上にアイコンと文を出します
 *
 * Next.js の Image は `render` に渡します。Astro では `getImage()` で作った `src`・`srcSet` などを、そのまま渡します。
 */
export function Image({
  ratio,
  errorText = '読み込みに失敗しました',
  outline,
  radius,
  className,
  frameClassName,
  render,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const renderProps = (render?.props ?? {}) as { src?: unknown; width?: unknown; height?: unknown };
  const src = renderProps.src ?? props.src;
  const width = toSize(renderProps.width ?? props.width);
  const height = toSize(renderProps.height ?? props.height);
  const [status, setStatus] = useState<ImageStatus>('idle');
  const imageRef = useRef<HTMLImageElement>(null);

  // 描いた時点で読み込みが終わっているか確かめる（サーバーで描いた画像は、スクリプトより先に読み込みが終わることがある）
  useIsomorphicLayoutEffect(() => {
    const image = imageRef.current;
    if (!src || !image) {
      setStatus('loading');
      return;
    }
    if (image.complete) setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    else setStatus('loading');
  }, [src]);

  const sized = ratio == null && width != null && height != null;
  // 寸法がなく、読み込み中でも失敗でもないとき（読み込めた・スクリプトが動かない）は、画像本来の比の高さで描く
  const natural = ratio == null && !sized && status !== 'loading' && status !== 'error';
  const s = styles({ outline, radius });
  const image = useRender({
    render,
    defaultTagName: 'img',
    ref: imageRef,
    props: {
      ...props,
      onLoad: (event: SyntheticEvent<HTMLImageElement>) => {
        setStatus('loaded');
        onLoad?.(event);
      },
      onError: (event: SyntheticEvent<HTMLImageElement>) => {
        setStatus('error');
        onError?.(event);
      },
      className: s.image({ className }),
    },
  });

  return (
    <AspectRatio
      ratio={ratio ?? (sized ? `${width} / ${height}` : natural ? 'auto' : 16 / 9)}
      render={<span />}
      data-slot="image"
      data-status={status === 'idle' ? undefined : status}
      data-natural={natural || undefined}
      className={s.frame({ className: frameClassName })}
    >
      {image}
      {status !== 'idle' && (
        <span className={s.placeholder()}>
          <ImageBrokenIcon className={s.errorIcon()} />
          {/* 失敗したときだけ見え、読み上げでは画像の alt のあとに読まれる */}
          <span className={s.errorText()}>
            <span className={s.errorTextClamp()}>{errorText}</span>
          </span>
        </span>
      )}
    </AspectRatio>
  );
}
