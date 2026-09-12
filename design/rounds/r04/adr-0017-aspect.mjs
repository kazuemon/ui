// ADR-0017 の比較画像用。カードの画像の比率を、ラウンド4まで使っていた 2:1 と 16:9 で並べる。

const common = { showNestedCard: true };

export default {
  round: 4,
  currentName: '2:1（ラウンド4まで）',
  currentDesc: common,
  candidates: [
    {
      id: 'A',
      slug: 'Aspect169',
      name: '16:9',
      intent: '',
      tokens: { ...common, card: { mediaAspect: '16 / 9' } },
    },
  ],
};
