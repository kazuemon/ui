'use client';

import {
  type ComponentProps,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { PlayIcon } from '../../internal/icons';
import { toMediaSize } from '../../internal/media-size';
import { skeletonMotion, skeletonSurface } from '../../internal/skeleton-styles';
import { tv } from '../../internal/tv';
import { AspectRatio } from '../aspect-ratio/AspectRatio';
import { figureCaptionClass, figureClass } from '../figure/Figure';
import { VideoBrokenIcon } from './video-icons';

// 動画（軸 297〜299）。手元の動画ファイル（mp4・webm など）を記事や作品ページに置いて再生する。
//   外部サービスの埋め込みは Embed（iframe）が受け持つので、これは <video> だけの部品
// コントロールはブラウザ標準（controls、既定 true）。シーク・音量・全画面までを自前で作るのは見送った
//   （土台になる Slider がまだなく、キーボード・読み上げを作り込むと 1 部品の範囲を超えるため）。
//   自前で持つのは、controls={false} のときだけ重ねる大きな再生ボタン。controls を出しているときは
//   ブラウザ自身の再生ボタンと二重になるので重ねない。押すと video.play() を呼び、再生が始まったら消える
//   見た目は playButtonVariant（既定 raised＝円形・primary の塗り・浮いた影、flat＝白の半透明・影なし。決定: 軸297）
// 自動再生・ループ・音なし（GIF の代わり）は controls={false} + autoPlay + loop + muted で使う
//   prefers-reduced-motion のときは自動再生せず、止まった最初のコマのまま、標準のコントロールを強制して出す
//   （動かないままでも、押して再生する手段だけは残す。原則14「動きを減らす設定でも、伝えることは減らしません」）
// poster があるあいだの「まだ読み込んでいない」見た目はブラウザに任せ、Skeleton の面は重ねない
//   （面を重ねると poster が隠れるため）。poster がないときだけ、Image と同じ Skeleton の面（光が動く）を出す（決定: 軸298）
// 失敗した（読み込みエラー・形式に非対応）ときは、poster の有無によらず、Image と同じ面の上にアイコンと文を出す
// 中身の収め方（fit）は既定を持たず、cover・contain のどちらかを必ず渡してもらう（決定: 軸299）
// キャプションは Figure と同じ figureClass・figureCaptionClass を共有する。枠の角・輪郭は Image と同じ考え方（原則5）

type VideoStatus = 'idle' | 'loading' | 'loaded' | 'error';

// サーバーで描くときは useLayoutEffect が警告を出すので、ブラウザでだけ使う（Image と同じ）
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const styles = tv({
  slots: {
    frame: 'group/video relative block',
    video: [
      'block size-full rounded-(--video-radius) bg-(--video-letterbox-fill)',
      'data-video-hidden:opacity-0',
    ],
    // 面は video の上に重ね、poster がないときの読み込み中と、失敗したときだけ描く（React 側で出し分ける）
    // 読み込み中（poster なし）だけ、動き・出す/出さないをトークンで選べる（軸298）。失敗はこのトークンを見ず常に出す
    placeholder: [
      skeletonSurface,
      skeletonMotion.sweep,
      'absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-(--video-radius) p-4 text-fg-subtle',
      'group-data-[status=loading]/video:opacity-(--video-loading-opacity)',
      'group-data-[status=loading]/video:[animation-play-state:var(--video-loading-motion-play-state)]',
      'group-data-[status=error]/video:animate-none group-data-[status=error]/video:after:hidden',
    ],
    errorIcon: 'hidden size-(--video-icon-size) shrink-0 group-data-[status=error]/video:block',
    errorText:
      'hidden max-w-full text-center text-(length:--text-caption) leading-(--leading-caption) group-data-[status=error]/video:block',
    errorTextClamp: 'line-clamp-2',
    // 再生前に重ねる大きな再生ボタン（軸297）。押せる範囲を見た目の円と一致させる（原則17）ので、
    // AspectRatio が直接の子に強制する size-full（*:size-full）より、自分の大きさを勝たせる（!size-）
    play: [
      'absolute inset-0 m-auto flex !size-(--video-play-size) cursor-pointer items-center justify-center rounded-pill',
      'bg-(--video-play-fill) text-(color:--video-play-fg) shadow-(--video-play-shadow)',
      '[transition:scale_var(--duration-press)_var(--ease-press)] hover:scale-(--video-play-hover-scale) motion-reduce:[transition:none]',
      ...focusRing,
    ],
    playIcon: 'size-(--video-play-icon-size) translate-x-[8%]',
  },
  variants: {
    outline: {
      true: {
        video:
          '[outline:var(--border-width-thin)_solid_color-mix(in_oklab,var(--color-fg)_12%,transparent)] [outline-offset:calc(var(--border-width-thin)*-1)]',
      },
      false: {},
    },
    // 角。card はカードの角、nested は入れ子のカードの内側の角、none は角なし（Image と同じ考え方。原則5）
    radius: {
      card: { frame: '[--video-radius:var(--radius-card)]' },
      nested: { frame: '[--video-radius:calc(var(--radius-card)-var(--card-nested-inset))]' },
      none: { frame: '[--video-radius:0px]' },
    },
    // 再生ボタンの見た目（軸297・決定）。raised は tokens.css の既定（円形・primary の塗り・浮いた影）のまま、
    //   flat は白の半透明・影なしに上書きする（ImageZoom の closeButtonVariant と同じ作り）
    playButtonVariant: {
      raised: {},
      flat: {
        play: '[--video-play-fg:white] [--video-play-fill:color-mix(in_oklab,white_55%,transparent)] [--video-play-shadow:none]',
      },
    },
  },
  defaultVariants: { outline: true, radius: 'card', playButtonVariant: 'raised' },
});

/** 動画の角。Image と同じ card・nested・none です */
export type VideoRadius = NonNullable<VariantProps<typeof styles>['radius']>;
/** 再生前に重ねる大きな再生ボタンの見た目。raised は円形・primary の塗り・浮いた影、flat は白の半透明・影なし */
export type VideoPlayButtonVariant = NonNullable<VariantProps<typeof styles>['playButtonVariant']>;
/** 動画の収め方。cover は枠に合わせて切り取り、contain は切り取らず収めて余白を残します */
export type VideoFit = 'cover' | 'contain';

export interface VideoProps extends Omit<
  ComponentProps<'video'>,
  'children' | 'controls' | 'poster'
> {
  /** 動画の URL。複数の形式を用意するときは書かず、children に `<source>` を並べます */
  src?: string;
  /** 再生する前に出す画像の URL。渡さないときは、読み込むまで Skeleton と同じ面を出します */
  poster?: string;
  /**
   * 幅に対する高さの比。書かないときは width・height の比（どちらもあれば）、それもなければ 16:9 です。
   * Embed と同じ考え方で、Image のような「読み込めたら本来の比に変わる」動きは持ちません
   */
  ratio?: number | string;
  /**
   * 動画の収め方。cover は枠からはみ出た分を切り取って隙間なく埋め、contain は切り取らずに枠へ収め、
   * 余白ができたところは面の色（読み込み中と同じ塗り）で埋めます。切り取ると困る操作の録画・デモは contain、
   * それ以外は cover など、場面によって選び方が変わるため、既定値は持ちません。必ずどちらかを渡します
   */
  fit: VideoFit;
  /**
   * ブラウザ標準の再生コントロール（再生・シーク・音量・全画面・字幕）を出します。
   * false にすると、大きな再生ボタンを面に重ね、自動再生・ループ・音なしの短い動画（GIF の代わり）にも使えます。
   * 自動再生が止められたとき（次の autoPlay の説明）は、渡した値によらず true として扱います
   * @default true
   */
  controls?: boolean;
  /**
   * 自動再生します。音声を伴う自動再生はブラウザに止められるため、`muted` と組み合わせて使います。
   * 動きを減らす設定（prefers-reduced-motion）のときは自動再生せず、`controls` を強制的に出して、
   * 押して再生する手段だけ残します（原則14）
   * @default false
   */
  autoPlay?: boolean;
  /**
   * 終わったら最初から繰り返します
   * @default false
   */
  loop?: boolean;
  /**
   * 音を出しません。自動再生する動画は、たいてい必要です
   * @default false
   */
  muted?: boolean;
  /**
   * iOS で、全画面にせずその場で再生します。自動再生するときは実質必須です
   * @default true
   */
  playsInline?: boolean;
  /**
   * 読み込みに失敗した・形式に対応していないときに、面の上に出す文
   * @default '読み込みに失敗しました'
   */
  errorText?: ReactNode;
  /**
   * 細い輪郭を出さないようにします。輪郭は、暗い動画が暗い地に溶けないように既定で付きます
   * @default false
   */
  hideOutline?: boolean;
  /**
   * 角。card はカードの角、nested は入れ子のカードの内側の角、none は角なし（カードの端まで届かせる動画）です
   * @default 'card'
   */
  radius?: VideoRadius;
  /** 下に添えるキャプション。Figure と同じ見た目です */
  caption?: ReactNode;
  /**
   * controls={false} のときに重ねる、再生前の大きな再生ボタンの見た目。raised は円形・primary の塗り・浮いた影、
   * flat は白の半透明・影なしです
   * @default 'raised'
   */
  playButtonVariant?: VideoPlayButtonVariant;
  /**
   * controls={false} のときに重ねる、再生前の大きな再生ボタンの読み上げの名前。画面には出ません
   * @default '再生'
   */
  playName?: string;
  /** 画面に出ない読み上げの名前（aria-label）。caption や周りの文で伝わらないときに渡します */
  accessibleName?: string;
  /** 動画の中身。複数形式の `<source>` や、字幕・キャプションの `<track>` を並べます */
  children?: ReactNode;
  /** 外側の figure 要素（枠を描く要素）に渡す props。className は動画の要素に付きます */
  frameProps?: ComponentProps<'div'>;
  /** 動画の要素に付きます。枠に付けるクラスは frameProps の className に渡します */
  className?: string;
}

/**
 * 手元の動画ファイル（mp4・webm など）を記事や作品ページに置いて再生します
 *
 * `fit`（`cover`・`contain`）は既定値を持たないので、必ず渡します。
 * コントロールはブラウザ標準です。`controls={false}` にすると、`autoPlay`・`loop`・`muted` と組み合わせて、
 * 操作の録画のような音なしのループ再生（GIF の代わり）に使えます。動きを減らす設定のときは自動再生せず、
 * 標準のコントロールを出して押して再生できるようにします。
 * 複数の形式や字幕を渡すときは、`children` に `<source>`・`<track>` を並べます。
 */
export function Video({
  poster,
  ratio,
  fit,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = true,
  errorText = '読み込みに失敗しました',
  hideOutline = false,
  radius,
  caption,
  playButtonVariant = 'raised',
  playName = '再生',
  accessibleName,
  children,
  frameProps,
  className,
  onLoadedData,
  onError,
  onPlay,
  width,
  height,
  style,
  ...props
}: VideoProps) {
  const [status, setStatus] = useState<VideoStatus>('idle');
  // 自動再生の要求を、動きを減らす設定で止めたか。止めたときはコントロールを強制し、再生ボタンも出す
  const [autoPlaySuppressed, setAutoPlaySuppressed] = useState(false);
  // 再生を一度でも始めたか。始めるまでは、大きな再生ボタンを重ねる
  const [started, setStarted] = useState(autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);

  useIsomorphicLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) {
      setStatus('loading');
      return;
    }
    // HAVE_CURRENT_DATA 以上なら、すでに描けるコマがある（サーバーで描いたあと、有効な src だけで判定する）
    if (video.readyState >= 2) setStatus('loaded');
    else setStatus('loading');
  }, []);

  useEffect(() => {
    if (!autoPlay) return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setAutoPlaySuppressed(mql.matches);
      if (mql.matches) {
        videoRef.current?.pause();
        setStarted(false);
      }
    };
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, [autoPlay]);

  const widthValue = toMediaSize(width);
  const heightValue = toMediaSize(height);
  const sized = ratio == null && widthValue != null && heightValue != null;
  const s = styles({ outline: !hideOutline, radius, playButtonVariant });
  // スクリプトが動かない描き方では status は idle のまま変わらない。素の video のまま出す（面を重ねない。Image と同じ）
  const showPlaceholder = status === 'error' || (poster == null && status === 'loading');
  const effectiveControls = controls || autoPlaySuppressed;

  return (
    <figure className={figureClass()}>
      <AspectRatio
        ratio={ratio ?? (sized ? `${widthValue} / ${heightValue}` : 16 / 9)}
        data-slot="video"
        data-status={status}
        {...frameProps}
        className={s.frame({ className: frameProps?.className })}
      >
        <video
          {...props}
          ref={videoRef}
          width={width}
          height={height}
          poster={poster}
          controls={effectiveControls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          aria-label={accessibleName}
          data-video-hidden={showPlaceholder || undefined}
          // object-fit は AspectRatio の既定（object-cover。すべての img・video に当てる）より必ず勝たせたいので、
          // クラスではなくインラインの style にする
          style={{ ...style, objectFit: fit }}
          onLoadedData={(event: SyntheticEvent<HTMLVideoElement>) => {
            if (status !== 'error') setStatus('loaded');
            onLoadedData?.(event);
          }}
          onError={(event: SyntheticEvent<HTMLVideoElement>) => {
            setStatus('error');
            onError?.(event);
          }}
          onPlay={(event: SyntheticEvent<HTMLVideoElement>) => {
            setStarted(true);
            onPlay?.(event);
          }}
          className={s.video({ className })}
        >
          {children}
        </video>
        {showPlaceholder && (
          <span className={s.placeholder()}>
            <VideoBrokenIcon className={s.errorIcon()} />
            <span className={s.errorText()}>
              <span className={s.errorTextClamp()}>{errorText}</span>
            </span>
          </span>
        )}
        {/* controls を出しているときは、ブラウザの再生ボタンと二重になるので重ねない。出番は controls={false} のときだけ。
            失敗したときは、代わりにエラーの面を出す */}
        {!effectiveControls && !started && status !== 'error' && (
          <button
            type="button"
            aria-label={playName}
            data-slot="video-play"
            onClick={() => videoRef.current?.play()}
            className={s.play()}
          >
            <PlayIcon standalone className={s.playIcon()} />
          </button>
        )}
      </AspectRatio>
      {caption != null && <figcaption className={figureCaptionClass}>{caption}</figcaption>}
    </figure>
  );
}
