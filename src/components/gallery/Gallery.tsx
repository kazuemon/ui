'use client';

import {
  type ComponentProps,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

import { useDensityScope } from '../../internal/density-scope';
import { MagnifyingGlassPlusIcon } from '../../internal/image-zoom/image-zoom-icons';
import {
  type ImageZoomCaptionMotion,
  type ImageZoomCloseButtonVariant,
  type ImageZoomMotion,
  type ImageZoomVariant,
  ImageZoomViewer,
} from '../../internal/image-zoom/ImageZoomViewer';
import { zoomTriggerStyles } from '../../internal/image-zoom/zoom-trigger';
import type {
  OverlayFocusTarget,
  OverlayModal,
  PopupProps,
} from '../../internal/overlay/overlay-props';
import { cn, tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { figureCaptionClass, figureClass } from '../figure/Figure';
import { Image, type ImageProps } from '../image/Image';
import type { StackGap } from '../stack/Stack';
import { GalleryControls, type GalleryIndicator } from './GalleryControls';

export type { GalleryIndicator } from './GalleryControls';

// 画像を並べ、押すと ImageZoom と同じ拡大した面で開き、前後に送る。作品のページの画像や、記事の図をまとめて見せるのに使う
// 並べ方は素直なグリッド。画像は同じ比（--gallery-ratio か ratio）で切り取り、行をそろえる（拡大すると全体が見える）
//   列の数は columns。入れ物が狭いとき（28rem 未満）は 2 列にまとめる（入れ物の幅で決める — 原則16）
//   並べた画像はページと同じレイヤー。押す口と押せることの印は ImageZoom と同じ（src/internal/image-zoom/zoom-trigger.ts）
//   並べた画像のキャプションはページには出さず、拡大したときに画像の下に出す。Gallery 全体の caption は、並びの下に出す
// 拡大した面は ImageZoom と同じ ImageZoomViewer（後ろの面・開閉の動き・閉じ方・キャプションの出方は ImageZoom の props と同じ）
//   送る操作: 前後のボタン（GalleryControls）、←→ キー、指で左右にはじく。はじくのと、上下に引いて閉じるのは、動き始めた向きで分ける
//   送るときの動きは --gallery-slide-*（軸 290）。slideMotion の shift（既定）は少し滑り、slide は幅いっぱいに滑る
//   前後のボタンの置き場所は controlsPosition（軸 291）: bottom（既定）・sides・overlay。位置の示しは indicator（dots（既定。Carousel と同じ）・count・none）
//   閉じると、そのとき見ている画像の位置へ戻る
//   送った先の画像がページの見えるところにないときは、元の位置へ戻らずに、その場で消える（fade）

const styles = tv({
  slots: {
    root: '@container',
    // 間隔は Stack と同じ段（--stack-gap-*）。gap を書かないときは tokens.css の --gallery-gap
    list: 'm-0 grid list-none gap-(--gallery-gap) p-0',
    item: 'min-w-0',
    // 並べた画像の角（フォーカスの線も沿う）は --gallery-radius
    trigger: 'rounded-(--gallery-radius)',
    frame: '[--image-radius:var(--gallery-radius)]',
  },
  variants: {
    gap: {
      none: { list: '[--gallery-gap:0px]' },
      xs: { list: '[--gallery-gap:var(--stack-gap-xs)]' },
      sm: { list: '[--gallery-gap:var(--stack-gap-sm)]' },
      md: { list: '[--gallery-gap:var(--stack-gap-md)]' },
      lg: { list: '[--gallery-gap:var(--stack-gap-lg)]' },
      xl: { list: '[--gallery-gap:var(--stack-gap-xl)]' },
    },
    // 入れ物が狭いときは 2 列にまとめる（1 列・2 列はそのまま）
    columns: {
      1: { list: 'grid-cols-1' },
      2: { list: 'grid-cols-2' },
      3: { list: 'grid-cols-2 @md:grid-cols-3' },
      4: { list: 'grid-cols-2 @md:grid-cols-3 @xl:grid-cols-4' },
    },
  },
  defaultVariants: { columns: 3 },
});

/** 送るときの動き。shift は少し滑って入れ替わる、slide は幅いっぱいに滑る */
export type GallerySlideMotion = 'shift' | 'slide';
/** 前後に送るボタンの置き場所。bottom は下の帯、sides は左右の端（画像に重ねない）、overlay は白い丸で画像に重ねる */
export type GalleryControlsPosition = 'bottom' | 'sides' | 'overlay';

// 選べる形は、既定のトークン（tokens.css の --gallery-*）への上書きで作る。拡大した面（Popup）に当てる
const slideMotionTokens: Record<GallerySlideMotion, string> = {
  shift: '',
  slide:
    '[--gallery-slide-distance:1] [--gallery-slide-fade:0] [--gallery-slide-duration:var(--duration-slow)]',
};
const controlsPositionTokens: Record<GalleryControlsPosition, string> = {
  bottom: '',
  sides:
    '[--gallery-nav-bar:0] [--gallery-nav-space-x:1] [--gallery-nav-raised:0] [--gallery-nav-bg:transparent] [--gallery-nav-shadow:none]',
  overlay:
    '[--gallery-nav-bar:0] [--gallery-nav-space-x:0] [--gallery-nav-raised:1] [--gallery-nav-bg:var(--color-surface)] [--gallery-nav-shadow:var(--shadow-overlay)]',
};
// 送る操作の置き場所の分だけ、面の余白を取る。下の帯にまとめるときは下を、左右の端に置いて画像に重ねないときは左右を
const reserveTokens =
  '[--image-zoom-reserve-bottom:calc((var(--spacing-control)+var(--image-zoom-close-inset)*2)*var(--gallery-nav-bar))] [--image-zoom-reserve-x:calc((var(--spacing-control)+var(--image-zoom-close-inset)*2)*(1-var(--gallery-nav-bar))*var(--gallery-nav-space-x))]';

/** 並べる列の数。入れ物が狭いときは 2 列にまとめます */
export type GalleryColumns = 1 | 2 | 3 | 4;

/** 並べる画像 1 枚 */
export interface GalleryItem extends Pick<
  ImageProps,
  'src' | 'alt' | 'width' | 'height' | 'srcSet' | 'sizes' | 'render'
> {
  /** 拡大したときに読み込む、大きな画像の URL。書かないときは、並べた画像をそのまま拡大します */
  zoomSrc?: string;
  /** 拡大したときに、画像の下に出すキャプション。並べたところには出しません */
  caption?: ReactNode;
}

export interface GalleryProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** 並べる画像。`src`・`alt`・`width`・`height`・`render` は Image と同じです */
  items: GalleryItem[];
  /**
   * 並べる列の数。入れ物が狭いとき（28rem 未満）は 2 列にまとめます
   * @default 3
   */
  columns?: GalleryColumns;
  /**
   * 並べた画像のあいだの間隔。Stack と同じ段です
   * @default 'sm'
   */
  gap?: StackGap;
  /**
   * 並べた画像の、幅に対する高さの比（16 / 9 のような数か、'16 / 9' の文字。Image の ratio と同じ）。
   * 並べた画像はこの比で切り取ってそろえ、拡大すると全体が見えます
   * @default 4 / 3
   */
  ratio?: number | string;
  /** 並びの下に出すキャプション。渡すと、全体を figure で包みます */
  caption?: ReactNode;
  /** 拡大しているか（制御） */
  open?: boolean;
  /**
   * はじめに拡大しているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 開閉の動きが終わったあとに、次の値を渡して呼びます */
  onOpenChangeComplete?: (open: boolean) => void;
  /** 拡大して見せている画像の番号（0 から。制御） */
  value?: number;
  /**
   * はじめに見せる画像の番号（0 から。非制御）
   * @default 0
   */
  defaultValue?: number;
  /** 見せる画像が変わるとき（押して開く・送る）に、次の番号を渡して呼びます */
  onValueChange?: (value: number) => void;
  /**
   * 最後の画像の次を最初の画像に、最初の前を最後につなげるか。つなげないときは、端の送るボタンを押せない見た目にします
   * @default false
   */
  loop?: boolean;
  /**
   * 前後の画像へ送るときの動き。shift は少し滑って入れ替わり、slide は画像が並んだ帯のように幅いっぱいに滑ります。
   * 動きを減らす設定では、どちらも動かさずにすぐ入れ替えます
   * @default 'shift'
   */
  slideMotion?: GallerySlideMotion;
  /**
   * 前後に送るボタンの置き場所。bottom は画像の下の帯に位置と一緒にまとめ、sides は左右の端に画像と重ねずに置き、
   * overlay は白い丸の面を持つボタンを画像の左右の端に重ねます（画像がいちばん大きく出ます）
   * @default 'bottom'
   */
  controlsPosition?: GalleryControlsPosition;
  /**
   * いまの位置の示し方。count は「3 / 6」、dots は枚数分の点、none は出しません。
   * bottom では前後のボタンのあいだ、sides・overlay では左上に出します
   * @default 'dots'
   */
  indicator?: GalleryIndicator;
  /**
   * 拡大したときの後ろの面。light はページの地の色で覆ってぼかし、dark は Dialog と同じ後ろの暗さです（ImageZoom と同じ）
   * @default 'light'
   */
  variant?: ImageZoomVariant;
  /**
   * 開閉の動き。expand は押した画像の位置から広がり、閉じるとそのとき見ている画像の位置へ戻ります。
   * fade は画面の中央で、濃さと少し小さい姿から出ます（ImageZoom と同じ）
   * @default 'expand'
   */
  motion?: ImageZoomMotion;
  /**
   * キャプションの出方（ImageZoom と同じ）。並べた画像のキャプションはページに出さないので、どちらでも拡大した面で現れます
   * @default motion が expand なら 'move'、fade なら 'fade'
   */
  captionMotion?: ImageZoomCaptionMotion;
  /**
   * 閉じる × の形。flat は面のない ×、raised は白い丸の面と影を持つ ×（ImageZoom と同じ）
   * @default 'flat'
   */
  closeButtonVariant?: ImageZoomCloseButtonVariant;
  /**
   * 押せることの印（右下の虫眼鏡）をいつも出すか。既定では、マウスを載せたときとキーボードで来たときだけ出します
   * @default false
   */
  showZoomIcon?: boolean;
  /**
   * 拡大しているあいだ、ほかの部分の操作とページのスクロールを止めるか。passive は裏を止めません
   * @default true
   */
  modal?: OverlayModal;
  /**
   * 拡大した面のどこか（画像や後ろの面）を押したときに閉じるか
   * @default true
   */
  dismissible?: boolean;
  /**
   * 指で上下に引いて閉じられるか（左右にはじいて送るのは、これによらずできます）
   * @default dismissible と同じ
   */
  closeOnSwipe?: boolean;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * ホイールでスクロールしたときに閉じるか
   * @default false
   */
  closeOnScroll?: boolean;
  /**
   * 右上の閉じる × を消すか。消しても、面を押す・Esc・指で引くで閉じます
   * @default false
   */
  hideCloseButton?: boolean;
  /**
   * 閉じる × の読み上げの名前
   * @default '閉じる'
   */
  closeName?: string;
  /**
   * 並べた画像のボタンの読み上げで、画像の代わりの文（alt）のあとに続ける文
   * @default '拡大する'
   */
  zoomName?: string;
  /**
   * 前の画像へ送るボタンの読み上げの名前
   * @default '前の画像'
   */
  prevName?: string;
  /**
   * 次の画像へ送るボタンの読み上げの名前
   * @default '次の画像'
   */
  nextName?: string;
  /** 閉じたあとに焦点を戻す要素。書かないときは、そのとき見ている画像のボタン */
  returnFocus?: OverlayFocusTarget;
  /**
   * 拡大した面を描く場所。まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 拡大した面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** いちばん外の要素（caption があるときは figure）に付きます */
  className?: string;
}

// width・height から画像本来の大きさを読む（数か、数だけの文字のとき）
const toSize = (value: unknown) => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : undefined;
};

// 送ったときに読み上げで知らせる文（画像の名前と位置）
const announce = (alt: string | undefined, current: number, total: number) => {
  const position = `${total} 枚中 ${current} 枚目`;
  return alt ? `${alt}、${position}` : position;
};

/** 画像がいま画面に見えているか（見えていなければ、閉じるときに元の位置へ戻らない） */
const inViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const view = el.ownerDocument.defaultView;
  if (!view || rect.width === 0 || rect.height === 0) return false;
  return (
    rect.bottom > 0 && rect.right > 0 && rect.top < view.innerHeight && rect.left < view.innerWidth
  );
};

/**
 * 画像を並べ、押すと画面いっぱいに拡大して、前後に送って見られる部品
 *
 * 並べた画像は同じ比（`ratio`）に切り取ってそろえ、拡大すると全体が見えます。
 * 拡大した面は ImageZoom と同じで、前後のボタン・←→ キー・指で左右にはじく、で送ります。
 * 閉じると、そのとき見ている画像の位置へ戻ります。
 */
export function Gallery({
  items,
  columns,
  gap,
  ratio = 'var(--gallery-ratio)',
  caption,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  loop = false,
  slideMotion = 'shift',
  controlsPosition = 'bottom',
  indicator = 'dots',
  variant,
  motion,
  captionMotion,
  closeButtonVariant,
  showZoomIcon = false,
  modal,
  dismissible,
  closeOnSwipe,
  closeOnEscape,
  closeOnScroll,
  hideCloseButton,
  closeName,
  zoomName = '拡大する',
  prevName = '前の画像',
  nextName = '次の画像',
  returnFocus,
  portalContainer,
  popupProps,
  className,
  ref,
  ...rootProps
}: GalleryProps) {
  const count = items.length;
  const [openState, setOpenState] = useState(defaultOpen);
  const open = (openProp ?? openState) && count > 0;
  const [valueState, setValueState] = useState(defaultValue);
  const index = Math.min(Math.max(valueProp ?? valueState, 0), Math.max(count - 1, 0));
  // 送った向き。外から番号を変えたときは、番号の大小から決める
  const [slide, setSlide] = useState({ index, direction: 1 as -1 | 1 });
  if (slide.index !== index) setSlide({ index, direction: index < slide.index ? -1 : 1 });
  const [announcement, setAnnouncement] = useState('');
  // 並べた画像が読み込んだ URL（srcset から選ばれたもの）。拡大したときに同じ画像を使う
  const [loadedSrcs, setLoadedSrcs] = useState<Record<number, string>>({});
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const { anchorRef, scope } = useDensityScope<HTMLDivElement>(open);
  const rootRef = useMergedRefs<HTMLDivElement>(anchorRef, ref);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const changeIndex = (next: number, direction: -1 | 1) => {
    setValueState(next);
    setSlide({ index: next, direction });
    onValueChange?.(next);
  };

  const hasPrev = count > 1 && (loop || index > 0);
  const hasNext = count > 1 && (loop || index < count - 1);
  const navigate = (direction: -1 | 1) => {
    if (direction === -1 ? !hasPrev : !hasNext) return;
    const next = (index + direction + count) % count;
    changeIndex(next, direction);
    setAnnouncement(announce(items[next]?.alt, next + 1, count));
  };

  const imageOf = useCallback(
    (i: number) =>
      triggers.current[i]?.querySelector<HTMLElement>('[data-slot="image"] > img') ?? null,
    []
  );
  // 広がる動きの始まりと、閉じたときに戻る先。見えるところにないときは、その場で消える
  const getOrigin = useCallback(() => {
    const image = imageOf(index);
    return image && inViewport(image) ? image : null;
  }, [imageOf, index]);

  const item = items[index];
  const renderProps: { src?: unknown; alt?: unknown; width?: unknown; height?: unknown } =
    item?.render?.props ?? {};
  const src =
    loadedSrcs[index] ??
    item?.src ??
    (typeof renderProps.src === 'string' ? renderProps.src : undefined);
  const width = toSize(renderProps.width ?? item?.width);
  const height = toSize(renderProps.height ?? item?.height);
  const alt = item?.alt ?? (typeof renderProps.alt === 'string' ? renderProps.alt : '');
  const s = styles({ columns, gap });
  const t = zoomTriggerStyles({ showZoomIcon });

  const list = (
    <ul data-slot="gallery-list" className={s.list()}>
      {items.map(({ zoomSrc: _zoomSrc, caption: _caption, ...image }, i) => (
        <li key={i} data-slot="gallery-item" className={s.item()}>
          <button
            ref={(el) => {
              triggers.current[i] = el;
            }}
            type="button"
            data-slot="gallery-trigger"
            aria-haspopup="dialog"
            aria-expanded={open && index === i}
            disabled={failed[i]}
            onClick={(event) => {
              if (event.currentTarget.querySelector('[data-slot="image"][data-status="error"]')) {
                return;
              }
              changeIndex(i, 1);
              setAnnouncement('');
              changeOpen(true);
            }}
            className={t.trigger({ className: s.trigger() })}
          >
            <Image
              {...image}
              ratio={ratio}
              frameProps={{ className: s.frame() }}
              onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
                const loaded = event.currentTarget.currentSrc || event.currentTarget.src;
                setLoadedSrcs((prev) => (prev[i] === loaded ? prev : { ...prev, [i]: loaded }));
                setFailed((prev) => (prev[i] ? { ...prev, [i]: false } : prev));
              }}
              onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
            />
            <span aria-hidden className={t.cue()}>
              <MagnifyingGlassPlusIcon className={t.cueIcon()} />
            </span>
            {/* 画像の代わりの文に続けて読む（「空と山の絵 拡大する」） */}
            <span className="sr-only">{zoomName}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  const viewer = (
    <ImageZoomViewer
      open={open}
      onOpenChange={changeOpen}
      onOpenChangeComplete={onOpenChangeComplete}
      getOrigin={getOrigin}
      densityScope={scope}
      src={src}
      zoomSrc={item?.zoomSrc}
      intrinsicSize={width != null && height != null ? { width, height } : undefined}
      title={alt || zoomName}
      caption={item?.caption}
      slideKey={index}
      slideDirection={slide.direction}
      navigate={count > 1 ? { hasPrev, hasNext, onNavigate: navigate } : undefined}
      controls={
        count > 1 ? (
          <GalleryControls
            index={index}
            count={count}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onNavigate={navigate}
            prevName={prevName}
            nextName={nextName}
            indicator={indicator}
            announcement={announcement}
          />
        ) : undefined
      }
      className={cn(
        slideMotionTokens[slideMotion],
        count > 1 && [controlsPositionTokens[controlsPosition], reserveTokens]
      )}
      variant={variant}
      motion={motion}
      captionMotion={captionMotion}
      closeButtonVariant={closeButtonVariant}
      modal={modal}
      dismissible={dismissible}
      closeOnSwipe={closeOnSwipe}
      closeOnEscape={closeOnEscape}
      closeOnScroll={closeOnScroll}
      hideCloseButton={hideCloseButton}
      closeName={closeName}
      // 閉じたあとは、そのとき見ている画像のボタンへ戻す（閉じる時点で読む）
      returnFocus={
        returnFocus ?? {
          get current() {
            return triggers.current[index] ?? null;
          },
        }
      }
      portalContainer={portalContainer}
      popupProps={popupProps}
    />
  );

  if (caption == null) {
    return (
      <div {...rootProps} ref={rootRef} data-slot="gallery" className={cn(s.root(), className)}>
        {list}
        {viewer}
      </div>
    );
  }
  return (
    <figure
      {...rootProps}
      ref={rootRef}
      data-slot="gallery"
      className={cn(figureClass(), s.root(), className)}
    >
      {list}
      <figcaption className={figureCaptionClass}>{caption}</figcaption>
      {viewer}
    </figure>
  );
}
