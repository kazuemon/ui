import type { Meta, StoryObj } from '@storybook/react-vite';

import type { DataTableSortIndicator } from '../../src/components/data-table/DataTable';

import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { SampleTable } from './data-table-frame';

// 後半の軸 364: DataTable の並べ替えていない列の印
//   並べ替えている列は、いつも上か下の矢印（本文の色）。ここで比べるのは、押せば並べ替えられるがいまは並べ替えていない列の上下の山
// 決定: C（ふだん半分の濃さ、載せると濃く）を既定にし、現行版（always）と A（hover）も sortIndicator で選べる。B は採らない
//   決めたあとは、候補を DataTable の sortIndicator で描く（B だけは、部品の --data-table-sort-idle・-hover をクラスで上書きして再現する）
//   山は淡い文字の色（--color-fg-subtle）。濃さを 0 にしても場所は取るので、並べ替えても見出しの文字は動かない

const candidate = (
  id: string,
  name: string,
  intent: string,
  idle: string,
  hover: string
): Candidate => ({
  id,
  name,
  intent,
  spec: [
    ['ふだんの山', idle === '0' ? '出さない' : `淡い文字の色 × ${idle}`],
    ['載せたとき', hover === '0' ? '出さない' : `淡い文字の色 × ${hover}`],
  ],
});

// 候補ごとの描き方。B は部品に入れなかったので、クラスで上書きする
const revealOf: Record<string, DataTableSortIndicator | undefined> = {
  現行版: 'always',
  A: 'hover',
  C: 'subtle',
};
const classOf: Record<string, string | undefined> = {
  B: '[--data-table-sort-idle:0] [--data-table-sort-hover:0]',
};

const candidates: Candidate[] = [
  candidate(
    '現行版',
    'いつも淡く出す',
    '並べ替えられる列が、見ただけで分かる。列が多いと山が並んで少しうるさい。',
    '1',
    '1'
  ),
  candidate(
    'A',
    '載せたときだけ出す',
    'ふだんは並べ替えている列の矢印だけ。見出しに載せる（キーボードで止まる）と山が出る。指では押すまで分からない（原則16: 指で読めないと困ることを hover に置かない）。',
    '0',
    '1'
  ),
  candidate(
    'B',
    '並べ替えている列だけ',
    '山を出さない。並べ替えられることは、載せたときの淡い塗り（押せる範囲）だけで伝える。',
    '0',
    '0'
  ),
  candidate(
    'C',
    'いつもさらに淡く、載せると濃く',
    '現行版と A のあいだ。ふだんは半分の濃さで置き、載せると現行版の濃さにする。',
    '0.5',
    '1'
  ),
];

const columns: Column[] = [
  { label: '通常', note: '注文番号で小さい順に並べ替えている' },
  { label: '「お店」に載せたとき', preview: 'hover' },
  { label: 'キーボードで「お店」に止まったとき', preview: 'focus' },
];

// 載せる・止まるのは「お店」の見出し（選択の列の次の次の列）だけ
const shopHeader = 'th:nth-child(3) [data-slot="data-table-sort"]';

const meta = {
  title: 'Design Review/364 DataTable（並べ替えていない列の印）',
  id: 'design-review-364-data-table-sort-indicator',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: shopHeader, focusVisible: shopHeader }),
  },
  args: { pick: 'C,current,A' },
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

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={364}
      axis="DataTable（並べ替えていない列の印）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_, row) => (
        <SampleTable
          selected={[]}
          rows={3}
          sortIndicator={revealOf[row.id]}
          className={classOf[row.id]}
        />
      )}
    >
      <p>
        <strong className="text-fg">
          決定: C（ふだん半分の濃さ、載せると濃く）を既定にし、現行版（いつも淡く出す）と
          A（載せたときだけ）も sortIndicator で選べる
        </strong>
        。DataTable
        の見出しは、押すと並べ替えるボタンです。並べ替えている列には上か下の矢印を出します。ここで決めるのは、押せば並べ替えられるが、いまは並べ替えていない列に上下の山を出すかどうかです。
      </p>
      <p>
        見出しのボタンは平らな押すもので、載せると押せる範囲に淡い色を敷きます。B
        はそれだけで並べ替えられることを伝える案です。
      </p>
      <p>どれを既定にするかを一言添えてください（「X を既定にして Y も選べる」も可）。</p>
    </Comparison>
  ),
};
