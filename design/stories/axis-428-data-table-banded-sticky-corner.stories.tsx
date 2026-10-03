import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect, useRef } from 'react';

import { type Candidate, type Column, Comparison } from './Comparison';
import { DataTable } from '../../src/components/data-table/DataTable';
import { DataTableHeader } from '../../src/components/data-table/DataTableHeader';
import { DataTableRow } from '../../src/components/data-table/DataTableRow';
import { TableBody, TableCell, TableHead, TableRow } from '../../src/components/table/Table';

// 軸 428: banded の貼り付いた見出しの帯の、下の角と影
const meta = {
  title: 'Design Review/428 貼り付いた帯の見出しの角と影',
  id: 'design-review-428-data-table-banded-sticky-corner',
  parameters: { layout: 'fullscreen' },
  args: { pick: '' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['', 'current', 'A', 'B', 'C', 'D', 'E'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const base = {
  '--data-table-banded-head-corner-fill': 'transparent',
  '--data-table-banded-head-square': '0',
  '--data-table-banded-head-square-scrolled': '0',
  '--data-table-banded-shadow-inset': '0px',
  '--data-table-banded-shadow-taper': '0px',
};

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '角は丸く、角の外は透ける',
    intent:
      '帯の下の角も丸い。角の外は塗らないので、下を通る行（文字と区切りの線）が角の外に見える。影は見出しの下の辺から、表の幅いっぱいに落ちる',
    spec: [
      ['帯の下の角', '丸い'],
      ['角の外', '透ける（下の行が見える）'],
      ['影', '見出しの下の辺から、端まで'],
    ],
    tokens: base,
  },
  {
    id: 'A',
    name: '角の外を地の色で塞ぐ（元の形）',
    intent:
      '見出しのセルを地の色で塗り、角の外に下の行を見せない。帯の外の四角まで見出しの面になり、影はその四角の下の辺から落ちる',
    spec: [
      ['帯の下の角', '丸い'],
      ['角の外', '地の色'],
      ['影', '見出しの下の辺から、端まで'],
    ],
    tokens: { ...base, '--data-table-banded-head-corner-fill': 'var(--color-bg)' },
  },
  {
    id: 'B',
    name: '帯の下の角をいつも四角',
    intent:
      '帯は上の角だけ丸く、下の角は四角にする。影は四角い帯の下の辺から落ち、角の外は生まれない。スクロールしていないときも下の角は四角',
    spec: [
      ['帯の下の角', 'いつも四角'],
      ['影', '帯の下の辺から、端まで'],
    ],
    tokens: { ...base, '--data-table-banded-head-square': '1' },
  },
  {
    id: 'C',
    name: 'スクロールしたら下の角を四角',
    intent:
      'スクロールしていないときは今の丸い帯。下を行が通りはじめると、スクロールした量に合わせて下の角が四角になり、影と同時に「貼り付いた面」の形になる',
    spec: [
      ['帯の下の角', '丸い → スクロールで四角'],
      ['影', '帯の下の辺から、端まで'],
    ],
    tokens: { ...base, '--data-table-banded-head-square-scrolled': '1' },
  },
  {
    id: 'D',
    name: '影を角の内側から',
    intent:
      '角は丸く、角の外は透けるまま。影は帯のまっすぐな下の辺だけから落とし、両端の角丸の下には落とさない',
    spec: [
      ['帯の下の角', '丸い'],
      ['角の外', '透ける'],
      ['影', '角丸の分だけ内側から'],
    ],
    tokens: { ...base, '--data-table-banded-shadow-inset': 'var(--radius-control)' },
  },
  {
    id: 'E',
    name: '影を角の内側から、両端をぼかす',
    intent:
      'D の影の両端を、角丸と同じ幅でぼかして消す。影の端が角丸に沿って細っていくように見せ、端の切れ目を目立たせない',
    spec: [
      ['帯の下の角', '丸い'],
      ['角の外', '透ける'],
      ['影', '角丸の分だけ内側から、端をぼかす'],
    ],
    tokens: {
      ...base,
      '--data-table-banded-shadow-inset': 'var(--radius-control)',
      '--data-table-banded-shadow-taper': 'var(--radius-control)',
    },
  },
];

type Scroll = 'top' | 'little' | 'line' | 'more';

const columns: Column[] = [
  { label: 'スクロールしていない', preview: 'top' },
  { label: '少しスクロール', note: '影が出はじめる（8px）', preview: 'little' },
  { label: '区切りの線が角を通る', note: '行の線が帯の下の角の高さにある', preview: 'line' },
  { label: 'スクロールした', note: '影がいちばん濃い（60px）', preview: 'more' },
];

const orders = Array.from({ length: 8 }, (_, i) => ({
  id: `A-${1024 + i}`,
  shop: ['森の文具店', 'ひだまり雑貨', '港町ベーカリー', 'そらいろ書房'][i % 4],
  amount: [3200, 12800, 860, 4500][i % 4],
}));

function ScrolledTable({ scroll }: { scroll: Scroll }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const viewport = ref.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    const row = ref.current?.querySelector<HTMLElement>('tbody tr');
    if (!viewport || !row) return;
    // 区切りの線（1 行目の下の線）が、見出しの下の辺から 4px 上に来る位置
    const to = { top: 0, little: 8, line: row.offsetHeight + 4, more: 60 }[scroll];
    viewport.scrollTop = to;
    viewport.dispatchEvent(new Event('scroll'));
  }, [scroll]);
  return (
    <div ref={ref} className="w-[26rem]">
      <DataTable variant="banded" maxHeight={220} aria-label="注文">
        <TableHead>
          <TableRow>
            <DataTableHeader>注文番号</DataTableHeader>
            <DataTableHeader>お店</DataTableHeader>
            <DataTableHeader align="end">金額</DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <DataTableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.shop}</TableCell>
              <TableCell align="end">{order.amount.toLocaleString()} 円</TableCell>
            </DataTableRow>
          ))}
        </TableBody>
      </DataTable>
    </div>
  );
}

export const Compare: Story = {
  name: '428 貼り付いた帯の見出しの角と影',
  render: ({ pick }) => (
    <Comparison
      index={428}
      axis="貼り付いた帯の見出しの角と影"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) => <ScrolledTable scroll={column.preview as Scroll} />}
    >
      <p>
        banded の表を maxHeight
        でスクロールしたとき、上に貼り付いた丸い帯の見出しの、下の角と影の形を選びます。
        今は帯の下の角も丸く、角の外には下を通る行（文字と区切りの線）が見えます。影は見出しの下の辺から表の幅いっぱいに落ちるので、角丸の下では影だけが四角く出ます。
      </p>
      <p>
        見るところ:
        「区切りの線が角を通る」列で、角の外に見える線と影の端がどう見えるか。スクロールしていないときの帯の形が変わるか（B）。
      </p>
    </Comparison>
  ),
};
