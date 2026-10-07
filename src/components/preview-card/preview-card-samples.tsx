'use client';

import type { ReactNode } from 'react';

import { landscape, svg } from '../../samples/images';
import { Avatar } from '../avatar/Avatar';
import { PreviewCardBody, PreviewCardImage } from './PreviewCard';

// ストーリーと比較で使う、プレビューの中身の見本（部品そのものではない）

const favicon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#3ea8ff"/><path d="M9 22 L16 9 L23 22 Z" fill="#fff"/></svg>'
)}`;

const ogImage = svg(`
  <rect width="1600" height="900" fill="#e3f4fe"/>
  <rect x="120" y="300" width="1100" height="72" rx="36" fill="#7cc8fb"/>
  <rect x="120" y="420" width="760" height="72" rx="36" fill="#7cc8fb"/>
  <circle cx="1340" cy="660" r="100" fill="#fff6d6"/>
`);

/** LinkCard 風のプレビュー（画像・サイト・題・説明）。PreviewCard の cardVariant に従って画像を置く */
export function ArticlePreview() {
  return (
    <>
      <PreviewCardImage src={ogImage} alt="" />
      <PreviewCardBody>
        <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
          <img src={favicon} alt="" className="size-4 rounded-xs" />
          zenn.dev
        </p>
        <p className="text-body font-bold">候補を並べて選ぶループでデザインシステムを作る</p>
        <p className="line-clamp-2 text-body-sm text-fg-muted">
          原則とトークンを先に決め、Storybook に候補を並べて 1
          軸ずつ選んでいく進め方と、その記録の残し方について。
        </p>
      </PreviewCardBody>
    </>
  );
}

/** 人のプロフィール（アイコン・名前・ひとこと・数） */
export function ProfilePreview(): ReactNode {
  return (
    <PreviewCardBody className="gap-3">
      <div className="flex items-center gap-3">
        <Avatar name="かずえもん" src={landscape} alt="" size="lg" />
        <div className="flex min-w-0 flex-col">
          <p className="text-body font-bold">かずえもん</p>
          <p className="text-caption text-fg-subtle">@kazuemon</p>
        </div>
      </div>
      <p className="text-body-sm text-fg-muted">
        UI
        コンポーネントライブラリを作っています。デザインは、候補を並べて選ぶループで決めています。
      </p>
      <p className="flex gap-4 text-caption text-fg-subtle">
        <span>
          <b className="text-fg">128</b> フォロー中
        </span>
        <span>
          <b className="text-fg">2,431</b> フォロワー
        </span>
      </p>
    </PreviewCardBody>
  );
}
