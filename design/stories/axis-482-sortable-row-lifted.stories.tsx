import type { Meta, StoryObj } from '@storybook/react-vite';

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
import type { TableVariant } from '../../src/components/table/Table';
import { Tag } from '../../src/components/tag/Tag';
import { VisuallyHidden } from '../../src/components/visually-hidden/VisuallyHidden';

// 軸 482: 表の行を引いているあいだの、動かしている行の見た目
const meta = {
  title: 'Design Review/482 表の動かしている行',
  id: 'design-review-482-sortable-row-lifted',
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

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'リストと同じ持ち上げ',
    intent:
      'リストの持ち上げた項目（白い面・濃く近い影と細い輪郭・1.03 倍）を、そのまま行に当てる。行は幅が広いので、大きくした分が左右に大きくはみ出す',
    spec: [
      ['面', '白'],
      ['影', 'リストと同じ（濃く近い影＋細い輪郭）'],
      ['大きさ', '1.03 倍'],
    ],
    tokens: {
      '--sortable-row-lifted-bg': 'var(--sortable-lifted-bg)',
      '--sortable-row-lifted-shadow': 'var(--sortable-lifted-shadow)',
      '--sortable-row-lifted-scale': 'var(--sortable-lifted-scale)',
    },
  },
  {
    id: 'A',
    name: '大きくしない',
    intent: '影と輪郭はリストと同じにして、大きさは変えない。列の線がずれず、行の幅のまま浮く',
    spec: [
      ['面', '白'],
      ['影', 'リストと同じ'],
      ['大きさ', '変えない'],
    ],
    tokens: {
      '--sortable-row-lifted-bg': 'var(--sortable-lifted-bg)',
      '--sortable-row-lifted-shadow': 'var(--sortable-lifted-shadow)',
      '--sortable-row-lifted-scale': '1',
    },
  },
  {
    id: 'B',
    name: 'グレーの面＋影',
    intent:
      '面を入力欄の塗りにして、引いている行を面の色でも見分ける。影はリストと同じ、大きさは変えない',
    spec: [
      ['面', '入力欄の塗り（グレー）'],
      ['影', 'リストと同じ'],
      ['大きさ', '変えない'],
    ],
    tokens: {
      '--sortable-row-lifted-bg': 'var(--color-field)',
      '--sortable-row-lifted-shadow': 'var(--sortable-lifted-shadow)',
      '--sortable-row-lifted-scale': '1',
    },
  },
  {
    id: 'C',
    name: '影なし・濃い輪郭',
    intent:
      '浮かせず、白い面に濃い輪郭の線だけを引く。ページと同じレイヤーのまま動く（原則1 に近いが、持っている実感は弱い）',
    spec: [
      ['面', '白'],
      ['影', 'なし（濃い線の輪郭）'],
      ['大きさ', '変えない'],
    ],
    tokens: {
      '--sortable-row-lifted-bg': 'var(--color-surface)',
      '--sortable-row-lifted-shadow': '0 0 0 var(--border-width-medium) var(--color-line-strong)',
      '--sortable-row-lifted-scale': '1',
    },
  },
];

const columns: Column[] = [
  { label: 'lines', note: '2 行目を引いているところ' },
  { label: 'framed' },
  { label: 'banded' },
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
const order = tasks.map((task) => task.id);

function Tasks({ variant }: { variant: TableVariant }) {
  return (
    <div className="w-[400px] py-2">
      <DataTable variant={variant} accessibleName="作業">
        <TableHead>
          <TableRow>
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
        <SortableTableBody value={order} moveActions="item-menu">
          {tasks.map((task, index) => (
            <SortableItem
              key={task.id}
              value={task.id}
              render={<DataTableRow />}
              dragging={index === 1}
              accessibleName={task.title}
            >
              <TableCell>
                <SortableHandle />
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
          ))}
        </SortableTableBody>
      </DataTable>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={482}
      axis="表の動かしている行"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Tasks variant={column.label as TableVariant} />}
    >
      <p>
        決定: A。動かしている行は、枠（表・divided
        の枠など）の中にあるときは大きくしない。影と輪郭はリストと同じ。枠がないときはリストと同じ（大きくする）。ユーザーの返事「枠の中にあるなら大きくしない、枠がないならリストと同じでいいかなと思いました。」候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        表の行をポインタで引いているあいだ、引いている行そのものがポインタについて動きます（表の行では、表の外に写しを描くと列の幅が合わないため）。元の場所は空いたまま、周りの行がずれて入る場所を空けます。
      </p>
      <p>
        選ぶのは、動かしている行の見た目です。ここでは 2
        行目を、置いてある場所のまま引いている見た目にしています（表の枠の中なので、左右にはみ出した影は切れて見えます。引いているあいだは表の外に重なるので切れません）。実際の動きは
        Recipes/Sortable の「表の行」で、つまみを引いて確かめられます。
      </p>
    </Comparison>
  ),
};
