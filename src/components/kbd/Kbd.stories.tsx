import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Kbd } from './Kbd';
import { Code } from '../code/Code';
import { Text } from '../text/Text';
import { DensityPair } from '../../stories/story-parts';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '文の中でキーボードのキーを示します。',
          '',
          '- 組み合わせは `Kbd` を並べ、あいだに「+」などの文字を置きます（`<Kbd>⌘</Kbd> + <Kbd>K</Kbd>`）。',
          '- 大きさは周りの文字に合わせて決まります。',
          '- キーの絵ですが、押せる部品ではありません。押せる操作にはボタンを使います。',
        ].join('\n'),
      },
    },
  },
  args: { children: 'Esc' },
  argTypes: { children: { control: 'text' } },
  render: (args) => (
    <Text>
      閉じるときは <Kbd {...args} /> を押します。
    </Text>
  ),
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const InText: Story = {
  tags: ['visual'],
  name: '文の中と密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="flex w-[22rem] flex-col gap-2">
        <Text>
          検索は <Kbd>⌘</Kbd> + <Kbd>K</Kbd>、Windows では <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> +{' '}
          <Kbd>P</Kbd> です。
        </Text>
        <Text>
          <Code>onKeyDown</Code> で <Kbd>Enter</Kbd> を受け取ります。
        </Text>
        <Text size="sm" tone="subtle">
          注記の中の <Kbd>Tab</Kbd>
        </Text>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '要素',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Esc').tagName).toBe('KBD');
  },
};
