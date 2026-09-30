import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TimePicker, type TimePickerProps } from '../../src/components/time-picker/TimePicker';
import { Temporal } from '../../src/internal/date/plain-date';

// 軸 398: TimePicker（1 列の形）の、開いたときに一覧のどこを見せるか
const meta = {
  title: 'Design Review/398 TimePicker の開いたときの位置',
  id: 'design-review-398-time-picker-scroll',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '中央・いまの時刻',
    intent:
      '選んでいる時刻を一覧の中ほどに置き、前後の時刻も見せる。値がないときは、いまの時刻に近い項目を中ほどに置く',
    spec: [
      ['選んでいる時刻', '一覧の中央'],
      ['値がないとき', 'いまの時刻の近く'],
    ],
    tokens: { '--time-picker-scroll-align': '0.5', '--time-picker-empty-target': '1' },
  },
  {
    id: 'A',
    name: '上端・いまの時刻',
    intent: '選んでいる時刻を一覧の先頭に置く。これより後の時刻を多く見せる',
    spec: [
      ['選んでいる時刻', '一覧の上端'],
      ['値がないとき', 'いまの時刻の近く（上端）'],
    ],
    tokens: { '--time-picker-scroll-align': '0', '--time-picker-empty-target': '1' },
  },
  {
    id: 'B',
    name: '中央・先頭',
    intent:
      '値があるときは現行版と同じ。値がないときは、一覧の先頭（0:00 か、min の時刻）から見せる',
    spec: [
      ['選んでいる時刻', '一覧の中央'],
      ['値がないとき', '一覧の先頭'],
    ],
    tokens: { '--time-picker-scroll-align': '0.5', '--time-picker-empty-target': '0' },
  },
  {
    id: 'C',
    name: '上端・先頭',
    intent: 'スクロールの位置を工夫しない。値があれば先頭に、なければ一覧の頭から見せる',
    spec: [
      ['選んでいる時刻', '一覧の上端'],
      ['値がないとき', '一覧の先頭'],
    ],
    tokens: { '--time-picker-scroll-align': '0', '--time-picker-empty-target': '0' },
  },
];

const columns: Column[] = [
  { label: '値あり', note: '10:30・15 分刻み' },
  { label: '値なし', note: 'min 9:00・max 18:00。いまの時刻による' },
];

function OpenPicker(props: Partial<TimePickerProps>) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className="relative h-[24rem] w-64">
      {container && (
        <TimePicker
          label="開始時刻"
          presentation="popover"
          defaultOpen
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
          // 比べるために面をいくつも同時に開くので、開いたときのフォーカスは移さない（面どうしでフォーカスを取り合わない）
          popupProps={{ initialFocus: false } as never}
          {...props}
        />
      )}
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={398}
      axis="TimePicker の開いたときの位置"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <>
          {column.label === '値あり' && (
            <OpenPicker defaultValue={Temporal.PlainTime.from('10:30')} />
          )}
          {column.label === '値なし' && (
            <OpenPicker
              min={Temporal.PlainTime.from('09:00')}
              max={Temporal.PlainTime.from('18:00')}
            />
          )}
        </>
      )}
    >
      <p>
        <strong>
          決定:
          現行版（選んだ時刻を一覧の中央に、値がないときはいまの時刻の近くを開く）。前後の時刻が初めから見え、区切りの単位が分かりやすい（ADR
          は記録のときに振る）
        </strong>
      </p>
      <p>
        欄の右端のボタンで開く、刻みごとの時刻の 1 列の一覧です。96 項目（15
        分刻み）あるので、開いたときにどこを見せるかで、探す手間が変わります。部品では、開いた時点で選んでいる時刻にフォーカスが移ります（この比較では面をいくつも同時に開くので、フォーカスは移していません）。
      </p>
      <p>
        値がないときの「先頭」は、選べるいちばん早い時刻です（min がなければ
        0:00。右の列では、選べない 0:00〜8:45 を飛ばして
        9:00）。「いまの時刻」は、選べる時刻のうちいまにいちばん近いものです（営業時間の外なら 9:00
        か 18:00）。右の列は、開いた時刻によって位置が変わります。既定にする案を教えてください。
      </p>
    </Comparison>
  ),
};
