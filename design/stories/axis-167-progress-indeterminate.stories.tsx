import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Progress } from '../../src/components/progress/Progress';

// 後半の軸 167: 終わりの分からない Progress の動き
//   候補は --progress-indeterminate-width・--progress-indeterminate の上書きだけで作る（keyframes は tokens.css の末尾）
//   動きを減らす設定では、どの案も同じ（幅いっぱいで明滅）。比べるのはふだんの動き

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
    },
  },
];

const columns: Column[] = [
  { label: 'neutral・md', note: '色を指定しないとき' },
  { label: 'primary・sm', note: '細いバー' },
  { label: 'secondary・lg', note: '太いバー' },
  { label: 'ボタンの送信中と並べて', note: '流れる線（bar）との見え方' },
];

function renderCell(column: Column) {
  const body = (() => {
    switch (column.label) {
      case 'primary・sm':
        return <Progress label="読み込んでいます" value={null} color="primary" size="sm" />;
      case 'secondary・lg':
        return <Progress label="読み込んでいます" value={null} color="secondary" size="lg" />;
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
      options: ['', 'current', 'A', 'B', 'C'],
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
        動きを減らす設定では、どの案も同じ見た目（幅いっぱいで明滅）になります。OS
        の設定を切ってご覧ください。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
