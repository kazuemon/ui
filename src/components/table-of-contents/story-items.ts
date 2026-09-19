import { useId } from 'react';

// ストーリーで使う見出しの一覧（部品ではない）。場面は story-scenes.tsx

export type Level = 2 | 3 | 4;

/** 段を 2〜4 に絞った見出し */
export interface SceneItem {
  id: string;
  text: string;
  level: Level;
}

/** 見本の記事の見出し（id・文字・段） */
export const articleHeadings: [id: string, text: string, level: Level][] = [
  ['intro', 'はじめに', 2],
  ['tokens', 'トークンの層', 2],
  ['role-tokens', '役割のトークン', 3],
  ['part-tokens', '部品のトークン', 3],
  ['density', '密度の切り替え', 2],
  ['pointer', 'マウスと指で変わるもの', 3],
  ['motion', '動きの手応え', 2],
  ['reading', '読みやすさ', 2],
  ['type-size', '文字の大きさ', 3],
  ['heading-steps', '見出しの段', 4],
  ['summary', 'まとめ', 2],
];

/** 長い目次の見本（見出しが多い記事） */
export const longHeadings: [id: string, text: string, level: Level][] = Array.from(
  { length: 8 },
  (_, i): [string, string, Level][] => [
    [`chapter-${i + 1}`, `第 ${i + 1} 章 部品の決め方`, 2],
    [`chapter-${i + 1}-a`, '原則を読む', 3],
    [`chapter-${i + 1}-b`, '候補を並べて選ぶ', 3],
  ]
).flat();

/** 見出しの一覧に、場面ごとの id を付ける（同じページに場面を 2 つ並べても、隣の場面の見出しを読まないように） */
export function useSceneItems(headings: [string, string, Level][] = articleHeadings) {
  const prefix = useId();
  const items: SceneItem[] = headings.map(([id, text, level]) => ({
    id: `${prefix}-${id}`,
    text,
    level,
  }));
  return items;
}
