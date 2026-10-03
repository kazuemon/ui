import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotsThreeVerticalIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Fragment, type MouseEvent, useState } from 'react';
import { addons } from 'storybook/preview-api';
import { expect, fn, spyOn, userEvent, within } from 'storybook/test';

import { DataTable, type DataTableProps } from './DataTable';
import { DataTableEmpty } from './DataTableEmpty';
import {
  DataTableExpandCell,
  DataTableExpandRow,
  type DataTableExpandRowVariant,
} from './DataTableExpand';
import { DataTableHeader, type DataTableSortDirection } from './DataTableHeader';
import { DataTableLoading } from './DataTableLoading';
import { DataTableRow, type DataTableRowStatus } from './DataTableRow';
import { DataTableRowLink } from './DataTableRowLink';
import { DataTableSelectCell, DataTableSelectHeader } from './DataTableSelect';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';
import { MenuItem } from '../menu/MenuItem';
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
          '- 行の `status` は行の状態です。`muted` は済んだ・取り消した行で文字を淡くし、`warning`・`danger` は状態の色で知らせます。見せ方は `DataTable` の `statusIndicator` で、`fill`（既定。淡い面）・`edge`（左端の帯）・`fill-edge`（両方）です。',
          '- 行を代表するセル（注文番号・名前）に `DataTableRowLink` を置くと、行のどこを押してもそのリンクで移ります。リンクのない行は押しても移りません。リンクの色は `color`（既定は `neutral`）で、Next.js の Link などは `render` に渡します。',
          '- 行の下に明細を開くときは、行の頭に `DataTableExpandCell`、すぐ下に `DataTableExpandRow` を置きます。開いた行の見た目は `variant` で、`indent`（既定。字下げだけ）・`flush`（字下げなし）・`filled`（グレーの面で親の行とつなぐ）です。',
          '- 並べ替え・ページ送りのあと、新しい行が届くまでは `refreshing` で行を残したまま薄くします。`showRefreshingBar` で、表の上の端に流れる線も足せます。',
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
    statusIndicator: {
      control: 'inline-radio',
      options: ['fill', 'edge', 'fill-edge'],
      table: { defaultValue: { summary: "'fill'" } },
    },
    refreshing: { control: 'boolean' },
    showRefreshingBar: { control: 'boolean' },
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
    // 縦のつまみの溝は、見出しの行の下から始まる（見出しに重ならない）
    const frames = canvasElement.querySelectorAll('[data-slot="data-table-scroll"]');
    await expect(frames).toHaveLength(3);
    for (const frame of frames) {
      // 貼り付いているのは見出しのセル（thead そのものはスクロールで上に流れる）
      const head = frame.querySelector('thead th')!.getBoundingClientRect();
      const bar = frame.querySelector(':scope > [data-orientation="vertical"]');
      await expect(bar).not.toBeNull();
      await expect(bar!.getBoundingClientRect().top).toBeGreaterThanOrEqual(head.bottom - 0.5);
    }
    // banded の見出しのセルは塗らない（帯の角丸の外には、下を通る行が見える）。帯は ::before の面
    const bandedHeader = frames[2].querySelector('thead th')!;
    await expect(getComputedStyle(bandedHeader).backgroundColor).toBe('rgba(0, 0, 0, 0)');
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

const statusRows: { order: Order; status?: DataTableRowStatus }[] = [
  { order: orders[0] },
  { order: { ...orders[1], id: 'A-1028', status: '準備中' }, status: 'warning' },
  { order: { ...orders[2], id: 'A-1029', status: '準備中' }, status: 'danger' },
  { order: orders[3], status: 'muted' },
];

function StatusTable(props: Omit<DataTableProps, 'children'>) {
  return (
    <DataTable accessibleName="注文" {...props}>
      <TableHead>
        <TableRow>
          <DataTableHeader>注文番号</DataTableHeader>
          <DataTableHeader>お店</DataTableHeader>
          <DataTableHeader>状態</DataTableHeader>
          <DataTableHeader align="end">金額</DataTableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {statusRows.map(({ order, status }) => (
          <DataTableRow key={order.id} status={status}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.shop}</TableCell>
            <TableCell>{status ?? '—'}</TableCell>
            <TableCell align="end">{yen(order.amount)}</TableCell>
          </DataTableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}

export const RowStatus: Story = {
  tags: ['visual'],
  name: '行の状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '上から、状態なし・`warning`・`danger`・`muted` の行です。`statusIndicator` で見せ方を選びます。`muted` はどれでも文字を淡くします。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="30rem">
      {(['fill', 'edge', 'fill-edge'] as const).map((indicator) => (
        <Specimen key={indicator} label={indicator}>
          <StatusTable statusIndicator={indicator} />
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Refreshing: Story = {
  tags: ['visual'],
  name: '読み直し中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`refreshing` は行を残したまま薄くし、表に `aria-busy` を付けます。`showRefreshingBar` を足すと、表の上の端に線が流れます（ここでは線の動きを撮らないため、線のない形だけを並べています。線は Controls で試せます）。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="30rem">
      <Specimen label="refreshing">
        <OrdersTable refreshing selected={[]} />
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole('table', { name: '注文' });
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(canvasElement.querySelector('[data-slot="data-table-refreshing"]')).toBeNull();
  },
};

const details: Record<string, string[]> = {
  'A-1024': ['ノート A5 × 3', 'ボールペン × 5'],
  'A-1025': ['マグカップ × 2', 'ランチョンマット × 4', '箸置き × 4'],
  'A-1026': ['食パン × 1'],
};

function ExpandTable({
  variant,
  initialOpen = ['A-1025'],
}: {
  variant?: DataTableExpandRowVariant;
  initialOpen?: string[];
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <DataTable accessibleName="注文">
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
        {orders.slice(0, 3).map((order) => {
          const isOpen = open.includes(order.id);
          const id = `expand-${variant ?? 'indent'}-${order.id}`;
          return (
            <Fragment key={order.id}>
              <DataTableRow>
                <DataTableExpandCell
                  open={isOpen}
                  onOpenChange={(next) =>
                    setOpen((current) =>
                      next ? [...current, order.id] : current.filter((value) => value !== order.id)
                    )
                  }
                  controls={id}
                  accessibleName={`${order.id} の明細`}
                />
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.shop}</TableCell>
                <TableCell align="end">{yen(order.amount)}</TableCell>
              </DataTableRow>
              <DataTableExpandRow id={id} open={isOpen} columns={4} variant={variant}>
                <ul className="m-0 list-none p-0">
                  {details[order.id]?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </DataTableExpandRow>
            </Fragment>
          );
        })}
      </TableBody>
    </DataTable>
  );
}

export const Expand: Story = {
  tags: ['visual'],
  name: '開いた行',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '2 行目を開いたところです。`DataTableExpandRow` の `variant` は `indent`（既定。字下げだけ）・`flush`（字下げなし）・`filled`（グレーの面で、開いた親の行とつなぐ）です。開いているかは使う側が持ちます。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="30rem">
      {(['indent', 'flush', 'filled'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <ExpandTable variant={variant} />
        </Specimen>
      ))}
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [button] = canvas.getAllByRole('button', { name: 'A-1024 の明細' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByText('ノート A5 × 3')[0]).toBeVisible();
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    // 見た目の比較で、押したあとのフォーカスの線を写さない
    button.blur();
  },
};

const linkTarget = '[data-slot="data-table-row"]:nth-child(2)';

function LinkTable({
  color,
  onGo,
  withMenu,
}: {
  color?: 'neutral' | 'primary';
  onGo?: (href: string) => void;
  /** 行の端に、メニューを開く ︙ のボタンを置く */
  withMenu?: boolean;
}) {
  // 見本なので移らず、押した行き先を知らせる
  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onGo?.(event.currentTarget.getAttribute('href') ?? '');
  };
  return (
    <DataTable accessibleName="注文">
      <TableHead>
        <TableRow>
          <DataTableHeader>注文番号</DataTableHeader>
          <DataTableHeader>お店</DataTableHeader>
          <DataTableHeader align="end">金額</DataTableHeader>
          {withMenu && (
            <DataTableHeader>
              <span className="sr-only">操作</span>
            </DataTableHeader>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.slice(0, 3).map((order) => (
          <DataTableRow key={order.id}>
            <TableCell>
              <DataTableRowLink href={`#/orders/${order.id}`} color={color} onClick={go}>
                {order.id}
              </DataTableRowLink>
            </TableCell>
            <TableCell>{order.shop}</TableCell>
            <TableCell align="end">{yen(order.amount)}</TableCell>
            {withMenu && (
              <TableCell align="end">
                <Menu
                  title={`${order.id} の操作`}
                  trigger={
                    <Button iconOnly variant="outline" aria-label={`${order.id} の操作`}>
                      <DotsThreeVerticalIcon />
                    </Button>
                  }
                >
                  <MenuItem>複製する</MenuItem>
                  <MenuItem status="danger">取り消す</MenuItem>
                </Menu>
              </TableCell>
            )}
          </DataTableRow>
        ))}
        <DataTableRow>
          <TableCell>{orders[3].id}</TableCell>
          <TableCell>{orders[3].shop}（リンクのない行）</TableCell>
          <TableCell align="end">{yen(orders[3].amount)}</TableCell>
          {withMenu && <TableCell />}
        </DataTableRow>
      </TableBody>
    </DataTable>
  );
}

export const RowLink: Story = {
  tags: ['visual'],
  name: '行のリンク',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '行を代表するセルに `DataTableRowLink` を置くと、行のどこを押してもそのリンクで移ります。リンクのない行（4 行目）は押しても移りません。キーボードと読み上げは、リンクで移ります。押すと行が少し濃くなります。',
      },
    },
    pseudo: statePseudo({
      hover: linkTarget,
      active: linkTarget,
      focusVisible: `${linkTarget} [data-slot="data-table-row-link"]`,
    }),
  },
  render: () => (
    <Gallery columnWidth="26rem">
      <Specimen label="neutral（既定）">
        <LinkTable />
      </Specimen>
      <Specimen label="primary">
        <LinkTable color="primary" />
      </Specimen>
      <Specimen label="hover（2 行目）">
        <div data-preview="hover">
          <LinkTable />
        </div>
      </Specimen>
      <Specimen label="押下（2 行目）">
        <div data-preview="active">
          <LinkTable />
        </div>
      </Specimen>
      <Specimen label="フォーカス（2 行目のリンク）">
        <div data-preview="focus">
          <LinkTable />
        </div>
      </Specimen>
    </Gallery>
  ),
};

const went = fn();

export const RowLinkBehavior: Story = {
  name: '行のリンクの操作',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-xl">
      <LinkTable onGo={went} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    went.mockClear();
    // 行のほかのセルを押すと、行のリンクを押したのと同じ
    await userEvent.click(canvas.getByText('ひだまり雑貨'));
    await expect(went).toHaveBeenLastCalledWith('#/orders/A-1025');
    // リンクそのものを押しても 1 回だけ
    await userEvent.click(canvas.getByRole('link', { name: 'A-1026' }));
    await expect(went).toHaveBeenCalledTimes(2);
    // リンクのない行は移らない
    await userEvent.click(canvas.getByText('そらいろ書房（リンクのない行）'));
    await expect(went).toHaveBeenCalledTimes(2);
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
    // 中ボタン（ホイール）で行を押すと、行のリンクの行き先を新しいタブで開く
    const open = spyOn(window, 'open').mockImplementation(() => null);
    try {
      await userEvent.pointer({
        keys: '[MouseMiddle]',
        target: canvas.getByText('港町ベーカリー'),
      });
      await expect(open).toHaveBeenCalledTimes(1);
      await expect(open).toHaveBeenLastCalledWith(
        new URL('#/orders/A-1026', document.baseURI).href,
        '_blank',
        'noopener,noreferrer'
      );
      // リンクのない行は開かない。左ボタンの押下は新しいタブにしない
      await userEvent.pointer({
        keys: '[MouseMiddle]',
        target: canvas.getByText('そらいろ書房（リンクのない行）'),
      });
      await userEvent.click(canvas.getByText('港町ベーカリー'));
      await expect(open).toHaveBeenCalledTimes(1);
      await expect(went).toHaveBeenCalledTimes(3);
    } finally {
      open.mockRestore();
    }
  },
};

const menuButton = `${linkTarget} button`;

export const RowLinkWithMenu: Story = {
  tags: ['visual'],
  name: '行のリンクと行の中のメニュー',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '行のリンクのある行に、メニューを開くボタンなどの操作を置けます。行の中の操作を押しても行のリンクでは移らず、押している間も行は濃くなりません。',
      },
    },
    pseudo: {
      rootSelector: 'body',
      hover: [
        `[data-preview="active"] ${linkTarget}`,
        `[data-preview="button-active"] ${linkTarget}`,
      ],
      active: [
        `[data-preview="active"] ${linkTarget}`,
        `[data-preview="button-active"] ${linkTarget}`,
        `[data-preview="button-active"] ${menuButton}`,
      ],
    },
  },
  render: () => (
    <Gallery columnWidth="30rem">
      <Specimen label="通常">
        <LinkTable withMenu />
      </Specimen>
      <Specimen label="行を押下（2 行目）">
        <div data-preview="active">
          <LinkTable withMenu />
        </div>
      </Specimen>
      <Specimen label="︙ を押下（2 行目）">
        <div data-preview="button-active">
          <LinkTable withMenu />
        </div>
      </Specimen>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    // 状態を固定するアドオンが :active を書き換えるのは「描き終わった」の合図のあと。Vitest では出ないので出す
    addons.getChannel().emit('storyRendered');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const at = (state: string) =>
      canvasElement.querySelector<HTMLElement>(`[data-preview="${state}"] ${linkTarget}`)!;
    const bg = (element: Element) => getComputedStyle(element).backgroundColor;
    // 行を押すと濃くなる。︙ を押している間は、載せたときの塗りのまま
    const pressed = bg(at('active'));
    const buttonPressed = bg(at('button-active'));
    await expect(buttonPressed).not.toBe(pressed);
    await expect(buttonPressed).not.toBe(bg(canvasElement.querySelector(linkTarget)!));
  },
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
