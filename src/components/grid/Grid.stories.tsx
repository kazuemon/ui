import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from '../button/Button';
import { Card, CardBody } from '../card/Card';
import { Heading } from '../heading/Heading';
import { Text } from '../text/Text';
import { Grid } from './Grid';
import { labelClass } from '../../stories/story-states';

const plans = [
  { name: 'フリー', price: '¥0', note: '個人の小さな記録に。' },
  {
    name: 'ライト',
    price: '¥480',
    note: '画像を多く載せる人に。月ごとの保存容量が増え、下書きを何本でも置けます。',
  },
  {
    name: 'プロ',
    price: '¥1,200',
    note: '仕事で使う人に。独自のドメイン、アクセスの集計、予約の投稿、チームでの編集ができます。問い合わせにも優先して答えます。',
  },
] as const;

// 文の長さが違うカード。同じ行で高さがそろうかを見る
function planCards() {
  return plans.map((plan) => (
    <Card key={plan.name}>
      <CardBody>
        <Heading level={3} size={4}>
          {plan.name}
        </Heading>
        <Text size="sm" variant="muted">
          {plan.note}
        </Text>
        <Text weight="bold">{plan.price} / 月</Text>
        <Button color="primary">選ぶ</Button>
      </CardBody>
    </Card>
  ));
}

// 番号を振ったブロック。間隔と列の数の見本に使う
function blocks(n: number) {
  return Array.from({ length: n }, (_, i) => (
    <div
      key={i}
      className="flex h-12 items-center justify-center rounded-control bg-neutral text-center"
    >
      <Text size="sm">{i + 1}</Text>
    </div>
  ));
}

// 列の数の数え方を確かめる。グリッドの列は getComputedStyle の grid-template-columns に px で並ぶ
const columnCount = (el: HTMLElement) =>
  getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;

// いまの画面の幅が、その段（Tailwind の既定の幅）以上か
const breakpointWidths = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' } as const;
const matchesBreakpoint = (bp: keyof typeof breakpointWidths) =>
  window.matchMedia(`(min-width: ${breakpointWidths[bp]})`).matches;

const meta = {
  title: 'Components/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '子を行と列の格子に並べる部品です。カードの一覧、料金の表、指標の行のように、同じ幅の列を並べるときに使います。1 列に並べるだけなら `Stack` を使います。',
          '',
          '- `minColumnWidth` は列の最小の幅（px）です。入れ物の幅をこの値で割った数だけ列になります（既定 240）。',
          '- `columns={3}` のように数を渡すと、どの幅でも同じ列の数に固定します。',
          '- `columns={{ base: 1, sm: 2, lg: 4 }}` のように画面の幅の段ごとの数を渡すと、画面の幅で列の数が変わります。段は `base`（いちばん狭い画面）・`sm`（40rem）・`md`（48rem）・`lg`（64rem）・`xl`（80rem）で、Tailwind の既定の幅と同じです。渡していない段は、1 つ下の段の数を使います（`base` もないときは 1 列）。',
          '- `columns` と `minColumnWidth` を両方渡すと、`columns` を上限にし、1 列が `minColumnWidth` を割るときは列を減らします。サイドバーの横のような、画面より狭い入れ物に置くときに使います。',
          '- `gap` は子の間隔です（`Stack` の `gap` と同じ段）。既定は `md` です。',
          '- `align` は同じ行の子の上下の揃えです。既定の `stretch` は、行でいちばん高い子に合わせて伸ばすので、カードの高さがそろいます。子の高さをそのままにするときは `align="start"` を渡します。',
          '- 一覧にするときは `render={<ul />}` を渡し、子を `li` にします。',
        ].join('\n'),
      },
    },
  },
  args: { gap: 'md', minColumnWidth: 240, align: 'stretch' },
  argTypes: {
    gap: {
      control: 'inline-radio',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      table: { defaultValue: { summary: "'md'" } },
    },
    align: {
      control: 'inline-radio',
      options: ['stretch', 'start', 'center', 'end'],
      table: { defaultValue: { summary: "'stretch'" } },
    },
    minColumnWidth: { control: 'number', table: { defaultValue: { summary: '240' } } },
    columns: { control: 'number' },
    render: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => <Grid {...args}>{planCards()}</Grid>,
};

export const Gaps: Story = {
  tags: ['visual'],
  name: '間隔',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {(['none', 'sm', 'md', 'lg'] as const).map((gap) => (
        <div key={gap} className="flex flex-col gap-2">
          <span className={labelClass}>gap=&quot;{gap}&quot;</span>
          <div className="w-96">
            <Grid gap={gap} columns={3}>
              {blocks(6)}
            </Grid>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Columns: Story = {
  tags: ['visual'],
  name: '列の数',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className={labelClass}>入れ物の幅 760px（既定の列の最小幅 240 → 3 列）</span>
        <div style={{ width: 760 }}>
          <Grid gap="sm">{blocks(6)}</Grid>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={labelClass}>入れ物の幅 420px（既定の列の最小幅 240 → 1 列）</span>
        <div style={{ width: 420 }}>
          <Grid gap="sm">{blocks(3)}</Grid>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={labelClass}>columns={4}（入れ物の幅 320px でも 4 列に固定）</span>
        <div style={{ width: 320 }}>
          <Grid gap="sm" columns={4}>
            {blocks(8)}
          </Grid>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={labelClass}>
          columns={3} minColumnWidth={200}（幅 720px は 3 列、幅 420px は 2 列）
        </span>
        <div className="flex items-start gap-8">
          <div style={{ width: 720 }}>
            <Grid gap="sm" columns={3} minColumnWidth={200}>
              {blocks(6)}
            </Grid>
          </div>
          <div style={{ width: 420 }}>
            <Grid gap="sm" columns={3} minColumnWidth={200}>
              {blocks(6)}
            </Grid>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Align: Story = {
  tags: ['visual'],
  name: '上下の揃え',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {(['stretch', 'start'] as const).map((align) => (
        <div key={align} className="flex flex-col gap-2">
          <span className={labelClass}>align=&quot;{align}&quot;</span>
          <div style={{ width: 760 }}>
            <Grid columns={3} align={align}>
              {planCards()}
            </Grid>
          </div>
        </div>
      ))}
    </div>
  ),
};

const stats = [
  { label: '今月の記事', value: '12 本' },
  { label: '閲覧数', value: '8,420' },
  { label: 'コメント', value: '36 件' },
  { label: '下書き', value: '4 本' },
] as const;

// 画面の幅で列の数を変える。スマホは 1 列、sm から 2 列、lg から 4 列
export const Responsive: Story = {
  name: '画面の幅で変える',
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} data-testid="responsive">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardBody>
            <Text size="sm" variant="muted">
              {stat.label}
            </Text>
            <Text weight="bold">{stat.value}</Text>
          </CardBody>
        </Card>
      ))}
    </Grid>
  ),
  play: async ({ canvas }) => {
    const expected = matchesBreakpoint('lg') ? 4 : matchesBreakpoint('sm') ? 2 : 1;
    await expect(columnCount(canvas.getByTestId('responsive'))).toBe(expected);
  },
};

// 一覧にする: ul で描き、子を li にする
export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="w-96">
      <Grid render={<ul />} columns={2} gap="sm" className="m-0 list-none p-0">
        {['記事', '作品', '写真', 'メモ'].map((label) => (
          <li key={label} className="rounded-control bg-neutral p-2">
            <Text size="sm">{label}</Text>
          </li>
        ))}
      </Grid>
    </div>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(list.tagName).toBe('UL');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
  },
};

export const Props: Story = {
  name: 'props',
  render: () => (
    <div className="flex flex-col gap-4">
      <div style={{ width: 760 }}>
        <Grid data-testid="fill">{blocks(3)}</Grid>
      </div>
      <div style={{ width: 200 }}>
        <Grid data-testid="narrow">{blocks(2)}</Grid>
      </div>
      <div style={{ width: 256 }}>
        <Grid data-testid="fixed" columns={4} gap="sm">
          {blocks(4)}
        </Grid>
      </div>
      {[1000, 999, 640, 420].map((width) => (
        <div key={width} style={{ width }}>
          <Grid data-testid={`capped-${width}`} columns={3} minColumnWidth={200}>
            {blocks(3)}
          </Grid>
        </div>
      ))}
      <div style={{ width: 600 }}>
        <Grid data-testid="capped-gap-none" columns={3} minColumnWidth={100} gap="none">
          {blocks(3)}
        </Grid>
      </div>
      <Grid data-testid="bp-no-base" columns={{ md: 3 }}>
        {blocks(3)}
      </Grid>
      <Grid data-testid="bp-skip" columns={{ base: 2, xl: 5 }}>
        {blocks(5)}
      </Grid>
      <div style={{ width: 600 }}>
        <Grid data-testid="bp-capped" columns={{ base: 1, md: 4 }} minColumnWidth={200}>
          {blocks(4)}
        </Grid>
      </div>
      <Grid data-testid="bp-outer" columns={{ base: 1, lg: 2 }}>
        <Grid data-testid="bp-inner" columns={3}>
          {blocks(3)}
        </Grid>
      </Grid>
      <div style={{ width: 760 }}>
        <Grid data-testid="outer" minColumnWidth={360}>
          <Grid data-testid="inner">{blocks(2)}</Grid>
        </Grid>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    // 既定: 760px を 240px で割って 3 列。間隔は Stack と同じ md（16px）
    const fill = canvas.getByTestId('fill');
    await expect(columnCount(fill)).toBe(3);
    await expect(getComputedStyle(fill).columnGap).toBe('16px');
    await expect(getComputedStyle(fill).rowGap).toBe('16px');
    // 入れ物が列の最小の幅より狭いときは、はみ出さず 1 列になる
    const narrow = canvas.getByTestId('narrow');
    await expect(columnCount(narrow)).toBe(1);
    await expect(narrow.scrollWidth).toBeLessThanOrEqual(200);
    // columns だけ: 幅によらず固定
    await expect(columnCount(canvas.getByTestId('fixed'))).toBe(4);
    // columns と minColumnWidth: 上限 3、200px を割ると減る。端数で 1 列落ちない
    await expect(columnCount(canvas.getByTestId('capped-1000'))).toBe(3);
    await expect(columnCount(canvas.getByTestId('capped-999'))).toBe(3);
    await expect(columnCount(canvas.getByTestId('capped-640'))).toBe(3);
    await expect(columnCount(canvas.getByTestId('capped-420'))).toBe(2);
    await expect(columnCount(canvas.getByTestId('capped-gap-none'))).toBe(3);
    // 段ごとの数: 渡していない段は 1 つ下の段へさかのぼる。base もないときは 1 列
    await expect(columnCount(canvas.getByTestId('bp-no-base'))).toBe(
      matchesBreakpoint('md') ? 3 : 1
    );
    await expect(columnCount(canvas.getByTestId('bp-skip'))).toBe(matchesBreakpoint('xl') ? 5 : 2);
    // 段ごとの数と minColumnWidth: その段の数を上限にし、入れ物 600px では 200px の列が 2 つまで
    await expect(columnCount(canvas.getByTestId('bp-capped'))).toBe(
      matchesBreakpoint('md') ? 2 : 1
    );
    // 入れ子: 外の段ごとの数は、中の Grid に引き継がれない
    await expect(columnCount(canvas.getByTestId('bp-outer'))).toBe(matchesBreakpoint('lg') ? 2 : 1);
    await expect(columnCount(canvas.getByTestId('bp-inner'))).toBe(3);
    // 入れ子: 外の minColumnWidth は中の Grid に引き継がれない（中は既定の 240）
    await expect(columnCount(canvas.getByTestId('outer'))).toBe(2);
    const inner = canvas.getByTestId('inner');
    await expect(columnCount(inner)).toBe(Math.floor((inner.clientWidth + 16) / (240 + 16)));
  },
};
