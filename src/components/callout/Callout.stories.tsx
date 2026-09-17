import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Callout, type CalloutAppearance, type CalloutColor } from './Callout';
import { Code } from '../code/Code';
import { DensityPair, Matrix } from '../../stories/story-parts';

const colors: CalloutColor[] = ['info', 'success', 'warning', 'danger', 'neutral'];
const appearances: CalloutAppearance[] = ['soft', 'muted', 'outline', 'filled'];

const samples: Record<CalloutColor, { title: string; body: string }> = {
  info: { title: '補足', body: 'この部品は Base UI を土台にしています。' },
  success: { title: 'ヒント', body: 'data-density を付けると、密度を固定できます。' },
  warning: { title: '注意', body: 'Next.js 15 より前では、この設定は効きません。' },
  danger: { title: '破壊的な変更', body: 'v2 で size の値が変わりました。' },
  neutral: { title: 'メモ', body: 'タブレットとマウスでは、浮かぶ選択肢のままです。' },
};

const meta = {
  title: 'Components/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中の補足・注意・メモの囲みです。本文にはじめからある文に使います。',
          '',
          '- 見た目はお知らせ（`Notice`）と同じ決まりです。画面の上であとから出す知らせには `Notice` を使います。',
          '- 読み上げでは補足（`role="note"`）として扱い、題が囲みの名前になります。割り込んで読んだりはしません。閉じるボタンや操作は持ちません。',
          '- `color` は状態の色（`info`・`success`・`warning`・`danger`）と、色を持たないグレーの `neutral`（既定）です。',
          '- `appearance` は、`soft`（既定、淡い面）・`muted`（グレーの面に小さな題）・`outline`（白い面に状態の色の枠線）・`filled`（濃い塗り）です。',
          '- アイコンは状態の色ごとに付きます（`neutral` と `muted` ではなし）。`icon` にほかのアイコンを渡すと置き換わり、`icon={false}` で消えます。',
          '- 文字は本文と同じ大きさです。',
        ].join('\n'),
      },
    },
  },
  args: {
    color: 'info',
    appearance: 'soft',
    title: samples.info.title,
    children: samples.info.body,
  },
  argTypes: {
    color: { control: 'inline-radio', options: colors },
    appearance: { control: 'inline-radio', options: appearances },
    title: { control: 'text' },
    children: { control: 'text' },
    icon: { control: false },
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};

export const ColorsAndAppearances: Story = {
  tags: ['visual'],
  name: '色と見た目',
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={colors}
      rowLabel={(color) => color}
      columns={appearances.map((appearance) => ({ label: appearance, appearance }))}
      columnWidth="16rem"
      renderCell={(color, { appearance }) => (
        <Callout color={color} appearance={appearance} title={samples[color].title}>
          {samples[color].body}
        </Callout>
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度とアイコン',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '題なし、`icon={false}`、中にコードを置いた形です。記事の中（`data-reading`）では、指でも本文と同じ 16px です。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <div data-reading className="flex w-[22rem] flex-col gap-3">
        <Callout color="warning">
          <Code>coarse-large</Code> は名前が変わるかもしれません。
        </Callout>
        <Callout color="info" icon={false} title="補足">
          アイコンなしで、題だけの形です。
        </Callout>
        <Callout appearance="muted" color="warning" title="注意">
          グレーの面に小さな題の形です。
        </Callout>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    const note = canvas.getByRole('note', { name: '補足' });
    await expect(note).toHaveTextContent('この部品は Base UI を土台にしています。');
    // 読み上げで知らせる箱（status・alert）は持たない
    await expect(canvas.queryByRole('status')).toBeNull();
  },
};
