import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Prose } from '../../src/components/prose/Prose';
import {
  Timeline,
  type TimelineDatePlacement,
  TimelineItem,
} from '../../src/components/timeline/Timeline';

// 後半の軸 221: 年表（Timeline）の日付の置き場所
//   決定: 既定は現行版（点の右・題の上、datePlacement="stack"）。A（inline）・B（aside）も選べる
//   --timeline-date-width（左の列の幅）・--timeline-inline-gap（同じ行のときの日付と題のあいだ）
//   点と線（軸 220）・項目の強調（軸 223）は、どの案も現行版のまま

const placement: Record<string, TimelineDatePlacement> = {
  現行版: 'stack',
  A: 'inline',
  B: 'aside',
};

// 左の列は、狭い入れ物では畳まれる（軸 224）。この軸では形そのものを比べたいので、畳まない指定で並べる
function RangeDate({ id }: { id: string }) {
  return (
    <div data-reading className="w-[420px]">
      <Timeline datePlacement={placement[id]} collapse="none">
        <TimelineItem date="2021年4月 – 2023年3月" title="株式会社あおぞら">
          受託のサイトを、設計から公開まで担当しました。
        </TimelineItem>
        <TimelineItem date="2023年4月 – 2026年3月" title="株式会社かずえもん">
          デザインシステムの部品を作っていました。
        </TimelineItem>
        <TimelineItem date="2026年4月 –" title="フリーランス">
          ドキュメントサイトの設計を手がけています。
        </TimelineItem>
      </Timeline>
    </div>
  );
}

function InArticle({ id }: { id: string }) {
  return (
    <Prose className="w-[420px]">
      <h2>これまで</h2>
      <Timeline datePlacement={placement[id]} collapse="none">
        <TimelineItem date="2021年4月" title="ブログを作る">
          <p>静的サイトジェネレーターで、記事を書く場所を作りました。</p>
        </TimelineItem>
        <TimelineItem date="2024年10月" title="部品を切り出す">
          <p>ブログで使っていた部品を、ライブラリにまとめました。</p>
        </TimelineItem>
        <TimelineItem date="2026年4月 –" title="原則を書く">
          <p>決めたことを、原則と記録に残しています。</p>
        </TimelineItem>
      </Timeline>
    </Prose>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '点の右・題の上',
    intent:
      '点の右に、日付・題・説明を縦に積む。日付が題の上に小さく乗る。どんな幅でも同じ形なので、狭い入れ物でも崩れない。日付どうしは縦にそろわない。',
    spec: [
      ['日付', '題の上・小さい文字・薄いグレー'],
      ['点をそろえる行', '日付の行'],
    ],
  },
  {
    id: 'A',
    name: '題と同じ行',
    intent:
      '日付と題を 1 行に並べる。項目の縦が詰まり、たくさんの項目を一度に見渡せる。題が長いと折り返して、日付だけの行ができる。',
    spec: [
      ['日付', '題の左・小さい文字・薄いグレー'],
      ['日付と題のあいだ', '12px'],
    ],
  },
  {
    id: 'B',
    name: '点の左の列',
    intent:
      '点の左に日付の列を空け、右寄せでそろえる。日付が縦にそろうので、年表として読みやすい。列の分だけ幅が要る。',
    spec: [
      ['日付', '点の左・幅 96px・右寄せ'],
      ['列と点のあいだ', '12px'],
    ],
  },
];

const columns: Column[] = [
  { label: '職歴', note: '期間の日付（2021年4月 – 2023年3月）・幅 420px' },
  { label: '記事の中', note: 'Prose の中・幅 420px' },
];

const meta = {
  title: 'Design Review/221 年表の日付の置き場所',
  id: 'design-review-221-timeline-date-placement',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={221}
      axis="年表の日付の置き場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        if (column.label === '記事の中') return <InArticle id={candidate.id} />;
        return <RangeDate id={candidate.id} />;
      }}
    >
      <p>
        決定: 既定は現行版（点の右・題の上、<code>datePlacement="stack"</code>）です。A（
        <code>inline</code>）と B（<code>aside</code>）も選べます。
      </p>
      <p>
        記事の中の狭い欄でも崩れない形を既定にしています。ポートフォリオの職歴のように幅を取れるページでは、B
        が読みやすくなります。狭い入れ物で B の列を畳むかどうかは、軸 224
        で決めました。ここでは形そのものを比べたいので、どの案も畳まない指定で並べています。
      </p>
    </Comparison>
  ),
};
