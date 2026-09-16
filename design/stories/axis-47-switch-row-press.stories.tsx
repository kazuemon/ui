import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch, type SwitchFrame } from '../../src/components/Switch';
import { type Candidate, type Column, Comparison } from './Comparison';
import {
  keepSwitchCaptionAsCompared,
  keepToggleColorAsCompared,
  switchGroupedAsComparedCss,
} from './pins';

// 後半の軸 47: 行全体を押せるトグル（Switch の frame）で、行の背景が押したときにどう変わるか
// いまは hover で淡いグレーが 100ms で入り、押すともう一段濃く（100ms）、離すと戻る（100ms）。
// クリックは 100ms ほどで終わるので、面の大きい行が「濃くなって戻る」を一瞬で繰り返し、明滅に見える
// また OFF のトラック（#EFF0F1）は hover の塗り（#F2F4F4）とほぼ同じ色で、hover で溶け、押すと浮き上がる
// 案は次のトークン（src/components/Switch.tsx が読む）だけで作る。どの行も全部を明示する
//   --color-switch-row-hover: hover の塗り
//   --switch-row-press-darken: 押しているあいだ、hover の塗りに混ぜる本文の色の割合（0% なら hover と同じ）
//   --switch-row-duration: 塗りが hover で入る・抜ける長さと、離して戻る長さ（CSS では同じ長さになる）
//   --switch-row-press-duration: 押して塗りが変わる長さ
//   --color-switch-row-off: 行の中の OFF のトラック
// 行の形（線・囲み・余白）は軸 46 の値のまま。この軸では変えない
// 囲み（grouped）は軸 46 で採らなかったので部品から消した。frame="divided" の行に pins.tsx の CSS を当てて、比べたときの見た目で描く

type ComparedFrame = SwitchFrame | 'grouped';

const frameLook = {
  '--switch-row-line-width': '1px',
  '--color-switch-row-line': 'var(--color-line)',
  '--switch-row-radius': 'var(--radius-control)',
  '--switch-group-radius': 'var(--radius-card)',
  '--switch-row-gap': '8px',
  '--switch-row-pad-y': '8px',
  '--color-switch-row-hover': 'var(--color-select-item-highlight)',
  '--switch-track-rows': '1 / 2',
  '--switch-gap': '12px',
};

const principle =
  '原則3（hover は手応え、押すと沈む。指では押したときの変化を hover より明らかに）';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '押すともう一段濃く、100ms で入って戻る',
    intent:
      'hover で淡いグレーが 100ms で入り、押すともう一段濃く（100ms）、離すと 100ms で戻る。クリックは 100ms ほどなので、行全体が「濃くなって戻る」を一瞬で繰り返す。',
    spec: [
      ['hover の塗り', '入力欄の塗り #F2F4F4（明度 0.966）'],
      ['押下の塗り', 'hover に本文の色を 8% 混ぜる #DFE3E3（明度 0.913）'],
      ['動きの長さ', 'hover の入り・抜け 100ms、押す 100ms、戻り 100ms'],
      [
        'OFF のトラック',
        '#EFF0F1。地と 1.14:1、hover の塗りと 1.03:1（溶ける）、押下の塗りと 1.13:1（トラックのほうが明るく浮く）',
      ],
      [
        '原則との関係',
        `${principle}に沿って押すと濃くなるが、面が大きいので短いクリックでは明滅に見える`,
      ],
    ],
    tokens: {
      ...frameLook,
      '--switch-row-press-darken': '8%',
      '--switch-row-duration': '100ms',
      '--switch-row-press-duration': '100ms',
      '--color-switch-row-off': 'var(--color-switch-off)',
    },
  },
  {
    id: 'A',
    name: '押しても濃くしない',
    intent:
      '押しているあいだも hover と同じ塗り。押したことはノブの縮みで伝える。指で操作するときは hover がないので、押した瞬間に行が塗られる（押すときの動きは 0ms）。',
    spec: [
      ['hover の塗り', '#F2F4F4（明度 0.966）'],
      ['押下の塗り', 'hover と同じ #F2F4F4（混ぜない 0%）。ノブは今と同じく縮む'],
      ['動きの長さ', 'hover の入り・抜け 100ms、押す 0ms（指で押すと塗りがすぐ出る）、戻り 100ms'],
      [
        'OFF のトラック',
        '#EFF0F1。地と 1.14:1、hover・押下の塗りと 1.03:1（溶けたまま。押しても浮き上がらない）',
      ],
      [
        '原則との関係',
        `${principle}のうち、マウスでは行は沈まず、ノブの縮みだけが押した手応え（一覧の項目と同じく、行の塗りは hover の反応）。指では hover がないので、塗りが出ることが押したときの変化になる`,
      ],
    ],
    tokens: {
      ...frameLook,
      '--switch-row-press-darken': '0%',
      '--switch-row-duration': '100ms',
      '--switch-row-press-duration': '0ms',
      '--color-switch-row-off': 'var(--color-switch-off)',
    },
  },
  {
    id: 'B',
    name: '濃くするが、動かさない',
    intent:
      '押すともう一段濃くするのは現行版と同じ。hover・押す・離すの塗りの変化を全部一瞬にする。途中の色を通らないので明滅ではなく、切り替わりははっきり見える。',
    spec: [
      ['hover の塗り', '#F2F4F4（明度 0.966）'],
      ['押下の塗り', 'hover に本文の色を 8% 混ぜる #DFE3E3（明度 0.913）'],
      ['動きの長さ', 'hover の入り・抜け 0ms、押す 0ms、戻り 0ms'],
      ['OFF のトラック', '現行版と同じ。hover の塗りと 1.03:1、押下の塗りと 1.13:1'],
      [
        '原則との関係',
        `${principle}の「押すと沈む」をそのまま残す。hover の入りも一瞬になり、入力欄（100ms）より硬い`,
      ],
    ],
    tokens: {
      ...frameLook,
      '--switch-row-press-darken': '8%',
      '--switch-row-duration': '0ms',
      '--switch-row-press-duration': '0ms',
      '--color-switch-row-off': 'var(--color-switch-off)',
    },
  },
  {
    id: 'C',
    name: '押すと一瞬で濃く、離すとゆっくり戻す',
    intent:
      '押すともう一段濃くするのは現行版と同じ。押したときは一瞬で濃くし、離したときだけ 200ms かけて戻す。戻りが長いので、濃くなって戻るのが明滅ではなく、ゆっくり引く形に見える。',
    spec: [
      ['hover の塗り', '#F2F4F4（明度 0.966）'],
      ['押下の塗り', 'hover に本文の色を 8% 混ぜる #DFE3E3（明度 0.913）'],
      [
        '動きの長さ',
        '押す 0ms、戻り 200ms。hover の入り・抜けも 200ms（CSS では戻りと同じ長さになる）',
      ],
      ['OFF のトラック', '現行版と同じ。hover の塗りと 1.03:1、押下の塗りと 1.13:1'],
      [
        '原則との関係',
        `${principle}の「素早く沈む」は押したときの 0ms で守る。戻りだけゆっくりで、hover の入りも少し遅くなる`,
      ],
    ],
    tokens: {
      ...frameLook,
      '--switch-row-press-darken': '8%',
      '--switch-row-duration': '200ms',
      '--switch-row-press-duration': '0ms',
      '--color-switch-row-off': 'var(--color-switch-off)',
    },
  },
  {
    id: 'D',
    name: 'A ＋ 行の中の OFF のトラックを一段濃く',
    intent:
      'A（押しても濃くしない）に加えて、行の中の OFF のトラックだけを一段濃いグレー（入力欄の前後の飾りと同じ）にし、hover の塗りに溶けないようにする。行の外（囲みなし）のトグルは変えない。',
    spec: [
      ['hover の塗り', '#F2F4F4（明度 0.966）'],
      ['押下の塗り', 'hover と同じ #F2F4F4（混ぜない 0%）'],
      ['動きの長さ', 'A と同じ。hover の入り・抜け 100ms、押す 0ms、戻り 100ms'],
      [
        'OFF のトラック',
        '行の中だけ #E1E3E4（明度 0.915）。地と 1.29:1、hover・押下の塗りと 1.17:1。現行版の押下の塗り（#DFE3E3）とは 1.01:1 で溶けるので、押して濃くする案とは組み合わせない',
      ],
      [
        '原則との関係',
        `${principle}は A と同じ。OFF のトラックを入力欄と同じグレーにする決まり（ADR-0011）の、行の中だけの例外になる`,
      ],
    ],
    tokens: {
      ...frameLook,
      '--switch-row-press-darken': '0%',
      '--switch-row-duration': '100ms',
      '--switch-row-press-duration': '0ms',
      '--color-switch-row-off': 'var(--color-field-addon)',
    },
  },
];

const columns: Column[] = [
  {
    label: 'マウス用・トグルが左',
    note: 'data-density="fine"。触って確かめる（部品の既定の start）',
  },
  {
    label: 'マウス用・トグルが右',
    note: 'data-density="fine"。触って確かめる（togglePlacement="end"）',
  },
  {
    label: '指用・トグルが左（幅 390px の画面）',
    note: 'data-density="coarse"。触って確かめる。画面の左右の余白 16px（区切り線は端まで）',
  },
  {
    label: '指用・トグルが右（幅 390px の画面）',
    note: 'data-density="coarse"。触って確かめる（togglePlacement="end"）',
  },
  {
    label: 'hover に固定',
    note: 'マウス用・トグルが左。2行目（OFF）と4行目（ON）を hover に固定',
    preview: 'hover',
  },
  {
    label: 'マウスで押しているあいだに固定',
    note: 'マウス用・トグルが左。2行目と4行目を hover と押下の両方に固定',
    preview: 'active',
  },
  {
    label: '指で押しているあいだに固定',
    note: 'data-density="coarse"・トグルが左。hover なしで押下だけに固定',
    preview: 'touch-active',
  },
];

// 2行目（OFF・キャプションあり）と4行目（ON・キャプションあり）を、状態を固定する列で固定する
const rows = [
  { label: 'お知らせを受け取る', defaultChecked: true },
  { label: 'プッシュ通知', caption: 'コメントがついたときに届きます', target: true },
  { label: '自動で再生する' },
  {
    label: 'メールで受け取る',
    caption: '新しい記事が公開されたときに届きます',
    defaultChecked: true,
    target: true,
  },
];

// 指用の列は幅 390px の画面なので、比較の枠の列の幅を、この列だけ中身の幅にする
const axisCss = `
[data-axis47] .overflow-x-auto > .grid {
  grid-template-columns: minmax(200px, 240px) repeat(2, minmax(260px, 1fr)) repeat(2, max-content) repeat(3, minmax(260px, 1fr)) !important;
}
`;

const GroupLabel = ({ children }: { children: string }) => (
  <p className="text-xs font-bold text-fg-subtle">{children}</p>
);

const List = ({ frame, placement }: { frame: ComparedFrame; placement: 'start' | 'end' }) => (
  <div
    data-axis47-list={frame}
    data-switch-grouped-as-compared={frame === 'grouped' || undefined}
    className="flex flex-col"
  >
    {rows.map((row) => (
      <Switch
        key={row.label}
        frame={frame === 'grouped' ? 'divided' : frame}
        togglePlacement={placement}
        label={row.label}
        caption={row.caption}
        defaultChecked={row.defaultChecked}
        className={row.target ? 'axis47-target' : undefined}
      />
    ))}
  </div>
);

const Cell = ({ column }: { column: Column }) => {
  const placement = column.label.includes('トグルが右') ? 'end' : 'start';
  if (column.label.startsWith('指用')) {
    // 幅 390px の画面。区切り線は画面の左右の端まで引く。囲みは画面の左右に 16px の余白
    return (
      <div
        data-density="coarse"
        className="box-content flex w-[390px] flex-col gap-3 rounded-[32px] border border-line bg-bg py-6"
      >
        <div className="px-4">
          <GroupLabel>区切り線（divided）</GroupLabel>
        </div>
        <List frame="divided" placement={placement} />
        <div className="flex flex-col gap-3 px-4 pt-3">
          <GroupLabel>囲み（grouped）</GroupLabel>
          <List frame="grouped" placement={placement} />
        </div>
      </div>
    );
  }
  return (
    <div
      data-density={column.preview === 'touch-active' ? 'coarse' : 'fine'}
      className="flex max-w-[320px] flex-col gap-3"
    >
      <GroupLabel>区切り線（divided）</GroupLabel>
      <List frame="divided" placement={placement} />
      <div className="flex flex-col gap-3 pt-3">
        <GroupLabel>囲み（grouped）</GroupLabel>
        <List frame="grouped" placement={placement} />
      </div>
    </div>
  );
};

interface ComparisonArgs {
  pick: string;
}

const meta = {
  title: 'Design Review/47 行の背景の押したときの変わり方',
  id: 'design-review-47-switch-row-press',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      hover: ['[data-preview="hover"] .axis47-target', '[data-preview="active"] .axis47-target'],
      active: [
        '[data-preview="active"] .axis47-target',
        '[data-preview="active"] .axis47-target label',
        '[data-preview="touch-active"] .axis47-target',
        '[data-preview="touch-active"] .axis47-target label',
      ],
    },
  },
  args: { pick: 'A' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）。使い分けるときはカンマで区切る',
      control: 'text',
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <div data-axis47>
      <style>{axisCss + switchGroupedAsComparedCss}</style>
      <Comparison
        index={47}
        axis="行の背景の押したときの変わり方"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => <Cell column={column} />}
      >
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0067）。A
          に決まりました。行全体を押せる形でも、押したときに行の背景を濃くしません。押したことはノブの縮みで伝えます。あわせて
          D の OFF
          のトラックの色を、行の中だけでなくどこでも既定にし、チェックボックス・ラジオの箱も同じ濃さにそろえました。
        </p>
        <p>
          かずえもんのメモ:「これ区切り線においても同様のちらつきが起こっていますか？テキストを押すとフォーカス色がちらついている気がします。」「線じゃなくて、押せるエリア全体の背景部分ですね」（軸
          46 の行全体を押せるトグル）
        </p>
        <p>
          測ったところ、文字を押してもフォーカスの線は出ていません。ちらついて見えるのは行の背景です。いまは
          hover で淡いグレーが 100ms で入り、押すともう一段濃く（100ms）、離すと 100ms
          で戻ります。クリックは 100ms
          ほどで終わるので、面の大きい行が「濃くなって戻る」を一瞬で繰り返し、明滅に見えます。もう1つ、OFF
          のトラックは hover の塗りとほぼ同じ色で、hover
          で溶け、押すと行のほうが濃くなってトラックが明るく浮かび上がります。
        </p>
        <p>
          ここで選ぶのは、行の背景の hover・押したとき・離したときの変わり方です。行の形は軸 46
          の比べている途中の形のうち、区切り線（divided）と囲み（grouped）で見ます。部品の見た目の既定は現行版のままです。
        </p>
        <p>
          列は、触って確かめるマウス用・指用（幅 390px
          の画面）の一覧（トグルが左と右）と、2行目（OFF）と4行目（ON）を
          hover・マウスで押しているあいだ・指で押しているあいだ（hover
          なし）に固定したものです。文字を短くクリックして、明滅して見えるかを比べてください。
        </p>
        <p>どれを既定にするかを一言添えてください。</p>
      </Comparison>
    </div>
  ),
};
