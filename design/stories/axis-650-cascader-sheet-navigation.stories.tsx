import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollFree, SheetSpecimen } from './cascader-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Cascader, type CascaderProps } from '../../src/components/cascader/Cascader';
import { categories, regions } from '../../src/components/cascader/cascader-story-items';
import { PhoneFrame } from '../../src/stories/story-parts';

// 軸 650: Cascader のシート（指・狭い画面）で、前の段へ戻る手段
const meta = {
  title: 'Design Review/650 Cascader のシートで前の段へ戻る',
  id: 'design-review-650-cascader-sheet-navigation',
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

const navigation: Record<string, NonNullable<CascaderProps['sheetNavigation']>> = {
  current: 'back',
  A: 'tabs',
};

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '段の上に「‹ 親の名前」（おすすめ・既定）',
    intent:
      '2 段目から、段の上に ‹ と親の名前の行を置き、押すと 1 段戻る。行は段をスクロールしても上に貼り付く。Menu の入れ子のシート（見出しの左の ‹）と同じ考えで、いまどの親の中かが行から読める',
    spec: [
      ['戻る', '‹ の行で 1 段ずつ'],
      ['場所', '段の上（貼り付く）'],
      ['props', "sheetNavigation='back'"],
    ],
  },
  {
    id: 'A',
    name: '上に段のタブ',
    intent:
      '上に段ごとのタブ（選んだ名前、まだの段は「選んでください」）を並べ、押すとその段へ飛ぶ。通販の住所選びに多い形。何段目まで選んだかが一目で分かり、2 段以上も一度に戻れるが、タブと見出しが 2 段に重なる',
    spec: [
      ['戻る', 'タブで任意の段へ'],
      ['場所', '中身の上（貼り付く）'],
      ['props', "sheetNavigation='tabs'"],
    ],
  },
];

const columns: Column[] = [
  { label: 'シートの中身（2 段）', note: '開いたままの見本。親を押すと右から滑り込む' },
  { label: 'シートの中身（3 段）', note: '何も選んでいないところから' },
  { label: '欄から開く', note: '実際の部品。欄を押すとシート（1 つずつ開く）' },
];

export const Axis: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={650}
      axis="Cascader のシートで前の段へ戻る"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const mode = navigation[candidate.id];
        if (column.label.includes('2 段'))
          return (
            <SheetSpecimen
              items={regions}
              defaultValue={['tokyo', 'shibuya']}
              sheetNavigation={mode}
            />
          );
        if (column.label.includes('3 段'))
          return <SheetSpecimen items={categories} sheetNavigation={mode} />;
        return (
          <PhoneFrame>
            {(frame) => (
              <Cascader
                label="カテゴリ"
                items={categories}
                presentation="sheet"
                sheetNavigation={mode}
                portalContainer={frame}
              />
            )}
          </PhoneFrame>
        );
      }}
    >
      <p>
        指で操作していて画面が狭いときは、段を横に並べられないので、シートの中で 1
        段ずつ滑らせて進みます（Menu
        の入れ子のシートと同じ）。ここでは、前の段へ戻る手段を決めます。シートの見出し（欄のラベル）と右上の
        × はどちらも同じです。
      </p>
      <p>
        おすすめは現行版（段の上に「‹ 親の名前」）を既定にすることです。Menu
        の入れ子と同じ向きの印で戻れ、見出しの下に 1 行足すだけで済むためです。段が深い（3
        段以上）木が多いなら、A を sheetNavigation で選べるようにします。
      </p>
    </Comparison>
  ),
};
