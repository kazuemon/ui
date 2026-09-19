import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { TocLiveScene } from './toc-live-scene';
import {
  TableOfContents,
  type TableOfContentsItem,
} from '../../src/components/table-of-contents/TableOfContents';

// 後半の軸 166: TableOfContents の入れ子の見せ方と、一覧の左の線
//   --toc-track-width（一覧の左の線。今の見出しの印の線はこの線に重なる）
//   --toc-indent（1 段の字下げ）・--toc-guide-width・--toc-guide-margin（入れ子の並びの左に引く段ごとの線）
//   --toc-nested-color（2 段目より下の文字）
//   今の見出しの印は軸 165 の現行版（線の上に濃い線＋太字）のまま
//   近い前例: Tree の字下げと案内線（ADR-0162。既定は段ごとの細い線、線なしも選べる）

const items: TableOfContentsItem[] = [
  { id: 'intro', text: 'はじめに', level: 2 },
  { id: 'tokens', text: 'トークンの層', level: 2 },
  { id: 'role-tokens', text: '役割のトークン', level: 3 },
  { id: 'part-tokens', text: '部品のトークン', level: 3 },
  { id: 'reading', text: '読みやすさ', level: 2 },
  { id: 'type-size', text: '文字の大きさ', level: 3 },
  { id: 'heading-steps', text: '見出しの段', level: 4 },
  { id: 'summary', text: 'まとめ', level: 2 },
];

const longItems: TableOfContentsItem[] = [
  { id: 'why', text: 'なぜ部品の高さを指で押せる大きさにそろえるのか', level: 2 },
  { id: 'fine', text: 'マウスで操作するときに小さくするもの', level: 3 },
  { id: 'coarse', text: '指で操作するときにも小さくしないもの', level: 3 },
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '左に 1 本の線＋字下げ',
    intent:
      '一覧の左に細い線を 1 本だけ引き、段は字下げで見せる。今の見出しの印はどの段でもその線に重なるので、印の位置が横に動かない。',
    spec: [
      ['一覧の左の線', '細い線（1px）'],
      ['段ごとの線', 'なし'],
      ['字下げ', '12px'],
      ['2 段目より下の文字', '1 段目と同じグレー'],
    ],
    tokens: {
      '--toc-track-width': 'var(--border-width-thin)',
      '--toc-indent': 'calc(var(--spacing) * 3)',
      '--toc-guide-width': '0px',
      '--toc-guide-margin': '0px',
      '--toc-nested-color': 'var(--toc-item-color)',
    },
  },
  {
    id: 'A',
    name: '段ごとの線',
    intent:
      'Tree の案内線（ADR-0162）と同じ考え方。入れ子の並びの左にも細い線を引き、親の文字の頭にそろえる。どの親の下かを目で追えるが、線が増える。',
    spec: [
      ['一覧の左の線', '細い線（1px）'],
      ['段ごとの線', '細い線（1px）。親の文字の頭の位置'],
      ['字下げ', '線の右に 6px'],
      ['2 段目より下の文字', '1 段目と同じグレー'],
    ],
    tokens: {
      '--toc-track-width': 'var(--border-width-thin)',
      '--toc-indent': 'var(--toc-track-gap)',
      '--toc-guide-width': 'var(--border-width-thin)',
      '--toc-guide-margin': 'var(--toc-item-px)',
      '--toc-nested-color': 'var(--toc-item-color)',
    },
  },
  {
    id: 'B',
    name: '線なし',
    intent:
      '一覧の左の線を消し、字下げだけにする。いちばん軽い。今の見出しの印の線は、線のあった位置に単独で出る。',
    spec: [
      ['一覧の左の線', 'なし（印の線だけ出る）'],
      ['段ごとの線', 'なし'],
      ['字下げ', '12px'],
      ['2 段目より下の文字', '1 段目と同じグレー'],
    ],
    tokens: {
      '--toc-track-width': '0px',
      '--toc-indent': 'calc(var(--spacing) * 3)',
      '--toc-guide-width': '0px',
      '--toc-guide-margin': '0px',
      '--toc-nested-color': 'var(--toc-item-color)',
    },
  },
  {
    id: 'C',
    name: '子の段を淡く',
    intent:
      '現行版に加えて、2 段目より下の文字を一段淡いグレーにする。字下げに色の差を重ねて、節と小見出しを見分けやすくする。淡い色も文字の基準（4.5:1）は満たす。',
    spec: [
      ['一覧の左の線', '細い線（1px）'],
      ['段ごとの線', 'なし'],
      ['字下げ', '12px'],
      ['2 段目より下の文字', '淡いグレー（--color-fg-subtle）'],
    ],
    tokens: {
      '--toc-track-width': 'var(--border-width-thin)',
      '--toc-indent': 'calc(var(--spacing) * 3)',
      '--toc-guide-width': '0px',
      '--toc-guide-margin': '0px',
      '--toc-nested-color': 'var(--color-fg-subtle)',
    },
  },
];

const columns: Column[] = [
  { label: '1 段目が今の見出し', note: '「読みやすさ」' },
  { label: '3 段目が今の見出し', note: '「見出しの段」' },
  { label: '長い見出し', note: '幅 11rem で折り返す' },
  { label: '記事の横', note: '枠の中をスクロールすると、印が移る' },
];

const meta = {
  title: 'Design Review/166 TableOfContents の入れ子の見せ方',
  id: 'design-review-166-toc-nesting',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

function renderCell(column: Column) {
  switch (column.label) {
    case '記事の横':
      return <TocLiveScene />;
    case '長い見出し':
      return (
        <div className="w-[11rem]">
          <TableOfContents items={longItems} currentId="fine" />
        </div>
      );
    default:
      return (
        <div className="w-[13rem]">
          <TableOfContents
            items={items}
            currentId={column.label === '3 段目が今の見出し' ? 'heading-steps' : 'reading'}
          />
        </div>
      );
  }
}

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={166}
      axis="TableOfContents の入れ子の見せ方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p>
        目次の見出しの段（h2 の下の
        h3・h4）をどう見せるかと、一覧の左に線を引くかを選びます。今の見出しの印は、軸 165
        の現行版（線の上に濃い線＋太字）で並べています。
      </p>
      <p>
        ブログの記事は 2〜3 段の見出しが多いので、3
        段目まで入れた目次と、折り返す長い見出しで比べています。どれを既定にし、どれを選べるようにするかも教えてください。
      </p>
    </Comparison>
  ),
};
