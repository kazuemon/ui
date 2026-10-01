import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Spinner } from './Loading';
import { Gallery, Specimen } from '../../stories/story-parts';

const sizes = ['control', 'text', 'sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '回る円です。読み込みや処理を待っているあいだに置きます。',
          '',
          '- `size` で大きさを選びます。`control`（既定）は部品の中の文字と並ぶ大きさ、`text` は周りの文字に合わせた大きさです。',
          '- `sm`・`md`・`lg` は決まった大きさです。カードや一覧の真ん中に 1 つだけ置く読み込み中には `lg` を使います。大きくしても線は細いままです。',
          '- `hideTrack` で下地の薄い輪を出さず、回る弧だけにできます。',
          '- `accessibleName`（「読み込んでいます」など）を書くと、読み上げで知らせます。ボタンや入力欄の中のように、周りが待っていることを伝えているときは書きません。',
        ].join('\n'),
      },
    },
  },
  args: { size: 'control', hideTrack: false },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: "'control'" } },
    },
    hideTrack: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    accessibleName: { control: 'text' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさと輪',
  render: () => (
    <Gallery columnWidth="10rem">
      {sizes.map((size) => (
        <Specimen key={size} label={size}>
          <div className="flex items-center gap-4 text-fg-muted">
            <Spinner size={size} />
            <Spinner size={size} hideTrack />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="lg" accessibleName="読み込んでいます" />
      <Spinner />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // 名前を書くと role="status" で読む
    await expect(canvas.getByRole('status')).toHaveTextContent('読み込んでいます');
    // 書かないときは読み上げに出さない
    const spinners = canvasElement.querySelectorAll('svg[data-slot="spinner"]');
    await expect(spinners).toHaveLength(2);
    await expect(spinners[1]).toHaveAttribute('aria-hidden', 'true');
  },
};
