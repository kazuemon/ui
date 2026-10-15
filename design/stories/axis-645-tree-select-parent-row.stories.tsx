import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, Comparison } from './Comparison';
import { folderTree, stationTree } from '../../src/components/tree-select/tree-select-samples';
import { scrollableDecorator } from './tree-select-axis-parts';
import { pointColumns, PointRules, type Scene, sceneCell } from './tree-select-point-scenes';

// 軸 645: TreeSelect（1 つ選ぶ形）で、親の行をどう扱うか（「親もほかの行と同じ点」のルール）
//   それより前の候補（Marks・Approaches・Rules・Combinations）は、このストーリーに置き換えた（コミットに残っている）
const meta = {
  title: 'Design Review/645 TreeSelect の親の行',
  id: 'design-review-645-tree-select-parent-row',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', '現行版', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const scenes: Record<string, Scene> = {
  // 直前の案（参考）: 親の行は開け閉めだけ。開いた子の先頭の「〇〇 そのもの」の行で親を選ぶ
  現行版: {
    items: folderTree,
    label: '保存先',
    props: {
      parentSelect: 'row',
      parentRowLabel: (item) => `${item.label} そのもの`,
      defaultValue: 'projects',
    },
  },
  A: {
    items: stationTree,
    label: '乗車駅',
    props: { parentPoint: 'none', defaultValue: 'kaihin-shiomidai' },
  },
  B: {
    items: folderTree,
    label: '保存先',
    props: { parentPoint: 'label', defaultValue: 'projects', defaultExpanded: ['docs'] },
  },
  C: {
    items: folderTree,
    label: '保存先',
    props: {
      parentPoint: 'label',
      selectedIndicator: 'text',
      defaultValue: 'projects',
      defaultExpanded: ['docs'],
    },
  },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '子の先頭の行で親を選ぶ（直前の案・参考）',
    intent:
      '保存先。親の行は開け閉めだけで、開いた子の先頭の「案件 そのもの」の行で親に保存する。比べるために残した直前の案',
    spec: [
      ['props', 'parentSelect="row"'],
      ['親の値', '子の先頭の特別な行'],
    ],
  },
  {
    id: 'A',
    name: 'none: 親は選べない',
    intent:
      '乗車駅。路線には乗れないので、丸は駅だけ。路線の行は印も左の余白もなく、どこを押しても開け閉め（右端の山形は向きの表示）',
    spec: [
      ['props', 'parentPoint="none"'],
      ['値', '駅 1 つ'],
    ],
  },
  {
    id: 'B',
    name: 'label: 親もほかの行と同じ点',
    intent:
      '保存先。フォルダは親子に関係なく丸の付いた 1 行で、中にフォルダがあっても、そのフォルダ自体に保存できる。開け閉めは右端の正方形だけ',
    spec: [
      ['props', 'parentPoint="label"'],
      ['値', 'フォルダ 1 つ'],
    ],
  },
  {
    id: 'C',
    name: 'B の選んだ行に面を敷かない',
    intent:
      'B と同じ場面で、選んだ行の淡い面（Select と同じ背景）をなくし、丸と太字だけで示す。既定は面あり（B）で、面なしも選べるようにする',
    spec: [
      ['props', 'parentPoint="label" selectedIndicator="text"'],
      ['選んだ行', '丸と太字（面なし）'],
    ],
  },
];

export const Points: Story = {
  name: '候補（親もほかの行と同じ点）',
  render: ({ pick }) => (
    <Comparison
      index={645}
      axis="TreeSelect の親の行（1 つ選ぶ形）"
      pick={pick}
      candidates={candidates}
      columns={pointColumns}
      renderCell={(column, candidate) => sceneCell(column, scenes[candidate.id], 'h-[30rem]')}
    >
      <PointRules />
      <p>
        1 つ選ぶ形では、scope（親が子を覆う）は label
        と同じ見た目と働きになるので、行を分けていません。複数選ぶ形は軸 646 で比べます。B と C
        は、選んだ行の淡い面のあり・なし（selectedIndicator の fill・text）だけが違います。現行版（1
        行目）は、直前の案（子の先頭の「〇〇 そのもの」の行）を比べるために残したものです。
      </p>
    </Comparison>
  ),
};
