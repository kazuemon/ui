import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { InspectorArea } from './inspector-frame';

// 軸 353: 押しのける形（push）の Inspector と本文の分け方
//   ページと同じレイヤーなので影は付けない（原則1）。面の明るさと線で分ける
//   候補は design/tokens.css の --inspector-push-bg・--inspector-push-line・--inspector-push-line-width の上書きだけで作る

const columns: Column[] = [
  { label: '右に置く', note: '「詳細」を押すと開閉を試せます' },
  { label: '左に置く' },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '白い面と細い線',
    intent:
      '本文と同じ白い面にし、本文との境に細い線を 1 本引く。面は本文と地続きで、線だけが区切りになる。',
    spec: [
      ['面', '白（--color-surface）'],
      ['線', '1px（--color-line）'],
    ],
    tokens: {
      '--inspector-push-bg': 'var(--color-surface)',
      '--inspector-push-line': 'var(--color-line)',
      '--inspector-push-line-width': 'var(--border-width-thin)',
    },
  },
  {
    id: 'A',
    name: '淡いグレーの面（線なし）',
    intent:
      '面を淡いグレーにし、線を引かない。区別は面の明るさだけで付ける（原則1 の「区別は面の明るさと余白で付ける」）。入力欄のグレーと近いので、欄が溶けないかも見る。',
    spec: [
      ['面', '淡いグレー（--color-neutral）'],
      ['線', 'なし'],
    ],
    tokens: {
      '--inspector-push-bg': 'var(--color-neutral)',
      '--inspector-push-line': 'transparent',
      '--inspector-push-line-width': '0px',
    },
  },
  {
    id: 'B',
    name: '淡いグレーの面と細い線',
    intent: '面を淡いグレーにし、境にも細い線を引く。区切りがいちばんはっきりする。',
    spec: [
      ['面', '淡いグレー（--color-neutral）'],
      ['線', '1px（--color-line）'],
    ],
    tokens: {
      '--inspector-push-bg': 'var(--color-neutral)',
      '--inspector-push-line': 'var(--color-line)',
      '--inspector-push-line-width': 'var(--border-width-thin)',
    },
  },
];

function renderCell(column: Column) {
  return <InspectorArea variant="push" side={column.label.startsWith('左') ? 'left' : 'right'} />;
}

const meta = {
  title: 'Design Review/353 Inspectorを押しのけるときの面',
  id: 'design-review-353-inspector-push-surface',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={353}
      axis="Inspector を押しのけるときの面と区切り"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        Inspector を push
        で開いたときの、本文との分け方を決めます。本文と同じレイヤーに置くので影は付けず（原則1）、
        面の明るさと線で分けます。
      </p>
      <p>どれを既定にするかを選んでください。</p>
    </Comparison>
  ),
};
