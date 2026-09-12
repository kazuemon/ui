// ADR-0018 の比較画像用。アイコン単体（検索のアイコンボタン）の線幅だけを変えて並べる。
// テキストと並ぶアイコン（Select の矢印など）はどちらも Regular。

export default {
  round: 4,
  currentName: 'すべて Regular（ADR-0015）',
  candidates: [
    {
      id: 'A',
      slug: 'StandaloneBold',
      name: 'アイコン単体だけ Bold',
      intent: '',
      tokens: { icon: { standalone: 24 } },
    },
  ],
};
