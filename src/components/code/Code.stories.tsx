import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Code } from './Code';
import { Blockquote } from '../blockquote/Blockquote';
import { Heading } from '../heading/Heading';
import { Notice } from '../notice/Notice';
import { Text } from '../text/Text';
import { Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/Code',
  component: Code,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '文の中に置く、短いコード（識別子・ファイル名・コマンド）です。複数行のコードには CodeBlock を使います。',
          '',
          '- 大きさと余白は周りの文字に合わせて決まるので、見出しの中でも本文の中でも同じ形です。',
          '- 面は周りの文字の色を淡く敷き、文字も周りの色に合わせます。白地・グレーの面・色の面・濃い塗りのどこに置いても見えます。',
          '- `wrap` は折り返し方です。`normal`（既定）は空白やハイフンのあとで折り返し、1 行に収まらないときだけ語の途中でも折ります。`nowrap` は折り返さず、幅に収まらないとはみ出します。',
        ].join('\n'),
      },
    },
  },
  args: { children: 'useFormSubmittingLock()', wrap: 'normal' },
  argTypes: {
    children: { control: 'text' },
    wrap: { control: 'inline-radio', options: ['normal', 'nowrap'] },
  },
  render: (args) => (
    <Text>
      フォームを送っているあいだは <Code {...args} /> を呼びます。
    </Text>
  ),
} satisfies Meta<typeof Code>;

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
    docs: { description: { story: '地の色が変わっても、地より一段濃い面になります。' } },
  },
  render: () => (
    <Gallery columnWidth="18rem">
      <Specimen label="見出し・本文">
        <div className="flex flex-col gap-2">
          <Heading level={3}>
            <Code>Select</Code> の使い方
          </Heading>
          <Text>
            設定は <Code>next.config.mjs</Code> に書きます。
          </Text>
          <Text size="sm" tone="subtle">
            注記の中の <Code>pnpm run fonts</Code>
          </Text>
        </div>
      </Specimen>
      <Specimen label="グレーの面">
        <Blockquote appearance="surface">
          <Code>locked</Code> のあいだ止めます。
        </Blockquote>
      </Specimen>
      <Specimen label="色の面・濃い塗り">
        <div className="flex flex-col gap-3">
          <Notice color="warning" title="注意" live={false}>
            <Code>coarse-large</Code> は名前が変わります。
          </Notice>
          <Notice color="info" appearance="filled" title="補足" live={false}>
            <Code>data-density</Code> で固定できます。
          </Notice>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Wrapping: Story = {
  tags: ['visual'],
  name: '折り返し',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '幅 16rem の段落です。`normal` はハイフンのあとで折り返します。`nowrap` は折り返さず、はみ出します。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="wrap=normal（既定）">
        <Text className="w-[16rem]">
          文字の大きさは <Code>--text-body-sm-coarse</Code> で決まります。
        </Text>
      </Specimen>
      <Specimen label="wrap=nowrap">
        <Text className="w-[16rem]">
          文字の大きさは <Code wrap="nowrap">--text-body-sm-coarse</Code> で決まります。
        </Text>
      </Specimen>
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '要素',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('useFormSubmittingLock()').tagName).toBe('CODE');
  },
};
