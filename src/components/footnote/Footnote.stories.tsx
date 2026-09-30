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
          '- 戻るリンクの読み上げは「参照 1 に戻る」です。`backrefName` に、識別子を受けて文を返す関数を渡すと変えられます。',
          '- id は GFM の変換と同じ `user-content-fn-1` の形です。1 ページに一覧を 2 つ置くときは、組ごとに `idPrefix` を変えます（remark-rehype の `clobberPrefix` と同じ値にします）。',
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
    await expect(canvas.getByRole('link', { name: '参照 2 に戻る' })).toHaveAttribute(
      'href',
      '#user-content-fnref-2'
    );
  },
};

export const IdPrefix: Story = {
  name: '2 つの一覧と読み上げの名前',
  render: () => (
    <div data-reading className="flex max-w-xl flex-col gap-6">
      <Text>
        1 つ目の記事
        <FootnoteRef id="1" />
      </Text>
      <Footnotes label="1 つ目の脚注">
        <FootnoteItem id="1">1 つ目の記事の脚注です。</FootnoteItem>
      </Footnotes>
      <Text>
        2 つ目の記事
        <FootnoteRef id="1" idPrefix="second-" />
      </Text>
      <Footnotes label="2 つ目の脚注" idPrefix="second-">
        <FootnoteItem id="1" idPrefix="second-" backrefName={(id) => `Back to reference ${id}`}>
          2 つ目の記事の脚注です。
        </FootnoteItem>
      </Footnotes>
    </div>
  ),
  play: async ({ canvas }) => {
    const [first, second] = canvas.getAllByRole('link', { name: '1' });
    await expect(first).toHaveAttribute('href', '#user-content-fn-1');
    await expect(first).toHaveAccessibleDescription('1 つ目の脚注');
    await expect(second).toHaveAttribute('href', '#second-fn-1');
    await expect(second).toHaveAttribute('id', 'second-fnref-1');
    await expect(second).toHaveAccessibleDescription('2 つ目の脚注');
    await expect(canvas.getByRole('link', { name: '参照 1 に戻る' })).toHaveAttribute(
      'href',
      '#user-content-fnref-1'
    );
    await expect(canvas.getByRole('link', { name: 'Back to reference 1' })).toHaveAttribute(
      'href',
      '#second-fnref-1'
    );
  },
};
