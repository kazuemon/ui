// 前半（ムード探索）の最終結果。候補は持たず、ラウンド1〜4の決定をすべて反映した現行版だけを描く。

export default {
  round: '前半の結果',
  brief:
    '前半（ムード探索）の結果｜基準: 軽い・やわらかい・整然・人懐っこい\n\nラウンド1〜4の決定（ADR-0005〜0018）をすべて反映した現行版です。ボタン・入力欄・スイッチは実際に hover／押下／フォーカスできます。\n\n次は後半です。Storybook で、Disabled の見た目・フォーカス時の変化量・Danger の濃さ・和文の縦位置などを1軸ずつ詰めます。',
  note: '見本シートのピンクは、まだ旧規則（More・トグル・Mode）の置き方のままです。Secondary としての使い方は後半で部品ごとの既定の色と一緒に決めます。',
  currentIntent: 'ラウンド1〜4の決定をすべて反映した design/tokens.css。',
  currentDesc: {
    showNestedCard: true,
    shadow: { desc: '輪郭程度のごく薄い影' },
    motion: { desc: '素早く 1px 沈む' },
    tagDesc: '淡い水色の面＋濃い水色の文字',
    neutralDesc: '無彩色寄り',
    icon: { desc: 'テキストと並ぶときは Regular（16）、単体は Bold（24）' },
    radiusDesc: '部品 12・カード 16（入れ子の型も 16、余白 8）・小物 pill',
  },
  candidates: [],
};
