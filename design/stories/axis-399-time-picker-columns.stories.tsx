import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TimePicker, type TimePickerProps } from '../../src/components/time-picker/TimePicker';
import { Temporal } from '../../src/internal/date/plain-date';

// 軸 399: TimePicker の列の見出しと区切り
const meta = {
  title: 'Design Review/399 TimePicker の列の見出しと区切り',
  id: 'design-review-399-time-picker-columns',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'A,current,C'],
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

const none = {
  '--time-picker-column-heading-display': 'none',
  '--time-picker-column-divider': '0px',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '見出しも線もなし',
    intent: '列は間だけで分ける。何の列かは、並んだ数字と、上の欄の並び（時 : 分）で分かる',
    spec: [
      ['見出し', 'なし'],
      ['列のあいだ', '線なし'],
    ],
    tokens: none,
  },
  {
    id: 'A',
    name: '列のあいだに線',
    intent: '列のあいだに細い縦線を引き、別々に動く一覧だと見せる',
    spec: [
      ['見出し', 'なし'],
      ['列のあいだ', '細い境界線'],
    ],
    tokens: { ...none, '--time-picker-column-divider': 'var(--border-width-thin)' },
  },
  {
    id: 'B',
    name: '列の上に見出し',
    intent:
      '「時」「分」の見出しを、キャプションと同じ小さいグレーの文字で列の上に置き、細い線で一覧と分ける',
    spec: [
      ['見出し', 'キャプションの文字・下に細い線'],
      ['列のあいだ', '線なし'],
    ],
    tokens: { ...none, '--time-picker-column-heading-display': 'block' },
  },
  {
    id: 'C',
    name: '見出しと線',
    intent: 'B に、列のあいだの細い縦線を足す。表のように見える',
    spec: [
      ['見出し', 'キャプションの文字・下に細い線'],
      ['列のあいだ', '細い境界線'],
    ],
    tokens: {
      '--time-picker-column-heading-display': 'block',
      '--time-picker-column-divider': 'var(--border-width-thin)',
    },
  },
];

const columns: Column[] = [
  { label: '24 時間制', note: '10:30・5 分刻み' },
  { label: '12 時間制', note: '午後 3:00・5 分刻み' },
  { label: '秒あり', note: '10:30:15・5 分刻み' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={399}
      axis="TimePicker の列の見出しと区切り"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <>
          {column.label === '24 時間制' && (
            <OpenPicker
              variant="columns"
              minuteStep={5}
              defaultValue={Temporal.PlainTime.from('10:30')}
            />
          )}
          {column.label === '12 時間制' && (
            <OpenPicker
              variant="columns"
              minuteStep={5}
              hourCycle={12}
              defaultValue={Temporal.PlainTime.from('15:00')}
            />
          )}
          {column.label === '秒あり' && (
            <OpenPicker
              variant="columns"
              minuteStep={5}
              showSeconds
              defaultValue={Temporal.PlainTime.from('10:30:15')}
            />
          )}
        </>
      )}
    >
      <p>
        <strong>
          決定: A（列のあいだに細い縦線）を既定にする。線なし（現行版）は hideColumnDivider
          で、「時」「分」の見出し（C）は showColumnHeading で選べる。見出しは既定では出さない（ADR
          は記録のときに振る）
        </strong>
      </p>
      <p>
        <code>variant="columns"</code> で開く、時・分（12
        時間制では午前・午後、秒を出すときは秒も）を別々に選ぶ列です。列は欄と同じ順に並びます。選んだ項目は、Select
        の選択肢と同じ淡い面と太字です（列が狭いのでチェックは付けていません）。
      </p>
      <p>
        列の見出しは画面に出すかどうかだけで、読み上げでは、どの案でも「時」「分」が一覧の名前として届きます。既定にする案と、ほかにも選べるようにする案があれば教えてください。
      </p>
    </Comparison>
  ),
};
