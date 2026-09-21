import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Mark } from './Mark';
import { Blockquote } from '../blockquote/Blockquote';
import { Heading } from '../heading/Heading';
import { Link } from '../link/Link';
import { Text } from '../text/Text';
import { Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/Mark',
  component: Mark,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '文の中で目立たせたい言葉です。検索で当たった語や、読み手に拾ってほしい一句に使います。',
          '',
          '- 黄色を薄く敷きます。文字の色は周りの文字のままです。',
          '- 黄色は Primary の青の反対の色なので、青い文字のリンクと並んでも紛れません。',
          '- 強く言いたいだけなら `strong` を使います。Mark は、読み手の目を止めたいところに使います。',
        ].join('\n'),
      },
    },
  },
  args: { children: '密度は入力方式で切り替えます' },
  argTypes: {
    children: { control: 'text' },
  },
  render: (args) => (
    <Text>
      この UI では、
      <Mark {...args} />
      。画面の幅では切り替えません。
    </Text>
  ),
} satisfies Meta<typeof Mark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Grounds: Story = {
  tags: ['visual'],
  name: '置く場所',
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: '見出し・本文・注記・グレーの面と、行をまたいで折り返したときです。' },
    },
  },
  render: () => (
    <Gallery columnWidth="18rem">
      <Specimen label="見出し・本文・注記">
        <div className="flex flex-col gap-2">
          <Heading level={3}>
            <Mark>密度</Mark>の切り替え
          </Heading>
          <Text>
            <Mark>指で操作しているとき</Mark>は、部品を大きくします。
            <Link href="#density">密度について</Link>
          </Text>
          <Text size="sm" variant="subtle">
            注記の中の <Mark>Mark</Mark>
          </Text>
        </div>
      </Specimen>
      <Specimen label="グレーの面">
        <Blockquote variant="surface">
          色は<Mark>役割で持ちます</Mark>。
        </Blockquote>
      </Specimen>
      <Specimen label="折り返し">
        <Text className="w-[14rem]">
          部品の大きさは、<Mark>画面の幅ではなく、マウスか指かで切り替えます</Mark>。
        </Text>
      </Specimen>
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '要素',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('密度は入力方式で切り替えます').tagName).toBe('MARK');
  },
};
