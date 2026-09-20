import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Timeline,
  type TimelineAlign,
  type TimelineDatePlacement,
  TimelineItem,
} from '../../src/components/timeline/Timeline';

// 後半の軸 222: 年表（Timeline）を左右交互に並べるか
//   決定: 既定は現行版（片側に寄せる、align="start"）。A（alternate）も選べる
//   B（左右交互 + 日付を題と同じ行）は採らない。使いたいときは A と datePlacement="inline" を組み合わせる
//   点と線（軸 220）・日付の置き場所（軸 221）は、どの案も現行版のまま

const shape: Record<string, { align: TimelineAlign; datePlacement: TimelineDatePlacement }> = {
  現行版: { align: 'start', datePlacement: 'stack' },
  A: { align: 'alternate', datePlacement: 'stack' },
  B: { align: 'alternate', datePlacement: 'inline' },
};

function Sample({ id, width }: { id: string; width: string }) {
  return (
    <div data-reading style={{ width }}>
      <Timeline {...shape[id]}>
        <TimelineItem date="2019年4月" title="大学に入る">
          情報工学を学びはじめました。
        </TimelineItem>
        <TimelineItem date="2021年4月" title="はじめての受託開発">
          小さな会社のサイトを、設計から公開まで担当しました。
        </TimelineItem>
        <TimelineItem date="2023年4月" title="入社">
          プロダクトのフロントエンドを担当しました。
        </TimelineItem>
        <TimelineItem date="2026年4月" title="いまの仕事">
          デザインシステムの部品を作っています。
        </TimelineItem>
      </Timeline>
    </div>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '片側に寄せる',
    intent:
      '点と線を左に置き、項目をすべて右に並べる。目の動きが 1 本で済み、幅が狭くても同じ形のまま。ページの中では静かに収まる。',
    spec: [
      ['点の位置', '左端'],
      ['項目', 'すべて点の右'],
    ],
  },
  {
    id: 'A',
    name: '左右交互',
    intent:
      '点と線を中央に置き、項目を左右交互に並べる。年表らしい見た目で、横幅を使える。偶数の項目は右寄せになるので、文の頭がそろわず読む順も左右に飛ぶ。',
    spec: [
      ['点の位置', '中央'],
      ['項目', '奇数は右・偶数は左（右寄せ）'],
    ],
  },
  {
    id: 'B',
    name: '左右交互 + 日付を題と同じ行',
    intent:
      'A と同じ並べ方で、日付を題と同じ行に置く。1 項目の縦が詰まるので、左右に振り分けたときの余りが減る。',
    spec: [
      ['点の位置', '中央'],
      ['日付', '題と同じ行'],
    ],
  },
];

const columns: Column[] = [
  { label: '広い幅', note: '520px' },
  { label: '狭い幅', note: '340px' },
];

const meta = {
  title: 'Design Review/222 年表を左右交互にするか',
  id: 'design-review-222-timeline-alternate',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,A'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={222}
      axis="年表を左右交互にするか"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Sample id={candidate.id} width={column.label === '狭い幅' ? '340px' : '520px'} />
      )}
    >
      <p>
        決定: 既定は現行版（片側に寄せる、<code>align="start"</code>）です。A（
        <code>align="alternate"</code>）も選べます。
      </p>
      <p>
        左右交互は、文の頭がそろわず読む順も左右に飛ぶので、読みものとしては読みにくくなります。広い幅を使う年表のために残します。B
        は形としては作らず、A と <code>datePlacement="inline"</code> の組み合わせで書けます。
      </p>
    </Comparison>
  ),
};
