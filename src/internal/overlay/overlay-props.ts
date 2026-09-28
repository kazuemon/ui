import type { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps, RefObject } from 'react';

// 重なる部品（Dialog・AlertDialog・Drawer・Popover・Menu・Tooltip）が同じ名前・同じ型で持つ props の型 — ADR-0250・0251

/**
 * 裏を止めるか。true はほかの操作とページのスクロールを止め、false は止めません。
 * passive は裏を止めず、外を押しても閉じません
 */
export type OverlayModal = boolean | 'passive';

/**
 * 焦点を当てる要素。要素そのものか、要素の ref を渡します
 * （Base UI の initialFocus・finalFocus に渡す。false は「動かさない」）
 */
export type OverlayFocusTarget = HTMLElement | RefObject<HTMLElement | null> | false;

/** 面（Popup）に足す props。id・data-*・aria-*・イベント・ref を渡します */
export type PopupProps = ComponentProps<'div'>;

type BasePositionerProps = ComponentProps<typeof BasePopover.Positioner>;

/** 画面の端に当たったときの避け方 */
export type CollisionAvoidance = BasePositionerProps['collisionAvoidance'];

/** 浮かぶ部分の位置を決める要素（Positioner）に足す props */
export interface PositionerProps extends ComponentProps<'div'> {
  /** 位置の基準にする要素。書かないときは開く口（trigger） */
  anchor?: BasePositionerProps['anchor'];
  /** 画面の端に当たったとき、反対側に出すか・ずらすか */
  collisionAvoidance?: CollisionAvoidance;
  /** 基準の要素からの距離（px） */
  sideOffset?: BasePositionerProps['sideOffset'];
  /** そろえる辺に沿ったずらし（px） */
  alignOffset?: BasePositionerProps['alignOffset'];
  /** 画面の端との間に空ける距離（px） */
  collisionPadding?: BasePositionerProps['collisionPadding'];
  /** 基準の要素が画面から出ていくあいだも、面を画面の中に留めるか */
  sticky?: BasePositionerProps['sticky'];
  /** 位置の決め方（CSS の position） */
  positionMethod?: BasePositionerProps['positionMethod'];
}

/** autoFocus・returnFocus を Base UI の initialFocus・finalFocus の形に直す */
export function focusTargetRef(target: OverlayFocusTarget | undefined) {
  if (target === undefined) return undefined;
  if (target === false) return false;
  // 要素かどうかを先に nodeType で確かめる（current という名前の値を持つ要素を ref と取り違えない）。
  // instanceof HTMLElement は、サーバーで描くときに HTMLElement がなく、iframe の中の要素（別の realm）も通らない
  if ('nodeType' in target && target.nodeType === 1) return { current: target }; // 1 は Node.ELEMENT_NODE（Node もサーバーにはない）
  return 'current' in target ? target : { current: target };
}
