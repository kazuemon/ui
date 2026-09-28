// タスクボードの見本（tasks.tsx）の架空のデータと、ボード・表・横のパネルで共有する型

export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';
export type TaskPriority = 'high' | 'mid' | 'low';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

/** タスク 1 つ分。状態（どの列にいるか）は、ここではなく列の並び（Columns）で持つ */
export interface Task {
  id: string;
  title: string;
  /** 担当する人（members の名前） */
  assignees: string[];
  /** 期日（ISO 8601 の日付） */
  due: string;
  priority: TaskPriority;
  subtasks: Subtask[];
  note?: string;
}

/** 列ごとの並び（タスクの id）。dnd-kit の move がそのまま扱える形 */
export type Columns = Record<TaskStatus, string[]>;

/** 表に出す行。列の並びから状態を足したもの */
export type TaskRow = Task & { status: TaskStatus };

export const statuses: TaskStatus[] = ['todo', 'doing', 'review', 'done'];

export const statusLabel: Record<TaskStatus, string> = {
  todo: 'これから',
  doing: '進行中',
  review: '確認待ち',
  done: '完了',
};
export const statusColor = {
  todo: 'neutral',
  doing: 'info',
  review: 'warning',
  done: 'success',
} as const;

export const priorityLabel: Record<TaskPriority, string> = { high: '高', mid: '中', low: '低' };
export const priorityColor = { high: 'danger', mid: 'warning', low: 'neutral' } as const;
/** 並べ替えに使う重さ（大きいほど急ぐ） */
export const priorityRank: Record<TaskPriority, number> = { high: 3, mid: 2, low: 1 };

/** 見本の「今日」。期日を過ぎたかどうかを、開いた日で変えない */
export const today = '2026-09-28';

/** 「10月3日」の形。年は今年なので書かない */
export function formatDue(due: string) {
  const [, month, day] = due.split('-').map(Number);
  return `${month}月${day}日`;
}

export const members = ['かずえもん', 'Hanako Yamada', 'Taro Suzuki', 'Mika Tanaka', 'Ken Ito'];

const sub = (id: string, titles: [string, boolean][]): Subtask[] =>
  titles.map(([title, done], i) => ({ id: `${id}-${i}`, title, done }));

const taskList: Task[] = [
  {
    id: 't1',
    title: 'Sidebar の比較を作る',
    assignees: ['かずえもん'],
    due: '2026-10-02',
    priority: 'high',
    subtasks: sub('t1', [
      ['折りたたみの案を 3 つ並べる', true],
      ['指で押して幅を確かめる', false],
      ['比較画像を撮る', false],
    ]),
    note: 'rail の幅は Navbar の高さとそろえる。',
  },
  {
    id: 't2',
    title: 'ドキュメントの検索をつなぐ',
    assignees: ['Taro Suzuki', 'Ken Ito'],
    due: '2026-10-09',
    priority: 'mid',
    subtasks: sub('t2', [
      ['索引を作るスクリプト', false],
      ['検索の欄を帯に置く', false],
    ]),
  },
  {
    id: 't3',
    title: 'README の一覧を並べ直す',
    assignees: ['Hanako Yamada'],
    due: '2026-10-14',
    priority: 'low',
    subtasks: [],
  },
  {
    id: 't4',
    title: 'DataTable の見本を書く',
    assignees: ['かずえもん', 'Taro Suzuki'],
    due: '2026-09-30',
    priority: 'high',
    subtasks: sub('t4', [
      ['並べ替えと選択', true],
      ['ページ送り', true],
      ['空の行と読み込み中', false],
    ]),
  },
  {
    id: 't5',
    title: '和文フォントの補正を見直す',
    assignees: ['Mika Tanaka'],
    due: '2026-10-05',
    priority: 'mid',
    subtasks: sub('t5', [
      ['ベースラインを測る', true],
      ['補正の CSS を作り直す', false],
    ]),
  },
  {
    id: 't6',
    title: 'Toast の読み上げを確かめる',
    assignees: ['Ken Ito', 'Hanako Yamada', 'Mika Tanaka', 'Taro Suzuki'],
    due: '2026-09-26',
    priority: 'high',
    subtasks: sub('t6', [
      ['NVDA', true],
      ['VoiceOver', false],
    ]),
    note: '2 つ続けて出したときに、前の知らせが読み切られるか。',
  },
  {
    id: 't7',
    title: '見本のページに SNS を足す',
    assignees: ['Hanako Yamada', 'かずえもん'],
    due: '2026-09-27',
    priority: 'mid',
    subtasks: sub('t7', [
      ['タイムライン', true],
      ['投稿の欄', true],
    ]),
  },
  {
    id: 't8',
    title: '0.2.0 のリリースノート',
    assignees: ['かずえもん'],
    due: '2026-10-20',
    priority: 'low',
    subtasks: [],
  },
  {
    id: 't9',
    title: 'Storybook を 10 に上げる',
    assignees: ['Taro Suzuki'],
    due: '2026-09-20',
    priority: 'mid',
    subtasks: [],
  },
  {
    id: 't10',
    title: '密度の切り替えを実機で押す',
    assignees: ['Mika Tanaka', 'Ken Ito'],
    due: '2026-09-18',
    priority: 'low',
    subtasks: sub('t10', [
      ['iPhone', true],
      ['Android', true],
    ]),
  },
];

export const initialTasks: Record<string, Task> = Object.fromEntries(
  taskList.map((task) => [task.id, task])
);

export const initialColumns: Columns = {
  todo: ['t1', 't2', 't3', 't8'],
  doing: ['t4', 't5'],
  review: ['t6', 't7'],
  done: ['t9', 't10'],
};

export const emptyColumns: Columns = { todo: [], doing: [], review: [], done: [] };
