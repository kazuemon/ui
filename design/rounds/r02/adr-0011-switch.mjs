// ADR-0011 の比較画像用。ラウンド2で足したスイッチ OFF の輪郭と、元に戻した状態を並べる。
//   node design/tools/compare.mjs design/rounds/r02 --spec design/rounds/r02/adr-0011-switch.mjs ...

export default {
  round: 2,
  currentName: '輪郭なし（ラウンド1と同じ）',
  candidates: [
    {
      id: 'R2',
      slug: 'Outline',
      name: '輪郭あり（ラウンド2で追加）',
      intent: 'OFF のトラックに 3:1 の輪郭を付けた版。',
      tokens: { switchOffOutline: true },
    },
  ],
};
