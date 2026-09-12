// 前半 ラウンド4: 前半で残った最後の軸、カードの角丸を決める。
// ユーザーの「入れ子カードは余白があると良さそう。角丸度合いは現行 or C かも。」を受けて、
// 入れ子の型は余白 8 に固定し（design/adr/0014）、標準のカードを 16〜24 の範囲に絞って比べる。
// 入れ子の型の画像の角丸は、外側 − 余白（同心）で決まる。
// 探索範囲が狭いので、候補は3案＋現行版にしている。

const common = { showNestedCard: true };

export default {
  round: 4,
  note: 'ラウンド3で入れ子の型の余白 8 を採用しました。前半で残っているのはカードの角丸だけです。標準のカード（上）と入れ子の型（下）の組み合わせを、現行版（16）と C（24）のあいだで比べてください。これが決まれば前半は終わりです。',
  currentIntent:
    'ラウンド3までの決定を反映した design/tokens.css。カード 16、入れ子の型も外側 16（余白 8・画像 8）。',
  currentDesc: {
    ...common,
    shadow: { desc: '輪郭程度のごく薄い影' },
    motion: { desc: '素早く 1px 沈む' },
    tagDesc: '淡い水色の面＋濃い水色の文字',
    neutralDesc: '無彩色寄り',
    icon: { desc: 'Regular（線幅 16）' },
    radiusDesc: '部品 12。カードは未決',
  },
  candidates: [
    {
      id: 'A',
      slug: 'Card24',
      name: 'カード 24',
      intent:
        'ラウンド3の C。標準のカードは 24、入れ子の型は外側を 18 に抑え、余白 8 で画像は 10。',
      tokens: {
        ...common,
        radius: { card: 24, nested: { card: 18 } },
        radiusDesc: '部品 12 → カード 24。入れ子の型は 18',
      },
    },
    {
      id: 'B',
      slug: 'Card20',
      name: 'カード 20',
      intent: '現行版と C のあいだ。標準のカードは 20、入れ子の型は外側 18・画像 10。',
      tokens: {
        ...common,
        radius: { card: 20, nested: { card: 18 } },
        radiusDesc: '部品 12 → カード 20。入れ子の型は 18',
      },
    },
    {
      id: 'C',
      slug: 'Card16Soft',
      name: 'カード 16・入れ子 20',
      intent:
        '標準のカードは現行版の 16 のまま。入れ子の型だけ外側 20・画像 12 にして、画像の角もしっかり丸める。',
      tokens: {
        ...common,
        radius: { card: 16, nested: { card: 20 } },
        radiusDesc: 'カード 16。入れ子の型は 20',
      },
    },
  ],
};
