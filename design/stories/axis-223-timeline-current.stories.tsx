import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Prose } from '../../src/components/prose/Prose';
import {
  Timeline,
  TimelineItem,
  type TimelineMarkerType,
} from '../../src/components/timeline/Timeline';

// 後半の軸 223: 年表（Timeline）で、目立たせたい項目の強調
//   決定: 既定は現行版（点の種類はそのまま + 淡い輪 + 1.2 倍）。強調するかは項目の props（emphasis）で渡す。
//     強調で色は変えない。青くしたい項目は、項目の markerType="primary" で点の種類を上書きする（C）。
//     「いまの項目」に限らないので current は持たない
//   --timeline-emphasis-halo（点の周りの輪の幅）・--timeline-emphasis-halo-mix（輪の濃さ）
//   --timeline-emphasis-scale（点の大きさの倍率）
//   点と線（軸 220）・日付の置き場所（軸 221）は、どの案も現行版のまま

// 案ごとの項目の指定。強調するかと点の種類は props、輪と大きさはトークンの上書きで分ける
const form: Record<string, { emphasis: boolean; markerType?: TimelineMarkerType }> = {
  現行版: { emphasis: true },
  A: { emphasis: true },
  B: { emphasis: true },
  C: { emphasis: true, markerType: 'primary' },
  D: { emphasis: false },
};

function Latest({ id }: { id: string }) {
  return (
    <div data-reading className="w-80">
      <Timeline>
        <TimelineItem date="2021年4月" title="入社">
          フロントエンドを担当しました。
        </TimelineItem>
        <TimelineItem date="2023年4月" title="異動">
          デザインシステムの担当になりました。
        </TimelineItem>
        <TimelineItem date="2026年4月 –" title="いまの仕事" {...form[id]}>
          ドキュメントサイトを作っています。
        </TimelineItem>
      </Timeline>
    </div>
  );
}

function Middle({ id }: { id: string }) {
  return (
    <div data-reading className="w-80">
      <Timeline>
        <TimelineItem date="2023年4月 –" title="フリーランス" {...form[id]}>
          ドキュメントサイトの設計を手がけています。
        </TimelineItem>
        <TimelineItem date="2021年4月 – 2023年3月" title="株式会社かずえもん">
          デザインシステムの部品を作っていました。
        </TimelineItem>
        <TimelineItem date="2019年4月 – 2021年3月" title="株式会社あおぞら">
          受託のサイトを担当しました。
        </TimelineItem>
      </Timeline>
    </div>
  );
}

function InArticle({ id }: { id: string }) {
  return (
    <Prose className="w-80">
      <h2>これまで</h2>
      <Timeline>
        <TimelineItem date="2021年4月" title="ブログを作る">
          <p>記事を書く場所を作りました。</p>
        </TimelineItem>
        <TimelineItem date="2026年4月 –" title="原則を書く" {...form[id]}>
          <p>決めたことを、原則と記録に残しています。</p>
        </TimelineItem>
      </Timeline>
    </Prose>
  );
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '淡い輪 + 少し大きく',
    intent:
      '点の種類はそのままに、周りに淡い輪を足して少し大きくする。輪はその点の色を薄めた色。色を指定しない部品なので、色ではなく形で示す。',
    spec: [
      ['点の色', 'ほかの項目と同じ（変えない）'],
      ['輪', '4px・点の色を薄めた色'],
      ['大きさ', '1.2 倍'],
    ],
  },
  {
    id: 'A',
    name: '淡い輪だけ',
    intent:
      '点の大きさは変えず、周りの輪だけで示す。いちばん静かだが、点の並びの太さが変わらないので、離れて見ると気づきにくい。',
    spec: [
      ['点の色', 'ほかの項目と同じ'],
      ['輪', '4px・点の色を薄めた色'],
      ['大きさ', 'ほかの項目と同じ'],
    ],
    tokens: {
      '--timeline-emphasis-scale': '1',
    },
  },
  {
    id: 'B',
    name: '大きな点だけ',
    intent: '輪を足さず、点そのものを 1.5 倍にする。形の差だけで示すので、白黒で印刷しても分かる。',
    spec: [
      ['点の色', 'ほかの項目と同じ'],
      ['輪', 'なし'],
      ['大きさ', '1.5 倍'],
    ],
    tokens: {
      '--timeline-emphasis-halo': '0px',
      '--timeline-emphasis-scale': '1.5',
    },
  },
  {
    id: 'C',
    name: 'Primary の点 + 強調',
    intent:
      'その項目だけ点の種類を Primary の青に上書きし（markerType="primary"）、強調を足す。輪も淡い青になる。一目で分かるが、色を指定していない部品に色が付く。',
    spec: [
      ['点の色', 'Primary の青（項目の markerType="primary"）'],
      ['輪', '4px・淡い青'],
      ['大きさ', '1.2 倍'],
    ],
  },
  {
    id: 'D',
    name: '強調しない',
    intent:
      'どの項目も同じ点にする。いつからいつまでかは日付が伝えるので、見た目は変えない（emphasis を付けない）。',
    spec: [
      ['点の色', 'ほかの項目と同じ'],
      ['輪', 'なし'],
      ['大きさ', 'ほかの項目と同じ'],
    ],
  },
];

const columns: Column[] = [
  { label: '古い順', note: '強調する項目は最後' },
  { label: '新しい順', note: '強調する項目は最初' },
  { label: '記事の中', note: 'Prose の中' },
];

const meta = {
  title: 'Design Review/223 年表の項目の強調',
  id: 'design-review-223-timeline-current',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'current,C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={223}
      axis="年表の項目の強調"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        if (column.label === '新しい順') return <Middle id={candidate.id} />;
        if (column.label === '記事の中') return <InArticle id={candidate.id} />;
        return <Latest id={candidate.id} />;
      }}
    >
      <p>
        決定: 現行版を既定にし、<code>emphasis</code>
        （点の種類のまま輪と大きさで強調）と、項目ごとの
        <code>markerType</code>{' '}
        の上書きを選べる形になりました。強調で色は変えないので、青くしたい項目には C のように{' '}
        <code>markerType=&quot;primary&quot;</code> を足します。D は <code>emphasis</code>
        を付けない形です。
      </p>
      <p>
        強調は「いま続いている項目」に限らないので、部品としての <code>current</code>
        は持ちません。読み上げの意味も付けないので、いま続いていることを伝えたいときは日付や説明の文で書きます。
      </p>
    </Comparison>
  ),
};
