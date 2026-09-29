import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Heading } from './Heading';
import { Text } from '../text/Text';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const levels = [1, 2, 3, 4] as const;
const sizes = ['md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;

const meta = {
  title: 'Components/Heading',
  component: Heading,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ページや記事の見出しです。',
          '',
          '- `level` は文書の構造で、`h1`〜`h6` のどれで描くかを決めます。既定は `2` です。段を飛ばさないようにします。',
          '- `size` は見た目の大きさです。`md`（本文と同じ）から `5xl` まであり、Text の `size` と同じ名前です。指定しないときは段から決まり、`h1` は `2xl`、`h2` は `xl`、`h3` は `lg`、`h4`〜`h6` は `md` です。カードの中の `h3` を小さく見せるときのように、構造と見た目を分けたいときに使います。',
          '- `3xl`〜`5xl` は、ポートフォリオのトップ（Hero）や、ランディングの節の大見出しに使う段です。機能の画面には使いません。',
          '- 大きさは、マウスで操作しているときより指で操作しているときに一段小さくなります。記事の中（`data-reading` を付けた要素）では、指でもマウスと同じ大きさです。',
          '- 英語のサブ見出し（WORKS など）は持ちません。ページの側で組みます。',
          '- 折り返し方は決めていません。行の長さをそろえる（`text-balance`）、文節で折る（`[word-break:auto-phrase]`。`lang="ja"` が必要）などは、`className` で付けます。',
        ].join('\n'),
      },
    },
  },
  args: { children: 'ポートフォリオを作り直しました', level: 2 },
  argTypes: {
    children: { control: 'text' },
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'inline-radio', options: [undefined, ...sizes] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさと密度',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '左がマウス、右が指です。4 段目は本文と同じ大きさの太字です。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <div className="flex w-[22rem] flex-col gap-3">
        {levels.map((level) => (
          <Heading key={level} level={level}>
            {level} 段目の見出し Heading
          </Heading>
        ))}
        <Text>本文の大きさと並べたときの見え方です。</Text>
      </div>
    </DensityPair>
  ),
};

export const LargeSizes: Story = {
  tags: ['visual'],
  name: '大きい段（Hero）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`3xl`〜`5xl` は Hero や節の大見出しに使います。左がマウス、右が指です。指で操作しているときは、一段ずつ小さくなります。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <div className="flex w-[28rem] flex-col gap-3">
        <Heading level={1} size="5xl" className="text-balance [word-break:auto-phrase]" lang="ja">
          やわらかい UI を作る
        </Heading>
        <Heading level={2} size="4xl">
          作品
        </Heading>
        <Heading level={3} size="3xl">
          料金
        </Heading>
        <Heading level={3} size="2xl">
          2xl の見出し
        </Heading>
      </div>
    </DensityPair>
  ),
};

export const Reading: Story = {
  tags: ['visual'],
  name: '読みものの中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`data-reading` を付けた要素の中では、指で操作していてもマウスと同じ大きさです。記事の本文に使います。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="22rem">
      <Specimen label="指・機能の画面">
        <div data-density="coarse" className="flex flex-col gap-2">
          <Heading level={2}>設定</Heading>
          <Text>通知と表示の設定です。</Text>
        </div>
      </Specimen>
      <Specimen label="指・読みもの（data-reading）">
        <div data-density="coarse" data-reading className="flex flex-col gap-2">
          <Heading level={2}>Design System を作る理由</Heading>
          <Text>どちらにも、それぞれに合った密度の部品が欲しかったのです。</Text>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '段と大きさ',
  args: { level: 3, size: '2xl', children: '構造は h3、見た目は 2xl' },
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 3 });
    await expect(heading).toHaveTextContent('構造は h3、見た目は 2xl');
    await expect(heading.className).toContain('text-heading-2xl');
  },
};
