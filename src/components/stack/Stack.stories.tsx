import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from '../button/Button';
import { Text } from '../text/Text';
import { Stack } from './Stack';
import { Matrix } from '../../stories/story-parts';
import { labelClass, sourceCode } from '../../stories/story-states';

const gaps = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
const aligns = ['start', 'center', 'end', 'stretch'] as const;

const meta = {
  title: 'Components/Stack',
  component: Stack,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '子を縦・横に一定の間隔で並べる部品です。間隔を段で選ぶので、画面のあちこちで間隔がそろいます。1 か所だけの間隔なら、Tailwind の `flex gap-4` で足ります。',
          '',
          '- `direction` は並べる向きです。縦（`vertical`）が既定で、横は `horizontal` です。',
          '- `gap` は間隔の段です（`none`・`xs`・`sm`・`md`・`lg`・`xl`）。既定は `md` です。入力方式では変わりません。',
          '- `align` は並べる向きと交わる向きの揃えです。既定は縦横とも伸ばします（`stretch`）。横で高さの違う子を上下の中央に揃えるときは `align="center"` を渡します。',
          '- `justify` は並べる向きの揃えです。`between` は両端に寄せます。',
          '- `wrap` は、入りきらないときに次の行へ折り返します（既定）。横に並べるときだけ効き、縦では無視されます。折り返したくないときは `wrap={false}` を渡します。',
          '- `showDivider` は、子の間に細い区切り線を入れます。話題の切れ目には Divider を置きます。',
          '- `ul`・`section` にするときは `render={<ul />}` を渡します。',
        ].join('\n'),
      },
    },
  },
  args: {
    direction: 'vertical',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: true,
    showDivider: false,
  },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: "'vertical'" } },
    },
    gap: { control: 'inline-radio', options: gaps, table: { defaultValue: { summary: "'md'" } } },
    align: {
      control: 'inline-radio',
      options: [...aligns, 'baseline'],
      table: { defaultValue: { summary: "'stretch'" } },
    },
    justify: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'between'],
      table: { defaultValue: { summary: "'start'" } },
    },
    wrap: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showDivider: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ children }: { children: string }) => (
  <div className="rounded-control bg-neutral px-3 py-2">
    <Text size="sm">{children}</Text>
  </div>
);

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Stack direction="horizontal" gap="sm" align="center">
          <Text>保存の確認</Text>
          <Button>保存</Button>
          <Button>やめる</Button>
        </Stack>
      `),
    },
  },
  render: (args) => (
    <Stack {...args}>
      <Box>1 つ目</Box>
      <Box>2 つ目</Box>
      <Box>3 つ目</Box>
    </Stack>
  ),
};

// 間隔の段 × 向き
export const Gaps: Story = {
  tags: ['visual'],
  name: '間隔の段',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {(['vertical', 'horizontal'] as const).map((direction) => (
        <div key={direction} className="flex flex-wrap items-start gap-8">
          {gaps.map((gap) => (
            <div key={gap} className="flex flex-col gap-2">
              <span className={labelClass}>{gap}</span>
              <Stack direction={direction} gap={gap}>
                <Box>あ</Box>
                <Box>い</Box>
                <Box>う</Box>
              </Stack>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

// 揃え・並べる向きの揃え・折り返し・区切り線
export const Layouts: Story = {
  tags: ['visual'],
  name: '揃え・折り返し・区切り線',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Matrix
        rows={aligns}
        columns={[{ label: '横で揃える' }]}
        rowLabel={(align) => `align="${align}"`}
        renderCell={(align) => (
          <Stack
            direction="horizontal"
            align={align}
            gap="sm"
            className="h-20 rounded-control bg-neutral p-2"
          >
            <Box>短い</Box>
            <div className="rounded-control bg-bg px-3 py-2">
              <Text size="sm">
                2 行の
                <br />
                内容
              </Text>
            </div>
          </Stack>
        )}
      />
      <div className="w-64">
        <Stack direction="horizontal" gap="sm">
          {['保存', 'やめる', 'あとで', '共有'].map((t) => (
            <Button key={t}>{t}</Button>
          ))}
        </Stack>
      </div>
      <Stack direction="horizontal" justify="between" className="w-80">
        <Box>左</Box>
        <Box>右</Box>
      </Stack>
      <Stack showDivider className="w-64">
        <Text>1 つ目</Text>
        <Text>2 つ目</Text>
        <Text>3 つ目</Text>
      </Stack>
      <Stack direction="horizontal" showDivider>
        <Text>1 つ目</Text>
        <Text>2 つ目</Text>
        <Text>3 つ目</Text>
      </Stack>
    </div>
  ),
};

// props の確かめ
export const Props: Story = {
  name: 'props',
  render: () => (
    <div className="flex flex-col gap-4">
      <Stack data-testid="default">
        <span>a</span>
        <span>b</span>
      </Stack>
      <Stack data-testid="row" direction="horizontal" gap="xl" justify="between">
        <span>a</span>
        <span>b</span>
      </Stack>
      <Stack data-testid="centered" direction="horizontal" align="center" wrap={false}>
        <span>a</span>
        <span>b</span>
      </Stack>
      <Stack data-testid="divided" showDivider render={<section />}>
        <span>a</span>
        <>
          <span>b</span>
          {null}
          <span>c</span>
        </>
      </Stack>
    </div>
  ),
  play: async ({ canvas }) => {
    const def = canvas.getByTestId('default');
    await expect(getComputedStyle(def).flexDirection).toBe('column');
    await expect(getComputedStyle(def).rowGap).toBe('16px');
    await expect(getComputedStyle(def).alignItems).toBe('stretch');
    const row = canvas.getByTestId('row');
    await expect(getComputedStyle(row).flexDirection).toBe('row');
    await expect(getComputedStyle(row).columnGap).toBe('40px');
    await expect(getComputedStyle(row).flexWrap).toBe('wrap');
    await expect(getComputedStyle(row).alignItems).toBe('stretch');
    const centered = canvas.getByTestId('centered');
    await expect(getComputedStyle(centered).alignItems).toBe('center');
    await expect(getComputedStyle(centered).flexWrap).toBe('nowrap');
    await expect(getComputedStyle(def).flexWrap).toBe('nowrap');
    const divided = canvas.getByTestId('divided');
    await expect(divided.tagName).toBe('SECTION');
    const seps = canvas.getAllByRole('separator');
    await expect(seps).toHaveLength(2);
    await expect(seps[0]).toHaveAttribute('aria-orientation', 'horizontal');
  },
};
