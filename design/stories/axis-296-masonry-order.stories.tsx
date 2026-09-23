import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Masonry } from '../../src/components/masonry/Masonry';

// 軸 296: Masonry の並びの順（縦順・横順）の見え方。実装の方式そのものの比較なので、部品のトークンの上書きでは
//   表せない（CSS の columns と CSS Grid は仕組みが別）。B（採用した Masonry。CSS Grid の行スパン計算）と、
//   A（CSS の columns。列を上から下まで埋めてから次の列へ）を、番号を振った見本で並べて見た目の違いを確かめる
//   決めるのは見た目の好みではなく、どちらが原則15（読み上げ・タブ順は見た目の順と同じ）に合うかなので、
//   すでに実装は横順（Masonry の採用）にしている。この比較は、選んだ理由を見て確かめるための記録
const heights = [64, 120, 88, 156, 72, 108, 140, 96, 60];

function numbered(className: string) {
  return heights.map((h, i) => (
    <div key={i} style={{ height: h }} className={className}>
      {i + 1}
    </div>
  ));
}

const box = 'flex items-center justify-center rounded-control bg-neutral p-2 text-center text-sm';

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '横順（採用。CSS Grid の行スパン計算）',
    intent:
      '1 行目を左から右へ、埋まったら次の行へ。DOM の順（渡した順）が、そのままタブ順・読み上げ順になる',
    spec: [
      ['実装', 'grid-template-columns + grid-row-end: span N（JS で子の高さを測る）'],
      ['DOM の順', '渡した順のまま（1〜9）'],
      ['対応ブラウザ', '幅広い（CSS Grid の行スパンだけを使う）'],
      ['Server Components', '不可（高さを測るため use client）'],
    ],
  },
  {
    id: 'A',
    name: '縦順（参考実装。CSS の columns）',
    intent:
      '1 列目を上から下まで埋めてから、2 列目へ移る。部品のコードではなく、見た目の違いを見るための素の実装',
    spec: [
      ['実装', 'columns: 3（CSS の複数段組み）'],
      ['DOM の順', '渡した順のまま（1〜9）。だが見た目は列ごとに縦へ飛ぶ'],
      ['対応ブラウザ', '幅広い'],
      ['Server Components', '可'],
    ],
  },
];

const columns: Column[] = [{ label: '番号を振った 9 個の見本（幅 320px・3 列）' }];

const meta = {
  title: 'Design Review/296 Masonry の並びの順',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Order: Story = {
  name: '並びの順',
  render: () => (
    <Comparison
      index={296}
      axis="Masonry の並びの順（縦順・横順）"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) =>
        candidate.id === 'current' ? (
          <div style={{ width: 320 }}>
            <Masonry gap="sm" columns={3}>
              {numbered(box)}
            </Masonry>
          </div>
        ) : (
          // 参考実装（部品のコードではない）。CSS の columns は列を縦に埋めるので、DOM の順は 1〜9 のままでも
          // 見た目は「1 列目の 1・4・7」のように縦に飛ぶ
          <div style={{ width: 320, columns: 3, columnGap: 8 }}>
            {numbered(`${box} mb-2 [break-inside:avoid]`)}
          </div>
        )
      }
    >
      <p>
        <strong>決定: 横順（現行版）。見た目の順と読み上げ・キーボードの順をそろえる。</strong>
      </p>
      <p>
        Masonry は、CSS の columns（軽い・Server Components で描けるが、DOM
        の順のまま列を縦に埋めるので見た目がタブ順と揃わない）、CSS Grid の masonry（
        <code>grid-template-rows: masonry</code>。Firefox の実験実装のみで、Chrome・Safari
        は未対応）、JS で列に振り分ける（横順を保てるが use client が要る）の 3
        方式から選ぶ必要がありました。見た目だけでなく原則15（読み上げ・タブ順は見た目の順と同じ）に照らして、実装はすでに横順（現行版）にしています。
      </p>
      <p>
        番号を振ってみると違いがはっきりします。現行版（横順）は、1〜3 が 1 行目に横並びし、4〜6
        が次の行に続きます。タブで送る順も、この見た目の並びと同じです。A（縦順・CSS の
        columns）は、1 列目が「1・4・7」のように縦に埋まってから 2 列目の「2・5・8」に移ります。DOM
        の順は同じ 1〜9 のままでも、タブで送ると画面のあちこち（1 列目の下から 2
        列目の上）へ視線が飛び、見た目の位置と合いません。
      </p>
      <p>
        推奨は現行版（横順）です。見た目の好みではなく、キーボードで操作する人・読み上げで聞く人にとって迷いにくい順を優先しました。A（CSS
        の columns）は Server Components
        のまま描ける軽さが利点ですが、この理由だけでは採用しません。
      </p>
    </Comparison>
  ),
};
