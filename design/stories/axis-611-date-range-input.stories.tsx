import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { scrollable, stay, today } from './date-range-axis-parts';
import {
  DateRangePicker,
  type DateRangePickerVariant,
} from '../../src/components/date-range-picker/DateRangePicker';

// 軸 611: DateRangePicker の欄の形（1 つの欄に始まりと終わりを並べるか、2 つの欄に分けるか）
const meta = {
  title: 'Design Review/611 期間の欄の形',
  id: 'design-review-611-date-range-input',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollable],
  args: { pick: 'current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,B'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// split は決定で部品から外した。その行は、決めた時点のコミット（270bc16e）で開ける
type Shape = Candidate & { variant: DateRangePickerVariant | 'split' };

const candidates: Shape[] = [
  {
    id: '現行版',
    name: '1 つの欄（開始 – 終了）',
    intent:
      '1 つのグレーの欄に、始まりと終わりの区切り（DateField と同じ）を並べ、右端に暦のボタンを置く。1 つの値（期間）を 1 つの欄で表す。区切りは Tab で始まりから終わりへ続けて移る',
    spec: [
      ['variant', "'field'"],
      ['欄', '1 つ（枠線・塗りも 1 つ）'],
      ['暦のボタン', '欄の右端'],
    ],
    variant: 'field',
  },
  {
    id: 'A',
    name: '2 つの欄に分ける',
    intent:
      '始まりと終わりを別の欄にし、あいだに記号を置く。暦のボタンは終わりの欄の右端。宿の予約のチェックイン・チェックアウトのように、両端を別々に見せる',
    spec: [
      ['variant', "'split'"],
      ['欄', '2 つ（フォーカスの枠線は打っている側だけ）'],
      ['暦のボタン', '終わりの欄の右端'],
    ],
    variant: 'split',
  },
  {
    id: 'B',
    name: 'ボタンだけ（打てない）',
    intent:
      'DatePicker の variant="button" と同じ、打てない表示だけのボタン。押すとカレンダーを開く。期間の文字は詰めて書くので、狭い幅にも入る',
    spec: [
      ['variant', "'button'"],
      ['欄', '1 つ（押すと開く）'],
      ['打ち込み', 'できない'],
    ],
    variant: 'button',
  },
];

type InputColumn = Column & { filled: boolean; narrow: boolean };

const columns: InputColumn[] = [
  {
    label: '空（幅 384px）',
    note: '区切りを打てる。右端のボタンで面が開く',
    filled: false,
    narrow: false,
  },
  {
    label: '値あり（幅 384px）',
    note: '10/5〜10/8。値があると × が出る',
    filled: true,
    narrow: false,
  },
  {
    label: 'スマートフォンの幅（288px）',
    note: '375px の画面から左右の余白を引いた幅',
    filled: true,
    narrow: true,
  },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={611}
      axis="期間の欄の形（1 つの欄か、2 つの欄か）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(cell, candidate) => {
        const column = cell as InputColumn;
        const { variant } = candidate as Shape;
        if (variant === 'split')
          return (
            <p className="text-xs text-fg-subtle">
              部品から外しました（backlog）。決めた時点のコミット 270bc16e で比べられます
            </p>
          );
        return (
          <div className={column.narrow ? 'w-72' : 'w-96'}>
            <DateRangePicker
              label="宿泊の期間"
              variant={variant}
              defaultValue={column.filled ? stay : null}
              today={today}
              clearable
            />
          </div>
        );
      }}
    >
      <p>
        <strong>
          決定: 既定は現行版（1 つの欄）。B（ボタンだけ）も選べる。A（2 つの欄）は外して backlog へ
        </strong>
      </p>
      <p>
        期間（始まりと終わりの日）を打つ欄を、1 つの欄にするか、2
        つの欄に分けるかを選びます。どの行も操作できます（区切りを打つ・右端のボタンで面を開く・×
        で消す）。
      </p>
      <p>
        狭い幅では、1 つの欄（現行版）も 2
        つの欄（A）も、日付の区切りが入りきらずに切れます。狭いところでは B
        を使ってもらうか、欄を縦に積む形を足すかも、あわせて教えてください。
      </p>
      <p>「X を既定にして、Y も選べる」の形で決められます。既定にする案を教えてください。</p>
    </Comparison>
  ),
};
