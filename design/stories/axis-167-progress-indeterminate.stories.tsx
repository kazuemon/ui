import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Progress } from '../../src/components/progress/Progress';

// 後半の軸 167: 終わりの分からない Progress の動き
//   候補は --progress-indeterminate-{width,,fill}・--progress-stripe-size の上書きだけで作る（keyframes は tokens.css の末尾）
//   動きを減らす設定では、どの案も幅いっぱいで明滅する。縞の案（D・E）は、縞を止めたまま明滅する
//   縞の色は currentColor（部品が塗りの色を入れる）と、それを透かした地の色から作る

const plainFill = { '--progress-indeterminate-fill': 'currentColor' };
const stripeHalf = 'color-mix(in oklab, currentColor 35%, transparent)';
// 斜めの縞（左下から右上へ傾いた帯）を、塗りの色と、塗りの色を透かして地が見える色で交互に並べる。絵は 1 組ずつ繰り返す
const stripeFill = {
  '--progress-indeterminate-fill': `linear-gradient(135deg, currentColor 25%, ${stripeHalf} 25% 50%, currentColor 50% 75%, ${stripeHalf} 75%) 0 0 / var(--progress-stripe-size) var(--progress-stripe-size)`,
  '--progress-stripe-size': 'calc(var(--spacing) * 4)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '送信中の線と同じ流れ',
    intent:
      '地の幅の 4 割の区切りが、左の外から右の外へ 1.2 秒で抜ける。ボタンの送信中の流れる線と同じ動きなので、待っていることの見え方がそろう。',
    spec: [
      ['区切りの幅', '40%'],
      ['動き', '左から右へ流れる。1.2 秒・ease-in-out（loading-bar）'],
    ],
    tokens: {
      '--progress-indeterminate-width': '40%',
      '--progress-indeterminate': 'var(--animate-loading-bar)',
      ...plainFill,
    },
  },
  {
    id: 'A',
    name: '左右の端のあいだを往復',
    intent:
      '区切りが地の中に収まったまま、左右の端を行き来する。外へ抜けないので、いつも区切りが見えている。流れる向き（進む感じ）はない。',
    spec: [
      ['区切りの幅', '30%'],
      ['動き', '左右に往復。片道 0.9 秒・ease-in-out'],
    ],
    tokens: {
      '--progress-indeterminate-width': '30%',
      '--progress-indeterminate': 'progress-shuttle 0.9s ease-in-out infinite alternate',
      ...plainFill,
    },
  },
  {
    id: 'B',
    name: '伸びながら進み、縮んで抜ける',
    intent:
      '区切りが左の端から伸びながら進み、縮みながら右の端へ抜ける。進む向きを見せつつ、長さが変わる分だけ動きが大きい。',
    spec: [
      ['区切りの幅', '0 → 50% → 0'],
      ['動き', '左から右へ。1.6 秒・ease-in-out'],
    ],
    tokens: {
      '--progress-indeterminate-width': '40%',
      '--progress-indeterminate': 'progress-stretch 1.6s ease-in-out infinite',
      ...plainFill,
    },
  },
  {
    id: 'C',
    name: 'その場で明滅',
    intent:
      '区切りを幅いっぱいに引き、濃さだけをゆっくり変える。動きを減らす設定のときの見た目を、ふだんにも使う。最も静か。',
    spec: [
      ['区切りの幅', '100%'],
      ['動き', '濃さ 60% ↔ 20%。1.6 秒で 1 往復（loading-bar-reduced）'],
    ],
    tokens: {
      '--progress-indeterminate-width': '100%',
      '--progress-indeterminate': 'var(--animate-loading-bar-reduced)',
      ...plainFill,
    },
  },
  {
    id: 'D',
    name: '幅いっぱいの縞が流れる',
    intent:
      '地の幅いっぱいを斜めの縞で塗り、縞だけを左から右へ流す（いわゆるバーバーポール）。塗りの色と、塗りの色を透かして地が見える色が交互に並ぶ。区切りの出入りがないので、ずっと同じ濃さで動いて見える。細い xs（2px）・sm（4px）では縞の傾きはほとんど見えず、短い点線が流れる見え方になる。動きを減らす設定では、縞を止めたまま明滅する。',
    spec: [
      ['区切りの幅', '100%'],
      ['縞', '斜め 45°、1 組 16px。塗りの色 と 塗りの色 35%（地が透ける）'],
      ['動き', '縞が 1 組ずつ右へ。0.8 秒で 1 組・一定の速さ'],
    ],
    tokens: {
      '--progress-indeterminate-width': '100%',
      '--progress-indeterminate': 'progress-stripes 0.8s linear infinite',
      ...stripeFill,
    },
  },
  {
    id: 'E',
    name: '流れる区切りの中に縞',
    intent:
      '現行版の流れる区切りを、斜めの縞で塗る。区切りの動きは現行版のままで、区切りの中の縞がさらに右へ流れる。区切りが速く動くので、縞の流れは区切りの動きに紛れてほとんど見えず、縞の模様として見える。細い xs・sm では、縞は短い点線に見える。動きを減らす設定では、縞を止めたまま幅いっぱいで明滅する。',
    spec: [
      ['区切りの幅', '40%'],
      ['縞', 'D と同じ'],
      ['動き', '区切りは現行版と同じ（1.2 秒）。縞は 0.8 秒で 1 組右へ'],
    ],
    tokens: {
      '--progress-indeterminate-width': '40%',
      '--progress-indeterminate':
        'var(--animate-loading-bar), progress-stripes 0.8s linear infinite',
      ...stripeFill,
    },
  },
];

const columns: Column[] = [
  { label: 'neutral・md', note: '色を指定しないとき' },
  { label: 'primary・sm', note: '細いバー' },
  { label: 'secondary・lg', note: '太いバー' },
  { label: 'primary・xs', note: '読了のバーの細さ（2px）' },
  { label: 'ボタンの送信中と並べて', note: '流れる線（bar）との見え方' },
];

function renderCell(column: Column) {
  const body = (() => {
    switch (column.label) {
      case 'primary・sm':
        return <Progress label="読み込んでいます" value={null} color="primary" size="sm" />;
      case 'secondary・lg':
        return <Progress label="読み込んでいます" value={null} color="secondary" size="lg" />;
      case 'primary・xs':
        return <Progress label="読み込んでいます" value={null} color="primary" size="xs" />;
      case 'ボタンの送信中と並べて':
        return (
          <div className="flex flex-col gap-4">
            <Progress label="送っています" value={null} color="primary" />
            <Button color="primary" loading loadingIndicator="bar">
              送信
            </Button>
          </div>
        );
      default:
        return <Progress label="読み込んでいます" value={null} />;
    }
  })();
  return <div className="w-[240px]">{body}</div>;
}

const meta = {
  title: 'Design Review/167 Progress の終わりの分からない動き',
  id: 'design-review-167-progress-indeterminate',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={167}
      axis="Progress の終わりの分からない動き"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        Progress は処理の進み具合を示すバーです。どれだけかかるか分からないとき（value が
        null）は、地の上で塗りの色が動き続けます。比べるのは、その動き方です。
      </p>
      <p>
        D・E
        は、斜めの縞（バーバーポール）の案です。縞の色は、塗りの色と、それを透かして地が見える色です。
      </p>
      <p>
        動きを減らす設定では、どの案も幅いっぱいで明滅します。D・E は縞を止めたまま明滅します。OS
        の設定を切ってご覧ください。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
