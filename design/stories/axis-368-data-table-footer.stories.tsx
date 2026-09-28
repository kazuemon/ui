import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../src/components/text/Text';
import { type Candidate, type Column, Comparison } from './Comparison';
import { countText, SamplePagination, SampleTable } from './data-table-frame';

// 後半の軸 368: DataTable の下の帯（件数とページ送り）の並べ方
// 決定: 下の帯は部品にせず、並べ方は使う側が選ぶ。見本（Recipes/DataTable）は A にし、1 ページの件数を選ぶ Select を足した
//   下の帯は部品にせず、Text と Pagination を並べて作る（原則20: 部品にするほどでない組み合わせは見本として示す）
//   決めた並べ方は Recipes/DataTable の見本に写す。候補は並べ方（クラス）の違いだけで作る
//   Pagination は置いた幅で番号の数を減らし、24rem 未満では「1 / 6」になる（ADR-0198）

function Footer({ id }: { id: string }) {
  const count = (
    <Text as="span" size="sm" variant="muted">
      {countText}
    </Text>
  );
  switch (id) {
    case 'A':
      return (
        <div className="flex flex-col items-center gap-1">
          <SamplePagination className="w-full" />
          {count}
        </div>
      );
    case 'B':
      return (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SamplePagination align="start" className="min-w-0 flex-1" />
          {count}
        </div>
      );
    case 'C':
      return <SamplePagination />;
    default:
      return (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {count}
          <SamplePagination align="end" className="min-w-0 flex-1" />
        </div>
      );
  }
}

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '件数を左、ページ送りを右',
    intent:
      '管理画面でよくある形。件数は表の左端（読み始め）にそろい、ページ送りは右端に寄る。狭いと件数の下にページ送りが折り返す。',
    spec: [
      ['件数', '左'],
      ['ページ送り', '右寄せ'],
    ],
  },
  {
    id: 'A',
    name: 'ページ送りを中央、件数をその下',
    intent:
      'ページ送りを帯の真ん中に置き、件数は下に小さく添える。一覧のページ（ブログなど）と同じ位置になる。',
    spec: [
      ['件数', 'ページ送りの下・中央'],
      ['ページ送り', '中央'],
    ],
  },
  {
    id: 'B',
    name: 'ページ送りを左、件数を右',
    intent: 'ページ送りを表の左端にそろえる。件数は右の端に小さく置く。',
    spec: [
      ['件数', '右'],
      ['ページ送り', '左寄せ'],
    ],
  },
  {
    id: 'C',
    name: 'ページ送りだけ（中央）',
    intent: '件数を出さない。いちばん静か。何件あるかは分からない。',
    spec: [
      ['件数', 'なし'],
      ['ページ送り', '中央'],
    ],
  },
];

const columns: Column[] = [
  { label: '広い幅（40rem）' },
  { label: '狭い幅（22rem）', note: 'スマートフォンの画面の中' },
];

const meta = {
  title: 'Design Review/368 DataTable（下の帯の並べ方）',
  id: 'design-review-368-data-table-footer',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={368}
      axis="DataTable（下の帯の並べ方）"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => (
        <div
          className={`flex flex-col gap-3 ${column.label.startsWith('広い') ? 'w-[40rem]' : 'w-[22rem]'}`}
          data-density={column.label.startsWith('広い') ? undefined : 'coarse'}
        >
          <SampleTable rows={3} hideSelect={!column.label.startsWith('広い')} />
          <Footer id={candidate.id} />
        </div>
      )}
    >
      <p>
        <strong className="text-fg">
          決定: 下の帯は部品にせず、並べ方は使う側が選ぶ。見本（Recipes/DataTable）は A にし、1
          ページの件数を選ぶ Select を件数の横に足す
        </strong>
        。表の下には、件数（「23 件中 1〜4
        件」）とページ送りを置きます。この帯は部品にせず、見本（Recipes/DataTable）で組み方を示します。ここで決めるのは、その並べ方です。
      </p>
      <p>どれを見本の形にするかを一言添えてください。</p>
    </Comparison>
  ),
};
