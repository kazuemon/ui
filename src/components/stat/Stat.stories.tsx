import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Stat } from './Stat';
import { NumberFormat } from '../number-format/NumberFormat';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import type { MatrixColumn } from '../../stories/story-states';

const trends = ['up', 'down', 'flat'] as const;
const tones = ['positive', 'negative', 'neutral'] as const;
const aligns = ['start', 'center', 'end'] as const;
const sizes = ['heading-1', 'heading-2', 'heading-3', 'body'] as const;

interface ToneColumn extends MatrixColumn {
  tone: (typeof tones)[number];
}

const toneColumns: ToneColumn[] = tones.map((tone) => ({ label: tone, tone }));

const meta = {
  title: 'Components/Stat',
  component: Stat,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '数字とラベルです。実績や指標（公開記事の数、稼働率、売上）を 1 つだけ大きく見せます。押せません。',
          '',
          '- `label` が名前、`value` が数字です。読み上げでは、この 2 つが組になります。',
          '- 桁区切りや通貨は `value` に `NumberFormat` を渡します。',
          '- `unit` で単位（「件」「GB」）を数字の後ろに小さく添えます。`caption` は数字の下の補足です。',
          '- `delta` で増減を出します。`trend` が矢印の向き（`up`・`down`・`flat`）で、色だけで伝えないための印です。',
          '- 増えたことが良いか悪いかは場面で違うので、色は `tone` で選びます。書かないときは `trend` から決めます（増えると緑、減ると赤）。コストのように「減ってうれしい」ものは `tone` を明示します。',
          '- `deltaLabel` を書くと、見えている増減の代わりにその文が読まれます（「先月比 12% 増」）。',
          '- `deltaIcon` を `false` にすると矢印を出しません。そのときは `delta` に符号（「+12%」）を書きます。色だけで増減を伝えないためです。',
          '- `deltaFill` を `true` にすると、増減を色に合わせた淡い面（pill）に載せます。数字から切り離して読ませたいときに使います。',
          '- `size` で数字の大きさを選びます。数字をいくつも並べるときは小さい段にします。',
          '- `align` で寄せ方を選びます。カードに載せたいときは Card と組み合わせます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '公開記事',
    value: 128,
    unit: '件',
    caption: '先月比',
    delta: '12%',
    trend: 'up',
    align: 'start',
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    delta: { control: 'text' },
    unit: { control: 'text' },
    trend: {
      control: 'inline-radio',
      options: trends,
      table: { defaultValue: { summary: "'flat'" } },
    },
    tone: { control: 'inline-radio', options: tones },
    align: {
      control: 'inline-radio',
      options: aligns,
      table: { defaultValue: { summary: "'start'" } },
    },
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: "'heading-1'" } },
    },
    deltaIcon: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    deltaFill: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Trends: Story = {
  tags: ['visual'],
  name: '増減の向きと色',
  parameters: {
    controls: { exclude: ['trend', 'tone'] },
    docs: {
      description: {
        story:
          '行が矢印の向き（`trend`）、列が色（`tone`）です。`tone` を書かないときは、`trend` が対角の色を選びます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Matrix
      rows={trends}
      columns={toneColumns}
      rowLabel={(trend) => trend}
      columnWidth="11rem"
      renderCell={(trend, column) => (
        <Stat label="公開記事" value={128} unit="件" delta="12%" trend={trend} tone={column.tone} />
      )}
    />
  ),
};

export const Parts: Story = {
  tags: ['visual'],
  name: 'ラベル・単位・キャプション',
  decorators: [
    (Story) => (
      <div className="w-[900px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="13rem">
      <Specimen label="数字だけ">
        <Stat label="公開記事" value={128} />
      </Specimen>
      <Specimen label="単位とキャプション">
        <Stat label="ストレージ" value={12.4} unit="GB" caption="50 GB 中" />
      </Specimen>
      <Specimen label="増えた">
        <Stat label="閲覧数" value={<NumberFormat value={48219} />} delta="12%" trend="up" />
      </Specimen>
      <Specimen label="減ってうれしい">
        <Stat
          label="表示にかかる時間"
          value={0.82}
          unit="秒"
          delta="18%"
          trend="down"
          tone="positive"
          caption="先月比"
        />
      </Specimen>
      <Specimen label="通貨">
        <Stat label="売上" value={<NumberFormat value={1280000} currency="JPY" />} />
      </Specimen>
      <Specimen label="変わらず">
        <Stat
          label="稼働率"
          value={<NumberFormat value={0.999} percent maximumFractionDigits={1} />}
          delta="0.0pt"
          trend="flat"
        />
      </Specimen>
    </Gallery>
  ),
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '数字の大きさ',
  parameters: {
    docs: {
      description: {
        story:
          '`size` は文字の尺度の段です。指で操作するときは、段ごと小さくなります。ラベル・単位・キャプションの大きさは変わりません。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[900px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="13rem">
      {sizes.map((size) => (
        <Specimen key={size} label={size}>
          <Stat
            label="公開記事"
            value={128}
            unit="件"
            delta="12%"
            trend="up"
            caption="先月比"
            size={size}
          />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Deltas: Story = {
  tags: ['visual'],
  name: '増減の見せ方',
  parameters: {
    docs: {
      description: {
        story:
          '矢印（`deltaIcon`）と淡い面（`deltaFill`）は、それぞれ選べます。矢印を出さないときは、`delta` に符号を書きます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[900px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="13rem">
      <Specimen label="矢印（既定）">
        <Stat label="公開記事" value={128} unit="件" delta="12%" trend="up" caption="先月比" />
      </Specimen>
      <Specimen label="矢印なし・符号">
        <Stat
          label="公開記事"
          value={128}
          unit="件"
          delta="+12%"
          trend="up"
          deltaIcon={false}
          caption="先月比"
        />
      </Specimen>
      <Specimen label="淡い面（pill）">
        <Stat
          label="公開記事"
          value={128}
          unit="件"
          delta="12%"
          trend="up"
          deltaFill
          caption="先月比"
        />
      </Specimen>
      <Specimen label="淡い面・矢印なし">
        <Stat
          label="離脱率"
          value={32}
          unit="%"
          delta="-4pt"
          trend="down"
          deltaIcon={false}
          deltaFill
          caption="先月比"
        />
      </Specimen>
    </Gallery>
  ),
};

export const Aligns: Story = {
  tags: ['visual'],
  name: '寄せ方',
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="14rem">
      {aligns.map((align) => (
        <Specimen key={align} label={align}>
          <Stat
            label="公開記事"
            value={128}
            unit="件"
            delta="12%"
            trend="up"
            caption="先月比"
            align={align}
          />
        </Specimen>
      ))}
    </Gallery>
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
  render: () => (
    <DensityPair>
      <Stat label="公開記事" value={128} unit="件" delta="12%" trend="up" caption="先月比" />
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="flex flex-col gap-8">
      <Stat label="公開記事" value={128} unit="件" caption="先月比" delta="12%" trend="up" />
      <Stat
        label="表示にかかる時間"
        value={0.82}
        unit="秒"
        delta="18%"
        trend="down"
        tone="positive"
        deltaLabel="先月より 18% 速くなりました"
      />
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const stats = canvasElement.querySelectorAll('dl[data-slot="stat"]');
    await expect(stats).toHaveLength(2);
    // ラベルは dt、数字は dd。1 つの組として読まれる
    const term = stats[0].querySelector('dt');
    const details = stats[0].querySelector('dd');
    await expect(term).toHaveTextContent('公開記事');
    await expect(details).toHaveTextContent('128');
    await expect(term?.nextElementSibling).toBe(details);
    // 矢印は読み上げに出さない（形は見る人のための印）
    const icon = stats[0].querySelector('svg');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    // deltaLabel を書くと、見えている文字の代わりにその文が読まれる
    await expect(canvas.getByText('先月より 18% 速くなりました')).toBeInTheDocument();
    await expect(canvas.getByText('18%')).toHaveAttribute('aria-hidden', 'true');
  },
};
