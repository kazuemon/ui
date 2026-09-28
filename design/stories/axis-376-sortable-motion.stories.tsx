import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TryList } from './sortable-frame';

// 軸 376: Sortable の並べ替えの動きの長さ
//   3 つの動きを同じ長さにそろえる: キーボードで動かした項目が滑る（部品。--sortable-move-duration）、
//   引いているあいだに周りがずれる、離したときに写しが収まる（どちらも dnd-kit。recipe で useSortable の transition と DragOverlay の dropAnimation に渡す）
//   緩急はどの案もシートと同じ（--ease-sheet）。動きを減らす設定では、キーボードの動きは動かさない
//   dnd-kit の既定は、周りがずれる 300ms・収まる 250ms

const columns: Column[] = [
  { label: 'fill', note: '引くか、つまみにフォーカスして上下の矢印キーで比べてください' },
];

const candidates: (Candidate & { duration: number })[] = [
  {
    id: '現行版',
    name: 'シートと同じ長さ',
    duration: 250,
    intent:
      'ものが場所を移る動きなので、シートや Inspector の開閉と同じ長さにする。どこからどこへ動いたかが追える。',
    spec: [
      ['長さ', '250ms（--duration-slow）'],
      ['緩急', '--ease-sheet'],
    ],
    tokens: { '--sortable-move-duration': 'var(--duration-slow)' },
  },
  {
    id: 'A',
    name: '短く',
    duration: 100,
    intent:
      '何度も続けて動かすので、待たせないよう押す動きと同じ短さにする。動いたことは分かるが、どこから来たかは追いにくい。',
    spec: [
      ['長さ', '100ms（--duration-fast。押す動きと同じ）'],
      ['緩急', '--ease-sheet'],
    ],
    tokens: { '--sortable-move-duration': 'var(--duration-fast)' },
  },
  {
    id: 'B',
    name: 'ゆっくり',
    duration: 500,
    intent:
      '周りがずれる動きをゆっくり見せる。並びが変わったことを見落としにくいが、続けて動かすと遅れて見える。',
    spec: [
      ['長さ', '500ms'],
      ['緩急', '--ease-sheet'],
    ],
    tokens: { '--sortable-move-duration': '500ms' },
  },
  {
    id: 'C',
    name: '動かさない',
    duration: 0,
    intent:
      '並びが変わった瞬間に切り替える。周りはずれずに入れ替わり、離した写しはその場で消える。',
    spec: [
      ['長さ', '0'],
      ['緩急', '—'],
    ],
    tokens: { '--sortable-move-duration': '0ms' },
  },
];

function renderCell(_column: Column, candidate: Candidate) {
  return <TryList moveDuration={candidates.find((c) => c.id === candidate.id)?.duration} />;
}

const meta = {
  title: 'Design Review/376 Sortableの動きの長さ',
  id: 'design-review-376-sortable-motion',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'current,C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={376}
      axis="Sortable の並べ替えの動きの長さ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p className="font-bold text-fg">
        決定: 現行版（250ms）を既定にし、C（動かさない）も motion="none"
        で選べる。「デフォルトは現行版で、C も選べるようにしたいです。」
      </p>
      <p>
        並べ替えたときの動きの長さを決めます。キーボードで動かした項目が滑る動き、引いているあいだに周りがずれる動き、離したときに写しが収まる動きを、同じ長さにそろえます。
      </p>
      <p>
        各行のリストを実際に動かして比べてください。動きを減らす設定にしていると、キーボードの動きはどの行も動きません。
      </p>
    </Comparison>
  ),
};
