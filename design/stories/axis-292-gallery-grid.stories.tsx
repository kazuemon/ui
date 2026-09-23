import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { GalleryPage } from './gallery-frame';

// 軸 292: Gallery を並べたときの間隔（gap を書かないときの既定）
//   間隔は Stack と同じ段（--stack-gap-*）から選び、gap の props でほかの段も選べる。既定を sm（8px）と md（16px）のどちらにするか
//   値は tokens.css の --gallery-gap。候補はこの上書きだけで作る。全案（現行版を含む）で値を明示する
//   角は全案カードの角（--gallery-radius）、比（--gallery-ratio）は軸 293 の決定（4 / 3）
const meta = {
  title: 'Design Review/292 Gallery の間隔',
  id: 'design-review-292-gallery-grid',
  parameters: { layout: 'fullscreen' },
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
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'sm（8px）',
    intent:
      '画像のあいだを 8px 空ける。1 つのまとまりとして読め、小さな画像が並んでも間延びしない。角の丸み（16px）より狭いので、隙間は細い線に見える',
    spec: [
      ['間隔', 'sm（8px・--stack-gap-sm）'],
      ['角', 'カードの角（16px）'],
    ],
    tokens: {
      '--gallery-gap': 'var(--stack-gap-sm)',
      '--gallery-radius': 'var(--radius-card)',
      '--gallery-ratio': '4 / 3',
    },
  },
  {
    id: 'A',
    name: 'md（16px）',
    intent:
      '画像のあいだを 16px 空ける。角の丸みと同じ幅で、1 枚ずつが記事の画像として離れて見える。Stack の既定と同じ段',
    spec: [
      ['間隔', 'md（16px・--stack-gap-md）'],
      ['角', 'カードの角（16px）'],
    ],
    tokens: {
      '--gallery-gap': 'var(--stack-gap-md)',
      '--gallery-radius': 'var(--radius-card)',
      '--gallery-ratio': '4 / 3',
    },
  },
];

const columns: Column[] = [
  { label: 'パソコン（3 列）', note: '記事の幅。押すと拡大する' },
  { label: 'スマートフォン（2 列）', note: '入れ物が狭いので 2 列にまとまる' },
];

export const Grid: Story = {
  name: '間隔',
  render: ({ pick }) => (
    <Comparison
      pick={pick}
      index={292}
      axis="Gallery の間隔"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <GalleryPage device={column.label.startsWith('パソコン') ? 'desktop' : 'phone'} />
      )}
    >
      <p>
        <strong>決定: current（sm・8px）を既定にする。gap で Stack と同じ段から選べる。</strong>
      </p>
      <p>
        画像を並べたときの、画像のあいだの間隔の既定を選びます。間隔は Stack
        と同じ段（none・xs・sm・md・lg・xl）で持ち、
        <code>gap</code> の props でどの段も選べます。ここで決めるのは、<code>gap</code>{' '}
        を書かないときの既定です。角は全案カードの角、比は 4 / 3 です。
      </p>
      <p>
        sm は、画像が 1 つのまとまりとして読め、記事の中で図をまとめて見せるのに向きます。md は
        Stack の既定と同じ段で、1
        枚ずつが記事の画像として離れて見え、作品を並べるポートフォリオに向きます。
      </p>
      <p>既定をどちらにしますか。</p>
    </Comparison>
  ),
};
