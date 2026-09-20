'use client';

import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react';

/** シートの高さの段。content: 中身をすべて出したときの高さ、half: 半分の高さ、full: 高さの上限 */
export interface SheetMetrics {
  /** 中身をすべて出したときの高さ */
  content: number;
  /** 半分で開くときの高さ。最後の項目が半分だけ見えるところで切る（「まだ続きがある」ことを見せる） */
  half: number;
  /** 高さの上限 */
  full: number;
}

/** シートを開いたときの高さ。half: 選択肢が長いときは半分の高さで開き、つまみを出す。full: 高さいっぱいで開く */
export type SheetDetent = 'half' | 'full';

interface SheetDragOptions {
  /** 開くときの高さ（reset で戻す） */
  sheetDetent: SheetDetent;
  metrics: SheetMetrics | null;
  /** 選択肢が長く、半分の高さで開いてつまみを出すか */
  long: boolean;
  /** はじいて・引いて閉じるとき */
  onClose: () => void;
}

interface DragSample {
  y: number;
  t: number;
}

// シートのつまみを引く操作のしきい値。値は実機で詰める
// iOS・Android のシートと、vaul・Base UI の Drawer にならい、離す直前の速さで「はじいた」かを見る
//   flingVelocity: はじいたとみなす速さ（px/ms）。Base UI の Drawer は 0.5、vaul は 0.4、Android は 500px/s
//   velocityWindow: 離す直前のこの時間（ms）の動きから速さを出す。それより前から止まっていたら、はじいていない（Base UI は 80ms）
//   minVelocityDuration: 速さを出すときの時間の下限（ms）。動きの記録が1つしかないときに、速さが大きくなりすぎないようにする（Base UI は 16ms）
//   closeRatio: はじかずに離したとき、半分の高さのこの割合より低ければ閉じる
//   moveSlop: 動いた量がこれ以下（px）なら、引かずに押したとみなす
const SHEET_DRAG = {
  flingVelocity: 0.5,
  velocityWindow: 80,
  minVelocityDuration: 16,
  closeRatio: 0.6,
  moveSlop: 4,
} as const;

// 離したときの縦の速さ（px/ms。下向きが正）。離す直前 velocityWindow の間の動きから出す
function releaseVelocity(samples: DragSample[], y: number, t: number) {
  const first = samples.find((sample) => t - sample.t <= SHEET_DRAG.velocityWindow);
  if (!first) return 0;
  return (y - first.y) / Math.max(t - first.t, SHEET_DRAG.minVelocityDuration);
}

// シートのつまみを引く操作。選択肢が長いときだけ、半分の高さで開いてつまみを出す。つまみを引くと高さが変わり、下へはじくか下まで引くと閉じる
// Select と Menu（submenuSheet="fixed"）のシートが使う
export function useSheetDrag({ sheetDetent, metrics, long, onClose }: SheetDragOptions) {
  const [detent, setDetent] = useState<SheetDetent>(sheetDetent);
  // つまみを引いているあいだの高さ。はじいて・引いて閉じたときは、閉じる動きが終わるまで残し、離した高さのまま下へ滑らせる
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  // 引いているあいだは、高さの動き（transition）を止める
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    y: number;
    height: number;
    moved: boolean;
    samples: DragSample[];
  } | null>(null);

  const restingHeight =
    long && metrics
      ? detent === 'half'
        ? metrics.half
        : Math.min(metrics.content, metrics.full)
      : undefined;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (restingHeight === undefined) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      y: event.clientY,
      height: restingHeight,
      moved: false,
      samples: [{ y: event.clientY, t: event.timeStamp }],
    };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || !metrics) return;
    // 速さを出すための動きの記録。離す直前 velocityWindow の分だけ残す
    start.samples.push({ y: event.clientY, t: event.timeStamp });
    while (
      start.samples.length > 1 &&
      event.timeStamp - start.samples[0].t > SHEET_DRAG.velocityWindow
    ) {
      start.samples.shift();
    }
    const dy = event.clientY - start.y;
    if (!start.moved && Math.abs(dy) > SHEET_DRAG.moveSlop) {
      start.moved = true;
      setDragging(true);
    }
    if (start.moved) setDragHeight(Math.min(metrics.full, Math.max(0, start.height - dy)));
  };
  // 離したとき: はじいた（速さが flingVelocity 以上）ときは、その向きで、いまの高さの次の段へ動かす
  //   下へ: 半分より高ければ半分、半分以下なら閉じる（引いた距離が短くても閉じる）
  //   上へ: 半分より低ければ半分、半分以上なら高さいっぱい
  // はじかずに離したときは、半分の closeRatio より低ければ閉じ、それ以外は近い方の段に戻す
  // 閉じるときは、離した高さのまま、シートの閉じる動き（--duration-sheet・--ease-sheet）で下へ滑らせる
  // 動きを減らす設定では動きがない（motion-reduce）ので、すぐに閉じる
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    dragStart.current = null;
    setDragging(false);
    if (!start || !metrics) {
      setDragHeight(null);
      return;
    }
    // 離した高さは、離した位置から出す。state の dragHeight は、最後の動きがまだ描き直されていないと古い値のまま
    const dy = event.clientY - start.y;
    const moved = start.moved || Math.abs(dy) > SHEET_DRAG.moveSlop;
    const height = Math.min(metrics.full, Math.max(0, start.height - dy));
    // 引かずに押したときは、半分と高さいっぱいを切り替える
    if (!moved) {
      setDragHeight(null);
      setDetent(detent === 'half' ? 'full' : 'half');
      return;
    }
    const full = Math.min(metrics.content, metrics.full);
    const velocity =
      event.type === 'pointercancel'
        ? 0
        : releaseVelocity(start.samples, event.clientY, event.timeStamp);
    let target: SheetDetent | 'close';
    if (velocity >= SHEET_DRAG.flingVelocity) {
      target = height > metrics.half ? 'half' : 'close';
    } else if (velocity <= -SHEET_DRAG.flingVelocity) {
      target = height < metrics.half ? 'half' : 'full';
    } else if (height < metrics.half * SHEET_DRAG.closeRatio) {
      target = 'close';
    } else {
      target = Math.abs(height - metrics.half) <= Math.abs(height - full) ? 'half' : 'full';
    }
    if (target === 'close') {
      setDragHeight(height);
      onClose();
      return;
    }
    setDragHeight(null);
    setDetent(target);
  };

  return {
    /** シートの高さ。引いているあいだは引いた高さ、それ以外は段の高さ（選択肢が短いときは undefined） */
    sheetHeight: dragHeight ?? restingHeight,
    dragging,
    /** 開くときに、段を sheetDetent に戻し、残した高さを消す */
    reset: () => {
      setDetent(sheetDetent);
      setDragHeight(null);
    },
    /** 閉じる動きが終わったときに、残した高さを消す */
    clearDragHeight: () => setDragHeight(null),
    handlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
