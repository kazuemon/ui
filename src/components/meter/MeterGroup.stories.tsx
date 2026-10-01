import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { MeterGroup, type MeterGroupItem } from './MeterGroup';
import { Gallery, Specimen } from '../../stories/story-parts';

const storage: MeterGroupItem[] = [
  { label: '写真', value: 38, valueText: '24.3 GB' },
  { label: '動画', value: 22, valueText: '14.1 GB' },
  { label: 'その他', value: 12, valueText: '7.7 GB' },
];

const meta = {
  title: 'Components/MeterGroup',
  component: MeterGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '1 本のバーを内訳ごとに分けて塗ります。ストレージの内訳や、予算の使い道に使います。押せません。',
          '',
          '- `items` に内訳（`label`・`value`、色の `color`、凡例の値の文字 `valueText`）を左から順に渡します。合計が `max`（既定は 100）に届かない分は、地のまま残ります。',
          '- 区切りの色は、書かないときは並びの順に `primary`・`secondary`・`neutral` です。4 つ目からは `color` を書きます。',
          '- バーの下に、色の印・名前・値の凡例がいつも出ます。色だけで伝わらないよう、凡例の名前で内訳を読み分けます。',
          '- 合計の値の文字はラベルの行の右端に出ます。`getValueText` で文字を変え、`hideValue` で隠せます。',
          '- `size` でバーの太さを選びます。Meter と同じ段です。',
          '- `label` を渡さないときは、`aria-label` で名前を付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: 'ストレージ',
    items: storage,
    getValueText: (_, value) => `${(value * 0.64).toFixed(1)} / 64 GB`,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MeterGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Variations: Story = {
  tags: ['visual'],
  name: '太さと内訳',
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="20rem">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Specimen key={size} label={size}>
          <MeterGroup label="ストレージ" items={storage} size={size} />
        </Specimen>
      ))}
      <Specimen label="細い区切り・色を書く">
        <MeterGroup
          label="今月の予算"
          items={[
            { label: 'デザイン', value: 45, color: 'primary' },
            { label: '開発', value: 30, color: 'secondary' },
            { label: '運用', value: 20, color: 'neutral' },
            { label: '予備', value: 2, color: 'danger' },
          ]}
          caption="予備はほとんど残っていません"
        />
      </Specimen>
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <MeterGroup label="ストレージ" items={storage} caption="写真がいちばん多く使っています" />
  ),
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group');
    // 名前はラベル、説明はキャプション
    await expect(group).toHaveAccessibleName('ストレージ');
    await expect(group).toHaveAccessibleDescription('写真がいちばん多く使っています');
    // バーは読み上げに出さず、凡例を読む
    await expect(group.querySelector('[data-slot="meter-group-track"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.getByText('24.3 GB')).toBeVisible();
  },
};
