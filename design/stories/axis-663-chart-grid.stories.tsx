import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { LineChartPreview } from './line-chart-preview';

// 決定: 現行版（淡い実線のグリッド・一段濃い下端の軸）を既定にする — ADR-0535
// 軸 663: 線グラフのグリッドと軸の線。色は --color-chart-grid・--color-chart-axis、破線は --chart-grid-dash で行ごとに変える
const meta = {
  title: 'Design Review/663 グラフのグリッドと軸の線',
  id: 'design-review-663-chart-grid',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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
    name: '淡い実線',
    intent:
      '横のグリッドを淡いグレーの実線で引き、下端の軸だけ一段濃くする。値を目で横に追える。線が 3 本あると、グリッドと合わせて横の線が多く見える',
    spec: [
      ['グリッド', '実線・gray-200'],
      ['下端の軸', 'gray-300'],
    ],
    tokens: {
      '--color-chart-grid': 'var(--palette-gray-200)',
      '--color-chart-axis': 'var(--palette-gray-300)',
      '--chart-grid-dash': 'none',
    },
  },
  {
    id: 'A',
    name: '破線',
    intent:
      'グリッドを細かい破線にする。系列の線（実線）と種類が違うので、線が重なっても見分けやすい。点が並ぶぶん、地がざわつく',
    spec: [
      ['グリッド', '破線 2・4・gray-300'],
      ['下端の軸', 'gray-300・実線'],
    ],
    tokens: {
      '--color-chart-grid': 'var(--palette-gray-300)',
      '--color-chart-axis': 'var(--palette-gray-300)',
      '--chart-grid-dash': '2 4',
    },
  },
  {
    id: 'B',
    name: '下端の軸だけ',
    intent:
      'グリッドを引かず、下端の軸だけを残す。いちばん軽く、系列の線だけが目に入る。値の高さは左の目盛りと hover で読む',
    spec: [
      ['グリッド', 'なし'],
      ['下端の軸', 'gray-300'],
    ],
    tokens: {
      '--color-chart-grid': 'transparent',
      '--color-chart-axis': 'var(--palette-gray-300)',
      '--chart-grid-dash': 'none',
    },
  },
  {
    id: 'C',
    name: 'さらに淡い実線・軸もそろえる',
    intent:
      'グリッドをさらに淡くし、下端の軸も同じ淡さにする。線の濃さが 1 段だけになり、静か。白地以外（グレーの面）に置くと、グリッドが消えかける',
    spec: [
      ['グリッド', '実線・gray-100'],
      ['下端の軸', 'gray-100'],
    ],
    tokens: {
      '--color-chart-grid': 'var(--palette-gray-100)',
      '--color-chart-axis': 'var(--palette-gray-100)',
      '--chart-grid-dash': 'none',
    },
  },
];

const columns: Column[] = [
  { label: '通常' },
  { label: 'hover', note: '9/17 に載せたところを固定' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={663}
      axis="線グラフのグリッドと軸の線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <LineChartPreview activeIndex={column.label === 'hover' ? 8 : undefined} />
      )}
    >
      <p>
        線グラフの、値を読むための横の線（グリッド）と、下端の軸の線を決めます。グリッドは系列の線より目立たせず、値の高さを横に追えるようにします。縦のグリッドは、どの案でも引きません（日付の目盛りと
        hover の縦の線で足ります）。
      </p>
      <p>
        推し:
        現行版。グリッドの線は、系列の線より十分淡く、それでいて目で横に追えます。破線（A）は、グリッドの線がざわつき、「軽い」から外れます。グリッドなし（B）は、hover
        しないと値の高さが読みづらくなります。C は、カードやグレーの面の上で消えかけます。
      </p>
    </Comparison>
  ),
};
