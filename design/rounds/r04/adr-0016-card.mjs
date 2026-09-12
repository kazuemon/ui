// ADR-0016 の確認用。標準のカード 16 を固定し、画像を 16:9 にしたうえで、入れ子の型の外側の角丸を比べる。
//   node design/tools/compare.mjs design/rounds/r04 --spec design/rounds/r04/adr-0016-card.mjs --parts card ...

const common = { showNestedCard: true, card: { mediaAspect: '16 / 9' } };

export default {
  round: 4,
  currentName: '入れ子 16（標準と同じ）',
  currentDesc: common,
  candidates: [
    {
      id: 'A',
      slug: 'Nested14',
      name: '入れ子 14',
      intent: '',
      tokens: { ...common, radius: { nested: { card: 14 } } },
    },
    {
      id: 'B',
      slug: 'Nested12',
      name: '入れ子 12',
      intent: '',
      tokens: { ...common, radius: { nested: { card: 12 } } },
    },
  ],
};
