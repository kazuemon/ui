'use client';

// レシピ: DataTable を TanStack Table（@tanstack/react-table 9.2.4）でつなぐ見本。利用者が自分のアプリに写して使う
// 並べ替え・選択・ページ送りの状態は TanStack Table が持ち、部品にはその値をそのまま渡す
// 検索は、TanStack Table に渡す前の data を絞る（部品の外の仕事）
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Button } from '../../components/button/Button';
import { DataTable } from '../../components/data-table/DataTable';
import { DataTableEmpty } from '../../components/data-table/DataTableEmpty';
import { DataTableHeader } from '../../components/data-table/DataTableHeader';
import { DataTableRow } from '../../components/data-table/DataTableRow';
import {
  DataTableSelectCell,
  DataTableSelectHeader,
} from '../../components/data-table/DataTableSelect';
import { Pagination } from '../../components/pagination/Pagination';
import { SearchField } from '../../components/search-field/SearchField';
import { Select } from '../../components/select/Select';
import { StatusPanel } from '../../components/status-panel/StatusPanel';
import { TableBody, TableCell, TableHead, TableRow } from '../../components/table/Table';
import { Tag } from '../../components/tag/Tag';
import { Text } from '../../components/text/Text';

export interface Order {
  id: string;
  shop: string;
  date: string;
  status: '発送済み' | '準備中' | '取り消し';
  amount: number;
}

// 列ごとに持たせる値の型（ここでは寄せ）。値は使わず、型だけを tableFeatures に渡す
const columnMeta: { align?: 'start' | 'end' } = {};

// 使う機能を並べる
const features = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  columnMeta,
});

// 1 ページに出す行の数の選択肢
const pageSizes = [5, 10, 20];

const statusColor = { 発送済み: 'success', 準備中: 'info', 取り消し: 'neutral' } as const;

const column = createColumnHelper<typeof features, Order>();
const columns = column.columns([
  column.accessor('id', { header: '注文番号', sortFn: 'alphanumeric' }),
  column.accessor('shop', { header: 'お店', sortFn: 'alphanumeric' }),
  column.accessor('date', { header: '注文日', sortFn: 'basic' }),
  column.accessor('status', {
    header: '状態',
    enableSorting: false,
    cell: (info) => <Tag color={statusColor[info.getValue()]}>{info.getValue()}</Tag>,
  }),
  column.accessor('amount', {
    header: '金額',
    sortFn: 'basic',
    cell: (info) => `${info.getValue().toLocaleString('ja-JP')} 円`,
    meta: { align: 'end' },
  }),
]);

export function OrdersDataTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState('');
  const data = useMemo(
    () => orders.filter((order) => `${order.id} ${order.shop}`.includes(query.trim())),
    [orders, query]
  );
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (order) => order.id,
    initialState: {
      sorting: [{ id: 'date', desc: true }],
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });
  const { pageIndex, pageSize } = table.state.pagination;
  const rowCount = table.getRowCount();
  const selectedCount = Object.keys(table.state.rowSelection).length;
  const rows = table.getRowModel().rows;
  return (
    <div className="flex flex-col gap-3">
      {/* 上の帯: 検索と、選んでいるあいだの一括操作。検索欄は虫眼鏡と見本の文字で分かるので、見えるラベルを置かない */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField
          accessibleName="注文を検索"
          placeholder="注文番号・お店"
          value={query}
          onValueChange={setQuery}
          className="w-64 max-w-full"
        />
        <div className="flex items-center gap-2">
          {/* 読み上げの領域は、あとから足すと最初の内容が読まれないことがあるので、いつも置いて中身だけを変える */}
          <Text as="span" size="sm" variant="muted" aria-live="polite">
            {selectedCount > 0 ? `${selectedCount} 件を選択中` : ''}
          </Text>
          {selectedCount > 0 && (
            <>
              <Button variant="outline">書き出す</Button>
              <Button variant="underline" onClick={() => table.resetRowSelection(true)}>
                選択を外す
              </Button>
            </>
          )}
        </div>
      </div>
      <DataTable accessibleName="注文">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <DataTableSelectHeader
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={table.getIsSomePageRowsSelected()}
                onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
              />
              {headerGroup.headers.map((header) => (
                <DataTableHeader
                  key={header.id}
                  align={header.column.columnDef.meta?.align}
                  sorted={header.column.getIsSorted()}
                  onSortClick={
                    header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined
                  }
                >
                  <table.FlexRender header={header} />
                </DataTableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <DataTableEmpty colSpan={columns.length + 1}>
              <StatusPanel size="sm" status="info" title="見つかりませんでした" headingLevel={3}>
                ほかの言葉で検索してください。
              </StatusPanel>
            </DataTableEmpty>
          )}
          {rows.map((row) => (
            <DataTableRow key={row.id} selected={row.getIsSelected()}>
              <DataTableSelectCell
                checked={row.getIsSelected()}
                onCheckedChange={(checked) => row.toggleSelected(checked)}
                accessibleName={`${row.id} を選ぶ`}
              />
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} align={cell.column.columnDef.meta?.align}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </DataTableRow>
          ))}
        </TableBody>
      </DataTable>
      {/* 下の帯: ページ送りを真ん中に置き、その下に件数と 1 ページの件数 */}
      <div className="flex flex-col items-center gap-3">
        {table.getPageCount() > 1 && (
          <Pagination
            className="w-full"
            page={pageIndex + 1}
            count={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            accessibleName="注文のページ送り"
          />
        )}
        {/* 件数の文と「1 ページの件数」を 1 行に並べる。ラベルは本体の左に置き、周りの文と同じ重さにする */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Text as="span" size="sm" variant="muted">
            {rowCount === 0
              ? '0 件'
              : `${rowCount} 件中 ${pageIndex * pageSize + 1}〜${Math.min(rowCount, (pageIndex + 1) * pageSize)} 件`}
          </Text>
          <Select
            label="1 ページの件数"
            labelPlacement="start"
            labelVariant="subtle"
            items={pageSizes.map((size) => ({ label: `${size} 件`, value: String(size) }))}
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
            className="w-56"
          />
        </div>
      </div>
    </div>
  );
}
