import type { Meta, StoryObj } from '@storybook/react-vite';

import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { type SortableLook, StaticList, TryList } from './sortable-frame';

// 軸 375: Sortable のつまみの位置と、どこをつかんで引くか
//   候補は Sortable の grabArea と、つまみを置く位置（props と並べ方の差）で作る
//   どの案もつまみは残す。キーボードで動かす口（フォーカスが止まる場所）を兼ねるため

const columns: Column[] = [
  { label: '通常' },
  {
    label: 'hover',
    note: '1 つ目の項目（grabArea="item" は項目、それ以外はつまみ）',
    preview: 'hover',
  },
  { label: 'フォーカス（キーボード）', preview: 'focus' },
  { label: '試す', note: '引くか、つまみにフォーカスして上下の矢印キー' },
];

const candidates: (Candidate & SortableLook)[] = [
  {
    id: '現行版',
    name: '先頭のつまみだけで引く',
    intent:
      'つまみを項目の左端に置き、つまみだけをつかめるようにする。項目の中の文を選んだり、中のボタンを押したりしても動き出さない。指ではページのスクロールと紛れない。',
    spec: [
      ['つまみ', '先頭'],
      ['引ける範囲', 'つまみ（grabArea="handle"）'],
    ],
  },
  {
    id: 'A',
    name: '末尾のつまみだけで引く',
    intent:
      'つまみを右端に置く。文の頭がそろい、読む順では項目の名前が先に来る。右手の親指で届きやすい。',
    spec: [
      ['つまみ', '末尾'],
      ['引ける範囲', 'つまみ'],
    ],
    handleEnd: true,
  },
  {
    id: 'B',
    name: '項目のどこでも引く',
    intent:
      '項目全体をつかめるようにする（つまみは目印とキーボードの口として残す）。hover で項目の面が半段濃くなる。指ではどの案も少し長押ししてから動き出す（dnd-kit の既定）が、この案ではリストの上でスクロールしようとして指を止めたときにも動き出すことがある。',
    spec: [
      ['つまみ', '先頭（目印）'],
      ['引ける範囲', '項目全体（grabArea="item"）'],
    ],
    grabArea: 'item',
  },
];

function renderCell(column: Column, candidate: Candidate) {
  const look: SortableLook = candidates.find((c) => c.id === candidate.id) ?? {};
  if (column.label === '試す')
    return <TryList grabArea={look.grabArea} handleEnd={look.handleEnd} />;
  return <StaticList grabArea={look.grabArea} handleEnd={look.handleEnd} />;
}

const firstItem = 'ul[aria-label] > li:first-child';
const firstHandle = `${firstItem} [data-slot="sortable-handle"]`;

const meta = {
  title: 'Design Review/375 Sortableのつまみ',
  id: 'design-review-375-sortable-grab',
  parameters: {
    layout: 'fullscreen',
    pseudo: {
      ...statePseudo({ focusVisible: firstHandle }),
      hover: [`[data-preview="hover"] ${firstHandle}`, `[data-preview="hover"] ${firstItem}`],
    },
  },
  args: { pick: 'current,A,B' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'current,B', 'current,A,B'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={375}
      axis="Sortable のつまみの位置と、どこをつかんで引くか"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p className="font-bold text-fg">
        決定: 現行版（先頭のつまみだけで引く）を既定にし、A（placement="end"）と
        B（grabArea="item"）も選べる。「デフォルトは現行版で良さそうです。つまみの位置と挙動はユーザーに選択して欲しいので、AとBのパターンも対応はしておきたいです。」
      </p>
      <p>
        つまみを項目のどちらの端に置くかと、つまみだけで引くか項目のどこでも引けるかを決めます。つまみはどの案でも残し、キーボードではつまみにフォーカスして上下の矢印キーで動かします。
      </p>
      <p>
        項目の中にボタンやリンクを置く使い方では、つまみだけで引く形が向きます。どれを既定にし、ほかも選べるようにするかを選んでください。
      </p>
    </Comparison>
  ),
};
