import type { Meta, StoryObj } from '@storybook/react-vite';

import { type LookCandidate, type LookColumn, LookComparison, pickArg } from './line-chart-look';

// 軸 672: グラフの軸の名前。レシピの look を行（案）ごとに変えて描く
const meta = {
  title: 'Design Review/672 グラフの軸の名前',
  id: 'design-review-672-chart-axis-title',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: pickArg(['current', 'A', 'B']),
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const candidates: LookCandidate[] = [
  {
    id: '現行版',
    name: '書かない',
    intent:
      '単位は題の下の説明に書く。いちばんすっきりするが、説明を読まないと縦の値が何か分からない',
    spec: [
      ['縦の名前', 'なし'],
      ['横の名前', 'なし'],
    ],
    look: { axisTitles: 'none' },
  },
  {
    id: 'A',
    name: '縦は上に横書き',
    intent:
      '縦の名前を、縦の目盛りの上に横書きで置く。横の名前は目盛りの下の右端。左から読む流れで目に入る',
    spec: [
      ['縦の名前', '目盛りの上・横書き'],
      ['横の名前', '目盛りの下の右端'],
    ],
    look: { axisTitles: 'top' },
  },
  {
    id: 'B',
    name: '縦を 90 度回す',
    intent:
      '縦の名前を、縦の目盛りの左に 90 度回して置く。表計算ソフトのグラフでよく見る形。日本語は首を傾けて読むことになる',
    spec: [
      ['縦の名前', '目盛りの左・90 度回す'],
      ['横の名前', '目盛りの下の右端'],
    ],
    look: { axisTitles: 'vertical' },
  },
];

const columns: LookColumn[] = [
  { label: 'ふつうの幅' },
  { label: '狭い幅', note: '幅 320px', width: 320 },
];

export const Candidates: Story = {
  name: '比較',
  render: ({ pick }) => (
    <LookComparison
      index={672}
      axis="グラフの軸の名前"
      pick={pick}
      candidates={candidates}
      columns={columns}
    >
      <p>
        縦の軸と横の軸に、何の値かを示す名前（「閲覧数（回）」「週」）を書くかと、その置き方を決めます。軸の名前の文字は
        ChartAxisLabel が描き、置く場所は Recharts の軸の label で決めます。
      </p>
      <p>
        推し: A（縦の名前を目盛りの上に横書き）。日本語を 90
        度回すと読みにくく、回した文字の分だけ左が狭くなります。横の名前は右下に小さく添え、日付のように見れば分かるときは省けます。
      </p>
    </LookComparison>
  ),
};
