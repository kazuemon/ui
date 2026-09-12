import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 06: グレーのボタンの塗り（principles.md の後半の軸「グレーボタンのコントラスト」）
// 変えるのはグレーのボタンの塗り（--color-neutral）だけ。影は前半の決定どおり（design/adr/0006）
// A〜C は中立色（--color-field と同じ色相・彩度）の明度だけを下げたもの

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '#EFF0F1',
    intent:
      '前半から変えていない値。白地との比は 1.14:1 で、入力欄の塗り（#F2F4F4）ともほぼ同じ濃さ。',
    spec: [
      ['塗り', '#EFF0F1'],
      ['白地との比', '1.14:1'],
    ],
    tokens: { '--color-neutral': '#eff0f1' },
  },
  {
    id: 'A',
    name: '少し濃く',
    intent: '明度 0.93。入力欄の塗りより、ひと目で分かる程度に濃くする。',
    spec: [
      ['塗り', '#E6E8E8'],
      ['白地との比', '1.23:1'],
    ],
    tokens: { '--color-neutral': '#e6e8e8' },
  },
  {
    id: 'B',
    name: '濃く',
    intent: '明度 0.91。',
    spec: [
      ['塗り', '#E0E2E2'],
      ['白地との比', '1.30:1'],
    ],
    tokens: { '--color-neutral': '#e0e2e2' },
  },
  {
    id: 'C',
    name: 'もっと濃く',
    intent: '明度 0.89。グレーのボタンだとはっきり分かる。',
    spec: [
      ['塗り', '#D9DBDB'],
      ['白地との比', '1.39:1'],
    ],
    tokens: { '--color-neutral': '#d9dbdb' },
  },
  {
    id: 'D',
    name: '白',
    intent:
      '塗りを白にし、影の輪郭だけで浮かせる。最も軽い。枠線のボタンとは、影の有無で見分ける。',
    spec: [
      ['塗り', '#FFFFFF'],
      ['白地との比', '1:1（影で浮かせる）'],
    ],
    tokens: { '--color-neutral': 'var(--color-surface)' },
  },
];

const columns: Column[] = [
  { label: 'ボタンを並べる', note: '塗りの青いボタンの隣' },
  { label: '入力欄と並べる', note: 'グレーの入力欄のすぐ横' },
];

const Buttons = () => (
  <div className="flex flex-wrap gap-3">
    <Button>保存する</Button>
    <Button color="neutral">キャンセル</Button>
  </div>
);

const WithField = () => (
  <div className="flex items-end gap-3">
    <TextField label="キーワード" placeholder="タイトルや本文で絞り込む" className="flex-1" />
    <Button color="neutral">検索</Button>
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/06 グレーのボタンの塗り',
  id: 'design-review-06-neutral',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={6}
      axis="グレーのボタンの塗り"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (column.label === 'ボタンを並べる' ? <Buttons /> : <WithField />)}
    >
      <p>
        <strong className="text-fg">決定: 現行版のまま</strong>
        （ADR-0024）。入力欄の横に付くものは prefix・suffix
        としてグレーにし、白いボタンは影に輪郭を加えて別の種類として作ります。
      </p>
      <p>
        色を持たないグレーのボタン（キャンセルなど、目立たせない操作）の塗りを選びます。今の塗り
        #EFF0F1 は白地との比が 1.14:1
        で、影の輪郭がなければ地に溶けます。入力欄の塗り（#F2F4F4）ともほぼ同じ濃さなので、入力欄のすぐ横に置くと、どちらが押せるものか分かりにくくなります。
      </p>
      <p>
        候補は塗りの濃さだけを変えています。影は前半の決定どおりです（ADR-0006）。D
        は塗りを白にして、影の輪郭だけで浮かせる案です。ボタンは押して確かめられます。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
