import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 07: 白いボタンの輪郭（principles.md 原則1、design/adr/0024）
// 変えるのは輪郭の色（--color-surface-line）と太さ（--surface-line-width）だけ。塗り（面）と影はどの案も同じ
// 輪郭の色は、中立色の明度だけを下げたもの。「白地との比」は輪郭の色と白地のコントラスト比

const candidates: Candidate[] = [
  {
    id: 'A',
    name: '細い線',
    intent: '細い境界線（--color-line）と同じ色。最も軽い。',
    spec: [
      ['輪郭の色', '#DEE0E1'],
      ['太さ', '1px'],
      ['白地との比', '1.32:1'],
    ],
    tokens: { '--color-surface-line': '#dee0e1', '--surface-line-width': '1px' },
  },
  {
    id: 'B',
    name: '少し濃い線',
    intent: '線の色を少し濃くする（明度 0.86）。',
    spec: [
      ['輪郭の色', '#CFD1D2'],
      ['太さ', '1px'],
      ['白地との比', '1.53:1'],
    ],
    tokens: { '--color-surface-line': '#cfd1d2', '--surface-line-width': '1px' },
  },
  {
    id: 'C',
    name: '太い線',
    intent: 'A と同じ色で、太さを枠線のボタンと揃える（1.5px）。',
    spec: [
      ['輪郭の色', '#DEE0E1'],
      ['太さ', '1.5px'],
      ['白地との比', '1.32:1'],
    ],
    tokens: { '--color-surface-line': '#dee0e1', '--surface-line-width': '1.5px' },
  },
  {
    id: 'D',
    name: 'はっきりした線',
    intent: '白地との比を 3:1 にした色。入力欄の枠線と同じ基準で、輪郭がはっきり見える。',
    spec: [
      ['輪郭の色', '#939596'],
      ['太さ', '1px'],
      ['白地との比', '3.01:1'],
    ],
    tokens: { '--color-surface-line': '#939596', '--surface-line-width': '1px' },
  },
];

const columns: Column[] = [
  { label: '白い地の上', note: 'グレーのボタン・枠線のボタンと並べる' },
  { label: 'グレーの面の上', note: '入力欄と同じグレーの面に置く' },
];

const Buttons = () => (
  <div className="flex flex-wrap gap-3">
    <Button>保存する</Button>
    <Button color="surface">キャンセル</Button>
    <Button color="neutral">キャンセル</Button>
    <Button appearance="outline">下書きに保存</Button>
  </div>
);

const OnGray = () => (
  <div className="rounded-card bg-field p-4">
    <Buttons />
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/07 白いボタンの輪郭',
  id: 'design-review-07-surface-button',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={7}
      axis="白いボタンの輪郭"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (column.label === '白い地の上' ? <Buttons /> : <OnGray />)}
    >
      <p>
        <strong className="text-fg">決定: A 細い線</strong>
        （ADR-0025）。D（3:1 の輪郭）は選択肢として残します。「ものとしては A
        がこのみです。Bだと極端に浮き出ているように見えました。D
        も選択肢としてはありで、選べるようにしてもいいと思いました。」
      </p>
      <p>
        軸 06
        で加えることにした白いボタン（各行の2つ目の「キャンセル」）の輪郭を選びます。白い地の上では影だけでは区別がつかないため、影に加えて輪郭を付けます（ADR-0024）。
      </p>
      <p>
        候補は輪郭の色と太さだけを変えています。塗りと影はどの案も同じです。隣のグレーのボタン、枠線のボタン（色の枠線・影なし）と見分けられるかも見てください。ボタンは押して確かめられます。
      </p>
      <p>
        D の輪郭だけが、白地との比
        3:1（入力欄の枠線と同じ基準）を満たします。ボタンは文字で押せることが分かるので、3:1
        は必須ではありません。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
