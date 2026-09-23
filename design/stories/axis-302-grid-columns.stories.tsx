import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Card, CardBody } from '../../src/components/card/Card';
import { Grid } from '../../src/components/grid/Grid';
import { Heading } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';

// 軸 302: Grid に columns だけを渡したとき、狭い入れ物で列を減らすか
//   現行版: 固定（Masonry の columns と同じ）。減らしたいときは minColumnWidth も渡す
//   A: columns を上限として扱い、minColumnWidth の既定（240）を割るときは列を減らす（Gallery の columns に近い）。
//      固定したいときは minColumnWidth={0} を渡す
//   部品はどちらの形も描ける（columns と minColumnWidth を両方渡すと上限になる）。比べるのは「columns だけ」のときの既定なので、
//   行ごとに props を明示して描く。A の行は、A を採ったときの columns={3} と同じ指定（columns={3} minColumnWidth={240}）

const plans = [
  { name: 'フリー', price: '¥0', note: '個人の小さな記録に。' },
  { name: 'ライト', price: '¥480', note: '画像を多く載せる人に。' },
  { name: 'プロ', price: '¥1,200', note: '仕事で使う人に。独自のドメインが使えます。' },
];

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '固定する',
    intent:
      'columns だけなら、入れ物の幅によらず同じ列の数。狭いと 1 列が細くなる。予約の時刻のような小さなボタンの並びに向く',
    spec: [
      ['<Grid columns={3}>', '常に 3 列'],
      ['狭い入れ物で減らす', 'columns={3} minColumnWidth={240}'],
      ['Masonry の columns', '同じ（固定）'],
    ],
  },
  {
    id: 'A',
    name: '上限にして、狭いと減らす',
    intent:
      'columns は列の数の上限。1 列が 240px を割るときは列を減らす。料金の表やカードの一覧が、スマホで 1 列になる',
    spec: [
      ['<Grid columns={3}>', '上限 3 列（幅 760px は 3 列、480px は 1 列）'],
      ['固定する', 'columns={3} minColumnWidth={0}'],
      ['Masonry の columns', '違う（Masonry は固定）'],
    ],
  },
];

// 行ごとに明示する minColumnWidth（現行版は渡さない）
const minColumnWidths: Record<string, number | undefined> = { current: undefined, A: 240 };

const columns: Column[] = [
  { label: '入れ物の幅 760px' },
  { label: '入れ物の幅 480px' },
  { label: '入れ物の幅 320px' },
];

const widths: Record<string, number> = {
  '入れ物の幅 760px': 760,
  '入れ物の幅 480px': 480,
  '入れ物の幅 320px': 320,
};

const meta = {
  title: 'Design Review/302 Grid の columns を狭い入れ物で減らすか',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Columns: Story = {
  name: 'columns を狭い入れ物で減らすか',
  render: () => (
    <Comparison
      index={302}
      axis="Grid の columns を、狭い入れ物で減らすか"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const minColumnWidth = minColumnWidths[candidate.id];
        return (
          <div style={{ width: widths[column.label] }}>
            <Grid columns={3} minColumnWidth={minColumnWidth}>
              {plans.map((plan) => (
                <Card key={plan.name}>
                  <CardBody>
                    <Heading level={3} size={4}>
                      {plan.name}
                    </Heading>
                    <Text size="sm" variant="muted">
                      {plan.note}
                    </Text>
                    <Text weight="bold">{plan.price} / 月</Text>
                    <Button color="primary">選ぶ</Button>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </div>
        );
      }}
    >
      <p>
        <code>{'<Grid columns={3}>'}</code>{' '}
        と書いたときに、入れ物が狭いと列を減らすかを選びます。見本の 6
        ページのうち、料金の表・記事の一覧・指標の行は「スマホは 1〜2 列、広い画面は 3〜4
        列」で、予約の時刻とプロフィールの数字の並びは「いつも同じ列の数」でした。どちらの形も書けますが、
        <code>columns</code> だけを書いたときにどちらになるかが違います。
      </p>
      <p>
        現行版は固定です。Masonry の <code>columns</code> と同じ意味で、狭い入れ物で減らしたいときは{' '}
        <code>minColumnWidth</code> も渡します。A は <code>columns</code> を上限として扱い、1 列が
        240px を割るときは列を減らします。Gallery の <code>columns</code>
        （入れ物が狭いと 2 列にまとめる）に近い形です。固定したいときは{' '}
        <code>minColumnWidth={'{0}'}</code> を渡します。
      </p>
      <p>
        列の数は、どちらの案でも画面の幅ではなく入れ物の幅で決まります。画面の幅の段（sm・md・lg）で列の数を変える
        props は、どちらの案でも持ちません。
      </p>
      <p>
        推奨は現行版です。<code>columns</code> の意味が Masonry
        と同じままで、書いたとおりの列の数になります。ただ、見本では減らしたい並べ方のほうが多いので、書く量を減らしたいなら
        A です。
      </p>
    </Comparison>
  ),
};
