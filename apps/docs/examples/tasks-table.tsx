'use client';

// タスクボードの見本の「表」: DataTable を TanStack Table でつなぐ。書き方は src/recipes/data-table/OrdersDataTable.tsx と同じ
// 並べ替え・選択・ページ送りの状態は TanStack Table が持ち、部品にはその値をそのまま渡す。言葉で探すのは、渡す前の data を絞る
import {
  Avatar,
  AvatarGroup,
  Button,
  DataTable,
  DataTableEmpty,
  DataTableHeader,
  DataTableLoading,
  DataTableRow,
  DataTableSelectCell,
  DataTableSelectHeader,
  Link,
  Pagination,
  SearchField,
  Select,
  StatusPanel,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tag,
  Text,
} from '@kazuemon/ui';
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
import { type ReactNode, useMemo, useState } from 'react';

import {
  formatDue,
  priorityColor,
  priorityLabel,
  priorityRank,
  statusColor,
  statuses,
  statusLabel,
  type TaskRow,
  type TaskStatus,
  today,
} from './tasks-data';

// 列ごとに持たせる値の型（寄せ）。値は使わず、型だけを tableFeatures に渡す
const columnMeta: { align?: 'start' | 'end' } = {};

const features = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  columnMeta,
});

const pageSizes = [5, 10, 20];

/** 題のセルから横のパネルを開く。列の定義は描く前に作るので、開く関数は context の代わりに列を作る関数で受ける */
function makeColumns(onOpen: (id: string, trigger: HTMLElement) => void) {
  const column = createColumnHelper<typeof features, TaskRow>();
  return column.columns([
    column.accessor('title', {
      header: 'タスク',
      sortFn: 'alphanumeric',
      cell: (info) => (
        <Link
          href={`#task-${info.row.original.id}`}
          onClick={(event) => {
            event.preventDefault();
            onOpen(info.row.original.id, event.currentTarget);
          }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    // 状態は列の順（これから → 完了）で並べる
    column.accessor((row) => statuses.indexOf(row.status), {
      id: 'status',
      header: '状態',
      sortFn: 'basic',
      cell: (info) => {
        const status: TaskStatus = info.row.original.status;
        return <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>;
      },
    }),
    column.accessor((row) => priorityRank[row.priority], {
      id: 'priority',
      header: '優先度',
      sortFn: 'basic',
      cell: (info) => {
        const { priority } = info.row.original;
        return <Tag color={priorityColor[priority]}>{priorityLabel[priority]}</Tag>;
      },
    }),
    column.accessor('assignees', {
      header: '担当',
      enableSorting: false,
      cell: (info) => (
        <AvatarGroup size="sm" max={3}>
          {info.getValue().map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
      ),
    }),
    column.accessor('due', {
      header: '期日',
      sortFn: 'basic',
      cell: (info) => {
        const overdue = info.row.original.status !== 'done' && info.getValue() < today;
        return (
          <span className="inline-flex flex-wrap items-center gap-2">
            {formatDue(info.getValue())}
            {overdue && <Tag color="danger">過ぎています</Tag>}
          </span>
        );
      },
    }),
    column.accessor((row) => row.subtasks.filter((s) => s.done).length, {
      id: 'subtasks',
      header: 'サブタスク',
      enableSorting: false,
      meta: { align: 'end' },
      cell: (info) => {
        const total = info.row.original.subtasks.length;
        return total === 0 ? (
          <Text as="span" size="sm" variant="subtle">
            なし
          </Text>
        ) : (
          `${info.getValue()}/${total}`
        );
      },
    }),
  ]);
}

export function TaskTable({
  rows: allRows,
  loading,
  onOpen,
  onComplete,
  empty,
}: {
  rows: TaskRow[];
  loading: boolean;
  onOpen: (id: string, trigger: HTMLElement) => void;
  /** 選んだタスクを完了の列へ移す */
  onComplete: (ids: string[]) => void;
  /** タスクが 1 つもないときに出すもの（検索で見つからないときは、表の中に別の知らせを出す） */
  empty: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const columns = useMemo(() => makeColumns(onOpen), [onOpen]);
  const data = useMemo(() => {
    const words = query.trim().toLowerCase();
    return allRows.filter((row) =>
      `${row.title} ${row.assignees.join(' ')}`.toLowerCase().includes(words)
    );
  }, [allRows, query]);
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
    initialState: {
      sorting: [{ id: 'due', desc: false }],
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });
  const { pageIndex, pageSize } = table.state.pagination;
  const rowCount = table.getRowCount();
  const selected = Object.keys(table.state.rowSelection);
  const rows = table.getRowModel().rows;
  const colSpan = columns.length + 1;

  return (
    <div className="flex flex-col gap-3">
      {/* 上の帯: 言葉で探す欄と、選んでいるあいだの一括操作 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SearchField
          label="タスクを検索"
          placeholder="題・担当"
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            table.setPageIndex(0);
          }}
          disabled={loading}
          className="w-64 max-w-full"
        />
        <div className="flex items-center gap-2">
          <Text as="span" size="sm" variant="muted" aria-live="polite">
            {selected.length > 0 ? `${selected.length} 件を選択中` : ''}
          </Text>
          {selected.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  onComplete(selected);
                  table.resetRowSelection(true);
                }}
              >
                完了にする
              </Button>
              <Button variant="underline" onClick={() => table.resetRowSelection(true)}>
                選択を外す
              </Button>
            </>
          )}
        </div>
      </div>

      <DataTable accessibleName="タスク" loading={loading}>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <DataTableSelectHeader
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={table.getIsSomePageRowsSelected()}
                onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                disabled={loading || rows.length === 0}
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
          {loading ? (
            <DataTableLoading columns={colSpan} rows={pageSize} showSelectColumn />
          ) : rows.length === 0 ? (
            <DataTableEmpty colSpan={colSpan}>
              {allRows.length === 0 ? (
                empty
              ) : (
                <StatusPanel size="sm" status="info" title="見つかりませんでした" headingLevel={3}>
                  ほかの言葉で検索してください。
                </StatusPanel>
              )}
            </DataTableEmpty>
          ) : (
            rows.map((row) => (
              <DataTableRow key={row.id} selected={row.getIsSelected()}>
                <DataTableSelectCell
                  checked={row.getIsSelected()}
                  onCheckedChange={(checked) => row.toggleSelected(checked)}
                  accessibleName={`${row.original.title}を選ぶ`}
                />
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} align={cell.column.columnDef.meta?.align}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </DataTableRow>
            ))
          )}
        </TableBody>
      </DataTable>

      {/* 下の帯: ページ送りと、件数・1 ページの件数 */}
      {!loading && rowCount > 0 && (
        <div className="flex flex-col items-center gap-3">
          {table.getPageCount() > 1 && (
            <Pagination
              className="w-full"
              page={pageIndex + 1}
              count={table.getPageCount()}
              onPageChange={(page) => table.setPageIndex(page - 1)}
              accessibleName="タスクのページ送り"
            />
          )}
          <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-2">
            <Text
              as="span"
              size="sm"
              variant="muted"
              className="flex h-(--spacing-control) items-center"
            >
              {`${rowCount} 件中 ${pageIndex * pageSize + 1}〜${Math.min(rowCount, (pageIndex + 1) * pageSize)} 件`}
            </Text>
            <Select
              label="1 ページの件数"
              items={pageSizes.map((size) => ({ label: `${size} 件`, value: String(size) }))}
              value={String(pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
              className="w-32"
            />
          </div>
        </div>
      )}
    </div>
  );
}
