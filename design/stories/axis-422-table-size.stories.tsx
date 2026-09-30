import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableSize,
  type TableVariant,
} from '../../src/components/table/Table';

// 軸 422: Table の詰めた余白（size="sm"）
const meta = {
  title: 'Design Review/422 表の詰めた余白',
  id: 'design-review-422-table-size',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
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

const same = {
  '--table-sm-text-fine': 'var(--text-body-fine)',
  '--table-sm-text-coarse': 'var(--text-body-coarse)',
  '--table-sm-leading-fine': 'var(--leading-body-fine)',
  '--table-sm-leading-coarse': 'var(--leading-body-coarse)',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'md と同じ',
    intent: 'size="sm" を渡しても変わらない。比べるための基準',
    spec: [
      ['セルの余白', '左右 12px・上下 8px'],
      ['文字', '本文（マウス 16/28・指 14/24）'],
      ['1 行の高さ', 'マウス 44px・指 40px'],
    ],
    tokens: {
      '--table-sm-cell-px': 'calc(var(--spacing) * 3)',
      '--table-sm-cell-py': 'calc(var(--spacing) * 2)',
      ...same,
    },
  },
  {
    id: 'A',
    name: '上下だけ詰める',
    intent:
      '文字は本文のまま、上下の余白を半分にする。読みやすさは変えずに、一度に見える行を増やす',
    spec: [
      ['セルの余白', '左右 12px・上下 4px'],
      ['文字', '本文（マウス 16/28・指 14/24）'],
      ['1 行の高さ', 'マウス 36px・指 32px'],
    ],
    tokens: {
      '--table-sm-cell-px': 'calc(var(--spacing) * 3)',
      '--table-sm-cell-py': 'calc(var(--spacing) * 1)',
      ...same,
    },
  },
  {
    id: 'B',
    name: '文字も一段小さく',
    intent:
      '上下左右を詰め、文字を小さい本文（body-sm）にする。管理画面の一覧のような、列も行も多い表向け',
    spec: [
      ['セルの余白', '左右 8px・上下 4px'],
      ['文字', '小さい本文（マウス 14/24・指 12/20）'],
      ['1 行の高さ', 'マウス 32px・指 28px'],
    ],
    tokens: {
      '--table-sm-cell-px': 'calc(var(--spacing) * 2)',
      '--table-sm-cell-py': 'calc(var(--spacing) * 1)',
      '--table-sm-text-fine': 'var(--text-body-sm-fine)',
      '--table-sm-text-coarse': 'var(--text-body-sm-coarse)',
      '--table-sm-leading-fine': 'var(--leading-body-sm-fine)',
      '--table-sm-leading-coarse': 'var(--leading-body-sm-coarse)',
    },
  },
  {
    id: 'C',
    name: '上下左右を少し詰める',
    intent:
      '文字は本文のまま、上下 6px・左右 8px。A より列のあいだも詰まり、横に長い表で列が多く見える',
    spec: [
      ['セルの余白', '左右 8px・上下 6px'],
      ['文字', '本文（マウス 16/28・指 14/24）'],
      ['1 行の高さ', 'マウス 40px・指 36px'],
    ],
    tokens: {
      '--table-sm-cell-px': 'calc(var(--spacing) * 2)',
      '--table-sm-cell-py': 'calc(var(--spacing) * 1.5)',
      ...same,
    },
  },
];

const columns: Column[] = [
  { label: 'md（基準）', note: 'いまの余白。どの行も同じ' },
  { label: 'sm・lines' },
  { label: 'sm・framed' },
  { label: 'sm・banded', note: 'banded の広い余白より sm を優先' },
];

const rows = [
  { name: '森の文具店', city: '札幌', orders: 128, amount: 384000 },
  { name: 'ひだまり雑貨', city: '仙台', orders: 64, amount: 172800 },
  { name: '港町ベーカリー', city: '神戸', orders: 212, amount: 95400 },
  { name: 'そらいろ書房', city: '福岡', orders: 37, amount: 148000 },
  { name: 'あさがお花店', city: '金沢', orders: 91, amount: 206500 },
];
const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;

function Shops({ variant, size }: { variant: TableVariant; size: TableSize }) {
  return (
    <div className="w-[380px]">
      <Table variant={variant} size={size} accessibleName="お店">
        <TableHead>
          <TableRow>
            <TableHeader>お店</TableHeader>
            <TableHeader>地域</TableHeader>
            <TableHeader align="end">注文</TableHeader>
            <TableHeader align="end">売上</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.city}</TableCell>
              <TableCell align="end">{row.orders}</TableCell>
              <TableCell align="end">{yen(row.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('md')) return <Shops variant="lines" size="md" />;
  if (column.label.endsWith('framed')) return <Shops variant="framed" size="sm" />;
  if (column.label.includes('banded')) return <Shops variant="banded" size="sm" />;
  return <Shops variant="lines" size="sm" />;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={422}
      axis="表の詰めた余白"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        Table に size（'sm' | 'md'。既定は
        md）を足しました。行の多い一覧を、一度に多く見せるための詰めた余白です。
      </p>
      <p>
        選ぶのは、sm
        のセルの余白と文字の大きさです。ツールバーの「密度」で、マウスと指の両方を見てください（文字は密度で切り替わります）。
      </p>
    </Comparison>
  ),
};
