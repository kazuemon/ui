import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollFree, SheetSpecimen } from './cascader-axis-parts';
import { type Candidate, type Column, Comparison } from './Comparison';
import { Button } from '../../src/components/button/Button';
import { Cascader, type CascaderProps } from '../../src/components/cascader/Cascader';
import { categories, regions, shortRoot } from '../../src/components/cascader/cascader-story-items';
import { Menu } from '../../src/components/menu/Menu';
import { MenuItem, MenuSubmenu } from '../../src/components/menu/MenuItem';
import { PhoneFrame } from '../../src/stories/story-parts';

// 軸 650: Cascader のシート（指・狭い画面）で、前の段へ戻る手段
const meta = {
  title: 'Design Review/650 Cascader のシートで前の段へ戻る',
  id: 'design-review-650-cascader-sheet-navigation',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'current' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
  decorators: [
    (Story) => (
      <ScrollFree>
        <Story />
      </ScrollFree>
    ),
  ],
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

// A（上に段のタブ）は部品から外した（sheetNavigation ごと消した）。比較のときの動く見本は、決める前のコミット 14c81631 にある
const kept: Record<string, boolean> = { current: true, A: false };

const candidates: Candidate[] = [
  {
    id: 'current',
    name: '段の上に「‹ 親の名前」（おすすめ・既定）',
    intent:
      '2 段目から、段の上に ‹ と親の名前の行を置き、押すと 1 段戻る。行は段をスクロールしても上に貼り付く。Menu の入れ子のシート（見出しの左の ‹）と同じ考えで、いまどの親の中かが行から読める',
    spec: [
      ['戻る', '‹ の行で 1 段ずつ'],
      ['場所', '段の上（貼り付く）'],
      ['props', "sheetNavigation='back'"],
    ],
  },
  {
    id: 'A',
    name: '上に段のタブ',
    intent:
      '上に段ごとのタブ（選んだ名前、まだの段は「選んでください」）を並べ、押すとその段へ飛ぶ。通販の住所選びに多い形。何段目まで選んだかが一目で分かり、2 段以上も一度に戻れるが、タブと見出しが 2 段に重なる',
    spec: [
      ['戻る', 'タブで任意の段へ'],
      ['場所', '中身の上（貼り付く）'],
      ['props', "sheetNavigation='tabs'"],
    ],
  },
];

const columns: Column[] = [
  { label: 'シートの中身（2 段）', note: '開いたままの見本。親を押すと右から滑り込む' },
  { label: 'シートの中身（3 段）', note: '何も選んでいないところから' },
  { label: '欄から開く', note: '実際の部品。欄を押すとシート（1 つずつ開く）' },
];

export const Axis: Story = {
  name: '比較',
  render: ({ pick }) => (
    <Comparison
      index={650}
      axis="Cascader のシートで前の段へ戻る"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        if (!kept[candidate.id])
          return (
            <p className="max-w-60 text-xs leading-5 text-fg-subtle">
              部品から外しました（比べたときの見本はコミット 14c81631）
            </p>
          );
        if (column.label.includes('2 段'))
          return <SheetSpecimen items={regions} defaultValue={['tokyo', 'shibuya']} />;
        if (column.label.includes('3 段')) return <SheetSpecimen items={categories} />;
        return (
          <PhoneFrame>
            {(frame) => (
              <Cascader
                label="カテゴリ"
                items={categories}
                presentation="sheet"

                portalContainer={frame}
              />
            )}
          </PhoneFrame>
        );
      }}
    >
      <p>
        決定: 既定は現行版（段の上に「‹ 親の名前」の行）。A（タブ）は採らず、sheetNavigation
        ごと外した。シートの高さは Menu の入れ子のシートの既定（fixed）とそろえ、1
        段目の高さのまま変えない（長い段はその中でスクロールし、短い段は下が空く）。
      </p>
      <p>
        指で操作していて画面が狭いときは、段を横に並べられないので、シートの中で 1
        段ずつ滑らせて進みます（Menu
        の入れ子のシートと同じ）。ここでは、前の段へ戻る手段を決めます。シートの見出し（欄のラベル）と右上の
        × はどちらも同じです。
      </p>
      <p>
        おすすめは現行版（段の上に「‹ 親の名前」）を既定にすることです。Menu
        の入れ子と同じ向きの印で戻れ、見出しの下に 1 行足すだけで済むためです。段が深い（3
        段以上）木が多いなら、A を sheetNavigation で選べるようにします。
      </p>
    </Comparison>
  ),
};

// 650 の続き: シートの高さ。1 段目が短く、次の段が長い木で、1 段目の高さのまま（Menu の入れ子の fixed と同じ）だと、
//   長い段が狭い高さの中でスクロールして窮屈に見える。決定: B を既定にし、現行版（fixed）・C（fit）も levelSheet で選べる。A は外した
//   （比べたときの動く見本は、決める前のコミット 8d5ae5d5 にある）
const heights: Record<string, NonNullable<CascaderProps['levelSheet']> | undefined> = {
  current: 'fixed',
  A: undefined,
  B: 'tallest',
  C: 'fit',
};

const heightCandidates: Candidate[] = [
  {
    id: 'current',
    name: '1 段目の高さのまま（Menu の入れ子の既定と同じ）',
    intent:
      '開いたときの 1 段目の高さを保ち、長い段はその中でスクロールする。高さは跳ねないが、1 段目が短い木では、長い段が狭い中に押し込まれる',
    spec: [
      ['長い段へ進む', '高さはそのまま、中でスクロール'],
      ['props', "levelSheet='fixed'"],
    ],
  },
  {
    id: 'A',
    name: '長い段へ進むと伸ばし、縮めない',
    intent:
      '長い段へ進んだら、その段が収まるまで上へ伸ばす（画面の上限まで）。戻ったり短い段へ進んだりしても縮めない。伸びるのは長い段へ進んだときの 1 回だけ',
    spec: [
      ['長い段へ進む', '伸ばす'],
      ['短い段へ進む・戻る', 'そのまま'],
      ['props', '（外した）'],
    ],
  },
  {
    id: 'B',
    name: '木のいちばん長い段に合わせて開く',
    intent:
      '開いたときから、木の中でいちばん長い段が収まる高さにする（画面の上限まで）。段を進んでも戻っても高さは一度も変わらない。短い段では下が空く',
    spec: [
      ['開いたとき', 'いちばん長い段の高さ'],
      ['段を移る', '変わらない'],
      ['props', "levelSheet='tallest'（既定）"],
    ],
  },
  {
    id: 'C',
    name: 'いまの段に合わせて伸び縮みする（Menu の fit と同じ）',
    intent:
      '段ごとに中身の高さへ伸び縮みする（動きはシートと同じ長さ）。空きもスクロールも最小だが、段を移るたびにシートの上端が動く',
    spec: [
      ['段を移る', '伸び縮みする'],
      ['props', "levelSheet='fit'"],
    ],
  },
];

const heightColumns: Column[] = [
  { label: '1 段目が短い木', note: '野菜（12 個）・果物（3 個）。野菜 → 戻る → 果物 と試す' },
  { label: '住所', note: '1 段目 8 個、東京都は 13 個' },
  { label: '欄から開く', note: '実際の部品（1 段目が短い木）。欄を押すとシート' },
];

const longSubmenu = [
  'キャベツ',
  'にんじん',
  'たまねぎ',
  'じゃがいも',
  'トマト',
  'きゅうり',
  'なす',
  'ピーマン',
  'ほうれん草',
  'ブロッコリー',
  'だいこん',
  'かぼちゃ',
];

export const Height: Story = {
  name: 'シートの高さ',
  args: { pick: 'B,current,C' },
  render: ({ pick }) => (
    <Comparison
      index={650}
      axis="Cascader のシートの高さ"
      pick={pick}
      candidates={heightCandidates}
      columns={heightColumns}
      renderCell={(column, candidate) => {
        const mode = heights[candidate.id];
        if (mode === undefined)
          return (
            <p className="max-w-60 text-xs leading-5 text-fg-subtle">
              部品から外しました（比べたときの見本はコミット 8d5ae5d5）
            </p>
          );
        if (column.label.startsWith('1 段目'))
          return <SheetSpecimen items={shortRoot} levelSheet={mode} />;
        if (column.label.startsWith('住所'))
          return <SheetSpecimen items={regions} levelSheet={mode} />;
        return (
          <PhoneFrame>
            {(frame) => (
              <Cascader
                label="食材"
                items={shortRoot}
                presentation="sheet"
                levelSheet={mode}
                portalContainer={frame}
              />
            )}
          </PhoneFrame>
        );
      }}
    >
      <p>
        決定:
        B（開いたときから木のいちばん長い段に合わせる）を既定にする。深い段ほど選択肢が増えることが多く、ほかの形ではずれが多くなるため。Menu
        と同じ動きにもできるよう、現行版（levelSheet=&quot;fixed&quot;）と
        C（levelSheet=&quot;fit&quot;）も選べる。A は外した。Menu に B の形を足すかは未決。
      </p>
      <p>
        1 段目が短く、次の段が長い木で、シートの高さをどうするかを決めます。Menu
        の入れ子のシート（既定の fixed）も、いまの Cascader（現行版）と同じく 1
        段目の高さのままで、長い入れ子はその中でスクロールします（Menu
        では上のつまみを引くと高さを変えられます）。Menu の実際の動きは「Menu
        の入れ子（参考）」のストーリーで試せます。
      </p>
      <p>
        おすすめは
        B（木のいちばん長い段に合わせて開く）を既定にすることです。開いてから閉じるまで高さが一度も変わらず、長い段も窮屈になりません。短い木ではシートが低いまま、長い木では画面の上限で止まります。Cascader
        は木を最初から全部持っているので、開く前に高さを決められます（Menu
        は入れ子の中身を開くまで知らないので、同じことはできません）。
      </p>
    </Comparison>
  ),
};

// Menu の入れ子のシート（submenuSheet の既定 fixed）の、1 段目が短く入れ子が長いときの実際の動き
export const MenuReference: Story = {
  name: 'Menu の入れ子（参考）',
  render: () => (
    <div className="flex flex-wrap gap-8 bg-bg p-6 text-fg">
      {(['fixed', 'fit'] as const).map((mode) => (
        <div key={mode} className="flex flex-col gap-2">
          <p className="text-sm font-bold">submenuSheet=&quot;{mode}&quot;</p>
          <PhoneFrame>
            {(frame) => (
              <Menu
                title="食材"
                trigger={<Button variant="outline">開く</Button>}
                presentation="sheet"
                submenuSheet={mode}
                portalContainer={frame}
              >
                <MenuSubmenu
                  items={longSubmenu.map((label) => (
                    <MenuItem key={label}>{label}</MenuItem>
                  ))}
                >
                  野菜
                </MenuSubmenu>
                <MenuItem>果物</MenuItem>
              </Menu>
            )}
          </PhoneFrame>
        </div>
      ))}
    </div>
  ),
};
