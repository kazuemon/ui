'use client';

import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import {
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
} from 'react';

import { type ScrollAreaScrollbar, scrollAreaStyles } from './scroll-area-styles';
import { SheetMoreCue } from './sheet/SheetMoreCue';
import { useMergedRefs } from './use-merged-refs';
import { useMoreCues } from './sheet/use-more-cues';
import { useInlineCues } from './use-inline-cues';
import { useKeyboardScroller } from './use-keyboard-scroller';

// スクロールする枠の中身（軸 93）。ScrollArea 部品と、部品の中でスクロールさせる場所が共有する
//   ScrollArea: そのまま使う（枠はキーボードで止まり、上下左右の影と両向きのつまみを出す）
//   TagsInput の欄の中のチップ・Autocomplete の浮かぶ候補: 欄や面の中なので、枠そのものは止まり先にしない
// 見た目の考えと値は scroll-area-styles.ts（Textarea とも共有する）

export interface ScrollFrameProps {
  children?: ReactNode;
  /** 枠に足すクラス。高さ（h-*・max-h-*）か幅を決めて、はみ出した分をスクロールさせる */
  className?: string;
  /** 枠の印（data-slot） */
  slot?: string;
  /** スクロールする要素（Viewport）に足すクラス。内側の余白はここに付ける */
  viewportClassName?: string;
  /** 中身を包む要素に足すクラス */
  contentClassName?: string;
  /** 中身を包む要素に渡す props（ScrollArea の contentProps） */
  contentProps?: ComponentProps<'div'>;
  /** スクロールする要素に渡す props（ScrollArea の viewportProps） */
  viewportProps?: ComponentProps<'div'>;
  /** 枠（いちばん外の要素）の ref */
  ref?: Ref<HTMLDivElement>;
  /** 枠（いちばん外の要素）の id */
  id?: string;
  /** 枠（いちばん外の要素）の style */
  style?: CSSProperties;
  /** 中身を包む要素の style。Base UI の既定（min-width: fit-content）を変えるときに使う */
  contentStyle?: CSSProperties;
  /**
   * 枠をキーボードの止まり先にするか。欄や面の中に置くときは false にして、
   * その中にもう1つの止まり先を作らない（中の要素へ移ったときは、ブラウザが見える位置へ送る）
   * auto は、ブラウザのスクロールする箱と同じく、あふれていて中に Tab で止まれるものがないときだけ止まる
   * （シートや Dialog の中身。開いた直後のフォーカスは変えない — use-keyboard-scroller）
   * @default true
   */
  focusable?: boolean | 'auto';
  /**
   * 続きがある端に、内側の影を落とすか
   * @default true
   */
  edgeShadow?: boolean;
  /**
   * 左右の端にも影を落とすか（横にスクロールするとき）
   * @default true
   */
  inlineEdges?: boolean;
  /**
   * 上の端に影を落とすか。中身の上端に貼り付く見出し（DataTable の固定ヘッダー）が、自分の下に影を描くときは false にする
   * @default true
   */
  topEdge?: boolean;
  /**
   * つまみを出す向き。vertical は縦だけ、horizontal は横だけ
   * @default 'both'
   */
  orientation?: 'both' | 'vertical' | 'horizontal';
  /** つまみの帯に足すクラス */
  scrollbarClassName?: string;
  /**
   * つまみの出し方。scroll は枠に載せたとき・スクロール中・キーボードで止まったときだけ、always はいつも
   * @default 'scroll'
   */
  scrollbar?: ScrollAreaScrollbar;
  /** 枠の名前。付けると、枠は名前付きの領域（region）になる */
  label?: string;
  /** スクロールする要素を受け取る（影の計算のほかに要るとき）。付いたときとはずれたときに呼ばれる */
  onViewport?: (element: HTMLDivElement | null) => void;
  /**
   * スクロールする要素（Viewport）の印（data-slot）。部品の中身の印（sheet-content など）をそのまま残すときに渡す
   * @default 'scroll-area-viewport'
   */
  viewportSlot?: string;
  /** スクロールする要素を、別の部品（Base UI の Drawer.Content など）で描く */
  viewportRender?: ReactElement;
  /** 枠の中、スクロールする要素の前と後ろに置くもの（続きの印 SheetMoreCue など。枠に書く --cue-* を読める） */
  before?: ReactNode;
  after?: ReactNode;
}

// フォーカスを受ける要素（tabindex が負のものも含む。押すとフォーカスを受けるもの）
const FOCUSABLE =
  'a[href],button,input:not([type="hidden"]),select,textarea,summary,iframe,[tabindex],[contenteditable]:not([contenteditable="false"])';

/**
 * 止まり先にしない枠（focusable={false}）を押したとき、枠そのものにフォーカスを渡さない。
 * 枠には tabIndex=-1 を置くので、そのままでは押すと枠がフォーカスを受け、欄（Combobox の打つ欄）や
 * 面（Embed の押せる面）からフォーカスが抜ける。押した先がフォーカスできる要素でなければ、ブラウザが
 * フォーカスできない箇所を押したときと同じく、枠の外のいちばん近いフォーカスできる要素へ渡す
 * （いまのフォーカスがすでにその中にあれば動かさない）。押す操作（click）は止めない
 */
function keepFocusOffViewport(event: MouseEvent<HTMLDivElement>) {
  if (event.defaultPrevented || event.button !== 0) return;
  const viewport = event.currentTarget;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest(FOCUSABLE) !== viewport) return;
  event.preventDefault();
  const outer = viewport.parentElement?.closest<HTMLElement>(FOCUSABLE);
  const active = viewport.ownerDocument.activeElement;
  if (outer && !(active && outer.contains(active))) outer.focus({ preventScroll: true });
}

export function ScrollFrame({
  children,
  className,
  slot = 'scroll-area',
  viewportClassName,
  contentClassName,
  contentProps,
  viewportProps,
  ref,
  id,
  style,
  contentStyle,
  focusable = true,
  edgeShadow = true,
  inlineEdges = true,
  topEdge = true,
  orientation = 'both',
  scrollbarClassName,
  scrollbar = 'scroll',
  label,
  onViewport,
  viewportSlot = 'scroll-area-viewport',
  viewportRender,
  before,
  after,
}: ScrollFrameProps) {
  const styles = scrollAreaStyles({ scrollbar });
  const { className: ownContentClassName, ...contentRest } = contentProps ?? {};
  const {
    className: ownViewportClassName,
    ref: ownViewportRef,
    ...viewportRest
  } = viewportProps ?? {};
  // 続きがあることの影（上下は useMoreCues、左右は useInlineCues が枠に書く）
  const moreCues = useMoreCues();
  const inlineCues = useInlineCues();
  // スクロールする要素を、影の計算と使う側に渡す（測る側がすぐ読めるよう、その場で渡す）
  const setViewport = useCallback(
    (element: HTMLDivElement | null) => {
      if (edgeShadow) moreCues(element);
      if (edgeShadow && inlineEdges) inlineCues(element);
      onViewport?.(element);
    },
    [moreCues, inlineCues, edgeShadow, inlineEdges, onViewport]
  );
  // focusable="auto": あふれていて中に止まり先がないときだけ止まる
  const keyboard = useKeyboardScroller(focusable === 'auto');
  // 内部の ref（影の計算・止まり先の判定）と、使う側が渡した ref をつなぐ（ADR-0250）
  const viewportRef = useMergedRefs(setViewport, keyboard.ref, ownViewportRef);
  return (
    <BaseScrollArea.Root
      ref={ref}
      id={id}
      style={style}
      data-slot={slot}
      className={styles.root({ className })}
    >
      {before}
      <BaseScrollArea.Viewport
        {...viewportRest}
        onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          viewportRest.onMouseDown?.(event);
          if (focusable === false) keepFocusOffViewport(event);
        }}
        ref={viewportRef}
        render={viewportRender}
        // 止まり先にしないとき・auto のときだけ tabIndex を置く（渡すと、スクロールできるとき止まる Base UI の既定を消してしまう）
        {...(focusable === true
          ? {}
          : { tabIndex: focusable === 'auto' && keyboard.stop ? 0 : -1 })}
        data-slot={viewportSlot}
        // つまみを出す条件（キーボードで止まったとき）が読む印。data-slot は部品が変えることがあるので別に置く
        data-scroll-viewport=""
        className={styles.viewport({
          className: [viewportClassName, ownViewportClassName].filter(Boolean).join(' '),
        })}
        {...(label != null && { role: 'region', 'aria-label': label })}
      >
        <BaseScrollArea.Content
          {...contentRest}
          className={[contentClassName, ownContentClassName].filter(Boolean).join(' ') || undefined}
          style={contentStyle ?? contentProps?.style}
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {after}
      {edgeShadow && (
        <div className={styles.edges()}>
          {/* 上下の端の影。Select・シートと同じ部品で描く */}
          {topEdge && (
            <div className="absolute inset-x-0 top-0">
              <SheetMoreCue edge="top" sheet={false} sheetMoreCue="shadow" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0">
            <SheetMoreCue edge="bottom" sheet={false} sheetMoreCue="shadow" />
          </div>
          {/* 左右の端の影 */}
          {inlineEdges && (
            <>
              <div
                aria-hidden
                className={styles.edgeX({ className: 'left-0 bg-linear-to-r' })}
                style={{ opacity: 'var(--cue-x-start)' }}
              />
              <div
                aria-hidden
                className={styles.edgeX({ className: 'right-(--cue-right) bg-linear-to-l' })}
                style={{ opacity: 'var(--cue-x-end)' }}
              />
            </>
          )}
        </div>
      )}
      {orientation !== 'horizontal' && (
        <BaseScrollArea.Scrollbar
          data-slot="scroll-area-scrollbar"
          orientation="vertical"
          className={styles.scrollbar({ className: scrollbarClassName })}
        >
          <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation !== 'vertical' && (
        <BaseScrollArea.Scrollbar
          data-slot="scroll-area-scrollbar"
          orientation="horizontal"
          className={styles.scrollbar({ className: scrollbarClassName })}
        >
          <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
        </BaseScrollArea.Scrollbar>
      )}
    </BaseScrollArea.Root>
  );
}
