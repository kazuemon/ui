import type { Meta, StoryObj } from '@storybook/react-vite';

import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Frame } from './sidebar-axis-parts';

// 軸 382: Sidebar の列の面
//   列の地の色と、本文との境の線を比べる。ダッシュボードでは、列を一段沈んだグレーにする例が多い
const meta = {
  title: 'Design Review/382 Sidebar の列の面',
  id: 'design-review-382-sidebar-surface',
  parameters: { layout: 'fullscreen', pseudo: statePseudo({ hover: 'a[href="#overview"]' }) },
  args: { pick: 'A,D' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: Candidate[] = [
  {
    id: 'A',
    name: '白い面と線（現行版）',
    intent: '本文と同じ白い面に、細い線で境を引く。Inspector を押しのけて出すときの見た目と同じ',
    spec: [
      ['列の地', '白'],
      ['境の線', '細い線'],
      ['いまいる行', 'グレー'],
    ],
    tokens: {
      '--sidebar-bg': 'var(--color-surface)',
      '--sidebar-line-width': 'var(--border-width-thin)',
    },
  },
  {
    id: 'B',
    name: 'グレーの面・線なし',
    intent:
      '列を淡いグレーにし、線は引かない。面の色の差だけで本文と分ける。hover は少し濃いグレー、いまいる行は現行と同じグレー',
    spec: [
      ['列の地', '淡いグレー'],
      ['境の線', 'なし'],
      ['いまいる行', 'グレー'],
    ],
    tokens: {
      '--sidebar-bg': 'var(--color-field)',
      '--sidebar-line-width': '0px',
      '--sidebar-row-hover': 'color-mix(in oklab, var(--color-field), var(--color-fg) 4%)',
      '--sidebar-row-press': 'color-mix(in oklab, var(--color-field), var(--color-fg) 8%)',
    },
  },
  {
    id: 'C',
    name: 'グレーの面・いまいる行は白',
    intent:
      'B と同じ面で、いまいる行を白く抜く。グレーの中で白い行が浮き、いまいる場所がいちばん分かりやすい',
    spec: [
      ['列の地', '淡いグレー'],
      ['境の線', 'なし'],
      ['いまいる行', '白'],
    ],
    tokens: {
      '--sidebar-bg': 'var(--color-field)',
      '--sidebar-line-width': '0px',
      '--sidebar-row-hover': 'color-mix(in oklab, var(--color-field), var(--color-fg) 4%)',
      '--sidebar-row-press': 'color-mix(in oklab, var(--color-field), var(--color-fg) 8%)',
      '--sidebar-current-bg': 'var(--color-surface)',
      '--sidebar-current-hover': 'var(--color-surface)',
    },
  },
  {
    id: 'D',
    name: 'グレーの面と線',
    intent:
      'B に細い線を足す。面と線の両方で分けるので、本文の地がグレーのページ（カードを並べるダッシュボード）でも境が消えない',
    spec: [
      ['列の地', '淡いグレー'],
      ['境の線', '細い線'],
      ['いまいる行', 'グレー'],
    ],
    tokens: {
      '--sidebar-bg': 'var(--color-field)',
      '--sidebar-line-width': 'var(--border-width-thin)',
      '--sidebar-row-hover': 'color-mix(in oklab, var(--color-field), var(--color-fg) 4%)',
      '--sidebar-row-press': 'color-mix(in oklab, var(--color-field), var(--color-fg) 8%)',
    },
  },
];

const columns: Column[] = [
  { label: '開いた列' },
  { label: '「大会の概要」に載せた', preview: 'hover' },
  { label: '畳んだ列（rail）' },
];

export const Axis: Story = {
  name: 'Sidebar の列の面',
  render: ({ pick }) => (
    <Comparison
      index={382}
      axis="Sidebar の列の面"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <Frame
          features={{ edges: true, counts: true }}
          width={column.label.includes('畳んだ') ? 200 : 360}
          height={640}
          collapsed={column.label.includes('畳んだ')}
        />
      )}
    >
      <p className="font-bold text-fg">
        決定（ADR-0361）: 既定は A（現行版）。D
        のように列の地をグレーにもできる（線はいつも引く）。Drawer では地の色を使わない。
      </p>
      <p>
        列の地と、本文との境の線を比べます。行の hover
        と押下の色は、グレーの面でも見えるよう、案ごとに一段濃くしています。
      </p>
      <p>狭い画面の Drawer は、Drawer の面（白）のままにする予定です。</p>
    </Comparison>
  ),
};
