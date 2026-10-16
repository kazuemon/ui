import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Sparkline } from '../../src/components/sparkline/Sparkline';
import { Stat, type StatProps } from '../../src/components/stat/Stat';

// 軸 662: Stat にグラフ（chart）を添える場所。置き場所と大きさは --stat-chart-* で行ごとに変える
// 現行版は chart がないので、Stat と Sparkline を外で横に並べる
const meta = {
  title: 'Design Review/662 Stat のグラフの場所',
  id: 'design-review-662-stat-chart',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'C,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'Stat の外に並べる',
    intent:
      'Stat には場所がなく、使う側が Stat と Sparkline を横に並べる。並べ方が画面ごとにばらつき、グラフと数字の間や縦の位置がそろわない',
    spec: [
      ['chart', 'なし'],
      ['置き場所', '使う側が決める'],
    ],
  },
  {
    id: 'A',
    name: '数字の横に小さく',
    intent:
      '数字の行の右に小さく置き、下端を数字にそろえる。キャプションは下で幅いっぱいに使う。数字・増減と 1 行に収まり、数字とグラフが一番近い。小さいので形の細かさは読めない',
    spec: [
      ['置き場所', '数字の行の右'],
      ['縦の寄せ', '下（数字の下端）'],
      ['大きさ', '64×24px'],
    ],
    tokens: {
      '--stat-chart-areas': "'value chart' 'caption caption'",
      '--stat-chart-columns': 'minmax(0, 1fr) auto',
      '--stat-chart-align': 'end',
      '--stat-chart-gap': 'calc(var(--spacing) * 3)',
      '--stat-chart-offset': '0px',
      '--stat-chart-width': 'calc(var(--spacing) * 16)',
      '--stat-chart-height': 'calc(var(--spacing) * 6)',
    },
  },
  {
    id: 'B',
    name: '数字とキャプションの右',
    intent:
      '数字とキャプションをまとめた塊の右に置き、縦は真ん中。左に読む文字、右に形と分かれ、いくつ並べても列がそろう。キャプションの幅はグラフの分だけ狭くなる',
    spec: [
      ['置き場所', '数字とキャプションの右'],
      ['縦の寄せ', '真ん中'],
      ['大きさ', '112×40px'],
    ],
    tokens: {
      '--stat-chart-areas': "'value chart' 'caption chart'",
      '--stat-chart-columns': 'minmax(0, 1fr) auto',
      '--stat-chart-align': 'center',
      '--stat-chart-gap': 'calc(var(--spacing) * 4)',
      '--stat-chart-offset': '0px',
      '--stat-chart-width': 'calc(var(--spacing) * 28)',
      '--stat-chart-height': 'calc(var(--spacing) * 10)',
    },
  },
  {
    id: 'C',
    name: '下に幅いっぱい',
    intent:
      'キャプションの下に、Stat の幅いっぱいで置く。グラフが大きく、形がいちばん読める。縦に長くなり、カードの中の主役になる',
    spec: [
      ['置き場所', 'キャプションの下'],
      ['大きさ', '幅いっぱい×48px'],
      ['上のあいだ', '12px'],
    ],
    tokens: {
      '--stat-chart-areas': "'value' 'caption' 'chart'",
      '--stat-chart-columns': 'minmax(0, 1fr)',
      '--stat-chart-align': 'stretch',
      '--stat-chart-gap': '0px',
      '--stat-chart-offset': 'calc(var(--spacing) * 3)',
      '--stat-chart-width': '100%',
      '--stat-chart-height': 'calc(var(--spacing) * 12)',
    },
  },
];

const columns: Column[] = [
  { label: 'カードの中', note: '幅 280px' },
  { label: '狭いカード', note: '幅 200px' },
  { label: '2 つ並べる', note: 'size="lg"' },
];

const rising = [4, 6, 5, 8, 7, 9, 12, 10, 13, 15, 14, 18];
const falling = [12, 13, 11, 12, 10, 9, 10, 8, 7, 8, 6, 5];

function Item({
  candidate,
  data,
  ...props
}: Omit<StatProps, 'chart'> & { candidate: Candidate; data: number[] }) {
  const chart = <Sparkline data={data} className={candidate.id === 'C' ? 'w-full' : undefined} />;
  if (candidate.id === '現行版') {
    return (
      <div className="flex items-end justify-between gap-4">
        <Stat {...props} />
        <Sparkline data={data} className="mb-1 h-10 w-28" />
      </div>
    );
  }
  return <Stat {...props} chart={chart} />;
}

const views = {
  label: '今週の閲覧',
  value: '2,520',
  delta: '12%',
  deltaIndicator: 'up',
  caption: '先週比',
} as const;

export const Candidates: Story = {
  name: '置き場所',
  render: ({ pick }) => (
    <Comparison
      index={662}
      axis="Stat のグラフの場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const card = 'rounded-card border border-surface-line p-4';
        switch (column.label) {
          case 'カードの中':
            return (
              <div className={`w-[280px] ${card}`}>
                <Item candidate={candidate} data={rising} {...views} />
              </div>
            );
          case '狭いカード':
            return (
              <div className={`w-[200px] ${card}`}>
                <Item candidate={candidate} data={rising} {...views} />
              </div>
            );
          default:
            return (
              <div className="grid w-[400px] grid-cols-2 gap-3">
                <div className={card}>
                  <Item candidate={candidate} data={rising} {...views} size="lg" />
                </div>
                <div className={card}>
                  <Item
                    candidate={candidate}
                    data={falling}
                    label="平均の読了時間"
                    value="3:12"
                    delta="8%"
                    deltaIndicator="down"
                    caption="先週比"
                    size="lg"
                  />
                </div>
              </div>
            );
        }
      }}
    >
      <p>
        決定（ADR-0534）:
        C（下に幅いっぱい）を既定にし、B（数字とキャプションの右）も選べるようにする。
      </p>
      <p>
        Stat に、数字の推移を見せるグラフ（Sparkline など）を添える場所を決めます。`chart`
        に渡したものを、Stat
        が数字・キャプションと並べて置きます。グラフは数字と同じことを形で見せる飾りなので、読み上げは数字とキャプションのままです。
      </p>
      <p>
        おすすめは
        B（数字とキャプションの右）を既定にすることです。左に読む文字、右に形と分かれ、カードを並べても列がそろいます。C
        は 1 つの指標を大きく見せたいカードに向くので、選べるようにするのがよいと考えています。A は
        1 行に収まりますが、小さくて形が読み取りにくくなります。B
        は、狭いカードでは増減が数字の下に回ります。
      </p>
      <p>既定にする案と、ほかに選べるようにしたい案を教えてください。</p>
    </Comparison>
  ),
};
