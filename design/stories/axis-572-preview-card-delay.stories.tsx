import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { PreviewCard } from '../../src/components/preview-card/PreviewCard';
import { ProfilePreview } from '../../src/components/preview-card/preview-card-samples';

// 軸 572: PreviewCard が出るまでの待ちと、閉じるまでの待ち
const meta = {
  title: 'Design Review/572 プレビューが出る・閉じる待ち',
  id: 'design-review-572-preview-card-delay',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'A' },
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

const delays: Record<string, [number, number]> = {
  現行版: [600, 300],
  A: [400, 200],
  B: [800, 400],
  C: [100, 0],
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '600 ms で出て、300 ms で閉じる',
    intent: '通りがかりのマウスでは出ず、載せて止めると出る。Base UI の既定',
    spec: [
      ['openDelay', '600 ms'],
      ['closeDelay', '300 ms'],
    ],
  },
  {
    id: 'A',
    name: '少し早め',
    intent: '400 ms で出て、200 ms で閉じる。Tooltip の待ち（400 ms）にそろう',
    spec: [
      ['openDelay', '400 ms'],
      ['closeDelay', '200 ms'],
    ],
  },
  {
    id: 'B',
    name: 'ゆっくり',
    intent: '800 ms で出て、400 ms で閉じる。文章の中のリンクをなぞっても、ほとんど出ない',
    spec: [
      ['openDelay', '800 ms'],
      ['closeDelay', '400 ms'],
    ],
  },
  {
    id: 'C',
    name: 'Menu と同じ',
    intent: '100 ms で出て、待たずに閉じる。なぞるたびに出て、面へ斜めに移るあいだに閉じやすい',
    spec: [
      ['openDelay', '100 ms'],
      ['closeDelay', '0 ms'],
    ],
  },
];

const columns: Column[] = [
  { label: '載せて試す', note: 'リンクにマウスを載せる・離す・Tab でフォーカス' },
];

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={572}
      axis="プレビューが出る・閉じる待ち"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => {
        const [openDelay, closeDelay] = delays[candidate.id];
        return (
          <p className="max-w-sm text-body">
            この記事は、
            <PreviewCard
              href="https://example.com/"
              content={<ProfilePreview />}
              openDelay={openDelay}
              closeDelay={closeDelay}
            >
              @kazuemon
            </PreviewCard>
            さんの続きです。文のなかを、マウスでなぞってみてください。
          </p>
        );
      }}
    >
      <p>決定: openDelay 400・closeDelay 200（A）。任意の数（ms）を渡せる（ADR-0490）</p>
      <p>
        出るまでの待ち（openDelay）と、離れてから閉じるまでの待ち（closeDelay）を決めます。名前は
        Menu と同じです。既定の数は、Menu（100 ms・0
        ms）が「開くつもりで載せる」ものなのに対し、PreviewCard
        はリンクをなぞっただけでも載るので、長くしています。
      </p>
      <p>
        おすすめは現行版です。動きは目で見て確かめる軸なので、各行のリンクに実際にマウスを載せ、なぞって通り過ぎたときに出すぎないか、面へ移るときに閉じないかを比べてください。
      </p>
    </Comparison>
  ),
};
