import type { Meta, StoryObj } from '@storybook/react-vite';

import { FieldTrial, OpenPanel, ScrollFree } from './cascader-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import { categories, regions } from '../../src/components/cascader/cascader-story-items';

// 軸 647: Cascader の次の段を開くきっかけ（押したとき・マウスを載せたとき）
const meta = {
  title: 'Design Review/647 Cascader の次の段を開くきっかけ',
  id: 'design-review-647-cascader-expand',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
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

const openOnHover: Record<string, boolean> = { current: false, A: true };

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '押して開く（おすすめ・既定）',
    intent:
      '親を押すか → キーで、次の段を開く。マウスを載せただけでは塗りが付くだけで、段は替わらない。斜めに動かしてほかの親をかすめても、開いている段が替わらない',
    spec: [
      ['開くきっかけ', '押す・→・Enter'],
      ['載せたとき', '塗りだけ'],
      ['props', 'openOnHover={false}'],
    ],
  },
  {
    id: 'A',
    name: '載せて開く',
    intent:
      'マウスを親に載せて 100ms 待つと次の段が開く（Menu の入れ子と同じ）。押す手間が減るが、右の段へ動かす途中でほかの親をかすめると段が替わる。指とシートでは押して開く',
    spec: [
      ['開くきっかけ', '載せて 100ms・押す・→'],
      ['載せたとき', '次の段が替わる'],
      ['props', 'openOnHover'],
    ],
  },
];

const columns: Column[] = [
  { label: '開いた面（2 段）', note: '面をそのまま触れる。親に載せる・押すを試す' },
  { label: '開いた面（3 段）', note: '斜めに動かして、ほかの親をかすめたときを試す' },
  { label: '欄から開く', note: '実際の部品' },
];

export const Axis: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={647}
      axis="Cascader の次の段を開くきっかけ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const hover = openOnHover[candidate.id];
        if (column.label.includes('2 段'))
          return (
            <OpenPanel items={regions} openOnHover={hover} defaultValue={['tokyo', 'shibuya']} />
          );
        if (column.label.includes('3 段'))
          return (
            <OpenPanel
              items={categories}
              openOnHover={hover}
              defaultValue={['books', 'novel', 'novel-1']}
            />
          );
        return <FieldTrial items={categories} label="カテゴリ" openOnHover={hover} />;
      }}
    >
      <p>
        浮かべる形で、親の次の段をいつ開くかを決めます。指で操作するとき・シートでは、どちらの案でも押して開きます。
      </p>
      <p>
        おすすめは現行版（押して開く）を既定にし、A（載せて開く）を openOnHover
        で選べるようにすることです。段が横に並ぶ部品では、右の段へマウスを動かす途中で別の親をかすめやすく、載せて開くと段が勝手に替わって見失いやすいためです。
      </p>
    </Comparison>
  ),
};
