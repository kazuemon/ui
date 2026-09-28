'use client';

// タスクボードの見本の「ボード」: 状態ごとの列に Sortable を置き、dnd-kit で列の中と列のあいだを引いて動かす
// つなぎ方は src/recipes/sortable-dnd-kit.tsx（Recipes/Sortable）と同じ。列が複数あるので、次を足している
//   - 並びは列ごとの id の配列（Columns）で持ち、dnd-kit の move にそのまま渡す（Record の形も扱える）
//   - 項目は useSortable の group に列の名前を渡す。列そのものも入れる場所（useDroppable）にして、空の列にも置けるようにする
//   - 列をまたぐ動きは引いているあいだ（onDragOver）に並びへ写し、取り消したら（Esc）引く前の並びに戻す
// キーボードと ︙ のメニューで動かせるのは列の中だけ。列を移すのは、横のパネルの「状態」で選ぶ（引かずに終えられる）
import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import {
  Avatar,
  AvatarGroup,
  Heading,
  Link,
  ScrollArea,
  Skeleton,
  Sortable,
  SortableHandle,
  SortableItem,
  type SortableMoveActions,
  type SortableVariant,
  Tag,
  Text,
} from '@kazuemon/ui';
import { type Dispatch, type SetStateAction, useRef } from 'react';

import {
  type Columns,
  formatDue,
  priorityColor,
  priorityLabel,
  statuses,
  statusLabel,
  type Task,
  type TaskStatus,
  today,
} from './tasks-data';

const sensors = [
  PointerSensor.configure({
    activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })],
  }),
];
// Sortable（motion="slide"）の動きと、長さと緩急をそろえる
const transition = { duration: 250, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' };
// dnd-kit の CollisionPriority.Low。列（入れる場所）より、列の中の項目に当たったほうを先に採る
const columnPriority = 1;

export function TaskBoard({
  tasks,
  columns,
  setColumns,
  variant,
  moveActions,
  onOpen,
}: {
  tasks: Record<string, Task>;
  columns: Columns;
  setColumns: Dispatch<SetStateAction<Columns>>;
  variant: SortableVariant;
  moveActions: SortableMoveActions;
  /** タスクの題を押したとき。押した要素を、パネルを閉じたときに焦点を戻す先として渡す */
  onOpen: (id: string, trigger: HTMLElement) => void;
}) {
  // 引き始めたときの並び。Esc で取り消したら、ここへ戻す
  const before = useRef(columns);
  return (
    <DragDropProvider
      sensors={sensors}
      plugins={(defaults) => defaults.filter((plugin) => plugin !== Accessibility)}
      onDragStart={() => {
        before.current = columns;
      }}
      onDragOver={(event) => setColumns((current) => move(current, event))}
      onDragEnd={(event) => {
        if (event.canceled) setColumns(before.current);
      }}
    >
      {/* 狭い幅では、列を横に送る */}
      <ScrollArea orientation="horizontal" accessibleName="ボードの列">
        <div className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 pb-2">
          {statuses.map((status) => (
            <Column key={status} status={status} count={columns[status].length}>
              <Sortable
                value={columns[status]}
                onValueChange={(order) =>
                  setColumns((current) => ({ ...current, [status]: order }))
                }
                aria-label={statusLabel[status]}
                variant={variant}
                moveActions={moveActions}
                className="min-h-full"
              >
                {columns[status].map((id, index) => (
                  <TaskItem
                    key={id}
                    task={tasks[id]}
                    index={index}
                    status={status}
                    onOpen={onOpen}
                  />
                ))}
              </Sortable>
            </Column>
          ))}
        </div>
      </ScrollArea>
      {/* 引いているあいだ、ポインタについて動く写し。題はリンクにせず、文字だけを描く */}
      <DragOverlay tag="ul" dropAnimation={transition}>
        {(source) => {
          const task = tasks[String(source.id)];
          return task ? (
            <SortableItem value={task.id} dragging>
              <SortableHandle />
              <TaskCard task={task} finished={columns.done.includes(task.id)} />
            </SortableItem>
          ) : null;
        }}
      </DragOverlay>
    </DragDropProvider>
  );
}

/** 状態 1 つ分の列。列そのものを入れる場所にして、空になった列にもタスクを置けるようにする */
function Column({
  status,
  count,
  children,
}: {
  status: TaskStatus;
  count: number;
  children: React.ReactNode;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
    type: 'column',
    accept: 'task',
    collisionPriority: columnPriority,
  });
  return (
    <section
      aria-labelledby={`column-${status}`}
      className="flex min-w-0 flex-col gap-3 rounded-card bg-neutral p-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <Heading level={2} size={4} id={`column-${status}`}>
          {statusLabel[status]}
        </Heading>
        <Text as="span" size="sm" variant="subtle">
          {count} 件
        </Text>
      </div>
      <div
        ref={ref}
        data-drop-target={isDropTarget || undefined}
        className="relative flex min-h-24 flex-1 flex-col"
      >
        {children}
        {count === 0 && (
          // 空の列: 置ける場所だと分かるよう、点線の枠だけを出す（Sortable の入る場所と同じ見た目）
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-card border border-dashed border-line">
            <Text as="span" size="sm" variant="subtle">
              ここに置けます
            </Text>
          </div>
        )}
      </div>
    </section>
  );
}

function TaskItem({
  task,
  index,
  status,
  onOpen,
}: {
  task: Task;
  index: number;
  status: TaskStatus;
  onOpen: (id: string, trigger: HTMLElement) => void;
}) {
  const { ref, handleRef, isDragSource } = useSortable({
    id: task.id,
    index,
    group: status,
    type: 'task',
    accept: 'task',
    transition,
  });
  return (
    <SortableItem ref={ref} value={task.id} dragSource={isDragSource} accessibleName={task.title}>
      <SortableHandle ref={handleRef} />
      <TaskCard task={task} finished={status === 'done'} onOpen={onOpen} />
    </SortableItem>
  );
}

/** カードの中身: 題、優先度と期日、担当とサブタスクの進み */
function TaskCard({
  task,
  finished,
  onOpen,
}: {
  task: Task;
  /** 完了の列にいるか。完了したタスクは、期日を過ぎても知らせない */
  finished: boolean;
  onOpen?: (id: string, trigger: HTMLElement) => void;
}) {
  const done = task.subtasks.filter((s) => s.done).length;
  const overdue = !finished && task.due < today;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
      {onOpen ? (
        <Link
          href={`#task-${task.id}`}
          onClick={(event) => {
            event.preventDefault();
            onOpen(task.id, event.currentTarget);
          }}
        >
          {task.title}
        </Link>
      ) : (
        <span>{task.title}</span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Tag color={priorityColor[task.priority]}>優先度 {priorityLabel[task.priority]}</Tag>
        <Text as="span" size="sm" variant="subtle">
          {formatDue(task.due)} まで
        </Text>
        {overdue && <Tag color="danger">期日を過ぎています</Tag>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <AvatarGroup size="sm" max={3}>
          {task.assignees.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
        {task.subtasks.length > 0 && (
          <Text as="span" size="sm" variant="subtle">
            サブタスク {done}/{task.subtasks.length}
          </Text>
        )}
      </div>
    </div>
  );
}

/** 読み込み中のボード: 列の形と、カードの代わりの面だけを置く */
export function TaskBoardSkeleton() {
  return (
    <ScrollArea orientation="horizontal" viewportProps={{ 'aria-hidden': true }}>
      <div className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 pb-2">
        {statuses.map((status, i) => (
          <div key={status} className="flex flex-col gap-3 rounded-card bg-neutral p-3">
            <Skeleton variant="text" className="w-20" />
            {Array.from({ length: 3 - (i % 2) }, (_, j) => (
              <Skeleton key={j} className="h-24" />
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
