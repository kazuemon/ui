import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Meter } from './Meter';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const colors = ['primary', 'secondary', 'neutral'] as const;
const sizes = ['sm', 'md', 'lg'] as const;
const regionColors = ['status', 'color'] as const;

const meta = {
  title: 'Components/Meter',
  component: Meter,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '決まった範囲の中の量を、バーで示します。スキルの習熟度や、ストレージの使用量に使います。押せません。',
          '処理の進み具合や記事の読了のように、終わりに向かって進むものには使いません。',
          '',
          '- `value` を `min`〜`max`（既定は 0〜100）の中で渡します。値の文字はラベルの行の右端に出ます。`hideValue` で隠せます。',
          '- 値の文字は、既定では割合（「45%」）です。`format` で数の整え方を、`getValueText` で文字そのもの（「12 / 50 GB」）を変えられます。読み上げも同じ文字になります。',
          '- `color` で塗りの色を選びます。指定しないときは濃いグレーです。',
          '- `size` でバーの太さを選びます。`md` が標準で、たくさん並べる一覧では細い `sm`、1 つだけ大きく見せるときは太い `lg` です。どの太さでも角は丸いままです。',
          '- `low`・`high`・`optimum` を渡すと、値のある範囲で塗りの色が変わります。`optimum` のある範囲が「最適」、その隣が「隣の範囲」、反対の端が「反対の端」です。',
          '- 範囲ごとの色は `regionColor` で選びます。既定の `status` は、最適を成功の緑、隣の範囲を警告のオリーブ、反対の端を危険の赤にします。最適のときも `color` の色のままにしたいときは `color` です。',
          '- 色だけで伝わらないよう、範囲の意味は `caption` に書きます。',
          '- `label` を渡さないときは、`aria-label` で名前を付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: 'TypeScript',
    value: 72,
    color: 'neutral',
    size: 'md',
    regionColor: 'status',
    hideValue: false,
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    label: { control: 'text' },
    caption: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: "'md'" } },
    },
    regionColor: {
      control: 'inline-radio',
      options: regionColors,
      table: { defaultValue: { summary: "'status'" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色と値',
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="14rem">
      {colors.map((color) => (
        <Specimen key={color} label={color}>
          <div className="flex flex-col gap-5">
            {[0, 6, 45, 100].map((value) => (
              <Meter key={value} label="習熟度" value={value} color={color} />
            ))}
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '太さ',
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="14rem">
      {sizes.map((size) => (
        <Specimen key={size} label={size}>
          <div className="flex flex-col gap-5">
            {[0, 6, 45, 100].map((value) => (
              <Meter key={value} label="習熟度" value={value} size={size} color="primary" />
            ))}
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Parts: Story = {
  tags: ['visual'],
  name: 'ラベル・キャプション・値の文字',
  render: () => (
    <div className="flex flex-col gap-6">
      <Meter
        label="ストレージ"
        value={12.4}
        max={50}
        getValueText={(_, value) => `${value} / 50 GB`}
        caption="写真と動画が大半を占めています"
      />
      <Meter label="React" value={4} max={5} format={{ maximumFractionDigits: 0 }} />
      <Meter label="値の文字なし" value={60} hideValue />
      <Meter aria-label="ラベルなし" value={30} caption="ラベルを出さないときは aria-label" />
    </div>
  ),
};

export const Regions: Story = {
  tags: ['visual'],
  name: '範囲による色（low・high・optimum）',
  parameters: {
    docs: {
      description: {
        story:
          '行は `regionColor`。ストレージの使用量（少ないほどよい）: `low={60} high={85} optimum={0}` を、最適・隣の範囲・反対の端の値で並べています。右端はバッテリー（多いほどよい）: `low={20} high={50} optimum={100}`。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[1000px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-8">
      {regionColors.map((regionColor) => (
        <Specimen key={regionColor} label={regionColor}>
          <div className="grid grid-cols-4 gap-6">
            {[40, 72, 93].map((value) => (
              <Meter
                key={value}
                label="ストレージ"
                value={value}
                low={60}
                high={85}
                optimum={0}
                color="primary"
                regionColor={regionColor}
              />
            ))}
            <Meter
              label="バッテリー"
              value={35}
              low={20}
              high={50}
              optimum={100}
              regionColor={regionColor}
              caption="20% を切ると省電力になります"
            />
          </div>
        </Specimen>
      ))}
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <DensityPair>
      <div className="w-[320px]">
        <Meter {...args} caption="3 年使っています" />
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="flex flex-col gap-6">
      <Meter label="TypeScript" value={72} caption="3 年使っています" />
      <Meter
        label="ストレージ"
        value={12.5}
        max={50}
        getValueText={(_, value) => `${value} / 50 GB`}
      />
      <Meter label="バッテリー" value={10} low={20} high={50} optimum={100} />
    </div>
  ),
  play: async ({ canvas }) => {
    const [skill, storage, battery] = canvas.getAllByRole('meter');
    // 名前はラベル、説明はキャプション
    await expect(skill).toHaveAccessibleName('TypeScript');
    await expect(skill).toHaveAccessibleDescription('3 年使っています');
    await expect(skill).toHaveAttribute('aria-valuenow', '72');
    await expect(skill).toHaveAttribute('aria-valuetext', '72%');
    // 見えている値の文字と、読み上げの文は同じ
    await expect(storage).toHaveAttribute('aria-valuetext', '12.5 / 50 GB');
    await expect(canvas.getByText('12.5 / 50 GB')).toBeVisible();
    // 反対の端の範囲（optimum は高い範囲、値は低い範囲）
    await expect(battery).toHaveAttribute('data-region', 'even-less-good');
    await expect(skill).not.toHaveAttribute('data-region');
  },
};
