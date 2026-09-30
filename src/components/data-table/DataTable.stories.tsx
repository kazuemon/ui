import type { Meta, StoryObj } from '@storybook/react-vite';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Fragment, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { DataTable, type DataTableProps } from './DataTable';
import { DataTableEmpty } from './DataTableEmpty';
import { DataTableHeader, type DataTableSortDirection } from './DataTableHeader';
import { DataTableLoading } from './DataTableLoading';
import { DataTableRow } from './DataTableRow';
import { DataTableSelectCell, DataTableSelectHeader } from './DataTableSelect';
import { Icon } from '../icon/Icon';
import { StatusPanel } from '../status-panel/StatusPanel';
import { TableBody, TableCell, TableHead, TableRow } from '../table/Table';
import { Tag } from '../tag/Tag';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { statePseudo } from '../../stories/story-states';

interface Order {
  id: string;
  shop: string;
  status: '発送済み' | '準備中' | '取り消し';
  amount: number;
}

const orders: Order[] = [
  { id: 'A-1024', shop: '森の文具店', status: '発送済み', amount: 3200 },
  { id: 'A-1025', shop: 'ひだまり雑貨', status: '準備中', amount: 12800 },
  { id: 'A-1026', shop: '港町ベーカリー', status: '発送済み', amount: 860 },
  { id: 'A-1027', shop: 'そらいろ書房', status: '取り消し', amount: 4500 },
];

const statusColor = { 発送済み: 'success', 準備中: 'info', 取り消し: 'neutral' } as const;

type SortKey = 'id' | 'shop' | 'amount';
interface Sort {
  id: SortKey;
  desc: boolean;
}

const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;

interface OrdersTableProps extends Omit<DataTableProps, 'children'> {
  rows?: Order[];
  sort?: Sort | null;
  selected?: string[];
  /** 見出しと箱を押して、並べ替え・選択を試せるようにする */
  interactive?: boolean;
  onSortClick?: (id: SortKey) => void;
  hideSelect?: boolean;
}

// 状態をストーリーの中で持つ見本。使う側が TanStack Table などで持つ状態を、ここでは useState で持つ
function OrdersTable({
  rows = orders,
  sort: initialSort = { id: 'id', desc: false },
  selected: initialSelected = ['A-1025'],
  interactive = false,
  onSortClick,
  hideSelect = false,
  ...props
}: OrdersTableProps) {
  const [sort, setSort] = useState(initialSort);
  const [selected, setSelected] = useState(initialSelected);
  const sorted = [...rows].sort((a, b) => {
    if (!sort) return 0;
    const order = a[sort.id] < b[sort.id] ? -1 : a[sort.id] > b[sort.id] ? 1 : 0;
    return sort.desc ? -order : order;
  });
  const direction = (id: SortKey): false | DataTableSortDirection =>
    sort?.id === id ? (sort.desc ? 'desc' : 'asc') : false;
  // 小さい順 → 大きい順 → 並べ替えない の順に回す
  const toggle = (id: SortKey) => () => {
    onSortClick?.(id);
    if (!interactive) return;
    setSort((current) =>
      current?.id !== id ? { id, desc: false } : current.desc ? null : { id, desc: true }
    );
  };
  const all = rows.length > 0 && selected.length === rows.length;
  const some = selected.length > 0 && !all;
  return (
    <DataTable accessibleName="注文" {...props}>
      <TableHead>
        <TableRow>
          {!hideSelect && (
            <DataTableSelectHeader
              checked={all}
              indeterminate={some}
              onCheckedChange={(next) => setSelected(next ? rows.map((row) => row.id) : [])}
            />
          )}
          <DataTableHeader sorted={direction('id')} onSortClick={toggle('id')}>
            注文番号
          </DataTableHeader>
          <DataTableHeader sorted={direction('shop')} onSortClick={toggle('shop')}>
            お店
          </DataTableHeader>
          <DataTableHeader>状態</DataTableHeader>
          <DataTableHeader align="end" sorted={direction('amount')} onSortClick={toggle('amount')}>
            金額
          </DataTableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((order) => {
          const isSelected = selected.includes(order.id);
          return (
            <DataTableRow key={order.id} selected={!hideSelect && isSelected}>
              {!hideSelect && (
                <DataTableSelectCell
                  checked={isSelected}
                  accessibleName={`${order.id} を選ぶ`}
                  onCheckedChange={(next) =>
                    setSelected((current) =>
                      next ? [...current, order.id] : current.filter((id) => id !== order.id)
                    )
                  }
                />
              )}
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.shop}</TableCell>
              <TableCell>
                <Tag color={statusColor[order.status]}>{order.status}</Tag>
              </TableCell>
              <TableCell align="end">{yen(order.amount)}</TableCell>
            </DataTableRow>
          );
        })}
      </TableBody>
    </DataTable>
  );
}

const meta = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'データの表です。並べ替え・選択・ページ送りの状態は持たず、使う側が props で渡します。TanStack Table でつなぐ見本は Recipes/DataTable にあります。',
          '',
          '- 罫線と見出しの見た目（`variant`）、縦線（`showColumnDivider`）、文字の大きさは `Table` と同じです。セルの縦の寄せ（`verticalAlign`）の既定は `middle` です。',
          '- 見出しは `DataTableHeader` です。`onSortClick` を渡すと、見出しの文字が並べ替えのボタンになり、`sorted`（`asc`・`desc`・`false`）で向きの印と `aria-sort` が付きます。',
          '- 並べ替えていない列の印（上下の山）の出し方は `sortIndicator` です。`subtle`（既定）はふだん淡く置いて載せると濃くし、`always` はいつも同じ濃さ、`hover` は載せたときだけ出します（指で操作しているときはいつも出します）。',
          '- 選ぶ列は、見出しに `DataTableSelectHeader`（すべて選ぶ。一部だけのときは `indeterminate`）、行に `DataTableSelectCell` を置きます。箱の名前は `accessibleName` で、どの行かが分かる文にします。',
          '- 本文の行は `DataTableRow` です。載せると淡く塗り、`selected` の行には `color`（既定は `neutral`）の淡い面を敷きます。',
          '- `maxHeight` を渡すと、表の中で縦にスクロールし、見出しの行が上に貼り付きます。貼り付いた見出しの下を行が通るあいだは、見出しの下に影が出ます。',
          '- 行がないときは `DataTableEmpty` に `StatusPanel` を入れます。読み込み中は `loading` を付け、行の代わりに `DataTableLoading` を置きます。',
          '- 列の幅は、`DataTableHeader` の `width`（幅）と `minWidth`（最小の幅）で決めます。数は px、文字は CSS の長さです。',
          '- セルと行の見出しのない列には、`TableHead`・`TableBody`・`TableRow`・`TableCell` をそのまま使います。',
        ].join('\n'),
      },
    },
  },
  args: { variant: 'lines', color: 'neutral', accessibleName: '注文' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['lines', 'framed', 'banded'] },
    color: { control: 'inline-radio', options: ['neutral', 'primary', 'secondary'] },
    sortIndicator: {
      control: 'inline-radio',
      options: ['subtle', 'always', 'hover'],
      table: { defaultValue: { summary: "'subtle'" } },
    },
    showColumnDivider: { control: 'boolean' },
    caption: { control: 'text' },
  },
  render: (args) => (
    <div className="max-w-2xl">
      <OrdersTable {...args} interactive />
    </div>
  ),
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Variants: Story = {
  tags: ['visual'],
  name: '見た目と色',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="30rem">
      {(['lines', 'framed', 'banded'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <OrdersTable variant={variant} />
        </Specimen>
      ))}
      {(['primary', 'secondary'] as const).map((color) => (
        <Specimen key={color} label={`color: ${color}`}>
          <OrdersTable color={color} selected={['A-1025', 'A-1026']} />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const States: Story = {
  tags: ['visual'],
  name: '載せたとき・フォーカス',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '行に載せると淡く塗ります。並べ替えの見出しに載せると、ボタンの範囲に淡い色を敷きます。キーボードで止まると線が出ます。',
      },
    },
    pseudo: statePseudo({
      hover: '[data-slot="data-table-row"]:nth-child(2), [data-slot="data-table-sort"]',
      focusVisible: '[data-slot="data-table-sort"]',
    }),
  },
  render: () => (
    <Gallery columnWidth="30rem">
      <Specimen label="hover（2 行目・見出し）">
        <div data-preview="hover">
          <OrdersTable selected={[]} sort={null} />
        </div>
      </Specimen>
      <Specimen label="選んだ行に載せたとき">
        <div data-preview="hover">
          <OrdersTable selected={['A-1025']} sort={null} />
        </div>
      </Specimen>
      <Specimen label="フォーカス（キーボード）">
        <div data-preview="focus">
          <OrdersTable selected={[]} sort={null} hideSelect />
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const SortIndicators: Story = {
  tags: ['visual'],
  name: '並べ替えていない列の印',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '右の列は「お店」の見出しに載せたところです。`subtle` はふだん淡く、載せると濃くなります。`hover` は載せたときだけ出ます。',
      },
    },
    pseudo: statePseudo({ hover: 'th:nth-child(3) [data-slot="data-table-sort"]' }),
  },
  render: () => (
    <Gallery columnWidth="30rem">
      {(['subtle', 'always', 'hover'] as const).map((reveal) => (
        <Fragment key={reveal}>
          <Specimen label={reveal}>
            <OrdersTable sortIndicator={reveal} selected={[]} rows={orders.slice(0, 2)} />
          </Specimen>
          <Specimen label={`${reveal}（「お店」に載せたとき）`}>
            {/* 印の濃さは見出しのボタンの group-hover で変わり、pseudo-states では固定できないので、
                載せたときの濃さ（--data-table-sort-hover）を「お店」の見出しにだけ直接渡す */}
            <div
              data-preview="hover"
              className="[&_th:nth-child(3)]:[--data-table-sort-idle:var(--data-table-sort-hover)]"
            >
              <OrdersTable sortIndicator={reveal} selected={[]} rows={orders.slice(0, 2)} />
            </div>
          </Specimen>
        </Fragment>
      ))}
    </Gallery>
  ),
};

export const StickyHeader: Story = {
  tags: ['visual'],
  name: '高さの上限と固定した見出し',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`maxHeight` を渡すと、はみ出した行は表の中でスクロールし、見出しの行が上に貼り付きます。スクロールすると、見出しの下に影が出ます。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="30rem">
      {(['lines', 'framed', 'banded'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <OrdersTable
            variant={variant}
            maxHeight={200}
            rows={[...orders, ...orders.map((o) => ({ ...o, id: o.id.replace('A', 'B') }))]}
            selected={[]}
          />
        </Specimen>
      ))}
    </Gallery>
  ),
  // 少しスクロールして、貼り付いた見出しの下の影を見せる
  play: async ({ canvasElement }) => {
    for (const viewport of canvasElement.querySelectorAll('[data-slot="scroll-area-viewport"]')) {
      viewport.scrollTop = 60;
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const header = canvasElement.querySelector('thead th');
    await expect(header && getComputedStyle(header).position).toBe('sticky');
  },
};

export const ColumnWidths: Story = {
  name: '列の幅',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`DataTableHeader` の `width` で列の幅を、`minWidth` で列の最小の幅を決めます。ここでは注文番号を 8rem にそろえ、お店の列を 12rem より細くしません。枠が狭いときは、表が横にスクロールします。',
      },
      source: {
        code: [
          '<DataTableHeader width="8rem">注文番号</DataTableHeader>',
          '<DataTableHeader minWidth="12rem">お店</DataTableHeader>',
        ].join('\n'),
        language: 'tsx',
      },
    },
  },
  render: () => (
    <div className="flex max-w-2xl flex-col gap-6">
      {(['wide', 'narrow'] as const).map((size) => (
        <div key={size} data-testid={size} className={size === 'narrow' ? 'w-80' : undefined}>
          <DataTable accessibleName={size === 'wide' ? '注文' : '注文（狭い枠）'}>
            <TableHead>
              <TableRow>
                <DataTableHeader width="8rem">注文番号</DataTableHeader>
                <DataTableHeader minWidth="12rem">お店</DataTableHeader>
                <DataTableHeader>状態</DataTableHeader>
                <DataTableHeader align="end" width={120}>
                  金額
                </DataTableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <DataTableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.shop}</TableCell>
                  <TableCell>
                    <Tag color={statusColor[order.status]}>{order.status}</Tag>
                  </TableCell>
                  <TableCell align="end">{yen(order.amount)}</TableCell>
                </DataTableRow>
              ))}
            </TableBody>
          </DataTable>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const widthOf = (table: HTMLElement, name: string) =>
      within(table).getByRole('columnheader', { name }).getBoundingClientRect().width;
    const wide = canvas.getByRole('table', { name: '注文' });
    // 幅を決めた列は、その幅になる（表が枠いっぱいに広がる分は、幅を決めていない列が受け持つ）
    await expect(Math.round(widthOf(wide, '注文番号'))).toBe(8 * rem);
    await expect(Math.round(widthOf(wide, '金額'))).toBe(120);
    // 狭い枠でも、最小の幅より細くしない（枠が横にスクロールする）
    const narrow = canvas.getByRole('table', { name: '注文（狭い枠）' });
    await expect(widthOf(narrow, 'お店')).toBeGreaterThanOrEqual(12 * rem - 0.5);
    const frame = within(canvas.getByTestId('narrow')).getByRole('region');
    await expect(frame.scrollWidth).toBeGreaterThan(frame.clientWidth);
  },
};

export const EmptyAndLoading: Story = {
  tags: ['visual'],
  name: '空のとき・読み込み中',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="30rem">
      <Specimen label="空のとき">
        <DataTable accessibleName="注文">
          <TableHead>
            <TableRow>
              <DataTableHeader>注文番号</DataTableHeader>
              <DataTableHeader>お店</DataTableHeader>
              <DataTableHeader align="end">金額</DataTableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <DataTableEmpty colSpan={3}>
              <StatusPanel
                size="sm"
                status="info"
                icon={<Icon icon={MagnifyingGlassIcon} size="lg" standalone />}
                title="見つかりませんでした"
                headingLevel={3}
              >
                ほかの言葉で検索してください。
              </StatusPanel>
            </DataTableEmpty>
          </TableBody>
        </DataTable>
      </Specimen>
      <Specimen label="読み込み中">
        <DataTable accessibleName="注文" loading>
          <TableHead>
            <TableRow>
              <DataTableSelectHeader disabled />
              <DataTableHeader>注文番号</DataTableHeader>
              <DataTableHeader>お店</DataTableHeader>
              <DataTableHeader align="end">金額</DataTableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <DataTableLoading columns={4} rows={4} showSelectColumn />
          </TableBody>
        </DataTable>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-[32rem]">
        <OrdersTable />
      </div>
    </DensityPair>
  ),
};

const sortClicked = fn();

export const Accessibility: Story = {
  name: '読み上げと操作',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-2xl">
      <OrdersTable interactive onSortClick={sortClicked} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('table', { name: '注文' })).toBeInTheDocument();
    // 並べ替えている列だけに aria-sort
    const idHeader = canvas.getByRole('columnheader', { name: '注文番号' });
    await expect(idHeader).toHaveAttribute('aria-sort', 'ascending');
    const amount = canvas.getByRole('button', { name: '金額' });
    await expect(amount.closest('th')).not.toHaveAttribute('aria-sort');
    await userEvent.click(amount);
    await expect(sortClicked).toHaveBeenCalledWith('amount');
    await expect(amount.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(amount);
    await expect(amount.closest('th')).toHaveAttribute('aria-sort', 'descending');
    // すべて選ぶ: 一部だけのときは中間の状態
    const all = canvas.getByRole('checkbox', { name: 'すべての行を選ぶ' });
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(all);
    await expect(all).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('checkbox', { name: 'A-1026 を選ぶ' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await userEvent.click(canvas.getByRole('checkbox', { name: 'A-1026 を選ぶ' }));
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
  },
};
