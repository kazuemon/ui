import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/Button';
import { Checkbox } from '../../src/components/Checkbox';
import { Switch } from '../../src/components/Switch';
import { TextField } from '../../src/components/TextField';
import { type Candidate, type Column, Comparison } from './Comparison';
import { keepSwitchCaptionAsCompared, keepToggleColorAsCompared } from './pins';

// 後半の軸 45: 指用のトグルの大きさ
// 指用のトラック（48×28・ノブ 22）と大きい指用（56×32・ノブ 26）は前半のキャンバスの値のまま。
// 指用にすると部品の高さは +10%、文字は +14% なのに、トグルの高さは +27% 伸びる
// 変えるのは次のトークンだけ（src/styles/globals.css の密度の解決と .coarse-large が --switch-w・-h・-knob に解決する）
//   --switch-w-coarse・--switch-h-coarse・--switch-knob-coarse
//   --switch-w-coarse-large・--switch-h-coarse-large・--switch-knob-coarse-large
// マウス用（-fine）と隙間（--switch-inset: 3px）は変えない。ノブはトラックの高さ − 3px × 2
// 幅と高さは偶数にする。ノブの位置（OFF 3px・ON 3px + 幅 − 高さ）が整数になる

const knob = (h: number) => h - 6;

interface Size {
  w: number;
  h: number;
}

const tokensOf = (coarse: Size, large: Size) => ({
  '--switch-w-coarse': `${coarse.w}px`,
  '--switch-h-coarse': `${coarse.h}px`,
  '--switch-knob-coarse': `${knob(coarse.h)}px`,
  '--switch-w-coarse-large': `${large.w}px`,
  '--switch-h-coarse-large': `${large.h}px`,
  '--switch-knob-coarse-large': `${knob(large.h)}px`,
});

const ratio = (value: number) => value.toFixed(2);

// 行ごとの spec。数値は寸法から計算する（手で書いた値と寸法がずれないように）
// iOS の設定のスイッチ（51×31pt）と Material 3（52×32dp）は、知識による値
const specOf = (coarse: Size, large: Size): Candidate['spec'] => {
  const overhang = (s: Size) => {
    const v = (s.h - 24) / 2;
    return v > 0 ? `${v}px はみ出す` : v === 0 ? '0px（そろう）' : `${-v}px 内側`;
  };
  const wcag = (s: Size) =>
    s.w >= 24 && s.h >= 24
      ? 'トラックだけで満たす'
      : `高さが ${24 - s.h}px 足りない（ラベルも押せるので例外に当たる）`;
  const platform = (s: Size) =>
    `iOS の ${ratio(s.w / 51)}×${ratio(s.h / 31)}・M3 の ${ratio(s.w / 52)}×${ratio(s.h / 32)} 倍`;
  // dt は短くする。dl の左の列は dt の長さで決まり、長いと dd が1文字ずつ折り返す
  return [
    [
      '指用',
      `${coarse.w}×${coarse.h}・ノブ ${knob(coarse.h)}（ON で ${coarse.w - coarse.h}px 滑る）`,
    ],
    [
      '大きい指用',
      `${large.w}×${large.h}・ノブ ${knob(large.h)}（ON で ${large.w - large.h}px 滑る）`,
    ],
    [
      '文字との比',
      `16px に対し、トラックの高さ ${ratio(coarse.h / 16)}・ノブ ${ratio(knob(coarse.h) / 16)}（大きい指用 ${ratio(large.h / 16)}・${ratio(knob(large.h) / 16)}）。マウス用は 14px に 1.57・1.14`,
    ],
    [
      '部品との比',
      `トラックの高さ ÷ 部品の高さ。指用 ${ratio(coarse.h / 44)}・大きい指用 ${ratio(large.h / 52)}。マウス用は 0.55`,
    ],
    [
      '伸び',
      `マウス用から高さ +${Math.round((coarse.h / 22 - 1) * 100)}%（大きい指用 +${Math.round((large.h / 22 - 1) * 100)}%）`,
    ],
    [
      'はみ出し',
      `ラベルの行（24px）から上下に、指用 ${overhang(coarse)}・大きい指用 ${overhang(large)}`,
    ],
    ['WCAG', `2.5.8（24×24px）。指用: ${wcag(coarse)}。大きい指用: ${wcag(large)}`],
    [
      'iOS・M3',
      `iOS の設定 51×31pt・M3 52×32dp（どちらも知識による値）との比。指用 ${platform(coarse)}。大きい指用 ${platform(large)}`,
    ],
  ];
};

const sizes = {
  current: { coarse: { w: 48, h: 28 }, large: { w: 56, h: 32 } },
  A: { coarse: { w: 46, h: 26 }, large: { w: 52, h: 30 } },
  B: { coarse: { w: 44, h: 24 }, large: { w: 52, h: 28 } },
  C: { coarse: { w: 40, h: 22 }, large: { w: 44, h: 24 } },
} satisfies Record<string, { coarse: Size; large: Size }>;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '前半のキャンバスの値',
    intent:
      '指用 48×28・大きい指用 56×32。マウス用（40×22）から高さが +27% 伸び、部品の高さ（+10%）や文字（+14%）より大きく伸びる。ラベルの行（24px）から上下に 2px はみ出す。',
    spec: specOf(sizes.current.coarse, sizes.current.large),
    tokens: tokensOf(sizes.current.coarse, sizes.current.large),
  },
  {
    id: 'A',
    name: '中間',
    intent:
      '現行版と B の間。指用 46×26・大きい指用 52×30。トラックの高さと文字の比（1.63）が、マウス用（1.57）に近い。ラベルの行からは上下 1px はみ出す。',
    spec: specOf(sizes.A.coarse, sizes.A.large),
    tokens: tokensOf(sizes.A.coarse, sizes.A.large),
  },
  {
    id: 'B',
    name: '部品の高さに比例',
    intent:
      'マウス用の 40×22 を、部品の高さと同じ比で伸ばす。指用は 1.1 倍（44/40）で 44×24、大きい指用は 1.3 倍（52/40）で 52×28。トラックと部品の高さの比がマウス用と同じ 0.55 になる。指用ではトラックがラベルの行（24px）と同じ高さで、はみ出しがない（軸 44 の問題が消える）。',
    spec: specOf(sizes.B.coarse, sizes.B.large),
    tokens: tokensOf(sizes.B.coarse, sizes.B.large),
  },
  {
    id: 'C',
    name: 'マウス用と同じ大きさ',
    intent:
      '指用もマウス用と同じ 40×22・ノブ 16。大きい指用だけ少し大きく 44×24（B の指用と同じ）。行の高さは 44px あるので押しにくくはならないが、トラックの高さは WCAG 2.5.8 の 24px を下回る（ラベルも押せるので例外に当たる）。',
    spec: specOf(sizes.C.coarse, sizes.C.large),
    tokens: tokensOf(sizes.C.coarse, sizes.C.large),
  },
];

const columns: Column[] = [
  {
    label: '指用（スマホの幅 390px）',
    note: 'data-density="coarse"。部品の高さ 44px・文字 16px・ラベルの行 24px',
  },
  {
    label: '指用・トグルが左（390px）',
    note: '左の列と同じで、設定の一覧だけトラックを文字の左に置く（togglePlacement="start"）',
  },
  {
    label: '大きい指用（390px）',
    note: 'data-density="coarse" + coarse-large。部品の高さ 52px・文字とラベルの行は同じ',
  },
  {
    label: 'マウス用（参考）',
    note: 'data-density="fine"。どの行も 40×22・ノブ 16（変えない）',
  },
];

// 列の中身は 390px の枠。Comparison の列は最小 260px なので、狭い画面では枠が隣の列に重なる。
// このストーリーの中だけ、表の幅を中身に合わせ、横にスクロールさせる
const axisCss = `
[data-axis45] .overflow-x-auto > .grid { width: max-content; min-width: 100%; }
`;

// placement: 設定の一覧のトラックの位置
const frame = {
  '指用（スマホの幅 390px）': { density: 'coarse', large: false, placement: 'end' },
  '指用・トグルが左（390px）': { density: 'coarse', large: false, placement: 'start' },
  '大きい指用（390px）': { density: 'coarse', large: true, placement: 'end' },
  'マウス用（参考）': { density: 'fine', large: false, placement: 'end' },
} as const;

const Heading = ({ children }: { children: string }) => (
  <h2 className="pb-1 text-xs font-bold text-fg-subtle">{children}</h2>
);

// スマホの幅の枠。設定の一覧（トラックを右に置く）と、フォーム（トラックを左に置く）を並べ、ほかの部品との釣り合いを見る
// showDividers: 設定の一覧の行のあいだの区切り線を出すか（Controls の「区切り線」）
const Cell = ({ column, showDividers }: { column: Column; showDividers: boolean }) => {
  const f = frame[column.label as keyof typeof frame];
  return (
    <div
      data-density={f.density}
      className={[
        'flex w-[390px] flex-col gap-6 rounded-[28px] border border-line bg-surface px-4 py-6',
        f.large && 'coarse-large',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <section className="flex flex-col">
        <Heading>通知の設定</Heading>
        <div
          className={['flex flex-col', showDividers && 'divide-y divide-line']
            .filter(Boolean)
            .join(' ')}
        >
          <Switch
            togglePlacement={f.placement}
            label="お知らせを受け取る"
            defaultChecked
            className="py-1"
          />
          <Switch
            togglePlacement={f.placement}
            label="プッシュ通知"
            caption="コメントがついたときに届きます"
            defaultChecked
            className="py-1"
          />
          <Switch
            togglePlacement={f.placement}
            label="メールで受け取る"
            caption="週に1回まとめて届きます"
            className="py-1"
          />
          <Switch togglePlacement={f.placement} label="音を鳴らす" className="py-1" />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Heading>登録</Heading>
        <TextField label="名前" defaultValue="かずえもん" />
        <Checkbox label="利用規約に同意する" defaultChecked />
        <Switch
          label="お知らせメールを受け取る"
          caption="新しい記事が公開されたときに届きます"
          defaultChecked
        />
        <Button color="primary" className="w-full">
          登録する
        </Button>
      </section>
    </div>
  );
};

const th = 'px-2 py-1 text-left font-bold text-fg';
const td = 'px-2 py-1 tabular-nums';

interface ComparisonArgs {
  pick: string;
  showDividers: boolean;
}

const meta = {
  title: 'Design Review/45 指用のトグルの大きさ',
  id: 'design-review-45-switch-coarse-size',
  decorators: [keepSwitchCaptionAsCompared, keepToggleColorAsCompared],
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current,B', showDividers: true },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）。使い分けるときはカンマで区切る',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
    showDividers: {
      name: '区切り線',
      description: '設定の一覧の行のあいだに区切り線を出す',
      control: 'boolean',
    },
  },
} satisfies Meta<ComparisonArgs>;

export default meta;
type Story = StoryObj<ComparisonArgs>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick, showDividers }) => (
    <div data-axis45>
      <style>{axisCss}</style>
      <Comparison
        index={45}
        axis="指用のトグルの大きさ"
        pick={pick}
        candidates={candidates}
        columns={columns}
        renderCell={(column) => <Cell column={column} showDividers={showDividers} />}
      >
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0065）。
          かずえもんのメモ:「そもそも Switch
          の指用のためのジャンプサイズが大きすぎる可能性を感じています。実際にスマホサイズにレンダリングしてみると、結構大きくないですか？」
        </p>
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0065）。 指用のトグル（48×28・ノブ
          22）は、前半のキャンバスの値のままです。指用にしたときの伸び方を並べると、トグルだけがほかより大きく伸びています。
        </p>
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs">
            <thead>
              <tr className="border-b border-line">
                <th className={th} />
                <th className={th}>マウス用</th>
                <th className={th}>指用</th>
                <th className={th}>伸び</th>
                <th className={th}>大きい指用</th>
                <th className={th}>伸び</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['部品の高さ', 40, 44, 52],
                  ['文字', 14, 16, 16],
                  ['トグルの高さ', 22, 28, 32],
                  ['トグルの幅', 40, 48, 56],
                  ['ノブ', 16, 22, 26],
                ] as const
              ).map(([name, fine, coarse, large]) => (
                <tr key={name}>
                  <th className={th}>{name}</th>
                  <td className={td}>{fine}px</td>
                  <td className={td}>{coarse}px</td>
                  <td className={td}>+{Math.round((coarse / fine - 1) * 100)}%</td>
                  <td className={td}>{large}px</td>
                  <td className={td}>+{Math.round((large / fine - 1) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0065）。
          ここで選ぶのは、指用と大きい指用のトグルの大きさです。マウス用は変えません。ノブはどの案もトラックの高さから隙間
          3px × 2 を引いた大きさで、幅と高さを偶数にして、ノブの位置が整数になるようにしています。
        </p>
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0065）。 軸
          44（指用のトグルの縦の位置）とつながっています。指用のトラック（28px）はラベルの行（24px）より高く、上下に
          2px ずつはみ出して、下の端がキャプションに接していました。トラックの高さを 24px（B
          の指用、C の大きい指用）にすると、ラベルの行と同じ高さになり、はみ出しがなくなります。
        </p>
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0065）。
          列は、スマホの幅（390px）の枠です。設定の一覧（トラックを右に置く）と、フォーム（入力欄・チェックボックス・トラックを左に置くトグル・塗りのボタン）を並べ、ほかの部品との釣り合いを見られるようにしています。右の列はマウス用の参考で、どの行も同じです。ツールバーの「指用の高さ」は既定（44px）のままで見てください（大きい指用を選ぶと、指用の列も大きい指用になります）。
        </p>
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0065）。 参考の iOS
          の設定のスイッチ（51×31pt）と Material 3
          のスイッチ（52×32dp）は、どちらも知識による値です。どちらも文字（17pt・16sp）に対して、いまの指用より大きめです。
        </p>
        <p>
          <strong className="text-fg">決まったこと</strong>（ADR-0065）。
          どれを既定にするかを一言添えてください。大きい指用だけ別の案にしたいときも、そう書いてください。
        </p>
      </Comparison>
    </div>
  ),
};
