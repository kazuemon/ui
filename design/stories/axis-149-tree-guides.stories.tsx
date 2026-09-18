import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Tree, TreeItem } from '../../src/components/tree/Tree';

// 後半の軸 149: 木の字下げの案内線
//   --tree-guide-width（線の太さ。0 で線なし）・--tree-guide-color（線の色）・--tree-indent（1 段の字下げ）
//   線は、親の行の開閉の印の中心にそろえて縦に引く

function Sample() {
  return (
    <div className="w-56">
      <Tree label="ドキュメント">
        <TreeItem label="はじめに" href="#intro" onClick={(e) => e.preventDefault()} />
        <TreeItem label="部品" defaultExpanded>
          <TreeItem label="Button" href="#button" onClick={(e) => e.preventDefault()} />
          <TreeItem label="入力" defaultExpanded>
            <TreeItem label="Checkbox" href="#checkbox" onClick={(e) => e.preventDefault()} />
            <TreeItem
              label="TextField"
              href="#text-field"
              current
              onClick={(e) => e.preventDefault()}
            />
          </TreeItem>
        </TreeItem>
        <TreeItem label="デザイン原則" href="#principles" onClick={(e) => e.preventDefault()} />
      </Tree>
    </div>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '細い線（細い境界線の色）',
    intent:
      'ほかの部品の細い境界線と同じ色で、段ごとに縦線を引く。どの段の続きかが目で追える。段が深くなるほど線が増える。',
    spec: [
      ['線', '1px・細い境界線の色'],
      ['字下げ', '16px'],
    ],
    tokens: {
      '--tree-guide-width': 'var(--border-width-thin)',
      '--tree-guide-color': 'var(--color-line)',
    },
  },
  {
    id: 'A',
    name: '線なし（余白だけ）',
    intent:
      '線を引かず、字下げだけで段を見せる。いちばん静かで、行の塗り（hover・いまいる行）が主役になる。深い段では、どの親の下かを追いにくい。',
    spec: [
      ['線', 'なし'],
      ['字下げ', '16px'],
    ],
    tokens: { '--tree-guide-width': '0px' },
  },
  {
    id: 'B',
    name: '線なし・字下げを広く',
    intent:
      '線を引かない代わりに、1 段の字下げを広げて段の差をはっきりさせる。狭い場所（サイドバー）では、深い段の文字が入りにくくなる。',
    spec: [
      ['線', 'なし'],
      ['字下げ', '24px'],
    ],
    tokens: {
      '--tree-guide-width': '0px',
      '--tree-indent': 'calc(var(--spacing) * 6)',
    },
  },
  {
    id: 'C',
    name: 'もっと薄い線',
    intent:
      '線は引くが、地に溶ける濃さまで薄くする。段の続きは追えて、線そのものは目立たない。画面や設定によっては見えなくなる。',
    spec: [
      ['線', '1px・境界線の色を 50% 透かす'],
      ['字下げ', '16px'],
    ],
    tokens: {
      '--tree-guide-width': 'var(--border-width-thin)',
      '--tree-guide-color': 'color-mix(in oklab, var(--color-line) 50%, transparent)',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '3 段。いまいる行つき' },
  { label: 'hover', note: '2 段目の行', preview: 'hover' },
  { label: '指用の密度', note: '行が高くなる' },
];

const target = '[data-slot="tree-item"][href="#button"]';

const meta = {
  title: 'Design Review/149 木の字下げの案内線',
  id: 'design-review-149-tree-guides',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      rootSelector: 'body',
      hover: [`[data-preview="hover"] ${target}`],
    },
  },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={149}
      axis="木の字下げの案内線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div data-density={column.label === '指用の密度' ? 'coarse' : undefined}>
          <Sample />
        </div>
      )}
    >
      <p>
        <strong>
          決定: 現行版（細い線）を既定にし、A（線なし）も選べる（<code>guides</code>）。
        </strong>
        あわせて、1
        段の字下げは「印の幅＋印と文字の間」にして子の印を親の文字の頭にそろえ、案内線は行の塗りより手前に引き、
        行の塗りは字下げの分だけ左を空けます（<code>rowWidth="full"</code>{' '}
        で幅いっぱいにもできます）。 開け閉めは Accordion と同じく中身の高さが動きます（
        <code>panelMotion="none"</code> ですぐ切り替え）。
      </p>
      <p>
        入れ子の行き先を木で並べるとき、段の続きを示す縦線を引くかどうかを選びます。行そのもの（高さ・hover・いまいる行の印）はどの案でも同じです。
      </p>
      <p>B（字下げを広く）と C（もっと薄い線）は採りませんでした。</p>
    </Comparison>
  ),
};
