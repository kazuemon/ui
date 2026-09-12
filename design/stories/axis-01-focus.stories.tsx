import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select } from '../../src/components/Select';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 01: フォーカス時の変化量（principles.md 原則2）— design/adr/0019 で A に決定
// 変えるのは、フォーカスで何が変わるか（塗り・枠線の太さ）と、移り変わりの速さだけ
// 決まった後に tokens.css を更新しても同じ比較を再現できるよう、全案（現行版を含む）で軸の値を明示する

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '白＋2px の枠',
    intent: '前半から変えていない表し方。グレーの塗りが白に変わり、同時に 2px の青い枠が付く。',
    spec: [
      ['塗り', 'グレー → 白'],
      ['枠線', '2px'],
      ['移り変わり', '100ms'],
    ],
    tokens: {
      '--color-field-focus': 'var(--color-surface)',
      '--field-border-width': '2px',
      '--duration-field': '100ms',
    },
  },
  {
    id: 'A',
    name: '枠だけ',
    intent: '塗りはグレーのまま、2px の青い枠だけを足す。変わるのは枠線の1つだけ。',
    spec: [
      ['塗り', 'グレーのまま'],
      ['枠線', '2px'],
      ['移り変わり', '100ms'],
    ],
    tokens: {
      '--color-field-focus': 'var(--color-field)',
      '--field-border-width': '2px',
      '--duration-field': '100ms',
    },
  },
  {
    id: 'B',
    name: '白＋1px の枠',
    intent: '塗りと枠線の入れ替えは残し、枠を 1px に細くする。',
    spec: [
      ['塗り', 'グレー → 白'],
      ['枠線', '1px'],
      ['移り変わり', '100ms'],
    ],
    tokens: {
      '--color-field-focus': 'var(--color-surface)',
      '--field-border-width': '1px',
      '--duration-field': '100ms',
    },
  },
  {
    id: 'C',
    name: '枠だけ・1px',
    intent: '塗りはグレーのまま、1px の青い枠だけを足す。変化が最も小さい案。',
    spec: [
      ['塗り', 'グレーのまま'],
      ['枠線', '1px'],
      ['移り変わり', '100ms'],
    ],
    tokens: {
      '--color-field-focus': 'var(--color-field)',
      '--field-border-width': '1px',
      '--duration-field': '100ms',
    },
  },
  {
    id: 'D',
    name: 'ゆっくり',
    intent: '行き着く見た目は現行版と同じ。250ms かけて移り変わらせ、一気に変わる印象を和らげる。',
    spec: [
      ['塗り', 'グレー → 白'],
      ['枠線', '2px'],
      ['移り変わり', '250ms'],
    ],
    tokens: {
      '--color-field-focus': 'var(--color-surface)',
      '--field-border-width': '2px',
      '--duration-field': '250ms',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: 'クリックすると、実際の動きを確かめられます' },
  { label: 'フォーカス中', note: 'フォーカスした見た目を固定して表示しています', preview: 'focus' },
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
  title: 'Design Review/01 フォーカスの変化量',
  id: 'design-review-01-focus',
  parameters: {
    layout: 'fullscreen',
    pseudo: { focusWithin: ['[data-preview="focus"] [data-slot="control"]'] },
  },
  args: { pick: 'A' },
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
      index={1}
      axis="フォーカス時の変化量"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Fields />}
    >
      <p>
        <strong className="text-fg">決定: A 枠だけ</strong>
        （ADR-0019）。「枠は1px
        だとちょっと細すぎますね」「枠だけが良いかもです。ゆっくりだとちょっと操作できるまでにラグがあると思っちゃいそう」
      </p>
      <p>
        入力欄をクリックしたとき、見た目がどのくらい変わるのがよいかを選びます。ラウンド1のメモ「グレー背景から一気に白になってフォーカスリングが付くのはちょっとアニメーションとして大きすぎる」を受けた軸です。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。部分ごとに選んでもかまいません（例:「塗りは
        A、速さは D」）。
      </p>
      <p>
        A か C を選ぶと、原則2の「塗り ⇄
        枠線の入れ替え」は「枠線を足す」に変わります。参照画像のエラー表現（グレーの塗りのまま赤い枠）とは揃う方向です。エラー時の塗りは、後の軸で決めます。
      </p>
      <p>密度は、上のツールバーの「密度」で指用とマウス用を切り替えられます。</p>
    </Comparison>
  ),
};
