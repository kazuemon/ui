import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Timeline,
  type TimelineCollapse,
  TimelineItem,
} from '../../src/components/timeline/Timeline';

// 後半の軸 224: 年表（Timeline）の日付を左の列に置いたとき、狭い入れ物でどう畳むか
//   決定: 既定は現行版（題の上へ畳む、collapse="stack"）。B（畳まない、none）も選べる
//     A（題と同じ行へ畳む）は採らないので、部品からも外した。この比較からも外している
//   畳むかどうかは入れ物の幅で決める（原則11）。いまのしきい値は 448px
//   日付の置き場所は、どの案も左の列（軸 221 の B）。点と線・項目の強調は現行版のまま

const fold: Record<string, TimelineCollapse> = {
  現行版: 'stack',
  B: 'none',
};

function Sample({ id, width }: { id: string; width: string }) {
  return (
    <div data-reading style={{ width }}>
      <Timeline datePlacement="aside" collapse={fold[id]}>
        <TimelineItem date="2021年4月 – 2023年3月" title="株式会社あおぞら">
          受託のサイトを、設計から公開まで担当しました。
        </TimelineItem>
        <TimelineItem date="2023年4月 – 2026年3月" title="株式会社かずえもん">
          デザインシステムの部品を作っていました。
        </TimelineItem>
        <TimelineItem date="2026年4月 –" title="フリーランス" emphasis>
          ドキュメントサイトの設計を手がけています。
        </TimelineItem>
      </Timeline>
    </div>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '題の上へ畳む',
    intent:
      '狭くなったら日付の列をやめ、点の右・題の上に置く。既定の置き場所（軸 221 の現行版）と同じ形になるので、広い幅と狭い幅で同じ部品の別の顔に見える。',
    spec: [
      ['広い幅', '点の左の列・右寄せ'],
      ['狭い幅', '点の右・題の上（collapse="stack"）'],
    ],
  },
  {
    id: 'B',
    name: '畳まない',
    intent:
      '狭くなっても日付の列を保つ。日付が縦にそろったままだが、題と説明に残る幅が狭くなり、よく折り返す。',
    spec: [
      ['広い幅', '点の左の列・右寄せ'],
      ['狭い幅', '点の左の列・右寄せ（collapse="none"。幅はそのまま）'],
    ],
  },
];

const columns: Column[] = [
  { label: '広い入れ物', note: '520px。どの案も畳まない' },
  { label: '狭い入れ物', note: '320px。ここで案が分かれる' },
];

const meta = {
  title: 'Design Review/224 狭い入れ物の年表の日付',
  id: 'design-review-224-timeline-narrow-date',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'B', 'current,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={224}
      axis="狭い入れ物の年表の日付"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <Sample id={candidate.id} width={column.label === '狭い入れ物' ? '320px' : '520px'} />
      )}
    >
      <p>
        決定: 既定は現行版（題の上へ畳む、<code>collapse="stack"</code>）です。B（
        <code>collapse="none"</code>
        ・畳まない）も選べます。日付の置き場所の既定と同じ形に戻るので、覚えることが増えません。
      </p>
      <p>
        畳むかどうかは画面ではなく入れ物の幅で決めます。題と同じ行へ畳む案は採らなかったので、部品にもこの比較にも残していません。
      </p>
    </Comparison>
  ),
};
