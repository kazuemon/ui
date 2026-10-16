import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';

// 軸 659: グラフの系列の色。名前の付いた色（blue・pink・green …）の並びを作り、その固定の順で系列に当てる
const meta = {
  title: 'Design Review/659 グラフの系列の色',
  id: 'design-review-659-chart-series-colors',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A2' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'A2', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

type Series = [name: string, hex: string];

/** 案ごとの色の並び。この順で系列 1・2・3 … に当てる */
const seriesOf: Record<string, Series[]> = {
  現行版: [
    ['sky-500', '#009edf'],
    ['pink-500', '#f53273'],
    ['success-700', '#008132'],
    ['warning-700', '#727200'],
    ['blue-600', '#2474df'],
    ['red-700', '#ba012d'],
  ],
  A: [
    ['sky', '#009edf'],
    ['pink', '#f53273'],
    ['purple', '#9e6de7'],
    ['green', '#01a84d'],
    ['blue', '#4c87f8'],
    ['orange', '#d36d02'],
    ['teal', '#04a19b'],
    ['yellow', '#a58a07'],
  ],
  B: [
    ['sky', '#009edf'],
    ['pink', '#f53273'],
    ['green', '#018c3f'],
    ['purple', '#7a4aba'],
    ['orange', '#e47602'],
    ['teal', '#0aa39c'],
    ['blue', '#285cc2'],
    ['yellow', '#ae9203'],
  ],
  A2: [
    ['sky', '#009edf'],
    ['pink', '#f53273'],
    ['orange', '#d36d02'],
    ['teal', '#04a19b'],
    ['blue', '#4c87f8'],
    ['green', '#01a84d'],
    ['purple', '#9e6de7'],
    ['yellow', '#a58a07'],
  ],
  C: [
    ['sky', '#388fc0'],
    ['pink', '#be6879'],
    ['blue', '#6185c8'],
    ['green', '#519962'],
    ['purple', '#9076be'],
    ['orange', '#b97340'],
    ['teal', '#079a94'],
    ['yellow', '#9b852b'],
  ],
};

const tokensOf = (id: string) =>
  Object.fromEntries(seriesOf[id].map(([, hex], i) => [`--color-series-${i + 1}`, hex]));

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'いまのパレットをそのまま使う',
    intent:
      'グラフ用の色を足さず、いまある sky・pink・状態の色を並べる。6 色で止まり、成功・警告・危険の色が系列に混ざる。success-700 と warning-700 は明度も彩度も近く、色覚の型によっては見分けられない（検証: 隣どうしの差 ΔE 3.0 で不合格）',
    spec: [
      ['色の数', '6'],
      ['明度（OKLCH L）', '0.50〜0.66 でばらつく'],
      ['隣どうしの差', '色覚の型 3.0・ふつう 9.5（不合格）'],
    ],
    tokens: tokensOf('現行版'),
  },
  {
    id: 'A',
    name: '明度をそろえた 8 色',
    intent:
      'ブランドの sky-500・pink-500 を 1・2 番にし、残りの 6 色を同じ明度（L 0.64）・彩度 0.18 で作る。どの系列も同じ重さで見え、特定の系列だけが目立たない。並び順は、隣どうしが最も見分けやすい順を総当たりで選んだ',
    spec: [
      ['色の数', '8'],
      ['明度（OKLCH L）', '0.64 でそろえる'],
      ['彩度（C）', '0.18（出せない色は下げる）'],
      ['隣どうしの差', '色覚の型 14.5・ふつう 17.8'],
      ['白地との比', 'すべて 3:1 以上'],
    ],
    tokens: tokensOf('A'),
  },
  {
    id: 'A2',
    name: 'A の色で、並び順を直した 8 色',
    intent:
      '色は A と同じ。A の順では、3 番の紫が 1 番の水色と、4 番の緑が 2 番のピンクと、D 型（赤と緑が近く見える型）でほぼ同じに見える。折れ線や凡例では離れた番号の色も同時に並ぶので、先頭の 4 色はどの 2 色を比べても見分けられる順に並べ直した',
    spec: [
      ['色の数', '8'],
      ['明度（OKLCH L）', '0.64 でそろえる'],
      ['先頭 4 色のどの 2 色でも', '色覚の型 8.1 以上（A は 3.2）'],
      ['隣どうしの差', '色覚の型 8.6・ふつう 16.9'],
      ['白地との比', 'すべて 3:1 以上'],
    ],
    tokens: tokensOf('A2'),
  },
  {
    id: 'B',
    name: '明度に段差を付けた 8 色',
    intent:
      '1・2 番は A と同じ。残りは明るい色と暗い色を交互に置き（L 0.50〜0.68）、白黒で刷っても隣どうしを明るさで見分けられるようにする。そのぶん暗い紫・青が重く見え、系列の重さがそろわない',
    spec: [
      ['色の数', '8'],
      ['明度（OKLCH L）', '0.50〜0.68 を交互に'],
      ['彩度（C）', '0.17'],
      ['隣どうしの差', '色覚の型 9.7・ふつう 22.6'],
      ['白地との比', 'すべて 3:1 以上'],
    ],
    tokens: tokensOf('B'),
  },
  {
    id: 'C',
    name: '落ち着いた 8 色',
    intent:
      '明度は A と同じくそろえ（L 0.62）、彩度を 0.11 まで落とす。sky・pink もグラフ用にくすませる。ボタンやタグの鮮やかな色とぶつからず、表やカードの中で静かに見える。ブランドの色とは少し離れる',
    spec: [
      ['色の数', '8'],
      ['明度（OKLCH L）', '0.62 でそろえる'],
      ['彩度（C）', '0.11'],
      ['隣どうしの差', '色覚の型 11.2・ふつう 15.9'],
      ['白地との比', 'すべて 3:1 以上'],
    ],
    tokens: tokensOf('C'),
  },
];

const columns: Column[] = [
  { label: '並び', note: '上が色、下が白黒にしたとき（明度のそろい方）' },
  { label: '折れ線', note: '4 系列' },
  { label: '折れ線（D 型で見たとき）', note: '赤と緑が近く見える型のシミュレーション' },
  { label: '積み上げの棒', note: '5 系列' },
  { label: '小さなグラフ', note: 'Sparkline と BarList。1 系列は 1 番の色' },
];

const series = (i: number) => `var(--color-series-${i + 1})`;

function Swatches({ id }: { id: string }) {
  const list = seriesOf[id];
  const row = (gray: boolean) => (
    <div className="flex gap-1" style={gray ? { filter: 'grayscale(1)' } : undefined}>
      {list.map(([name], i) => (
        <span
          key={name}
          className="h-8 w-7 rounded-sm"
          style={{ background: series(i) }}
          title={name}
        />
      ))}
    </div>
  );
  return (
    <div className="flex w-[260px] flex-col gap-1.5">
      {row(false)}
      {row(true)}
      <div className="flex gap-1 text-[10px] leading-tight text-fg-subtle">
        {list.map(([name]) => (
          <span key={name} className="w-7 truncate text-center">
            {name.replace(/-\d+$/, '')}
          </span>
        ))}
      </div>
    </div>
  );
}

const lineData = [
  [12, 18, 15, 24, 28, 26, 34, 38],
  [20, 16, 22, 19, 25, 30, 27, 31],
  [8, 12, 10, 14, 13, 18, 22, 20],
  [26, 24, 28, 25, 22, 24, 20, 23],
];

function LineChart() {
  const w = 260;
  const h = 140;
  const max = 40;
  const x = (i: number) => 8 + (i * (w - 16)) / 7;
  const y = (v: number) => h - 20 - (v / max) * (h - 30);
  return (
    <div className="flex flex-col gap-2">
      <svg width={w} height={h} role="img" aria-label="折れ線の見本">
        {[0, 20, 40].map((v) => (
          <line
            key={v}
            x1={0}
            x2={w}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--color-surface-line)"
            strokeWidth={1}
          />
        ))}
        {lineData.map((d, s) => (
          <polyline
            key={s}
            points={d.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            fill="none"
            stroke={series(s)}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <Legend count={4} />
    </div>
  );
}

const barData = [
  [8, 6, 5, 4, 3],
  [10, 7, 4, 5, 2],
  [9, 8, 6, 3, 4],
  [12, 6, 7, 4, 3],
  [11, 9, 5, 6, 2],
  [14, 8, 6, 5, 4],
];

function StackedBars() {
  const h = 140;
  const unit = 3.6;
  return (
    <div className="flex flex-col gap-2">
      <svg width={260} height={h} role="img" aria-label="積み上げの棒の見本">
        <line x1={0} x2={260} y1={h - 1} y2={h - 1} stroke="var(--color-surface-line)" />
        {barData.map((d, b) => {
          let top = h - 1;
          return (
            <g key={b}>
              {d.map((v, s) => {
                const height = v * unit;
                top -= height;
                return (
                  <rect
                    key={s}
                    x={10 + b * 42}
                    y={top}
                    width={28}
                    height={Math.max(0, height - 2)}
                    fill={series(s)}
                    rx={s === d.length - 1 ? 3 : 0}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <Legend count={5} />
    </div>
  );
}

function Legend({ count }: { count: number }) {
  const labels = ['東京', '大阪', '福岡', '札幌', '那覇'];
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-muted">
      {labels.slice(0, count).map((label, i) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: series(i) }} />
          {label}
        </li>
      ))}
    </ul>
  );
}

const spark = [4, 6, 5, 8, 7, 9, 12, 10, 13, 15, 14, 18];

function SmallCharts() {
  const w = 120;
  const h = 32;
  const points = spark
    .map((v, i) => `${(i * w) / (spark.length - 1)},${h - 2 - (v / 18) * (h - 4)}`)
    .join(' ');
  const bars: [string, number][] = [
    ['記事', 1240],
    ['ドキュメント', 860],
    ['作品', 420],
  ];
  return (
    <div className="flex w-[260px] flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-fg-muted">今週の閲覧</span>
          <span className="text-xl font-bold tabular-nums">2,520</span>
        </div>
        <svg width={w} height={h} aria-hidden>
          <polyline
            points={points}
            fill="none"
            stroke={series(0)}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <ul className="flex flex-col gap-1.5">
        {bars.map(([label, v]) => (
          <li key={label} className="relative flex h-7 items-center justify-between px-2 text-sm">
            <span
              className="absolute inset-y-0 left-0 rounded-sm opacity-20"
              style={{ width: `${(v / 1240) * 100}%`, background: series(0) }}
            />
            <span className="relative">{label}</span>
            <span className="relative text-fg-muted tabular-nums">{v.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Candidates: Story = {
  name: '系列の色',
  render: ({ pick }) => (
    <>
      {/* D 型のシミュレーション（Machado ほか 2009、強さ 1.0）。feColorMatrix は線形の RGB で計算する */}
      <svg width={0} height={0} className="absolute" aria-hidden>
        <filter id="deutan" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>
      <Comparison
        index={659}
        axis="グラフの系列の色"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column, candidate) => {
          switch (column.label) {
            case '並び':
              return <Swatches id={candidate.id} />;
            case '折れ線':
              return <LineChart />;
            case '折れ線（D 型で見たとき）':
              return (
                <div style={{ filter: 'url(#deutan)' }}>
                  <LineChart />
                </div>
              );
            case '積み上げの棒':
              return <StackedBars />;
            default:
              return <SmallCharts />;
          }
        }}
      >
        <p>
          決定（ADR-0531）: A2（A の色で、並び順を直した 8 色）にする。青は、いまある blue-500
          と明度・彩度が同じなので、新しく作らずそれを使う。
        </p>
        <p>
          グラフの系列（東京・大阪 …）に当てる色を決めます。blue・pink・green
          のような名前の付いた色の並びを作り、グラフは決まった順でそこから色を取ります。同じ色の名前を、あとでボタンやタグの色（`color`）にも使えるようにします。成功・警告・危険の色は意味を持つので、系列には使いません。
        </p>
        <p>
          どの案も、隣どうしの色が色覚の型によらず見分けられるか、白地で 3:1
          以上あるかを測って通しています（現行版だけが落ちます）。9
          系列目以降は色を作らず、「その他」にまとめる前提です。
        </p>
        <p>
          おすすめは A（明度をそろえた 8 色）です。ブランドの水色とピンクをそのまま 1・2
          番に使え、どの系列も同じ重さで見えるので、「整然」と「人懐っこい」の両方に合います。B
          は白黒で刷っても読めますが、紫・青が重く沈みます。C
          は静かですが、ブランドの色から離れます。
        </p>
        <p>
          A2 は A と同じ色で、並び順だけを直したものです。A の順では、折れ線の 1 番と 3
          番（水色と紫）が、D 型で見るとほぼ同じ線になります。先頭の 4 色までは、どの 2
          色でも見分けられます。5
          色を超えると、明度をそろえた並びではどの順でも見分けにくい組が出るので、凡例・線の端のラベル・hover
          の数値を色と一緒に出す前提にします。
        </p>
        <p>
          既定にする案と、ほかに選べるようにしたい案（たとえば「A2 を既定にして、C
          も選べる」）を教えてください。
        </p>
      </Comparison>
    </>
  ),
};
