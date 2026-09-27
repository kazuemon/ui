import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { InspectorArea } from './inspector-frame';

// 軸 355: Inspector の開閉の動きの長さ
//   どの案も、出てくる元の側（領域の端）から滑って出て、閉じるほうを短くする（原則14）。緩急はシートと同じ
//   候補は design/tokens.css の --inspector-duration-in・--inspector-duration-out の上書きだけで作る

const columns: Column[] = [
  { label: 'push', note: '「詳細」を押して開閉を比べてください（閉じた状態から）' },
  { label: 'overlay' },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'シートと同じ長さ',
    intent:
      '開くときは Drawer・シートと同じ長さで滑らせ、閉じるときは一段短くする。どこから出てどこへ戻ったかが追える。',
    spec: [
      ['開く', '250ms'],
      ['閉じる', '200ms'],
    ],
    tokens: {
      '--inspector-duration-in': 'var(--duration-slow)',
      '--inspector-duration-out': 'var(--duration-normal)',
    },
  },
  {
    id: 'A',
    name: '短く',
    intent:
      '常駐のパネルで何度も開け閉めするので、浮かぶ選択肢より短くして待たせない。push では本文の幅が変わる時間も短くなる。',
    spec: [
      ['開く', '150ms'],
      ['閉じる', '100ms'],
    ],
    tokens: {
      '--inspector-duration-in': '150ms',
      '--inspector-duration-out': 'var(--duration-fast)',
    },
  },
  {
    id: 'B',
    name: '動かさない',
    intent:
      '押した瞬間に切り替える。push では本文の折り返しが一度で変わり、途中の折り返しを見せない。どこから出たかは動きでは伝わらない。',
    spec: [
      ['開く', '0'],
      ['閉じる', '0'],
    ],
    tokens: {
      '--inspector-duration-in': '0ms',
      '--inspector-duration-out': '0ms',
    },
  },
];

function renderCell(column: Column) {
  return (
    <InspectorArea variant={column.label === 'overlay' ? 'overlay' : 'push'} defaultOpen={false} />
  );
}

const meta = {
  title: 'Design Review/355 Inspectorの開閉の動き',
  id: 'design-review-355-inspector-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={355}
      axis="Inspector の開閉の動きの長さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p className="font-bold text-fg">
        決定（ADR-0325）:
        現行版（シートと同じ長さ）を既定にし、B（動かさない）も選べる。「デフォルト現行、なしも選べる、で。」
      </p>
      <p>
        Inspector
        を開け閉めするときの動きの長さを決めます。どの案も領域の端から滑って出て、閉じるほうを短くします（原則14）。
        push
        では枠の幅を滑らせるので、本文の幅も同じ長さで変わります。動きを減らす設定では、どの案も動かしません。
      </p>
      <p>各セルの「詳細」を押して比べ、どれを既定にするかを選んでください。</p>
    </Comparison>
  ),
};
