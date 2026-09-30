import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { day, today } from './DatePickerAxisParts';
import { DatePicker } from '../../src/components/date-picker/DatePicker';
import {
  type DatePickerClearLayout,
  DatePickerClearLayoutContext,
} from '../../src/components/date-picker/clear-layout';

// 軸 392（2 ラウンド目）: DatePicker（打ち込める欄）に消去のボタンを出したときの置き方
// 1 ラウンド目で、既定は暦のボタンだけ（消去なし）に決まった。消去のボタン（clearable）を出したときに、
// 値を選んだ瞬間に暦のボタンが動かない置き方を比べる
// 並びは DOM の順で変える（CSS の order だと Tab の順と見た目がずれる）ので、トークンではなく部品の中の切り替え（clear-layout.ts）で作る
const meta = {
  title: 'Design Review/392 DatePicker の消去のボタンの置き方',
  id: 'design-review-392-date-picker-end-buttons',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// 案ごとの置き方
const rowLayout: Record<string, DatePickerClearLayout> = {
  現行版: { position: 'end', whenEmpty: 'hide' },
  A: { position: 'before-trigger', whenEmpty: 'hide' },
  B: { position: 'end', whenEmpty: 'disabled' },
  C: { position: 'before-trigger', whenEmpty: 'disabled' },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '× が右端に入り、暦がずれる',
    intent:
      '値があるときだけ × が右端に入り、暦のボタンが内側へずれる。Combobox の ▼ と × と同じ並び。値を選んだ瞬間に暦のボタンが動く',
    spec: [
      ['× の場所', '右端'],
      ['値がないとき', '出さない'],
      ['暦のボタン', '値が入ると内側へずれる'],
    ],
  },
  {
    id: 'A',
    name: '× が暦の左に入る',
    intent:
      '値があるときだけ × を暦のボタンの左に出す。暦のボタンは右端から動かない。× は日付の文字の右の空いたところに出るので、文字も動かない',
    spec: [
      ['× の場所', '暦のボタンの左'],
      ['値がないとき', '出さない'],
      ['暦のボタン', '右端から動かない'],
    ],
  },
  {
    id: 'B',
    name: '× をいつも右端に（空は押せない）',
    intent:
      '× をいつも出しておき、値がないときは押せない形にする。何も動かない。止めた欄の消去のボタンを押せない形で残すのと同じ考え',
    spec: [
      ['× の場所', '右端'],
      ['値がないとき', '押せない形で出す'],
      ['暦のボタン', 'いつも内側'],
    ],
  },
  {
    id: 'C',
    name: '× をいつも暦の左に（空は押せない）',
    intent: 'B の並びを入れ替え、暦のボタンを右端に置く。開く口が Select の ▼ と同じ右端にそろう',
    spec: [
      ['× の場所', '暦のボタンの左'],
      ['値がないとき', '押せない形で出す'],
      ['暦のボタン', '右端から動かない'],
    ],
  },
];

const columns: Column[] = [
  { label: '値なし' },
  { label: '値あり', note: '値を選んだあと' },
  { label: '押せない', note: 'disabled・値あり' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={392}
      axis="DatePicker の消去のボタンの置き方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div className="w-[280px]">
          <DatePickerClearLayoutContext value={rowLayout[candidate.id]}>
            <DatePicker
              label="予約日"
              today={today}
              clearable
              defaultValue={column.label === '値なし' ? null : day}
              disabled={column.label === '押せない'}
            />
          </DatePickerClearLayoutContext>
        </div>
      )}
    >
      <p>
        決定: A（値があるときだけ × を暦のボタンの左に出す。暦のボタンは右端から動かない）（ADR
        は記録のときに振る）。押せない × を置いておく B・C
        は、できない操作のボタンを置くことになるので採らない。Combobox・Select の ▼
        はボタンではなく飾りなので、× が右端に入る並びのまま。
      </p>
      <p>
        1 ラウンド目で、既定は暦のボタンだけ（消去のボタンなし）に決まりました。ここでは、
        <code>clearable</code>
        で値を消すボタンを出したときの置き方を比べます。値なしと値ありの列を見比べて、値を選んだ瞬間に何が動くかを見てください。
      </p>
      <p>
        ×
        を塗りのないアイコンにして場所をいつも取っておく案は、塗りのないアイコンが「押せない説明」の印なので外しました（Combobox
        の消去で外したのと同じ理由です）。何も描かずに場所だけ空けておく案も、欄の端に空きがあるだけに見えるので外しました。
      </p>
      <p>既定にする案と、ほかにも選べるようにする案があれば教えてください。</p>
    </Comparison>
  ),
};
