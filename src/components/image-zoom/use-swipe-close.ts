'use client';

import { type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react';

import { prefersReducedMotion, readZoomMotion } from './zoom-motion';

// 指で上下に引いて閉じる。拡大した画像は指について動き、後ろの面とキャプションは引いた分だけ薄くなる
//   離したとき、十分に引いた（または素早くはじいた）なら閉じる。閉じる動きは引いた位置から始まる（zoom-motion.ts）
//   足りなければ元の位置へ戻す
// 2 本目の指が触れたら（ピンチ）引くのをやめる。ピンチの拡大は端末（ブラウザ）の拡大に任せる
// 端末の拡大で大きくしているあいだは、1 本指の操作を画面を動かすほうに譲り、引いて閉じない
//   （touch-action を pinch-zoom から auto に戻す。切り替えは次に触れたときから効く）

/** これだけ引いたら閉じる（px）。画面の高さの 1/4 が小さければそちら */
const CLOSE_DISTANCE = 96;
/** これより速くはじいたら、距離が足りなくても閉じる（px/ms） */
const CLOSE_VELOCITY = 0.5;
/** 引いたとみなす距離。これより小さい動きは、押しただけ（閉じる操作）として扱う */
const DRAG_SLOP = 8;

interface SwipeCloseOptions {
  enabled: boolean;
  boxRef: RefObject<HTMLElement | null>;
  /** 引いた分だけ薄くするもの */
  fades: () => HTMLElement[];
  onClose: () => void;
}

export function useSwipeClose({ enabled, boxRef, fades, onClose }: SwipeCloseOptions) {
  const pinched = usePinched();
  const pointers = useRef(new Set<number>());
  // v は直前の動きの速さ（px/ms）。離したときの速さに使う
  const drag = useRef<{
    x: number;
    y: number;
    t: number;
    dy: number;
    v: number;
    active: boolean;
  } | null>(null);
  const moved = useRef(false);
  const active = enabled && !pinched;

  const apply = (dy: number) => {
    const box = boxRef.current;
    if (!box) return;
    box.style.translate = `0 ${dy}px`;
    const progress = Math.min(Math.abs(dy) / (box.offsetHeight || 1), 1);
    for (const el of fades()) el.style.opacity = String(1 - progress * 0.8);
  };

  const settle = (dy: number) => {
    const box = boxRef.current;
    if (!box) return;
    const { durationOut, easing } = readZoomMotion(box);
    const options = { duration: prefersReducedMotion() ? 0 : durationOut, easing };
    box.style.translate = '';
    box.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], options);
    for (const el of fades()) {
      const from = el.style.opacity;
      el.style.opacity = '';
      el.animate([{ opacity: from || 1 }, { opacity: 1 }], options);
    }
  };

  const cancel = () => {
    const current = drag.current;
    drag.current = null;
    if (current?.active) settle(current.dy);
  };

  const handlers = {
    onPointerDown(event: PointerEvent) {
      if (event.pointerType !== 'touch') return;
      pointers.current.add(event.pointerId);
      moved.current = false;
      if (!active || pointers.current.size > 1) {
        cancel();
        return;
      }
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        t: event.timeStamp,
        dy: 0,
        v: 0,
        active: false,
      };
    },
    onPointerMove(event: PointerEvent) {
      const current = drag.current;
      if (!current || event.pointerType !== 'touch') return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.active) {
        if (Math.abs(dy) < DRAG_SLOP || Math.abs(dy) < Math.abs(dx)) return;
        current.active = true;
        moved.current = true;
      }
      // 速さは、直前の動きから測る
      current.v = (dy - current.dy) / Math.max(event.timeStamp - current.t, 1);
      current.t = event.timeStamp;
      current.dy = dy;
      apply(dy);
    },
    onPointerUp(event: PointerEvent) {
      pointers.current.delete(event.pointerId);
      const current = drag.current;
      if (!current || event.pointerType !== 'touch') return;
      drag.current = null;
      if (!current.active) return;
      const dy = event.clientY - current.y;
      // 最後の動きから時間が空いた（止めてから離した）ときは、はじいていない
      const velocity = event.timeStamp - current.t > 100 ? 0 : Math.abs(current.v);
      const distance = Math.min(CLOSE_DISTANCE, window.innerHeight / 4);
      if (Math.abs(dy) >= distance || (velocity >= CLOSE_VELOCITY && Math.abs(dy) > DRAG_SLOP)) {
        apply(dy);
        onClose();
      } else {
        settle(dy);
      }
    },
    onPointerCancel(event: PointerEvent) {
      pointers.current.delete(event.pointerId);
      cancel();
    },
  };

  return {
    handlers,
    /** 引いたあとに来る click を、閉じる操作として数えない */
    consumeDrag() {
      const was = moved.current;
      moved.current = false;
      return was;
    },
    touchAction: active ? 'pinch-zoom' : 'auto',
  };
}

/** 端末の拡大（ピンチ）で、画面を大きくしているか */
function usePinched() {
  const [pinched, setPinched] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;
    const update = () => setPinched(viewport.scale > 1.01);
    update();
    viewport.addEventListener('resize', update);
    return () => viewport.removeEventListener('resize', update);
  }, []);
  return pinched;
}
