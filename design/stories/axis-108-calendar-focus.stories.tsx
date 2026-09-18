import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarSample, calendarPseudo, dayButton } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 108: Calendar でキーボードで日を動かしたときの印
// --calendar-focus-ring（1 でフォーカスの線、0 で hover と同じ塗り）

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'フォーカスの線',
    intent:
      '日はそれぞれボタンで、矢印キーでフォーカスそのものが日から日へ移る。ボタンと同じく、キーボードで操作したときだけ、少し離した線を引く。',
    spec: [
      ['印', 'フォーカスの線（部品の色。グレーは濃紺）'],
      ['マウス・指', '出ない'],
    ],
    tokens: { '--calendar-focus-ring': '1' },
  },
  {
    id: 'A',
    name: 'hover と同じ塗り',
    intent:
      '原則2 の「一覧の中をキーボードで選んでいるときは、線ではなく hover と同じ塗り」を日の表にも当てる。選んだ日の上では、濃い塗りがわずかに変わるだけになる。',
    spec: [
      ['印', 'hover と同じ、文字の色を淡く敷いた塗り'],
      ['マウス・指', '出ない'],
    ],
    tokens: { '--calendar-focus-ring': '0' },
  },
];

const columns: Column[] = [
  { label: '選んでいない日', note: '24 日にフォーカス', preview: 'focus' },
  { label: '選んだ日', note: '24 日を選び、フォーカス', preview: 'focus' },
  { label: 'Primary の選んだ日', note: '24 日', preview: 'focus' },
];

const meta = {
  title: 'Design Review/108 Calendar のキーボードの印',
  id: 'design-review-108-calendar-focus',
  parameters: {
    layout: 'fullscreen',
    pseudo: calendarPseudo({ focus: [dayButton('2026-09-24')] }),
  },
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

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={108}
      axis="Calendar でキーボードで日を動かしたときの印"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        switch (column.label) {
          case '選んでいない日':
            return <CalendarSample sample="plain" />;
          case '選んだ日':
            return <CalendarSample sample="single" />;
          default:
            return <CalendarSample sample="single" color="primary" />;
        }
      }}
    >
      <p>
        <strong>決定（ADR-0136）: 現行版（フォーカスの線）にしました。</strong>
      </p>
      <p>
        原則2 では、一覧の中をキーボードで選んでいるときは線ではなく hover
        と同じ塗りで示します。ただ、Select
        の一覧はフォーカスが欄に残ったまま項目を指すのに対し、カレンダーはフォーカスそのものが日のボタンへ移ります。どちらの仲間とみるかを決めます。
      </p>
      <p>実際に Tab で日へ入り、矢印キーで動かして確かめられます。</p>
    </Comparison>
  ),
};
