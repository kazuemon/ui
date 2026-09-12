import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 04: 入力欄の hover（principles.md 原則3と原則2の食い違い）
// 変えるのは hover 中の塗り（--color-field-hover）だけ。hover に枠線は使わない（原則3で固定）
// 色はどれも --color-field（#F2F4F4）の明度だけを下げたもの

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '一段濃く',
    intent: '原則3のまま。背景が一段濃くなる（明度 −0.022）。',
    spec: [
      ['hover の塗り', '#EBEDED'],
      ['通常との比', '1.07:1'],
    ],
    tokens: { '--color-field-hover': '#ebeded' },
  },
  {
    id: 'A',
    name: '変えない',
    intent:
      'hover では見た目を変えず、カーソルの形だけで反応する。明度で状態を表さないので、原則2との食い違いがなくなる。',
    spec: [
      ['hover の塗り', '変えない'],
      ['通常との比', '1:1'],
    ],
    tokens: { '--color-field-hover': 'var(--color-field)' },
  },
  {
    id: 'B',
    name: '半段',
    intent: '変化を現行版の半分にする（明度 −0.011）。反応はあるが、ほとんど気づかない程度。',
    spec: [
      ['hover の塗り', '#EEF0F0'],
      ['通常との比', '1.04:1'],
    ],
    tokens: { '--color-field-hover': '#eef0f0' },
  },
  {
    id: 'C',
    name: '二段',
    intent: '変化を現行版の約2倍にする（明度 −0.045）。マウスを載せたことがはっきり分かる。',
    spec: [
      ['hover の塗り', '#E3E5E5'],
      ['通常との比', '1.15:1'],
    ],
    tokens: { '--color-field-hover': '#e3e5e5' },
  },
];

const columns: Column[] = [
  { label: '通常', note: 'マウスを載せると、実際の動きを確かめられます' },
  { label: 'hover 中', note: 'マウスを載せた見た目を固定して表示しています', preview: 'hover' },
];

const kinds = [
  { label: 'お仕事のご相談', value: 'work' },
  { label: '取材のお願い', value: 'interview' },
  { label: 'その他', value: 'other' },
];

const Fields = () => (
  <div className="flex flex-col gap-5">
    <TextField label="お名前" defaultValue="山田 花子" caption="本名でなくてもかまいません" />
    <Select label="お問い合わせの種類" items={kinds} defaultValue="work" />
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/04 入力欄の hover',
  id: 'design-review-04-field-hover',
  parameters: {
    layout: 'fullscreen',
    pseudo: { hover: ['[data-preview="hover"] [data-slot="control"]'] },
  },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={4}
      axis="入力欄の hover"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Fields />}
    >
      <p>
        <strong className="text-fg">決定: B 半段</strong>
        （ADR-0022）。「hover は状態ではなく手応えという原則に揃えてよいです。変わり方は B で。」
      </p>
      <p>
        入力欄にマウスを載せたときの見た目を選びます。原則3は「平らな要素の hover
        は背景が一段濃くなる」としていますが、原則2は「明度を変えて状態を表さない」としていて、食い違っています。
      </p>
      <p>
        候補は hover 中の塗りの濃さだけを変えています。hover
        に枠線は使いません（原則3で固定）。エラーの欄は、hover でも塗りを変えません（ADR-0021）。
      </p>
      <p>
        A を選ぶと、入力欄は hover で見た目が変わらず、カーソルの形だけで反応します。現行版・B・C
        を選ぶと、「hover
        は状態ではなく手応えなので、明度で表してよい」という例外を原則に書きます。平らなボタンやリンクの
        hover は、ボタンを作るときに別に決めます。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
