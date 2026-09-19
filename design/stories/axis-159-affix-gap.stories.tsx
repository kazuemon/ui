import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { ArticleScene } from '../../src/components/affix/story-scenes';

// 後半の軸 159: 面を持たない Affix（目次・上へ戻る）が留まるときの、端からの離れ
//   上に留まる目次は、貼り付けた Navbar の下の線から離す（belowNavbar）。下に留まる「上へ戻る」は、画面の下の端から離す
//   上と下で同じ値（--affix-gap）を使う。帯（surface）は端に付けて留めるので関わらない
//   Container の左右の余白（置いた場所の幅の 5%）は、sticky の top に書くと高さの % になるので、固定の値で比べる
//   候補は --affix-gap の上書きだけで作る

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '24px',
    intent:
      '目次は Navbar の線から 24px 下に留まる。見出しと本文のあいだ程度の離れで、帯と目次が別のものに見え、長い目次の高さも削りすぎない。',
    spec: [['離れ', '24px（spacing × 6）']],
    tokens: { '--affix-gap': 'calc(var(--spacing) * 6)' },
  },
  {
    id: 'A',
    name: '16px',
    intent:
      '狭い画面の左右の余白と同じ 16px。画面の高さを目次に多く使えるが、Navbar の線に近く、帯の一部のように見えやすい。',
    spec: [['離れ', '16px（spacing × 4）']],
    tokens: { '--affix-gap': 'calc(var(--spacing) * 4)' },
  },
  {
    id: 'B',
    name: '40px',
    intent:
      '広い画面の左右の余白に近い 40px。記事の上の余白と近く、留まる前と後で目次の位置があまり変わらない。そのぶん画面の高さを使う。',
    spec: [['離れ', '40px（spacing × 10）']],
    tokens: { '--affix-gap': 'calc(var(--spacing) * 10)' },
  },
];

const columns: Column[] = [
  { label: '目次（上に留まる）', note: '貼り付けた Navbar の下。記事を読み進めたところ' },
  { label: '上へ戻る（下に留まる）', note: '画面の下の端。記事を読んでいるあいだ' },
];

function renderCell(column: Column) {
  if (column.label === '目次（上に留まる）') {
    return <ArticleScene width="w-[520px]" scroll={360} backToTop={false} />;
  }
  return <ArticleScene width="w-[520px]" scroll={360} toc={false} />;
}

const meta = {
  title: 'Design Review/159 留まるときの端からの離れ',
  id: 'design-review-159-affix-gap',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;

export const Candidates: StoryObj<{ pick: string }> = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={159}
      axis="目次や「上へ戻る」が留まるときの、端からの離れ"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => renderCell(column)}
    >
      <p>
        記事の横の目次は、貼り付けた Navbar
        の下に留まります。ページの下の「上へ戻る」は、画面の下の端に留まります。ここで決めるのは、留まったときに端からどれだけ離すかです。上と下で同じ値を使います。
      </p>
      <p>
        各セルの枠の中はスクロールできます。上に戻すと、目次が留まる前（記事の上の余白の位置）から留まるまでの動きも見られます。どれを既定にするか教えてください。
      </p>
    </Comparison>
  ),
};
