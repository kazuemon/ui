import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Card, CardBody } from '../../src/components/card/Card';
import { Grid, type GridAlign } from '../../src/components/grid/Grid';
import { Heading } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';

// 軸 300: Grid の同じ行の子の高さ。align の既定を stretch（CSS Grid の既定。行でいちばん高い子に合わせて伸ばす）にするか、
//   start（子の高さのまま。Masonry と同じ）にするか。どちらを既定にしても、もう一方は align で選べる
//   比べるのは既定値なので、行ごとに align を明示して描く（トークンではなく props の差）

const plans = [
  { name: 'フリー', price: '¥0', note: '個人の小さな記録に。' },
  {
    name: 'ライト',
    price: '¥480',
    note: '画像を多く載せる人に。月ごとの保存容量が増え、下書きを何本でも置けます。',
  },
  {
    name: 'プロ',
    price: '¥1,200',
    note: '仕事で使う人に。独自のドメイン、アクセスの集計、予約の投稿、チームでの編集ができます。',
  },
];

const posts = [
  { title: 'Grid を作った', date: '2026.09.24' },
  { title: '和文と欧文を混ぜた見出しの折り返しを、読みやすい位置にそろえる', date: '2026.09.20' },
  { title: '夏の記録', date: '2026.08.31' },
  { title: 'Storybook で見た目の候補を並べて選ぶ', date: '2026.08.12' },
];

const candidates: Candidate[] = [
  {
    id: 'current',
    name: 'そろえる（stretch）',
    intent:
      '行でいちばん高い子に合わせて、同じ行の子を伸ばす。カードの枠の下端がそろう。CSS Grid の既定のまま',
    spec: [
      ['align の既定', "'stretch'"],
      ['カードの下端', '同じ行でそろう'],
      ['カードの中身', '上に詰まり、短いカードは下が空く（ボタンの位置はそろわない）'],
      ['もう一方', 'align="start" で選べる'],
    ],
  },
  {
    id: 'A',
    name: 'そろえない（start）',
    intent:
      '子の高さのまま、上端に寄せる。Masonry と同じ。短いカードの下に、行の間隔より広い隙間ができる',
    spec: [
      ['align の既定', "'start'"],
      ['カードの下端', '中身の長さで変わる'],
      ['カードの中身', '枠が中身にぴったり'],
      ['もう一方', 'align="stretch" で選べる'],
    ],
  },
];

// 行ごとに明示する align
const aligns: Record<string, GridAlign> = { current: 'stretch', A: 'start' };

const columns: Column[] = [
  { label: '料金のカード', note: '入れ物の幅 640px・columns={3}' },
  { label: '記事のカード', note: '入れ物の幅 480px・columns={2}。題の長さが違う' },
];

const meta = {
  title: 'Design Review/300 Grid の子の高さ',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Align: Story = {
  name: '子の高さ',
  render: () => (
    <Comparison
      index={300}
      pick="current"
      axis="Grid の同じ行の子の高さ（そろえるか）"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const align = aligns[candidate.id];
        return column.label === '料金のカード' ? (
          <div style={{ width: 640 }}>
            <Grid columns={3} align={align}>
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
        ) : (
          <div style={{ width: 480 }}>
            <Grid columns={2} align={align}>
              {posts.map((post) => (
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
              ))}
            </Grid>
          </div>
        );
      }}
    >
      <p>
        決定: 現行版（ADR-0308）。
        同じ行に、中身の長さが違う子を並べたときに、高さをそろえるかを選びます。選んだほうが{' '}
        <code>align</code> の既定になり、もう一方も <code>align</code> で選べます。
      </p>
      <p>
        現行版（stretch）は、行でいちばん高いカードに合わせて枠を伸ばします。枠の下端はそろいますが、中身は上に詰まったままなので、料金のカードのボタンの高さはそろいません（ボタンを下端にそろえるのは
        Card の側の仕事です）。A（start）は Masonry
        と同じで、枠が中身にぴったり合い、短いカードの下が空きます。
      </p>
      <p>
        推奨は現行版です。料金の表や記事の一覧のように、同じ種類のカードを並べる使い方が多く、枠の下端がそろうほうが「整然」に近いためです。高さの違う画像を詰めたいときは
        Masonry があります。
      </p>
    </Comparison>
  ),
};
