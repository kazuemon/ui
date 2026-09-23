import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Masonry, type MasonryGap } from '../../src/components/masonry/Masonry';

// 軸 294: Masonry の既定の間隔（gap）。Stack と同じ 5 段の語彙を使う前提で、どの段を既定にするかを比べる。
//   Masonry は密に並ぶ画像やカードが多いので、Stack の既定（md・16px、ADR-0212）をそのまま使うか、
//   もっと詰めた段（sm・8px）を既定にするかで迷いがある

const heights = [64, 120, 88, 156, 72, 108, 140, 96, 60];

// Masonry の子は渡した順のまま直接の children にする（{blocks()} と関数として呼ぶ。<Blocks /> の
// ような JSX 要素にすると、Masonry には展開前の 1 個の要素としてしか数えられない）
function blocks() {
  return heights.map((h, i) => (
    <div
      key={i}
      style={{ height: h }}
      className="flex items-center justify-center rounded-control bg-neutral p-2 text-center text-sm"
    >
      {i + 1}
    </div>
  ));
}

const candidates: (Candidate & { gap: MasonryGap })[] = [
  {
    id: 'current',
    name: 'md（16px）',
    intent: 'Stack の既定（md）とそろえる。他の部品と間隔の見た目がそろう',
    spec: [
      ['gap', "'md'（既定）"],
      ['値', '16px'],
    ],
    gap: 'md',
  },
  {
    id: 'A',
    name: 'sm（8px）',
    intent: '画像やカードが密に並ぶ壁として、もう一段詰める',
    spec: [
      ['gap', "'sm'"],
      ['値', '8px'],
    ],
    gap: 'sm',
  },
  {
    id: 'B',
    name: 'none（0px）',
    intent: '隙間なく敷き詰める。写真の展示に近い密度になる',
    spec: [
      ['gap', "'none'"],
      ['値', '0px'],
    ],
    gap: 'none',
  },
];

const columns: Column[] = [{ label: '幅 320px・3 列' }];

const meta = {
  title: 'Design Review/294 Masonry の間隔',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Gap: Story = {
  name: '間隔',
  render: () => (
    <Comparison
      index={294}
      axis="Masonry の既定の間隔"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => (
        <div style={{ width: 320 }}>
          <Masonry gap={(candidate as (typeof candidates)[number]).gap} columns={3}>
            {blocks()}
          </Masonry>
        </div>
      )}
    >
      <p>
        <strong>決定: md（16px）。Stack と同じ段で、sm・none も gap で選べる。</strong>
      </p>
      <p>
        gap は Stack
        と同じ語彙（none・xs・sm・md・lg・xl）で持っています。既定をどの段にするかを選びます。値そのものは
        Stack の間隔の段（ADR-0212）をそのまま使い、新しいトークンは足しません。
      </p>
      <p>
        推奨は現行版（md）です。Stack をはじめ他の部品の既定と間隔の見た目がそろい、「間隔は
        md」という 1
        つの感覚のまま使えます。ただし、作品一覧のように写真やカードが密に並ぶ画面では、sm（A）や
        none（B）のほうが壁として詰まって見えます。gap は props で選べるので、md を既定にしつつ
        sm・none も選べる形にします。
      </p>
    </Comparison>
  ),
};
