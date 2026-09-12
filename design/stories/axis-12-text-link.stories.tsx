import type { Meta, StoryObj } from '@storybook/react-vite';

import { Link } from '../../src/components/Link';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 12: 文字のリンクの見た目（principles.md 原則3・8、design/adr/0027・0028）。4回目
// 変えるのは下線のトークンと、hover で濃くする割合、下線の動きだけ
//   文字の下線: --link-decoration、--link-decoration-hover、--link-underline-width、--link-underline-width-hover、
//     --color-link-underline、--color-link-underline-hover
//   濃くする割合: --link-hover-darken
//   背景に描く下線（F1〜F4）: --link-base-line-size（ふだんの線）、--link-grow-size-rest・--link-grow-size-hover、
//     --link-grow-pos-rest・--link-grow-pos-hover（hover で伸びる線の大きさと位置）、
//     --link-grow-alpha-rest・--link-grow-alpha-hover（伸びる線の濃さ）、--link-grow-duration、--color-link-grow
// 背景を敷かないこと（ADR-0027）、指定しないときの色（グレー、ADR-0028）、押下で 1px 沈むことは変えない
// 伸びる線は、ふだんの線と上の端をそろえ、下へ太くする（位置の縦は calc(100% + 1px)）

const pale = 'color-mix(in oklab, currentColor 35%, transparent)';
const below = 'calc(100% + 1px)';
// 下線だけを文字より濃くする（文字の色に黒を混ぜる）。行に書く値なので、リンクの色は currentColor で参照する
const darker = (percent: number) => `color-mix(in oklab, currentColor, black ${percent}%)`;

// 現行版の値。どの案もこれをもとにする
const current = {
  '--link-decoration': 'underline',
  '--link-decoration-hover': 'underline',
  '--link-underline-width': '1px',
  '--link-underline-width-hover': '1px',
  '--color-link-underline': 'currentColor',
  '--color-link-underline-hover': 'currentColor',
  '--link-hover-darken': '0%',
  '--link-base-line-size': '100% 0px',
  '--link-grow-size-rest': '100% 0px',
  '--link-grow-size-hover': '100% 0px',
  '--link-grow-pos-rest': '0 100%',
  '--link-grow-pos-hover': '0 100%',
  '--link-grow-alpha-rest': '100%',
  '--link-grow-alpha-hover': '100%',
  '--link-grow-duration': '0ms',
  '--link-grow-ease': 'var(--ease-press)',
  '--color-link-grow': 'currentColor',
};

// F1〜F4: 文字の下線をやめ、ふだんの 1px の線を背景に描く。hover で伸びる線を重ねる
const drawn = {
  ...current,
  '--link-decoration': 'none',
  '--link-decoration-hover': 'none',
  '--link-base-line-size': '100% 1px',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いつも下線、hover で変わらない',
    intent:
      'リンクの部品を作ったときの仮の見た目。文字の色で 1px の下線。hover では何も変わらない。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '変わらない'],
    ],
    tokens: current,
  },
  {
    id: 'A',
    name: 'hover で下線が太く',
    intent: '下線はいつも文字の色で 1px。hover で 2px に一気に太くなる。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '2px に太く（動きなし）'],
    ],
    tokens: { ...current, '--link-underline-width-hover': '2px' },
  },
  {
    id: 'F1',
    name: 'A＋なめらかに下へ太く',
    intent:
      'hover で、下線のすぐ下にもう1本の 1px の線が、透明から文字の色へ濃くなる。下へ向かって、なめらかに 2px に太って見える。変化が一瞬で終わらないよう、ほかより長く（300ms）、ゆっくり始めてゆっくり終える。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '下に 1px 足す線が濃くなる（300ms・ゆっくり始まり、ゆっくり終わる）'],
    ],
    tokens: {
      ...drawn,
      '--link-grow-size-rest': '100% 1px',
      '--link-grow-size-hover': '100% 1px',
      '--link-grow-pos-rest': `0 ${below}`,
      '--link-grow-pos-hover': `0 ${below}`,
      '--link-grow-alpha-rest': '0%',
      '--link-grow-alpha-hover': '100%',
      '--link-grow-duration': '300ms',
      // 押下の動き（最初に一気に変わる）だと、濃さの変化が一瞬で終わって見えるため、ゆっくり始めてゆっくり終える
      '--link-grow-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  {
    id: 'F2',
    name: 'A＋左から引かれる',
    intent: 'hover で、2px の線が左から右へ引かれる。線は下へ太る。離すと、左へ戻る。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '2px の線が左から（250ms）'],
    ],
    tokens: {
      ...drawn,
      '--link-grow-size-rest': '0% 2px',
      '--link-grow-size-hover': '100% 2px',
      '--link-grow-pos-rest': `0 ${below}`,
      '--link-grow-pos-hover': `0 ${below}`,
      '--link-grow-duration': '250ms',
    },
  },
  {
    id: 'F3',
    name: 'A＋中央から広がる',
    intent: 'hover で、2px の線が中央から左右へ広がる。線は下へ太る。離すと、中央へ縮む。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '2px の線が中央から（250ms）'],
    ],
    tokens: {
      ...drawn,
      '--link-grow-size-rest': '0% 2px',
      '--link-grow-size-hover': '100% 2px',
      '--link-grow-pos-rest': `50% ${below}`,
      '--link-grow-pos-hover': `50% ${below}`,
      '--link-grow-duration': '250ms',
    },
  },
  {
    id: 'F4',
    name: 'A＋左から引かれ、右へ抜ける',
    intent: 'hover で、2px の線が左から引かれる。線は下へ太る。離すと、右へ抜けて消える。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '左から引かれ、右へ抜ける（250ms）'],
    ],
    tokens: {
      ...drawn,
      '--link-grow-size-rest': '0% 2px',
      '--link-grow-size-hover': '100% 2px',
      '--link-grow-pos-rest': `100% ${below}`,
      '--link-grow-pos-hover': `0 ${below}`,
      '--link-grow-duration': '250ms',
    },
  },
  {
    id: 'B',
    name: '淡い下線、hover で濃く',
    intent:
      '下線をいつも淡く（文字の色を 35%）引く。参照画像の「もっと知りたい」に近い。hover で下線が文字の色になる。',
    spec: [
      ['下線', '文字の色を 35%・1px'],
      ['hover', '下線が文字の色に'],
    ],
    tokens: { ...current, '--color-link-underline': pale },
  },
  {
    id: 'G',
    name: '淡い下線、hover で下線だけ濃く',
    intent:
      'B と同じく、下線をいつも淡く引く。hover で、下線だけが文字より濃くなる（文字の色に黒を 15% 混ぜる）。文字の色は変わらない。色は 200ms でなめらかに移る。',
    spec: [
      ['下線', '文字の色を 35%・1px'],
      ['hover', '下線だけ文字より 15% 濃く'],
    ],
    tokens: {
      ...current,
      '--color-link-underline': pale,
      '--color-link-underline-hover': darker(15),
      '--link-grow-duration': '200ms',
      '--link-grow-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  {
    id: 'G2',
    name: '淡い下線、hover で下線だけもっと濃く',
    intent: 'G の濃くする割合を 30% にする。青のリンクなら、下線が紺に近くなる。',
    spec: [
      ['下線', '文字の色を 35%・1px'],
      ['hover', '下線だけ文字より 30% 濃く'],
    ],
    tokens: {
      ...current,
      '--color-link-underline': pale,
      '--color-link-underline-hover': darker(30),
      '--link-grow-duration': '200ms',
      '--link-grow-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  {
    id: 'C',
    name: '下線なし、hover で出る',
    intent:
      'ふだんは下線を引かず、hover で文字の色の下線が出る。グレーのリンクは本文とほとんど見分けられなくなる。',
    spec: [
      ['下線', 'なし'],
      ['hover', '文字の色・1px が出る'],
    ],
    tokens: { ...current, '--link-decoration': 'none' },
  },
  {
    id: 'D',
    name: '淡い下線、hover で濃く太く',
    intent: 'B に加えて、hover で下線が 2px に太くなる。',
    spec: [
      ['下線', '文字の色を 35%・1px'],
      ['hover', '下線が文字の色で 2px に'],
    ],
    tokens: { ...current, '--color-link-underline': pale, '--link-underline-width-hover': '2px' },
  },
  {
    id: 'E',
    name: '現行版＋hover で文字が濃く',
    intent:
      'ふだんは現行版のまま。hover で文字と下線が濃くなる（リンクの色に黒を 15% 混ぜる）。グレーは #40494C、青は #1B5CB3 になる。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '文字と下線を 15% 濃く'],
    ],
    tokens: { ...current, '--link-hover-darken': '15%' },
  },
  {
    id: 'E2',
    name: '現行版＋hover で文字がもっと濃く',
    intent:
      'E の濃くする割合を 30% にする。グレーは #2F3638（本文の色に近い）、青は #12458A になる。',
    spec: [
      ['下線', '文字の色・1px'],
      ['hover', '文字と下線を 30% 濃く'],
    ],
    tokens: { ...current, '--link-hover-darken': '30%' },
  },
];

const columns: Column[] = [
  { label: '通常', note: 'マウスを載せて、実際の動きを確かめられます' },
  {
    label: 'hover 中',
    note: 'マウスを載せた見た目を固定しています（動きの終わりの形）',
    preview: 'hover',
  },
];

const Cell = () => (
  <div className="flex flex-col gap-4">
    <p className="text-sm leading-6">
      フロントエンドを中心に、デザインから配信まで手がけています。くわしくは
      <Link color="neutral" href="#works">
        制作実績
      </Link>
      をご覧ください。
    </p>
    <p className="text-sm leading-6">
      お問い合わせの前に、
      <Link color="primary" href="#faq">
        よくある質問
      </Link>
      もご確認ください。
    </p>
    <div className="text-xs">
      <Link color="neutral" href="#about">
        もっと知りたい
      </Link>
    </div>
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/12 文字のリンクの見た目',
  id: 'design-review-12-text-link',
  parameters: {
    layout: 'fullscreen',
    pseudo: { hover: ['[data-preview="hover"] a'] },
  },
  args: { pick: 'G2' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'F1', 'F2', 'F3', 'F4', 'B', 'G', 'G2', 'C', 'D', 'E', 'E2'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={12}
      axis="文字のリンクの見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Cell />}
    >
      <p>
        <strong className="text-fg">決定: G2 淡い下線、hover で下線だけもっと濃く</strong>
        （ADR-0030）。「G2 が結構好みです。一旦これで行きましょう」
      </p>
      <p>
        この軸の5回目です。4回目の質問「淡い下線、hover
        で下線だけもっと濃く、だとどうでしょうか。」を受けて、B の hover
        で下線だけを文字より濃くする G（15%）・G2（30%）を足しました。3回目のメモ「F1
        のアニメーションがあまりうまく動いていない気がします。あと、太字へのなり方が文字側に太くなるのではなく、文字の下側に太くなるのが理想ですね」を受けて、F1〜F4
        の線を下へ太るようにし、F1 の動かし方を変えました。
      </p>
      <p>
        F1 は、線の太さを 1px から 2px へ動かしていましたが、画面は線を 1px
        単位でそろえて描くため、一段で切り替わって見えていました。いまは、下線のすぐ下にもう1本の
        1px の線を置き、その濃さを透明から文字の色へ動かしています。
      </p>
      <p>
        F1〜F4 の動きは「通常」の列でマウスを載せて確かめてください。「hover
        中」の列は、動きの終わりの形です。F1〜F4 は、下線を背景に描いた線にしているため、A
        と比べて線の位置が少し下になります。
      </p>
      <p>
        2回目のメモは「ホバーしたときの太線について、一気にボンと太くなるのではなく、アニメーションを付けられますか？いくつかバリエーションを見たいです。」、1回目の質問は「ホバーなしが現行版、ホバーありが現行版より濃くなる、という形はどうなりますか？」でした。ピンクのリンクを濃くすると、Danger（#BA012D）に近づきます（15%
        で #B81251）。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
