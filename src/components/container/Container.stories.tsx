import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Text } from '../text/Text';
import { Container } from './Container';
import { SamplePage, ScreenOf } from './story-page';
import { DensityPair } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const sizes = ['prose', 'default', 'wide', 'full'] as const;
const paddings = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

const meta = {
  title: 'Components/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'ページの本文の幅と左右の余白を決める枠です。中身を中央に寄せ、画面の端に部品が付かないよう左右を空けます。',
          '',
          '- `size` は中身の幅の上限です。記事のような読みものは `prose`、カードの一覧や設定の画面は `default`（既定）、表や画像を大きく並べる画面は `wide`、上限なしは `full` です。',
          '- 画面が上限より狭いときは、画面の幅から左右の余白を引いた幅になります。左右の余白は、置いた場所の幅に合わせて 16〜48px のあいだで変わります。入力方式では変わりません。',
          '- `py` は上下の余白です。`none`（既定）・`xs`・`sm`・`md`・`lg`・`xl` から選び、値は Stack の間隔と同じ段です。中を並べる間隔は Stack を子に入れて決めます。',
          '- `reading` を渡すと、中が読みものになります。読む文字は、指で操作しているときもマウスと同じ大きさになります。Markdown を変換した HTML を入れるときは、代わりに Prose を使います。',
          '- 背景の大きな文字などの飾りは、Container の外側に置きます。Container は幅と余白だけを持ち、色や線を持ちません。',
          '- `main`・`section` にするときは `render={<main />}` を渡します。',
        ].join('\n'),
      },
    },
  },
  args: { size: 'default', py: 'none' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: "'default'" } },
    },
    py: {
      control: 'inline-radio',
      options: paddings,
      table: { defaultValue: { summary: "'none'" } },
    },
    reading: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Container size="prose" render={<main />}>
          <Prose>…</Prose>
        </Container>
      `),
    },
  },
  render: (args) => (
    <div className="bg-neutral py-6">
      <Container {...args}>
        <div className="rounded-control bg-bg p-4">
          <Text>中身の幅の上限は size で決まり、左右には余白が付きます。</Text>
        </div>
      </Container>
    </div>
  ),
};

// 段ごとの幅。グレーの部分が左右の余白と、上限の外
export const Sizes: Story = {
  tags: ['visual'],
  name: '幅の段',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 bg-neutral py-6">
      {sizes.map((size) => (
        <Container key={size} size={size}>
          <div className="rounded-control bg-bg px-3 py-2 outline-1 outline-line-strong outline-dashed">
            <Text size="sm">{size}</Text>
          </div>
        </Container>
      ))}
    </div>
  ),
};

// 上下の余白の段。グレーの部分が Container の余白（上下と左右）
export const Paddings: Story = {
  tags: ['visual'],
  name: '上下の余白',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`py` は上下の余白です。値は Stack の間隔と同じ段で、グレーの部分が余白です。並べる間隔は Stack を子に入れて決めます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3">
      {paddings.map((py) => (
        <div key={py} className="bg-neutral">
          <Container py={py}>
            <div className="rounded-control bg-bg px-3 py-2 outline-1 outline-line-strong outline-dashed">
              <Text size="sm">py=&quot;{py}&quot;</Text>
            </div>
          </Container>
        </div>
      ))}
    </div>
  ),
};

// 画面の幅ごとの見本のページ。縮めて並べる。グレーが左右の余白
export const Screens: Story = {
  tags: ['visual'],
  name: '画面の幅と密度',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'スマートフォン（390px）とデスクトップ（1280px）の幅で、見本のページを縮めて並べています。グレーの部分が左右の余白です。',
      },
    },
  },
  render: () => (
    <div className="p-6">
      <DensityPair>
        <div className="flex items-start gap-6">
          <ScreenOf width={390} height={760} scale={0.5}>
            <SamplePage guides />
          </ScreenOf>
          <ScreenOf width={1280} height={760} scale={0.3}>
            <SamplePage guides />
          </ScreenOf>
        </div>
      </DensityPair>
    </div>
  ),
};

// props の確かめ: render で要素を変えられる。size の既定は default
export const Render: Story = {
  name: '描く要素',
  render: () => (
    <Container render={<main />}>
      <Text>本文</Text>
    </Container>
  ),
  play: async ({ canvas }) => {
    const main = canvas.getByRole('main');
    await expect(main).toHaveAttribute('data-slot', 'container');
    await expect(getComputedStyle(main).maxWidth).not.toBe('none');
  },
};

// props の確かめ: reading は data-reading を付ける（読む文字が指でも 16px になる）
export const Reading: Story = {
  name: '読みもの',
  render: () => (
    <Container reading data-testid="reading">
      <Text>記事の本文です。</Text>
    </Container>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('reading')).toHaveAttribute('data-reading', '');
  },
};
