import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { Button } from '../../src/components/Button';
import { Tag } from '../../src/components/Tag';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';

// 後半の軸 20: Warning の扱い（principles.md 原則6・原則12）。1回目
// いまの黄色（--palette-warning-500 #EFF16B・--palette-warning-50 #FCFCE1）は値の層にだけあり、役割のトークンがない
// 白文字は 1.20:1 しかなく、Danger（--color-danger・--color-on-danger — adr/0023）と同じ使い方ができない
// 候補は、この中だけの役割トークン（下の --color-*warning*）を行ごとに上書きして作る
//   --color-warning / --color-on-warning       塗りのボタンの塗りと、その上の文字
//   --color-fg-warning                          白地に置く文字・枠線・アイコン（前景用）
//   --color-tag-warning / --color-on-tag-warning  タグ（淡い面＋同じ色相の濃い文字 — adr/0007・0028）
//   --color-warning-surface / --color-on-warning-surface / --color-warning-icon  お知らせの面・文字・アイコン
//   --color-warning-icon-fill                   三角のアイコンの中の塗り（C だけ黄色）
// 決定: A（adr/0038）。A の値は tokens.css の役割トークンになった（--color-warning-surface などお知らせ用の3つと
// --color-warning-icon-fill は、この中だけの名前のまま）
// タグは Tag の color="warning"（adr/0038 で足した）で描き、行ごとの上書きで各案の色にする。
// ボタンは部品に警告の色がない（adr/0038 で作らないと決めた）ので、色の変数を上書きして描く。入力欄の文言とお知らせはこの中で組む

const vars = (v: Record<`--${string}`, string>) => v as CSSProperties;

// 候補ごとの、トークンでは表せない違い
interface Shape {
  /** 警告の色の塗りのボタン・枠線のボタンを持つか */
  button: boolean;
  /** タグに三角のアイコンを付けるか（色で見分けられない案） */
  tagIcon: boolean;
}

const shapes: Record<string, Shape> = {
  現行版: { button: true, tagIcon: false },
  A: { button: true, tagIcon: false },
  B: { button: true, tagIcon: false },
  C: { button: false, tagIcon: false },
  D: { button: false, tagIcon: true },
};

// 黄色の色相（110°）で暗くしたオリーブ色。淡い黄色 #F3F5CE の上で 4.55:1、白地で 5.09:1
const olive = '#727200';
const paleYellow = '#f3f5ce';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '値の層の黄色をそのまま',
    intent:
      '役割がないので、黄色を Danger と同じ使い方で当てたもの。白文字も黄色の文字も、白地ではほとんど読めない。基準を満たさないが、この軸の理由を見せるために描いている。',
    spec: [
      ['塗り', '#EFF16B に白文字（1.20:1）'],
      ['文字・線', '#EFF16B（白地 1.20:1）'],
      ['タグ', '#FCFCE1 に #EFF16B（1.15:1）'],
      ['お知らせ', '#EFF16B に白文字（1.20:1）'],
    ],
    tokens: {
      '--color-warning': '#eff16b',
      '--color-on-warning': '#ffffff',
      '--color-fg-warning': '#eff16b',
      '--color-tag-warning': '#fcfce1',
      '--color-on-tag-warning': '#eff16b',
      '--color-warning-surface': '#eff16b',
      '--color-on-warning-surface': '#ffffff',
      '--color-warning-icon': '#ffffff',
      '--color-warning-icon-fill': 'none',
    },
  },
  {
    id: 'A',
    name: '黄色の塗りに濃紺の文字',
    intent:
      '黄色 #EFF16B を塗りに残し、上に載せる文字を濃紺にする（原則12の「文字を濃紺グレーにする」）。白地に置く文字と枠線は、同じ色相で暗くしたオリーブ色。黄色の塗りと白地の比は 1.20:1 で、グレーのボタンと同じく影の輪郭で縁を出す。',
    spec: [
      ['塗り', '#EFF16B に濃紺 #1F2F37（11.49:1）'],
      ['文字・線', `${olive.toUpperCase()}（白地 5.09:1）`],
      ['タグ', `#F3F5CE に ${olive.toUpperCase()}（4.55:1）`],
      ['お知らせ', '#EFF16B に濃紺（11.49:1）'],
    ],
    tokens: {
      '--color-warning': '#eff16b',
      '--color-on-warning': 'var(--color-fg)',
      '--color-fg-warning': olive,
      '--color-tag-warning': paleYellow,
      '--color-on-tag-warning': olive,
      '--color-warning-surface': '#eff16b',
      '--color-on-warning-surface': 'var(--color-fg)',
      '--color-warning-icon': 'var(--color-fg)',
      '--color-warning-icon-fill': 'none',
    },
  },
  {
    id: 'B',
    name: '黄土に白文字',
    intent:
      '色相を黄土（80°）に寄せて暗くし、Danger と同じく白文字を載せる。黄色の色相のまま暗くすると、オリーブ色になって注意の色に見えにくいため。Danger との明度の差は、Danger とピンクの差と同じ 1.48:1。ピンクと青とは明度が同じで、色相だけで見分ける。',
    spec: [
      ['塗り', '#9C6E01 に白文字（4.52:1）'],
      ['文字・線', '#9C6E01（白地 4.52:1）'],
      ['タグ', '#FDF0DC に #916600（4.55:1）'],
      ['お知らせ', '#FDF0DC に濃紺（12.29:1）・アイコン 4.02:1'],
      ['Danger との比', '1.48:1'],
      ['ピンク・青との比', '1.00:1'],
    ],
    tokens: {
      '--color-warning': '#9c6e01',
      '--color-on-warning': '#ffffff',
      '--color-fg-warning': '#9c6e01',
      '--color-tag-warning': '#fdf0dc',
      '--color-on-tag-warning': '#916600',
      '--color-warning-surface': '#fdf0dc',
      '--color-on-warning-surface': 'var(--color-fg)',
      '--color-warning-icon': '#9c6e01',
      '--color-warning-icon-fill': 'none',
    },
  },
  {
    id: 'C',
    name: '淡い面だけ',
    intent:
      '強い塗りは持たず、淡い黄色の面に同じ色相の濃い文字とアイコンを載せる（タグの塗り方と同じ — ADR-0007）。#EFF16B は、三角のアイコンの中の塗りにだけ残す。警告の色のボタンは作らない。',
    spec: [
      ['塗り', '持たない'],
      ['文字・線', `${olive.toUpperCase()}（白地 5.09:1）`],
      ['タグ', `#F3F5CE に ${olive.toUpperCase()}（4.55:1）`],
      ['お知らせ', '#F3F5CE に濃紺（12.34:1）・アイコン 4.55:1'],
      ['#EFF16B', 'アイコンの中の塗り（飾り）'],
    ],
    tokens: {
      '--color-fg-warning': olive,
      '--color-tag-warning': paleYellow,
      '--color-on-tag-warning': olive,
      '--color-warning-surface': paleYellow,
      '--color-on-warning-surface': 'var(--color-fg)',
      '--color-warning-icon': olive,
      '--color-warning-icon-fill': '#eff16b',
    },
  },
  {
    id: 'D',
    name: '色を持たない',
    intent:
      '警告の色を作らない。三角のアイコンとグレーで表し、強く止めたいときは Danger を使う。警告の色のボタンは作らない。タグは色で見分けられないので、アイコンを付ける。',
    spec: [
      ['塗り', '持たない'],
      ['文字・線', '濃紺 #1F2F37（白地 13.82:1）'],
      ['タグ', 'グレーのタグ＋アイコン（6.02:1）'],
      ['お知らせ', '#EFF0F1 に濃紺（12.11:1）'],
    ],
    tokens: {
      '--color-fg-warning': 'var(--color-fg)',
      '--color-tag-warning': 'var(--color-tag-neutral)',
      '--color-on-tag-warning': 'var(--color-on-tag-neutral)',
      '--color-warning-surface': 'var(--color-tag-neutral)',
      '--color-on-warning-surface': 'var(--color-fg)',
      '--color-warning-icon': 'var(--color-fg)',
      '--color-warning-icon-fill': 'none',
    },
  },
];

const columns: Column[] = [
  {
    label: 'ボタンとタグ',
    note: 'ボタンは左が警告（上書き）、右が Danger（削除）。タグは3つ目が警告',
  },
  {
    label: '入力欄のメッセージ',
    note: '上が警告、下がエラー。警告では欄は変えず、文言だけを変える',
  },
  { label: 'お知らせ', note: 'ページの上に出す注意書き。部品はまだないので、仮に組んでいる' },
];

// 三角の注意のアイコン（Phosphor の Warning）。文字と並ぶので Regular の線幅（ADR-0018）
// 中の塗りは --color-warning-icon-fill（C だけ黄色）
const WarningIcon = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={['shrink-0', className].filter(Boolean).join(' ')}
    style={{ strokeWidth: 'var(--icon-stroke)', ...style }}
  >
    <path
      d="M114.15,39.98,26.36,191.93a16,16,0,0,0,13.84,24H215.8a16,16,0,0,0,13.84-24L141.85,39.98a16,16,0,0,0-27.7,0Z"
      style={{ fill: 'var(--color-warning-icon-fill, none)' }}
    />
    <line x1="128" y1="104" x2="128" y2="144" />
    <circle cx="128" cy="180" r="12" fill="currentColor" stroke="none" />
  </svg>
);

// 警告の色のボタン。Button の色の変数（--button-fill・--button-text・--button-line）を上書きして描く
const warningFilled = vars({
  '--button-fill': 'var(--color-warning)',
  '--button-text': 'var(--color-on-warning)',
});
const warningOutline = vars({ '--button-line': 'var(--color-fg-warning)' });

const Buttons = ({ shape }: { shape: Shape }) =>
  shape.button ? (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button color="primary" style={warningFilled}>
          上書きする
        </Button>
        <Button color="danger">削除する</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button appearance="outline" color="primary" style={warningOutline}>
          上書きする
        </Button>
        <Button appearance="outline" color="danger">
          削除する
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-fg-subtle">警告の色のボタンは持たない</p>
      <div className="flex flex-wrap gap-3">
        <Button>上書きする</Button>
        <Button color="danger">削除する</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button appearance="outline">上書きする</Button>
        <Button appearance="outline" color="danger">
          削除する
        </Button>
      </div>
    </div>
  );

const Tags = ({ shape }: { shape: Shape }) => (
  <div className="flex flex-wrap gap-1.5">
    <Tag color="primary">公開中</Tag>
    <Tag>下書き</Tag>
    <Tag color="warning">
      {shape.tagIcon && <WarningIcon className="mr-1 -ml-0.5 size-3.5" />}
      期限まで3日
    </Tag>
    <Tag color="secondary">おすすめ</Tag>
  </div>
);

// 入力欄の下の警告の文言。Field のキャプションの位置に、アイコンと文言を置く
const WarningMessage = ({ children }: { children: string }) => (
  <span className="flex items-start gap-1" style={{ color: 'var(--color-fg-warning)' }}>
    <WarningIcon className="size-4" />
    {children}
  </span>
);

// 警告はキャプションの場所に仮に組んだので、キャプションを本体の下に置く（比べたときの見た目）
// Field のキャプションの既定は、あとで本体の上になった（design/adr/0041）
const Fields = () => (
  <div className="flex flex-col gap-5">
    <TextField
      label="表示名"
      defaultValue="かずえもん（Kazuya Miyamoto）"
      captionPlacement="bottom"
      caption={<WarningMessage>20文字を超えると、一覧では途中で切れます</WarningMessage>}
    />
    <TextField
      label="メールアドレス"
      defaultValue="kazu@"
      error="メールアドレスの形が正しくありません"
    />
  </div>
);

const Notice = () => (
  <div
    className="flex gap-3 rounded-control px-4 py-3"
    style={{
      backgroundColor: 'var(--color-warning-surface)',
      color: 'var(--color-on-warning-surface)',
    }}
  >
    <WarningIcon
      className="mt-0.5 size-(--size-icon)"
      style={{ color: 'var(--color-warning-icon)' }}
    />
    <div className="flex flex-col gap-0.5 text-sm leading-5">
      <p className="font-bold">メールアドレスが確認されていません</p>
      <p>確認するまで、お知らせのメールは届きません。</p>
    </div>
  </div>
);

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/20 Warning の扱い',
  id: 'design-review-20-warning',
  parameters: { layout: 'fullscreen' },
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
      index={20}
      axis="Warning の扱い"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const shape = shapes[candidate.id];
        if (column.label === 'ボタンとタグ')
          return (
            <div className="flex flex-col gap-5">
              <Buttons shape={shape} />
              <Tags shape={shape} />
            </div>
          );
        if (column.label === '入力欄のメッセージ') return <Fields />;
        return <Notice />;
      }}
    >
      <p>
        警告（Warning）の色を、どう使うかを選びます。いまの黄色 #EFF16B
        は値の層にだけあり、役割のトークンがありません。白文字を載せると 1.20:1 で、Danger（白文字
        6.71:1 — ADR-0023）と同じ使い方ができません。現行版の行は、あえてその使い方で描いています。
      </p>
      <p>
        警告が出てきそうな場所を並べました。Danger
        の隣のボタンとタグ、入力欄の下の文言、ページの上に出すお知らせです。入力欄の警告の文言とお知らせは、まだ部品がないので、このストーリーの中で仮に組んでいます。
      </p>
      <p>
        現行版を除き、どの案も文字は 4.5:1、アイコンと枠線は 3:1
        を満たします。比は各案の表にあります。警告は送信を止めないので、入力欄は枠線と塗りを変えず、下の文言だけを変えています。文言とお知らせには、どの案も三角のアイコンを付けています。
      </p>
      <p>
        Success（緑）と
        Info（青）の値も、まだ役割がありません。ここで決めた形を、あとで同じように当てはめる予定です。
      </p>
      <p>
        黄色を塗りに残すか（A）、黄土に変えて Danger
        と同じ扱いにするか（B）、淡い面だけにするか（C）、色を持たないか（D）を比べてください。判断の基準（軽い・やわらかい・整然・人懐っこい）に最も近い案を1つ選び、一言添えてください。
      </p>
    </Comparison>
  ),
};
