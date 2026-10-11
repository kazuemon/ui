import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TreeSelectMultipleValue } from '../../src/components/tree-select/TreeSelect';
import { type Candidate, type Column, Comparison } from './Comparison';
import { OpenFrame, scrollableDecorator } from './tree-select-axis-parts';

// 軸 646: TreeSelect（複数選ぶ形）で、親を選んだときに外へ渡す値
const meta = {
  title: 'Design Review/646 TreeSelect の複数の値',
  id: 'design-review-646-tree-select-multiple-value',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollableDecorator],
  args: { pick: '' },
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

const multipleValue: Record<string, TreeSelectMultipleValue> = {
  現行版: 'leaves',
  A: 'parents',
  B: 'all',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '葉だけ',
    intent:
      '親を選んでも、外に渡すのは中の葉（子のない行）だけ。値の数え方が木の形によらず、受け取る側は葉の一覧として扱える。欄のチップも葉が並ぶ',
    spec: [
      ['「入力」を選ぶと', '["select","combobox","tree-select"]'],
      ['欄', '葉のチップ 3 つ'],
      ['あとで子が増えたら', '増えた子は入らない'],
    ],
  },
  {
    id: 'A',
    name: '親に畳む',
    intent:
      '中をすべて選んだ親は、親の値 1 つにまとめて渡す。欄も「入力」のチップ 1 つで短い。「この分類ぜんぶ」という意味で受け取れる',
    spec: [
      ['「入力」を選ぶと', '["inputs"]'],
      ['欄', '親のチップ 1 つ'],
      ['あとで子が増えたら', '親を選んだ人には入る'],
    ],
  },
  {
    id: 'B',
    name: '親も葉も',
    intent:
      '中をすべて選んだ親と、その中の葉を、両方とも渡す。どちらの値で絞る側にも合うが、値が多くなり、欄も長い',
    spec: [
      ['「入力」を選ぶと', '["inputs","select","combobox","tree-select"]'],
      ['欄', '親と葉のチップ 4 つ'],
      ['あとで子が増えたら', '値によって違う'],
    ],
  },
];

const columns: Column[] = [
  {
    label: '開いた面と渡す値',
    note: '「入力」「デザイン」などの親の行を押してみてください。下に、外へ渡す値が出ます',
  },
];

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={646}
      axis="TreeSelect の複数の値"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_, candidate) => (
        <OpenFrame
          height="h-[37rem]"
          showValue
          props={{
            multiple: true,
            multipleValue: multipleValue[candidate.id],
            defaultValue: ['inputs'],
            defaultExpanded: ['components', 'inputs'],
          }}
        />
      )}
    >
      <p>
        複数選ぶ形で、親を選んだとき（中をすべて選んだとき）に、外へ渡す値をどうまとめるかを選びます。面の中の印（親はチェック、一部なら横線）はどの案も同じです。どの案でも、受け取った値に親が入っていれば、その中をすべて選んだものとして読みます。
      </p>
      <p>
        選べない行（「比較の軸」）は親を押しても変わらないので、「デザイン」を押しても中がすべてそろわず、親には畳まれません。
      </p>
      <p>
        おすすめは現行版（葉だけ）を既定にし、A（親に畳む）を選べるようにする形です。受け取る側が木の形を知らなくても扱え、値の意味が選んだ時点で決まります。分類ごと選ぶ意味を残したい場面（あとで増えた記事も含めたい絞り込み）では
        A を使います。B は値が重なって扱いにくいので、作らなくてもよいと考えています。
      </p>
    </Comparison>
  ),
};
