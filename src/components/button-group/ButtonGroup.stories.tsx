import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent } from 'storybook/test';

import { ButtonGroup, type ButtonGroupProps } from './ButtonGroup';
import { Button } from '../button/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '../../internal/icons';
import { DensityPair } from '../../stories/story-parts';

const frames = ['connected', 'gap'] as const;
const orientations = ['horizontal', 'vertical'] as const;

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '複数の `Button` を視覚的に連結して並べます。選んでいる状態は持たない、素の `Button` の並びです。',
          '',
          '- 詰め方は `frame` で選びます。`connected`（既定）は隣り合わせて仕切りの細い線で区切り、`gap` はそれぞれ離して並べます。',
          '- 並べる向きは `orientation` で選びます（既定 `horizontal`）。',
          '- 中の `Button` はそれぞれ独立した操作です。矢印キーの移動は持たず、ふつうに Tab で移ります。',
          '- 色や見た目をそろえたいときは、それぞれの `Button` に同じ `color`・`variant` を渡します。',
          '- 見出しが近くにないときは `aria-label` を付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    frame: 'connected',
    orientation: 'horizontal',
  },
  argTypes: {
    frame: {
      control: 'inline-radio',
      options: frames,
      table: { defaultValue: { summary: "'connected'" } },
    },
    orientation: {
      control: 'inline-radio',
      options: orientations,
      table: { defaultValue: { summary: "'horizontal'" } },
    },
  },
} satisfies Meta<ButtonGroupProps>;

export default meta;
type Story = StoryObj<Meta<ButtonGroupProps>>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <ButtonGroup {...args} aria-label="編集">
      <Button variant="outline">切り取り</Button>
      <Button variant="outline">コピー</Button>
      <Button variant="outline">貼り付け</Button>
    </ButtonGroup>
  ),
};

// Show code: render の JSX をそのまま出す（dynamic。meta の source.type）
export const Frames: Story = {
  name: '詰め方',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['frame'] },
    docs: {
      description: {
        story:
          '`connected`（既定）は隣り合わせ、仕切りの細い線で区切り、両端だけ角丸を残します。`gap` はそれぞれ離して並べます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {frames.map((frame) => (
        <div key={frame} className="flex flex-col gap-1">
          <p className="text-xs font-bold text-fg-subtle">{frame}</p>
          <ButtonGroup {...args} frame={frame} aria-label="編集">
            <Button variant="outline">切り取り</Button>
            <Button variant="outline">コピー</Button>
            <Button variant="outline">貼り付け</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
};

export const Orientations: Story = {
  name: '向き',
  tags: ['visual'],
  parameters: {
    controls: { exclude: ['orientation'] },
    docs: {
      description: {
        story: '`vertical` では、縦に連結して並べます。',
      },
    },
  },
  render: (args) => (
    <div className="flex items-start gap-8">
      {orientations.map((orientation) => (
        <div key={orientation} className="flex flex-col gap-1">
          <p className="text-xs font-bold text-fg-subtle">{orientation}</p>
          <ButtonGroup {...args} orientation={orientation} aria-label="編集">
            <Button variant="outline">切り取り</Button>
            <Button variant="outline">コピー</Button>
            <Button variant="outline">貼り付け</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
};

export const IconOnly: Story = {
  name: 'アイコンだけ',
  tags: ['visual'],
  render: (args) => (
    <ButtonGroup {...args} aria-label="ページ送り">
      <Button variant="outline" iconOnly aria-label="前へ">
        <ArrowLeftIcon standalone />
      </Button>
      <Button variant="outline" iconOnly aria-label="次へ">
        <ArrowRightIcon standalone />
      </Button>
    </ButtonGroup>
  ),
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
  render: (args) => (
    <DensityPair>
      <ButtonGroup {...args} aria-label="編集">
        <Button variant="outline">切り取り</Button>
        <Button variant="outline">コピー</Button>
        <Button variant="outline">貼り付け</Button>
      </ButtonGroup>
    </DensityPair>
  ),
};

// play: 読み上げや props の確かめ
export const Accessibility: Story = {
  name: '読み上げ',
  render: (args) => (
    <ButtonGroup {...args} aria-label="編集">
      <Button variant="outline" onClick={fn()}>
        切り取り
      </Button>
      <Button variant="outline" onClick={fn()}>
        コピー
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: '編集' });
    await expect(group).toBeInTheDocument();
    const cut = canvas.getByRole('button', { name: '切り取り' });
    const copy = canvas.getByRole('button', { name: 'コピー' });
    // Tab で1つずつ移る。矢印キーの移動は持たない
    await userEvent.tab();
    await expect(cut).toHaveFocus();
    await userEvent.tab();
    await expect(copy).toHaveFocus();
  },
};
