import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { VisuallyHidden } from './VisuallyHidden';
import { Button } from '../button/Button';
import { Heading } from '../heading/Heading';
import { Link } from '../link/Link';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '画面には出さず、読み上げにだけ届ける文字です。',
          '',
          '- アイコンだけのボタンの名前、見えている文字だけでは足りない補足（「3 件中 1 件目」「必須」）に使います。名前だけなら `aria-label` でも足ります。',
          '- 文の途中に補足を挟むときや、見えている文字に続けて読ませたいときは、VisuallyHidden にします。`aria-label` は中の文字を読ませなくするためです。',
          '- `focusable`（既定は `false`）は、キーボードでフォーカスが来たときだけ見せます。本文へ飛ぶリンクのように Tab で止まる要素を `render` に渡すときに使います。',
          '- `render`（既定は `span`）で描く要素を変えられます。',
        ].join('\n'),
      },
    },
  },
  args: { children: '読み上げにだけ届く文字' },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InContext: Story = {
  tags: ['visual'],
  name: '使う場面',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-[28rem] flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline">
          <MagnifyingGlassIcon aria-hidden weight="bold" className="size-(--spacing-icon)" />
          <VisuallyHidden>記事を検索</VisuallyHidden>
        </Button>
        <Text as="span" size="sm" variant="subtle">
          アイコンだけのボタンの名前
        </Text>
      </div>
      <div className="flex flex-col gap-2">
        <Heading level={3}>
          デザイン原則を書き直した
          <VisuallyHidden>（3 件中 1 件目）</VisuallyHidden>
        </Heading>
        <div className="flex gap-2">
          <Tag>
            <VisuallyHidden>タグ: </VisuallyHidden>Design
          </Tag>
          <Tag>
            <VisuallyHidden>タグ: </VisuallyHidden>UI
          </Tag>
        </div>
        <Text size="sm" variant="subtle">
          見出しとタグに、見えている文字に続けて読む補足を足す
        </Text>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '記事を検索' })).toBeVisible();
    // 読み上げの名前は、見えている文字に続けて補足を読む（Chrome は間に空白を入れることがある）
    await expect(
      canvas.getByRole('heading', { name: /^デザイン原則を書き直した\s?（3 件中 1 件目）$/ })
    ).toBeVisible();
  },
};

export const SkipLink: Story = {
  name: '本文へ飛ぶリンク（focusable）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Tab を 1 回押すと、ページの先頭に「本文へスキップ」が出ます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <VisuallyHidden focusable render={<Link href="#main" variant="outline" />}>
        本文へスキップ
      </VisuallyHidden>
      <nav className="flex gap-4">
        <Link href="#works">Works</Link>
        <Link href="#blog">Blog</Link>
        <Link href="#about">About</Link>
      </nav>
      <main id="main">
        <Text>本文です。</Text>
      </main>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const skip = within(canvasElement).getByRole('link', { name: '本文へスキップ' });
    await expect(skip).toHaveClass('sr-only');
    await userEvent.tab();
    await expect(skip).toHaveFocus();
  },
};
