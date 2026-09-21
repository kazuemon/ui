import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Text } from './Text';
import { Link } from '../link/Link';
import { DensityPair } from '../../stories/story-parts';

const variants = ['body', 'muted', 'subtle'] as const;

const meta = {
  title: 'Components/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '段落や注記などの、読む文字です。',
          '',
          '- `size` は `md`（既定、本文）と `sm`（日付や注記）です。',
          '- `variant` は見た目です。`body`（既定）は本文、`muted` は補足、`subtle` は目立たせない文、`label` は欄のラベルと同じ大きさ・太さ・色、`caption` は欄のキャプションと同じ大きさ・色です。',
          '- `weight` は太さです。`normal`・`medium`・`bold` から選びます。書かないと、`variant` と要素の既定の太さのままです。',
          '- `as` で要素を選びます。段落は `p`（既定）、文の中の一部は `span`、ほかの部品を含むときは `div` です。強調は `strong`、強勢は `em`、打ち消しは `del` で、記事の本文と同じ飾りが付きます。',
          '- 本文は、マウスで操作しているときは 16px、指で操作しているときは部品の文字と同じ 14px です。記事の中（`data-reading` を付けた要素）では、指でも 16px です。',
          '- 文字のリンクは大きさを持たないので、`Text` の中に置くと本文と同じ大きさになります。',
        ].join('\n'),
      },
    },
  },
  args: {
    children:
      'デスクトップ優先の UI はモバイルに合わず、モバイル優先の UI はデスクトップで密度が低くなります。',
    size: 'md',
    variant: 'body',
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    variant: { control: 'inline-radio', options: ['body', 'muted', 'subtle', 'label', 'caption'] },
    weight: { control: 'inline-radio', options: ['normal', 'medium', 'bold'] },
    as: { control: 'inline-radio', options: ['p', 'span', 'div', 'strong', 'em', 'del'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Variants: Story = {
  tags: ['visual'],
  name: '大きさ・濃さ・密度',
  parameters: {
    controls: { disable: true },
    docs: { description: { story: '左がマウス、右が指、下が指で操作している記事の中です。' } },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <DensityPair>
        <div className="flex w-[22rem] flex-col gap-2">
          {variants.map((variant) => (
            <Text key={variant} variant={variant}>
              {variant}: 3 年ぶりに、自分のサイトを作り直しました。
            </Text>
          ))}
          <Text size="sm" variant="subtle">
            sm: 2026年9月17日・Design
          </Text>
          <Text>
            くわしくは<Link href="#about">このサイトについて</Link>をご覧ください。
          </Text>
        </div>
      </DensityPair>
      <div data-density="coarse" data-reading className="flex w-[22rem] flex-col gap-2">
        <Text>記事の中（data-reading）では、指でも本文は 16px です。</Text>
        <Text size="sm" variant="subtle">
          注記は 14px です。
        </Text>
      </div>
    </div>
  ),
};

export const LabelsAndWeights: Story = {
  tags: ['visual'],
  name: 'ラベル・キャプション・太さ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`variant="label"`・`variant="caption"` は、欄のラベル・キャプションと同じ見た目です。欄ではない見出しを、欄の並びに混ぜるときに使います。`weight` は太さだけを変えます。',
      },
    },
  },
  render: () => (
    <div className="flex w-[22rem] flex-col gap-2">
      <Text variant="label">label: 状態を再現する</Text>
      <Text variant="caption">caption: 公開したあとでも変えられます</Text>
      <Text weight="medium">weight=&quot;medium&quot;: 中くらいの太さ</Text>
      <Text weight="bold">weight=&quot;bold&quot;: 太字</Text>
      <Text>
        文の中の<Text as="strong">強調</Text>と<Text as="em">強勢</Text>と
        <Text as="del">打ち消し</Text>です。
      </Text>
    </div>
  ),
};

export const Accessibility: Story = {
  name: '要素',
  args: { as: 'span', children: '文の中の一部' },
  render: (args) => (
    <div>
      <Text {...args} />
      <Text as="strong">強調</Text>
      <Text as="em">強勢</Text>
      <Text as="del">打ち消し</Text>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('文の中の一部').tagName).toBe('SPAN');
    // strong・em・del は、記事の本文と同じ飾りが付く
    const del = canvas.getByText('打ち消し');
    await expect(del.tagName).toBe('DEL');
    await expect(getComputedStyle(del).textDecorationLine).toBe('line-through');
    await expect(getComputedStyle(canvas.getByText('強調')).fontWeight).toBe('700');
    await expect(getComputedStyle(canvas.getByText('強勢')).fontStyle).toBe('italic');
  },
};
