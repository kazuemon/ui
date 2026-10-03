'use client';

import {
  type ComponentProps,
  type ReactNode,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { type OverlayActionsKind, OverlayActionsContext } from './overlay-actions-context';
import { warnOnce } from '../link-parts';
import { SheetMoreCue } from '../sheet/SheetMoreCue';
import { tv } from '../tv';
import { useMergedRefs } from '../use-merged-refs';

// 面の下の操作の帯の見た目。仕組みは overlay-actions-context.ts
const styles = tv({
  base: 'flex flex-wrap justify-end gap-2',
  variants: {
    kind: {
      // 中央の Dialog: 面の actions の帯と同じ余白（左右は中身の側、下は面の側が持つ）
      dialog: 'pt-(--dialog-padding)',
      // 中身だけをスクロールさせる Dialog: 中身の下の端に貼り付ける。中身の左右の余白の外まで広げ、下の余白も帯が持つ
      'dialog-scroll':
        'sticky bottom-0 z-1 -mx-(--dialog-padding) bg-surface px-(--dialog-padding) py-(--dialog-padding)',
      // シート: 中身の下の端に貼り付ける。中身の左右の余白の外まで広げ、下は端末の安全領域の分を空ける
      //   上から出すシートは画面の下の端に着かないので、安全領域の分は空けない
      sheet: [
        'sticky bottom-0 z-1 -mx-(--sheet-padding-x) bg-surface px-(--sheet-padding-x) pt-(--sheet-padding-x) pb-[max(var(--sheet-padding-x),env(safe-area-inset-bottom))]',
        '[[data-slot=sheet][data-side=top]_&]:pb-(--sheet-padding-x)',
        "data-[layout='stack-reverse']:flex-col-reverse data-[layout=fill]:*:flex-1 data-[layout=stack]:flex-col",
      ],
      inspector: [
        'sticky bottom-0 z-1 -mx-(--sheet-padding-x) bg-surface p-(--sheet-padding-x)',
        "data-[layout='stack-reverse']:flex-col-reverse data-[layout=fill]:*:flex-1 data-[layout=stack]:flex-col",
      ],
    },
  },
});

// 貼り付けた帯を置く、スクロールする中身
const SCROLLER =
  '[data-slot=dialog-content],[data-slot=sheet-content],[data-slot=inspector-content]';

/**
 * 貼り付けた帯の高さを、スクロールする中身の scroll-padding-bottom にする。
 * Tab で帯の下に隠れた欄へ進んだとき、ブラウザがその欄（入力欄ではカーソル）を帯の上まで送るように。
 * 帯の中にフォーカスがあるあいだは外す（開いた直後に帯のボタンへフォーカスしたとき、中身をスクロールさせないため）
 */
function useStickyScrollPadding(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const band = ref.current;
    const scroller = enabled ? band?.closest<HTMLElement>(SCROLLER) : null;
    if (!band || !scroller) return undefined;
    const apply = (focused: Element | null) => {
      const outsideBand = focused != null && scroller.contains(focused) && !band.contains(focused);
      scroller.style.scrollPaddingBottom = outsideBand ? `${band.offsetHeight}px` : '';
    };
    // フォーカスが移ったとき（ブラウザがフォーカスした要素へスクロールするより前）に切り替える
    const onFocusIn = (event: FocusEvent) =>
      apply(event.target instanceof Element ? event.target : null);
    scroller.addEventListener('focusin', onFocusIn);
    const observer = new ResizeObserver(() => apply(document.activeElement));
    observer.observe(band);
    apply(document.activeElement);
    return () => {
      scroller.removeEventListener('focusin', onFocusIn);
      observer.disconnect();
      scroller.style.scrollPaddingBottom = '';
    };
  }, [enabled]);
  return ref;
}

const SLOTS: Record<OverlayActionsKind, string> = {
  dialog: 'dialog-footer',
  'dialog-scroll': 'dialog-footer',
  sheet: 'sheet-footer',
  inspector: 'inspector-footer',
};

export interface OverlayActionsProps extends ComponentProps<'div'> {
  /** 警告に出す部品の名前 */
  name: string;
  /** 操作の左（縦に積むときは上）に置く文やチェックボックス */
  start?: ReactNode;
}

/**
 * 下の操作の帯の、操作の左に置くもの（actionsStart・*Actions の start）。
 * 横に並べるときは左の端に寄せ、縦に積むとき（stack・stack-reverse）と幅を等分するとき（fill）は、操作の上に 1 行で置く。
 * 置く場所だけを決め、要素を渡されたときは文字の大きさや色を付けない（使う側が Text などで決める）。
 * 文字列（数）だけを渡されたときは、補足として小さい淡い文字で描く
 */
export function OverlayActionsStart({ children }: { children: ReactNode }) {
  const text = typeof children === 'string' || typeof children === 'number';
  return (
    <div
      data-slot="overlay-actions-start"
      className={[
        'me-auto min-w-0 self-center',
        text && 'text-caption leading-caption text-fg-muted',
        // 縦に積むときは操作の上に置く（stack-reverse は逆順に並ぶので、いちばん後ろに回すと上に来る）
        'in-data-[layout=stack]:self-start in-data-[layout=stack-reverse]:order-last in-data-[layout=stack-reverse]:self-start',
        'in-data-[layout=fill]:basis-full!',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/** 面の下の操作の帯。置いた場所（中身の中）に描き、見た目は面の actions の帯と同じにする */
export function OverlayActions({
  name,
  start,
  className,
  children,
  ref,
  ...props
}: OverlayActionsProps) {
  const slot = use(OverlayActionsContext);
  const sticky = slot != null && slot.kind !== 'dialog';
  const bandRef = useStickyScrollPadding(sticky);
  const mergedRef = useMergedRefs<HTMLDivElement>(bandRef, ref);
  const register = slot?.register;
  useLayoutEffect(() => register?.(), [register]);
  const actionsGiven = slot?.actionsGiven ?? false;
  useEffect(() => {
    if (!slot) {
      warnOnce(`${name} は Dialog・AlertDialog・Drawer・Inspector の中身に置きます`);
    } else if (actionsGiven) {
      warnOnce(
        `${name}: 面の actions と両方渡しています。下の操作は actions か ${name} のどちらか一方に書きます`
      );
    }
  }, [slot, actionsGiven, name]);
  if (!slot) {
    return (
      <div ref={ref} {...props} className={styles({ className })}>
        {start != null && <OverlayActionsStart>{start}</OverlayActionsStart>}
        {children}
      </div>
    );
  }
  return (
    <div
      ref={mergedRef}
      data-slot={SLOTS[slot.kind]}
      data-layout={sticky ? slot.layout : undefined}
      {...props}
      className={styles({ kind: slot.kind, className })}
    >
      {/* 続きの印は帯の上の端に付ける（中身が帯の下に隠れているあいだ出す） */}
      {sticky && (
        <SheetMoreCue
          edge="bottom"
          sheet
          sheetMoreCue="divider-always-shadow"
          divider="shadow"
          attached
        />
      )}
      {start != null && <OverlayActionsStart>{start}</OverlayActionsStart>}
      {children}
    </div>
  );
}
