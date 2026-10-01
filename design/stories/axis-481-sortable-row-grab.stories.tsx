import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DataTable } from '../../src/components/data-table/DataTable';
import { DataTableHeader } from '../../src/components/data-table/DataTableHeader';
import { DataTableRow } from '../../src/components/data-table/DataTableRow';
import {
  SortableHandle,
  SortableItem,
  SortableItemActions,
} from '../../src/components/sortable/Sortable';
import { SortableTableBody } from '../../src/components/sortable/SortableTableBody';
import { TableCell, TableHead, TableRow } from '../../src/components/table/Table';
import { Tag } from '../../src/components/tag/Tag';
import { VisuallyHidden } from '../../src/components/visually-hidden/VisuallyHidden';
import { statePseudo } from '../../src/stories/story-states';

// 軸 481: 表の行を並べ替えるときの、掴む場所（取っ手の列）
const meta = {
  title: 'Design Review/481 表の行の掴む場所',
  id: 'design-review-481-sortable-row-grab',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="sortable-handle"]',
      focusVisible: '[data-slot="sortable-handle"]',
    }),
  },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

type Layout = 'none' | 'column' | 'inline' | 'row' | 'end';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '並べ替えられない',
    intent:
      'SortableItem は li しか描けず、表の行は並べ替えられなかった。DataTable だけの表。比べるための基準',
    spec: [
      ['掴む場所', 'なし'],
      ['列', '増えない'],
    ],
  },
  {
    id: 'A',
    name: '先頭に取っ手の列',
    intent:
      '先頭に、つまみだけを入れた細い列を足す。リストのつまみ（先頭の端に接した塊）と同じ位置。末尾に ︙ の操作の列',
    spec: [
      ['掴む場所', '先頭の列のつまみ'],
      ['列', '先頭に 40px・末尾に ︙'],
      ['つなぎ方', 'handleRef をつまみに'],
    ],
  },
  {
    id: 'B',
    name: '1 列目の文字の前',
    intent:
      '列は足さず、1 列目（作業）のセルの文字の前につまみを置く。列が 1 つ減るぶん狭い表に向く。見出しの「作業」と文字の頭がずれる',
    spec: [
      ['掴む場所', '1 列目の文字の前のつまみ'],
      ['列', '末尾に ︙ だけ'],
      ['つなぎ方', 'handleRef をつまみに'],
    ],
  },
  {
    id: 'C',
    name: '行のどこでも',
    intent:
      'A の列を残したまま、行のどこを掴んでも引ける（grabArea="item"）。つまみはキーボードの口と目印。指ではスクロールと取り合う',
    spec: [
      ['掴む場所', '行のどこでも'],
      ['列', '先頭に 40px・末尾に ︙'],
      ['つなぎ方', 'handleRef を渡さない'],
    ],
  },
  {
    id: 'D',
    name: '末尾に取っ手の列',
    intent:
      'つまみを末尾の列に置き、︙ の手前に並べる。先頭の列の文字が表の端からそろう。右手で掴む',
    spec: [
      ['掴む場所', '末尾の列のつまみ'],
      ['列', '末尾につまみと ︙'],
      ['つなぎ方', 'handleRef をつまみに'],
    ],
  },
];

const layoutOf: Record<string, Layout> = {
  現行版: 'none',
  A: 'column',
  B: 'inline',
  C: 'row',
  D: 'end',
};

const columns: Column[] = [
  { label: '通常' },
  { label: 'つまみに hover', preview: 'hover' },
  { label: 'つまみにフォーカス', preview: 'focus' },
];

interface Task {
  id: string;
  title: string;
  owner: string;
  status: '進行中' | '未着手' | '確認待ち';
}
const statusColor = { 進行中: 'info', 未着手: 'neutral', 確認待ち: 'warning' } as const;
const tasks: Task[] = [
  { id: 'heading', title: '見出しを決める', owner: '佐藤', status: '進行中' },
  { id: 'figure', title: '図を描く', owner: '鈴木', status: '未着手' },
  { id: 'body', title: '本文を書く', owner: '高橋', status: '確認待ち' },
];

function Tasks({ layout }: { layout: Layout }) {
  const [order, setOrder] = useState(() => tasks.map((task) => task.id));
  const taskOf = (id: string) => tasks.find((task) => task.id === id) ?? tasks[0];
  const headColumn = layout === 'column' || layout === 'row';
  const sortable = layout !== 'none';
  const header = (
    <TableHead>
      <TableRow>
        {headColumn && (
          <DataTableHeader className="w-px">
            <VisuallyHidden>並べ替え</VisuallyHidden>
          </DataTableHeader>
        )}
        <DataTableHeader>作業</DataTableHeader>
        <DataTableHeader>担当</DataTableHeader>
        <DataTableHeader>状態</DataTableHeader>
        {layout === 'end' && (
          <DataTableHeader className="w-px">
            <VisuallyHidden>並べ替え</VisuallyHidden>
          </DataTableHeader>
        )}
        {sortable && (
          <DataTableHeader className="w-px">
            <VisuallyHidden>操作</VisuallyHidden>
          </DataTableHeader>
        )}
      </TableRow>
    </TableHead>
  );
  const cells = (task: Task) => (
    <>
      <TableCell>
        {layout === 'inline' ? (
          <span className="flex items-center gap-1">
            <SortableHandle />
            {task.title}
          </span>
        ) : (
          task.title
        )}
      </TableCell>
      <TableCell>{task.owner}</TableCell>
      <TableCell>
        <Tag color={statusColor[task.status]}>{task.status}</Tag>
      </TableCell>
    </>
  );
  if (!sortable) {
    return (
      <div className="w-[460px]">
        <DataTable accessibleName="作業">
          {header}
          <tbody>
            {tasks.map((task) => (
              <DataTableRow key={task.id}>{cells(task)}</DataTableRow>
            ))}
          </tbody>
        </DataTable>
      </div>
    );
  }
  return (
    <div className="w-[460px]">
      <DataTable accessibleName="作業">
        {header}
        <SortableTableBody
          value={order}
          onValueChange={setOrder}
          moveActions="item-menu"
          grabArea={layout === 'row' ? 'item' : 'handle'}
        >
          {order.map((id) => {
            const task = taskOf(id);
            return (
              <SortableItem
                key={id}
                value={id}
                render={<DataTableRow />}
                accessibleName={task.title}
              >
                {headColumn && (
                  <TableCell>
                    <SortableHandle />
                  </TableCell>
                )}
                {cells(task)}
                {layout === 'end' && (
                  <TableCell>
                    <SortableHandle placement="end" />
                  </TableCell>
                )}
                <TableCell>
                  <SortableItemActions />
                </TableCell>
              </SortableItem>
            );
          })}
        </SortableTableBody>
      </DataTable>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={481}
      axis="表の行の掴む場所"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(_column, candidate) => <Tasks layout={layoutOf[candidate.id]} />}
    >
      <p>
        SortableItem に render
        を足し、表の行（DataTableRow）を並べ替えられるようにしました。表の本文は TableBody
        の代わりに SortableTableBody を置きます（props は Sortable と同じ）。ポインタで引く動きは
        dnd-kit につなぎます（Recipes/Sortable の「表の行」）。
      </p>
      <p>
        選ぶのは、表のどこを掴んで引くかです。どの案でも、キーボードではつまみにフォーカスして上下の矢印キーで動かし、行の末尾の
        ︙
        から引かずに並べ替えられます。hover・フォーカスの列は、つまみに載せたところです。どれを既定（レシピの形）にし、ほかに見本として載せるものがあれば教えてください。
      </p>
    </Comparison>
  ),
};
