import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 673: グラフの縦の目盛り。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/673 グラフの縦の目盛り',
  id: 'design-review-673-chart-y-ticks',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: pickArg(['current', 'A', 'B']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: '現行版',
    name: '0 から 5 本',
    intent:
      '縦の範囲を 0 から始め、目盛りを 5 本引く。量の大きさを正しく比べられる。値が上のほうに固まると、下が空く',
    spec: [
      ['範囲', '0 から'],
      ['本数', '5 本'],
    ],
    look: { yTicks: 'zero' },
  },
  {
    id: 'A',
    name: '値に合わせる',
    intent:
      '縦の範囲を値のある所だけにする。小さな変化が大きく見える。0 がないので、量の比べ方を読み違えやすい',
    spec: [
      ['範囲', '値に合わせる'],
      ['本数', '5 本'],
    ],
    look: { yTicks: 'auto' },
  },
  {
    id: 'B',
    name: '0 から 3 本',
    intent:
      '0 から始め、目盛りを 3 本に減らす。グリッドが減って軽い。値の高さは大まかにしか読めない',
    spec: [
      ['範囲', '0 から'],
      ['本数', '3 本'],
    ],
    look: { yTicks: 'few' },
  },
];

const columns: LookColumn[] = [
  { label: '高さ 240px' },
  { label: '高さ 160px', note: '背の低い枠', look: { height: 160 } },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <LookComparison
      index={673}
      axis="グラフの縦の目盛り"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        縦の目盛りの範囲と本数を決めます。目盛りは Recharts の
        YAxis（domain・tickCount）で決まるので、ここで決めるのはレシピの既定です。
      </p>
      <p>
        推し: 現行版（0 から 5 本）。量を表すグラフは 0
        から始めると、増減の大きさを読み違えません。A
        は小さな変化がよく見えますが、変化が大げさに見えます。背の低い枠では B の 3
        本も選べるようにします。
      </p>
    </LookComparison>
  ),
};
