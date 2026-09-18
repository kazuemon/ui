import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { type ReactNode, type Ref, useCallback, useImperativeHandle, useState } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import { useMoreCues } from '../../internal/sheet/use-more-cues';
import { tv } from '../../internal/tv';
import { useInlineCues } from './use-inline-cues';

// スクロールする枠 — 軸 93
//   続きがあることは、端に落とす内側の影で見せる（原則1）。文字やぼかしでは知らせない
//   影は Select の浮かぶ選択肢・シートと同じ見た目と計算（SheetMoreCue・useMoreCues）。濃さはスクロールした量に合わせる
//   横にスクロールするときは、左右の端にも同じ影を落とす（useInlineCues）
//   つまみは中身の上に重ねる細い棒（3:1 の輪郭のグレー）。影があるときは、枠に載せたとき・スクロールしているあいだ・
//   キーボードで止まったときに出す（scrollbar="always" でいつも出す）。影がないときは、続きを伝えるためにいつも出す
//   つまみは見えている形がそのまま押せる範囲。帯（Scrollbar）は押せず、帯の上を押すと下の中身に届く
//   つまみそのものに載せると、枠の内側へ太くなる（膨らんだ姿がそのままつかめる範囲）。つかんで動かすあいだも太いまま
//   キーボードでは、スクロールできるときだけ枠（Viewport）に Tab で止まり、矢印キーでスクロールする。フォーカスの線は focusRing
const scrollArea = tv({
  slots: {
    root: [
      'group/scroll-area relative flex min-h-0 flex-col rounded-[inherit]',
      // 外（Select の浮かぶ選択肢など）の影の位置と濃さを受け継がない。濃さはスクロールする要素が書き直す
      '[--cue-bottom:0] [--cue-left:0px] [--cue-right:0px] [--cue-top:0] [--cue-x-end:0] [--cue-x-start:0]',
    ],
    viewport: [
      // ブラウザのスクロールバーは Base UI が隠す。スクロールできない向きに溝を出さないよう、overflow は auto にする
      'min-h-0 flex-auto [overflow:auto]! rounded-[inherit] outline-none',
      ...focusRing,
      'transition-[outline-color,outline-offset] duration-(--focus-ring-duration)',
    ],
    // 影を描く層。枠の角丸で切る（カードの端まで届かせたときに、角から影がはみ出さない）
    edges: 'pointer-events-none absolute inset-0 z-1 overflow-hidden rounded-[inherit]',
    edgeX: ['absolute top-0 bottom-0 w-3 from-(color:--color-sheet-edge-shadow) to-transparent'],
    scrollbar: [
      // 帯は膨らんだつまみの太さにし、端から --scroll-area-thumb-inset 離す（margin。押せる範囲に入れない）
      // 帯そのものは押せない（pointer-events-none）。押せるのはつまみだけ
      'group/bar pointer-events-none z-2 m-(--scroll-area-thumb-inset) flex transition-opacity duration-(--duration-normal)',
      'data-[orientation=vertical]:w-(--scroll-area-thumb-size-hover)',
      'data-[orientation=horizontal]:h-(--scroll-area-thumb-size-hover)',
    ],
    // つまみは帯の外側の辺に寄せ、太くなるときは枠の内側へ伸ばす
    //   載せたとき（hover）とつかんでいるあいだ（active。ポインタを捕まえているので、つまみの外へ出ても続く）に太くする
    //   カーソルは、載せたときにつかめる手、つかんでいるあいだは握った手にする
    thumb: [
      'pointer-events-auto cursor-grab rounded-pill bg-(--scroll-area-thumb-color) active:cursor-grabbing',
      '[--thumb-size:var(--scroll-area-thumb-size)] hover:[--thumb-size:var(--scroll-area-thumb-size-hover)] active:[--thumb-size:var(--scroll-area-thumb-size-hover)]',
      'data-[orientation=vertical]:ms-auto data-[orientation=vertical]:w-(--thumb-size)',
      'data-[orientation=vertical]:transition-[width] data-[orientation=vertical]:duration-(--duration-fast)',
      'data-[orientation=horizontal]:mt-auto data-[orientation=horizontal]:h-(--thumb-size)',
      'data-[orientation=horizontal]:transition-[height] data-[orientation=horizontal]:duration-(--duration-fast)',
      'motion-reduce:transition-none',
    ],
  },
  variants: {
    scrollbar: {
      // ふだんは隠す。枠に載せたとき・スクロール中・キーボードで止まったときに出す
      // 隠れているあいだは、つまみも押せない（指で端を触ってもつまみをつかまず、中身がスクロールする）
      scroll: {
        scrollbar: [
          'opacity-0 data-hovering:opacity-100 data-scrolling:opacity-100 data-scrolling:duration-0',
          'group-has-[[data-slot=scroll-area-viewport]:focus-visible]/scroll-area:opacity-100',
          // ストーリーの hover の固定（pseudo-states）でも出す
          'group-hover/scroll-area:opacity-100',
        ],
        thumb:
          'pointer-events-none group-data-hovering/bar:pointer-events-auto group-data-scrolling/bar:pointer-events-auto',
      },
      always: { scrollbar: 'opacity-100' },
    },
  },
  defaultVariants: { scrollbar: 'scroll' },
});

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
  const styles = scrollArea({ scrollbar: edgeShadow ? scrollbar : 'always' });
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
