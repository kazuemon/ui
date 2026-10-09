import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { ScrollFree } from './cascader-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Cascader, type CascaderProps } from '../../src/components/cascader/Cascader';
import { categories, regions } from '../../src/components/cascader/cascader-story-items';

// 軸 649: Cascader の欄に出す文（道筋をすべてか最後だけか、区切り）
const meta = {
  title: 'Design Review/649 Cascader の欄に出す文',
  id: 'design-review-649-cascader-value-text',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
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

const display: Record<string, Partial<CascaderProps>> = {
  current: { valueDisplay: 'path', separator: '/' },
  A: { valueDisplay: 'last' },
  B: { valueDisplay: 'path', separator: '›' },
  C: { valueDisplay: 'path', separator: null },
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '道筋をすべて・「/」で区切る（おすすめ・既定）',
    intent:
      '1 段目から最後の段まで、淡いグレーの「/」で区切って並べる（ラフのとおり）。同じ名前が別の親の下にあっても（中央区など）区別できる。狭い欄では前の段から縮め、最後の段を残す',
    spec: [
      ['出す段', 'すべて'],
      ['区切り', '/（淡いグレー）'],
      ['props', "valueDisplay='path'"],
    ],
  },
  {
    id: 'A',
    name: '最後の段だけ',
    intent:
      '決まった選択肢の名前だけを出す。短く、Select の値と同じ見た目になるが、親が欄から読めない（「中央区」がどこの中央区か分からない）',
    spec: [
      ['出す段', '最後だけ'],
      ['props', "valueDisplay='last'"],
    ],
  },
  {
    id: 'B',
    name: '道筋をすべて・「›」で区切る',
    intent: 'Breadcrumb や Menu の入れ子と同じ向きの印で区切る。段を下りた感じが出るが、印が小さい',
    spec: [
      ['出す段', 'すべて'],
      ['区切り', '›（淡いグレー）'],
      ['props', "separator='›'"],
    ],
  },
  {
    id: 'C',
    name: '道筋をすべて・区切らない',
    intent:
      '住所のように続けて書く（「東京都渋谷区」）。住所では自然だが、カテゴリでは段の切れ目が分からない（「本小説ミステリー」）',
    spec: [
      ['出す段', 'すべて'],
      ['区切り', 'なし'],
      ['props', 'separator={null}'],
    ],
  },
];

const columns: Column[] = [
  { label: '2 段（住所）', note: '東京都 → 中央区' },
  { label: '3 段（カテゴリ）', note: '本 → 小説 → ミステリー' },
  { label: '狭い欄', note: '幅 12rem' },
  { label: '欄から開く', note: '選び直して試す' },
];

function Cell({ width = 'w-72', children }: { width?: string; children: ReactNode }) {
  return <div className={width}>{children}</div>;
}

export const Axis: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={649}
      axis="Cascader の欄に出す文"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const props = display[candidate.id];
        if (column.label.startsWith('2 段'))
          return (
            <Cell>
              <Cascader
                label="お届け先"
                items={regions}
                defaultValue={['tokyo', 'chuo']}
                {...props}
              />
            </Cell>
          );
        if (column.label.startsWith('3 段'))
          return (
            <Cell>
              <Cascader
                label="カテゴリ"
                items={categories}
                defaultValue={['books', 'novel', 'novel-1']}
                {...props}
              />
            </Cell>
          );
        if (column.label.startsWith('狭い'))
          return (
            <Cell width="w-48">
              <Cascader
                label="カテゴリ"
                items={categories}
                defaultValue={['books', 'novel', 'novel-1']}
                {...props}
              />
            </Cell>
          );
        return (
          <Cell>
            <Cascader label="試す" items={categories} presentation="popover" {...props} />
          </Cell>
        );
      }}
    >
      <p>
        値が決まったあと、欄にどう書くかを決めます。読み上げはどの案でも、段の名前を順に読みます（区切りは読みません）。
      </p>
      <p>
        おすすめは現行版（道筋をすべて・「/」）を既定にすることです。同じ名前が別の親の下にあることが多く（区・カテゴリ）、最後の段だけでは区別できないためです。A・C
        は valueDisplay・separator で選べる形に残します。
      </p>
    </Comparison>
  ),
};
