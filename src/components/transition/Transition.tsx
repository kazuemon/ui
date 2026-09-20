'use client';

import { useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type ReactElement, useRef } from 'react';

import { tv } from '../../internal/tv';
import { useTransitionStatus } from './use-transition-status';
import { type TransitionPreset, useUIConfig } from '../../internal/ui-config';

// 利用者の中身に付ける出入りの動き。浮かぶ面（popup-styles.ts）と同じ仕組み（data-starting-style・data-ending-style）で動かす
// 値は design/tokens.css の --transition-*（既定は浮かぶ面の --popup-* と同じ長さと緩急）
//   出るときは、出はじめの姿（濃さ 0、ずれ・大きさ）から定位置へ。消えるときは同じ姿へ戻る
//   形（preset）は --transition-from-shift（下へのずれ）・--transition-from-scale（はじめの大きさ）を置き換えるだけ
//   collapse は高さを 0 から中身の高さまで動かす（測った高さを --transition-height に書く）
//   弾ませない（原則3）。動きを減らす設定では動かさず、すぐに出す・消す
const transition = tv({
  base: [
    '[transition-property:opacity,translate,scale,height] duration-(--transition-duration-enter) ease-(--transition-ease-enter)',
    'data-ending-style:duration-(--transition-duration-exit) data-ending-style:ease-(--transition-ease-exit)',
    'data-ending-style:opacity-0 data-starting-style:opacity-0',
    'data-ending-style:[translate:0_var(--transition-from-shift)] data-starting-style:[translate:0_var(--transition-from-shift)]',
    'data-ending-style:scale-(--transition-from-scale) data-starting-style:scale-(--transition-from-scale)',
    'motion-reduce:[transition:none]',
  ],
  variants: {
    preset: {
      // 書かないとき。出方はトークン（--transition-shift・--transition-scale）で決まる
      auto: '[--transition-from-scale:var(--transition-scale)] [--transition-from-shift:var(--transition-shift)]',
      fade: '[--transition-from-scale:1] [--transition-from-shift:0px]',
      'fade-up':
        '[--transition-from-scale:1] [--transition-from-shift:var(--transition-preset-shift)]',
      'fade-down':
        '[--transition-from-scale:1] [--transition-from-shift:calc(var(--transition-preset-shift)*-1)]',
      scale:
        '[--transition-from-scale:var(--transition-preset-scale)] [--transition-from-shift:0px]',
      collapse: [
        '[--transition-from-scale:1] [--transition-from-shift:0px]',
        'h-(--transition-height) overflow-hidden data-ending-style:h-0 data-starting-style:h-0',
      ],
    },
  },
  defaultVariants: { preset: 'auto' },
});

export type { TransitionPreset };

export interface TransitionProps extends Omit<ComponentProps<'div'>, 'hidden'> {
  /** 出しているか。false にすると消える動きのあとで消します */
  show: boolean;
  /**
   * 出方。fade は濃さだけ、fade-up は下から上へ、fade-down は上から下へ、scale は少し小さい姿から、collapse は高さを 0 から伸ばします
   * 書かないときは ThemeProvider の transitionPreset、それもなければ @kazuemon/ui の浮かぶ面と同じ出方（下から上へ）です
   */
  preset?: TransitionPreset;
  /**
   * 消えたあとも DOM に残します（hidden で隠します）。中の入力の値を保ちたいときに使います
   * @default false
   */
  keepMounted?: boolean;
  /**
   * 描きはじめたときにも出る動きを付けます。一覧に足した項目のように、show を true のまま描くときに使います
   * @default false
   */
  appear?: boolean;
  /** 消える動きが終わったときに呼びます。一覧から項目を外すのは、ここで行います */
  onExitComplete?: () => void;
  /** 描く要素（Base UI の render と同じ）。既定は div です。一覧の中では li を渡します */
  render?: ReactElement;
}

/**
 * 自分で作った中身に、@kazuemon/ui の浮かぶ面と同じ出入りの動きを付けます。
 * show を切り替えると、出るときはふわっと現れ、消えるときは動きが終わってから消します。
 * 動きを減らす設定では、動かさずにすぐ出す・消します
 */
export function Transition({
  show,
  preset: presetProp,
  keepMounted = false,
  appear = false,
  onExitComplete,
  render,
  className,
  style,
  ref: refProp,
  ...props
}: TransitionProps) {
  const config = useUIConfig();
  const preset = presetProp ?? config.transitionPreset;
  const ref = useRef<HTMLDivElement>(null);
  const collapse = preset === 'collapse';
  const status = useTransitionStatus(show, ref, {
    appear,
    // collapse: 中身の高さを測って書く。出ている間は高さを決めない（中身が変わっても伸び縮みする）
    beforeEnter: collapse ? (el) => setHeight(el, `${el.scrollHeight}px`) : undefined,
    beforeExit: collapse
      ? (el) => {
          setHeight(el, `${el.scrollHeight}px`);
          // 高さを px にした姿を一度計算させてから、0 へ動かす
          void el.offsetHeight;
        }
      : undefined,
    onEntered: collapse ? (el) => setHeight(el, null) : undefined,
    onExited: onExitComplete,
  });
  const element = useRender({
    render,
    defaultTagName: 'div',
    ref: refProp ? [ref, refProp] : ref,
    props: {
      ...props,
      style,
      'data-slot': 'transition',
      'data-preset': preset,
      'data-open': status === 'starting' || status === 'open' ? '' : undefined,
      'data-closed': status === 'ending' || status === 'closed' ? '' : undefined,
      'data-starting-style': status === 'starting' ? '' : undefined,
      'data-ending-style': status === 'ending' ? '' : undefined,
      hidden: status === 'closed' ? true : undefined,
      className: transition({ preset: preset ?? 'auto', className }),
    },
  });
  if (status === 'closed' && !keepMounted) return null;
  return element;
}

function setHeight(element: HTMLElement, value: string | null) {
  if (value == null) element.style.removeProperty('--transition-height');
  else element.style.setProperty('--transition-height', value);
}
