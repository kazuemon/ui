import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Time } from './Time';
import { Heading } from '../heading/Heading';
import { Text } from '../text/Text';
import { ThemeProvider } from '../theme-provider/ThemeProvider';
import { Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/Time',
  component: Time,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '日付と時刻です。`<time datetime>` を出し、読む文字は `Intl.DateTimeFormat` で書きます。「3 日前」のように書くときは RelativeTime を使います。',
          '',
          '- `dateTime` には Date・ISO 8601 の文字列・ミリ秒を渡します。`2026-09-18` のような日付だけの文字列は、時刻を持たない日付として扱い、どのタイムゾーンで描いても同じ日になります。記事の日付に向いています。',
          '- 既定は「2026/09/18」です。`withTime` を付けると「2026/09/18 09:30」になります。',
          '- ほかの書き方は `dateStyle`（`full`・`long`・`medium`・`short`）と `timeStyle` で選びます。細かく決めるときは `format` に Intl の指定を渡します。',
          '- 言語は `locale`（既定は `ja-JP`）、時刻は `timeZone`（既定は `Asia/Tokyo`）で書きます。サーバーと閲覧者のタイムゾーンが違っても、同じ文字になります。どちらも ThemeProvider でまとめて変えられ、部品に書いた値が勝ちます。',
          '- 大きさと濃さは周りの文字のままです。`size`・`variant` で Text と同じ大きさ・濃さにできます。',
        ].join('\n'),
      },
    },
  },
  args: { dateTime: '2026-09-18', withTime: false },
  argTypes: {
    dateTime: { control: 'text' },
    withTime: { control: 'boolean' },
    dateStyle: { control: 'inline-radio', options: ['full', 'long', 'medium', 'short'] },
    timeStyle: { control: 'inline-radio', options: ['full', 'long', 'medium', 'short'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    variant: { control: 'inline-radio', options: ['body', 'muted', 'subtle'] },
    locale: { control: 'text' },
    timeZone: { control: 'text' },
  },
} satisfies Meta<typeof Time>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Formats: Story = {
  tags: ['visual'],
  name: '書き方',
  parameters: {
    controls: { disable: true },
    docs: { description: { story: '同じ日時を、書き方を変えて並べたものです。' } },
  },
  render: () => (
    <Gallery columnWidth="16rem">
      <Specimen label="既定・withTime">
        <div className="flex flex-col gap-1">
          <Text>
            <Time dateTime="2026-09-18" />
          </Text>
          <Text>
            <Time dateTime="2026-09-18T00:30:00Z" withTime />
          </Text>
        </div>
      </Specimen>
      <Specimen label="dateStyle・timeStyle">
        <div className="flex flex-col gap-1">
          <Text>
            <Time dateTime="2026-09-18" dateStyle="full" />
          </Text>
          <Text>
            <Time dateTime="2026-09-18" dateStyle="long" />
          </Text>
          <Text>
            <Time dateTime="2026-09-18T00:30:00Z" timeStyle="short" />
          </Text>
        </div>
      </Specimen>
      <Specimen label="format・言語">
        <div className="flex flex-col gap-1">
          <Text>
            <Time dateTime="2026-09-18" format={{ month: 'long', day: 'numeric' }} />
          </Text>
          <ThemeProvider locale="en-US" timeZone="America/New_York">
            <Text>
              <Time dateTime="2026-09-18T00:30:00Z" withTime />
            </Text>
          </ThemeProvider>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const InArticle: Story = {
  tags: ['visual'],
  name: '記事の日付',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '記事の見出しの下に置く日付です。`size="sm"`・`variant="subtle"` の Text の中に置くと、周りの大きさと濃さになります。',
      },
    },
  },
  render: () => (
    <div data-reading className="flex w-[24rem] flex-col gap-2">
      <Heading level={1}>サイトを作り直しました</Heading>
      <Text size="sm" variant="subtle">
        <Time dateTime="2026-09-18" />
        ・Design
      </Text>
    </div>
  ),
};

export const Accessibility: Story = {
  name: '要素',
  args: { dateTime: '2026-09-18' },
  play: async ({ canvas }) => {
    const el = canvas.getByText('2026/09/18');
    await expect(el.tagName).toBe('TIME');
    await expect(el).toHaveAttribute('datetime', '2026-09-18');
  },
};

export const Provider: Story = {
  name: '言語とタイムゾーンを ThemeProvider で変える',
  parameters: {
    docs: {
      description: {
        story: 'ThemeProvider の locale・timeZone が既定になります。部品に書いた値が勝ちます。',
      },
    },
  },
  render: () => (
    <ThemeProvider locale="en-US" timeZone="UTC">
      <Text>
        <Time dateTime="2026-09-18T00:30:00Z" withTime data-testid="provider" />
      </Text>
      <Text>
        <Time
          dateTime="2026-09-18T00:30:00Z"
          withTime
          locale="ja-JP"
          timeZone="Asia/Tokyo"
          data-testid="own"
        />
      </Text>
    </ThemeProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('provider')).toHaveTextContent('09/18/2026, 00:30');
    await expect(canvas.getByTestId('own')).toHaveTextContent('2026/09/18 09:30');
  },
};
