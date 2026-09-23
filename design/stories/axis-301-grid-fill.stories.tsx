import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Card, CardBody } from '../../src/components/card/Card';
import { Grid } from '../../src/components/grid/Grid';
import { Heading } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';

// 軸 301: Grid の列の数を入れ物の幅で決めるとき、子が列の数より少ない場合の扱い（--grid-fill）
//   auto-fill: 入る数だけ列を作り、空いた列を残す（子の幅は列の幅のまま。Masonry と同じ）
//   auto-fit: 空いた列をたたみ、子を広げて入れ物の幅を埋める
//   子が列の数以上あるときは、どちらも同じ見た目になる。違いが出るのは、子が少ないときだけ

const posts = [
  { title: 'Grid を作った', date: '2026.09.24' },
  { title: '和文と欧文を混ぜた見出しの折り返し', date: '2026.09.20' },
  { title: '夏の記録', date: '2026.08.31' },
  { title: 'Storybook で候補を並べて選ぶ', date: '2026.08.12' },
];

function cards(n: number) {
  return posts.slice(0, n).map((post) => (
    <Card key={post.title} href="#">
      <CardBody>
        <Text size="sm" variant="subtle">
          {post.date}
        </Text>
        <Heading level={3} size={4}>
          {post.title}
        </Heading>
      </CardBody>
    </Card>
  ));
}

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '空いた列を残す（auto-fill）',
    intent:
      '子が少なくても、列の幅は子が多いときと同じ。右側が空く。件数の違う一覧どうしで、カードの幅がそろう',
    spec: [
      ['--grid-fill', 'auto-fill'],
      ['子 2 個・幅 760px', '3 列分の幅のうち 2 列に置き、右の 1 列分が空く'],
      ['子 1 個・幅 760px', 'カードは 1 列分の幅のまま'],
    ],
    tokens: { '--grid-fill': 'auto-fill' },
  },
  {
    id: 'A',
    name: '子を広げて埋める（auto-fit）',
    intent:
      '空いた列をたたみ、子を入れ物の幅いっぱいに広げる。子が 1 個なら入れ物の幅いっぱいのカードになる',
    spec: [
      ['--grid-fill', 'auto-fit'],
      ['子 2 個・幅 760px', '2 列に広がり、入れ物の幅を埋める'],
      ['子 1 個・幅 760px', 'カードが入れ物の幅いっぱい'],
    ],
    tokens: { '--grid-fill': 'auto-fit' },
  },
];

const columns: Column[] = [
  { label: '子が 4 個', note: '入れ物の幅 760px（列の最小幅 240 → 3 列）。違いが出ない' },
  { label: '子が 2 個', note: '入れ物の幅 760px' },
  { label: '子が 1 個', note: '入れ物の幅 760px' },
];

const counts: Record<string, number> = { '子が 4 個': 4, '子が 2 個': 2, '子が 1 個': 1 };

const meta = {
  title: 'Design Review/301 Grid の子が少ないとき',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Fill: Story = {
  name: '子が少ないとき',
  render: () => (
    <Comparison
      index={301}
      axis="Grid の子が列の数より少ないとき（auto-fill・auto-fit）"
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (
        <div style={{ width: 760 }}>
          <Grid gap="md">{cards(counts[column.label])}</Grid>
        </div>
      )}
    >
      <p>
        列の数を入れ物の幅で決めるとき（<code>columns</code> を渡さないとき、または{' '}
        <code>columns</code> と <code>minColumnWidth</code>{' '}
        を両方渡したとき）に、子が入る列の数より少ない場合の見た目を選びます。子が多いときは、どちらも同じ見た目です。
      </p>
      <p>
        現行版（auto-fill）は、空いた列を残します。記事が 1
        件しかない一覧でも、カードの幅は記事が多いときと同じです。A（auto-fit）は、空いた列をたたんで子を広げます。1
        件なら入れ物の幅いっぱいのカードになり、画像の比率によっては背の高い大きなカードになります。
      </p>
      <p>
        推奨は現行版です。件数が変わってもカードの大きさが変わらず、Masonry
        とも同じ振る舞いになります。料金の表のように、数が決まっていて幅を埋めたいときは{' '}
        <code>columns</code> で列の数を渡せば埋まります。
      </p>
    </Comparison>
  ),
};
