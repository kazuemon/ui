import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { NumberFormat } from './NumberFormat';
import { Text } from '../text/Text';
import { Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/NumberFormat',
  component: NumberFormat,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '数・通貨・割合・単位です。`<data value>` を出し、読む文字は `Intl.NumberFormat` で書きます。',
          '',
          '- 何も指定しなければ、3 桁ごとに区切った数です。',
          '- `currency`（JPY・USD など）で通貨、`percent` で割合（1 を 100% として渡します）、`unit`（kilometer・megabyte など）で単位を付けます。',
          '- JPY は既定で「￥1,280」です。`currencyDisplay="name"` で「1,280円」になります。',
          '- 数字は等幅なので、右にそろえて縦に並べると桁がそろいます。',
          '- 細かく決めるときは `format` に Intl の指定を渡します。',
          '- 大きさと濃さは周りの文字のままです。`size`・`variant` で Text と同じ大きさ・濃さにできます。',
        ].join('\n'),
      },
    },
  },
  args: { value: 1280, locale: 'ja-JP' },
  argTypes: {
    value: { control: 'number' },
    currency: { control: 'text' },
    currencyDisplay: {
      control: 'inline-radio',
      options: ['symbol', 'narrowSymbol', 'code', 'name'],
    },
    percent: { control: 'boolean' },
    unit: { control: 'text' },
    unitDisplay: { control: 'inline-radio', options: ['short', 'long', 'narrow'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    variant: { control: 'inline-radio', options: ['body', 'muted', 'subtle'] },
    locale: { control: 'text' },
  },
  render: (args) => (
    <Text>
      <NumberFormat {...args} />
    </Text>
  ),
} satisfies Meta<typeof NumberFormat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Kinds: Story = {
  tags: ['visual'],
  name: '数・通貨・割合・単位',
  parameters: {
    controls: { disable: true },
    docs: { description: { story: '同じ部品で、書き方を変えて並べたものです。' } },
  },
  render: () => (
    <Gallery columnWidth="14rem">
      <Specimen label="数">
        <div className="flex flex-col gap-1">
          <Text>
            <NumberFormat value={1280} />
          </Text>
          <Text>
            <NumberFormat value={1.23456} maximumFractionDigits={2} />
          </Text>
          <Text>
            <NumberFormat value={12800000} format={{ notation: 'compact' }} />
          </Text>
        </div>
      </Specimen>
      <Specimen label="通貨">
        <div className="flex flex-col gap-1">
          <Text>
            <NumberFormat value={1280} currency="JPY" />
          </Text>
          <Text>
            <NumberFormat value={1280} currency="JPY" currencyDisplay="name" />
          </Text>
          <Text>
            <NumberFormat value={12.5} currency="USD" />
          </Text>
        </div>
      </Specimen>
      <Specimen label="割合・単位">
        <div className="flex flex-col gap-1">
          <Text>
            <NumberFormat value={0.125} percent maximumFractionDigits={1} />
          </Text>
          <Text>
            <NumberFormat value={42.195} unit="kilometer" />
          </Text>
          <Text>
            <NumberFormat value={512} unit="megabyte" unitDisplay="narrow" />
          </Text>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Aligned: Story = {
  tags: ['visual'],
  name: '縦に並べる',
  parameters: {
    controls: { disable: true },
    docs: { description: { story: '右にそろえて縦に並べると、桁がそろいます。' } },
  },
  render: () => (
    <div className="flex w-[12rem] flex-col items-end gap-1">
      {[1111, 980, 12800, 4096, 71].map((n) => (
        <Text key={n}>
          <NumberFormat value={n} currency="JPY" currencyDisplay="name" />
        </Text>
      ))}
    </div>
  ),
};

export const Accessibility: Story = {
  name: '要素',
  args: { value: 1280, currency: 'JPY' },
  play: async ({ canvas }) => {
    const el = canvas.getByText('￥1,280');
    await expect(el.tagName).toBe('DATA');
    await expect(el).toHaveAttribute('value', '1280');
  },
};
