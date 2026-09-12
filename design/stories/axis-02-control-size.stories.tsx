import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 02: マウス用の寸法（principles.md 原則11）
// 変えるのはマウス用（fine）の高さと文字の大きさだけ。指用（coarse）の 44px は実機で別に詰める
// 行ごとに密度を固定し、--size-control-fine などを上書きして比べる

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '36px',
    intent: '前半から仮に置いていた値。',
    density: 'fine',
    spec: [
      ['高さ', '36px'],
      ['文字', '14px'],
      ['指用との差', '8px'],
    ],
    tokens: { '--size-control-fine': '36px', '--text-control-fine': '14px' },
  },
  {
    id: 'A',
    name: '38px',
    intent: '2px だけ上げる。指用との差を大きく残す。',
    density: 'fine',
    spec: [
      ['高さ', '38px'],
      ['文字', '14px'],
      ['指用との差', '6px'],
    ],
    tokens: { '--size-control-fine': '38px', '--text-control-fine': '14px' },
  },
  {
    id: 'B',
    name: '40px',
    intent: 'マウス向けの UI でよく使われる高さ。文字は 14px のまま。',
    density: 'fine',
    spec: [
      ['高さ', '40px'],
      ['文字', '14px'],
      ['指用との差', '4px'],
    ],
    tokens: { '--size-control-fine': '40px', '--text-control-fine': '14px' },
  },
  {
    id: 'C',
    name: '40px・文字 15px',
    intent: '40px にしたうえで、文字も 15px に上げる。欄の高さと文字の比率を、現行版に近づける。',
    density: 'fine',
    spec: [
      ['高さ', '40px'],
      ['文字', '15px'],
      ['指用との差', '4px'],
    ],
    tokens: { '--size-control-fine': '40px', '--text-control-fine': '15px' },
  },
  {
    id: 'D',
    name: '42px',
    intent: '指用とほぼ同じ高さ。密度の切り替えで変わるのは、ほぼ文字の大きさだけになる。',
    density: 'fine',
    spec: [
      ['高さ', '42px'],
      ['文字', '14px'],
      ['指用との差', '2px'],
    ],
    tokens: { '--size-control-fine': '42px', '--text-control-fine': '14px' },
  },
  {
    id: '参考',
    name: '指用 44px',
    intent:
      '比べるための基準で、選ぶ対象ではありません。指用の値は、実機で指で押して別に詰めます。',
    density: 'coarse',
    spec: [
      ['高さ', '44px'],
      ['文字', '16px'],
    ],
  },
];

const columns: Column[] = [
  { label: 'フォーム', note: '縦に並べたとき' },
  { label: '絞り込み', note: '横に並べたとき' },
];

const kinds = [
  { label: 'お仕事のご相談', value: 'work' },
  { label: '取材のお願い', value: 'interview' },
  { label: 'その他', value: 'other' },
];

const orders = [
  { label: '新しい順', value: 'new' },
  { label: '古い順', value: 'old' },
];

const Form = () => (
  <div className="flex flex-col gap-5">
    <TextField label="お名前" defaultValue="山田 花子" />
    <TextField
      label="メールアドレス"
      defaultValue="hanako@example.com"
      caption="返信先になります"
    />
    <Select label="お問い合わせの種類" items={kinds} defaultValue="work" />
  </div>
);

const Filters = () => (
  <div className="grid grid-cols-[2fr_1fr] gap-3">
    <TextField label="キーワード" placeholder="タイトルや本文で絞り込む" />
    <Select label="並び順" items={orders} defaultValue="new" />
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/02 マウス用の寸法',
  id: 'design-review-02-control-size',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B' },
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
      index={2}
      axis="マウス用の寸法"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => (column.label === 'フォーム' ? <Form /> : <Filters />)}
    >
      <p>
        <strong className="text-fg">決定: B 40px</strong>（ADR-0020）。「B かなあと思いました。」
      </p>
      <p>
        マウスで操作するとき（パソコン）の、入力欄の高さを選びます。軸 01
        のときのメモ「パソコン版の入力欄とかの高さがちょっと低すぎるかもなと思いました」を受けた軸です。ボタンも同じ高さになります。
      </p>
      <p>
        このシステムの存在理由は、デスクトップでもモバイルでも、それぞれに適した密度にすることです。マウス用を高くするほど指用（44px）との差は小さくなり、デスクトップで密度を上げる効果も小さくなります。
      </p>
      <p>
        一番下の「参考」は指用の 44px
        です。画面を拡大・縮小せず、等倍で見てください。どの行も密度を固定しているので、ツールバーの「密度」はこの比較には効きません。Select
        の選択肢を開いたときの高さは、どの案も現行版のままです。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
