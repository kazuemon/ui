'use client';

import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { type ReactNode, type Ref, useCallback, useImperativeHandle, useState } from 'react';

import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import { useMoreCues } from '../../internal/sheet/use-more-cues';
import { scrollAreaStyles } from '../../internal/scroll-area-styles';
import { useInlineCues } from '../../internal/use-inline-cues';

// スクロールする枠 — 軸 93。見た目の考えと値は internal/scroll-area-styles.ts（Textarea と共有する）

export type ScrollAreaScrollbar = 'scroll' | 'always';

export interface ScrollAreaProps {
  /** 中身 */
  children?: ReactNode;
  /**
   * 枠に足すクラス。高さ（h-*・max-h-*）か幅を決めて、はみ出した分をスクロールさせます
   */
  className?: string;
  /** 中身を包む要素に足すクラス。内側の余白（p-*）はここに付けます */
  contentClassName?: string;
  /**
   * 続きがある端に、内側の影を落とします。false にすると影を出さず、代わりにつまみをいつも出します（`scrollbar` は効きません）
   * @default true
   */
  edgeShadow?: boolean;
  /**
   * つまみの出し方。scroll は枠にマウスを載せたとき・スクロールしているあいだ・キーボードで止まったときだけ、always はいつも出します。
   * `edgeShadow={false}` のときは、指定にかかわらずいつも出します
   * @default 'scroll'
   */
  scrollbar?: ScrollAreaScrollbar;
  /**
   * 枠の名前。キーボードで止まったときに読み上げられます。付けると、枠は名前付きの領域（region）になります
   */
  label?: string;
  /** スクロールする要素。スクロールの位置を読む・変えるときに使います */
  viewportRef?: Ref<HTMLDivElement>;
}

/**
 * 決まった大きさの枠の中で、中身をスクロールさせます。
 * 続きがあることは端の内側の影で見せ、つまみは枠に載せたときとスクロールしているあいだに出します
 */
export function ScrollArea({
  children,
  className,
  contentClassName,
  edgeShadow = true,
  scrollbar = 'scroll',
  label,
  viewportRef,
}: ScrollAreaProps) {
  // 影がないときは、つまみで続きを伝える
  const styles = scrollAreaStyles({ scrollbar: edgeShadow ? scrollbar : 'always' });
  const moreCues = useMoreCues();
  const inlineCues = useInlineCues();
  // スクロールする要素を、影の計算と利用者の viewportRef に渡す
  const [viewport, setViewportElement] = useState<HTMLDivElement | null>(null);
  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(viewportRef, () => viewport, [
    viewport,
  ]);
  const setViewport = useCallback(
    (element: HTMLDivElement | null) => {
      moreCues(element);
      inlineCues(element);
      setViewportElement(element);
    },
    [moreCues, inlineCues]
  );
  return (
    <BaseScrollArea.Root data-slot="scroll-area" className={styles.root({ className })}>
      <BaseScrollArea.Viewport
        ref={setViewport}
        data-slot="scroll-area-viewport"
        className={styles.viewport()}
        {...(label != null && { role: 'region', 'aria-label': label })}
      >
        <BaseScrollArea.Content className={contentClassName}>{children}</BaseScrollArea.Content>
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
        </div>
      )}
      <BaseScrollArea.Scrollbar orientation="vertical" className={styles.scrollbar()}>
        <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar orientation="horizontal" className={styles.scrollbar()}>
        <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
