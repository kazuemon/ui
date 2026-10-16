import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: A（淡い実線の縦の線・半径 5px の点）を既定にする — ADR-0537
// 軸 665: hover したときの縦の線と点。--color-chart-cursor・--chart-cursor-dash（比較用）・--chart-dot-radius で行ごとに変える
// 左の列は触ると動く。右の列は 9/17 に載せたところを固定
const meta = {
  title: 'Design Review/665 グラフの hover の縦の線と点',
  id: 'design-review-665-chart-hover',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
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
    name: '濃い実線・小さな点',
    intent:
      '3:1 の輪郭と同じグレーの実線を縦に引き、各線の上に小さな点を置く。どの日付を見ているかがはっきりする',
    spec: [
      ['縦の線', '実線・gray-500'],
      ['点', '半径 4px・白の縁 2px'],
    ],
    tokens: {
      '--color-chart-cursor': 'var(--palette-gray-500)',
      '--chart-cursor-dash': 'none',
      '--chart-dot-radius': '4px',
    },
  },
  {
    id: 'A',
    name: '淡い実線・大きな点',
    intent:
      '縦の線をグリッドより一段濃い程度に淡くし、そのぶん点を大きくする。目は点に向き、線は位置の補助になる。「軽い」に近い',
    spec: [
      ['縦の線', '実線・gray-300'],
      ['点', '半径 5px・白の縁 2px'],
    ],
    tokens: {
      '--color-chart-cursor': 'var(--palette-gray-300)',
      '--chart-cursor-dash': 'none',
      '--chart-dot-radius': '5px',
    },
  },
  {
    id: 'B',
    name: '破線',
    intent:
      '縦の線を破線にする。グリッド（実線）や系列の線と種類が違うので、一時的に出ている線だと分かる。破線は細かく、少しざわつく',
    spec: [
      ['縦の線', '破線 3・3・gray-500'],
      ['点', '半径 4px・白の縁 2px'],
    ],
    tokens: {
      '--color-chart-cursor': 'var(--palette-gray-500)',
      '--chart-cursor-dash': '3 3',
      '--chart-dot-radius': '4px',
    },
  },
  {
    id: 'C',
    name: '縦の線なし',
    intent:
      '縦の線を引かず、点とカードだけで見せる。いちばん静か。下の目盛りのどの日付かは、カードの題で読む',
    spec: [
      ['縦の線', 'なし'],
      ['点', '半径 5px・白の縁 2px'],
    ],
    tokens: {
      '--color-chart-cursor': 'transparent',
      '--chart-cursor-dash': 'none',
      '--chart-dot-radius': '5px',
    },
  },
];

const columns: Column[] = [
  { label: '触ると動く', note: 'グラフの上でマウスを動かす' },
  { label: 'hover を固定', note: '9/17 に載せたところ' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={665}
      axis="グラフの hover の縦の線と点"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <LineChartPreview activeIndex={column.label === 'hover を固定' ? 8 : undefined} />
      )}
    >
      <p>
        線グラフの上にマウスを載せたときの、位置を示す縦の線と、各線の上に置く点を決めます。カード（ChartTooltip）は、どの案でも同じです。左の列は、マウスを動かして確かめられます。
      </p>
      <p>
        推し:
        A（淡い実線・大きな点）。見ている値は点とカードで十分に分かり、縦の線は位置の補助で足ります。現行版の濃い線は、グリッドより目立ち、hover
        のたびに画面が少し重くなります。C は静かですが、線が 1
        本のグラフでは、どの日付の上にいるかが分かりにくくなります。
      </p>
    </Comparison>
  ),
};
