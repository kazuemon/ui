'use client';

// 見本のページ: 小さなチームのタスクボード。「ボード」と「表」を切り替え、タスクを開くと横のパネル（Inspector）に詳細を出す
// ボードは Sortable を dnd-kit で、表は DataTable を TanStack Table でつなぐ（tasks-board.tsx・tasks-table.tsx）
// 状態（どの列にいるか）は列の並び（Columns）だけで持ち、ボード・表・パネルはそこから読む

import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Collapsible,
  DateField,
  Heading,
  Icon,
  Inspector,
  type InspectorVariant,
  InspectorLayout,
  OverlayClose,
  ScrollArea,
  Select,
  type SortableMoveActions,
  type SortableVariant,
  Spinner,
  StatusPanel,
  Tag,
  Temporal,
  Text,
  Textarea,
  TextField,
  Toggle,
  ToggleGroup,
} from '@kazuemon/ui';
import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { SamplePage } from './sample-page';
import { board } from './sites';
import { TaskBoard, TaskBoardSkeleton } from './tasks-board';
import {
  type Columns,
  emptyColumns,
  initialColumns,
  initialTasks,
  members,
  priorityColor,
  priorityLabel,
  statuses,
  statusLabel,
  type Task,
  type TaskPriority,
  type TaskRow,
  type TaskStatus,
} from './tasks-data';
import { TaskTable } from './tasks-table';
import type { Example } from './types';

type TasksState = 'normal' | 'loading' | 'empty';
type View = 'board' | 'table';

function statusOf(columns: Columns, id: string) {
  return statuses.find((status) => columns[status].includes(id));
}

function TasksScreen({
  state,
  variant,
  moveActions,
  inspectorVariant,
}: {
  state: TasksState;
  variant: SortableVariant;
  moveActions: SortableMoveActions;
  inspectorVariant: InspectorVariant;
}) {
  const [view, setView] = useState<View>('board');
  const [tasks, setTasks] = useState<Record<string, Task>>(() =>
    state === 'empty' ? {} : initialTasks
  );
  const [columns, setColumns] = useState<Columns>(() =>
    state === 'empty' ? emptyColumns : initialColumns
  );
  const [openId, setOpenId] = useState<string | null>(null);
  // 「詳しく書いて足す」のパネルを開いているか。開いているあいだは、タスクの詳細より先に出す
  const [drafting, setDrafting] = useState(false);
  // パネルの中に焦点があるまま閉じたとき、焦点を戻す先（最後に押したタスクの題）
  const returnFocus = useRef<HTMLElement | null>(null);
  const loading = state === 'loading';
  const total = statuses.reduce((sum, status) => sum + columns[status].length, 0);

  const open = useCallback((id: string, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    setDrafting(false);
    setOpenId(id);
  }, []);
  const openDraft = (trigger: HTMLElement) => {
    returnFocus.current = trigger;
    setOpenId(null);
    setDrafting(true);
  };
  const close = () => {
    setOpenId(null);
    setDrafting(false);
  };
  const update = (id: string, patch: Partial<Task>) =>
    setTasks((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  /** 列を移す。移した先の列の末尾に置く */
  const moveTo = (ids: string[], to: TaskStatus) =>
    setColumns((current) => {
      const next = { ...current };
      for (const status of statuses) {
        next[status] = next[status].filter((id) => !ids.includes(id) || status === to);
      }
      next[to] = [...next[to], ...ids.filter((id) => !current[to].includes(id))];
      return next;
    });
  /** タスクを足す。題だけ決めて「これから」の末尾に置き、詳細はあとで開いて書く */
  const addTask = (draft: Partial<Task> & { status?: TaskStatus } = {}) => {
    const { status = 'todo', ...patch } = draft;
    const id = `new-${Object.keys(tasks).length + 1}`;
    setTasks((current) => ({
      ...current,
      [id]: {
        id,
        title: '新しいタスク',
        assignees: ['かずえもん'],
        due: '2026-10-05',
        priority: 'mid',
        subtasks: [],
        ...patch,
      },
    }));
    setColumns((current) => ({ ...current, [status]: [...current[status], id] }));
  };

  const rows = useMemo<TaskRow[]>(
    () => statuses.flatMap((status) => columns[status].map((id) => ({ ...tasks[id], status }))),
    [columns, tasks]
  );
  const openTask = openId ? tasks[openId] : undefined;
  const openStatus = openId ? statusOf(columns, openId) : undefined;

  const empty = (
    <StatusPanel
      size="sm"
      title="まだタスクがありません"
      headingLevel={3}
      icon={<Icon icon={ClipboardTextIcon} size="lg" standalone />}
      actions={
        <Button color="primary" onClick={() => addTask()}>
          タスクを足す
        </Button>
      }
    >
      やることを足すと、ここに並びます。
    </StatusPanel>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={1} size={2}>
          0.2.0 のリリース
        </Heading>
        <Text variant="muted" className="mt-1">
          10 月 20 日の公開までに、やることです。題を押すと、横に詳細が開きます。
        </Text>
      </div>

      {/* 領域（InspectorLayout）は親の高さいっぱいに広がるので、ここで高さを決める */}
      <div className="flex h-[720px] flex-col overflow-hidden rounded-card border border-line bg-bg">
        <InspectorLayout
          open={drafting || openTask !== undefined}
          onOpenChange={(next) => !next && close()}
          header={
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
              <ToggleGroup
                aria-label="表示"
                value={[view]}
                // 押している方をもう一度押すと空になるので、そのときは替えない
                onValueChange={(value) => value[0] && setView(value[0] as View)}
              >
                <Toggle value="board">ボード</Toggle>
                <Toggle value="table">表</Toggle>
              </ToggleGroup>
              <div className="flex items-center gap-3">
                {loading && (
                  <Text
                    as="span"
                    size="sm"
                    variant="muted"
                    className="inline-flex items-center gap-2"
                  >
                    <Spinner />
                    読み込んでいます
                  </Text>
                )}
                <Button
                  variant="outline"
                  onClick={(event) => openDraft(event.currentTarget)}
                  disabled={loading}
                >
                  詳しく書いて足す
                </Button>
                <Button color="primary" onClick={() => addTask()} disabled={loading}>
                  タスクを足す
                </Button>
              </div>
            </div>
          }
          inspector={
            <Inspector
              variant={inspectorVariant}
              title={drafting ? 'タスクを足す' : (openTask?.title ?? '')}
              description={
                drafting
                  ? '題のほかは、あとからでも書けます'
                  : openStatus && statusLabel[openStatus]
              }
              returnFocus={returnFocus}
              // 見出しの上を広めに空け、上の帯（切り替えとボタン）と詰まって見えないようにする
              className="pt-4"
              actions={
                drafting ? (
                  <>
                    <OverlayClose render={<Button variant="outline">やめる</Button>} />
                    <Button color="primary" type="submit" form="new-task">
                      足す
                    </Button>
                  </>
                ) : undefined
              }
            >
              {drafting && (
                <NewTaskForm
                  onSubmit={(draft) => {
                    addTask(draft);
                    close();
                  }}
                />
              )}
              {!drafting && openTask && openStatus && (
                <TaskDetails
                  // 開くタスクが替わったら、パネルの中身（開閉や入力の途中）を作り直す
                  key={openTask.id}
                  task={openTask}
                  status={openStatus}
                  onStatusChange={(to) => moveTo([openTask.id], to)}
                  onChange={(patch) => update(openTask.id, patch)}
                />
              )}
            </Inspector>
          }
        >
          {/* 領域の高さに収まらない分は、ここでスクロールする（横はボードと表がそれぞれ受け持つ） */}
          <ScrollArea
            orientation="vertical"
            className="h-full"
            contentProps={{ className: 'p-4', 'aria-busy': loading }}
          >
            {view === 'board' ? (
              loading ? (
                <TaskBoardSkeleton />
              ) : total === 0 ? (
                <div className="py-10">{empty}</div>
              ) : (
                <TaskBoard
                  tasks={tasks}
                  columns={columns}
                  setColumns={setColumns}
                  variant={variant}
                  moveActions={moveActions}
                  onOpen={open}
                />
              )
            ) : (
              <TaskTable
                rows={rows}
                loading={loading}
                onOpen={open}
                onComplete={(ids) => moveTo(ids, 'done')}
                empty={empty}
              />
            )}
          </ScrollArea>
        </InspectorLayout>
      </div>
    </div>
  );
}

/** 「詳しく書いて足す」のパネルの中身。足すボタンはパネルの下の端（actions）にあり、form 属性でこのフォームを送る */
function NewTaskForm({
  onSubmit,
}: {
  onSubmit: (draft: Partial<Task> & { status: TaskStatus }) => void;
}) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [due, setDue] = useState('2026-10-05');
  const [assignee, setAssignee] = useState(members[0]);
  const [priority, setPriority] = useState<TaskPriority>('mid');
  const [note, setNote] = useState('');
  const [error, setError] = useState(false);
  return (
    <form
      id="new-task"
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim() === '') {
          setError(true);
          return;
        }
        onSubmit({ title: title.trim(), status, due, assignees: [assignee], priority, note });
      }}
    >
      <TextField
        label="題"
        value={title}
        onValueChange={(value) => {
          setTitle(value);
          if (value.trim() !== '') setError(false);
        }}
        errorText={error ? '題を入れてください' : undefined}
        required
      />
      <Select
        label="状態"
        items={statuses.map((s) => ({ label: statusLabel[s], value: s }))}
        value={status}
        onValueChange={(value) => value && setStatus(value as TaskStatus)}
      />
      <DateField
        label="期日"
        defaultValue={Temporal.PlainDate.from(due)}
        onValueChange={(value) => value && setDue(value.toString())}
      />
      <Select
        label="担当"
        items={members.map((name) => ({ label: name, value: name }))}
        value={assignee}
        onValueChange={(value) => value && setAssignee(value)}
      />
      <Select
        label="優先度"
        items={(['high', 'mid', 'low'] as const).map((p) => ({
          label: priorityLabel[p],
          value: p,
        }))}
        value={priority}
        onValueChange={(value) => value && setPriority(value as TaskPriority)}
      />
      <Textarea label="メモ" value={note} onValueChange={setNote} />
    </form>
  );
}

/** 横のパネルの中身: 状態・期日・担当・優先度・サブタスク・メモ */
function TaskDetails({
  task,
  status,
  onStatusChange,
  onChange,
}: {
  task: Task;
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  onChange: (patch: Partial<Task>) => void;
}) {
  const done = task.subtasks.filter((s) => s.done).length;
  return (
    <div className="flex flex-col gap-5">
      {/* 列を移すのは、引かずにここでもできる（ボードのキーボード操作は列の中だけ） */}
      <Select
        label="状態"
        items={statuses.map((s) => ({ label: statusLabel[s], value: s }))}
        value={status}
        onValueChange={(value) => value && onStatusChange(value as TaskStatus)}
      />
      {/* 打っている途中（年・月・日がそろわない）は null が来るので、欄に値を持たせ、そろったときだけ書き戻す */}
      <DateField
        label="期日"
        defaultValue={Temporal.PlainDate.from(task.due)}
        onValueChange={(value) => value && onChange({ due: value.toString() })}
      />
      <div className="flex flex-col gap-2">
        <Text variant="label">担当</Text>
        <div className="flex items-center gap-3">
          <AvatarGroup size="sm" expandOnHover>
            {task.assignees.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
          <Text as="span" size="sm" variant="muted">
            {task.assignees.join('、')}
          </Text>
        </div>
      </div>
      <Select
        label="担当を足す"
        placeholder="メンバーを選ぶ"
        items={members
          .filter((name) => !task.assignees.includes(name))
          .map((name) => ({ label: name, value: name }))}
        value={null}
        onValueChange={(value) => value && onChange({ assignees: [...task.assignees, value] })}
        disabled={task.assignees.length === members.length}
      />
      <div className="flex flex-col gap-2">
        <Text variant="label">優先度</Text>
        <div>
          <Tag color={priorityColor[task.priority]}>{priorityLabel[task.priority]}</Tag>
        </div>
      </div>
      {task.subtasks.length > 0 && (
        <Collapsible
          variant="divided"
          title={`サブタスク（${done}/${task.subtasks.length} 完了）`}
          defaultOpen={done < task.subtasks.length}
        >
          <div className="flex flex-col gap-2">
            {task.subtasks.map((subtask) => (
              <Checkbox
                key={subtask.id}
                label={subtask.title}
                checked={subtask.done}
                onCheckedChange={(checked) =>
                  onChange({
                    subtasks: task.subtasks.map((s) =>
                      s.id === subtask.id ? { ...s, done: checked } : s
                    ),
                  })
                }
              />
            ))}
          </div>
        </Collapsible>
      )}
      <Textarea label="メモ" value={task.note ?? ''} onValueChange={(note) => onChange({ note })} />
    </div>
  );
}

export const example: Example = {
  slug: 'tasks',
  title: 'タスクボード',
  description: 'チームのタスクを、ボードと表で管理する画面',
  initialLabel: '読み込み済み',
  presets: [
    { label: '読み込み中', args: { state: 'loading' } },
    { label: '空', args: { state: 'empty' } },
  ],
  controls: [
    {
      name: 'variant',
      label: 'カードの面',
      type: 'radio',
      options: [
        { value: 'card', label: '白い面', caption: '白い面と細い輪郭' },
        { value: 'fill', label: 'グレーの塗り', caption: '入力欄と同じ塗り' },
        { value: 'divided', label: '線で区切る', caption: '列を 1 つの枠にまとめます' },
      ],
    },
    {
      name: 'moveActions',
      label: '引かずに並べ替える操作',
      caption: 'ボードで、ドラッグしなくても列の中で並べ替えられるようにします',
      type: 'radio',
      options: [
        { value: 'item-menu', label: '︙ のメニュー' },
        { value: 'buttons', label: '上へ・下へのボタン' },
        { value: 'none', label: '出さない' },
      ],
    },
    {
      name: 'inspectorVariant',
      label: '詳細のパネル',
      type: 'radio',
      options: [
        { value: 'push', label: '押しのける', caption: '本文の幅を狭めて、横に並べます' },
        {
          value: 'overlay',
          label: '重ねる',
          caption: '本文の上に重ねます。本文の幅は変わりません',
        },
      ],
    },
  ],
  defaults: {
    state: 'normal',
    variant: 'card',
    moveActions: 'item-menu',
    inspectorVariant: 'push',
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={board} current="ボード" width="full">
      {/* 状態を替えたら、タスクと並びをはじめからにする */}
      <TasksScreen
        key={args.state as string}
        state={args.state as TasksState}
        variant={args.variant as SortableVariant}
        moveActions={args.moveActions as SortableMoveActions}
        inspectorVariant={args.inspectorVariant as InspectorVariant}
      />
    </SamplePage>
  ),
};
