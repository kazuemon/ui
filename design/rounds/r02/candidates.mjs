// 前半 ラウンド2: 現行版（ラウンド1で A の中立色・影・タグを採用）を親に、未決の軸だけを振る。
// 主題は角丸の「使い分け」の規則。ユーザーの「角丸はマシュマロも好き、使い分けができるといい」を受けて、
// 使い分けの解釈を4通り用意した。副次的に、ラベルの書式・押下の動き・アイコンの太さも少しずつ振る。

export default {
  round: 2,
  note: 'ラウンド1で A の中立色・影・タグを採用し、現行版に反映しました。今回の主題は角丸の使い分けです。4つの規則を比べてください。ラベルの書式・押下の動き・アイコンの太さも少しずつ変えています。',
  currentIntent:
    'ラウンド1の決定（A の中立色・影・タグ）を反映した design/tokens.css。角丸は旧来の 10 / 16 / pill。',
  currentDesc: {
    shadow: { desc: '輪郭程度のごく薄い影' },
    tagDesc: '淡い水色の面＋濃い水色の文字',
    neutralDesc: '無彩色寄り',
    icon: { desc: 'Regular（線幅 16）' },
  },
  candidates: [
    {
      id: 'A',
      slug: 'ByRole',
      name: '用途で',
      intent:
        '操作する部品（ボタン・入力欄）は締め、まとまりを包むカードだけ大きく丸める。マシュマロの丸さを「包むもの」に限定する案。',
      tokens: {
        radius: { button: 8, field: 8, card: 24 },
        radiusDesc: '用途で分ける',
        label: { transform: 'none', style: 'normal', weight: 800, size: 22, tracking: '0' },
        motion: {
          duration: 100,
          ease: 'cubic-bezier(0.2, 0, 0, 1)',
          depth: 1,
          desc: '素早く 1px 沈む',
        },
      },
    },
    {
      id: 'B',
      slug: 'BySize',
      name: '大きさで',
      intent:
        '角丸を高さの約 1/3 に比例させる。指の密度では丸く、マウスの密度では締まるので、2つの密度で同じ形に見える。',
      tokens: {
        radius: { card: 20, coarse: { button: 14, field: 14 }, fine: { button: 11, field: 11 } },
        radiusDesc: '大きさに比例（高さの約 1/3）',
        label: {
          transform: 'uppercase',
          style: 'normal',
          weight: 800,
          size: 20,
          tracking: '0.12em',
        },
        motion: {
          duration: 220,
          ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          depth: 2,
          scale: 0.97,
          desc: '縮んで弾む（オーバーシュート）',
        },
        icon: { stroke: 12, desc: 'Light（線幅 12）' },
      },
    },
    {
      id: 'C',
      slug: 'Nested',
      name: '入れ子で',
      intent:
        '内側の角丸＝外側の角丸 − 余白。カードの画像も内側に角丸で収め、外と内の輪郭を同心にする。ラベルはピンクのイタリック。',
      tokens: {
        radius: { button: 12, field: 12, card: 24, media: 16, mediaInset: 8 },
        radiusDesc: '入れ子で同心（内側 = 外側 − 余白）',
        label: {
          transform: 'none',
          style: 'italic',
          weight: 800,
          size: 22,
          tracking: '0',
          color: 'fgAccent',
          sectionColor: 'fgAccent',
        },
        motion: {
          duration: 140,
          ease: 'cubic-bezier(0.3, 1.3, 0.6, 1)',
          depth: 2,
          desc: '少し弾んで 2px 沈む',
        },
      },
    },
    {
      id: 'D',
      slug: 'ByPressable',
      name: '押せるかで',
      intent:
        '押せるボタンだけを丸くし、入力欄とカードは締める。形を見るだけで「押せる」が分かる（原則1の影と同じ役割を形でも担う）。',
      tokens: {
        radius: { field: 8, card: 12, coarse: { button: 18 }, fine: { button: 14 } },
        radiusDesc: '押せるかどうかで分ける',
        label: {
          transform: 'uppercase',
          style: 'normal',
          weight: 800,
          size: 20,
          tracking: '0.04em',
        },
        motion: {
          duration: 90,
          ease: 'cubic-bezier(0.2, 0, 0, 1)',
          depth: 1,
          desc: '短く 1px 沈む',
        },
        icon: { stroke: 12, desc: 'Light（線幅 12）' },
      },
    },
  ],
};
