'use client';

import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { useState } from 'react';

import { DataTable } from '../components/data-table/DataTable';
import { DataTableHeader } from '../components/data-table/DataTableHeader';
import { DataTableRow } from '../components/data-table/DataTableRow';
import { SortableHandle, SortableItem, SortableItemActions } from '../components/sortable/Sortable';
import { SortableTableBody } from '../components/sortable/SortableTableBody';
import { TableCell, TableHead, TableRow } from '../components/table/Table';
import { Tag } from '../components/tag/Tag';
import { VisuallyHidden } from '../components/visually-hidden/VisuallyHidden';

export interface Task {
  id: string;
  title: string;
  owner: string;
  status: '進行中' | '未着手' | '確認待ち';
}

const statusColor = { 進行中: 'info', 未着手: 'neutral', 確認待ち: 'warning' } as const;

// キーボードと読み上げは SortableTableBody が持つので、dnd-kit にはポインタだけを任せ、読み上げの仕組み（Accessibility）は外す
//   引き始めるのは 4px 動かしてから（押しただけで、行が浮いてちらつかない）
const sensors = [
  PointerSensor.configure({
    activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })],
  }),
];
// 周りの行がずれる動きを、SortableTableBody（motion="slide"）と同じ長さと緩急にそろえる
const transition = { duration: 250, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' };

// 表の行は DragOverlay（写し）を使わず、引いている行そのものを動かす
//   写しは表の外に描かれるので、列の幅が合わない。dnd-kit は行（tr）を動かすとき、セルの幅を保つ
export function SortableTaskTable({
  defaultTasks: tasks,
  label,
}: {
  defaultTasks: Task[];
  label: string;
}) {
  const [order, setOrder] = useState(() => tasks.map((task) => task.id));
  const taskOf = (id: string) => tasks.find((task) => task.id === id);
  return (
    <DragDropProvider
      sensors={sensors}
      plugins={(defaults) => defaults.filter((plugin) => plugin !== Accessibility)}
      onDragEnd={(event) => setOrder((current) => move(current, event))}
    >
      <DataTable accessibleName={label}>
        <TableHead>
          <TableRow>
            {/* 取っ手の列。見出しは読み上げだけに出す */}
            <DataTableHeader className="w-px">
              <VisuallyHidden>並べ替え</VisuallyHidden>
            </DataTableHeader>
            <DataTableHeader>作業</DataTableHeader>
            <DataTableHeader>担当</DataTableHeader>
            <DataTableHeader>状態</DataTableHeader>
            <DataTableHeader className="w-px">
              <VisuallyHidden>操作</VisuallyHidden>
            </DataTableHeader>
          </TableRow>
        </TableHead>
        {/* ドラッグしなくても並べ替えられるよう、行の末尾に ︙ のメニューを置く（WCAG 2.2 の 2.5.7） */}
        <SortableTableBody value={order} onValueChange={setOrder} moveActions="item-menu">
          {order.map((id, index) => {
            const task = taskOf(id);
            return task ? <TaskRow key={id} task={task} index={index} /> : null;
          })}
        </SortableTableBody>
      </DataTable>
    </DragDropProvider>
  );
}

function TaskRow({ task, index }: { task: Task; index: number }) {
  const { ref, handleRef, isDragging } = useSortable({ id: task.id, index, transition });
  return (
    <SortableItem
      ref={ref}
      render={<DataTableRow />}
      value={task.id}
      dragging={isDragging}
      accessibleName={task.title}
    >
      {/* つまみだけを入れたセルは、つまみの幅に詰まる */}
      <TableCell>
        <SortableHandle ref={handleRef} />
      </TableCell>
      <TableCell>{task.title}</TableCell>
      <TableCell>{task.owner}</TableCell>
      <TableCell>
        <Tag color={statusColor[task.status]}>{task.status}</Tag>
      </TableCell>
      <TableCell>
        <SortableItemActions />
      </TableCell>
    </SortableItem>
  );
}
