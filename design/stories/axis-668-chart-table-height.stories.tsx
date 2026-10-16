import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: A を、グラフのときの凡例とグラフの高さに正確にそろえる形にして既定にする（見出しは貼り付く）。伸びるままも選べる — ADR-0540
// 軸 668: 表に切り替えたときの高さ。--chart-table-max-height（比較用）を Table の maxHeight に渡して行ごとに変える
const meta = {
  title: 'Design Review/668 グラフの表の高さ',
  id: 'design-review-668-chart-table-height',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '伸びるまま',
    intent:
      '表は行の数だけ縦に伸びる。全部の行を一度に見渡せる。切り替えるたびに下の内容が上下に動き、12 行でもグラフの倍近い高さになる',
    spec: [['表の高さ', '上限なし']],
    tokens: { '--chart-table-max-height': 'none' },
  },
  {
    id: 'A',
    name: '凡例とグラフを合わせた高さ',
    intent:
      '表を、凡例とグラフを合わせた高さに収め、はみ出した行は表の中でスクロールする。見出しの行は上に貼り付く。切り替えても枠の高さが変わらず、下の内容が動かない',
    spec: [
      ['表の高さ', '凡例の 1 行 + 間 + グラフの高さ'],
      ['あふれ', '表の中でスクロール'],
    ],
    tokens: {
      '--chart-table-max-height':
        'calc(var(--leading-label) + var(--chart-frame-gap) + var(--chart-height))',
    },
  },
  {
    id: 'B',
    name: 'グラフの高さ',
    intent:
      '表を、グラフを描く場所と同じ高さに収める。A より凡例の 1 行分だけ低く、切り替えると枠がその分だけ縮む',
    spec: [
      ['表の高さ', 'グラフの高さ'],
      ['あふれ', '表の中でスクロール'],
    ],
    tokens: { '--chart-table-max-height': 'var(--chart-height)' },
  },
];

const columns: Column[] = [
  { label: 'グラフ', note: '押すと切り替わる' },
  { label: '表', note: 'はじめに表を見せたところ' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={668}
      axis="グラフの表の高さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <LineChartPreview showTable defaultView={column.label === '表' ? 'table' : 'chart'} />
      )}
    >
      <p>
        「グラフ・表」の切り替えで表に移ったときの高さを決めます。左右の列を見比べると、切り替えたときに枠の高さがどう変わるかが分かります。
      </p>
      <p>
        推し:
        A（凡例とグラフを合わせた高さ）。切り替えても枠の高さが変わらないので、下の内容が跳ねず、同じ場所で見比べられます。表の行が少ないときは、伸びずに上に詰まるだけです。
      </p>
    </Comparison>
  ),
};
