// LinkCard の比較（後半の軸 115〜117）で共有する見本。軸 115〜117 は決定済み（ADR 未定）で、
// 比べていた見た目は props（layout・sitePlacement・titleLines・descriptionLines・favicon）に畳んだ。
// ADR を書いてこのファイルと比較のストーリーを消すまでの間、行の見た目を再現するためにこの props で渡す
import type { ComponentProps } from 'react';

import { LinkCard } from '../../src/components/link-card/LinkCard';
import { svg } from './samples/images';

const favicon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#3ea8ff"/><path d="M9 22 L16 9 L23 22 Z" fill="#fff"/></svg>'
)}`;

const ogImage = svg(`
  <rect width="1600" height="900" fill="#e3f4fe"/>
  <rect x="120" y="300" width="1100" height="72" rx="36" fill="#7cc8fb"/>
  <rect x="120" y="420" width="760" height="72" rx="36" fill="#7cc8fb"/>
  <circle cx="1340" cy="660" r="100" fill="#fff6d6"/>
`);

const base = {
  href: 'https://zenn.dev/kazuemon/articles/design-loop',
  title: '候補を並べて選ぶループでデザインシステムを作る',
  description:
    '原則とトークンを先に決め、Storybook に候補を並べて 1 軸ずつ選んでいく進め方と、その記録の残し方について。',
  favicon,
  image: ogImage,
} satisfies ComponentProps<typeof LinkCard>;

type Sample = 'full' | 'no-image' | 'new-tab' | 'no-image-new-tab' | 'long';

const samples: Record<Sample, ComponentProps<typeof LinkCard>> = {
  full: base,
  'no-image': { ...base, image: undefined },
  'new-tab': { ...base, target: '_blank' },
  'no-image-new-tab': { ...base, image: undefined, target: '_blank' },
  long: {
    ...base,
    title:
      'とても長い題のページへのリンクカードで、2 行を超えた分は最後に三点を付けて切り、カードの高さがそろうようにします',
    description:
      '説明も同じく決まった行数で切ります。OG の description は長いことが多いので、そのまま渡しても崩れないようにしています。ここまでは見えません。',
  },
};

type Width = 'article' | 'phone';

/**
 * 比較の 1 マスに置くリンクカード。article は記事の本文の幅、phone はスマートフォンの幅（指の密度）
 * layout・sitePlacement・titleLines・descriptionLines は、決まった軸（115〜117）を props で選ぶための引数。
 * favicon は渡した見本の favicon を出すか（false で消す）
 */
export function LinkCardSample({
  sample = 'full',
  width = 'article',
  layout,
  sitePlacement,
  showFavicon = true,
  titleLines,
  descriptionLines,
}: {
  sample?: Sample;
  width?: Width;
  layout?: ComponentProps<typeof LinkCard>['layout'];
  sitePlacement?: ComponentProps<typeof LinkCard>['sitePlacement'];
  showFavicon?: boolean;
  titleLines?: number;
  descriptionLines?: number;
}) {
  return (
    <div
      data-density={width === 'phone' ? 'coarse' : undefined}
      className={width === 'phone' ? 'w-[343px]' : 'w-[30rem]'}
    >
      <LinkCard
        {...samples[sample]}
        favicon={showFavicon ? samples[sample].favicon : undefined}
        layout={layout}
        sitePlacement={sitePlacement}
        titleLines={titleLines}
        descriptionLines={descriptionLines}
      />
    </div>
  );
}

/** storybook-addon-pseudo-states の指定。hover・フォーカスの列（data-preview）のカードに状態を当てる */
export const linkCardPseudo = {
  rootSelector: 'body',
  hover: ['[data-preview="hover"] [data-slot="link-card"]'],
  focusVisible: ['[data-preview="focus"] [data-slot="link-card"]'],
};
