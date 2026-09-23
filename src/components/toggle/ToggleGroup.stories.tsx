import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent } from 'storybook/test';

import { Toggle } from './Toggle';
import { ToggleGroup, type ToggleGroupProps } from './ToggleGroup';
import { ListIcon } from '../../internal/icons';
import { DensityPair } from '../../stories/story-parts';

const frames = ['connected', 'gap'] as const;

const meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '`Toggle` をまとめて、1つ（ラジオのよう）か複数（チェックボックスのよう）を押せるようにします。',
          '',
          '- `multiple`（既定 `false`）が `false` のときは、1つを押すとほかが外れます。`true` のときは、それぞれ独立して押せます。',
          '- 詰め方は `frame` で選びます。`connected`（既定）は隣り合わせて仕切りの細い線で区切り、`gap` はそれぞれ離して並べます。',
          '- 中の `Toggle` に `value` を付けて並べます。押している value の並びが `value`（`defaultValue`）です。',
          '- `color`・`variant` はグループでまとめて指定でき、`Toggle` ごとに上書きできます。',
        ].join('\n'),
      },
    },
  },
  args: {
    frame: 'connected',
    multiple: false,
    color: 'primary',
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    frame: {
      control: 'inline-radio',
      options: frames,
      table: { defaultValue: { summary: "'connected'" } },
    },
    multiple: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<ToggleGroupProps>;

export default meta;
type Story = StoryObj<Meta<ToggleGroupProps>>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <ToggleGroup {...args} aria-label="文字の飾り" defaultValue={['bold']}>
      <Toggle value="bold">太字</Toggle>
      <Toggle value="italic">斜体</Toggle>
      <Toggle value="underline">下線</Toggle>
    </ToggleGroup>
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
          <ToggleGroup {...args} frame={frame} aria-label="文字の飾り" defaultValue={['bold']}>
            <Toggle value="bold">太字</Toggle>
            <Toggle value="italic">斜体</Toggle>
            <Toggle value="underline">下線</Toggle>
          </ToggleGroup>
        </div>
      ))}
    </div>
  ),
};

export const Multiple: Story = {
  name: '複数選べる',
  parameters: {
    controls: { exclude: ['multiple'] },
    docs: {
      description: {
        story:
          '`multiple` を付けると、それぞれ独立して押せます（テキストの装飾など）。付けないとき（既定）は、1つを押すとほかが外れます（表示の切り替えなど）。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ToggleGroup {...args} multiple aria-label="文字の飾り" defaultValue={['bold']}>
        <Toggle value="bold">太字</Toggle>
        <Toggle value="italic">斜体</Toggle>
        <Toggle value="underline">下線</Toggle>
      </ToggleGroup>
      <ToggleGroup {...args} aria-label="並べ方" defaultValue={['list']}>
        <Toggle value="list" iconOnly aria-label="リスト表示">
          <ListIcon standalone />
        </Toggle>
        <Toggle value="grid" iconOnly aria-label="グリッド表示">
          <ListIcon standalone />
        </Toggle>
      </ToggleGroup>
    </div>
  ),
};

export const Densities: Story = {
  name: '密度',
  tags: ['visual'],
  render: (args) => (
    <DensityPair>
      <ToggleGroup {...args} aria-label="文字の飾り" defaultValue={['bold']}>
        <Toggle value="bold">太字</Toggle>
        <Toggle value="italic">斜体</Toggle>
        <Toggle value="underline">下線</Toggle>
      </ToggleGroup>
    </DensityPair>
  ),
};

// play: 読み上げや props の確かめ
export const Accessibility: Story = {
  name: '読み上げ',
  render: (args) => (
    <ToggleGroup {...args} aria-label="文字の飾り" defaultValue={['bold']}>
      <Toggle value="bold">太字</Toggle>
      <Toggle value="italic">斜体</Toggle>
    </ToggleGroup>
  ),
  play: async ({ args, canvas }) => {
    const bold = canvas.getByRole('button', { name: '太字' });
    const italic = canvas.getByRole('button', { name: '斜体' });
    // multiple=false（既定）では、1つを押すとほかが外れる
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(italic);
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onValueChange).toHaveBeenCalledWith(['italic']);
  },
};
