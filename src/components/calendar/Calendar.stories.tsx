import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';

import { Calendar, type CalendarRange, type CalendarSingleProps } from './Calendar';
import { Temporal } from '../../internal/date/plain-date';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

// 見た目の基準画像が日によって変わらないよう、今日を固定する
const today = Temporal.PlainDate.from('2026-09-19');
// 見本の祝日（部品は祝日のデータを持たない）
const holidays: Record<string, string> = {
  '2026-09-21': '敬老の日',
  '2026-09-22': '国民の休日',
  '2026-09-23': '秋分の日',
};
const getHoliday = (date: Temporal.PlainDate) => holidays[date.toString()];
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
          '- `color` は選んだ日の色です。既定はグレー（`neutral`）です。`shape="round"` で日を丸にできます。',
          '- 日曜と祝日は赤、土曜は青です。どの曜日も同じ色にするときは `weekendColor={false}` にします。',
          '- 祝日は `getHoliday`（日付を受け取り、祝日の名前を返す関数）で渡します。部品は祝日のデータを持ちません。日本の祝日は `@holiday-jp/holiday_jp` などのデータを渡せます。名前は読み上げで日付のあとに読まれます。',
          '- 月送りのボタンは、既定で月の名前の両側に置きます。`navPlacement="end"` で右にまとめます。',
          '- 前後の月の日は灰色で見せます。`showOutsideDays={false}` で隠します。表はいつも 6 週で、月を送っても高さが変わりません。',
          '- 月を送ると、すぐに切り替わります。`monthTransition="fade"` で、その場でふわっと入れ替わります。',
          '- `min`・`max` で選べる期間を区切ります。区切りの外の月へは送れません。日ごとに押せなくするときは `isDateDisabled` を使います。',
          '- 曜日と月の名前、週の始まりの曜日は `locale` に従います。今日は `timeZone` での今日です。どちらも ThemeProvider で決められます。',
          '- 矢印キーで日を、Page Up・Page Down で月を、Shift を足すと年を送ります。',
          '- 日は指で押せる大きさの正方形です。入れ物が狭いときは、正方形のまま小さくなります。',
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
    shape: {
      control: 'inline-radio',
      options: ['square', 'round'],
      table: { defaultValue: { summary: "'square'" } },
    },
    navPlacement: {
      control: 'inline-radio',
      options: ['sides', 'end'],
      table: { defaultValue: { summary: "'sides'" } },
    },
    monthTransition: {
      control: 'inline-radio',
      options: ['none', 'fade'],
      table: { defaultValue: { summary: "'none'" } },
    },
    weekendColor: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showOutsideDays: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
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

const initialRange: CalendarRange = {
  start: Temporal.PlainDate.from('2026-09-08'),
  end: Temporal.PlainDate.from('2026-09-16'),
};

function RangeExample({
  color,
  initial = initialRange,
}: Pick<CalendarSingleProps, 'color'> & { initial?: CalendarRange | null }) {
  const [value, setValue] = useState<CalendarRange | null>(initial);
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

export const Options: Story = {
  tags: ['visual'],
  name: '形と置き方',
  render: (args) => (
    <Gallery columnWidth="20rem">
      <Specimen label='shape="round"'>
        <Calendar
          today={today}
          shape="round"
          color="primary"
          mode="range"
          defaultValue={initialRange}
        />
      </Specimen>
      <Specimen label='navPlacement="end"'>
        <Calendar {...(args as CalendarSingleProps)} navPlacement="end" />
      </Specimen>
      <Specimen label="weekendColor={false}">
        <Calendar {...(args as CalendarSingleProps)} weekendColor={false} />
      </Specimen>
      <Specimen label="showOutsideDays={false}">
        <Calendar {...(args as CalendarSingleProps)} showOutsideDays={false} />
      </Specimen>
    </Gallery>
  ),
};

export const Holidays: Story = {
  tags: ['visual'],
  name: '祝日',
  args: { getHoliday },
  parameters: {
    docs: {
      source: sourceCode(`
        // 祝日のデータ（日付 → 名前）は使う側が用意する
        const holidays: Record<string, string> = { '2026-09-21': '敬老の日', '2026-09-23': '秋分の日' };

        <Calendar getHoliday={(date) => holidays[date.toString()]} />
      `),
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: '2026年9月21日月曜日 敬老の日' })
    ).toBeVisible();
  },
};

// 期間の始まりを選んだあと、マウスを載せた日まで薄い帯が出る
export const RangeInProgress: Story = {
  name: '期間を選んでいる途中',
  render: () => <RangeExample color="primary" initial={null} />,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: '2026年9月8日火曜日' }));
    // React は mouseover から、マウスを載せたことを知る
    await fireEvent.mouseOver(canvas.getByRole('button', { name: '2026年9月16日水曜日' }));
    await waitFor(() =>
      expect(canvasElement.querySelector('td[data-day="2026-09-12"]')).toHaveAttribute(
        'data-tentative'
      )
    );
    await expect(canvasElement.querySelector('td[data-day="2026-09-16"]')).toHaveAttribute(
      'data-band',
      'cap-end'
    );
  },
};

export const MonthTransition: Story = {
  name: '月を送る動き',
  args: { monthTransition: 'fade', defaultValue: Temporal.PlainDate.from('2026-09-24') },
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
