import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Blockquote } from './Blockquote';
import { DensityPair, Matrix } from '../../stories/story-parts';

const variants = ['line', 'surface'] as const;
const colors = ['neutral', 'brand', 'primary', 'secondary'] as const;

// 引用符（Phosphor の Quotes、線の細い形）。利用者は @phosphor-icons/react の <Quotes /> を渡す
const QuotesIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ strokeWidth: 'var(--icon-stroke)' }}
  >
    <path d="M108,144H40a8,8,0,0,1-8-8V72a8,8,0,0,1,8-8h60a8,8,0,0,1,8,8v88a40,40,0,0,1-40,40" />
    <path d="M224,144H156a8,8,0,0,1-8-8V72a8,8,0,0,1,8-8h60a8,8,0,0,1,8,8v88a40,40,0,0,1-40,40" />
  </svg>
);

const quote =
  'コンポーネントがいっぱいあるけど、マテリアルデザインほどかたい感じじゃないモダンな UI ライブラリがつくりたい。';

const meta = {
  title: 'Components/Blockquote',
  component: Blockquote,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中で、ほかの文章を引くときに使います。',
          '',
          '- `variant` は見た目です。`line`（既定）は左に線、`surface` は入力欄と同じグレーの面です。',
          '- `color` は線とアイコンの色です。`neutral`（既定）はグレー、`brand` は水色、`primary`・`secondary` は利用者が選ぶ色です。`surface` では面の色は変わりません。',
          '- `icon` に引用符などのアイコンを渡すと、1 行目の左に置きます。文と並ぶので、線の細い形を使います。',
          '- `source` に出典を渡すと、引用の下に小さく出します。URL は `cite` 属性に渡します。',
        ].join('\n'),
      },
    },
  },
  args: {
    children: quote,
    variant: 'line',
    color: 'neutral',
    source: '— @kazuemon/ui の README',
  },
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'inline-radio', options: variants },
    color: { control: 'inline-radio', options: colors },
    source: { control: 'text' },
    icon: { control: false },
  },
} satisfies Meta<typeof Blockquote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export const Variants: Story = {
  tags: ['visual'],
  name: '見た目と色',
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={colors}
      rowLabel={(color) => color}
      columns={
        [
          { label: 'line', variant: 'line', icon: false },
          { label: 'line・icon', variant: 'line', icon: true },
          { label: 'surface', variant: 'surface', icon: false },
          { label: 'surface・icon', variant: 'surface', icon: true },
        ] as const
      }
      columnWidth="16rem"
      renderCell={(color, column) => (
        <Blockquote
          color={color}
          variant={column.variant}
          icon={column.icon ? <QuotesIcon /> : undefined}
        >
          Design はほぼ独学です。
        </Blockquote>
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度と出典',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="flex w-[22rem] flex-col gap-4">
        <Blockquote source="— @kazuemon/ui の README">{quote}</Blockquote>
        <Blockquote variant="surface" icon={<QuotesIcon />}>
          {quote}
        </Blockquote>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '出典',
  args: { cite: 'https://github.com/kazuemon/ui' },
  play: async ({ canvas, canvasElement }) => {
    const blockquote = canvasElement.querySelector('blockquote');
    await expect(blockquote).toHaveAttribute('cite', 'https://github.com/kazuemon/ui');
    await expect(canvas.getByText('— @kazuemon/ui の README').tagName).toBe('FIGCAPTION');
  },
};
