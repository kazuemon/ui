import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarSample, calendarPseudo, dayButton } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 106: Calendar の選んだ日の形と塗り
// 形は --calendar-day-radius、塗りは --calendar-selected-strong（1 で濃い塗り、0 で淡い面）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '角丸の四角・濃い塗り',
    intent:
      '日は部品の高さの正方形で、ボタンと同じ部品の角。選んだ日は、チェックボックスやトグルの ON と同じく、部品の色の濃い塗りに白い文字。期間の中の日は淡い面の帯でつなぐ。',
    spec: [
      ['角', '部品の角'],
      ['選んだ日', '部品の色の濃い塗り・白い文字・太字'],
      ['期間の中', '淡い面の帯・同じ色相の文字'],
    ],
    tokens: { '--calendar-day-radius': 'var(--radius-control)', '--calendar-selected-strong': '1' },
  },
  {
    id: 'A',
    name: '丸・濃い塗り',
    intent:
      '日を丸にする。タグやトグルと同じ小物（pill）の仲間として扱う。期間の帯の両端も丸くなる。',
    spec: [
      ['角', '丸'],
      ['選んだ日', '濃い塗り（現行版と同じ）'],
    ],
    tokens: { '--calendar-day-radius': 'var(--radius-pill)', '--calendar-selected-strong': '1' },
  },
  {
    id: 'B',
    name: '角丸の四角・淡い面',
    intent:
      'Select の選んだ項目と同じく、部品の色の淡い面に濃い文字。軽いが、期間の両端と中が同じ面になり、太字だけで見分ける。',
    spec: [
      ['角', '部品の角'],
      ['選んだ日', '淡い面・同じ色相の文字・太字'],
    ],
    tokens: { '--calendar-day-radius': 'var(--radius-control)', '--calendar-selected-strong': '0' },
  },
  {
    id: 'C',
    name: '丸・淡い面',
    intent: 'A の形に B の塗り。',
    spec: [
      ['角', '丸'],
      ['選んだ日', '淡い面'],
    ],
    tokens: { '--calendar-day-radius': 'var(--radius-pill)', '--calendar-selected-strong': '0' },
  },
];

const columns: Column[] = [
  { label: 'グレー（既定）', note: '24 日を選んだところ。19 日が今日' },
  { label: 'Primary', note: '24 日を選び、25 日に hover', preview: 'hover' },
  { label: 'Primary の期間', note: '8〜16 日' },
  { label: 'グレーの期間', note: '8〜16 日' },
];

const meta = {
  title: 'Design Review/106 Calendar の選んだ日',
  id: 'design-review-106-calendar-selected',
  parameters: {
    layout: 'fullscreen',
    pseudo: calendarPseudo({ hover: [dayButton('2026-09-25')] }),
  },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'current,A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={106}
      axis="Calendar の選んだ日の形と塗り"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case 'グレー（既定）':
            return <CalendarSample sample="single" />;
          case 'Primary':
            return <CalendarSample sample="single" color="primary" />;
          case 'Primary の期間':
            return <CalendarSample sample="range" color="primary" />;
          default:
            return <CalendarSample sample="range" />;
        }
      }}
    >
      <p>
        <strong>
          決定（ADR-0134）:
          現行版（部品の角・濃い塗り）を既定にし、A（丸）も選べるようにしました。淡い面（B・C）は期間の帯と紛らわしいので採りません。
        </strong>
      </p>
      <p>
        日は部品の高さの正方形です（指で押せる大きさ）。日の角と、選んだ日の塗りを決めます。hover
        は枠線のボタンと同じく文字の色を淡く敷き、押すと沈みます（ここでは変えていません）。
      </p>
      <p>
        角は、日をボタンの仲間とみるか（部品の角）、小物の仲間とみるか（丸）で分かれます。塗りは、チェックボックスやトグルの
        ON のように濃く塗るか、Select の選んだ項目のように淡い面にするかです。
      </p>
      <p>どれを既定にするかを選んでください（形を選べるようにもできます）。</p>
    </Comparison>
  ),
};
