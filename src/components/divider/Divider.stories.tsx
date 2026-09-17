import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Divider } from './Divider';
import { Text } from '../text/Text';
import { Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '文章の話題の切れ目に置く区切り線です。Markdown の `---` と同じ `<hr>` を出します。',
          '',
          '- `appearance` は見た目です。`full`（既定）は幅いっぱいの細い線、`short` は中央の短い細い線、`accent` は中央の色のある短い太い線です。',
          '- `color` は `accent` の線の色です。`brand`（既定、水色）・`primary`・`secondary` から選びます。ほかの色は `style` で `--divider-accent` を上書きします。',
          '- 上下の余白は持ちません。置く側で決めます。',
          '- 飾りとして置くときは `decorative` を付けると、読み上げで区切りと伝えません。',
        ].join('\n'),
      },
    },
  },
  args: { appearance: 'full', color: 'brand' },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['full', 'short', 'accent'] },
    color: { control: 'inline-radio', options: ['brand', 'primary', 'secondary'] },
  },
  render: (args) => (
    <div data-reading className="flex max-w-xl flex-col gap-6">
      <Text>話題の終わりの段落です。</Text>
      <Divider {...args} />
      <Text>次の話題の段落です。</Text>
    </div>
  ),
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Appearances: Story = {
  tags: ['visual'],
  name: '見た目',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="full（既定）">
        <Divider />
      </Specimen>
      <Specimen label="short">
        <Divider appearance="short" />
      </Specimen>
      <Specimen label="accent・brand">
        <Divider appearance="accent" />
      </Specimen>
      <Specimen label="accent・primary">
        <Divider appearance="accent" color="primary" />
      </Specimen>
      <Specimen label="accent・secondary">
        <Divider appearance="accent" color="secondary" />
      </Specimen>
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('separator')).toBeInTheDocument();
  },
};
