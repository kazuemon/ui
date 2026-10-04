'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  createContext,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { useDensityScope } from '../../internal/density-scope';
import type { PopupProps, PositionerProps } from '../../internal/overlay/overlay-props';
import {
  popupCollisionPadding,
  popupMotionClass,
  readTokenLength,
} from '../../internal/overlay/popup-styles';
import { cn, tv } from '../../internal/tv';
import { TOOLTIP_TRIGGER, type TooltipTriggerMarkProps } from '../../internal/tooltip-trigger';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { usePortalContainer } from '../../internal/ui-config';

// サーバーで描くときは useLayoutEffect が警告を出すので、ブラウザでだけ使う（Image・Video と同じ）
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';

// 面はほかの浮かぶ面と同じ白に細い輪郭（原則1）。角は浮かぶ面なので部品の角（原則5）— ADR-0106
// 小さいので影は小さく淡い（--shadow-tooltip）。文字は部品のキャプションと同じ大きさ
// className は tv でまとめる（面の色だけを差し替えられるようにする。生の文字列で並べると、後ろに置いても打ち消せない）
const tooltipPopup = tv({
  base: [
    'relative rounded-control border-(length:--border-width-thin) border-surface-line bg-surface text-fg outline-none',
    popupMotionClass,
    'max-w-(--tooltip-max-width) px-(--tooltip-padding-x) py-(--spacing) text-(length:--text-caption) leading-(--leading-caption) [box-shadow:var(--shadow-tooltip)]',
  ],
  variants: {
    shadow: {
      true: '',
      false: '[--shadow-tooltip:none]',
    },
  },
  defaultVariants: { shadow: true },
});

// 本体を指す矢印（showArrow — 軸 462）。Popover の矢印と同じ作り: 面と同じ白に、外側の 2 辺だけ輪郭を引いた四角を 45 度回す
//   大きさは --tooltip-arrow-size。面の端から半分だけはみ出す。本体とのあいだ（--tooltip-offset）は矢印の分も含めた距離
const tooltipArrow = [
  'size-(--tooltip-arrow-size) rotate-45 border-surface-line bg-surface',
  'data-[side=bottom]:top-[calc(var(--tooltip-arrow-size)/-2)] data-[side=bottom]:border-t-(length:--border-width-thin) data-[side=bottom]:border-l-(length:--border-width-thin)',
  'data-[side=top]:bottom-[calc(var(--tooltip-arrow-size)/-2)] data-[side=top]:border-r-(length:--border-width-thin) data-[side=top]:border-b-(length:--border-width-thin)',
  'data-[side=left]:right-[calc(var(--tooltip-arrow-size)/-2)] data-[side=left]:border-t-(length:--border-width-thin) data-[side=left]:border-r-(length:--border-width-thin)',
  'data-[side=right]:left-[calc(var(--tooltip-arrow-size)/-2)] data-[side=right]:border-b-(length:--border-width-thin) data-[side=right]:border-l-(length:--border-width-thin)',
].join(' ');

export interface TooltipProps {
  /** 出す文。短い補足だけを書く。欠かせない情報は Tooltip に置かず、Popover で見せる */
  content: ReactNode;
  /**
   * 本体。Button などの要素を1つ渡す（ref と props を受け取れる要素）。
   * 押せないボタン（disabled）を本体にすると、ボタンは押せないままフォーカスできる形になり、content はボタンの説明として読み上げられます。
   * 効くのは本体そのものにしたボタンだけで、入れ物（ツールバーなど）を本体にしたときは、中のボタンには効きません
   */
  children: ReactElement;
  /**
   * 本体のどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 'bottom'
   */
  side?: TooltipSide;
  /**
   * 本体に対して、どこにそろえるか
   * @default 'center'
   */
  align?: TooltipAlign;
  /**
   * マウスを載せてから出るまで（ms）。キーボードでフォーカスしたときは待たずに出ます。
   * 書かないときは、包む TooltipProvider の delay です
   * @default 400
   */
  delay?: number;
  /**
   * 指で長押ししてから出るまで（ms）。長押しで出したときは、本体を押しても実行せず、ほかの場所に触れると閉じます
   * @default 500
   */
  longPressDelay?: number;
  /**
   * 長押しで出したときの向き。指と手で隠れないよう、既定では上に出します。false を渡すと side のままにします
   * @default 'top'
   */
  longPressSide?: TooltipSide | false;
  /** 出ているか（制御） */
  open?: boolean;
  /**
   * はじめから出ているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 出る・消えるが変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 出入りの動きが終わったあとに、次の値を渡して呼びます */
  onOpenChangeComplete?: (open: boolean) => void;
  /**
   * 出さないか
   * @default false
   */
  disabled?: boolean;
  /**
   * 影を消すか。細い輪郭だけで下の内容と切り分けるときに書きます
   * @default false
   */
  hideShadow?: boolean;
  /**
   * 本体を指す小さな矢印を出すか。並んだボタンのどれの補足かを、はっきりさせたいときに出します
   * @default false
   */
  showArrow?: boolean;
  /**
   * 描く場所。本体の祖先に付いた data-density と coarse-large は、描く場所がその外でも写します。
   * まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props（anchor・collisionAvoidance・sideOffset など） */
  positionerProps?: PositionerProps;
  /** 面（Popup）に足すクラス */
  className?: string;
}

// 描いているのがブラウザか（サーバーと、ハイドレーションのあいだは false）
const subscribeNothing = () => () => {};

/** マウスを載せてから出るまでの既定（ms） */
const DEFAULT_DELAY = 400;

// TooltipProvider が決めた、マウスを載せてから出るまで（ms）。包まれていないときは null
const TooltipDelayContext = createContext<number | null>(null);

export interface TooltipProviderProps {
  /** 待ち時間をそろえる範囲。ツールバーやアプリ全体を入れます */
  children?: ReactNode;
  /**
   * 中の Tooltip の、マウスを載せてから出るまで（ms）。Tooltip ごとに delay を渡したときは、そちらが先です
   * @default 400
   */
  delay?: number;
  /**
   * 中の Tooltip の、マウスが離れてから消えるまで（ms）
   * @default 0
   */
  closeDelay?: number;
}

/**
 * 中の Tooltip の待ち時間をそろえます。1 つが出たあとは、隣の Tooltip へマウスを移すと待たずに出ます
 * （ツールバーのボタンを順に見ていくときに、毎回待たせないため）
 */
export function TooltipProvider({
  children,
  delay = DEFAULT_DELAY,
  closeDelay = 0,
}: TooltipProviderProps) {
  return (
    <TooltipDelayContext value={delay}>
      <BaseTooltip.Provider delay={delay} closeDelay={closeDelay}>
        {children}
      </BaseTooltip.Provider>
    </TooltipDelayContext>
  );
}

// 長押しとみなさない指の動き（px）。これより動いたらスクロールとみなし、長押しをやめる
const LONG_PRESS_SLOP = 10;

/**
 * 本体にマウスを載せたとき・キーボードでフォーカスしたとき・指で長押ししたときに出す、短い補足
 */
export function Tooltip({
  content,
  children,
  side = 'bottom',
  align = 'center',
  delay: delayProp,
  longPressDelay = 500,
  longPressSide = 'top',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  disabled,
  hideShadow = false,
  showArrow = false,
  portalContainer: container,
  popupProps,
  positionerProps,
  className,
  [TOOLTIP_TRIGGER]: outerTriggerMark,
}: TooltipProps & TooltipTriggerMarkProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  // 待ち時間は、Tooltip ごとの delay、包む TooltipProvider の delay、既定の順に決める
  const providerDelay = use(TooltipDelayContext);
  const delay = delayProp ?? providerDelay ?? DEFAULT_DELAY;
  const portalContainer = usePortalContainer(container);
  // 外の Tooltip の本体か（Tooltip を重ねたとき。自分を止めているときも、外の Tooltip のために押せないボタンをフォーカスできる形に保つ）
  const inOuterTrigger = outerTriggerMark !== undefined;
  // 押せないボタンを本体にしたときは、出す文を本体の説明（aria-describedby）にも結ぶ（押せない理由を読み上げで伝える — 原則13・15）
  //   面は出ているあいだしかないので、同じ文を隠した要素（hidden）に置いて結ぶ。hidden なので、読み上げで順に読んでも二度は読まない
  //   ふつうの（押せる）ボタンの読み上げは変えない。結ぶかは Button が決める（押せないままフォーカスできる形のときだけ）
  //   Tooltip を重ねたときは、外の Tooltip の文の id も引き継ぐ
  const descriptionId = useId();
  const isClient = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  );
  const childProps: unknown = children.props;
  const describes =
    !disabled &&
    ((typeof childProps === 'object' &&
      childProps !== null &&
      'disabled' in childProps &&
      childProps.disabled === true) ||
      children.type === Tooltip);
  const triggerMark =
    !disabled || inOuterTrigger
      ? [describes ? descriptionId : '', outerTriggerMark ?? ''].filter(Boolean).join(' ')
      : undefined;
  const { className: popupClassName, ref: userPopupRef, ...restPopupProps } = popupProps ?? {};
  const {
    className: positionerClassName,
    ref: userPositionerRef,
    ...restPositionerProps
  } = positionerProps ?? {};
  const popupRef = useMergedRefs<HTMLDivElement>(userPopupRef);
  const positionerRef = useMergedRefs<HTMLDivElement>(userPositionerRef);
  const { anchorRef, scope } = useDensityScope(open);
  const changeOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  // effect の中からは、いまの changeOpen を読む（毎回新しい onOpenChange を渡されても、effect を貼り直さない）
  //   peer の React は 19.0 からなので、useEffectEvent（19.2）は使わない
  //   描いたあと、次のブラウザのイベントより前に入れ替わるよう、layout effect（コミットのとき）で書く
  const changeOpenRef = useRef(changeOpen);
  useIsomorphicLayoutEffect(() => {
    changeOpenRef.current = changeOpen;
  });

  // 指で長押ししたときに出す（Base UI の Tooltip は指では出ないため、ここで開く） — 原則11
  //   長押しで出したあとは、指を離して起きる click で本体を実行せず（押したつもりではないため）、閉じもしない
  //   ほかの場所に触れたら閉じる。端末の長押しのメニューと文字の選択は、本体の上では出さない
  const press = useRef<{ x: number; y: number; timer: number } | null>(null);
  const [longPressed, setLongPressed] = useState(false);
  const cancelPress = () => {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  };
  useEffect(
    () => () => {
      if (press.current) window.clearTimeout(press.current.timer);
    },
    []
  );
  useEffect(() => {
    if (!longPressed) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && anchorRef.current?.contains(event.target)) return;
      setLongPressed(false);
      changeOpenRef.current(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [longPressed, anchorRef]);

  return (
    <BaseTooltip.Root
      open={open}
      disabled={disabled}
      onOpenChange={(next, details) => {
        // 長押しで出したあいだは、本体の押下（指を離したときの click）では閉じない
        if (!next && longPressed && details.reason === 'trigger-press') return;
        if (!next) setLongPressed(false);
        changeOpen(next);
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      {/* 本体の要素そのものに印を足す。本体の Button は、押せないとき（disabled）もフォーカスできる形になる（Tooltip を出せるように）
          印は本体の要素にしか届かないので、入れ物や自作の部品の中のボタンには効かない
          Tooltip を止めているとき（disabled）は出す理由がないので足さない。外の Tooltip の本体なら、その印を引き継ぐ */}
      <BaseTooltip.Trigger
        ref={anchorRef}
        render={children}
        {...{ [TOOLTIP_TRIGGER]: triggerMark }}
        delay={delay}
        style={{ WebkitTouchCallout: 'none' }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch' || disabled) return;
          cancelPress();
          const timer = window.setTimeout(() => {
            press.current = null;
            setLongPressed(true);
            changeOpen(true);
          }, longPressDelay);
          press.current = { x: event.clientX, y: event.clientY, timer };
        }}
        onPointerMove={(event) => {
          const start = press.current;
          if (!start) return;
          if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > LONG_PRESS_SLOP) {
            cancelPress();
          }
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(event) => {
          if (longPressed || press.current) event.preventDefault();
        }}
        onClickCapture={(event) => {
          if (!longPressed) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      />
      {describes &&
        isClient &&
        createPortal(
          <span id={descriptionId} hidden>
            {content}
          </span>,
          portalContainer ?? document.body
        )}
      <BaseTooltip.Portal container={portalContainer}>
        <BaseTooltip.Positioner
          // 長押しで出したときは、指と手で隠れる向きを避ける（longPressSide）
          side={longPressed && longPressSide ? longPressSide : side}
          align={align}
          sideOffset={() => readTokenLength('--tooltip-offset')}
          collisionPadding={popupCollisionPadding}
          data-density={scope.density}
          {...restPositionerProps}
          ref={positionerRef}
          className={['z-10', scope.large && 'coarse-large', positionerClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {/* 面は浮かぶ面と同じ白・細い輪郭（原則1）。小さいので影は小さく淡い（--shadow-tooltip）。文字は部品のキャプションと同じ大きさ */}
          <BaseTooltip.Popup
            data-slot="tooltip"
            {...restPopupProps}
            ref={popupRef}
            className={tooltipPopup({
              shadow: !hideShadow,
              className: cn(className, popupClassName),
            })}
          >
            {showArrow && <BaseTooltip.Arrow data-slot="tooltip-arrow" className={tooltipArrow} />}
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
