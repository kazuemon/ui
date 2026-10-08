import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { crossMonth, LiveRange, scrollable } from './date-range-axis-parts';

// 軸 610: DateRangePicker の面に並べる月の数と、前後の月の日の見せ方（浮かべるとき。シートではいつも 1 か月）
const meta = {
  title: 'Design Review/610 期間の面の月の数',
  id: 'design-review-610-date-range-months',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollable],
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

type Months = Candidate & { numberOfMonths: 1 | 2; hideOutsideDays: boolean };

const candidates: Months[] = [
  {
    id: '現行版',
    name: '2 か月・前後の月の日を隠す',
    intent:
      '見せている月と次の月を横に並べる。月をまたぐ期間も一度に見渡せる。同じ日が 2 か所に出て帯が二重に見えないよう、前後の月の日は隠す',
    spec: [
      ['月の数', '2（numberOfMonths={2}）'],
      ['前後の月の日', '隠す'],
      ['面の幅', '約 680px'],
    ],
    numberOfMonths: 2,
    hideOutsideDays: true,
  },
  {
    id: 'A',
    name: '2 か月・前後の月の日も出す',
    intent:
      '現行版で、前後の月の日を Calendar の既定どおり灰色で出す。左の月の最後の週に右の月の日が並び、期間の帯が両方の月に引かれる',
    spec: [
      ['月の数', '2'],
      ['前後の月の日', '灰色で出す（Calendar と同じ）'],
      ['面の幅', '約 680px'],
    ],
    numberOfMonths: 2,
    hideOutsideDays: false,
  },
  {
    id: 'B',
    name: '1 か月（DatePicker と同じ）',
    intent:
      'DatePicker と同じ 1 か月の面。面が小さく、欄の幅に近い。月をまたぐ期間は、始まりを押したあと月を送って終わりを押す',
    spec: [
      ['月の数', '1（numberOfMonths={1}）'],
      ['前後の月の日', '灰色で出す'],
      ['面の幅', '約 340px'],
    ],
    numberOfMonths: 1,
    hideOutsideDays: false,
  },
];

type MonthsColumn = Column & { empty: boolean };

const columns: MonthsColumn[] = [
  {
    label: '月をまたぐ期間（9/27〜10/3）',
    note: '日を押すと選び直せる（1 回目が始まり、2 回目が終わり。始まりのあとは載せた日まで薄い帯）',
    empty: false,
  },
  { label: '空', note: '何も選んでいない。日を押して選ぶ', empty: true },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={610}
      axis="期間を選ぶ面に並べる月の数"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const months = candidate as Months;
        return (
          <LiveRange
            defaultValue={(column as MonthsColumn).empty ? null : crossMonth}
            numberOfMonths={months.numberOfMonths}
            hideOutsideDays={months.hideOutsideDays}
          />
        );
      }}
    >
      <p>
        <strong>
          決定: 既定は B（1 か月・前後の月の日を出す）。2 か月（現行版）も numberOfMonths で選べる
        </strong>
      </p>
      <p>
        DateRangePicker
        で、欄の下に浮かべる面に、カレンダーを何か月並べるかを選びます。指で操作していて画面が狭いときのシートは、どの案でも
        1 か月です（2 か月は入らない）。
      </p>
      <p>
        欄の下の面は、本物の面の中身をそのまま置いたものです。日を押すと欄の値も変わります。欄の右端のボタンで、本物の面も開けます。
      </p>
      <p>
        「2 か月を既定にし、1
        か月も選べる（numberOfMonths）」のような決め方もできます。既定にする案を教えてください。
      </p>
    </Comparison>
  ),
};
