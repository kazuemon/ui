'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type WheelEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type { DensityScope } from '../density-scope';
import { focusRing } from '../focus-styles';
import { XIcon } from '../icons';
import { ESCAPE_REASONS } from '../overlay/close-reasons';
import {
  focusTargetRef,
  type OverlayFocusTarget,
  type OverlayModal,
  type PopupProps,
} from '../overlay/overlay-props';
import { cn } from '../tv';
import { usePortalContainer } from '../ui-config';
import { useMergedRefs } from '../use-merged-refs';
import { playSlide, readSlideMotion, slides, translateX } from './slide-motion';
import { type SwipeNavigate, useSwipeClose } from './use-swipe-close';
import { fitSize, type Size } from './zoom-geometry';
import { type CaptionMotion, hidesOrigin, playZoom, prefersReducedMotion } from './zoom-motion';

// 画像を画面いっぱいに拡大して見せる面。ImageZoom が 1 枚を、Gallery が複数枚を送って見せるのに使う
//   開閉は外から決める（open・onOpenChange）。開く口（押した画像）は getOrigin で受け、広がる動きの始まりと終わりにする
//   Gallery は、送った先の画像を getOrigin で返し、src・caption・slideKey を差し替え、送る操作を controls に置く
//     slideKey が変わると、前の画像は送る向きの反対へ出ていき、次の画像が入ってくる（slide-motion.ts）
//     navigate を渡すと、←→ キーと、指で左右にはじく操作で送る（use-swipe-close.ts）
//     controls の置き場所のために、面の余白を --image-zoom-reserve-x・--image-zoom-reserve-bottom で広げられる（既定は 0）
// 振る舞いは Base UI の Dialog（フォーカスの閉じ込め・Esc・読み上げの名前・閉じたあとに戻す先）
//   面は重なる面だが、中身は画像だけなので、面の白い地は持たない。後ろの面（--image-zoom-backdrop）の上に画像を直に置く
//   読み上げの名前は画像の代わりの文（title）。画面には出さない（原則15）。キャプションは説明として読む
// 閉じ方: 右上の ×・Esc・どこかを押す（画像も後ろの面も）・指で上下に引く。ホイールでスクロールして閉じるのは closeOnScroll のときだけ
//   押して閉じるのは dismissible、引くのは closeOnSwipe（既定は dismissible と同じ）で止められる
// 選べる形（ImageZoom の props）は、面にトークンの上書きを当てて作る（variantTokens など）
//   variant: light は地の色で覆ってぼかす（既定）、dark は Dialog と同じ後ろの暗さ（軸 279）
//   motion: expand は元の位置から広がる（既定）、fade はその場で濃さと少し小さい姿から（軸 280）
// ページのキャプション（getOriginCaption）は、開いているあいだ消し、拡大した面のキャプションと時間をずらして入れ替える（zoom-motion.ts）
//   captionMotion: move はキャプションがページの位置から移る、fade は時間をずらして入れ替える。書かないときは motion に従う
//   closeButtonVariant: flat は面のない ×（既定。画像に重ねない）、raised は白い丸の面と影の ×（画像に重ねてよい）（軸 281）
// 閉じる動きのあいだは Base UI の面を開いたままにし、動きが終わってから閉じる（フォーカスは画像が戻った時点で開いた画像へ戻る）

/** 拡大したときの後ろの面。light は地の色で覆ってぼかす、dark は Dialog と同じ後ろの暗さ */
export type ImageZoomVariant = 'light' | 'dark';
/** 開閉の動き。expand は元の位置の画像から広がる、fade はその場で濃さと少し小さい姿から出る */
export type ImageZoomMotion = 'expand' | 'fade';
/** キャプションの出方。move はページのキャプションの位置から移る、fade は時間をずらして入れ替える */
export type ImageZoomCaptionMotion = CaptionMotion;
/** 閉じる × の形。flat は面のない ×、raised は白い丸の面と影を持つ × */
export type ImageZoomCloseButtonVariant = 'flat' | 'raised';

// 選べる形は、既定のトークン（tokens.css の --image-zoom-*）への上書きで作る。後ろの面と面（Popup）の両方に当てる
const variantTokens: Record<ImageZoomVariant, string> = {
  light: '',
  dark: '[--image-zoom-backdrop:var(--image-zoom-dark-backdrop)] [--image-zoom-backdrop-blur:var(--image-zoom-dark-backdrop-blur)] [--image-zoom-outline:transparent] [--image-zoom-caption-color:var(--image-zoom-dark-caption-color)] [--image-zoom-close-fg:var(--image-zoom-dark-close-fg)]',
};
const motionTokens: Record<ImageZoomMotion, string> = {
  expand: '',
  fade: '[--image-zoom-motion:fade] [--image-zoom-duration-in:var(--popup-duration-in)] [--image-zoom-duration-out:var(--popup-duration-out)]',
};
const closeButtonTokens: Record<ImageZoomCloseButtonVariant, string> = {
  flat: '',
  raised:
    '[--image-zoom-close-bg:var(--color-surface)] [--image-zoom-close-fg:var(--color-fg)] [--image-zoom-close-shadow:var(--shadow-overlay)] [--image-zoom-close-space:0]',
};

export interface ImageZoomViewerProps {
  /** 開いているか */
  open: boolean;
  /** 閉じる操作を受けたときに false を渡して呼びます */
  onOpenChange: (open: boolean) => void;
  /** 開閉の動きが終わったあとに、次の値を渡して呼びます */
  onOpenChangeComplete?: (open: boolean) => void;
  /** 元の位置の画像（img）。広がる動きの始まりと、閉じたときに戻る先 */
  getOrigin: () => HTMLElement | null;
  /** ページ（元の位置）のキャプション。開いているあいだ消し、拡大した面のキャプションと入れ替える */
  getOriginCaption?: () => HTMLElement | null;
  /** 開いた画像の祖先の密度（useDensityScope）。面は body の直下に出るので、面に写す */
  densityScope?: DensityScope;
  /** 拡大して見せる画像。書かないときは元の位置の画像（読み込み済みの currentSrc）を使う */
  src?: string;
  /** 拡大したときに読み込む、大きな画像。読み込めるまでは src を引き伸ばして見せ、読み込めたら重ねる */
  zoomSrc?: string;
  /** 画像本来の大きさ（width・height）。分かれば、読み込む前から拡大の上限に使う */
  intrinsicSize?: Size;
  /** 読み上げの名前（画像の代わりの文） */
  title: string;
  /** 画像の下に出すキャプション。読み上げでは説明になる */
  caption?: ReactNode;
  /** 画像の上に重ねる操作（Gallery の送るボタンなど）。押しても面は閉じない */
  controls?: ReactNode;
  /** いま見せている画像の目印（Gallery の番号）。変わると、前の画像から送る動きをする */
  slideKey?: string | number;
  /** 送った向き。-1 は前、1 は次 */
  slideDirection?: -1 | 1;
  /** ←→ キーと、指で左右にはじく操作で送る（Gallery） */
  navigate?: SwipeNavigate;
  variant?: ImageZoomVariant;
  motion?: ImageZoomMotion;
  closeButtonVariant?: ImageZoomCloseButtonVariant;
  captionMotion?: ImageZoomCaptionMotion;
  modal?: OverlayModal;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  closeOnScroll?: boolean;
  closeOnSwipe?: boolean;
  hideCloseButton?: boolean;
  closeName?: string;
  returnFocus?: OverlayFocusTarget;
  portalContainer?: HTMLElement | null;
  popupProps?: PopupProps;
  /** 面（Popup）に足すクラス */
  className?: string;
}

export function ImageZoomViewer({
  open,
  onOpenChange,
  onOpenChangeComplete,
  getOrigin,
  densityScope: scope = { large: false },
  variant = 'light',
  motion = 'expand',
  closeButtonVariant = 'flat',
  modal = true,
  closeOnEscape = true,
  returnFocus,
  portalContainer: container,
  popupProps,
  className,
  navigate,
  ...stage
}: ImageZoomViewerProps) {
  const portalContainer = usePortalContainer(container);
  // 閉じる動きのあいだも面を残す。open が false になってから、動きが終わるまで mounted のまま
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  // はじめから開いていた（defaultOpen）ときは、開く動きを付けない
  const [skipOpenMotion, setSkipOpenMotion] = useState(open);
  const backdropRef = useRef<HTMLDivElement>(null);
  const { className: popupClassName, ref: popupPropsRef, ...restPopupProps } = popupProps ?? {};
  const popupRef = useMergedRefs<HTMLDivElement>(popupPropsRef);

  return (
    <BaseDialog.Root
      open={mounted}
      onOpenChange={(next, details) => {
        if (next) return;
        // Esc で閉じない設定のときは、閉じる合図を取り消す（Base UI が Esc を処理済みにしないようにする）
        if (!closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        onOpenChange(false);
      }}
      modal={modal === 'passive' ? false : modal}
      // 面が画面いっぱいなので、外を押すことはない。押して閉じるのは面の中で受ける（ZoomStage）
      disablePointerDismissal
    >
      <BaseDialog.Portal container={portalContainer}>
        <BaseDialog.Backdrop
          ref={backdropRef}
          data-slot="image-zoom-backdrop"
          className={cn(
            'fixed inset-0 z-10 bg-(--image-zoom-backdrop) backdrop-blur-(--image-zoom-backdrop-blur)',
            variantTokens[variant]
          )}
        />
        <BaseDialog.Popup
          // 開いた直後のフォーカスは Base UI の既定（キーボードでは右上の ×、指では面そのもの — 原則15）
          finalFocus={focusTargetRef(returnFocus)}
          data-slot="image-zoom"
          data-density={scope.density}
          {...restPopupProps}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            restPopupProps.onKeyDown?.(event);
            if (!navigate || !open || event.defaultPrevented) return;
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
            if (direction === 0) return;
            if (direction === -1 ? !navigate.hasPrev : !navigate.hasNext) return;
            event.preventDefault();
            navigate.onNavigate(direction);
          }}
          ref={popupRef}
          className={cn(
            'fixed inset-0 z-10 text-fg outline-none',
            variantTokens[variant],
            motionTokens[motion],
            closeButtonTokens[closeButtonVariant],
            scope.large && 'coarse-large',
            !open && 'pointer-events-none',
            className,
            popupClassName
          )}
        >
          <ZoomStage
            {...stage}
            navigate={navigate}
            getOrigin={getOrigin}
            backdropRef={backdropRef}
            closing={!open}
            animateOpen={!skipOpenMotion}
            onClose={() => onOpenChange(false)}
            onOpened={() => onOpenChangeComplete?.(true)}
            onClosed={() => {
              setMounted(false);
              setSkipOpenMotion(false);
              onOpenChangeComplete?.(false);
            }}
          />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

interface ZoomStageProps extends Pick<
  ImageZoomViewerProps,
  | 'getOrigin'
  | 'getOriginCaption'
  | 'src'
  | 'zoomSrc'
  | 'intrinsicSize'
  | 'title'
  | 'caption'
  | 'controls'
  | 'slideKey'
  | 'slideDirection'
  | 'navigate'
  | 'dismissible'
  | 'closeOnSwipe'
  | 'closeOnScroll'
  | 'captionMotion'
  | 'hideCloseButton'
  | 'closeName'
> {
  backdropRef: RefObject<HTMLDivElement | null>;
  closing: boolean;
  animateOpen: boolean;
  onClose: () => void;
  onOpened: () => void;
  onClosed: () => void;
}

// 閉じる × の見た目。後ろの面の上に置くアイコンだけのボタン（線は Bold — ADR-0018）
// hover と押下は平らなボタンと同じく、文字の色を淡く敷く（ADR-0027・ADR-0112）。押すと面ごと消えるので沈みは付けない（原則3）
// 色・面・影・薄さは --image-zoom-close-*。薄さが 0 のときも、キーボードで来たときは見せる
const closeButtonClass = [
  'absolute top-(--image-zoom-close-inset) right-(--image-zoom-close-inset) flex size-(--spacing-control) cursor-pointer items-center justify-center rounded-pill',
  'text-(color:--image-zoom-close-fg) shadow-(--image-zoom-close-shadow) opacity-(--image-zoom-close-opacity) focus-visible:opacity-100',
  '[--color-focus-ring:var(--image-zoom-focus-ring)]',
  ...focusRing,
  '[--flat-bg:var(--image-zoom-close-bg)] bg-(color:--flat-bg)',
  '[transition:--flat-bg_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),opacity_var(--duration-press)_var(--ease-press)]',
  'hover:[--flat-bg:color-mix(in_oklab,var(--image-zoom-close-fg)_var(--flat-hover-mix),var(--image-zoom-close-bg))] active:[--flat-bg:color-mix(in_oklab,var(--image-zoom-close-fg)_var(--flat-press-mix),var(--image-zoom-close-bg))] motion-reduce:[transition:none]',
].join(' ');

// 拡大した画像・キャプション・閉じる ×。面（Popup）が描かれてから置かれるので、開く動きはここで始める
function ZoomStage({
  getOrigin,
  getOriginCaption,
  captionMotion,
  src,
  zoomSrc,
  intrinsicSize,
  title,
  caption,
  controls,
  slideKey,
  slideDirection = 1,
  navigate,
  dismissible = true,
  closeOnSwipe = dismissible,
  closeOnScroll = false,
  hideCloseButton = false,
  closeName = '閉じる',
  backdropRef,
  closing,
  animateOpen,
  onClose,
  onOpened,
  onClosed,
}: ZoomStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  // 送るとき（slideKey が変わって画像の枠が作り直される）、前の画像の枠と、そのときの位置を取っておく
  const leaving = useRef<{ el: HTMLDivElement; left: number; top: number } | null>(null);
  const setBox = useCallback((el: HTMLDivElement | null) => {
    boxRef.current = el;
    if (!el) return undefined;
    return () => {
      leaving.current = { el, left: el.offsetLeft, top: el.offsetTop };
      if (boxRef.current === el) boxRef.current = null;
    };
  }, []);
  // 送る動きと、出ていく画像の枠（面に置き直したもの）
  const slideAnimations = useRef<Animation[]>([]);
  const ghost = useRef<HTMLElement | null>(null);
  const endSlide = () => {
    for (const a of slideAnimations.current) a.cancel();
    slideAnimations.current = [];
    ghost.current?.remove();
    ghost.current = null;
  };
  const captionRef = useRef<HTMLParagraphElement>(null);
  const zoomRef = useRef<HTMLImageElement>(null);
  // 元の位置の画像の、読み込み済みの URL（srcset から選ばれたもの）。開いた時点のものを使う
  const [originSrc] = useState(() => {
    const origin = getOrigin();
    return origin instanceof HTMLImageElement ? origin.currentSrc || origin.src : undefined;
  });
  const baseSrc = src ?? originSrc;
  const [loadedZoomSrc, setLoadedZoomSrc] = useState<string>();
  const zoomLoaded = zoomSrc != null && loadedZoomSrc === zoomSrc;
  const animations = useRef<Animation[]>([]);
  const openedAt = useRef(0);
  const hiddenOrigin = useRef<HTMLElement | null>(null);
  const hiddenCaption = useRef<HTMLElement | null>(null);
  // 動かす相手。拡大した面のキャプションは、ほかのものと時間をずらすので別に渡す
  const targets = (box: HTMLElement) => ({
    box,
    fades: fades().filter((el) => el !== captionRef.current),
    origin: hiddenOrigin.current ?? getOrigin(),
    caption: captionRef.current,
    originCaption: hiddenCaption.current,
    captionMotion,
  });
  // 隠した元の画像とページのキャプションを戻す
  const restoreOrigin = () => {
    if (hiddenOrigin.current) hiddenOrigin.current.style.opacity = '';
    hiddenOrigin.current = null;
  };
  const restore = () => {
    restoreOrigin();
    if (hiddenCaption.current) hiddenCaption.current.style.opacity = '';
    hiddenCaption.current = null;
  };

  const fades = () => {
    const stage = stageRef.current;
    const chrome = stage ? [...stage.querySelectorAll<HTMLElement>('[data-zoom-chrome]')] : [];
    return [backdropRef.current, ...chrome].filter((el): el is HTMLElement => el != null);
  };

  // 画像の大きさを決める。画像の比のまま、余白とキャプションを除いた広さに収める
  //   大きな画像（zoomSrc）を読み込む前は、上限なしで広げる。それ以外は画像本来の大きさを超えて引き伸ばさない
  const fit = () => {
    const stage = stageRef.current;
    const box = boxRef.current;
    if (!stage || !box) return;
    const origin = getOrigin();
    const base = box.querySelector<HTMLImageElement>('img');
    const naturalOf = (img: HTMLImageElement | null | undefined) =>
      img && img.naturalWidth > 0
        ? { width: img.naturalWidth, height: img.naturalHeight }
        : undefined;
    const zoomNatural = zoomLoaded ? naturalOf(zoomRef.current) : undefined;
    const originNatural = naturalOf(origin instanceof HTMLImageElement ? origin : base);
    const image = zoomNatural ?? originNatural ?? intrinsicSize;
    if (!image) return;
    const known = [zoomNatural, originNatural, intrinsicSize].filter((s): s is Size => s != null);
    const limit =
      zoomSrc != null && !zoomLoaded
        ? undefined
        : known.reduce((a, b) => (b.width > a.width ? b : a));
    const style = getComputedStyle(stage);
    const gap = caption != null ? parseFloat(style.rowGap) || 0 : 0;
    const avail = {
      width: stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      height:
        stage.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom) -
        (captionRef.current?.offsetHeight ?? 0) -
        gap,
    };
    const shown = origin?.getBoundingClientRect();
    const size = fitSize(image, avail, limit, shown);
    box.style.width = `${size.width}px`;
    box.style.height = `${size.height}px`;
  };

  // 開いた直後: 大きさを決めてから、元の位置から広げる（はじめから開いていたとき・動きを減らす設定では動かさない）
  useLayoutEffect(() => {
    fit();
    openedAt.current = performance.now();
    const box = boxRef.current;
    const origin = getOrigin();
    // 元の画像は濃さで隠す（visibility で隠すと、開くボタンの読み上げの名前から画像の代わりの文が抜ける）
    if (box && hidesOrigin(box, origin) && origin) {
      origin.style.opacity = '0';
      hiddenOrigin.current = origin;
    }
    // ページのキャプションは、開いているあいだ消す（後ろの面から透けて、二重に見えないように）
    const originCaption = getOriginCaption?.() ?? null;
    if (originCaption) {
      originCaption.style.opacity = '0';
      hiddenCaption.current = originCaption;
    }
    if (!box || !animateOpen || prefersReducedMotion() || box.offsetWidth === 0) {
      onOpened();
    } else {
      const running = playZoom('in', { ...targets(box), origin });
      animations.current = running;
      void Promise.all(running.map((a) => a.finished)).then(onOpened, () => {});
    }
    return () => {
      // 面が消えるときは、隠した元の画像とキャプションを必ず戻す
      for (const a of animations.current) a.cancel();
      endSlide();
      restore();
    };
    // 開いたときに 1 回だけ動かす
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 閉じる: 元の位置へ戻してから、面を消す
  useLayoutEffect(() => {
    if (!closing) return undefined;
    endSlide();
    const box = boxRef.current;
    const pageCaption = hiddenCaption.current;
    for (const a of animations.current) a.cancel();
    const running =
      box && !prefersReducedMotion()
        ? playZoom('out', { ...targets(box), origin: hiddenOrigin.current })
        : [];
    animations.current = running;
    let cancelled = false;
    void Promise.all(running.map((a) => a.finished)).then(
      () => {
        if (cancelled) return;
        restore();
        // ページのキャプションに掛けた動き（forwards で持っている）を外し、元の見た目に戻す
        for (const a of running) {
          if (a.effect instanceof KeyframeEffect && a.effect.target === pageCaption) {
            a.cancel();
          }
        }
        onClosed();
      },
      () => {}
    );
    return () => {
      // 閉じる途中でまた開いたときは、動きを止めて開いた姿に戻す
      cancelled = true;
      for (const a of running) a.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  // 送った（slideKey が変わった）: 元の位置の隠し方を送った先に移し、前の画像を出して次の画像を入れる
  const mountedSlideKey = useRef(slideKey);
  useLayoutEffect(() => {
    if (mountedSlideKey.current === slideKey) return;
    mountedSlideKey.current = slideKey;
    const previous = leaving.current;
    leaving.current = null;
    endSlide();
    fit();
    const box = boxRef.current;
    const stage = stageRef.current;
    // 閉じたときに戻る先は、いま見ている画像の元の位置
    restoreOrigin();
    const origin = getOrigin();
    if (box && origin && hidesOrigin(box, origin)) {
      origin.style.opacity = '0';
      hiddenOrigin.current = origin;
    }
    if (!previous || !box || !stage || closing) return;
    const motion = readSlideMotion(box);
    if (!slides(motion)) return;
    // 前の画像の枠を、そのときの位置のまま面に置き直す（読み上げと押す操作からは外す）
    const el = previous.el;
    el.setAttribute('aria-hidden', 'true');
    el.removeAttribute('data-slot');
    Object.assign(el.style, {
      position: 'absolute',
      left: `${previous.left}px`,
      top: `${previous.top}px`,
      margin: '0',
      pointerEvents: 'none',
    });
    stage.insertBefore(el, box);
    ghost.current = el;
    // 指で引いた位置や、入ってくる途中の位置から続ける
    const from = translateX(el);
    const opacity = Number(getComputedStyle(el).opacity);
    for (const a of el.getAnimations()) a.cancel();
    el.style.translate = '';
    el.style.opacity = String(opacity);
    box.style.translate = '';
    const running = playSlide({
      leaving: el,
      box,
      extras: captionRef.current ? [captionRef.current] : [],
      direction: slideDirection,
      from,
      stageWidth: stage.clientWidth,
      motion,
    });
    slideAnimations.current = running;
    void running[0]?.finished.then(
      () => {
        if (ghost.current !== el) return;
        el.remove();
        ghost.current = null;
      },
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 送ったときだけ動かす
  }, [slideKey]);

  // 画像やキャプションが変わったとき・大きな画像を読み込めたとき・面の大きさが変わったときに、大きさを決め直す
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 大きさに関わる値だけで決め直す
  useLayoutEffect(fit, [baseSrc, zoomLoaded, caption]);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new ResizeObserver(() => {
      // 動いているあいだに大きさを変えると、動きの始まりの計算とずれるので待つ
      if (animations.current.some((a) => a.playState === 'running')) return;
      fit();
    });
    observer.observe(stage);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swipe = useSwipeClose({
    enabled: closeOnSwipe && !closing,
    boxRef,
    fades,
    onClose,
    navigate: closing ? undefined : navigate,
  });

  const onClick = (event: MouseEvent) => {
    if (swipe.consumeDrag()) return;
    if (!dismissible || closing) return;
    // 画像の上に重ねた操作（閉じる ×・送るボタン）は、その操作だけをする
    if (event.target instanceof Element && event.target.closest('button, a, [data-zoom-control]')) {
      return;
    }
    onClose();
  };

  // closeOnScroll のとき、ホイールでスクロールしたら閉じる（ページを読み進めようとした合図）。ピンチの拡大（ctrlKey）は除く
  // 開く前のスクロールの惰性で閉じないよう、開いてすぐは受けない
  const wheel = useRef(0);
  const onWheel = (event: WheelEvent) => {
    if (!closeOnScroll || closing || event.ctrlKey) return;
    if (performance.now() - openedAt.current < 400) return;
    wheel.current += Math.abs(event.deltaY);
    if (wheel.current > 40) onClose();
  };

  return (
    <div
      ref={stageRef}
      data-slot="image-zoom-stage"
      onClick={onClick}
      onWheel={onWheel}
      {...swipe.handlers}
      style={{ touchAction: swipe.touchAction }}
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-(--image-zoom-caption-gap) select-none',
        dismissible && 'cursor-zoom-out',
        // 送る操作（Gallery）の置き場所のために、左右と下を広げられる（--image-zoom-reserve-*。既定は 0）
        'px-[max(var(--image-zoom-padding-x),var(--image-zoom-reserve-x,0px))]',
        // 閉じる × を画像に重ねない形では、上下に × の分の場所を取る（上下で同じにして、画像を中央に置く）
        'pt-[max(var(--image-zoom-padding-y),calc((var(--spacing-control)+var(--image-zoom-close-inset)*2)*var(--image-zoom-close-space)))]',
        'pb-[max(var(--image-zoom-padding-y),calc((var(--spacing-control)+var(--image-zoom-close-inset)*2)*var(--image-zoom-close-space)),var(--image-zoom-reserve-bottom,0px))]'
      )}
    >
      <BaseDialog.Title className="sr-only">{title}</BaseDialog.Title>
      <div
        key={slideKey}
        ref={setBox}
        data-slot="image-zoom-image"
        className="relative shrink-0 overflow-hidden rounded-(--image-zoom-radius) [will-change:transform]"
      >
        {/* 読み上げの名前が画像の代わりの文なので、画像そのものは読ませない（二度読ませない — 原則15） */}
        <img
          src={baseSrc}
          alt=""
          draggable={false}
          onLoad={fit}
          className="absolute inset-0 size-full object-cover"
        />
        {zoomSrc != null && (
          <img
            ref={zoomRef}
            src={zoomSrc}
            alt=""
            draggable={false}
            onLoad={() => setLoadedZoomSrc(zoomSrc)}
            className={cn(
              'absolute inset-0 size-full object-cover transition-opacity duration-(--duration-normal) motion-reduce:transition-none',
              !zoomLoaded && 'opacity-0'
            )}
          />
        )}
        {/* 白っぽい画像が後ろの面に溶けないよう、細い輪郭を内側に引く（Image と同じ考え） */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] [box-shadow:inset_0_0_0_var(--border-width-thin)_var(--image-zoom-outline)]"
        />
      </div>
      {caption != null && (
        <BaseDialog.Description
          ref={captionRef}
          data-zoom-chrome=""
          data-slot="image-zoom-caption"
          className="max-w-[min(100%,40rem)] shrink-0 text-center text-body-sm text-(color:--image-zoom-caption-color)"
        >
          {caption}
        </BaseDialog.Description>
      )}
      {!hideCloseButton && (
        <BaseDialog.Close
          data-zoom-chrome=""
          data-slot="image-zoom-close"
          render={
            <button type="button" aria-label={closeName} className={closeButtonClass}>
              <XIcon standalone />
            </button>
          }
        />
      )}
      {/* 送る操作などは、置く側が位置を決める。薄くしたいものには data-zoom-chrome を付ける
          閉じる × のあとに置く（開いた直後のフォーカスは、ImageZoom と同じく右上の ×） */}
      {controls != null && (
        <div data-zoom-control="" className="contents">
          {controls}
        </div>
      )}
    </div>
  );
}
