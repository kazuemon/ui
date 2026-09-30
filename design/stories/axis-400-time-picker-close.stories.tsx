import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TimePicker, type TimePickerProps } from '../../src/components/time-picker/TimePicker';
import { Temporal } from '../../src/internal/date/plain-date';

// 軸 400: TimePicker の列の形の閉じ方
const meta = {
  title: 'Design Review/400 TimePicker の列の形の閉じ方',
  id: 'design-review-400-time-picker-close',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current,B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'A,current,B,C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

function OpenPicker({ width = 'w-64', ...props }: Partial<TimePickerProps> & { width?: string }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className={`relative h-[30rem] ${width}`}>
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '下に「完了」',
    intent:
      '列を選ぶたびに欄の値は変わり、面は開いたまま。下の「完了」で閉じる（外を押す・Esc でも閉じる）。時と分を行き来して選び直せる',
    spec: [
      ['完了のボタン', 'あり（右下・グレーの塗り）'],
      ['分を選んだとき', '開いたまま'],
    ],
    tokens: { '--time-picker-done-display': 'flex', '--time-picker-close-on-last': '0' },
  },
  {
    id: 'A',
    name: '分を選んだら閉じる',
    intent:
      '時 → 分の順に選ぶと、分を選んだところで閉じる。ボタンを置かず、面が小さい。時を選び直すだけなら、外を押すか Esc で閉じる',
    spec: [
      ['完了のボタン', 'なし'],
      ['分を選んだとき', '閉じる（秒を出すときは秒）'],
    ],
    tokens: { '--time-picker-done-display': 'none', '--time-picker-close-on-last': '1' },
  },
  {
    id: 'B',
    name: '分で閉じ、「完了」も置く',
    intent: 'A に「完了」を足す。時だけを直したときにも、閉じる手段が見える',
    spec: [
      ['完了のボタン', 'あり'],
      ['分を選んだとき', '閉じる'],
    ],
    tokens: { '--time-picker-done-display': 'flex', '--time-picker-close-on-last': '1' },
  },
  {
    id: 'C',
    name: '閉じる手段を置かない',
    intent: 'Popover と同じく、外を押すか Esc で閉じるだけ。値は選ぶたびに入っている',
    spec: [
      ['完了のボタン', 'なし'],
      ['分を選んだとき', '開いたまま'],
    ],
    tokens: { '--time-picker-done-display': 'none', '--time-picker-close-on-last': '0' },
  },
];

const columns: Column[] = [
  { label: '開いた状態', note: '10:30・5 分刻み。行の中で押して確かめられます' },
  { label: '値なし', note: '5 分刻み' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={400}
      axis="TimePicker の列の形の閉じ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <>
          {column.label === '開いた状態' && (
            <OpenPicker
              variant="columns"
              minuteStep={5}
              defaultValue={Temporal.PlainTime.from('10:30')}
            />
          )}
          {column.label === '値なし' && <OpenPicker variant="columns" minuteStep={5} />}
        </>
      )}
    >
      <p>
        <strong>
          決定: A（いちばん小さい単位を選んだら閉じる・「完了」なし）を既定にする。閉じるかは
          closeOnSelect、「完了」は showDoneButton で、それぞれ選べる（現行版・B・C
          の組み合わせ）（ADR は記録のときに振る）
        </strong>
      </p>
      <p>
        <code>variant="columns"</code> では、時と分を別々に選びます。1
        列の形（既定）は選ぶとすぐ閉じますが、列の形は 1
        回では値が決まらないので、いつ閉じるかを決めます。どの案でも、列を選ぶたびに欄の値は変わり、外を押すか
        Esc でも閉じます。
      </p>
      <p>
        各行の見本は実際に動きます。1
        つを押すと、ほかの見本の面は外を押したことになって閉じます。閉じたら、右端の時計のボタンでもう一度開けます。既定にする案を教えてください。
      </p>
    </Comparison>
  ),
};
