import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  BarList,
  type BarListItem,
  type BarListVariant,
} from '../../src/components/bar-list/BarList';

// 軸 661: BarList の形（名前を棒に重ねるか、名前の下に棒を置くか）と、重ねるときの棒の濃さ
// 濃さはトークン（--bar-list-fill-mix）、形は variant で行ごとに変える。色は 660 の決定に合わせるまで brand で比べる
const meta = {
  title: 'Design Review/661 BarList の形',
  id: 'design-review-661-bar-list-shape',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const variantOf: Record<string, BarListVariant> = {
  現行版: 'overlay',
  A: 'overlay',
  B: 'overlay',
  C: 'below',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '名前を棒に重ねる（濃さ 20%）',
    intent:
      '行の高さいっぱいの淡い棒の上に、名前を本文の色で載せる。行が詰まり、名前と棒の長さが一目で結びつく。棒が短い行では、名前が棒からはみ出して白地に載る',
    spec: [
      ['variant', 'overlay'],
      ['棒の濃さ', '部品の色の 20%'],
      ['行の高さ', '32px'],
    ],
    tokens: { '--bar-list-fill-mix': '20%' },
  },
  {
    id: 'A',
    name: '重ねる・薄め（12%）',
    intent:
      '現行版より棒を薄くする。名前が読みやすく、カードの中でも静か。グレーの面の上では棒がほとんど見えなくなる',
    spec: [
      ['variant', 'overlay'],
      ['棒の濃さ', '部品の色の 12%'],
      ['行の高さ', '32px'],
    ],
    tokens: { '--bar-list-fill-mix': '12%' },
  },
  {
    id: 'B',
    name: '重ねる・濃いめ（32%）',
    intent:
      '棒を濃くし、長さの差をはっきり見せる。グレーの面の上でも棒が残る。名前と棒の色が近づき、文字はやや沈む',
    spec: [
      ['variant', 'overlay'],
      ['棒の濃さ', '部品の色の 32%'],
      ['行の高さ', '32px'],
    ],
    tokens: { '--bar-list-fill-mix': '32%' },
  },
  {
    id: 'C',
    name: '名前の下に細い棒',
    intent:
      '名前と値の行の下に、Meter と同じ太さの濃い棒を置く。棒は部品の色そのままで、長さの差がいちばん読みやすい。名前の上に何も重ならないが、行が 2 段になり縦に長い',
    spec: [
      ['variant', 'below'],
      ['棒', '部品の色の塗り・8px'],
    ],
    tokens: { '--bar-list-fill-mix': '20%' },
  },
];

const columns: Column[] = [
  { label: 'カードの中', note: '白い面' },
  { label: 'グレーの面の上', note: 'サイドバーや入力欄のそば' },
  { label: '狭い幅', note: '長い名前は省略する' },
];

const articles: BarListItem[] = [
  { label: 'React Server Components の境界を引く', value: 1240 },
  { label: '和文と欧文を並べるときの字間', value: 860 },
  { label: 'ポートフォリオを作り直した', value: 420 },
  { label: 'Storybook で見た目を比べる', value: 180 },
];

export const Candidates: Story = {
  name: '形と濃さ',
  render: ({ pick }) => (
    <Comparison
      index={661}
      axis="BarList の形"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column, candidate) => {
        const list = (
          <BarList
            aria-label="よく読まれた記事"
            items={articles}
            variant={variantOf[candidate.id]}
            color="brand"
          />
        );
        switch (column.label) {
          case 'カードの中':
            return (
              <div className="flex w-[320px] flex-col gap-3 rounded-card border border-surface-line p-4">
                <span className="text-sm font-bold">よく読まれた記事</span>
                {list}
              </div>
            );
          case 'グレーの面の上':
            return (
              <div className="flex w-[320px] flex-col gap-3 rounded-card bg-neutral p-4">
                <span className="text-sm font-bold">よく読まれた記事</span>
                {list}
              </div>
            );
          default:
            return <div className="w-[200px]">{list}</div>;
        }
      }}
    >
      <p>
        BarList の形を決めます。名前を淡い棒に重ねる形（現行版・A・B
        は濃さ違い）と、名前の下に細い棒を置く形（C）です。どちらも `variant`
        で選べるようにし、ここで決めるのは既定と、重ねる形の棒の濃さです。色は 660
        の決定に合わせるまで、水色で比べています。
      </p>
      <p>
        おすすめは現行版（重ねる・20%）を既定にし、C
        も選べる形です。重ねる形は行が詰まり、カードの中で「よく読まれた記事」のような短い一覧に収まります。C
        は長さの差がいちばん読みやすいので、割合を比べたい一覧（使った言語の割合など）で選べるようにします。
      </p>
      <p>
        既定にする案と、ほかに選べるようにしたい案を教えてください（例:「現行版を既定にして、C
        も選べる」）。
      </p>
    </Comparison>
  ),
};
