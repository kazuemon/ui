import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DataTable } from '../../src/components/data-table/DataTable';
import {
  DataTableHeader,
  type DataTableSortDirection,
} from '../../src/components/data-table/DataTableHeader';
import { DataTableRow } from '../../src/components/data-table/DataTableRow';
import { TableBody, TableCell, TableHead, TableRow } from '../../src/components/table/Table';
import type { TableVariant } from '../../src/components/table/Table';

// 軸 425: DataTable の読み直しのあいだの見せ方（refreshing）
const meta = {
  title: 'Design Review/425 データの表の読み直し',
  id: 'design-review-425-data-table-refreshing',
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

const bar = 'calc(var(--spacing) * 0.5)';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '見た目なし',
    intent:
      '表に aria-busy を付けるだけ。見た目では読み直していることが分からない。比べるための基準',
    spec: [
      ['本文', 'そのまま'],
      ['線', 'なし'],
    ],
    tokens: {
      '--data-table-refreshing-opacity': '1',
      '--data-table-refreshing-bar-height': '0px',
      '--data-table-refreshing-bar-color': 'var(--color-neutral-strong)',
    },
  },
  {
    id: 'A',
    name: '本文を薄く',
    intent:
      '古い行を半分の濃さにする。いま見えている行が古いことは伝わるが、押せない見た目（原則13）と紛れやすい',
    spec: [
      ['本文', '50% の濃さ'],
      ['線', 'なし'],
    ],
    tokens: {
      '--data-table-refreshing-opacity': '0.5',
      '--data-table-refreshing-bar-height': '0px',
      '--data-table-refreshing-bar-color': 'var(--color-neutral-strong)',
    },
  },
  {
    id: 'B',
    name: '上の端に流れる線',
    intent:
      '表の上の端に、送信中のボタンと同じ流れる線（2px）を出す。行はそのまま読め、押せる（止めない形）',
    spec: [
      ['本文', 'そのまま'],
      ['線', '上の端に 2px・濃いグレー・流れる'],
    ],
    tokens: {
      '--data-table-refreshing-opacity': '1',
      '--data-table-refreshing-bar-height': bar,
      '--data-table-refreshing-bar-color': 'var(--color-neutral-strong)',
    },
  },
  {
    id: 'C',
    name: '線＋本文を少し薄く',
    intent:
      'B に、本文を少しだけ薄くする変化を足す。長い表で線が画面の外にあっても、行が古いことが分かる',
    spec: [
      ['本文', '70% の濃さ'],
      ['線', '上の端に 2px・濃いグレー・流れる'],
    ],
    tokens: {
      '--data-table-refreshing-opacity': '0.7',
      '--data-table-refreshing-bar-height': bar,
      '--data-table-refreshing-bar-color': 'var(--color-neutral-strong)',
    },
  },
];

const columns: Column[] = [
  { label: '読み直し中・lines', note: '並べ替えを押したあと' },
  { label: '読み直し中・framed' },
  { label: '読み直し中・banded' },
  { label: '押して試す', note: '見出しを押すと 1.5 秒読み直す' },
];

const orders = [
  { id: 'A-1024', shop: '森の文具店', amount: 3200 },
  { id: 'A-1025', shop: 'ひだまり雑貨', amount: 12800 },
  { id: 'A-1026', shop: '港町ベーカリー', amount: 860 },
  { id: 'A-1027', shop: 'そらいろ書房', amount: 4500 },
];
const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;

function Orders({
  variant = 'lines',
  refreshing,
  sorted = 'asc',
  onSortClick,
}: {
  variant?: TableVariant;
  refreshing: boolean;
  sorted?: DataTableSortDirection;
  onSortClick?: () => void;
}) {
  const rows = [...orders].sort((a, b) =>
    sorted === 'asc' ? a.amount - b.amount : b.amount - a.amount
  );
  return (
    <div className="w-[400px]">
      <DataTable variant={variant} refreshing={refreshing} accessibleName="注文">
        <TableHead>
          <TableRow>
            <DataTableHeader>注文番号</DataTableHeader>
            <DataTableHeader>お店</DataTableHeader>
            <DataTableHeader align="end" sorted={sorted} onSortClick={onSortClick ?? (() => {})}>
              金額
            </DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((order) => (
            <DataTableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.shop}</TableCell>
              <TableCell align="end">{yen(order.amount)}</TableCell>
            </DataTableRow>
          ))}
        </TableBody>
      </DataTable>
    </div>
  );
}

// 見出しを押すと、1.5 秒読み直してから並べ替える
function Try() {
  const [sorted, setSorted] = useState<DataTableSortDirection>('asc');
  const [pending, setPending] = useState<DataTableSortDirection | null>(null);
  useEffect(() => {
    if (!pending) return undefined;
    const timer = window.setTimeout(() => {
      setSorted(pending);
      setPending(null);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [pending]);
  return (
    <Orders
      refreshing={pending !== null}
      sorted={sorted}
      onSortClick={() => setPending(sorted === 'asc' ? 'desc' : 'asc')}
    />
  );
}

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('押して')) return <Try />;
  if (column.label.endsWith('framed')) return <Orders variant="framed" refreshing />;
  if (column.label.endsWith('banded')) return <Orders variant="banded" refreshing />;
  return <Orders refreshing />;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={425}
      axis="データの表の読み直し"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        DataTable に refreshing（既定は
        false）を足しました。並べ替え・ページ送りのあと、サーバーから新しい行が届くまでのあいだに使います。行は残したまま、表に
        aria-busy を付けます（最初の読み込みは、今までどおり loading と DataTableLoading です）。
      </p>
      <p>
        選ぶのは、読み直していることの見せ方です。線は、送信中のボタンの流れる線と同じ動きです（動きを減らす設定では、幅いっぱいで明滅します）。
      </p>
    </Comparison>
  ),
};
