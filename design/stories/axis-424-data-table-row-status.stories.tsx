import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DataTable } from '../../src/components/data-table/DataTable';
import { DataTableHeader } from '../../src/components/data-table/DataTableHeader';
import {
  DataTableRow,
  type DataTableRowStatus,
} from '../../src/components/data-table/DataTableRow';
import { DataTableSelectCell } from '../../src/components/data-table/DataTableSelect';
import { TableBody, TableCell, TableHead, TableRow } from '../../src/components/table/Table';
import type { TableVariant } from '../../src/components/table/Table';
import { Tag } from '../../src/components/tag/Tag';
import { statePseudo } from '../../src/stories/story-states';

// 軸 424: DataTable の行の状態（status: muted・warning・danger）
const meta = {
  title: 'Design Review/424 データの表の行の状態',
  id: 'design-review-424-data-table-row-status',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({ hover: '[data-slot="data-table-row"][data-status]' }),
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

const base = {
  '--data-table-row-warning-edge': 'var(--color-warning)',
  '--data-table-row-danger-edge': 'var(--color-danger)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '見た目なし',
    intent: 'status を渡しても変わらない。状態は「状態」の列のタグだけが伝える。比べるための基準',
    spec: [
      ['muted', '変わらない'],
      ['warning・danger', '変わらない'],
    ],
    tokens: {
      ...base,
      '--data-table-row-muted-fg': 'var(--color-fg)',
      '--data-table-row-warning-fg': 'var(--color-fg)',
      '--data-table-row-warning-bg': 'transparent',
      '--data-table-row-danger-fg': 'var(--color-fg)',
      '--data-table-row-danger-bg': 'transparent',
      '--data-table-row-status-edge-width': '0px',
    },
  },
  {
    id: 'A',
    name: '淡い面',
    intent:
      'warning・danger の行に、状態の色の淡い面を敷く（お知らせ・タグと同じ淡い面）。muted は文字を淡くする',
    spec: [
      ['muted', '文字を淡い文字の色に'],
      ['warning', '警告の淡い面'],
      ['danger', '危険の淡い面'],
    ],
    tokens: {
      ...base,
      '--data-table-row-muted-fg': 'var(--color-fg-subtle)',
      '--data-table-row-warning-fg': 'var(--color-fg)',
      '--data-table-row-warning-bg': 'var(--color-warning-subtle)',
      '--data-table-row-danger-fg': 'var(--color-fg)',
      '--data-table-row-danger-bg': 'var(--color-danger-subtle)',
      '--data-table-row-status-edge-width': '0px',
    },
  },
  {
    id: 'B',
    name: '左端の線',
    intent:
      '面は敷かず、行の左端に状態の色の線を引く。選んだ行の面・載せたときの面と重ならず、行の数が多くても静か',
    spec: [
      ['muted', '文字を淡い文字の色に'],
      ['warning', '左端に 3px の黄色の線'],
      ['danger', '左端に 3px の赤の線'],
    ],
    tokens: {
      ...base,
      '--data-table-row-muted-fg': 'var(--color-fg-subtle)',
      '--data-table-row-warning-fg': 'var(--color-fg)',
      '--data-table-row-warning-bg': 'transparent',
      '--data-table-row-danger-fg': 'var(--color-fg)',
      '--data-table-row-danger-bg': 'transparent',
      '--data-table-row-status-edge-width': 'calc(var(--spacing) * 0.75)',
    },
  },
  {
    id: 'C',
    name: '淡い面＋左端の線',
    intent: 'A と B を重ねる。選んだ行（面が選んだ色に替わる）でも、左端の線で状態が残る',
    spec: [
      ['muted', '文字を淡い文字の色に'],
      ['warning', '警告の淡い面＋3px の線'],
      ['danger', '危険の淡い面＋3px の線'],
    ],
    tokens: {
      ...base,
      '--data-table-row-muted-fg': 'var(--color-fg-subtle)',
      '--data-table-row-warning-fg': 'var(--color-fg)',
      '--data-table-row-warning-bg': 'var(--color-warning-subtle)',
      '--data-table-row-danger-fg': 'var(--color-fg)',
      '--data-table-row-danger-bg': 'var(--color-danger-subtle)',
      '--data-table-row-status-edge-width': 'calc(var(--spacing) * 0.75)',
    },
  },
  {
    id: 'D',
    name: '文字の色',
    intent:
      '面も線も足さず、行の文字を状態の文字の色（オリーブ・赤）にする。いちばん軽いが、色だけで伝える',
    spec: [
      ['muted', '文字を淡い文字の色に'],
      ['warning', '文字を警告の文字の色に'],
      ['danger', '文字を危険の文字の色に'],
    ],
    tokens: {
      ...base,
      '--data-table-row-muted-fg': 'var(--color-fg-subtle)',
      '--data-table-row-warning-fg': 'var(--color-fg-warning)',
      '--data-table-row-warning-bg': 'transparent',
      '--data-table-row-danger-fg': 'var(--color-fg-danger)',
      '--data-table-row-danger-bg': 'transparent',
      '--data-table-row-status-edge-width': '0px',
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: 'lines' },
  { label: '状態の行に hover', preview: 'hover' },
  { label: '選んだ行', note: '遅延・失敗の行を選んだところ' },
  { label: 'framed' },
];

interface Order {
  id: string;
  shop: string;
  label: string;
  tag: 'success' | 'info' | 'neutral' | 'warning' | 'danger';
  amount: number;
  status?: DataTableRowStatus;
}

const orders: Order[] = [
  { id: 'A-1024', shop: '森の文具店', label: '発送済み', tag: 'success', amount: 3200 },
  {
    id: 'A-1025',
    shop: 'ひだまり雑貨',
    label: '発送が遅れています',
    tag: 'warning',
    amount: 12800,
    status: 'warning',
  },
  {
    id: 'A-1026',
    shop: '港町ベーカリー',
    label: '支払いに失敗',
    tag: 'danger',
    amount: 860,
    status: 'danger',
  },
  {
    id: 'A-1027',
    shop: 'そらいろ書房',
    label: '取り消し',
    tag: 'neutral',
    amount: 4500,
    status: 'muted',
  },
  { id: 'A-1028', shop: 'あさがお花店', label: '準備中', tag: 'info', amount: 2100 },
];
const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;

function Orders({
  variant = 'lines',
  selected = [],
}: {
  variant?: TableVariant;
  selected?: string[];
}) {
  return (
    <div className="w-[520px]">
      <DataTable variant={variant} accessibleName="注文">
        <TableHead>
          <TableRow>
            <DataTableHeader className="w-px">
              <span className="sr-only">選ぶ</span>
            </DataTableHeader>
            <DataTableHeader>注文番号</DataTableHeader>
            <DataTableHeader>お店</DataTableHeader>
            <DataTableHeader>状態</DataTableHeader>
            <DataTableHeader align="end">金額</DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <DataTableRow
              key={order.id}
              status={order.status}
              selected={selected.includes(order.id)}
            >
              <DataTableSelectCell
                checked={selected.includes(order.id)}
                accessibleName={`${order.id} を選ぶ`}
              />
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.shop}</TableCell>
              <TableCell>
                <Tag color={order.tag}>{order.label}</Tag>
              </TableCell>
              <TableCell align="end">{yen(order.amount)}</TableCell>
            </DataTableRow>
          ))}
        </TableBody>
      </DataTable>
    </div>
  );
}

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('選んだ')) return <Orders selected={['A-1025', 'A-1026']} />;
  if (column.label.startsWith('framed')) return <Orders variant="framed" />;
  return <Orders />;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={424}
      axis="データの表の行の状態"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        DataTableRow に status（'muted' | 'warning' |
        'danger'）を足しました。取り消した注文（muted）、発送の遅れ（warning）、支払いの失敗（danger）のように、行ごとの状態を一覧で見つけやすくします。
      </p>
      <p>
        選ぶのは、状態の行の見せ方です。どの案でも、状態の文は「状態」の列のタグで出します（色だけで伝えない）。hover
        の列は、状態を持つ行（遅延・失敗・取り消し）に載せたところです。
      </p>
    </Comparison>
  ),
};
