import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';

import { Calendar, type CalendarRange, type CalendarSingleProps } from './Calendar';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

// 見た目の基準画像が日によって変わらないよう、今日を固定する
const today = Temporal.PlainDate.from('2026-09-19');
const colors = ['neutral', 'primary', 'secondary'] as const;

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '月の日を並べて、1 日か期間を選ぶカレンダーです。値は `Temporal.PlainDate`（時刻もタイムゾーンも持たない日付）で受け渡します。',
          '',
          '- `Temporal` は `@kazuemon/ui` から読めます。ブラウザに Temporal がないとき（Safari）も、そのまま動きます。',
          '- `mode="range"` で期間を選びます。1 回目に押した日が始まり、2 回目が終わりです。値は `{ start, end }` で、終わりを選ぶまでは `end` が `null` です。',
          '- `color` は選んだ日の色です。既定はグレー（`neutral`）です。',
          '- `min`・`max` で選べる期間を区切ります。区切りの外の月へは送れません。日ごとに押せなくするときは `isDateDisabled` を使います。',
          '- 曜日と月の名前、週の始まりの曜日は `locale` に従います。今日は `timeZone` での今日です。どちらも ThemeProvider で決められます。',
          '- 矢印キーで日を、Page Up・Page Down で月を、Shift を足すと年を送ります。',
        ].join('\n'),
      },
    },
  },
  args: { today },
  argTypes: {
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { defaultValue: Temporal.PlainDate.from('2026-09-24') },
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  render: (args) => (
    <Gallery columnWidth="20rem">
      {colors.map((color) => (
        <Specimen key={color} label={color}>
          <Calendar
            {...(args as CalendarSingleProps)}
            color={color}
            defaultValue={Temporal.PlainDate.from('2026-09-24')}
          />
        </Specimen>
      ))}
    </Gallery>
  ),
};

function RangeExample({ color }: Pick<CalendarSingleProps, 'color'>) {
  const [value, setValue] = useState<CalendarRange | null>({
    start: Temporal.PlainDate.from('2026-09-08'),
    end: Temporal.PlainDate.from('2026-09-16'),
  });
  return (
    <Calendar today={today} color={color} mode="range" value={value} onValueChange={setValue} />
  );
}

export const Range: Story = {
  tags: ['visual'],
  name: '期間',
  parameters: {
    docs: {
      source: sourceCode(`
        const [value, setValue] = useState<CalendarRange | null>(null);

        <Calendar mode="range" value={value} onValueChange={setValue} />
      `),
    },
  },
  render: () => (
    <Gallery columnWidth="20rem">
      {colors.map((color) => (
        <Specimen key={color} label={color}>
          <RangeExample color={color} />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Limits: Story = {
  tags: ['visual'],
  name: '選べる日を区切る',
  args: {
    min: Temporal.PlainDate.from('2026-09-10'),
    max: Temporal.PlainDate.from('2026-10-20'),
    // 日曜は選べない
    isDateDisabled: (date) => date.dayOfWeek === 7,
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: (args) => (
    <DensityPair>
      <Calendar
        {...(args as CalendarSingleProps)}
        defaultValue={Temporal.PlainDate.from('2026-09-24')}
      />
    </DensityPair>
  ),
};

export const Locale: Story = {
  tags: ['visual'],
  name: '言語',
  render: (args) => (
    <Gallery columnWidth="20rem">
      <Specimen label="ja-JP（日曜はじまり）">
        <Calendar {...args} />
      </Specimen>
      <Specimen label="en-GB（月曜はじまり）">
        <Calendar
          {...args}
          locale="en-GB"
          labels={{
            previousMonth: 'Previous month',
            nextMonth: 'Next month',
            today: 'Today',
            selected: 'selected',
          }}
        />
      </Specimen>
    </Gallery>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: { defaultValue: Temporal.PlainDate.from('2026-09-24') },
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid', { name: '2026年9月' });
    await expect(grid).toBeVisible();
    await expect(canvas.getByRole('button', { name: '今日 2026年9月19日土曜日' })).toBeVisible();
    const selected = canvas.getByRole('button', { name: '2026年9月24日木曜日 選択中' });
    await expect(selected).toBeVisible();
    // 矢印キーで日を動かし、Enter で選ぶ
    selected.focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(canvas.getByRole('button', { name: '2026年9月25日金曜日 選択中' })).toHaveFocus();
    // 次の月へ送る
    await userEvent.click(canvas.getByRole('button', { name: '次の月' }));
    await expect(canvas.getByRole('grid', { name: '2026年10月' })).toBeVisible();
  },
};
