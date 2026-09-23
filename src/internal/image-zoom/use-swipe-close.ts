'use client';

import { type PointerEvent, type RefObject, useEffect, useRef, useState } from 'react';

import { prefersReducedMotion, readZoomMotion } from './zoom-motion';

// 指で上下に引いて閉じる。拡大した画像は指について動き、後ろの面とキャプションは引いた分だけ薄くなる
//   離したとき、十分に引いた（または素早くはじいた）なら閉じる。閉じる動きは引いた位置から始まる（zoom-motion.ts）
//   足りなければ元の位置へ戻す
// 送る先があるとき（Gallery）は、左右にはじいて前後の画像へ送る
//   縦と横は、動き始めた向きで 1 つに決める（斜めに引いても、閉じながら送ることはない）
//   横に引いているあいだは、画像だけが指について動く（後ろの面は薄くしない）。送る先がない向きへは、引いた距離の 1/3 だけ動く
//   離したとき、十分に引いた（または素早くはじいた）なら送る。送る動きは引いた位置から始まる（ImageZoomViewer の送る動き）
// 2 本目の指が触れたら（ピンチ）引くのをやめる。ピンチの拡大は端末（ブラウザ）の拡大に任せる
// 端末の拡大で大きくしているあいだは、1 本指の操作を画面を動かすほうに譲り、引いて閉じない・送らない
//   （touch-action を pinch-zoom から auto に戻す。切り替えは次に触れたときから効く）

/** これだけ引いたら閉じる・送る（px）。画面の高さ（送るときは幅）の 1/4 が小さければそちら */
const CLOSE_DISTANCE = 96;
/** これより速くはじいたら、距離が足りなくても閉じる・送る（px/ms） */
const CLOSE_VELOCITY = 0.5;
/** 引いたとみなす距離。これより小さい動きは、押しただけ（閉じる操作）として扱う */
const DRAG_SLOP = 8;
/** 送る先がない向きへ引いたときに、画像が指についていく割合 */
const EDGE_RESISTANCE = 1 / 3;

/** 左右にはじいて送る。-1 は前、1 は次 */
export interface SwipeNavigate {
  hasPrev: boolean;
  hasNext: boolean;
  onNavigate: (direction: -1 | 1) => void;
}

interface SwipeCloseOptions {
  enabled: boolean;
  boxRef: RefObject<HTMLElement | null>;
  /** 引いた分だけ薄くするもの */
  fades: () => HTMLElement[];
  onClose: () => void;
  /** 左右にはじいて送る（書かないときは送らない） */
  navigate?: SwipeNavigate;
}

export function useSwipeClose({ enabled, boxRef, fades, onClose, navigate }: SwipeCloseOptions) {
  const pinched = usePinched();
  const pointers = useRef(new Set<number>());
  // v は直前の動きの速さ（px/ms）。離したときの速さに使う。axis は動き始めた向き（決まるまでは null）
  const drag = useRef<{
    x: number;
    y: number;
    t: number;
    d: number;
    v: number;
    axis: 'x' | 'y' | null;
  } | null>(null);
  const moved = useRef(false);
  const closeActive = enabled && !pinched;
  const navigateActive = navigate != null && !pinched;

  const apply = (dy: number) => {
    const box = boxRef.current;
    if (!box) return;
    box.style.translate = `0 ${dy}px`;
    const progress = Math.min(Math.abs(dy) / (box.offsetHeight || 1), 1);
    for (const el of fades()) el.style.opacity = String(1 - progress * 0.8);
  };

  // 横に引いた分。送る先がない向きへは、少しだけ動かす
  const shiftOf = (dx: number) =>
    (dx > 0 && !navigate?.hasPrev) || (dx < 0 && !navigate?.hasNext) ? dx * EDGE_RESISTANCE : dx;
  const applyX = (dx: number) => {
    const box = boxRef.current;
    if (!box) return;
    box.style.translate = `${shiftOf(dx)}px 0`;
  };

  const settle = (d: number, axis: 'x' | 'y') => {
    const box = boxRef.current;
    if (!box) return;
    const { durationOut, easing } = readZoomMotion(box);
    const options = { duration: prefersReducedMotion() ? 0 : durationOut, easing };
    box.style.translate = '';
    const from = axis === 'y' ? `0 ${d}px` : `${shiftOf(d)}px 0`;
    box.animate([{ translate: from }, { translate: '0 0' }], options);
    if (axis === 'x') return;
    for (const el of fades()) {
      const opacity = el.style.opacity;
      el.style.opacity = '';
      el.animate([{ opacity: opacity || 1 }, { opacity: 1 }], options);
    }
  };

  const cancel = () => {
    const current = drag.current;
    drag.current = null;
    if (current?.axis) settle(current.d, current.axis);
  };

  const handlers = {
    onPointerDown(event: PointerEvent) {
      if (event.pointerType !== 'touch') return;
      pointers.current.add(event.pointerId);
      moved.current = false;
      if ((!closeActive && !navigateActive) || pointers.current.size > 1) {
        cancel();
        return;
      }
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        t: event.timeStamp,
        d: 0,
        v: 0,
        axis: null,
      };
    },
    onPointerMove(event: PointerEvent) {
      const current = drag.current;
      if (!current || event.pointerType !== 'touch') return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.axis) {
        const horizontal = Math.abs(dx) > Math.abs(dy);
        const distance = horizontal ? Math.abs(dx) : Math.abs(dy);
        if (distance < DRAG_SLOP) return;
        if (horizontal ? !navigateActive : !closeActive) return;
        current.axis = horizontal ? 'x' : 'y';
        moved.current = true;
      }
      const d = current.axis === 'x' ? dx : dy;
      // 速さは、直前の動きから測る
      current.v = (d - current.d) / Math.max(event.timeStamp - current.t, 1);
      current.t = event.timeStamp;
      current.d = d;
      if (current.axis === 'x') applyX(d);
      else apply(d);
    },
    onPointerUp(event: PointerEvent) {
      pointers.current.delete(event.pointerId);
      const current = drag.current;
      if (!current || event.pointerType !== 'touch') return;
      drag.current = null;
      if (!current.axis) return;
      const d = current.axis === 'x' ? event.clientX - current.x : event.clientY - current.y;
      // 最後の動きから時間が空いた（止めてから離した）ときは、はじいていない
      const velocity = event.timeStamp - current.t > 100 ? 0 : Math.abs(current.v);
      const size = current.axis === 'x' ? window.innerWidth : window.innerHeight;
      const distance = Math.min(CLOSE_DISTANCE, size / 4);
      const far =
        Math.abs(d) >= distance || (velocity >= CLOSE_VELOCITY && Math.abs(d) > DRAG_SLOP);
      if (current.axis === 'y') {
        if (far) {
          apply(d);
          onClose();
        } else {
          settle(d, 'y');
        }
        return;
      }
      // 左へはじくと次、右へはじくと前
      const direction = d < 0 ? 1 : -1;
      const reachable = direction === 1 ? navigate?.hasNext : navigate?.hasPrev;
      if (far && reachable && navigate) {
        applyX(d);
        navigate.onNavigate(direction);
      } else {
        settle(d, 'x');
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
    touchAction: closeActive || navigateActive ? 'pinch-zoom' : 'auto',
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
