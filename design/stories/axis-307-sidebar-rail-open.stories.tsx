import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { RailFrame, type RailOpen } from './sidebar-parts';

// 軸 307: 畳んだ列（rail）で、入れ子を開くまでの動き
//   ステージ＞リーグ＞グループの 3 段を、パネルを横に重ねて出す。開き方と閉じ方の間だけを比べる
//   仮の部品は sidebar-parts.tsx。試すのはマウス。キーボード（Enter・→ で開き、Esc で閉じる）と、指の画面（押して開く）は、どの案でも同じにする
interface Args {
  pick: string;
  openDelay: number;
  closeDelay: number;
}

const meta = {
  title: 'Design Review/307 Sidebar の rail の開き方',
  id: 'design-review-307-sidebar-rail-open',
  parameters: { layout: 'fullscreen' },
  args: { pick: 'B', openDelay: 0, closeDelay: 200 },
  argTypes: {
    openDelay: {
      description: 'B: アイコンに載ってから開くまで（ms）',
      control: { type: 'range', min: 0, max: 500, step: 25 },
    },
    closeDelay: {
      description: 'B: 離れてから閉じるまで（ms）',
      control: { type: 'range', min: 0, max: 800, step: 25 },
    },
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'A', 'B', 'C'],
    },
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

const candidates: (Candidate & { mode: RailOpen })[] = [
  {
    id: 'A',
    name: 'すぐ開く・すぐ閉じる',
    intent:
      'アイコンに載ると同時に開き、離れると同時に閉じる。反応は速いが、ステージから決勝リーグへ斜めに動くと、途中で別のアイコンに載って閉じる・切り替わることがある',
    spec: [
      ['開くまで', '0ms'],
      ['閉じるまで', '0ms'],
    ],
    mode: 'instant',
  },
  {
    id: 'B',
    name: 'すぐ開く・離れても少し待って閉じる',
    intent:
      '載ると同時に開き、離れて 200ms は閉じない。斜めに動いて別のアイコンをかすめても、すぐには閉じない。開くのは待たないので、rail を縦に通り過ぎると、通ったアイコンのパネルが一瞬出る',
    spec: [
      ['開くまで', '0ms'],
      ['閉じるまで', '200ms'],
    ],
    mode: 'delay',
  },
  {
    id: 'C',
    name: '押して開く',
    intent:
      'アイコンを押すと開き、外を押す・Esc まで開いたまま。開いている間は、ほかのアイコンに hover すると切り替わる。狙わない開閉がなく、指の画面と同じ操作になる。代わりに、マウスでは 1 回押す手間が増える',
    spec: [
      ['開く', 'アイコンを押す'],
      ['閉じる', '外を押す・Esc'],
    ],
    mode: 'click',
  },
];

const columns: Column[] = [{ label: '動かして試す', note: 'マウスを動かす・押す' }];

export const RailOpenStory: Story = {
  name: 'rail の開き方',
  render: ({ pick, openDelay, closeDelay }) => (
    <Comparison
      pick={pick}
      index={307}
      axis="Sidebar の rail の開き方"
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => {
        const found = candidates.find((c) => c.id === candidate.id);
        return (
          <RailFrame
            mode={found?.mode ?? 'instant'}
            label={candidate.name}
            openDelay={openDelay}
            closeDelay={closeDelay}
          />
        );
      }}
    >
      <p>
        <strong>
          決定: B（離れても待って閉じる）を既定にする。開くまでは 0ms、閉じるまでは 200ms。Controls
          の openDelay・closeDelay で動かして試せる。
        </strong>
      </p>
      <p>
        畳んだ列で、入れ子を横に出す動きを選びます。「B を既定にして、A・C
        も選べる」のように決められます。名前だけの行（大会の概要など）は、アイコンに載ると名前の札が出ます。
      </p>
    </Comparison>
  ),
};
