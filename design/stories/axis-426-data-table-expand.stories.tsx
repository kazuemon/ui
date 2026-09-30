import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useId, useState } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DataTable } from '../../src/components/data-table/DataTable';
import {
  DataTableExpandCell,
  DataTableExpandRow,
} from '../../src/components/data-table/DataTableExpand';
import { DataTableHeader } from '../../src/components/data-table/DataTableHeader';
import { DataTableRow } from '../../src/components/data-table/DataTableRow';
import { TableBody, TableCell, TableHead, TableRow } from '../../src/components/table/Table';
import type { TableVariant } from '../../src/components/table/Table';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 軸 426: DataTable の開いた行（DataTableExpandCell・DataTableExpandRow）
const meta = {
  title: 'Design Review/426 データの表の開いた行',
  id: 'design-review-426-data-table-expand',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="data-table-row"]:has([aria-expanded="true"])',
      focusVisible: '[aria-expanded="true"][data-slot="data-table-expand"]',
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

// 字下げ: 開閉のボタンの列の幅（印＋左右の余白）だけ下げ、2 列目の文字の頭にそろえる
const indent = 'calc(var(--spacing-icon) + var(--spacing) * 6)';

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: 'ふつうの行',
    intent:
      '開いた行も本文の行と同じ（上に細い線、面なし、字下げなし）。どの行の明細かが、位置でしか分からない',
    spec: [
      ['親とのあいだの線', '細い線'],
      ['開いた行の面', 'なし'],
      ['字下げ', 'なし'],
      ['開いている親の行', '変わらない'],
    ],
    tokens: {
      '--data-table-expand-line-width': 'var(--border-width-thin)',
      '--data-table-expand-bg': 'transparent',
      '--data-table-expand-indent': '0px',
      '--data-table-expand-open-bg': 'transparent',
    },
  },
  {
    id: 'A',
    name: '淡い面',
    intent:
      '親とのあいだの線を消し、開いた行に入力欄のグレーを敷いて、2 列目の頭まで字下げする。親の行はそのまま',
    spec: [
      ['親とのあいだの線', 'なし'],
      ['開いた行の面', '入力欄のグレー'],
      ['字下げ', '2 列目の文字の頭'],
      ['開いている親の行', '変わらない'],
    ],
    tokens: {
      '--data-table-expand-line-width': '0px',
      '--data-table-expand-bg': 'var(--color-field)',
      '--data-table-expand-indent': indent,
      '--data-table-expand-open-bg': 'transparent',
    },
  },
  {
    id: 'B',
    name: '字下げだけ',
    intent:
      '線を消して字下げするだけ。面を足さないので静か。親の行と明細のまとまりは、線がないことで伝える',
    spec: [
      ['親とのあいだの線', 'なし'],
      ['開いた行の面', 'なし'],
      ['字下げ', '2 列目の文字の頭'],
      ['開いている親の行', '変わらない'],
    ],
    tokens: {
      '--data-table-expand-line-width': '0px',
      '--data-table-expand-bg': 'transparent',
      '--data-table-expand-indent': indent,
      '--data-table-expand-open-bg': 'transparent',
    },
  },
  {
    id: 'C',
    name: '親と一続きの面',
    intent:
      '開いているあいだ、親の行と開いた行を同じグレーで塗り、1 つのまとまりにする。親の行に載せても面は変わらない',
    spec: [
      ['親とのあいだの線', 'なし'],
      ['開いた行の面', '入力欄のグレー'],
      ['字下げ', '2 列目の文字の頭'],
      ['開いている親の行', '入力欄のグレー'],
    ],
    tokens: {
      '--data-table-expand-line-width': '0px',
      '--data-table-expand-bg': 'var(--color-field)',
      '--data-table-expand-indent': indent,
      '--data-table-expand-open-bg': 'var(--color-field)',
    },
  },
];

const columns: Column[] = [
  { label: '開いている', note: 'lines。2 行目を開いたところ。押して試せます' },
  { label: '親の行に hover', preview: 'hover' },
  { label: 'ボタンにフォーカス', note: 'キーボード', preview: 'focus' },
  { label: 'framed' },
];

const orders = [
  { id: 'A-1024', shop: '森の文具店', amount: 3200, items: ['ノート A5 × 3', 'ボールペン × 5'] },
  {
    id: 'A-1025',
    shop: 'ひだまり雑貨',
    amount: 12800,
    items: ['マグカップ × 2', 'ランチョンマット × 4'],
  },
  { id: 'A-1026', shop: '港町ベーカリー', amount: 860, items: ['食パン × 1'] },
];
const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;

function Orders({ variant = 'lines' }: { variant?: TableVariant }) {
  const [open, setOpen] = useState<string[]>(['A-1025']);
  const base = useId();
  return (
    <div className="w-[440px]">
      <DataTable variant={variant} accessibleName="注文">
        <TableHead>
          <TableRow>
            <DataTableHeader className="w-px">
              <span className="sr-only">明細</span>
            </DataTableHeader>
            <DataTableHeader>注文番号</DataTableHeader>
            <DataTableHeader>お店</DataTableHeader>
            <DataTableHeader align="end">金額</DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const isOpen = open.includes(order.id);
            const detailId = `${base}-${order.id}`;
            return (
              <Fragment key={order.id}>
                <DataTableRow>
                  <DataTableExpandCell
                    open={isOpen}
                    onOpenChange={(next) =>
                      setOpen((current) =>
                        next ? [...current, order.id] : current.filter((id) => id !== order.id)
                      )
                    }
                    controls={detailId}
                    accessibleName={`${order.id} の明細`}
                  />
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.shop}</TableCell>
                  <TableCell align="end">{yen(order.amount)}</TableCell>
                </DataTableRow>
                <DataTableExpandRow id={detailId} open={isOpen} columns={4}>
                  <Text size="sm" variant="muted">
                    {order.items.join('・')}
                  </Text>
                </DataTableExpandRow>
              </Fragment>
            );
          })}
        </TableBody>
      </DataTable>
    </div>
  );
}

function Cell({ column }: { column: Column }) {
  if (column.label.startsWith('framed')) return <Orders variant="framed" />;
  return <Orders />;
}

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={426}
      axis="データの表の開いた行"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <Cell column={column} />}
    >
      <p>
        DataTable に、行を開く組み立てを足しました。行の頭の DataTableExpandCell（開閉のボタン。▶
        が開くと ▼）と、そのすぐ下に置く DataTableExpandRow（列をまたぐ 1
        つのセル）です。注文の明細のような、一覧には収まらない補足を見せます。開いているかは使う側が持ちます（TanStack
        Table の row.getIsExpanded()）。
      </p>
      <p>
        選ぶのは、開いた行と親の行のつながりの見せ方です。ボタンの見た目は並べ替えの見出しと同じ平らな押すものです。
      </p>
    </Comparison>
  ),
};
