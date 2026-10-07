'use client';

import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useState,
  useSyncExternalStore,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CodeIcon, PlayIcon, XLogoIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';
import { ScrollFrame } from '../../internal/ScrollFrame';
import { AspectRatio } from '../aspect-ratio/AspectRatio';
import { figureCaptionClass, figureClass } from '../figure/Figure';

// 埋め込み（軸 271〜274）。記事に YouTube・X の投稿・CodePen などの外部コンテンツを iframe で埋める
// サードパーティの script（widgets.js など）は部品に抱え込まない。iframe で埋められるものだけを対象にする（src はいつも使う側が渡す）
// 決定: 既定は最初から iframe を置く（loading="lazy" で画面に近づいたら読み込む）。クリックしてから読み込む形は clickToLoad で選ぶ
// children を渡すと、iframe が読み込めるまで（idle・loading のあいだ）その中身を出す。JS が動かなくても・Server Components でも
//   読めるようにするため（React の初期の描画に含まれる）。何も渡さなければ、部品が用意した簡単な案内（アイコン・文・題）を出す
// 枠は Image・Figure と同じ考え方（角丸・輪郭。原則1・5）。面は Skeleton と同じ塗り（--skeleton-fill・--skeleton-highlight）を使う
// 状態は data-status（idle・loading・loaded）で持つ。iframe は status が idle のあいだ DOM に作らない（Image の data-status と同じ作り）
//   idle は clickToLoad のときだけ経由する。既定（clickToLoad なし）は、最初から loading（iframe を置く。読み込みは native loading="lazy" 任せ）
//   clickToLoad の idle は、role="button" の div（キーボード操作は Enter・Space）。children に blockquote などの読みもの（flow content）を
//   渡せるようにするため、中身を持てない実際の button 要素にはしていない

type EmbedStatus = 'idle' | 'loading' | 'loaded';

const subscribeNothing = () => () => {};

/** どのサービスの埋め込みか。既定の比率・アイコン・allow 属性を決める */
export type EmbedProvider = 'youtube' | 'vimeo' | 'x' | 'codepen' | 'custom';

interface EmbedProviderConfig {
  ratio: number | string;
  icon: (props: { className?: string }) => ReactNode;
  allow?: string;
  allowFullScreen?: boolean;
}

// provider は、既定の比率・アイコン・allow 属性を決めるだけ。src から iframe の URL を作る機能は持たない
//   （id から URL を作る仕組みは、サービスごとの URL の形が変わりうるため見送った。各サービスの埋め込みコード・oEmbed の src をそのまま渡す）
const embedProviders: Record<EmbedProvider, EmbedProviderConfig> = {
  youtube: {
    ratio: 16 / 9,
    icon: PlayIcon,
    allow:
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowFullScreen: true,
  },
  vimeo: {
    ratio: 16 / 9,
    icon: PlayIcon,
    allow: 'autoplay; fullscreen; picture-in-picture; clipboard-write',
    allowFullScreen: true,
  },
  x: {
    ratio: 4 / 5,
    icon: XLogoIcon,
  },
  codepen: {
    ratio: 3 / 2,
    icon: CodeIcon,
    allow: 'clipboard-write',
  },
  custom: {
    ratio: 16 / 9,
    icon: PlayIcon,
  },
};

const styles = tv({
  slots: {
    // frame は AspectRatio の className に渡す。position・overflow-hidden・子を絶対配置で重ねる指定は
    //   AspectRatio 自身が既に持つ（src/components/aspect-ratio/AspectRatio.tsx）ので、ここでは角・影・輪郭だけを足す
    // 角は常にカードの角（Image・Figure と同じ）。idle（clickToLoad でまだ押していないあいだ）だけ、
    //   影・輪郭の値を --embed-idle-* に差し替える（軸272。決定: A＝浮いた影・輪郭なし）
    frame: [
      'group/embed',
      'rounded-card shadow-(--embed-shadow)',
      '[outline:var(--embed-outline-width)_solid_var(--embed-outline-color)]',
      '[outline-offset:calc(var(--embed-outline-width)*-1)]',
      'data-[status=idle]:[--embed-shadow:var(--shadow-raised)]',
      'data-[status=idle]:[--embed-outline-width:var(--embed-idle-outline-width)]',
    ],
    iframe: ['border-0 opacity-0', 'group-data-[status=loaded]/embed:opacity-100'],
    // face は枠いっぱいに重ねる。AspectRatio が広げるのは最初の子だけで、読み込み中は iframe のあとに置くので、自分で置く。
    //   after: の光の帯は、この絶対配置そのものを基準にできる
    // 面は Skeleton と同じ塗り（軸271・決定 A）。光の帯は、クリック前（idle）は止め、読み込み中（loading）は動く（軸271・274）
    // 中身が面より高いとき（低い比率に大きな children）は、中の ScrollFrame（faceScroll）がスクロールする
    face: [
      'absolute inset-0 flex size-full flex-col overflow-hidden',
      'bg-(--skeleton-fill)',
      'after:pointer-events-none after:absolute after:inset-0 after:[background-position:100%_0] after:bg-no-repeat',
      'after:animate-(--skeleton-sweep) after:bg-size-[300%_100%]',
      'after:[background-image:linear-gradient(90deg,transparent_35%,var(--skeleton-highlight)_50%,transparent_65%)]',
      'motion-reduce:animate-pulse motion-reduce:after:hidden',
      'group-data-[status=idle]/embed:after:[animation-play-state:paused]',
      'group-data-[status=loaded]/embed:hidden',
      ...focusRing,
    ],
    // 面の中身を並べる。収まるときは面の中央に置き、収まらないときは上から並べてスクロールする
    faceContent: 'flex min-h-full flex-col items-center justify-center gap-1 p-4 text-center',
    icon: 'size-8 shrink-0 text-fg-subtle',
    label: 'text-body-sm font-bold text-fg',
    sub: 'line-clamp-1 max-w-full text-caption text-fg-subtle',
  },
});

export interface EmbedProps extends Omit<
  ComponentProps<'iframe'>,
  'src' | 'title' | 'children' | 'loading'
> {
  /**
   * どのサービスの埋め込みか。既定の比率・アイコン・allow 属性が決まります。id から URL を作る機能はなく、src はいつも自分で渡します
   * @default 'custom'
   */
  provider?: EmbedProvider;
  /** 埋め込みの URL。各サービスの埋め込みコード・oEmbed から得た iframe の src を、そのまま渡します */
  src: string;
  /** 埋め込みの題。iframe の読み上げの名前になり、children を渡さないときは面にも文字で出します。何を埋め込んでいるかが伝わる文にします */
  title: string;
  /**
   * 幅に対する高さの比。指定しないときは provider の既定です（youtube・vimeo は 16 / 9、x は 4 / 5、codepen は 3 / 2、custom は 16 / 9）
   */
  ratio?: number | string;
  /** 下に添えるキャプション */
  caption?: ReactNode;
  /** キャプションを付けたときの、外側の figure 要素に渡す props。キャプションがないときは figure で包みません */
  figureProps?: ComponentProps<'figure'>;
  /**
   * iframe が読み込めるまで（クリックを待つあいだ・読み込んでいるあいだ）出す中身。X の投稿の文面などを渡します。JS が動かなくても・
   * Server Components でも読めます（最初の描画に含まれ、読み込めたら iframe に置き換わります）。渡さないときは、部品が用意した案内を出します
   */
  children?: ReactNode;
  /**
   * クリックするまで iframe を作らず、外部への通信を遅らせます。既定は渡さず最初から iframe を置き、
   * ブラウザの `loading="lazy"`（既定値。上書きできます）で、画面に近づいたときに読み込みます
   * @default false
   */
  clickToLoad?: boolean;
  /**
   * clickToLoad のときに面へ出す文（children があれば、その下に添えます）。読み上げでは、この文と title が続けて名前になります
   * @default '読み込む'
   */
  loadLabel?: string;
  /**
   * 読み込んでいるあいだ（iframe を置いてから読み込みが終わるまで）に、children がないときだけ出す文
   * @default '読み込み中'
   */
  loadingText?: string;
  /**
   * iframe の読み込み方（素の HTML の `loading` 属性）。`lazy` は画面に近づいたらブラウザが読み込みます
   * @default 'lazy'
   */
  loading?: 'eager' | 'lazy';
  /** 枠（AspectRatio を描く要素）に渡す props。className は iframe の要素に付きます */
  frameProps?: ComponentProps<'div'>;
  /** iframe の要素に付きます。枠に付けるクラスは frameProps の className に渡します */
  className?: string;
}

/**
 * 記事に YouTube・X の投稿・CodePen などの外部コンテンツを iframe で埋めます
 *
 * 既定は最初から iframe を置き、ブラウザの `loading="lazy"` で画面に近づいたときに読み込みます。クリックするまで待つときは
 * `clickToLoad` を渡します。`children` を渡すと、読み込めるまでのあいだ（JS が動かなくても）その中身を出せます。
 * src はサービスごとの埋め込みコード・oEmbed から得た URL をそのまま渡します（id からの自動組み立てはしません）。
 */
export function Embed({
  provider = 'custom',
  src,
  title,
  ratio,
  caption,
  figureProps,
  children,
  clickToLoad = false,
  loadLabel = '読み込む',
  loadingText = '読み込み中',
  frameProps,
  className,
  allow,
  allowFullScreen,
  loading = 'lazy',
  onLoad,
  ...props
}: EmbedProps) {
  const config = embedProviders[provider];
  const [status, setStatus] = useState<EmbedStatus>(clickToLoad ? 'idle' : 'loading');
  // iframe は描いたあとに作る。サーバーで描いた HTML に入れると、hydrate の前に load が終わって onLoad を取り逃し、読み込み中のまま残る
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  );
  const s = styles();
  const Icon = config.icon;
  const load = () => setStatus('loading');
  const onFaceKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    load();
  };

  const frame = (
    <AspectRatio
      ratio={ratio ?? config.ratio}
      data-slot="embed"
      data-status={status}
      {...(frameProps as ComponentProps<'div'>)}
      className={s.frame({ className: frameProps?.className })}
    >
      {status !== 'idle' && mounted && (
        <iframe
          {...props}
          src={src}
          title={title}
          loading={loading}
          allow={allow ?? config.allow}
          allowFullScreen={allowFullScreen ?? config.allowFullScreen}
          onLoad={(event) => {
            setStatus('loaded');
            onLoad?.(event);
          }}
          className={s.iframe({ className })}
        />
      )}
      {status === 'idle' && (
        <div
          role="button"
          tabIndex={0}
          data-slot="embed-load"
          onClick={load}
          onKeyDown={onFaceKeyDown}
          className={s.face({ className: 'cursor-pointer' })}
        >
          <FaceScroll className={s.faceContent()}>
            {children ?? <Icon className={s.icon()} />}
            <span className={s.label()}>{loadLabel}</span>
            {children == null && <span className={s.sub()}>{title}</span>}
          </FaceScroll>
        </div>
      )}
      {status === 'loading' && (
        <div aria-busy data-slot="embed-loading" className={s.face()}>
          {/* 回る円は出さない。光の帯（after:）だけで進んでいることを伝える（軸274・決定 A） */}
          <FaceScroll className={s.faceContent()}>
            {children}
            <span className={s.label()}>{loadingText}</span>
          </FaceScroll>
        </div>
      )}
    </AspectRatio>
  );

  // キャプションがないときは figure で包まない（Figure・ImageZoom と同じ）
  // figure・キャプション（下・中央。軸273）の見た目は Figure のものを使う
  if (caption == null) return frame;
  return (
    <figure {...figureProps} className={figureClass(figureProps?.className)}>
      {frame}
      <figcaption className={figureCaptionClass}>{caption}</figcaption>
    </figure>
  );
}

// 面の中身のスクロールの枠。ScrollArea と同じ見た目（原則1）
//   面そのものが押せる要素（role="button"）なので、枠は止まり先にしない（ボタンの中に止まり場を増やさない）
function FaceScroll({ className, children }: { className: string; children: ReactNode }) {
  return (
    <ScrollFrame
      slot="embed-face-scroll"
      className="size-full"
      contentClassName={className}
      focusable={false}
      orientation="vertical"
      inlineEdges={false}
    >
      {children}
    </ScrollFrame>
  );
}
