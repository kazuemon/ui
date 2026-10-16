import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Sparkline } from './Sparkline';
import { Gallery, Specimen } from '../../stories/story-parts';

const weekly = [4, 6, 5, 8, 7, 9, 12, 10, 13, 15, 14, 18];
const colors = ['brand', 'neutral', 'primary', 'secondary', 'success', 'danger'] as const;

const meta = {
  title: 'Components/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '軸も目盛りもない小さな折れ線です。数字の横や表のセルに置き、増え方・減り方の形だけを見せます。押せません。',
          '',
          '- `data` に値を左から順に渡します。縦の範囲は値の最小から最大までで、`min`・`max` で固定できます（0 から描くなら `min={0}`）。',
          '- `variant="area"` で線の下を淡く塗ります。最後の値には点を置きます。消すときは `hideEndPoint` を渡します。',
          '- `color` で線の色を選びます。既定は `brand`（グラフの系列の 1 番目の水色）です。目立たせたくないときは `neutral`（濃いグレー）を選びます。',
          '- 大きさは周りの文字に合わせて伸び縮みします。変えるときは `className` に `w-*`・`h-*` を書きます。',
          '- 値は読み上げません。数字はそばの文字で伝えます。形にも意味があるときは `accessibleName` で名前を付けると、1 枚の絵として読まれます。',
        ].join('\n'),
      },
    },
  },
  args: { data: weekly },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Variations: Story = {
  tags: ['visual'],
  name: '色と形',
  render: (args) => (
    <Gallery columnWidth="10rem">
      {colors.map((color) => (
        <Specimen key={color} label={color}>
          <Sparkline {...args} color={color} />
        </Specimen>
      ))}
      <Specimen label="area">
        <Sparkline {...args} variant="area" />
      </Specimen>
      <Specimen label="hideEndPoint">
        <Sparkline {...args} hideEndPoint />
      </Specimen>
      <Specimen label="min={0}">
        <Sparkline {...args} variant="area" min={0} />
      </Specimen>
      <Specimen label="値が 1 つ・みな同じ">
        <span className="flex gap-3">
          <Sparkline data={[5]} />
          <Sparkline data={[3, 3, 3]} />
        </span>
      </Specimen>
      <Specimen label="欠けた値">
        <span className="flex gap-3">
          <Sparkline data={[4, 6, 5, Number.NaN, 7, 9, 12]} />
          <Sparkline data={[4, 6, 5, 8, 7, Number.NaN]} variant="area" />
          <Sparkline data-testid="trailing-missing" data={[5, Number.NaN]} />
        </span>
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvas }) => {
    // 最後の値が欠けていれば、手前の値に点を置かない
    const trailing = canvas.getByTestId('trailing-missing');
    await expect(trailing.querySelector('[data-slot="sparkline-end-point"]')).toBeNull();
  },
};

export const InText: Story = {
  tags: ['visual'],
  name: '文字の大きさに合わせる',
  render: (args) => (
    <div className="flex flex-col gap-3 text-fg">
      <p className="text-sm">
        今週の閲覧 2,520 <Sparkline {...args} />
      </p>
      <p className="text-body">
        今週の閲覧 2,520 <Sparkline {...args} />
      </p>
      <p className="text-2xl font-bold">
        2,520 <Sparkline {...args} />
      </p>
      <Sparkline {...args} variant="area" className="h-16 w-full" />
    </div>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="flex gap-4">
      <Sparkline data-testid="decorative" data={weekly} />
      <Sparkline data={weekly} accessibleName="直近 12 週の閲覧数の推移" />
    </div>
  ),
  play: async ({ canvas }) => {
    // 名前がなければ飾りとして読まない
    await expect(canvas.getByTestId('decorative')).toHaveAttribute('aria-hidden', 'true');
    // 名前があれば 1 枚の絵として読む
    await expect(canvas.getByRole('img')).toHaveAccessibleName('直近 12 週の閲覧数の推移');
  },
};
