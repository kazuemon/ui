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
import { focusRing } from '../../internal/focus-styles';
import type {
  OverlayFocusTarget,
  OverlayModal,
  PopupProps,
} from '../../internal/overlay/overlay-props';
import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { figureCaptionClass, figureClass } from '../figure/Figure';
import { Image, type ImageProps } from '../image/Image';
import { MagnifyingGlassPlusIcon } from './image-zoom-icons';
import {
  type ImageZoomCaptionMotion,
  type ImageZoomCloseButtonVariant,
  type ImageZoomMotion,
  type ImageZoomVariant,
  ImageZoomViewer,
} from './ImageZoomViewer';

export type {
  ImageZoomCaptionMotion,
  ImageZoomCloseButtonVariant,
  ImageZoomMotion,
  ImageZoomVariant,
} from './ImageZoomViewer';

// 押すと、画面いっぱいに拡大して見られる画像。記事や作品のページの画像に使う
// 画像の部分は Image（読み込み中の面・失敗の表示・render・ratio を持つ）。キャプションを付けると Figure と同じ形（figure・figcaption）
// 押す口は画像を包むボタン。画像はページと同じレイヤーのまま浮かせない（原則1）。押せることは、
//   zoom-in のカーソル、hover とキーボードのフォーカスで右下に出る虫眼鏡の印（--image-zoom-cue-*）、フォーカスの線で見せる
//   showZoomIcon のときは、印をいつも出す（マウスのない指の画面でも見える）（軸 282）
//   押すと画像そのものが広がるので、沈みは付けない（原則3「それ自体の動きが手応えになるもの」）
// 読み込みに失敗した画像は、拡大しても見るものがないので押せなくする
// 拡大した面は ImageZoomViewer（Gallery も同じ面を使う）

const styles = tv({
  slots: {
    trigger: [
      'group/zoom relative block w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-left',
      ...focusRing,
      'transition-[outline-color] duration-(--focus-ring-duration) ease-(--ease-press) motion-reduce:transition-none',
      // 読み込みに失敗した画像は押せない（描いた時点で失敗していて、失敗の合図が来なかった画像も、枠の状態で見分ける）
      'disabled:cursor-default has-[[data-status=error]]:cursor-default',
    ],
    // 押せることの印。画像の右下に、白い小さな丸と虫眼鏡。飾りなので読み上げには出さない（名前は zoomName が伝える）
    cue: [
      'pointer-events-none absolute right-(--image-zoom-cue-inset) bottom-(--image-zoom-cue-inset) flex size-(--image-zoom-cue-size) items-center justify-center rounded-pill',
      'border-(length:--border-width-thin) border-surface-line bg-surface text-fg',
      'opacity-(--image-zoom-cue-opacity) transition-opacity duration-(--duration-press) ease-(--ease-press) motion-reduce:transition-none',
      'group-focus-visible/zoom:opacity-(--image-zoom-cue-hover-opacity) group-enabled/zoom:group-hover/zoom:opacity-(--image-zoom-cue-hover-opacity)',
      'group-disabled/zoom:hidden group-has-[[data-status=error]]/zoom:hidden',
    ],
    cueIcon: 'size-(--icon-size-sm)',
  },
  variants: {
    showZoomIcon: {
      true: { trigger: '[--image-zoom-cue-opacity:1]' },
      false: {},
    },
    // フォーカスの線が画像の角に沿うよう、ボタンの角を画像の角にそろえる（Image の radius と同じ値）
    radius: {
      card: { trigger: 'rounded-card' },
      nested: { trigger: 'rounded-[calc(var(--radius-card)-var(--card-nested-inset))]' },
      none: { trigger: 'rounded-none' },
    },
  },
  defaultVariants: { radius: 'card', showZoomIcon: false },
});

// width・height から画像本来の大きさを読む（数か、数だけの文字のとき）
const toSize = (value: unknown) => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : undefined;
};

export interface ImageZoomProps extends ImageProps {
  /** 拡大したときに読み込む、大きな画像の URL。書かないときは、ページに出している画像をそのまま拡大します */
  zoomSrc?: string;
  /** キャプション。画像の下の中央に小さく出し、拡大したときも画像の下に出します。alt と同じ文にはしません */
  caption?: ReactNode;
  /** キャプションを付けたときの、外側の figure 要素に渡す props。className は画像の要素に付きます */
  figureProps?: ComponentProps<'figure'>;
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
  /**
   * 拡大したときの後ろの面。light はページの地の色で覆ってぼかし、画像だけを前に出します。
   * dark は Dialog と同じ後ろの暗さで、ページが透けて見えます
   * @default 'light'
   */
  variant?: ImageZoomVariant;
  /**
   * 開閉の動き。expand は押した画像の位置から広がり、閉じると元の位置へ戻ります。
   * fade は画面の中央で、濃さと少し小さい姿から出ます。動きを減らす設定では、どちらも動かさずにすぐ出します
   * @default 'expand'
   */
  motion?: ImageZoomMotion;
  /**
   * キャプションの出方。move はページのキャプションの位置から、拡大した画像の下へ移ります（閉じると戻ります）。
   * fade は、ページのキャプションが消えてから、拡大した画像の下のキャプションが出ます（閉じるときはその逆）。
   * 書かないときは motion に従います（expand なら move、fade なら fade）。どちらの motion とも組み合わせられます。
   * 動きを減らす設定では、どちらも動かさずにすぐ入れ替えます
   * @default motion が expand なら 'move'、fade なら 'fade'
   */
  captionMotion?: ImageZoomCaptionMotion;
  /**
   * 閉じる × の形。flat は面のない ×（画像には重ねません）。raised は白い丸の面と影を持つ × で、画像に重なってもよい形です
   * （その分、縦に長い画像が大きく出ます）
   * @default 'flat'
   */
  closeButtonVariant?: ImageZoomCloseButtonVariant;
  /**
   * 押せることの印（右下の虫眼鏡）をいつも出すか。既定では、マウスを載せたときとキーボードで来たときだけ出します
   * @default false
   */
  showZoomIcon?: boolean;
  /**
   * 拡大しているあいだ、ほかの部分の操作とページのスクロールを止めるか。
   * passive は裏を止めません（拡大した面は画面いっぱいなので、見た目は変わりません）
   * @default true
   */
  modal?: OverlayModal;
  /**
   * 拡大した面のどこか（画像や後ろの面）を押したときに閉じるか。
   * false にすると、右上の × と Esc でだけ閉じます（指で引いて閉じるかは closeOnSwipe）
   * @default true
   */
  dismissible?: boolean;
  /**
   * 指で上下に引いて閉じられるか
   * @default dismissible と同じ
   */
  closeOnSwipe?: boolean;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * ホイールでスクロールしたときに閉じるか（ページを読み進めようとしたら閉じる）
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
   * 画像を包むボタンの読み上げで、画像の代わりの文（alt）のあとに続ける文
   * @default '拡大する'
   */
  zoomName?: string;
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは押した画像 */
  returnFocus?: OverlayFocusTarget;
  /**
   * 拡大した面を描く場所。まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 拡大した面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 画像の要素に付きます。figure に付けるクラスは figureProps の className に渡します */
  className?: string;
}

/**
 * 押すと、画面いっぱいに拡大して見られる画像
 *
 * 画像の props（`src`・`alt`・`render`・`ratio`・`radius`・`hideOutline` など）は Image と同じです。
 * `caption` を渡すと、Figure と同じく画像の下にキャプションを出し、拡大したときも画像の下に出します。
 * 拡大した面は、右上の ×・Esc・面のどこかを押す・指で上下に引く、で閉じます。スクロールで閉じるのは closeOnScroll のときだけです。
 */
export function ImageZoom({
  zoomSrc,
  caption,
  figureProps,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
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
  returnFocus,
  portalContainer,
  popupProps,
  radius,
  alt,
  render,
  onLoad,
  onError,
  ...imageProps
}: ImageZoomProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const triggerRef = useRef<HTMLButtonElement>(null);
  // 拡大した面は body の直下に出るので、押した画像の祖先の密度を写す
  const { anchorRef, scope } = useDensityScope(open);
  const buttonRef = useMergedRefs(triggerRef, anchorRef);
  const captionRef = useRef<HTMLElement>(null);
  const getOriginCaption = useCallback(() => captionRef.current, []);
  const getOrigin = useCallback(
    () => triggerRef.current?.querySelector<HTMLElement>('[data-slot="image"] > img') ?? null,
    []
  );

  // 読み込みに失敗した画像は押せなくする
  const [failed, setFailed] = useState(false);
  const renderProps: { alt?: unknown; width?: unknown; height?: unknown } = render?.props ?? {};

  const width = toSize(renderProps.width ?? imageProps.width);
  const height = toSize(renderProps.height ?? imageProps.height);
  const title = alt ?? (typeof renderProps.alt === 'string' ? renderProps.alt : '');
  const s = styles({ radius, showZoomIcon });

  const trigger = (
    <button
      ref={buttonRef}
      type="button"
      data-slot="image-zoom-trigger"
      aria-haspopup="dialog"
      aria-expanded={open}
      disabled={failed}
      onClick={() => {
        // 描いた時点で失敗していた画像（失敗の合図が来ない）も、枠の状態で見分けて開かない
        if (triggerRef.current?.querySelector('[data-slot="image"][data-status="error"]')) return;
        changeOpen(true);
      }}
      className={s.trigger()}
    >
      <Image
        {...imageProps}
        alt={alt}
        render={render}
        radius={radius}
        onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
          setFailed(false);
          onLoad?.(event);
        }}
        onError={(event: SyntheticEvent<HTMLImageElement>) => {
          setFailed(true);
          onError?.(event);
        }}
      />
      <span aria-hidden className={s.cue()}>
        <MagnifyingGlassPlusIcon className={s.cueIcon()} />
      </span>
      {/* 画像の代わりの文に続けて読む（「空と山の絵 拡大する」） */}
      <span className="sr-only">{zoomName}</span>
    </button>
  );

  const viewer = (
    <ImageZoomViewer
      open={open}
      onOpenChange={changeOpen}
      onOpenChangeComplete={onOpenChangeComplete}
      getOrigin={getOrigin}
      getOriginCaption={getOriginCaption}
      densityScope={scope}
      zoomSrc={zoomSrc}
      intrinsicSize={width != null && height != null ? { width, height } : undefined}
      title={title || zoomName}
      caption={caption}
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
      returnFocus={returnFocus ?? triggerRef}
      portalContainer={portalContainer}
      popupProps={popupProps}
    />
  );

  if (caption == null) {
    return (
      <>
        {trigger}
        {viewer}
      </>
    );
  }
  return (
    <>
      <figure {...figureProps} className={figureClass(figureProps?.className)}>
        {trigger}
        <figcaption ref={captionRef} className={figureCaptionClass}>
          {caption}
        </figcaption>
      </figure>
      {viewer}
    </>
  );
}
