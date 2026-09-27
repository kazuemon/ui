'use client';

import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';

import { useInspectorContext } from './inspector-context';
import { inspectorStyles } from './inspector-styles';
import { OverlayCloseContext } from '../../internal/overlay/overlay-close-context';
import { focusTargetRef, type OverlayFocusTarget } from '../../internal/overlay/overlay-props';
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
  /** 下の端に置く操作（ボタンの並び）。中身をスクロールしても動かない。押して閉じるボタンは OverlayClose の render に渡す */
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
  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    if (wasOpen.current === open) return undefined;
    wasOpen.current = open;
    const panel = panelRef.current;
    if (open) {
      const target = focusTargetRef(autoFocus);
      if (!target) return undefined;
      // 閉じているあいだは visibility で隠しているので、見えるようになってから移す
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => target.current?.focus());
      });
      return () => cancelAnimationFrame(frame);
    }
    if (panel && panel.contains(document.activeElement)) {
      const target = focusTargetRef(returnFocus);
      if (target !== false) (target?.current ?? triggerRef.current)?.focus();
    }
    return undefined;
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
  const s = inspectorStyles({ variant, side });
  return (
    <div
      data-slot="inspector-frame"
      data-variant={variant}
      data-side={side}
      data-open={open || undefined}
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
              actions == null && 'pb-(--sheet-padding-x)',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
          <SheetMoreCue
            edge="bottom"
            sheet
            sheetMoreCue="divider-always-shadow"
            divider={actions != null ? 'shadow' : undefined}
          />
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
    </div>
  );
}
