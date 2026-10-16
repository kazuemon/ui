import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  BarList,
  type BarListItem,
  type BarListVariant,
} from '../../src/components/bar-list/BarList';

// 軸 661: BarList の形（名前を棒に重ねるか、名前の下に棒を置くか）と、重ねるときの棒の濃さ
// 濃さはトークン（--bar-list-fill-mix）、形は variant、below の間隔は --bar-list-below-gap・--bar-list-below-row-gap で行ごとに変える
const meta = {
  title: 'Design Review/661 BarList の形',
  id: 'design-review-661-bar-list-shape',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'C2', 'C3'],
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
  C2: 'below',
  C3: 'below',
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
    tokens: {
      '--bar-list-fill-mix': '20%',
      '--bar-list-below-gap': 'var(--spacing)',
      '--bar-list-below-row-gap': 'calc(var(--spacing) * 3)',
    },
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
    tokens: {
      '--bar-list-fill-mix': '12%',
      '--bar-list-below-gap': 'var(--spacing)',
      '--bar-list-below-row-gap': 'calc(var(--spacing) * 3)',
    },
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
    tokens: {
      '--bar-list-fill-mix': '32%',
      '--bar-list-below-gap': 'var(--spacing)',
      '--bar-list-below-row-gap': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'C',
    name: '名前の下に細い棒（前回の間隔）',
    intent:
      '前回出した間隔。名前と棒の間（8px）が行の間（6px）より広く、棒が次の行の名前と組に見える',
    spec: [
      ['variant', 'below'],
      ['名前と棒の間', '8px'],
      ['行の間', '6px'],
    ],
    tokens: {
      '--bar-list-fill-mix': '20%',
      '--bar-list-below-gap': 'calc(var(--spacing) * 2)',
      '--bar-list-below-row-gap': 'calc(var(--spacing) * 1.5)',
    },
  },
  {
    id: 'C2',
    name: '名前の下に細い棒（名前に寄せる）',
    intent:
      '名前と棒の間を 4px に詰め、行の間を 12px に広げる。名前の行の上下にも余白があるので、見た目の間はおよそ 1 対 3 になり、棒が自分の名前と組に見える',
    spec: [
      ['variant', 'below'],
      ['名前と棒の間', '4px'],
      ['行の間', '12px'],
    ],
    tokens: {
      '--bar-list-fill-mix': '20%',
      '--bar-list-below-gap': 'var(--spacing)',
      '--bar-list-below-row-gap': 'calc(var(--spacing) * 3)',
    },
  },
  {
    id: 'C3',
    name: '名前の下に細い棒（さらに寄せる）',
    intent:
      '名前と棒の間を 2px、行の間を 16px にする。組はいちばんはっきりするが、棒が名前の下端に付いて見え、一覧が縦に長くなる',
    spec: [
      ['variant', 'below'],
      ['名前と棒の間', '2px'],
      ['行の間', '16px'],
    ],
    tokens: {
      '--bar-list-fill-mix': '20%',
      '--bar-list-below-gap': 'calc(var(--spacing) * 0.5)',
      '--bar-list-below-row-gap': 'calc(var(--spacing) * 4)',
    },
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
        決定:
        現行版（重ねる・20%）を既定にし、名前の下に棒を置く形も選べるようにする。残りは、名前の下に棒を置く形の間隔です。
      </p>
      <p>
        前回の C は、名前と棒の間が行の間より広く、棒が次の行の名前と組に見えていました。C2・C3
        は名前と棒の間を詰め、行の間を広げています。
      </p>
      <p>
        おすすめは C2（名前と棒の間 4px、行の間 12px）です。名前の行には上下に余白があるので、4px
        でも棒が名前に付いては見えず、行の間との差で組がはっきりします。C3
        は組がいちばん強い一方、棒が名前に付いて見え、一覧も縦に長くなります。
      </p>
      <p>C2・C3 のどちらがよいか（または、もっと寄せる・離すか）を教えてください。</p>
    </Comparison>
  ),
};
