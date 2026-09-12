import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { Select } from '../../src/components/Select';
import { Switch } from '../../src/components/Switch';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 08: Disabled の表し方（principles.md 原則1）。2回目
// 影はどの案もなくす（原則1）。変えるのは次のトークンだけ。initial は「未設定」で、部品のもとの色のままになる
//   押すもの（ボタン・トグル）: --disabled-opacity、--color-disabled（塗り）、
//     --color-on-disabled（塗りの上の文字）、--color-disabled-fg（枠線のボタンの枠線と文字）
//   入力欄: --field-disabled-opacity、--color-field-disabled（塗り）、--color-on-field-disabled（文字）
//   ラベルとキャプション: --disabled-label-opacity
// 1回目の現行版（影をなくすだけ）と C（濃いグレー）は外した

const unset = {
  '--color-disabled': 'initial',
  '--color-on-disabled': 'initial',
  '--color-disabled-fg': 'initial',
  '--color-field-disabled': 'initial',
  '--color-on-field-disabled': 'initial',
  '--color-neutral-disabled': 'initial',
  '--color-on-neutral-disabled': 'initial',
} as const;

const gray = { fill: '#e1e3e4', text: '#a3a5a6' };

const candidates: Candidate[] = [
  {
    id: 'A',
    name: '全体を薄く（1回目）',
    intent: 'すべての部品を、ラベルとキャプションも含めて透明度 40% にする。',
    spec: [
      ['押すもの', '薄く（40%）'],
      ['入力欄', '薄く（40%）'],
      ['ラベル・キャプション', '薄く（40%）'],
    ],
    tokens: {
      ...unset,
      '--disabled-opacity': '0.4',
      '--field-disabled-opacity': '0.4',
      '--neutral-disabled-opacity': '0.4',
      '--disabled-label-opacity': '0.4',
    },
  },
  {
    id: 'B',
    name: '明るいグレー（1回目）',
    intent:
      'すべての部品の本体を、明るいグレーの塗りと薄いグレーの文字にする。トグルの色も消える。',
    spec: [
      ['押すもの', 'グレー'],
      ['入力欄', 'グレー'],
      ['ラベル・キャプション', 'そのまま'],
    ],
    tokens: {
      '--disabled-opacity': '1',
      '--field-disabled-opacity': '1',
      '--disabled-label-opacity': '1',
      '--color-disabled': gray.fill,
      '--color-on-disabled': gray.text,
      '--color-disabled-fg': gray.text,
      '--color-field-disabled': gray.fill,
      '--color-on-field-disabled': gray.text,
      '--neutral-disabled-opacity': '1',
      '--color-neutral-disabled': gray.fill,
      '--color-on-neutral-disabled': gray.text,
    },
  },
  {
    id: 'D',
    name: '押すものは薄く、入力欄はグレー',
    intent:
      '押すもの（ボタン・トグル）は薄くして色を残す。入力欄は色を持たないのでグレーにする。ラベルとキャプションは変えない。',
    spec: [
      ['押すもの', '薄く（40%）'],
      ['入力欄', 'グレー'],
      ['ラベル・キャプション', 'そのまま'],
    ],
    tokens: {
      ...unset,
      '--disabled-opacity': '0.4',
      '--field-disabled-opacity': '1',
      '--neutral-disabled-opacity': '0.4',
      '--disabled-label-opacity': '1',
      '--color-field-disabled': gray.fill,
      '--color-on-field-disabled': gray.text,
    },
  },
  {
    id: 'E',
    name: '本体だけ薄く',
    intent: 'A の薄くする範囲を、部品の本体だけにする。ラベルとキャプションは読めるまま。',
    spec: [
      ['押すもの', '薄く（40%）'],
      ['入力欄', '薄く（40%）'],
      ['ラベル・キャプション', 'そのまま'],
    ],
    tokens: {
      ...unset,
      '--disabled-opacity': '0.4',
      '--field-disabled-opacity': '0.4',
      '--neutral-disabled-opacity': '0.4',
      '--disabled-label-opacity': '1',
    },
  },
  {
    id: 'D2',
    name: 'D＋グレーのボタンは B（決定）',
    intent:
      'D に、グレーのボタンだけ B（明るいグレーの塗りと薄い文字）にする例外を足したもの。2回目の回答で決まった形。',
    spec: [
      ['押すもの', '薄く（40%）'],
      ['グレーのボタン', 'グレー'],
      ['入力欄', 'グレー'],
      ['ラベル・キャプション', 'そのまま'],
    ],
    tokens: {
      ...unset,
      '--disabled-opacity': '0.4',
      '--field-disabled-opacity': '1',
      '--neutral-disabled-opacity': '1',
      '--disabled-label-opacity': '1',
      '--color-field-disabled': gray.fill,
      '--color-on-field-disabled': gray.text,
      '--color-neutral-disabled': gray.fill,
      '--color-on-neutral-disabled': gray.text,
    },
  },
];

const columns: Column[] = [
  { label: 'ボタン', note: '上の段の左だけが押せる。ほかは押せない' },
  { label: '入力欄', note: '一番上だけが押せる。下の2つは押せない' },
  { label: 'トグル', note: '上の2つが押せる。下の2つは押せない' },
];

const kinds = [
  { label: 'お仕事のご相談', value: 'work' },
  { label: '取材のお願い', value: 'interview' },
  { label: 'その他', value: 'other' },
];

const Buttons = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3">
      <Button>保存する</Button>
      <Button disabled>保存する</Button>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button color="neutral" disabled>
        キャンセル
      </Button>
      <Button color="surface" disabled>
        キャンセル
      </Button>
      <Button appearance="outline" disabled>
        下書き
      </Button>
    </div>
  </div>
);

const Fields = () => (
  <div className="flex flex-col gap-4">
    <TextField label="お名前" defaultValue="山田 花子" />
    <TextField label="会員番号" defaultValue="A-102938" caption="変更できません" disabled />
    <Select label="お問い合わせの種類" items={kinds} defaultValue="work" disabled />
  </div>
);

const Switches = () => (
  <div className="flex flex-col">
    <Switch label="お知らせを受け取る" defaultChecked />
    <Switch label="返信をメールで受け取る" />
    <Switch label="自動で保存する" caption="管理者が固定しています" defaultChecked disabled />
    <Switch label="位置情報を使う" caption="この端末では使えません" disabled />
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/08 Disabled の表し方',
  id: 'design-review-08-disabled',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'D2' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'D', 'E', 'D2'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={8}
      axis="Disabled の表し方"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === 'ボタン' ? (
          <Buttons />
        ) : column.label === '入力欄' ? (
          <Fields />
        ) : (
          <Switches />
        )
      }
    >
      <p>
        <strong className="text-fg">決定: D＋グレーのボタンは B（D2）</strong>
        （ADR-0026）。「D ですね。例外として、グレーボタンの disabled
        はB（背景色と文字色の色が近くなる）がいいと思いました。E だと、変更できません
        というキャプションが無いと見た目だけでは伝わらないですね。」
      </p>
      <p>
        この軸の2回目です。1回目のメモ「現状は A が好みですが、B
        もよいですね。ただスイッチの色が失われるのは…」「A
        案の場合、テキスト欄やヘルプテキストがかなり見づらくなりますね。Input については
        B（テーマの概念が基本ないので）で、それ以外の色付きのものは A
        の薄くなる、とかになるんでしょうか」を受けて、D と E を足しました。
      </p>
      <p>
        D
        は「押すもの（ボタン・トグル）は薄くして色を残し、入力するもの（入力欄）はグレーにする。ラベルとキャプションは変えない」という規則です。色を持たないグレーのボタンと白いボタンも、押すものとして薄くします。グレーにすると、押せないほうが押せるものより濃く見えてしまうためです。
      </p>
      <p>
        E は、A の薄くする範囲を部品の本体だけにした案です。1回目の A
        でヘルプテキストが読みにくかったのは、ラベルとキャプションまで薄くしていたためです。A と B
        は1回目と同じ見た目です。1回目の現行版（影をなくすだけ）と C（濃いグレー）は外しました。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
