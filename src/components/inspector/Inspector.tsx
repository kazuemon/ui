'use client';

import {
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useInspectorContext } from './inspector-context';
import { inspectorStyles } from './inspector-styles';
import { OverlayActions } from '../../internal/overlay/overlay-actions';
import {
  OverlayActionsContext,
  useOverlayActionsSlot,
} from '../../internal/overlay/overlay-actions-context';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import { ResizeHandle } from '../../internal/resize-handle/ResizeHandle';
import { focusTargetRef, type OverlayFocusTarget } from '../../internal/overlay/overlay-props';
import { readCssLength } from '../../internal/overlay/popup-styles';
import { SheetCloseButton, SheetHeader } from '../../internal/sheet/SheetHeader';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import type { OverlayActionsLayout } from '../../internal/sheet/SheetPopup';
import {
  overlayTitleLeading,
  sheetDescriptionClass,
  sheetTitleClass,
} from '../../internal/sheet/sheet-styles';
import { useMoreCues } from '../../internal/sheet/use-more-cues';
import { useMergedRefs } from '../../internal/use-merged-refs';

/**
 * 開いたときの出し方
 * push: 本文を押しのけて場所を占めます。本文の幅が狭くなり、パネルと本文を同時に見られます
 * overlay: 領域の中で、本文の上に重ねて出します。本文の幅は変わりません
 */
export type InspectorVariant = 'push' | 'overlay';

/** 出す辺。領域の右の端か、左の端 */
export type InspectorSide = 'left' | 'right';

/**
 * 重ねる形（variant="overlay"）のときの端の形
 * flush: 領域の端に着け、角を丸めません。アプリの枠の一部として見えます
 * floating: 領域の端から少し離し、4 つの角を丸めて浮かべます
 */
export type InspectorOverlayEdge = 'flush' | 'floating';

/**
 * 開閉の動き
 * slide: 領域の端から滑らせます。閉じるほうを短くします
 * none: 動かさず、すぐに切り替えます
 */
export type InspectorMotion = 'slide' | 'none';

/** 開いたとき、焦点を移せるまで待つ描画の数の上限（60fps で約 1 秒） */
const FOCUS_TRIES = 60;

export interface InspectorProps extends Omit<
  ComponentProps<'aside'>,
  'title' | 'children' | 'autoFocus'
> {
  /** 見出しの題。読み上げでは、パネルの名前になる */
  title: ReactNode;
  /** 題の下の説明。読み上げでは、パネルの説明になる */
  description?: ReactNode;
  /** パネルの中身。長いときはスクロールし、上下の端に続きの印を出す */
  children?: ReactNode;
  /**
   * 下の端に置く操作（ボタンの並び）。中身をスクロールしても動かない。押して閉じるボタンは OverlayClose の render に渡す。
   * 中身の Form の送信のボタンを並べるときは、actions の代わりに中身の Form の中に InspectorActions を置きます
   */
  actions?: ReactNode;
  /**
   * 下の操作（actions）の並べ方。auto と end は右に寄せます。幅を等分するときは fill、縦に積むときは stack（渡した順に上から）か stack-reverse（最後に渡した主な操作が上）です
   * @default 'auto'
   */
  actionsLayout?: OverlayActionsLayout;
  /**
   * 出す辺。Sidebar を左に置くときは、反対の右に置きます
   * @default 'right'
   */
  side?: InspectorSide;
  /**
   * 開いたときの出し方。push は本文を押しのけて場所を占め、overlay は領域の中で本文の上に重ねます。
   * どちらも InspectorLayout の中だけで開閉し、画面の最上層には出ません。裏を止めず、外を押しても閉じません
   * @default 'push'
   */
  variant?: InspectorVariant;
  /**
   * 重ねる形（variant="overlay"）のときの端の形。flush は領域の端に着け、角を丸めません。floating は端から少し離し、4 つの角を丸めて浮かべます。
   * 押しのける形（push）では使いません
   * @default 'flush'
   */
  overlayEdge?: InspectorOverlayEdge;
  /**
   * パネルの幅。数値は px、文字列は CSS の長さ（'24rem'・'30%' など）です。書かないときは Drawer の横のパネルと同じ幅です。
   * 重ねる形では、狭い領域で本文の側に少し残して縮みます。
   * resizable のときに数値を渡すと、幅を外で持つ形（制御）になり、onWidthChange で受けた幅を渡し直します
   */
  width?: number | string;
  /**
   * 本文との境のつまみをドラッグして、幅を変えられるか。キーボードでは、つまみにフォーカスして ← → で 16px ずつ、Home・End で最小・最大。
   * ダブルクリックで defaultWidth（なければ部品の幅）に戻り、その幅（px）で onWidthChange を呼びます
   * @default false
   */
  resizable?: boolean;
  /** resizable のときの、はじめの幅（px。非制御）。書かないときは width か、部品の幅です */
  defaultWidth?: number;
  /** resizable で幅を変えたときに、次の幅（px）を渡して呼びます。覚えておくときはここで保存します */
  onWidthChange?: (width: number) => void;
  /**
   * resizable のときの、いちばん狭い幅（px）
   * @default 240
   */
  minWidth?: number;
  /**
   * resizable のときの、いちばん広い幅（px）。重ねる形では、領域の幅でも縮みます
   * @default 640
   */
  maxWidth?: number;
  /**
   * 幅を変えるつまみの読み上げの名前
   * @default 'パネルの幅'
   */
  resizeName?: string;
  /**
   * 開閉の動き。slide は領域の端から滑らせ、none は動かさずにすぐ切り替えます。動きを減らす設定では、slide でも動かしません
   * @default 'slide'
   */
  motion?: InspectorMotion;
  /**
   * パネルの中にフォーカスがあるとき、Esc で閉じるか
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * 右上の閉じる × を消すか。消すときは、InspectorTrigger か actions に閉じる手段を置きます
   * @default false
   */
  hideCloseButton?: boolean;
  /**
   * 閉じる × の読み上げの名前
   * @default '閉じる'
   */
  closeName?: string;
  /** 開いた直後に焦点を当てる要素。要素そのものか、要素の ref を渡します。書かないときは焦点を動かしません（裏を止めない、常駐のパネルのため） */
  autoFocus?: OverlayFocusTarget;
  /** パネルの中に焦点があるまま閉じたとき、焦点を戻す要素。書かないときは最後に押した InspectorTrigger */
  returnFocus?: OverlayFocusTarget;
  /** パネル（aside）に付きます */
  className?: string;
}

/**
 * 決まった領域（InspectorLayout）の中だけで開閉する、常駐のパネル。選んだものの詳細や設定を、本文の横に出します。
 * Drawer と違い、画面の最上層には出ず、裏を止めません
 */
export function Inspector({
  title,
  description,
  children,
  actions,
  actionsLayout = 'auto',
  side = 'right',
  variant = 'push',
  overlayEdge = 'flush',
  width,
  resizable = false,
  defaultWidth,
  onWidthChange,
  minWidth = 240,
  maxWidth = 640,
  resizeName = 'パネルの幅',
  motion = 'slide',
  closeOnEscape = true,
  hideCloseButton = false,
  closeName,
  autoFocus,
  returnFocus,
  className,
  ref,
  onKeyDown,
  ...props
}: InspectorProps) {
  const { open, setOpen, panelId, triggerRef } = useInspectorContext('Inspector');
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const cues = useMoreCues();
  const mergedRef = useMergedRefs<HTMLElement>(panelRef, ref);
  const close = () => setOpen(false);

  // 開いた直後: autoFocus があるときだけ焦点を移す。閉じた直後: 中に焦点があったら、開いたボタンへ戻す
  // 閉じると inert で中の焦点が外れるので、外れる前（DOM を書き換えた直後）に確かめる
  // はじめは閉じていたものとして扱い、はじめから開いているときも autoFocus を効かせる
  const wasOpen = useRef(false);
  // 焦点を移すまで待っている描画。開閉が変わったときと、外したときにだけ取りやめる
  //   （待つあいだに描き直して props が変わっても取りやめない。重い画面では待つあいだに描き直しが入るため）
  const focusFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);
  useLayoutEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    cancelAnimationFrame(focusFrame.current);
    const panel = panelRef.current;
    if (open) {
      const target = focusTargetRef(autoFocus);
      if (!target) return;
      // 閉じているあいだは visibility で隠しているので、見えるようになってから移す
      //   描くのが重いと、2 回待っても隠れたままのことがあるので、移れるまで次の描画を待つ（上限あり）
      //   待つあいだに利用者が焦点を別の場所へ動かしたら、奪わない
      const from = document.activeElement;
      let tries = 0;
      const move = () => {
        const element = target.current;
        if (!element) return;
        const active = element.ownerDocument.activeElement;
        if (active !== from && active !== element.ownerDocument.body) return;
        element.focus();
        if (element.ownerDocument.activeElement !== element && ++tries < FOCUS_TRIES)
          focusFrame.current = requestAnimationFrame(move);
      };
      focusFrame.current = requestAnimationFrame(() => {
        focusFrame.current = requestAnimationFrame(move);
      });
      return;
    }
    if (panel && panel.contains(document.activeElement)) {
      const target = focusTargetRef(returnFocus);
      if (target !== false) (target?.current ?? triggerRef.current)?.focus();
    }
  }, [open, autoFocus, returnFocus, triggerRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    // 中の浮かぶ部品（Select など）の Esc は、描く場所が外（ポータル）なので DOM の上では中にない。それは閉じる合図にしない
    if (
      event.key !== 'Escape' ||
      event.defaultPrevented ||
      !closeOnEscape ||
      !open ||
      !(event.target instanceof Node) ||
      !event.currentTarget.contains(event.target)
    ) {
      return;
    }
    close();
  };

  const layout = actionsLayout === 'auto' ? 'end' : actionsLayout;
  // 中身に置いた下の操作の帯（InspectorActions）。置かれたら、中身の下の余白と続きの印を帯に譲る
  const slot = useOverlayActionsSlot('inspector', layout, actions != null);
  const s = inspectorStyles({ variant, side, overlayEdge, motion });
  // 幅を変えられるとき: 数値の width は制御、なければ部品の中で持つ（はじめは defaultWidth）
  const [widthState, setWidthState] = useState(defaultWidth);
  const [resizing, setResizing] = useState(false);
  const controlledWidth = resizable && typeof width === 'number';
  const resizedWidth = resizable ? (controlledWidth ? width : widthState) : undefined;
  const setWidth = (next: number) => {
    if (!controlledWidth) setWidthState(next);
    onWidthChange?.(next);
  };
  const shownWidth = resizedWidth ?? width;
  // 幅を渡されたときは、枠に書いてパネルと一緒に読ませる
  const widthStyle: (CSSProperties & Record<'--inspector-width', string>) | undefined =
    shownWidth === undefined
      ? undefined
      : { '--inspector-width': typeof shownWidth === 'number' ? `${shownWidth}px` : shownWidth };
  // 幅を変えるつまみ。本文との境の線の上に、つかめる幅を半分ずつ重ねる（開いているあいだだけ）
  const handle =
    resizable && open ? (
      <ResizeHandle
        name={resizeName}
        controls={panelId}
        target={panelRef}
        width={resizedWidth}
        min={minWidth}
        max={maxWidth}
        edge={side === 'right' ? 'left' : 'right'}
        slot="inspector-resize-handle"
        className={s.handle()}
        onWidthChange={setWidth}
        onResizingChange={setResizing}
        onReset={() => {
          if (!controlledWidth) setWidthState(defaultWidth);
          // defaultWidth がないときは、部品の幅（文字の width か --inspector-width）を、枠を置く場所で px に読んで返す
          const frameParent = panelRef.current?.closest(
            '[data-slot="inspector-frame"]'
          )?.parentElement;
          onWidthChange?.(
            defaultWidth ??
              readCssLength(
                typeof width === 'string' ? width : 'var(--inspector-width)',
                frameParent
              )
          );
        }}
      />
    ) : null;
  // 押しのける形は、枠の隣の幅 0 の置き場に置く（本文の側の辺。並びの順は枠と同じ order で、DOM の順で前後を決める）
  const handleSlot =
    variant === 'push' && handle ? <div className={s.handleSlot()}>{handle}</div> : null;
  return (
    <>
      {side === 'right' && handleSlot}
      <div
        data-slot="inspector-frame"
        data-variant={variant}
        data-side={side}
        data-overlay-edge={variant === 'overlay' ? overlayEdge : undefined}
        data-motion={motion}
        data-open={open || undefined}
        data-resizable={resizable || undefined}
        data-resizing={resizing || undefined}
        style={widthStyle}
        className={s.frame()}
      >
        <OverlayCloseContext value={close}>
          <aside
            {...props}
            ref={mergedRef}
            id={panelId}
            aria-labelledby={titleId}
            aria-describedby={description != null ? descriptionId : undefined}
            inert={!open}
            data-slot="inspector"
            data-variant={variant}
            data-side={side}
            data-open={open || undefined}
            data-resizing={resizing || undefined}
            onKeyDown={handleKeyDown}
            className={s.panel({ className: `${overlayTitleLeading} ${className ?? ''}` })}
          >
            <SheetHeader
              handle={null}
              close={
                hideCloseButton ? null : (
                  <SheetCloseButton label={closeName} data-slot="inspector-close" onClick={close} />
                )
              }
            >
              <h2 id={titleId} className={sheetTitleClass}>
                {title}
              </h2>
              {description != null && (
                <p id={descriptionId} className={sheetDescriptionClass}>
                  {description}
                </p>
              )}
            </SheetHeader>
            {/* 続きの印: 上の区切り線は、中身がスクロールできるときだけ出す。下の区切り線は、下に操作があり、下の影が出ているあいだ出す */}
            <SheetMoreCue
              edge="top"
              sheet
              sheetMoreCue="divider-always-shadow"
              divider="scrollable"
            />
            <div
              ref={cues}
              data-slot="inspector-content"
              className={[
                'min-h-0 flex-1 overflow-y-auto overscroll-contain px-(--sheet-padding-x) pt-(--sheet-padding-x)',
                actions == null && !slot.placed && 'pb-(--sheet-padding-x)',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <OverlayActionsContext value={slot.value}>{children}</OverlayActionsContext>
            </div>
            {!slot.placed && (
              <SheetMoreCue
                edge="bottom"
                sheet
                sheetMoreCue="divider-always-shadow"
                divider={actions != null ? 'shadow' : undefined}
              />
            )}
            {actions != null && (
              <div
                data-slot="inspector-footer"
                data-layout={layout}
                className="flex shrink-0 flex-wrap justify-end gap-2 p-(--sheet-padding-x) data-[layout='stack-reverse']:flex-col-reverse data-[layout=fill]:*:flex-1 data-[layout=stack]:flex-col"
              >
                {actions}
              </div>
            )}
          </aside>
        </OverlayCloseContext>
        {variant === 'overlay' && handle}
      </div>
      {side === 'left' && handleSlot}
    </>
  );
}

export interface InspectorActionsProps extends ComponentProps<'div'> {
  /** 下に並べる操作（ボタン）。押して閉じるボタンは OverlayClose の render に渡す */
  children?: ReactNode;
  /** 帯（div）に付きます */
  className?: string;
}

/**
 * Inspector の下の操作（ボタン）の帯。中身のどこに置いても、actions と同じ下の帯に見え、中身が長いときは下に貼り付きます。
 * 並べ方は Inspector の actionsLayout に従います。
 * 中身の Form の中に置くと、送信のボタンが Form の送信・Enter・送信中・FormData にそのまま加わります。
 * 中身の最後（Form の中なら、その最後）に 1 つだけ置き、Inspector の actions とは両方渡しません
 */
export function InspectorActions(props: InspectorActionsProps) {
  return <OverlayActions name="InspectorActions" {...props} />;
}
