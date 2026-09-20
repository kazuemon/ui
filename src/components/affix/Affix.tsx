'use client';

import { useRender } from '@base-ui/react/use-render';
import { type ComponentProps, type ReactElement, useRef } from 'react';

import type { AffixPosition } from './stuck';
import { useStuck } from './use-stuck';
import { tv } from '../../internal/tv';

// スクロールしても、スクロールする枠（なければ画面）の上か下の端に留まる枠
//   CSS の sticky だけで留める。親（包むもの）の範囲の中でだけ留まり、親の終わりで一緒に流れていく
//   枠そのものは見た目を持たない（原則9）。記事の横の目次も、下の「上へ戻る」も、中身が自分の見た目を持つ
//   留まっているあいだは data-stuck を付ける。読むだけの計算は stuck.ts
//   surface: 内容が下を通る帯として使うとき。白い面を敷き、端から離さずに留める。
//     画面に貼り付いて内容が下を通るものは重なりとして扱う（原則1）ので、境目を付ける
//     surfaceEdge: line（既定）は留まったときだけ細い線、shadow は留まったときだけ淡い影（Navbar の stickyEdge と同じ影）、
//       always-line は留まる前からいつも細い線（ADR-0175）
//   端からの離れ（--affix-gap）は 24px。ページのレイアウトに合わせて、使う側が className か CSS で上書きする（ADR-0176）
//   Navbar を貼り付けたページでは belowNavbar で帯の下に留める
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
    surfaceEdge: { line: '', shadow: '', 'always-line': '' },
  },
  compoundVariants: [
    // 境目は内容の側に付ける。上に留まる帯は下へ、下に留まる帯は上へ
    {
      surface: true,
      position: 'top',
      class: 'border-b-(length:--border-width-thin) [--affix-shadow:var(--affix-shadow-top)]',
    },
    {
      surface: true,
      position: 'bottom',
      class: 'border-t-(length:--border-width-thin) [--affix-shadow:var(--affix-shadow-bottom)]',
    },
    { surface: true, surfaceEdge: 'line', class: 'border-transparent data-stuck:border-line' },
    {
      surface: true,
      surfaceEdge: 'shadow',
      class: 'border-transparent data-stuck:shadow-(--affix-shadow)',
    },
    { surface: true, surfaceEdge: 'always-line', class: 'border-line' },
  ],
  defaultVariants: { position: 'top', belowNavbar: false, surface: false, surfaceEdge: 'line' },
});

export type { AffixPosition };
export type AffixSurfaceEdge = 'line' | 'shadow' | 'always-line';

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
  /**
   * surface のときの、下の内容との境目。line は留まっているあいだだけ細い線、
   * shadow は留まっているあいだだけ淡い影、always-line は留まる前からいつも細い線です。
   * surface を付けないときは効きません
   * @default 'line'
   */
  surfaceEdge?: AffixSurfaceEdge;
  /** 描く要素（Base UI の render と同じ）。aside・nav などにするときは `render={<aside />}` を渡します */
  render?: ReactElement;
}

/**
 * スクロールしても、画面（スクロールする枠）の上か下の端に留まる枠。包む要素の範囲の中でだけ留まります。
 * 面を持たないとき、端からは `--affix-gap`（既定 24px）離れます。ページのレイアウトに合わせて変えるときは、
 * `className="[--affix-gap:--spacing(4)]"` のように上書きするか、CSS で `--affix-gap` を定めます
 */
export function Affix({
  position = 'top',
  belowNavbar,
  surface,
  surfaceEdge = 'line',
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
      className: affix({ position, belowNavbar, surface, surfaceEdge, className }),
    },
  });
}
