import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { StaticDrag, TryList } from './sortable-frame';

// 軸 374: Sortable の入る場所（dragSource）の見た目
//   dnd-kit は、元の項目を入る場所へ動かし、周りをずらして空ける。元の場所と入る場所は同じ要素（引いているあいだに一緒に動く）
//   候補は design/tokens.css の --sortable-source-* の上書きだけで作る
//   入る場所を線で示す形（周りを動かさない）は、エンジンの既定の動きを外すことになるので候補にしていない

const columns: Column[] = [
  { label: 'fill（グレーの塗り）', note: '2 つ目を持ち上げたところ' },
  { label: 'card（白い面）', note: '2 つ目を持ち上げたところ' },
  { label: '試す', note: 'つまみを引いてください' },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '点線の枠',
    intent:
      '中身を消し、濃いグレーの点線で「ここに入る」空きの枠を見せる。面の塗りは外すので、fill でも card でも同じ見え方になる。',
    spec: [
      ['塗り', 'なし'],
      ['線', '1.5px の点線（--color-line-strong）'],
      ['中身', '消す'],
    ],
    tokens: {
      '--sortable-source-bg': 'transparent',
      '--sortable-source-line-width': 'var(--border-width-medium)',
      '--sortable-source-line-style': 'dashed',
      '--sortable-source-line-color': 'var(--color-line-strong)',
      '--sortable-source-content-opacity': '0',
    },
  },
  {
    id: 'A',
    name: 'くぼみ（濃いグレーの面）',
    intent:
      '中身を消し、入力欄の端の塊と同じ一段濃いグレーで塗る。線を使わず、抜けた穴のように見せる。',
    spec: [
      ['塗り', '--color-field-addon（gray-200）'],
      ['線', 'なし'],
      ['中身', '消す'],
    ],
    tokens: {
      '--sortable-source-bg': 'var(--color-field-addon)',
      '--sortable-source-line-width': '0px',
      '--sortable-source-line-style': 'solid',
      '--sortable-source-line-color': 'transparent',
      '--sortable-source-content-opacity': '0',
    },
  },
  {
    id: 'B',
    name: '薄く残す',
    intent:
      '面はそのまま、中身を薄く残す。何を動かしているかが元の並びの中でも分かる。押せないものの薄さと似て見える。',
    spec: [
      ['塗り', '項目と同じ'],
      ['線', 'なし'],
      ['中身', '濃さ 0.4'],
    ],
    tokens: {
      '--sortable-source-bg': 'initial', // 項目と同じ塗り
      '--sortable-source-line-width': '0px',
      '--sortable-source-line-style': 'solid',
      '--sortable-source-line-color': 'transparent',
      '--sortable-source-content-opacity': '0.4',
    },
  },
  {
    id: 'C',
    name: '点線の枠と淡い面',
    intent:
      '現行版の点線に、ページの地より一段濃いグレーの面を足して、空きの場所をはっきりさせる。',
    spec: [
      ['塗り', '--color-field（gray-50）'],
      ['線', '1.5px の点線（--color-line-strong）'],
      ['中身', '消す'],
    ],
    tokens: {
      '--sortable-source-bg': 'var(--color-field)',
      '--sortable-source-line-width': 'var(--border-width-medium)',
      '--sortable-source-line-style': 'dashed',
      '--sortable-source-line-color': 'var(--color-line-strong)',
      '--sortable-source-content-opacity': '0',
    },
  },
];

function renderCell(column: Column, candidate: Candidate) {
  // C は、決めたあとは dragSourceVariant="filled" で描く（トークンは畳んだ）
  const dragSourceVariant = candidate.id === 'C' ? 'filled' : 'outline';
  if (column.label === '試す') return <TryList dragSourceVariant={dragSourceVariant} />;
  return (
    <StaticDrag
      variant={column.label.startsWith('card') ? 'card' : 'fill'}
      dragSourceVariant={dragSourceVariant}
    />
  );
}

const meta = {
  title: 'Design Review/374 Sortableの入る場所',
  id: 'design-review-374-sortable-drop-slot',
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
      index={374}
      axis="Sortable の入る場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p className="font-bold text-fg">
        決定: 現行版（点線の枠）を既定にし、C（点線の枠と淡い面）も dragSourceVariant="filled"
        で選べる。「現行がデフォルトで、C も選べるようにしたいですね」A・B
        のためのトークンは畳んだので、この比較の A・B の行はもう現行版と同じに見える
      </p>
      <p>
        引いているあいだ、持ち上げた項目が入る場所の見た目を決めます。周りの項目はずれて場所を空け、この枠が入る先へ一緒に動きます（元の場所と入る場所は同じ枠です）。
      </p>
      <p>
        入る場所を線だけで示す形（周りを動かさない）は、dnd-kit
        の既定の動きを外して計算を足すことになるので、候補にしていません。どれを既定にするかを選んでください。
      </p>
    </Comparison>
  ),
};
