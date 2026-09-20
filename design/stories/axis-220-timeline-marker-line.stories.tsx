import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Prose } from '../../src/components/prose/Prose';
import {
  Timeline,
  type TimelineLine,
  type TimelineMarkerSize,
  type TimelineMarkerType,
  type TimelineTail,
  TimelineItem,
} from '../../src/components/timeline/Timeline';

// 後半の軸 220: 年表（Timeline）の点と線の見せ方
//   決定: 現行版を既定にし、F（tail="dotted"）も選べる。大きさは markerSize、点と線の種類は
//   markerType（neutral・outline・primary）・line（solid・dotted・none）で選べる（Steps の点と線に合わせた）
//   日付の置き場所（軸 221）・項目の強調（軸 223）は、どの案も現行版のまま

// 案ごとの部品の指定。点の大きさ・丸の塗り方・線の種類は、どれも props で分ける
const shape: Record<
  string,
  {
    markerSize?: TimelineMarkerSize;
    markerType: TimelineMarkerType;
    line: TimelineLine;
    tail?: TimelineTail;
  }
> = {
  現行版: { markerType: 'neutral', line: 'solid' },
  A: { markerType: 'outline', line: 'solid' },
  B: { markerSize: 'lg', markerType: 'neutral', line: 'solid' },
  C: { markerType: 'neutral', line: 'dotted' },
  D: { markerType: 'neutral', line: 'none' },
  E: { markerType: 'primary', line: 'solid' },
  F: { markerType: 'neutral', line: 'solid', tail: 'dotted' },
};

function Short({ id }: { id: string }) {
  return (
    <div data-reading className="w-80">
      <Timeline {...shape[id]}>
        <TimelineItem date="2021年4月" title="入社" />
        <TimelineItem date="2023年4月" title="デザインシステムの担当になる" />
        <TimelineItem date="2026年4月" title="いまの仕事" />
      </Timeline>
    </div>
  );
}

function Long({ id }: { id: string }) {
  return (
    <div data-reading className="w-80">
      <Timeline {...shape[id]}>
        <TimelineItem date="2021年4月" title="入社">
          プロダクトのフロントエンドを担当しました。設計から実装まで、ひととおり見ています。
        </TimelineItem>
        <TimelineItem date="2023年4月" title="デザインシステムを作りはじめる">
          部品と原則を社内に配りました。
        </TimelineItem>
      </Timeline>
    </div>
  );
}

function InArticle({ id }: { id: string }) {
  return (
    <Prose className="w-80">
      <h2>これまで</h2>
      <p>作ってきたものを、古い順に並べます。</p>
      <Timeline {...shape[id]}>
        <TimelineItem date="2021年4月" title="ブログを作る">
          <p>静的サイトジェネレーターで、記事を書く場所を作りました。</p>
        </TimelineItem>
        <TimelineItem date="2024年10月" title="部品を切り出す">
          <p>ブログで使っていた部品を、ライブラリにまとめました。</p>
        </TimelineItem>
      </Timeline>
    </Prose>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '小さなグレーの丸 + 細い実線',
    intent:
      '3:1 のグレーの小さな丸に、境界線と同じ色の細い実線。手順（Steps）の番号の丸より小さく、日付と題が主役になる。記事の中でも静か。',
    spec: [
      ['点', '10px の丸・3:1 のグレーの塗り（markerType="neutral"・markerSize="md"）'],
      ['線', '1px の実線・境界線の色（line="solid"）'],
    ],
  },
  {
    id: 'A',
    name: '輪郭の丸 + 細い実線',
    intent:
      '塗らずに、地の色で抜いた輪郭の丸。線が丸の中を通らないので、点が「駅」のように見える。いちばん軽い。',
    spec: [
      ['点', '10px の丸・1.5px の輪郭（markerType="outline"）'],
      ['線', '1px の実線・境界線の色'],
    ],
  },
  {
    id: 'B',
    name: '大きなグレーの丸 + 細い実線',
    intent:
      '点を 14px に大きくする。年表の骨組みが目に入りやすくなるが、日付の小さな文字と釣り合わなくなる。',
    spec: [
      ['点', '14px の丸・3:1 のグレーの塗り（markerSize="lg"）'],
      ['線', '1px の実線・境界線の色'],
    ],
  },
  {
    id: 'C',
    name: '小さなグレーの丸 + 点線',
    intent:
      '線を点線にして、つながりをさらに軽くする。項目のあいだが空いた年表（年が飛ぶ職歴）に合う。',
    spec: [
      ['点', '10px の丸・3:1 のグレーの塗り'],
      ['線', '2px の点線・境界線の色（line="dotted"）'],
    ],
  },
  {
    id: 'D',
    name: '線なし',
    intent:
      '線を引かず、点と余白だけで並びを見せる。いちばん静かで、箇条書きに近い。項目が離れると、つながりが読みにくい。',
    spec: [
      ['点', '10px の丸・3:1 のグレーの塗り'],
      ['線', 'なし（line="none"）'],
    ],
  },
  {
    id: 'E',
    name: 'Primary の青の丸 + 細い実線',
    intent:
      '点を Primary の青にして、年表をページの中で目立たせる。記事の中で色が付くのは、こことリンクくらいになる。',
    spec: [
      ['点', '10px の丸・Primary の青（markerType="primary"。白地 4.53:1）'],
      ['線', '1px の実線・境界線の色'],
    ],
  },
  {
    id: 'F',
    name: '現行版 + 最後に点線が伸びる',
    intent:
      '現行版に、最後の項目のあとの短い点線を足す。線がそこで切れないので、年表がまだ続くことが分かる。職歴やこれからの予定に合う。',
    spec: [
      ['点', '10px の丸・3:1 のグレーの塗り'],
      ['線', '1px の実線・境界線の色'],
      ['最後のあと', '20px の点線（tail="dotted"）'],
    ],
  },
];

const columns: Column[] = [
  { label: '短い項目', note: '日付と題だけ' },
  { label: '長い項目', note: '説明が折り返す' },
  { label: '記事の中', note: 'Prose の中。見出し・段落と並ぶ' },
];

const meta = {
  title: 'Design Review/220 年表の点と線',
  id: 'design-review-220-timeline-marker-line',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E', 'F', 'current,F'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={220}
      axis="年表の点と線"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        if (column.label === '長い項目') return <Long id={candidate.id} />;
        if (column.label === '記事の中') return <InArticle id={candidate.id} />;
        return <Short id={candidate.id} />;
      }}
    >
      <p>
        決定: 現行版を既定にし、F（<code>tail="dotted"</code>
        ）も選べます。既定は最後の項目のあとに線を伸ばさない
        <code>tail="none"</code>です。点の大きさは <code>markerSize</code>（sm・md・lg。B は lg）、
        点と線の種類は手順（Steps）の点と線に合わせた <code>markerType</code>
        （neutral・outline・primary）・
        <code>line</code>（solid・dotted・none）で選べます。A・C・D・E は、この props
        の組み合わせになりました。
      </p>
    </Comparison>
  ),
};
