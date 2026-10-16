import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Sparkline,
  type SparklineColor,
  type SparklineVariant,
} from '../../src/components/sparkline/Sparkline';
import { Stat } from '../../src/components/stat/Stat';

// 軸 660: Sparkline の既定の見た目（色・塗り・最後の点）。行ごとに props の既定を変えて並べる
const meta = {
  title: 'Design Review/660 Sparkline の既定',
  id: 'design-review-660-sparkline-defaults',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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

interface Defaults {
  color: SparklineColor;
  variant: SparklineVariant;
  showEndPoint: boolean;
}

const defaultsOf: Record<string, Defaults> = {
  現行版: { color: 'neutral', variant: 'line', showEndPoint: false },
  A: { color: 'brand', variant: 'line', showEndPoint: true },
  B: { color: 'brand', variant: 'area', showEndPoint: true },
  C: { color: 'brand', variant: 'line', showEndPoint: false },
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'グレーの線だけ',
    intent:
      '色を持つ部品は、色を指定しないとグレー（原則 6）に合わせる。いちばん静かで、そばの数字や増減の色（成功の緑・危険の赤）とぶつからない。ページの中で目立たない',
    spec: [
      ['color', 'neutral'],
      ['variant', 'line'],
      ['最後の点', 'なし'],
    ],
  },
  {
    id: 'A',
    name: '水色の線と、最後の点',
    intent:
      'グラフの系列の 1 番（水色）で描き、いまの値に点を置く。点があると、線の右端が「いま」だと分かり、数字と線の右端が結びつく。塗らないので、表のセルに並べても重くならない',
    spec: [
      ['color', 'brand'],
      ['variant', 'line'],
      ['最後の点', 'あり'],
    ],
  },
  {
    id: 'B',
    name: '水色の線の下を塗り、最後の点',
    intent:
      'A に、線の下の淡い塗りを足す。小さくても量の感じが出て、Stat の横に置くと絵として収まる。表のセルにいくつも並べると、塗りが続いて重く見える',
    spec: [
      ['color', 'brand'],
      ['variant', 'area'],
      ['最後の点', 'あり'],
    ],
  },
  {
    id: 'C',
    name: '水色の線だけ',
    intent: '色だけを水色にし、点も塗りも付けない。A より軽いが、右端がいまの値だと分かりにくい',
    spec: [
      ['color', 'brand'],
      ['variant', 'line'],
      ['最後の点', 'なし'],
    ],
  },
];

const columns: Column[] = [
  { label: 'Stat の横', note: '数字と増減のそば' },
  { label: '表のセル', note: '行ごとに並べる' },
  { label: '文の中', note: '本文の大きさ' },
  { label: '大きく置く', note: 'カードの幅いっぱい' },
];

const rising = [4, 6, 5, 8, 7, 9, 12, 10, 13, 15, 14, 18];
const rows: [string, number[], string][] = [
  ['記事', rising, '1,240'],
  ['ドキュメント', [9, 8, 10, 9, 7, 8, 6, 7, 5, 6, 4, 5], '860'],
  ['作品', [3, 3, 4, 3, 5, 4, 4, 6, 5, 5, 6, 6], '420'],
];

export const Candidates: Story = {
  name: '既定の見た目',
  render: ({ pick }) => (
    <Comparison
      index={660}
      axis="Sparkline の既定"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const defaults = defaultsOf[candidate.id];
        switch (column.label) {
          case 'Stat の横':
            return (
              <div className="flex w-[260px] items-end justify-between gap-4">
                <Stat
                  label="今週の閲覧"
                  value="2,520"
                  delta="12%"
                  deltaIndicator="up"
                  caption="先週比"
                />
                <Sparkline {...defaults} data={rising} className="mb-1 h-10 w-28" />
              </div>
            );
          case '表のセル':
            return (
              <table className="w-[260px] text-sm">
                <tbody>
                  {rows.map(([label, data, value]) => (
                    <tr key={label} className="border-b border-surface-line last:border-0">
                      <td className="py-2">{label}</td>
                      <td className="py-2 text-right text-fg-muted tabular-nums">{value}</td>
                      <td className="py-2 pl-3 text-right">
                        <Sparkline {...defaults} data={data} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case '文の中':
            return (
              <p className="w-[260px] text-body text-fg">
                今週の閲覧は 2,520 回 <Sparkline {...defaults} data={rising} />{' '}
                で、先週より増えました。
              </p>
            );
          default:
            return (
              <div className="flex w-[260px] flex-col gap-2 rounded-card border border-surface-line p-4">
                <span className="text-sm font-bold">直近 12 週の閲覧</span>
                <Sparkline {...defaults} data={rising} className="h-16 w-full" />
              </div>
            );
        }
      }}
    >
      <p>
        Sparkline
        を何も指定せずに置いたときの見た目を決めます。色（`color`）・線の下の塗り（`variant`）・最後の点（`showEndPoint`）の
        3 つです。どれも props で選べるので、ここで決めるのは既定だけです。
      </p>
      <p>
        おすすめは A（水色の線と、最後の点）です。Sparkline はグラフの仲間なので、系列の色の 1
        番（水色）を既定にすると、ほかのグラフと色がそろいます。最後の点があると、そばの数字が線の右端の値だと結びつきます。A・B・C
        は、原則 6 の「色を指定しないとき、色を持つ部品はグレー」を、グラフについては「系列の 1
        番の色」と書き換えることになります。塗り（B）は Stat
        の横では収まりがよいので、選べる形として残します。
      </p>
      <p>
        既定にする案と、ほかに選べるようにしたい案を教えてください（例:「A を既定にして、B
        も選べる」）。
      </p>
    </Comparison>
  ),
};
