import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { BarList, type BarListItem } from './BarList';
import { Gallery, Specimen } from '../../stories/story-parts';

const articles: BarListItem[] = [
  { label: 'React Server Components の境界を引く', value: 1240 },
  { label: '和文と欧文を並べるときの字間', value: 860 },
  { label: 'ポートフォリオを作り直した', value: 420 },
  { label: 'Storybook で見た目を比べる', value: 180 },
];
const colors = ['brand', 'neutral', 'primary', 'secondary'] as const;

const meta = {
  title: 'Components/BarList',
  component: BarList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '名前と値の並びを、値の大きさの棒で見せる一覧です。よく読まれた記事、流入元、使った言語の割合などに使います。押せません。',
          '',
          '- `items` に行（`label`・`value`、値の文字 `valueText`）を渡します。渡した順に上から並ぶので、多い順に見せたいときは並べ替えて渡します。',
          '- 棒の長さは、いちばん大きい値を 100% とした割合です。`max` で 100% にする値を固定できます。',
          '- `variant` で形を選びます。`overlay`（既定）は名前を淡い棒に重ね、`below` は名前の下に細い棒を置きます。',
          '- `color` で棒の色を選びます。既定は `brand`（水色）で、ほかのグラフの 1 番目の系列と同じ色です。目立たせたくないときは `neutral`（濃いグレー）を選びます。',
          '- 値は `format`（Intl.NumberFormat の指定）で整えます。行ごとに `valueText` で書くこともできます。',
          '- 一覧の名前は `aria-label` で付けます。',
        ].join('\n'),
      },
    },
  },
  args: { items: articles, 'aria-label': 'よく読まれた記事' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Variations: Story = {
  tags: ['visual'],
  name: '形と色',
  decorators: [
    (Story) => (
      <div className="w-[860px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Gallery columnWidth="24rem">
      {(['overlay', 'below'] as const).flatMap((variant) =>
        colors.map((color) => (
          <Specimen key={`${variant}-${color}`} label={`${variant} · ${color}`}>
            <BarList {...args} variant={variant} color={color} />
          </Specimen>
        ))
      )}
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: (args) => (
    <BarList
      {...args}
      items={[...articles, { label: '下書き', value: -3 }]}
      format={{ notation: 'compact' }}
      locale="ja-JP"
    />
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(list).toHaveAccessibleName('よく読まれた記事');
    const rows = canvas.getAllByRole('listitem');
    await expect(rows).toHaveLength(5);
    // 棒は読まず、名前と値を読む
    await expect(rows[0]).toHaveTextContent('React Server Components の境界を引く1240');
    await expect(rows[0].querySelector('[data-slot="bar-list-bar"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    // 0 より小さい値は 0 として描く
    await expect(rows[4]).toHaveTextContent('0');
    await expect(rows[4].querySelector('[data-slot="bar-list-bar"]')).toHaveAttribute(
      'style',
      'width: 0%;'
    );
  },
};
