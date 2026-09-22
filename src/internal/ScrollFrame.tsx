'use client';

import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
} from 'react';

import { scrollAreaStyles } from './scroll-area-styles';
import { SheetMoreCue } from './sheet/SheetMoreCue';
import { useMergedRefs } from './use-merged-refs';
import { useMoreCues } from './sheet/use-more-cues';
import { useInlineCues } from './use-inline-cues';

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
  /** 中身を包む要素の style。Base UI の既定（min-width: fit-content）を変えるときに使う */
  contentStyle?: CSSProperties;
  /**
   * 枠をキーボードの止まり先にするか。欄や面の中に置くときは false にして、
   * その中にもう1つの止まり先を作らない（中の要素へ移ったときは、ブラウザが見える位置へ送る）
   * @default true
   */
  focusable?: boolean;
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
  scrollbar?: 'scroll' | 'always';
  /** 枠の名前。付けると、枠は名前付きの領域（region）になる */
  label?: string;
  /** スクロールする要素を受け取る（影の計算のほかに要るとき）。付いたときとはずれたときに呼ばれる */
  onViewport?: (element: HTMLDivElement | null) => void;
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
  contentStyle,
  focusable = true,
  edgeShadow = true,
  inlineEdges = true,
  orientation = 'both',
  scrollbarClassName,
  scrollbar = 'scroll',
  label,
  onViewport,
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
  // 内部の ref（影の計算）と、使う側が渡した ref をつなぐ（ADR-0250）
  const viewportRef = useMergedRefs(setViewport, ownViewportRef);
  return (
    <BaseScrollArea.Root ref={ref} data-slot={slot} className={styles.root({ className })}>
      <BaseScrollArea.Viewport
        {...viewportRest}
        ref={viewportRef}
        // 止まり先にしないときだけ tabIndex を置く（渡すと、スクロールできるとき止まる Base UI の既定を消してしまう）
        {...(focusable ? {} : { tabIndex: -1 })}
        data-slot="scroll-area-viewport"
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
      {edgeShadow && (
        <div className={styles.edges()}>
          {/* 上下の端の影。Select・シートと同じ部品で描く */}
          <div className="absolute inset-x-0 top-0">
            <SheetMoreCue edge="top" sheet={false} sheetMoreCue="shadow" />
          </div>
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
          orientation="vertical"
          className={styles.scrollbar({ className: scrollbarClassName })}
        >
          <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation !== 'vertical' && (
        <BaseScrollArea.Scrollbar
          orientation="horizontal"
          className={styles.scrollbar({ className: scrollbarClassName })}
        >
          <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
        </BaseScrollArea.Scrollbar>
      )}
    </BaseScrollArea.Root>
  );
}
