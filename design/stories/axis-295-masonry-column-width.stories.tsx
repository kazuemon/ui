import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Masonry } from '../../src/components/masonry/Masonry';

// 軸 295: Masonry の幅ごとの列数。minColumnWidth（列の最小の幅。auto-fill）の既定値をいくつにするかを比べる。
//   値が小さいほど、同じ幅でも列が増えて密になる。columns を渡せば入れ物の幅によらず列数を固定できるので、
//   ここで選ぶのはあくまで minColumnWidth の既定値（auto-fill のとき）

const heights = [64, 120, 88, 156, 72, 108, 140, 96, 60];

// Masonry の子は渡した順のまま直接の children にする（{blocks()} と関数として呼ぶ。<Blocks /> の
// ような JSX 要素にすると、Masonry には展開前の 1 個の要素としてしか数えられない）
function blocks() {
  return heights.map((h, i) => (
    <div
      key={i}
      style={{ height: h }}
      className="flex items-center justify-center rounded-control bg-neutral p-2 text-center text-sm"
    >
      {i + 1}
    </div>
  ));
}

const candidates: (Candidate & { minColumnWidth: number })[] = [
  {
    id: 'current',
    name: '240px',
    intent: 'カード 1 枚が窮屈にならない、いまの既定',
    spec: [
      ['minColumnWidth', '240（既定）'],
      ['幅 500px での列数', '2 列'],
      ['幅 760px での列数', '3 列'],
    ],
    minColumnWidth: 240,
  },
  {
    id: 'A',
    name: '200px',
    intent: 'もう一段小さい幅から列を増やす。スマホでも 2 列に割れやすい',
    spec: [
      ['minColumnWidth', '200'],
      ['幅 500px での列数', '2 列'],
      ['幅 760px での列数', '3 列'],
    ],
    minColumnWidth: 200,
  },
  {
    id: 'B',
    name: '320px',
    intent: '列を大きく取り、読みものの見出し画像のような余裕を持たせる',
    spec: [
      ['minColumnWidth', '320'],
      ['幅 500px での列数', '1 列'],
      ['幅 760px での列数', '2 列'],
    ],
    minColumnWidth: 320,
  },
];

const columns: Column[] = [{ label: '入れ物の幅 500px' }, { label: '入れ物の幅 760px' }];

const widths = [500, 760];

const meta = {
  title: 'Design Review/295 Masonry の幅ごとの列数',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const ColumnWidth: Story = {
  name: '幅ごとの列数',
  render: () => (
    <Comparison
      index={295}
      axis="Masonry の幅ごとの列数"
      pick="current"
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const width = column.label.includes('500') ? widths[0] : widths[1];
        return (
          <div style={{ width }}>
            <Masonry
              gap="sm"
              minColumnWidth={(candidate as (typeof candidates)[number]).minColumnWidth}
            >
              {blocks()}
            </Masonry>
          </div>
        );
      }}
    >
      <p>
        <strong>決定: 240px。場面に応じて minColumnWidth で変えられる。</strong>
      </p>
      <p>
        minColumnWidth は、入れ物の幅をこの値で割った数だけ列にします（CSS の auto-fill。JS
        もブラウザの実験機能も要りません）。値が小さいほど、同じ幅でも列が増えて密になります。列数を固定したいときは
        columns を渡します（この軸では触れません）。
      </p>
      <p>
        推奨は現行版（240px）です。作品 1
        枚のカード（画像＋日付＋題）が窮屈にならない広さを保ちつつ、幅 500px のようなスマホでも 2
        列に割れます。A（200px）はスマホでの密度をもう一段上げたいときに、B（320px）は読みものの見出し画像のように余裕を持たせたいときに選べます。
      </p>
    </Comparison>
  ),
};
