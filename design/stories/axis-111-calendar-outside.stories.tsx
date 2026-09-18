import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarSample } from './calendar-samples';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 111: Calendar のほかの月の日
// --calendar-outside-visible（1 で見せる、0 で隠す）。決まったら props（見せるかどうか）に畳む

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '灰色で見せる',
    intent:
      '前後の月の日を、キャプションと同じ灰色で見せる。押すと、その日を選んでその月へ移る。表はいつも 6 週で、月を送っても高さが変わらない。',
    spec: [
      ['ほかの月の日', '灰色の文字・押せる'],
      ['週の数', 'いつも 6 週'],
    ],
    tokens: { '--calendar-outside-visible': '1' },
  },
  {
    id: 'A',
    name: '隠す',
    intent: 'その月の日だけを見せる。軽いが、月の変わり目の週が欠けて見える。高さは 6 週のまま。',
    spec: [
      ['ほかの月の日', '出さない'],
      ['週の数', 'いつも 6 週（空の行が残る）'],
    ],
    tokens: { '--calendar-outside-visible': '0' },
  },
];

const columns: Column[] = [
  { label: 'グレー', note: '24 日を選んだところ' },
  { label: '月をまたぐ期間', note: '9 月 27 日〜10 月 2 日（Primary）' },
];

const meta = {
  title: 'Design Review/111 Calendar のほかの月の日',
  id: 'design-review-111-calendar-outside',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'current,A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={111}
      axis="Calendar のほかの月の日"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === 'グレー' ? (
          <CalendarSample sample="single" />
        ) : (
          <CalendarSample sample="range-across" color="primary" />
        )
      }
    >
      <p>
        <strong>
          決定（ADR-0139）: 現行版（灰色で見せる）を既定にし、A（隠す）も選べるようにしました。
        </strong>
      </p>
      <p>
        月の最初と最後の週にある、前後の月の日を見せるかを決めます。隠す案を選んだ場合は、見せる形も
        props で選べるようにします。
      </p>
    </Comparison>
  ),
};
