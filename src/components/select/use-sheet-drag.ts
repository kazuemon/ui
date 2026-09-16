import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react';

import { type DragSample, releaseVelocity, SHEET_DRAG } from './measure';
import type { SheetMetrics } from './use-popup-layout';

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

// シートのつまみを引く操作。選択肢が長いときだけ、半分の高さで開いてつまみを出す。つまみを引くと高さが変わり、下へはじくか下まで引くと閉じる
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
    const height = dragHeight;
    setDragging(false);
    if (!start || !metrics) {
      setDragHeight(null);
      return;
    }
    // 引かずに押したときは、半分と高さいっぱいを切り替える
    if (!start.moved || height === null) {
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
