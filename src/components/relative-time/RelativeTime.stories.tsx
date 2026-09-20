import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { RelativeTime } from './RelativeTime';
import { Text } from '../text/Text';
import { ThemeProvider } from '../theme-provider/ThemeProvider';
import { Gallery, Specimen } from '../../stories/story-parts';

// 見本の「今」。見た目の比較で日がずれないよう固定する
const now = new Date('2026-09-18T12:00:00+09:00');

const meta = {
  title: 'Components/RelativeTime',
  component: RelativeTime,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '「3 日前」「昨日」のように、今からの隔たりで書く日時です。`<time datetime>` を出し、ふつうの日付（Time と同じ書き方）を `title` に残します。',
          '',
          '- 今の時刻はブラウザで読み、1 分ごとに書き直します。サーバーで描いた HTML と、最初の描画（hydration）ではふつうの日付を書き、そのあとで相対に書き直します。サーバーとブラウザで時刻がずれても、食い違いは起きません。',
          '- `now` を渡すと、その時刻を基準にして、サーバーでも最初から相対で書きます。書き直しはしません。',
          '- 静的に書き出すページでは、HTML に書いた相対の文字がすぐ古くなります。記事の日付のように変わらない日付には Time を使います。',
          '- 45 秒に満たない隔たりは「今」、そのあとは分・時間・日・か月・年で書きます。',
          '- 「昨日」「今月」のような言い回しの境界は、`timeZone` の暦で日付が変わったかどうかで決まります。',
          '- 言語とタイムゾーン（`title` のふつうの日付と、上の境界に使います）は Time と同じく、ThemeProvider でまとめて変えられます。',
        ].join('\n'),
      },
    },
  },
  args: { dateTime: '2026-09-15' },
  argTypes: {
    dateTime: { control: 'text' },
    withTime: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    tone: { control: 'inline-radio', options: ['default', 'muted', 'subtle'] },
    locale: { control: 'text' },
    timeZone: { control: 'text' },
  },
} satisfies Meta<typeof RelativeTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Distances: Story = {
  tags: ['visual'],
  name: '隔たり',
  parameters: {
    controls: { disable: true },
    docs: { description: { story: '今を 2026/09/18 12:00 に固定して並べたものです。' } },
  },
  render: () => (
    <Gallery columnWidth="12rem">
      <Specimen label="過去">
        <div className="flex flex-col gap-1">
          {[
            '2026-09-18T11:59:40+09:00',
            '2026-09-18T11:50:00+09:00',
            '2026-09-18T09:00:00+09:00',
            '2026-09-17T10:00:00+09:00',
            '2026-09-15',
            '2026-06-01',
            '2024-09-01',
          ].map((d) => (
            <Text key={d}>
              <RelativeTime dateTime={d} now={now} />
            </Text>
          ))}
        </div>
      </Specimen>
      <Specimen label="未来">
        <div className="flex flex-col gap-1">
          {['2026-09-18T15:00:00+09:00', '2026-09-19T12:00:00+09:00', '2026-12-01'].map((d) => (
            <Text key={d}>
              <RelativeTime dateTime={d} now={now} />
            </Text>
          ))}
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const WithNow: Story = {
  name: '要素（now を渡す）',
  args: { dateTime: '2026-09-15', now },
  play: async ({ canvas }) => {
    const el = canvas.getByText('3 日前');
    await expect(el.tagName).toBe('TIME');
    await expect(el).toHaveAttribute('datetime', '2026-09-15');
    await expect(el).toHaveAttribute('title', '2026/09/15');
  },
};

export const Provider: Story = {
  name: '境界を timeZone で計算する',
  parameters: {
    docs: {
      description: {
        story:
          '「昨日」「今日」などの境界は timeZone の暦で決まります。ThemeProvider の timeZone が既定になり、部品に書いた値が勝ちます。',
      },
    },
  },
  render: () => {
    // 同じ瞬間でも、UTC の暦では日付が変わっていて、Asia/Tokyo の暦ではまだ同じ日
    const boundaryNow = new Date('2026-09-18T14:00:00Z');
    const boundaryDate = '2026-09-17T15:30:00Z';
    return (
      <ThemeProvider timeZone="UTC">
        <Text>
          <RelativeTime dateTime={boundaryDate} now={boundaryNow} data-testid="provider" />
        </Text>
        <Text>
          <RelativeTime
            dateTime={boundaryDate}
            now={boundaryNow}
            timeZone="Asia/Tokyo"
            data-testid="own"
          />
        </Text>
      </ThemeProvider>
    );
  },
  play: async ({ canvas }) => {
    // ThemeProvider の timeZone（UTC）では、日付をまたいでいるので「昨日」
    await expect(canvas.getByTestId('provider')).toHaveTextContent('昨日');
    // 部品の timeZone（Asia/Tokyo）が勝つと、同じ日なので「今日」
    await expect(canvas.getByTestId('own')).toHaveTextContent('今日');
  },
};

export const AfterMount: Story = {
  name: '描いたあとに相対に書き直す',
  args: { dateTime: '2020-01-01' },
  parameters: {
    docs: {
      description: {
        story:
          'ブラウザで描いたあとに、今の時刻から相対で書きます。ふつうの日付は title に残ります。',
      },
    },
  },
  play: async ({ canvas }) => {
    const el = await canvas.findByText(/年前/);
    await expect(el).toHaveAttribute('datetime', '2020-01-01');
    await expect(el).toHaveAttribute('title', '2020/01/01');
  },
};
