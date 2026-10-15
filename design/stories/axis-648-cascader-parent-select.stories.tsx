import type { Meta, StoryObj } from '@storybook/react-vite';

import { FieldTrial, OpenPanel, ScrollFree } from './cascader-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import type { CascaderProps } from '../../src/components/cascader/Cascader';
import { categories, regions } from '../../src/components/cascader/cascader-story-items';

// 軸 648: Cascader を途中の段（親）で決められるか、決めるときの形
const meta = {
  title: 'Design Review/648 Cascader を途中の段で決める',
  id: 'design-review-648-cascader-parent-select',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
  decorators: [
    (Story) => (
      <ScrollFree>
        <Story />
      </ScrollFree>
    ),
  ],
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// A（親を押すと決まる）は部品から外した。比較のときの動く見本は、決める前のコミット 01fb37d7 にある
const parentSelect: Record<string, NonNullable<CascaderProps['parentSelect']> | undefined> = {
  current: 'none',
  A: undefined,
  B: 'row',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '最後の段だけ（おすすめ・既定）',
    intent:
      '親を押すと次の段が開くだけで、値は最後の段（子のない選択肢）を選んだときに決まる。「段をたどって、最後まで行くと決まる」がいちばん分かりやすい',
    spec: [
      ['親を押す', '次の段を開く'],
      ['決まる', '最後の段だけ'],
      ['props', "parentSelect='none'"],
    ],
  },
  {
    id: 'A',
    name: '親を押すと決まる',
    intent:
      '親を押すと、その段で値が決まり（面は閉じない）、次の段も開く。続けて選ぶと値が深くなる。親の行が選んだ印になるので、どこで決まったかは見えるが、押しただけで値が変わる',
    spec: [
      ['親を押す', '決まる＋次の段を開く'],
      ['閉じる', '最後の段を選ぶ・Esc・外を押す'],
      ['props', "parentSelect='click'"],
    ],
  },
  {
    id: 'B',
    name: '次の段の先頭に「〇〇 のすべて」',
    intent:
      '親を押すと次の段が開き、その先頭に親そのものを選ぶ行を置く。決めるのはいつも 1 回押すだけで、親で決めることも行として見える。行の文字は parentRowLabel で変えられる',
    spec: [
      ['親を押す', '次の段を開く'],
      ['親で決める', '次の段の先頭の行'],
      ['props', "parentSelect='row'"],
    ],
  },
];

const columns: Column[] = [
  { label: '開いた面（2 段）', note: '親で決めたあと（東京都で決めた値）から試す' },
  { label: '開いた面（3 段）', note: '何も決めていないところから試す' },
  { label: '欄から開く', note: '実際の部品' },
];

export const Axis: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={648}
      axis="Cascader を途中の段で決める"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const mode = parentSelect[candidate.id];
        if (!mode)
          return (
            <p className="max-w-60 text-xs leading-5 text-fg-subtle">
              部品から外しました（比べたときの見本はコミット 01fb37d7）
            </p>
          );
        if (column.label.includes('2 段'))
          return (
            <OpenPanel
              items={regions}
              parentSelect={mode}
              defaultValue={mode === 'none' ? ['tokyo', 'shibuya'] : ['tokyo']}
            />
          );
        if (column.label.includes('3 段'))
          return <OpenPanel items={categories} parentSelect={mode} />;
        return <FieldTrial items={categories} label="カテゴリ" parentSelect={mode} />;
      }}
    >
      <p>
        決定: 既定は現行版（最後の段だけで決まる）。親を選べるようにするときは
        B（次の段の先頭に「〇〇 のすべて」の行）を parentSelect=&quot;row&quot;
        で選ぶ。A（親を押すと決まる）は外した。
      </p>
      <p>
        「東京都のどこでも」「本ならなんでも」のように、途中の段で決めたいときの形を決めます。どの案も、使う側が
        parentSelect で選べるようにし、ここでは既定と、選べる形に残すものを決めます。
      </p>
      <p>
        おすすめは現行版（最後の段だけ）を既定にし、途中で決めたいときは B（次の段の先頭に「〇〇
        のすべて」）を選べるようにすることです。A
        は押しただけで値が変わり、たどっている途中なのか決めたのかが分かりにくいため、外してよいと考えています。
      </p>
    </Comparison>
  ),
};
