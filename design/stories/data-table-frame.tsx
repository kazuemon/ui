import { type ReactNode, useEffect, useRef } from 'react';

import { Button } from '../../src/components/button/Button';
import type { ChoiceColor } from '../../src/components/checkbox/Checkbox';
import { DataTable, type DataTableSortIndicator } from '../../src/components/data-table/DataTable';
import {
  DataTableHeader,
  type DataTableSortDirection,
} from '../../src/components/data-table/DataTableHeader';
import { DataTableRow } from '../../src/components/data-table/DataTableRow';
import {
  DataTableSelectCell,
  DataTableSelectHeader,
} from '../../src/components/data-table/DataTableSelect';
import { Pagination } from '../../src/components/pagination/Pagination';
import { SearchField } from '../../src/components/search-field/SearchField';
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  type TableVariant,
} from '../../src/components/table/Table';
import { Tag } from '../../src/components/tag/Tag';
import { Text } from '../../src/components/text/Text';

// 軸 364〜369（DataTable）の比較で共有する見本。架空の注文の表と、表の上下の帯

const orders = [
  { id: 'A-1024', shop: '森の文具店', status: '発送済み', amount: 3200 },
  { id: 'A-1025', shop: 'ひだまり雑貨', status: '準備中', amount: 12800 },
  { id: 'A-1026', shop: '港町ベーカリー', status: '発送済み', amount: 860 },
  { id: 'A-1027', shop: 'そらいろ書房', status: '取り消し', amount: 4500 },
  { id: 'A-1028', shop: 'こもれび珈琲', status: '発送済み', amount: 2150 },
  { id: 'A-1029', shop: '北風自転車', status: '準備中', amount: 9400 },
  { id: 'A-1030', shop: 'くじら模型店', status: '発送済み', amount: 5600 },
] as const;

const statusColor = { 発送済み: 'success', 準備中: 'info', 取り消し: 'neutral' } as const;

interface SampleTableProps {
  variant?: TableVariant;
  color?: ChoiceColor;
  /** 選んでいる行の番号 */
  selected?: string[];
  /** 並べ替えている列 */
  sortedBy?: 'id' | 'amount';
  sortDirection?: DataTableSortDirection;
  rows?: number;
  maxHeight?: number;
  /** はじめにスクロールしておく量（px）。貼り付いた見出しの境目を見せる */
  scrollTop?: number;
  hideSelect?: boolean;
  sortIndicator?: DataTableSortIndicator;
  /** DataTable に足すクラス。決めたときに部品から外した案を、比較のために上書きで再現する */
  className?: string;
}

/** 比較で使う注文の表。状態は固定（押しても変わらない） */
export function SampleTable({
  variant,
  color,
  selected = [],
  sortedBy = 'id',
  sortDirection = 'asc',
  rows = 4,
  maxHeight,
  scrollTop,
  hideSelect = false,
  sortIndicator,
  className,
}: SampleTableProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const viewport = ref.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (viewport && scrollTop) viewport.scrollTop = scrollTop;
  }, [scrollTop]);
  const shown = orders.slice(0, rows);
  const all = selected.length === shown.length;
  const sorted = (id: 'id' | 'amount') => (sortedBy === id ? sortDirection : false);
  const noop = () => {};
  return (
    <div ref={ref}>
      <DataTable
        accessibleName="注文"
        variant={variant}
        color={color}
        maxHeight={maxHeight}
        sortIndicator={sortIndicator}
        className={className}
      >
        <TableHead>
          <TableRow>
            {!hideSelect && (
              <DataTableSelectHeader
                checked={all}
                indeterminate={selected.length > 0 && !all}
                onCheckedChange={noop}
              />
            )}
            <DataTableHeader sorted={sorted('id')} onSortClick={noop}>
              注文番号
            </DataTableHeader>
            <DataTableHeader onSortClick={noop}>お店</DataTableHeader>
            <DataTableHeader>状態</DataTableHeader>
            <DataTableHeader align="end" sorted={sorted('amount')} onSortClick={noop}>
              金額
            </DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {shown.map((order) => (
            <DataTableRow key={order.id} selected={selected.includes(order.id)}>
              {!hideSelect && (
                <DataTableSelectCell
                  checked={selected.includes(order.id)}
                  onCheckedChange={noop}
                  accessibleName={`${order.id} を選ぶ`}
                />
              )}
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.shop}</TableCell>
              <TableCell>
                <Tag color={statusColor[order.status]}>{order.status}</Tag>
              </TableCell>
              <TableCell align="end">{order.amount.toLocaleString('ja-JP')} 円</TableCell>
            </DataTableRow>
          ))}
        </TableBody>
      </DataTable>
    </div>
  );
}

/** 表の上の帯の検索 */
export function SearchBar({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <SearchField
        label="注文を検索"
        placeholder="注文番号・お店"
        defaultValue=""
        className="w-56 max-w-full"
      />
      {children}
    </div>
  );
}

/** 選んでいるあいだの件数と操作 */
export function SelectionActions({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Text as="span" size="sm" variant="muted">
        {count} 件を選択中
      </Text>
      <Button variant="outline">書き出す</Button>
      <Button variant="underline">選択を外す</Button>
    </div>
  );
}

/** 表の下の帯に置く件数の文 */
export const countText = '23 件中 1〜4 件';

/** 表の下の帯に置くページ送り */
export function SamplePagination({
  align,
  className,
}: {
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  return (
    <Pagination
      defaultPage={1}
      count={6}
      align={align}
      className={className}
      accessibleName="注文のページ送り"
    />
  );
}
