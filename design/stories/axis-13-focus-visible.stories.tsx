import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { CaretRightIcon } from '../../src/components/icons';
import { Link } from '../../src/components/Link';
import { Switch } from '../../src/components/Switch';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 13: キーボードで操作したときのフォーカス（focus-visible）。ボタン・リンク・トグルが対象
// 変えるのは次のトークンだけ（src/components/focus-styles.ts が読む）
//   線の種類（--focus-ring-style）、太さ（--focus-ring-width）、色（--color-focus-ring）
//   隙間（--focus-ring-offset）、出る前の隙間（--focus-ring-offset-rest）、動く長さ（--focus-ring-duration）
//   文字のリンクの角丸（--link-text-radius）: 線は角丸に沿うので、0px のままだと四角くなる
// 入力欄は原則2の枠線（クリックでも出る）のまま。参考として並べる

const blue = 'var(--color-focus)';

const ring = (
  width: string,
  color: string,
  offset: string,
  motion: { rest?: string; duration?: string } = {}
) => ({
  '--focus-ring-style': 'solid',
  '--focus-ring-width': width,
  '--color-focus-ring': color,
  '--focus-ring-offset': offset,
  '--focus-ring-offset-rest': motion.rest ?? offset,
  '--focus-ring-duration': motion.duration ?? '100ms',
  '--link-text-radius': '6px',
});

// E〜E5: B に動きを付けたもの。フォーカスが移ると、線が rest の隙間から 2px の位置へ寄ってくる
// 2回目は、寄り始める距離と長さの組み合わせを並べる。緩急は押下と同じ（速く動き始め、ゆっくり止まる）
const approach = (id: string, rest: string, duration: string, note: string): Candidate => ({
  id,
  name: `${rest} 外から寄る・${duration}`,
  intent: `B に動きを付ける。フォーカスが移ると、線が ${rest} 外から 2px の位置へ寄ってくる。${note}`,
  spec: [
    ['線', '2px・青（#2474DF、白地との比 4.53）'],
    ['隙間', '2px'],
    ['動き', `${rest} 外から寄る（${duration}）`],
    ['文字のリンクの角', '6px'],
  ],
  tokens: ring('2px', blue, '2px', { rest, duration }),
});

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ブラウザの既定',
    intent:
      '部品に何も指定していない状態。ブラウザの既定の線が出る。Chrome では濃い色と白の二重の線で、角丸に沿う。ブラウザによって見た目が違う。',
    spec: [
      ['線', 'ブラウザの既定'],
      ['隙間', 'なし'],
      ['動き', 'なし'],
      ['文字のリンクの角', '0px（四角い）'],
    ],
    tokens: {
      '--focus-ring-style': 'auto',
      '--focus-ring-width': '1px',
      '--color-focus-ring': '-webkit-focus-ring-color',
      '--focus-ring-offset': '0px',
      '--focus-ring-offset-rest': '0px',
      '--focus-ring-duration': '0ms',
      '--link-text-radius': '0px',
    },
  },
  {
    id: 'A',
    name: '入力欄と同じ（2px の青・隙間なし）',
    intent:
      '原則2の入力欄の枠線と同じ 2px の青を、輪郭にぴったり付ける。青いボタンとピンクのボタン（青との明度の比 1.00）では、線がボタンに溶けて見えにくい。枠線のボタンは枠線が太くなったように見える。',
    spec: [
      ['線', '2px・青（#2474DF、白地との比 4.53）'],
      ['隙間', 'なし'],
      ['動き', '色だけ 100ms でフェードイン'],
      ['文字のリンクの角', '6px'],
    ],
    tokens: ring('2px', blue, '0px'),
  },
  {
    id: 'B',
    name: '2px の青・2px 離す',
    intent:
      'A と同じ線を、輪郭から 2px 離して付ける。間に地の色が挟まるので、青いボタンでも線が見える。よく使われる形。',
    spec: [
      ['線', '2px・青（#2474DF、白地との比 4.53）'],
      ['隙間', '2px'],
      ['動き', '色だけ 100ms でフェードイン'],
      ['文字のリンクの角', '6px'],
    ],
    tokens: ring('2px', blue, '2px'),
  },
  {
    id: 'C',
    name: '2px の濃紺グレー・2px 離す',
    intent:
      'B の線を濃紺グレー（本文の色）にする。部品の色（青・ピンク・赤）に左右されない。入力欄の青い枠線とは別の扱いになる。',
    spec: [
      ['線', '2px・濃紺グレー（#1F2F37、白地との比 13.82）'],
      ['隙間', '2px'],
      ['動き', '色だけ 100ms でフェードイン'],
      ['文字のリンクの角', '6px'],
    ],
    tokens: ring('2px', 'var(--color-fg)', '2px'),
  },
  {
    id: 'D',
    name: '淡く太い青',
    intent:
      '青を 45% に透かした 4px の線を、輪郭にぴったり付ける。光が広がるようにやわらかく見える。白地との比は 1.87 で、原則12 の部品の基準（3:1）を満たさない。',
    spec: [
      ['線', '4px・淡い青（白地では #9CC0F1、白地との比 1.87）'],
      ['隙間', 'なし'],
      ['動き', '色だけ 100ms でフェードイン'],
      ['文字のリンクの角', '6px'],
    ],
    tokens: ring('4px', 'color-mix(in oklab, var(--color-focus) 45%, transparent)', '0px'),
  },
  approach('E', '6px', '150ms', '1回目の案。'),
  approach('E2', '4px', '100ms', '寄り始める距離を縮め、長さを入力欄の枠線と同じにする。'),
  approach('E3', '4px', '150ms', 'E の寄り始める距離だけを縮める。'),
  approach('E4', '6px', '100ms', 'E の長さだけを縮める。'),
  approach('E5', '3px', '100ms', 'E2 よりさらに近くから寄る。動きはわずか。'),
];

const columns: Column[] = [
  {
    label: '通常',
    note: 'Tab キーで順に動かして確かめられます。クリックでは線は出ません（入力欄を除く）',
  },
  {
    label: 'フォーカス中',
    note: 'キーボードでフォーカスした見た目を、すべての部品で固定しています',
    preview: 'focus',
  },
];

const Cell = () => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-wrap gap-3">
      <Button color="primary">保存する</Button>
      <Button color="secondary">応援する</Button>
      <Button>キャンセル</Button>
      <Button color="surface">共有</Button>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button appearance="outline" color="primary">
        下書きに保存
      </Button>
      <Button appearance="outline" color="danger">
        削除
      </Button>
      <Link appearance="outline" color="secondary" href="#more">
        More
        <CaretRightIcon />
      </Link>
    </div>
    <p className="text-sm leading-6">
      くわしくは
      <Link color="primary" href="#guide">
        使い方のページ
      </Link>
      をご覧ください。
    </p>
    <div className="flex flex-col">
      <Switch color="primary" label="お知らせを受け取る" defaultChecked />
      <Switch label="位置情報を使う" />
    </div>
    <TextField label="表示名（参考: 入力欄のフォーカス）" defaultValue="かずえもん" />
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/13 キーボード操作時のフォーカス',
  id: 'design-review-13-focus-visible',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      focusVisible: [
        '[data-preview="focus"] button',
        '[data-preview="focus"] a',
        '[data-preview="focus"] [role="switch"]',
      ],
      focusWithin: ['[data-preview="focus"] [data-slot="control"]'],
    },
  },
  args: { pick: 'B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E', 'E2', 'E3', 'E4', 'E5'],
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={13}
      axis="キーボード操作時のフォーカス"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Cell />}
    >
      <p>
        <strong className="text-fg">決定: B 2px の青・2px 離す</strong>
        （ADR-0031）。「いくつか比較しましたが B でよさそうです。」E〜E5
        の寄る動きは付けず、線の色だけを 100ms でフェードインします。
      </p>
      <p>
        <strong className="text-fg">2回目</strong>
        。1回目のメモ「個人的には B が好きで、アニメーションがある E
        でもいいのかなと思ってきました」「E の寄り方を 100ms, 4px
        からにするとどうでしょうか？いくつか組み合わせも見てみたいです」を受けて、E
        の寄り方（寄り始める距離と長さ）を変えた E2〜E5 を足しました。動きは「通常」の列で Tab
        キーを押して確かめてください。B も、線の色だけは 100ms でフェードインします。
      </p>
      <p>
        キーボード（Tab
        キー）で操作したときに、いまどこにいるかを示す線を選びます。対象はボタン・リンク・トグルです。クリックやタップでは出ません。入力欄は原則2のとおり、クリックでもキーボードでも
        2px の青い枠線が付くので、ここでは変えません（各セルの下に参考として置いています）。
      </p>
      <p>
        現行版は、部品に何も指定していない状態で、ブラウザの既定の線が出ます。Chrome
        では濃い色と白の二重の線です。
      </p>
      <p>
        A〜C は、線の色と隙間の組み合わせです。A は入力欄の枠線と同じ 2px
        の青を、隙間なしで付けます。B は同じ線を 2px 離して付けます。C
        は線を濃紺グレー（本文の色）にして、部品の色に左右されないようにします。原則2の「状態は枠線で表す」をそのまま流用するのが
        A・B、別の扱いにするのが C です。
      </p>
      <p>
        D は、淡い青の太い線で、やわらかく見せる案です。白地との比が 1.87
        で、部品の基準（3:1）を満たしません。E〜E5 は B
        に動きを付けた案で、線が外から寄ってきます。緩急は押下と同じで、速く動き始めてゆっくり止まります。
      </p>
      <p>
        A〜E では、文字のリンクの角を 6px にしています。いまの 0px
        のままだと、線が四角くなるためです。
      </p>
      <p>
        判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
