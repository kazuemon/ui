import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { Switch } from '../../src/components/Switch';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchAsCompared } from './pins';

// 後半の軸 11: Disabled の詰め（principles.md 原則1、design/adr/0026・0028）。4回目
// 変えるのは次のトークンだけ
//   押せない OFF のトグル: --switch-off-disabled-opacity、--color-switch-off-disabled（トラックの塗り）
//   押せないグレーの枠線のボタン: --outline-neutral-disabled-opacity、--color-outline-neutral-disabled-line（枠線）、
//     --color-outline-neutral-disabled-text（文字）、--color-outline-neutral-disabled-fill（塗り）、
//     --outline-neutral-disabled-line-width（枠線の太さ）
//   OFF のトグルの枠: --switch-off-line-width、--color-switch-off-line
//   OFF のトグルの塗り（押せるとき）: --color-switch-off
//   押せないグレーのトグル: --switch-neutral-disabled-opacity、--color-switch-neutral-on-disabled（ON のトラック）、
//     --color-switch-neutral-disabled-knob（ノブ）
// 押せない色のトグル（色を残して 40%）、グレーのボタン、色の枠線のボタンは ADR-0026 のまま
// 3回目までの A・E〜E3 は外した（G・H は A の押せないボタンを引き継ぐ）

const gray = { button: '#eff0f1', fill: '#e1e3e4', text: '#a3a5a6' };
const ring = '#cfd1d2';

// G・H の共通部分。押せないグレーの枠線のボタンは 1回目の A（枠線は残し、文字を薄いグレー）
const base = {
  '--switch-off-disabled-opacity': '1',
  '--color-switch-off-disabled': gray.fill,
  '--outline-neutral-disabled-opacity': '1',
  '--color-outline-neutral-disabled-line': 'var(--color-line)',
  '--color-outline-neutral-disabled-text': gray.text,
  '--color-outline-neutral-disabled-fill': 'transparent',
  '--outline-neutral-disabled-line-width': '1.5px',
  '--switch-off-line-width': '0px',
  '--color-switch-off-line': ring,
  '--color-switch-off': gray.button,
  '--switch-neutral-disabled-opacity': '1',
};

const g = {
  ...base,
  '--color-switch-neutral-on-disabled': gray.text,
  '--color-switch-neutral-disabled-knob': 'var(--color-surface)',
};
const h = {
  ...base,
  '--color-switch-neutral-on-disabled': gray.fill,
  '--color-switch-neutral-disabled-knob': gray.text,
};

const common: Candidate['spec'] = [
  ['OFF の塗り', '#EFF0F1（グレーのボタンと同じ）'],
  ['押せない枠線のボタン', '枠線 #DEE0E1・文字 #A3A5A6'],
];

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'すべて 40%',
    intent:
      'ADR-0026 のまま。押せないトグルは、ON も OFF も 40% に薄くする。OFF の塗りは入力欄のグレー（#F2F4F4）。',
    spec: [
      ['OFF の塗り', '#F2F4F4（入力欄のグレー）'],
      ['押せないグレーのトグル', 'ON・OFF とも 40%'],
      ['押せない枠線のボタン', '全体を 40%（文字は枠線の色）'],
      ['OFF の枠', 'なし'],
    ],
    tokens: {
      '--switch-off-disabled-opacity': '0.4',
      '--color-switch-off-disabled': 'var(--color-field)',
      '--outline-neutral-disabled-opacity': '0.4',
      '--color-outline-neutral-disabled-line': 'var(--color-line)',
      '--color-outline-neutral-disabled-text': 'var(--color-line)',
      '--color-outline-neutral-disabled-fill': 'transparent',
      '--outline-neutral-disabled-line-width': '1.5px',
      '--switch-off-line-width': '0px',
      '--color-switch-off-line': 'var(--color-line)',
      '--color-switch-off': 'var(--color-field)',
      '--switch-neutral-disabled-opacity': '0.4',
      '--color-switch-neutral-on-disabled': 'var(--color-fg-muted)',
      '--color-switch-neutral-disabled-knob': 'var(--color-surface)',
    },
  },
  {
    id: 'G',
    name: 'グレーのボタンと同じ（ON は濃いめのグレー）',
    intent:
      '押せないグレーのトグルを、薄くせずグレーにする。ON のトラックは #A3A5A6、OFF のトラックは #E1E3E4、ノブは白のまま。トラックの濃さでも ON と OFF が分かる。',
    spec: [
      ...common,
      ['押せないグレーのトグル', 'ON #A3A5A6・OFF #E1E3E4・ノブ白'],
      ['OFF の枠', 'なし'],
    ],
    tokens: g,
  },
  {
    id: 'G2',
    name: 'G＋OFF に枠',
    intent: 'G の OFF のトグルに、3回目の E2 の枠（1px #CFD1D2）を付ける。',
    spec: [
      ...common,
      ['押せないグレーのトグル', 'ON #A3A5A6・OFF #E1E3E4・ノブ白'],
      ['OFF の枠', '1px #CFD1D2'],
    ],
    tokens: { ...g, '--switch-off-line-width': '1px' },
  },
  {
    id: 'H',
    name: 'グレーのボタンと同じ（ノブを文字の色に）',
    intent:
      'グレーのボタンの「塗り #E1E3E4・文字 #A3A5A6」をそのまま写す。トラックは ON も OFF も #E1E3E4、ノブを #A3A5A6 にする。ON と OFF はノブの位置で分かる。',
    spec: [
      ...common,
      ['押せないグレーのトグル', 'トラック #E1E3E4・ノブ #A3A5A6'],
      ['OFF の枠', 'なし'],
    ],
    tokens: h,
  },
  {
    id: 'H2',
    name: 'H＋OFF に枠',
    intent: 'H の OFF のトグルに、3回目の E2 の枠（1px #CFD1D2）を付ける。',
    spec: [
      ...common,
      ['押せないグレーのトグル', 'トラック #E1E3E4・ノブ #A3A5A6'],
      ['OFF の枠', '1px #CFD1D2'],
    ],
    tokens: { ...h, '--switch-off-line-width': '1px' },
  },
];

const columns: Column[] = [
  { label: 'トグル', note: '上の2つが押せる。下の2つは押せない' },
  { label: 'ボタン', note: '各段の左が押せる、右が押せない。下の2段は ADR-0026 のまま' },
  { label: 'フォームで並べる', note: '押せない部品だけを並べる' },
];

const Switches = () => (
  <div className="flex flex-col">
    <Switch togglePlacement="end" color="neutral" label="お知らせを受け取る" defaultChecked />
    <Switch togglePlacement="end" color="neutral" label="返信をメールで受け取る" />
    <Switch
      togglePlacement="end"
      color="neutral"
      label="自動で保存する"
      caption="管理者が固定しています"
      defaultChecked
      disabled
    />
    <Switch
      togglePlacement="end"
      color="neutral"
      label="位置情報を使う"
      caption="この端末では使えません"
      disabled
    />
  </div>
);

const Buttons = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3">
      <Button appearance="outline" color="neutral">
        キャンセル
      </Button>
      <Button appearance="outline" color="neutral" disabled>
        キャンセル
      </Button>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button color="neutral">キャンセル</Button>
      <Button color="neutral" disabled>
        キャンセル
      </Button>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button appearance="outline" color="primary">
        下書きに保存
      </Button>
      <Button appearance="outline" color="primary" disabled>
        下書きに保存
      </Button>
    </div>
  </div>
);

const Form = () => (
  <div className="flex flex-col gap-4">
    <TextField label="会員番号" defaultValue="A-102938" caption="変更できません" disabled />
    <Switch
      togglePlacement="end"
      color="neutral"
      label="自動で保存する"
      caption="管理者が固定しています"
      defaultChecked
      disabled
    />
    <Switch
      togglePlacement="end"
      color="neutral"
      label="位置情報を使う"
      caption="この端末では使えません"
      disabled
    />
    <div className="flex flex-wrap gap-3">
      <Button appearance="outline" color="neutral" disabled>
        キャンセル
      </Button>
      <Button color="neutral" disabled>
        保存する
      </Button>
    </div>
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/11 Disabled の詰め',
  decorators: [keepSwitchAsCompared],
  id: 'design-review-11-disabled-refine',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'H' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'G', 'G2', 'H', 'H2'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={11}
      axis="Disabled の詰め"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => {
        if (column.label === 'トグル') return <Switches />;
        if (column.label === 'ボタン') return <Buttons />;
        return <Form />;
      }}
    >
      <p>
        <strong className="text-fg">決定: H グレーのボタンと同じ（ノブを文字の色に）</strong>
        （ADR-0029）。「H でよさそう。」OFF のトグルの枠は付けません。
      </p>
      <p>
        この軸の4回目です。3回目のメモ「gray disabled switch
        ですが、選択できないときは無効なボタンと同じ色合いにできますか？」「そのうえで、gray switch
        の背景色をちょっと濃くできますか？というかこれもグレーボタンと同じ感じになるかもです」を受けて、グレーのトグルをグレーのボタンに揃えた
        G・H を作りました。
      </p>
      <p>
        どの案も、押せる OFF
        の塗りをグレーのボタンの塗り（#EFF0F1）にし、押せないグレーのトグルを薄くせずグレーにします。グレーのボタンは「押せるとき
        #EFF0F1、押せないとき塗り #E1E3E4・文字 #A3A5A6」です。トグルには文字がないので、#A3A5A6 を
        ON のトラックに当てるか（G）、ノブに当てるか（H）で分けました。G2・H2 は、3回目の E2
        の枠を足したものです。
      </p>
      <p>
        OFF の塗りは、青やピンクのトグルにも共通です。押せない青・ピンクのトグルの ON は、ADR-0026
        のとおり色を残して 40% に薄くします。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
