'use client';

import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import { type ComponentProps, type ReactNode, createContext, useContext, useState } from 'react';

import { useDensityScope } from '../../internal/density-scope';
import type { PopupProps, PositionerProps } from '../../internal/overlay/overlay-props';
import {
  popupCollisionPadding,
  popupMotionClass,
  popupSurfaceClass,
  readTokenLength,
} from '../../internal/overlay/popup-styles';
import { cn } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { usePortalContainer } from '../../internal/ui-config';
import { Image, type ImageProps } from '../image/Image';
import { Link, type LinkProps } from '../link/Link';

export type PreviewCardSide = 'top' | 'bottom' | 'left' | 'right';
export type PreviewCardAlign = 'start' | 'center' | 'end';
/** Card の variant の default（端まで）・nested（内側に収める）に当たる */
export type PreviewCardVariant = 'default' | 'nested';

const PreviewCardContext = createContext<{ cardVariant: PreviewCardVariant }>({
  cardVariant: 'default',
});

export interface PreviewCardProps extends Omit<LinkProps, 'content'> {
  /**
   * リンクの文字。Link と同じです。載せる・フォーカスすると、content がプレビューとして出ます
   */
  children?: ReactNode;
  /**
   * プレビューの中身（画像・題・説明、人のプロフィールなど）。
   * プレビューは、見える人が行き先を先に確かめるためのものです。読み上げには届かないので、欠かせない情報は行き先のページに置きます
   */
  content: ReactNode;
  /**
   * リンクのどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 'bottom'
   */
  side?: PreviewCardSide;
  /**
   * リンクに対して、どこにそろえるか
   * @default 'center'
   */
  align?: PreviewCardAlign;
  /**
   * 面の中の置き方。Card の variant と同じ値で、既定も Card と同じです
   * - default: 画像（PreviewCardImage）を面の端まで届かせます。文は PreviewCardBody で余白を付けて置きます
   * - nested: 画像を面の内側に、余白を空けて角丸で収めます
   * @default 'default'
   */
  cardVariant?: PreviewCardVariant;
  /**
   * 載せてから出るまで（ms）。任意の数を渡せます。フォーカスしたときにも同じだけ待ちます。通りがかりのマウスでは出ない長さにします
   * @default 400
   */
  openDelay?: number;
  /**
   * 離れてから閉じるまで（ms）。任意の数を渡せます。斜めに動いて、リンクから面へ移る間は閉じません。面の上にいるあいだは閉じません
   * @default 200
   */
  closeDelay?: number;
  /** 開いているか（制御） */
  open?: boolean;
  /**
   * はじめに開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 開閉の動きが終わったあとに、次の値を渡して呼びます */
  onOpenChangeComplete?: (open: boolean) => void;
  /**
   * 描く場所。リンクの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します。
   * まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props（anchor・collisionAvoidance・sideOffset など） */
  positionerProps?: PositionerProps;
  /** 面（Popup）に足すクラス。幅を変えるときは w-* を渡します。className はリンクに付きます */
  popupClassName?: string;
}

// 原則1・5: 面は Popover と同じ（popupSurfaceClass・shadow-overlay）。浮かぶ面の仲間なので、動きも同じ
// 開くきっかけはリンクに載せる・フォーカスするだけ（押しては開かない。押すとリンクの行き先へ移る）
// 面は読み上げに届かない（Base UI の決まり）ので、題・説明の名前は持たない
/**
 * リンクに載せる・フォーカスすると、行き先のプレビュー（画像・題・説明、人のプロフィールなど）が少し遅れて出ます。
 * リンクは Link と同じ見た目と props で、押すと行き先へ移ります
 */
export function PreviewCard({
  children,
  content,
  side = 'bottom',
  align = 'center',
  cardVariant = 'default',
  openDelay = 400,
  closeDelay = 200,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  portalContainer: container,
  popupProps,
  positionerProps,
  popupClassName: popupClassNameProp,
  ...linkProps
}: PreviewCardProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const portalContainer = usePortalContainer(container);
  const { anchorRef, scope } = useDensityScope<HTMLAnchorElement>(open);
  const { className: popupClassName, ref: userPopupRef, ...restPopupProps } = popupProps ?? {};
  const {
    className: positionerClassName,
    ref: userPositionerRef,
    ...restPositionerProps
  } = positionerProps ?? {};
  const popupRef = useMergedRefs<HTMLDivElement>(userPopupRef);
  const positionerRef = useMergedRefs<HTMLDivElement>(userPositionerRef);
  return (
    <BasePreviewCard.Root
      // 押せないリンクでは、載せてもフォーカスしてもプレビューを開かない
      open={open && !linkProps.disabled}
      onOpenChange={(next) => {
        if (next && linkProps.disabled) return;
        setOpenState(next);
        onOpenChange?.(next);
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <BasePreviewCard.Trigger
        ref={anchorRef}
        delay={openDelay}
        closeDelay={closeDelay}
        render={<Link {...linkProps}>{children}</Link>}
      />
      <BasePreviewCard.Portal container={portalContainer}>
        <BasePreviewCard.Positioner
          side={side}
          align={align}
          sideOffset={() => readTokenLength('--preview-card-offset')}
          collisionPadding={popupCollisionPadding}
          data-density={scope.density}
          {...restPositionerProps}
          ref={positionerRef}
          className={cn('z-10 outline-none', scope.large && 'coarse-large', positionerClassName)}
        >
          <BasePreviewCard.Popup
            data-slot="preview-card"
            {...restPopupProps}
            ref={popupRef}
            className={[
              popupSurfaceClass,
              popupMotionClass,
              'relative w-(--preview-card-width) max-w-(--available-width) overflow-hidden text-(length:--text-control) leading-(--leading-control) shadow-overlay',
              cardVariant === 'nested'
                ? 'p-(--card-nested-inset) [--preview-card-body-padding:calc(var(--preview-card-padding)-var(--card-nested-inset))]'
                : '[--preview-card-body-padding:var(--preview-card-padding)]',
              cn(popupClassNameProp, popupClassName),
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <PreviewCardContext value={{ cardVariant }}>{content}</PreviewCardContext>
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BasePreviewCard.Portal>
    </BasePreviewCard.Root>
  );
}

export interface PreviewCardBodyProps extends ComponentProps<'div'> {
  /** プレビューの文。題・説明などを縦に並べます */
  children?: ReactNode;
}

/**
 * プレビューの文の部分。面の余白と、中の要素の縦の間を決めます（CardBody と同じ）。
 * content には、文を PreviewCardBody で包んで渡します
 */
export function PreviewCardBody({ className, ...props }: PreviewCardBodyProps) {
  return (
    <div
      data-slot="preview-card-body"
      className={cn('flex flex-col gap-(--card-gap) p-(--preview-card-body-padding)', className)}
      {...props}
    />
  );
}

export type PreviewCardImageProps = Omit<ImageProps, 'radius' | 'hideOutline'>;

/**
 * プレビューの画像（CardImage と同じ）。比率は Card と同じ 16:9 で、はみ出た分を切ります。
 * 置き方は PreviewCard の cardVariant で決まります（default は面の端まで、nested は内側に角丸で）
 */
export function PreviewCardImage({
  ratio = 'var(--card-media-aspect)',
  frameProps,
  ...props
}: PreviewCardImageProps) {
  const { cardVariant } = useContext(PreviewCardContext);
  const nested = cardVariant === 'nested';
  return (
    <Image
      ratio={ratio}
      radius="none"
      hideOutline={!nested}
      {...props}
      frameProps={{
        ...frameProps,
        className: cn(
          nested && 'rounded-[max(0px,calc(var(--radius-control)-var(--card-nested-inset)))]',
          frameProps?.className
        ),
      }}
    />
  );
}
