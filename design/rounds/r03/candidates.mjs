// 前半 ラウンド3: 現行版（ラウンド2でボタン・入力欄の角丸 12、押下の動き、ラベルの書式を採用）を親に、残りの軸を振る。
// 主題はカードの角丸。ユーザーの「入れ子のタイプだとちょっと過剰カモ。このタイプも選べるようにするのであれば、
// 下の角丸が丸すぎる気持ち」を受けて、標準のカード（画像を端まで）と、選べる型としての入れ子のカードを並べる。
// 入れ子の外側は 20 以下に抑える。副次的にアイコンの太さも振る。

const common = { showNestedCard: true };

export default {
  round: 3,
  note: 'ラウンド2でボタン・入力欄の角丸 12（C）、押下の動き（A）、ラベルの書式（現行版）を採用しました。今回の主題はカードの角丸です。上が標準のカード、下が選べる型の入れ子のカードです。アイコンの太さも変えています。',
  currentIntent:
    'ラウンド2までの決定を反映した design/tokens.css。カードは 16、入れ子の型は外側 16・内側 6。',
  currentDesc: {
    ...common,
    shadow: { desc: '輪郭程度のごく薄い影' },
    motion: { desc: '素早く 1px 沈む' },
    tagDesc: '淡い水色の面＋濃い水色の文字',
    neutralDesc: '無彩色寄り',
    icon: { desc: 'Regular（線幅 16）' },
    radiusDesc: 'ボタン・入力欄は 12 で統一。カードは未決',
  },
  candidates: [
    {
      id: 'A',
      slug: 'CardTight',
      name: 'カード 12',
      intent: 'カードもボタンと同じ 12 に揃える。角丸の段階を減らし、全体を一つの形でまとめる。',
      tokens: {
        ...common,
        radius: { card: 12, nested: { card: 16, inset: 6 } },
        radiusDesc: 'カードもボタン・入力欄と同じ 12',
        icon: { stroke: 12, desc: 'Light（線幅 12）' },
      },
    },
    {
      id: 'B',
      slug: 'CardSoft',
      name: 'カード 20',
      intent:
        'カードは部品より一段丸い 20。画像が端まで届く標準のカードで、マシュマロの柔らかさを包むものに残す。',
      tokens: {
        ...common,
        radius: { card: 20, nested: { card: 16, inset: 6 } },
        radiusDesc: '部品 12 → カード 20 の2段',
      },
    },
    {
      id: 'C',
      slug: 'CardRound',
      name: 'カード 24',
      intent:
        'ラウンド2の「用途で」と同じ 24。入れ子の型だけは外側を 18 に抑えて、下の角が丸くなりすぎないようにする。',
      tokens: {
        ...common,
        radius: { card: 24, nested: { card: 18, inset: 6 } },
        radiusDesc: '部品 12 → カード 24。入れ子の型は 18',
      },
    },
    {
      id: 'D',
      slug: 'CardNestedWide',
      name: '入れ子に余白',
      intent:
        '標準のカードは 16 のまま。入れ子の型は内側の余白を 8 に広げ、外側 20・画像 12 で同心を保つ。アイコンは太め。',
      tokens: {
        ...common,
        radius: { card: 16, nested: { card: 20, inset: 8 } },
        radiusDesc: 'カード 16。入れ子の型は余白 8 で同心',
        icon: { stroke: 24, desc: 'Bold（線幅 24）' },
      },
    },
  ],
};
