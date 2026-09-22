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
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'inherit'],
      table: { defaultValue: { summary: "'sm'" } },
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

export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさ',
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story:
          'sm（既定）・md・lg の 3 段です（ADR-0259）。inherit は段を持たず、周りの文字の大きさに従います。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="sm・md・lg">
        <div className="flex flex-wrap items-center gap-2">
          <Tag {...args} size="sm">
            sm
          </Tag>
          <Tag {...args} size="md">
            md
          </Tag>
          <Tag {...args} size="lg">
            lg
          </Tag>
        </div>
      </Specimen>
      <Specimen label="inherit（本文 16px）">
        <p style={{ fontSize: 16 }}>
          下書きの記事{' '}
          <Tag {...args} size="inherit" color="primary">
            公開前
          </Tag>{' '}
          のタグが付いています
        </p>
      </Specimen>
      <Specimen label="inherit（注記 14px）">
        <p style={{ fontSize: 14 }} className="text-fg-muted">
          下書きの記事{' '}
          <Tag {...args} size="inherit" color="primary">
            公開前
          </Tag>{' '}
          のタグが付いています
        </p>
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
