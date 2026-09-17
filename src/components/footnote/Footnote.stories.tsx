import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { FootnoteItem, FootnoteRef, Footnotes } from './Footnote';
import { Text } from '../text/Text';
import { DensityPair } from '../../stories/story-parts';

const Sample = () => (
  <div data-reading className="flex max-w-xl flex-col gap-6">
    <Text>
      和文と欧文を混ぜても、文字は行の中央にそろえます
      <FootnoteRef id="1" />
      。行の高さは整数の値にします
      <FootnoteRef id="2" />。
    </Text>
    <Footnotes label="脚注">
      <FootnoteItem id="1">
        和文フォントは、縦の寸法を漢字の枠に合わせて補正しています。
      </FootnoteItem>
      <FootnoteItem id="2">端数があると、置かれた位置によって文字だけがずれます。</FootnoteItem>
    </Footnotes>
  </div>
);

const meta = {
  title: 'Components/Footnote',
  component: Footnotes,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の脚注です。Markdown（GFM）の `[^1]` を変換した HTML と同じ要素と属性を出します。',
          '',
          '- 本文の参照は `FootnoteRef` です。上付きの `[1]` で、青い文字のリンクになります。',
          '- 末尾の一覧は `Footnotes` に `FootnoteItem` を並べます。文字は注記の大きさで補足の濃さ、項目の後ろに参照へ戻るリンク（↩）が付きます。',
          '- `Footnotes` の見出し（`label`）は読み上げだけで、参照の説明にもなります。',
          '- 本文と一覧のあいだの区切り（線など）は持ちません。置く側で `Divider` などを置きます。',
        ].join('\n'),
      },
    },
  },
  render: () => <Sample />,
} satisfies Meta<typeof Footnotes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: () => (
    <DensityPair>
      <div className="w-[22rem]">
        <Sample />
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    const ref = canvas.getByRole('link', { name: '1' });
    await expect(ref).toHaveAttribute('href', '#user-content-fn-1');
    await expect(ref).toHaveAccessibleDescription('脚注');
    await expect(canvas.getByRole('link', { name: 'Back to reference 2' })).toHaveAttribute(
      'href',
      '#user-content-fnref-2'
    );
  },
};
