import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Meter } from '../../src/components/meter/Meter';

// 後半の軸 162: Meter のバーの太さ・角・地の色
//   候補は --meter-height・--meter-radius・--color-meter-track の上書きだけで作る
//   このあと作る Progress（処理の進み具合・記事の読了）も、同じバーの形を使う予定なので、両方に合うかも見てもらう

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '8px の pill、トグルの OFF と同じ地',
    intent:
      '小物と同じ pill で、角のない面を作らない。地はトグルの OFF・選んでいない箱と同じグレーで、白地の上でも入っていない分が見える。',
    spec: [
      ['太さ', '8px'],
      ['角', 'pill'],
      ['地', 'トグルの OFF と同じグレー（field-addon）'],
    ],
    tokens: {
      '--meter-height': 'calc(var(--spacing) * 2)',
      '--meter-radius': 'var(--radius-pill)',
      '--color-meter-track': 'var(--color-field-addon)',
    },
  },
  {
    id: 'A',
    name: '4px の細い pill',
    intent:
      '線に近い細さにして、軽く見せる。文字の行に添える印として控えめ。送信中の流れる線（2px）よりは太い。値が小さいと塗りが見えにくい。',
    spec: [
      ['太さ', '4px'],
      ['角', 'pill'],
      ['地', '現行版と同じ'],
    ],
    tokens: {
      '--meter-height': 'var(--spacing)',
      '--meter-radius': 'var(--radius-pill)',
      '--color-meter-track': 'var(--color-field-addon)',
    },
  },
  {
    id: 'B',
    name: '12px、小さな角',
    intent:
      '太くして面として見せ、角はチェックボックスの箱に近い小さな丸みにする。量の棒グラフのように読める。やわらかさは少し減る。',
    spec: [
      ['太さ', '12px'],
      ['角', '4px（radius-sm）'],
      ['地', '現行版と同じ'],
    ],
    tokens: {
      '--meter-height': 'calc(var(--spacing) * 3)',
      '--meter-radius': 'var(--radius-sm)',
      '--color-meter-track': 'var(--color-field-addon)',
    },
  },
  {
    id: 'C',
    name: '8px の pill、入力欄と同じ淡い地',
    intent:
      '形は現行版のまま、地を入力欄と同じ淡いグレーにする。塗った分だけが目に入り、軽く見える。白地では入っていない分の端がほとんど見えない。',
    spec: [
      ['太さ', '8px'],
      ['角', 'pill'],
      ['地', '入力欄と同じ淡いグレー（field）'],
    ],
    tokens: {
      '--meter-height': 'calc(var(--spacing) * 2)',
      '--meter-radius': 'var(--radius-pill)',
      '--color-meter-track': 'var(--color-field)',
    },
  },
];

const columns: Column[] = [
  { label: 'neutral・72%', note: '色を指定しないとき' },
  { label: 'primary・45%' },
  { label: 'secondary・100%' },
  { label: '少し（4%）', note: '塗りの端の形' },
  { label: '空（0%）', note: '地の見え方' },
  { label: 'カードの上（グレーの面）', note: '入力欄と同じ塗りの面に置いたとき' },
  { label: 'スキルの一覧', note: 'ラベルと値を並べたとき' },
];

function renderCell(column: Column) {
  const body = (() => {
    switch (column.label) {
      case 'primary・45%':
        return <Meter label="ストレージ" value={45} color="primary" />;
      case 'secondary・100%':
        return <Meter label="ストレージ" value={100} color="secondary" />;
      case '少し（4%）':
        return <Meter label="ストレージ" value={4} color="primary" />;
      case '空（0%）':
        return <Meter label="ストレージ" value={0} color="primary" />;
      case 'カードの上（グレーの面）':
        return (
          <div className="rounded-card bg-field p-4">
            <Meter label="ストレージ" value={45} color="primary" />
          </div>
        );
      case 'スキルの一覧':
        return (
          <div className="flex flex-col gap-4">
            <Meter label="TypeScript" value={90} color="primary" />
            <Meter label="React" value={75} color="primary" />
            <Meter label="Rust" value={30} color="primary" />
          </div>
        );
      default:
        return <Meter label="習熟度" value={72} />;
    }
  })();
  return <div className="w-[240px]">{body}</div>;
}

const meta = {
  title: 'Design Review/162 Meter のバーの形',
  id: 'design-review-162-meter-bar',
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
      index={162}
      axis="Meter のバーの太さ・角・地の色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        Meter
        は、決まった範囲の中の量（スキルの習熟度、ストレージの使用量）を示すバーです。押さないので影も枠線もなく、地の上に、値までを部品の色で塗ります。
      </p>
      <p>
        比べるのは、バーの太さと角、まだ入っていない分（地）の色です。このあと作る
        Progress（処理の進み具合・記事の読了）も同じバーを使う予定なので、両方に合うかも見てください。
      </p>
      <p>どれを既定にするか、ほかに選べるようにしたい案があれば教えてください。</p>
    </Comparison>
  ),
};
