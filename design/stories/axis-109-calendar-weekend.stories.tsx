import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarSample } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 109: Calendar の日曜・土曜の色
// --calendar-weekend-color（0 か 1）、色は --color-calendar-sunday・--color-calendar-saturday

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '色を付けない',
    intent:
      '曜日の見出しはキャプションと同じ灰色、日は本文の色でそろえる。色は役割で持つ（原則6）ので、危険の赤や情報の青を曜日に使わない。',
    spec: [
      ['見出し', '灰色'],
      ['日', '本文の色'],
    ],
    tokens: { '--calendar-weekend-color': '0' },
  },
  {
    id: 'A',
    name: '日曜を赤、土曜を青',
    intent:
      '日本の暦の慣習どおり、日曜を赤、土曜を青にする。見出しと日の両方に付ける。赤は危険の赤、青は情報の青（Primary と同じ）を使う。',
    spec: [
      ['日曜', '危険の赤（前景用）'],
      ['土曜', '情報の青'],
      ['付けない日', '選んだ日・期間・押せない日・ほかの月の日'],
    ],
    tokens: { '--calendar-weekend-color': '1' },
  },
];

const columns: Column[] = [
  { label: 'グレー', note: '24 日を選んだところ' },
  { label: 'Primary の期間', note: '8〜16 日。土曜・日曜が帯に入る' },
  { label: '押せない日', note: '10 日より前と、日曜が押せない' },
];

const meta = {
  title: 'Design Review/109 Calendar の日曜と土曜',
  id: 'design-review-109-calendar-weekend',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'A,current'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={109}
      axis="Calendar の日曜と土曜の色"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case 'グレー':
            return <CalendarSample sample="single" />;
          case 'Primary の期間':
            return <CalendarSample sample="range" color="primary" />;
          default:
            return <CalendarSample sample="limits" />;
        }
      }}
    >
      <p>
        <strong>
          決定（ADR-0137）:
          A（日曜を赤、土曜を青）を既定にし、現行版（色を付けない）も選べるようにしました。
        </strong>
      </p>
      <p>
        日本の暦では日曜を赤、土曜を青にすることが多いです。一方、このシステムの赤は「危険」の色で、青は
        Primary と情報の色です。祝日は部品では分からないので、赤にはなりません。
      </p>
      <p>どちらを既定にするかを選んでください（もう一方を選べるようにもできます）。</p>
    </Comparison>
  ),
};
