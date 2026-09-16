import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tag } from './Tag';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const userColors = ['primary', 'secondary', 'neutral'] as const;
const statusColors = ['info', 'success', 'warning', 'danger'] as const;

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'カテゴリや状態を表す小さな印です。押せません。',
          '',
          '- 色は、利用者が選ぶ `primary`・`secondary`・`neutral`（既定）と、状態を表す `info`・`success`・`warning`・`danger` があります。',
          '- 状態の色は、お知らせ（`Notice` の `soft`）と同じ面と文字の色です。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: { children: 'デザイン', color: 'neutral' },
  argTypes: {
    children: { control: 'text' },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    color: {
      control: 'inline-radio',
      options: [...userColors, ...statusColors],
      table: { defaultValue: { summary: "'neutral'" } },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: { controls: { exclude: ['color'] } },
  render: (args) => (
    <Gallery>
      <Specimen label="利用者が選ぶ色">
        <div className="flex flex-wrap gap-2">
          {userColors.map((color) => (
            <Tag key={color} {...args} color={color}>
              {color}
            </Tag>
          ))}
        </div>
      </Specimen>
      <Specimen label="状態の色">
        <div className="flex flex-wrap gap-2">
          {statusColors.map((color) => (
            <Tag key={color} {...args} color={color}>
              {color}
            </Tag>
          ))}
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: {
    docs: {
      description: { story: '文字の大きさは入力方式で切り替わり、タグの大きさはそれに従います。' },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="flex flex-wrap gap-2">
        <Tag {...args} color="primary" />
        <Tag {...args} />
        <Tag {...args} color="success">
          公開中
        </Tag>
      </div>
    </DensityPair>
  ),
};
