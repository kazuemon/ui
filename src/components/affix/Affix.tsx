import { useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type ReactElement, useRef } from 'react';

import type { AffixPosition } from './stuck';
import { useStuck } from './use-stuck';
import { tv } from '../../internal/tv';

// スクロールしても、スクロールする枠（なければ画面）の上か下の端に留まる枠 — 軸 158・159
//   CSS の sticky だけで留める。親（包むもの）の範囲の中でだけ留まり、親の終わりで一緒に流れていく
//   枠そのものは見た目を持たない（原則9）。記事の横の目次も、下の「上へ戻る」も、中身が自分の見た目を持つ
//   留まっているあいだは data-stuck を付ける。読むだけの計算は stuck.ts
//   surface: 内容が下を通る帯として使うとき。白い面を敷き、端から離さずに留める。
//     画面に貼り付いて内容が下を通るものは重なりとして扱う（原則1）ので、境目を付ける。境目の出し方は軸 158
//   端からの離れ（--affix-gap）は軸 159。Navbar を貼り付けたページでは belowNavbar で帯の下に留める
//   重なり順は、貼り付けた Navbar（z-10）より下、ページの内容より上
const affix = tv({
  base: [
    'sticky z-5',
    '[--affix-inset:calc(var(--affix-clearance,0px)+var(--affix-offset))]',
    '[--affix-offset:var(--affix-gap)]',
  ],
  variants: {
    position: {
      // flex・grid の中に直に置いても、行の高さいっぱいに伸びて留まれなくならないよう、端に寄せる
      top: 'top-(--affix-inset) self-start',
      bottom: 'bottom-(--affix-inset) self-end',
    },
    belowNavbar: {
      true: '[--affix-clearance:calc(var(--affix-navbar-height)+var(--border-width-thin))]',
      false: '',
    },
    surface: {
      true: [
        'bg-bg [--affix-offset:0px]',
        'transition-[border-color,box-shadow] duration-(--duration-fast)',
      ],
      // 面を持たないときは、枠の空いたところで下の内容を押せるようにする（押せるのは中身だけ）
      false: 'pointer-events-none *:pointer-events-auto',
    },
  },
  compoundVariants: [
    {
      surface: true,
      position: 'top',
      class: [
        'border-b-(length:--border-width-thin) border-(--affix-line)',
        'data-stuck:border-(--affix-line-stuck) data-stuck:shadow-(--affix-shadow-top-stuck)',
      ],
    },
    {
      surface: true,
      position: 'bottom',
      class: [
        'border-t-(length:--border-width-thin) border-(--affix-line)',
        'data-stuck:border-(--affix-line-stuck) data-stuck:shadow-(--affix-shadow-bottom-stuck)',
      ],
    },
  ],
  defaultVariants: { position: 'top', belowNavbar: false, surface: false },
});

export type { AffixPosition };

export interface AffixProps extends ComponentProps<'div'> {
  /**
   * 留まる端。top は上（記事の横の目次など）、bottom は下（「上へ戻る」など）です
   * @default 'top'
   */
  position?: AffixPosition;
  /**
   * 貼り付けた（sticky）Navbar の下に留めます。position が top のときだけ効きます。
   * Navbar を貼り付けていないページでは付けません
   * @default false
   */
  belowNavbar?: boolean;
  /**
   * 内容が下を通る帯として使います。白い面を敷き、端から離さずに留め、下の内容との境目を付けます。
   * 目次やボタンのように、中身が自分の見た目を持つときは付けません
   * @default false
   */
  surface?: boolean;
  /** 描く要素（Base UI の render と同じ）。aside・nav などにするときは `render={<aside />}` を渡します */
  render?: ReactElement;
}

/**
 * スクロールしても、画面（スクロールする枠）の上か下の端に留まる枠。包む要素の範囲の中でだけ留まります
 */
export function Affix({
  position = 'top',
  belowNavbar,
  surface,
  className,
  render,
  ...props
}: AffixProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stuck = useStuck(ref, position);
  return useRender({
    render,
    defaultTagName: 'div',
    ref,
    props: {
      ...props,
      'data-slot': 'affix',
      'data-position': position,
      'data-stuck': stuck ? '' : undefined,
      className: affix({ position, belowNavbar, surface, className }),
    },
  });
}
