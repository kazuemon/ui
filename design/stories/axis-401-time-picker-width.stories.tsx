import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TimePicker, type TimePickerProps } from '../../src/components/time-picker/TimePicker';
import { Temporal } from '../../src/internal/date/plain-date';

// 軸 401: TimePicker の浮かぶ面の幅
const meta = {
  title: 'Design Review/401 TimePicker の浮かぶ面の幅',
  id: 'design-review-401-time-picker-width',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A'],
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
    name: '欄の幅まで広げる',
    intent:
      'Select の選択肢と同じく、欄の幅にそろえる。1 列の形はチェックが右端に、列の形は列が幅いっぱいに広がる。欄が中身より狭いときは中身の幅',
    spec: [
      ['幅', '欄の幅（中身より狭くしない）'],
      ['寄せ', '欄の右端'],
    ],
    tokens: { '--time-picker-popup-fill': '1' },
  },
  {
    id: 'A',
    name: '中身の幅',
    intent:
      '時刻の文字とチェックが収まる幅だけにし、開いたボタンの下（欄の右端）にそろえる。欄の左側の値を隠さない',
    spec: [
      ['幅', '中身の幅'],
      ['寄せ', '欄の右端'],
    ],
    tokens: { '--time-picker-popup-fill': '0' },
  },
];

const columns: Column[] = [
  { label: '1 列の形', note: '欄 320px' },
  { label: '列の形', note: '欄 320px・5 分刻み' },
  { label: '狭い欄', note: '欄 160px' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={401}
      axis="TimePicker の浮かぶ面の幅"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <>
          {column.label === '1 列の形' && (
            <OpenPicker width="w-80" defaultValue={Temporal.PlainTime.from('10:30')} />
          )}
          {column.label === '列の形' && (
            <OpenPicker
              width="w-80"
              variant="columns"
              minuteStep={5}
              defaultValue={Temporal.PlainTime.from('10:30')}
            />
          )}
          {column.label === '狭い欄' && (
            <OpenPicker width="w-40" defaultValue={Temporal.PlainTime.from('10:30')} />
          )}
        </>
      )}
    >
      <p>
        <strong>
          決定: 現行版（面を欄の幅まで広げる）。A では面がかなり小さくなる（ADR は記録のときに振る）
        </strong>
      </p>
      <p>
        欄の右端の時計のボタンで開く面の幅です。面はどちらも欄の右端（開いたボタンの側）にそろえます。
      </p>
      <p>既定にする案を教えてください。</p>
    </Comparison>
  ),
};
