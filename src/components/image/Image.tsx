'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  type ReactNode,
  type ReactElement,
  type SyntheticEvent,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { VariantProps } from 'tailwind-variants';

import { ImagePlaceholderAnimationContext } from '../../internal/image-placeholder-context';
import { toMediaSize } from '../../internal/media-size';
import { figureImageStyles } from '../../internal/reading/blocks';
import { tv } from '../../internal/tv';
import { AspectRatio, type MediaFit } from '../aspect-ratio/AspectRatio';
import { skeletonMotion, skeletonSurface } from '../../internal/skeleton-styles';
import { ImageBrokenIcon } from './image-icons';

// 画像（軸 90）。角はカードの角、輪郭は Figure と同じ（原則5。見た目のクラス列は src/internal/reading/blocks.ts）
// 読み込むまでは Skeleton と同じ面を置き、読み込んだら画像をすぐ出す。失敗したら、面の上に破れた画像のアイコンと文を出す
// 枠は読み込む前から決める: ratio を書けばその比、width・height を書けばその比（どちらも切り取って埋める）
//   どれもなければ、16:9 の画像だと仮定して読み込み中（と失敗したとき）は 16:9 の枠を取り、読み込めたら画像本来の比の高さに変える
//   （スクリプトが動かない描き方でも、画像本来の比で描く）
//   このとき高さが変わり、下の内容が跳ぶ。寸法を書かない以上しかたがないので、跳ばせたくないときは width・height か ratio を書く
// 仮画像（placeholder。小さな画像の URL か要素）を渡すと、読み込み中は面の代わりに、それをぼかして敷く（軸 492・493）
//   読み込めたら本物を上に重ねて出し（--image-reveal-*）、仮画像は出し終えてから隠す。失敗したときは、仮画像の上に失敗の面を出す
// 代わりの画像（fallbackSrc）を渡すと、src が読み込めなかったときに一度だけそれに替える。それも失敗したら失敗の面を出す
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
      // 本来の比で描くときは、枠いっぱいに重ねず、画像の高さで枠を広げる（AspectRatio の最初の子の absolute より強く効かせる）
      'group-data-natural/image:relative group-data-natural/image:h-auto',
      // 仮画像があるときだけ、本物を重ねて出す動きを付ける（ないときは今まで通りすぐ出す）
      'group-data-placeholder/image:transition-[opacity,filter] group-data-placeholder/image:duration-(--image-reveal-duration) group-data-placeholder/image:ease-out',
      'group-data-placeholder/image:group-data-[status=loading]/image:[filter:blur(var(--image-reveal-from-blur))]',
      'motion-reduce:group-data-placeholder/image:[filter:none]',
    ],
    // 仮画像の層。本物の下に敷く。ぼかした縁が透けないよう、少し大きくして枠で切る
    blur: [
      'pointer-events-none absolute inset-0 overflow-hidden rounded-(--image-radius)',
      // 本物を出し終えてから隠す（透ける画像の下に残らないように）
      'transition-[visibility] delay-(--image-reveal-duration) group-data-[status=loaded]/image:invisible',
    ],
    blurInner:
      'block size-full scale-110 [filter:blur(var(--image-placeholder-blur))] *:size-full *:object-cover',
    // 面は画像の上に重ね、読み込み中と失敗のときだけ見せる
    // 動きは、単体では面ごとの光（sweep）。Gallery に並べたときは、Gallery が決める（軸 411）
    placeholder: [
      skeletonSurface,
      'absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-(--image-radius) p-4 text-fg-subtle',
      // 失敗した面は動かさない
      'group-data-[status=error]/image:animate-none group-data-[status=error]/image:after:hidden',
      'group-data-[status=loaded]/image:invisible group-data-[status=loaded]/image:animate-none group-data-[status=loaded]/image:after:hidden',
      // 仮画像があるときは、読み込み中の面を出さない（失敗したときだけ出す）
      'group-data-placeholder/image:group-data-[status=loading]/image:invisible',
    ],
    errorIcon: 'hidden size-(--image-icon-size) shrink-0 group-data-[status=error]/image:block',
    // 長い文は 2 行で切る（line-clamp は display を持つので、出し分けの要素の内側に置く）
    errorText:
      'hidden max-w-full text-center text-(length:--text-caption) leading-(--leading-caption) group-data-[status=error]/image:block',
    errorTextClamp: 'line-clamp-2',
  },
  variants: {
    animation: {
      sweep: { placeholder: skeletonMotion.sweep },
      'sweep-viewport': { placeholder: skeletonMotion['sweep-viewport'] },
      pulse: { placeholder: skeletonMotion.pulse },
    },
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
  defaultVariants: { animation: 'sweep', outline: true, radius: 'card' },
});

/** 画像の角 */
export type ImageRadius = NonNullable<VariantProps<typeof styles>['radius']>;

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
   * 枠に収める方法。cover ははみ出た分を切り、contain は切らずに収めて余白を残します。
   * 枠が画像本来の比のとき（ratio・width・height のどれもないとき）は、どちらでも同じです
   * @default 'cover'
   */
  fit?: MediaFit;
  /**
   * 読み込みに失敗したときに、面の上に出す文。読み上げでは、画像の alt のあとに読まれます
   * @default '読み込みに失敗しました'
   */
  errorText?: ReactNode;
  /**
   * 細い輪郭を出さないようにします。輪郭は、白っぽい画像が白地に溶けないように既定で付きます
   * @default false
   */
  hideOutline?: boolean;
  /**
   * 角。card はカードの角、nested は入れ子のカードの内側の角、none は角なし（カードの端まで届かせる画像）です
   * @default 'card'
   */
  radius?: ImageRadius;
  /**
   * 読み込むまで敷く仮画像。小さな画像の URL（数十 px の縮小版や data URL）か、要素（BlurHash を描いた canvas など）を渡します。
   * ぼかして枠いっぱいに広げ、読み込めたら本物に替えます。渡さないときは、読み込み中の面を出します
   */
  placeholder?: string | ReactElement;
  /** src が読み込めなかったときに替える画像の URL。それも読み込めなかったときは、失敗の面を出します。render を渡すときは使いません */
  fallbackSrc?: string;
  /** 画像を包む枠（枠の要素）に渡す props。className は画像の要素に付きます */
  frameProps?: ComponentProps<'span'>;
  /** 画像の要素に付きます。枠に付けるクラスは frameProps の className に渡します */
  className?: string;
}

/**
 * 画像。読み込むまでは、同じ場所に読み込み中の面を置きます。読み込みに失敗したときは、面の上にアイコンと文を出します
 *
 * Next.js の Image は `render` に渡します。Astro では `getImage()` で作った `src`・`srcSet` などを、そのまま渡します。
 */
export function Image({
  ratio,
  fit,
  errorText = '読み込みに失敗しました',
  hideOutline = false,
  radius,
  className,
  frameProps,
  render,
  onLoad,
  onError,
  placeholder,
  fallbackSrc,
  ...imageProps
}: ImageProps) {
  const renderProps = (render?.props ?? {}) as { src?: unknown; width?: unknown; height?: unknown };
  // 読み込めなかった src。今の src と同じなら代わりの画像に替える（src が変われば、また src から読む）
  const [failedSrc, setFailedSrc] = useState<string>();
  const useFallback =
    !render && fallbackSrc != null && imageProps.src != null && failedSrc === imageProps.src;
  const props = useFallback ? { ...imageProps, src: fallbackSrc } : imageProps;
  const src = renderProps.src ?? props.src;
  const width = toMediaSize(renderProps.width ?? props.width);
  const height = toMediaSize(renderProps.height ?? props.height);
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

  // 失敗したら、描く前に代わりの画像に替える（失敗の面を一瞬も出さない）
  useIsomorphicLayoutEffect(() => {
    if (status !== 'error' || render || fallbackSrc == null || useFallback) return;
    if (imageProps.src != null) setFailedSrc(imageProps.src);
  }, [status]);

  const sized = ratio == null && width != null && height != null;
  // 寸法がなく、読み込み中でも失敗でもないとき（読み込めた・スクリプトが動かない）は、画像本来の比の高さで描く
  const natural = ratio == null && !sized && status !== 'loading' && status !== 'error';
  const animation = useContext(ImagePlaceholderAnimationContext) ?? 'sweep';
  const s = styles({ animation, outline: !hideOutline, radius });
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
      fit={fit}
      render={<span />}
      data-slot="image"
      data-status={status === 'idle' ? undefined : status}
      data-natural={natural || undefined}
      data-placeholder={placeholder != null ? '' : undefined}
      // 枠は AspectRatio を span で描く（AspectRatio の型は div のままなので、span の props として受けて渡す）
      {...(frameProps as ComponentProps<'div'>)}
      className={s.frame({ className: frameProps?.className })}
    >
      {placeholder != null && (
        <span className={s.blur()} aria-hidden>
          <span className={s.blurInner()}>
            {typeof placeholder === 'string' ? <img src={placeholder} alt="" /> : placeholder}
          </span>
        </span>
      )}
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
