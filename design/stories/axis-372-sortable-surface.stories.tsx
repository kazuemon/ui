import type { Meta, StoryObj } from '@storybook/react-vite';

import type { SortableVariant } from '../../src/components/sortable/Sortable';
import { type Candidate, type Column, Comparison } from './Comparison';
import { StaticDrag, StaticList, TryList } from './sortable-frame';

// 軸 372: Sortable の項目の面
//   候補は Sortable の variant（props の差）で作る。影はどの案も付けない（ページと同じレイヤー。原則1）

const columns: Column[] = [
  { label: '通常' },
  { label: '並べ替えの途中', note: '2 つ目を持ち上げたところを止めて見せます' },
  { label: '試す', note: 'つまみを引くか、つまみにフォーカスして上下の矢印キー' },
];

const candidates: (Candidate & { variant: SortableVariant })[] = [
  {
    id: '現行版',
    name: 'グレーの塗り（fill）',
    variant: 'fill',
    intent:
      '並びは書き換えられる値なので、入力欄と同じグレーの塗りにする（原則8）。項目のあいだを少し空け、1 つずつの塊に見せる。持ち上げると白い面に変わり、離れたことが色でも分かる。',
    spec: [
      ['面', '入力欄の塗り（--color-field）'],
      ['輪郭', 'なし'],
      ['あいだ', '8px'],
    ],
  },
  {
    id: 'A',
    name: '白い面と細い輪郭（card）',
    variant: 'card',
    intent:
      'カードを並べたように見せる。持ち上げても面の色は変わらず、影が付くだけ。グレーの地の上にも置ける。',
    spec: [
      ['面', '白（--color-surface）'],
      ['輪郭', '1px（--color-surface-line）'],
      ['あいだ', '8px'],
    ],
  },
  {
    id: 'B',
    name: '線で区切る（divided）',
    variant: 'divided',
    intent:
      '1 つの枠の中に並べ、項目を細い線で区切る（表の行と同じ）。項目が多くても縦に詰まって見える。持ち上げた写しだけが角を持つ。',
    spec: [
      ['面', '白'],
      ['区切り', '1px の線（--color-line）と外枠'],
      ['あいだ', '0'],
    ],
  },
];

function renderCell(column: Column, candidate: Candidate) {
  const variant = candidates.find((c) => c.id === candidate.id)?.variant;
  if (column.label === '通常') return <StaticList variant={variant} />;
  if (column.label === '試す') return <TryList variant={variant} />;
  return <StaticDrag variant={variant} />;
}

const meta = {
  title: 'Design Review/372 Sortableの項目の面',
  id: 'design-review-372-sortable-surface',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A,current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'A,current,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={372}
      axis="Sortable の項目の面"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p className="font-bold text-fg">
        決定: A（白い面と細い輪郭、card）を既定にし、現行版（グレーの塗り、fill）と
        B（線で区切る、divided）も variant で選べる。「A
        がデフォルトで、現行とBも選べるようにしたいですね」
      </p>
      <p>
        並べ替えられるリストの、項目 1
        つずつの面を決めます。どの案も影は付けず、持ち上げた写しにだけ重なる面の影を付けます。
      </p>
      <p>
        「試す」の列では、つまみを引いて並べ替えられます（dnd-kit
        でつないだもの）。どれを既定にし、ほかを variant で選べるようにするかを選んでください。
      </p>
    </Comparison>
  ),
};
