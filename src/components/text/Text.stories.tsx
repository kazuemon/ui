import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Text } from './Text';
import { Link } from '../link/Link';
import { DensityPair } from '../../stories/story-parts';

const tones = ['default', 'muted', 'subtle'] as const;

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
          '- `tone` は濃さです。`default`（既定）は本文、`muted` は補足、`subtle` は目立たせない文です。',
          '- `as` で要素を選びます。段落は `p`（既定）、文の中の一部は `span`、ほかの部品を含むときは `div` です。',
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
    tone: 'default',
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    tone: { control: 'inline-radio', options: tones },
    as: { control: 'inline-radio', options: ['p', 'span', 'div'] },
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
          {tones.map((tone) => (
            <Text key={tone} tone={tone}>
              {tone}: 3 年ぶりに、自分のサイトを作り直しました。
            </Text>
          ))}
          <Text size="sm" tone="subtle">
            sm: 2026年9月17日・Design
          </Text>
          <Text>
            くわしくは<Link href="#about">このサイトについて</Link>をご覧ください。
          </Text>
        </div>
      </DensityPair>
      <div data-density="coarse" data-reading className="flex w-[22rem] flex-col gap-2">
        <Text>記事の中（data-reading）では、指でも本文は 16px です。</Text>
        <Text size="sm" tone="subtle">
          注記は 14px です。
        </Text>
      </div>
    </div>
  ),
};

export const Accessibility: Story = {
  name: '要素',
  args: { as: 'span', children: '文の中の一部' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('文の中の一部').tagName).toBe('SPAN');
  },
};
