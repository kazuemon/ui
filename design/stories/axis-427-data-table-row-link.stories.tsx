import type { Meta, StoryObj } from '@storybook/react-vite';
import { type MouseEvent, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DataTable } from '../../src/components/data-table/DataTable';
import { DataTableHeader } from '../../src/components/data-table/DataTableHeader';
import { DataTableRow } from '../../src/components/data-table/DataTableRow';
import { DataTableRowLink } from '../../src/components/data-table/DataTableRowLink';
import { DataTableSelectCell } from '../../src/components/data-table/DataTableSelect';
import { TableBody, TableCell, TableHead, TableRow } from '../../src/components/table/Table';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 軸 427: DataTable の行のリンク（DataTableRow の href・link と DataTableRowLink）
const target = '[data-slot="data-table-row"]:nth-child(2)';
const meta = {
  title: 'Design Review/427 データの表の行のリンク',
  id: 'design-review-427-data-table-row-link',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: target,
      active: target,
      focusVisible: `${target} [data-slot="data-table-row-link"]`,
    }),
  },
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

// 押したときの面: 載せたときのグレーに、本文の色を少し混ぜる（選んだ行に載せたときと同じ混ぜ方）
const press =
  'color-mix(in oklab, var(--data-table-row-hover), var(--color-fg) var(--data-table-row-selected-hover-mix))';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ふつうの行',
    intent:
      '行に載せると淡く塗るだけ（リンクでない行と同じ）。押しても面は変わらず、代表の文字もふつうの文字',
    spec: [
      ['代表の文字', '本文の色・下線なし'],
      ['行に hover', '淡いグレー（今と同じ）'],
      ['押下', 'hover と同じ'],
    ],
    tokens: {
      '--data-table-row-link-color': 'currentColor',
      '--data-table-row-link-decoration': 'none',
      '--data-table-row-link-hover-decoration': 'none',
      '--data-table-row-link-press': 'var(--data-table-row-hover)',
    },
  },
  {
    id: 'A',
    name: '押すと濃く＋載せると下線',
    intent:
      '行に載せると代表の文字に下線を出し、押すと面を半段濃くする。ふだんはリンクでない行と同じ見た目',
    spec: [
      ['代表の文字', '本文の色・載せると下線'],
      ['行に hover', '淡いグレー'],
      ['押下', '載せたグレーに本文の色を 6% 混ぜる'],
    ],
    tokens: {
      '--data-table-row-link-color': 'currentColor',
      '--data-table-row-link-decoration': 'none',
      '--data-table-row-link-hover-decoration': 'underline',
      '--data-table-row-link-press': press,
    },
  },
  {
    id: 'B',
    name: '文字のリンク',
    intent:
      '代表の文字を文字のリンク（青・淡い下線）にする。ふだんから押せる行だと分かる。押すと面を半段濃くする',
    spec: [
      ['代表の文字', '青・淡い下線（載せると濃く）'],
      ['行に hover', '淡いグレー'],
      ['押下', '載せたグレーに本文の色を 6% 混ぜる'],
    ],
    tokens: {
      '--data-table-row-link-color': 'var(--color-primary)',
      '--data-table-row-link-decoration': 'underline',
      '--data-table-row-link-hover-decoration': 'underline',
      '--data-table-row-link-press': press,
    },
  },
  {
    id: 'C',
    name: '淡い下線だけ',
    intent:
      '代表の文字は本文の色のまま、ふだんから淡い下線を付ける（載せると濃く）。B より静かで、押せることは分かる',
    spec: [
      ['代表の文字', '本文の色・淡い下線（載せると濃く）'],
      ['行に hover', '淡いグレー'],
      ['押下', '載せたグレーに本文の色を 6% 混ぜる'],
    ],
    tokens: {
      '--data-table-row-link-color': 'currentColor',
      '--data-table-row-link-decoration': 'underline',
      '--data-table-row-link-hover-decoration': 'underline',
      '--data-table-row-link-press': press,
    },
  },
];

const columns: Column[] = [
  { label: '通常', note: '押して試せます（移らずに下に出します）' },
  { label: 'hover', note: '2 行目', preview: 'hover' },
  { label: '押下', note: '2 行目', preview: 'active' },
  { label: 'フォーカス', note: 'キーボード。2 行目のリンク', preview: 'focus' },
];

const orders = [
  { id: 'A-1024', shop: '森の文具店', amount: 3200 },
  { id: 'A-1025', shop: 'ひだまり雑貨', amount: 12800 },
  { id: 'A-1026', shop: '港町ベーカリー', amount: 860 },
];
const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;

function Orders() {
  const [went, setWent] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  // 見本なので移らず、押した行き先を下に出す
  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setWent(event.currentTarget.getAttribute('href') ?? '');
  };
  return (
    <div className="flex w-[440px] flex-col gap-2">
      <DataTable accessibleName="注文">
        <TableHead>
          <TableRow>
            <DataTableHeader className="w-px">
              <span className="sr-only">選ぶ</span>
            </DataTableHeader>
            <DataTableHeader>注文番号</DataTableHeader>
            <DataTableHeader>お店</DataTableHeader>
            <DataTableHeader align="end">金額</DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <DataTableRow
              key={order.id}
              href={`#/orders/${order.id}`}
              selected={selected.includes(order.id)}
            >
              <DataTableSelectCell
                checked={selected.includes(order.id)}
                onCheckedChange={(next) =>
                  setSelected((current) =>
                    next ? [...current, order.id] : current.filter((id) => id !== order.id)
                  )
                }
                accessibleName={`${order.id} を選ぶ`}
              />
              <TableCell>
                <DataTableRowLink onClick={go}>{order.id}</DataTableRowLink>
              </TableCell>
              <TableCell>{order.shop}</TableCell>
              <TableCell align="end">{yen(order.amount)}</TableCell>
            </DataTableRow>
          ))}
        </TableBody>
      </DataTable>
      <Text size="sm" variant="subtle">
        {went ? `移る先: ${went}` : '行を押すと、移る先をここに出します'}
      </Text>
    </div>
  );
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={427}
      axis="データの表の行のリンク"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={() => <Orders />}
    >
      <p>
        DataTableRow に href と link
        を足しました。行のどこを押しても、その行の詳細へ移ります。移る先は、行を代表するセル（注文番号）に置いた
        DataTableRowLink（本物のリンク）で、キーボードと読み上げはこのリンクで移ります。行のほかの場所を押すと、このリンクを押したことにします（選ぶ箱・ボタンを押したときと、文字を選んだときは移りません）。
      </p>
      <p>
        link は、行をリンクとして描くかを明示する真偽値で、href があれば既定で true
        です。DataTableRowLink の render にルーターのリンク（Next.js の Link
        など）を渡すときは、行の href を持たないので link を書きます。
      </p>
      <p>
        選ぶのは、押せる行の見せ方です。キーボードで代表のリンクに止まったときは、リンクにフォーカスの線を出し、行には載せたときと同じ面を敷きます。
      </p>
    </Comparison>
  ),
};
