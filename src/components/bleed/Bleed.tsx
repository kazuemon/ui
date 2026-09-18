import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ReactElement } from 'react';

import { tv } from '../../internal/tv';

// 本文の幅の外へ出す枠 — 軸 100
//   Container の左右の余白いっぱいまで、左右に同じだけ広げる。Container が画面いっぱいのとき（スマートフォンなど）は、画面の端まで広がる
//   Container が幅の上限で止まっているとき（広い画面）は、実際の余白ではなく本文の幅の 1/18 だけ広げる（prose で約 37px。余白は最大 48px）
//   出す幅は --bleed-gutter（design/tokens.css）。Container の --container-gutter は % を含み、読む要素の親の幅で解決されるので、
//     本文の中（Prose の中など）で読むと Container の余白と合わない。代わりに、本文の幅（Bleed の親の幅）から余白を逆算する
//   Bleed の親が本文の幅いっぱいにあることを前提にする（Container の直下、Prose の直下、Prose の中の div の直下）
//   見た目（色・線・角）を持たない。中の画像やコードの見た目はそのまま
const bleed = tv({
  base: '-mx-(--bleed-gutter)',
});

export interface BleedProps extends ComponentProps<'div'> {
  /** 描く要素（Base UI の render と同じ）。figure などにするときは `render={<figure />}` を渡します */
  render?: ReactElement;
}

/**
 * 画像やコードを、本文の幅の外（Container の左右の余白）まで広げる枠
 *
 * Container の中の本文（Prose の中など）に置きます。本文の幅いっぱいの要素の直下に置いてください。
 */
export function Bleed({ className, render, ...props }: BleedProps) {
  return useRender({
    render,
    defaultTagName: 'div',
    props: { ...props, 'data-slot': 'bleed', className: bleed({ className }) },
  });
}
