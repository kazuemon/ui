import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { scrollable, stay, today } from './date-range-axis-parts';
import {
  DateRangePicker,
  type DateRangePickerVariant,
} from '../../src/components/date-range-picker/DateRangePicker';

// 軸 613: DateRangePicker の、始まりと終わりの日のあいだの記号（--date-range-picker-separator）
const meta = {
  title: 'Design Review/613 期間のあいだの記号',
  id: 'design-review-613-date-range-separator',
  parameters: { layout: 'fullscreen' },
  decorators: [scrollable],
  args: { pick: 'A' },
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

// 記号は決定で separator（ReactNode）に移した。候補は props で作る
type Separator = Candidate & { separator: string };

const candidates: Separator[] = [
  {
    id: '現行版',
    name: 'en ダッシュ（–）',
    intent: '欧文の範囲の記号。細く短いので、区切りの「/」と並んでもうるさくない',
    spec: [['記号', '–（U+2013）']],
    separator: '–',
  },
  {
    id: 'A',
    name: '波ダッシュ（〜）',
    intent:
      '和文で期間を書くときの記号（10/5〜10/8）。全角の幅なので、記号の左右の余白は詰めて見える',
    spec: [['記号', '〜（U+301C）']],
    separator: '〜',
  },
  {
    id: 'B',
    name: '矢印（→）',
    intent: '始まりから終わりへの向きを見せる。予約サイトのチェックイン → チェックアウトに近い',
    spec: [['記号', '→（U+2192）']],
    separator: '→',
  },
];

type VariantColumn = Column & { variant: DateRangePickerVariant };

const columns: VariantColumn[] = [
  { label: '1 つの欄', note: 'variant="field"', variant: 'field' },
  { label: 'ボタン', note: 'variant="button"', variant: 'button' },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={613}
      axis="始まりと終わりの日のあいだの記号"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-96">
          <DateRangePicker
            label="宿泊の期間"
            variant={(column as VariantColumn).variant}
            separator={(candidate as Separator).separator}
            defaultValue={stay}
            today={today}
          />
        </div>
      )}
    >
      <p>
        <strong>
          決定: 既定は A（〜）。記号は任意の ReactNode（アイコン・「から」など）を渡せる
        </strong>
      </p>
      <p>
        欄とボタンで、始まりと終わりの日のあいだに置く記号を選びます。記号は見た目だけで、読み上げでは「開始日」「終了日」の名前（ボタンでは「から」）で区別します。
      </p>
      <p>記号はトークン 1 つで、使う側が差し替えることもできます。どの行も操作できます。</p>
    </Comparison>
  ),
};
