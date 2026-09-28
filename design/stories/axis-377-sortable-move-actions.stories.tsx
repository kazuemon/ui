import type { Meta, StoryObj } from '@storybook/react-vite';

import type { SortableMoveActions } from '../../src/components/sortable/Sortable';
import { statePseudo } from '../../src/stories/story-states';
import { type Candidate, type Column, Comparison } from './Comparison';
import { StaticList, TryList } from './sortable-frame';

// 軸 377: ドラッグしない並べ替え（WCAG 2.2 の 2.5.7 Dragging Movements）
//   引くのが難しい人（ポインタだけを使う人）が、押すだけで並べ替えを終えられるようにする
//   候補は Sortable の moveActions（props の差）で作る。移動は部品が onValueChange で知らせるので、エンジンに頼らない
//   どの案も、動かしたあとはつまみにフォーカスを戻し、「N 番目に移しました」を読み上げる。端の項目では、それより先へ動かす操作を押せなくする

const columns: Column[] = [
  { label: '通常' },
  { label: 'フォーカス（キーボード）', note: '1 つ目の項目のつまみ', preview: 'focus' },
  {
    label: '試す',
    note: '︙ を押す（B）、上へ・下へを押す（C）。引いて並べ替えることもできます',
  },
];

const candidates: (Candidate & { moveActions: SortableMoveActions })[] = [
  {
    id: '現行版',
    name: 'なし',
    moveActions: 'none',
    intent:
      '引くか、つまみにフォーカスして上下の矢印キーで動かす。ポインタだけを使う人は、引かないと並べ替えられない（2.5.7 を満たさない）。',
    spec: [
      ['見た目', '変わらない'],
      ['引かずに動かす', 'キーボードのみ'],
    ],
  },
  {
    id: 'B',
    name: '末尾の ︙ にメニュー',
    moveActions: 'item-menu',
    intent:
      '行の末尾に ︙ のボタンを置き、その中に移動の操作を入れる。引ける印（つまみ）と、押して開く印（︙）が分かれるので、どちらで何ができるかが見た目で分かる。行ごとにボタンが 1 つ増える。',
    spec: [
      ['見た目', '末尾に ︙（つまみと同じ幅の平らなボタン）'],
      ['メニュー', 'A と同じ'],
      ['moveActions', 'item-menu'],
    ],
  },
  {
    id: 'C',
    name: '上へ・下へのボタンを常に出す',
    moveActions: 'buttons',
    intent:
      '行の末尾に「上へ」「下へ」のボタンを並べる。メニューを開かずに 1 回で動かせ、何ができるかがいつも見えている。先頭・末尾へは一度に動かせない。行が混んで見える。',
    spec: [
      ['見た目', '末尾に ︿ ﹀ の 2 つのボタン'],
      ['操作', '上へ・下へ（端では押せない）'],
      ['moveActions', 'buttons'],
    ],
  },
];

function renderCell(column: Column, candidate: Candidate) {
  const moveActions = candidates.find((c) => c.id === candidate.id)?.moveActions;
  if (column.label === '試す') return <TryList moveActions={moveActions} />;
  return <StaticList moveActions={moveActions} />;
}

const firstHandle = 'ul[aria-label] > li:first-child [data-slot="sortable-handle"]';

const meta = {
  title: 'Design Review/377 Sortableのドラッグしない並べ替え',
  id: 'design-review-377-sortable-move-actions',
  parameters: { layout: 'fullscreen', pseudo: statePseudo({ focusVisible: firstHandle }) },
  args: { pick: 'current,B,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'B', 'C', 'current,B,C'],
    },
  },
} satisfies Meta<{ pick: string }>;

export default meta;
type Story = StoryObj<{ pick: string }>;

export const Candidates: Story = {
  name: '候補',
  render: ({ pick }) => (
    <Comparison
      index={377}
      axis="Sortable のドラッグしない並べ替え"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={renderCell}
    >
      <p className="font-bold text-fg">
        決定: 現行版（なし）を既定にし、B（末尾の ︙、moveActions="item-menu"）と
        C（上へ・下へのボタン、moveActions="buttons"）を選べる。A（つまみのメニュー）はなくした。「デフォルトは現行版のままで、BとCはオプションで利用できるようにしたいです。」
      </p>
      <p>
        引くのが難しい人が、押すだけで並べ替えを終えられるようにする操作を決めます（WCAG 2.2 の
        2.5.7）。移動は部品が知らせるので、dnd-kit などのエンジンがなくても動きます。
      </p>
      <p>
        どの案も、動かしたあとはつまみにフォーカスを戻し、何番目に移ったかを読み上げます。端の項目では、それより先へ動かす操作は押せません。
      </p>
      <p>
        「試す」の列で押して比べ、どれを既定にするか、ほかも選べるようにするかを選んでください。
      </p>
    </Comparison>
  ),
};
