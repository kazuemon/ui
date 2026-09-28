import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type Order, OrdersDataTable } from './data-table/OrdersDataTable';
import recipeSource from './data-table/OrdersDataTable.tsx?raw';
import { sourceCode } from '../stories/story-states';

// レシピ: 部品にせず、既存の部品を組み合わせて作るもの。ここに置くのは組み方の見本で、公開の入口（src/index.ts）には足さない
// 見本のコードは ./data-table/OrdersDataTable.tsx。Show code には、その中身を部品の import を 1 行にまとめて出す

/** 部品ごとのファイルからの import を、公開の入口からの 1 行にまとめる（写す人が読む形） */
function asPublished(source: string) {
  const names: string[] = [];
  const rest = source.replace(
    /import \{([^}]*)\} from '\.\.\/\.\.\/components\/[^']+';\n/g,
    (_, list: string) => {
      names.push(
        ...list
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean)
      );
      return '';
    }
  );
  const line = `import {\n${names.map((name) => `  ${name},`).join('\n')}\n} from '@kazuemon/ui';\n`;
  return rest.replace(/(import \{ useMemo, useState \} from 'react';\n)/, `$1${line}`);
}

const shops = [
  '森の文具店',
  'ひだまり雑貨',
  '港町ベーカリー',
  'そらいろ書房',
  'こもれび珈琲',
  '北風自転車',
  'くじら模型店',
];
const statuses: Order['status'][] = ['発送済み', '準備中', '発送済み', '取り消し', '発送済み'];

// 架空の注文。並べ替えが分かるよう、日付と金額をばらけさせる
const orders: Order[] = Array.from({ length: 23 }, (_, i) => ({
  id: `A-${1024 + i}`,
  shop: shops[(i * 3) % shops.length],
  date: `2026-09-${String(1 + ((i * 7) % 27)).padStart(2, '0')}`,
  status: statuses[(i * 3 + Math.floor(i / 5)) % statuses.length],
  amount: ((i * 3719) % 18000) + 480,
}));

const meta = {
  title: 'Recipes/DataTable',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'データの表を、TanStack Table（`@tanstack/react-table` 9.2.4）でつなぐ見本です。`DataTable` は見た目だけの部品なので、並べ替え・選択・ページ送りの状態は TanStack Table に持たせます。Show code のコードを、自分のアプリに写して使ってください。',
          '',
          '- `@tanstack/react-table` は、使う側で入れます（このライブラリの依存には入っていません）。版が変わると API が変わることがあるので、写したら型を確かめてください。',
          '- 使う機能は `tableFeatures` に並べます。ここでは並べ替え（`rowSortingFeature`）・選択（`rowSelectionFeature`）・ページ送り（`rowPaginationFeature`）です。',
          '- 部品の props は、TanStack Table の値をそのまま受けます。見出しは `sorted={column.getIsSorted()}` と `onSortClick={column.getToggleSortingHandler()}`、選ぶ箱は `row.getIsSelected()` と `row.toggleSelected`、すべて選ぶ箱は `getIsAllPageRowsSelected`・`getIsSomePageRowsSelected`・`toggleAllPageRowsSelected` です。',
          '- 行の id は `getRowId` で決めます。選んだ行はページや並べ替えをまたいで残ります。',
          '- 列の寄せは `columnMeta` に型を書き、列の `meta.align` を見出しとセルに渡します。',
          '- 検索は、TanStack Table に渡す前の `data` を絞ります。結果がないときは `DataTableEmpty` に `StatusPanel` を入れます。',
          '- 上の帯（検索と、選んでいるあいだの一括操作）と下の帯（`Pagination`・件数・1 ページの件数）は、部品にせず並べて作ります。並べ方は画面に合わせて変えてかまいません。',
          '- 1 ページの件数は `Select` で選び、`table.setPageSize` に渡します。',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Orders: Story = {
  tags: ['visual'],
  name: '並べ替え・選択・ページ送り',
  parameters: {
    docs: { source: sourceCode(asPublished(recipeSource)) },
  },
  render: () => (
    <div className="max-w-3xl">
      <OrdersDataTable orders={orders} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table', { name: '注文' });
    const body = () => within(table).getAllByRole('row').slice(1);
    // はじめは注文日の新しい順。1 ページに 5 行
    await expect(within(table).getByRole('columnheader', { name: '注文日' })).toHaveAttribute(
      'aria-sort',
      'descending'
    );
    await expect(body()).toHaveLength(5);
    // 金額で並べ替える。数の列は、TanStack Table の既定で大きい順から始まる。もう一度押すと小さい順
    const amount = within(table).getByRole('button', { name: '金額' });
    await userEvent.click(amount);
    await expect(within(table).getByRole('columnheader', { name: '金額' })).toHaveAttribute(
      'aria-sort',
      'descending'
    );
    await userEvent.click(amount);
    await expect(within(table).getByRole('columnheader', { name: '金額' })).toHaveAttribute(
      'aria-sort',
      'ascending'
    );
    await expect(body()[0]).toHaveTextContent('480 円');
    // 1 行選ぶと、すべて選ぶ箱は中間の状態になり、上の帯に件数が出る
    const first = within(body()[0]).getByRole('checkbox');
    await userEvent.click(first);
    const all = within(table).getByRole('checkbox', { name: 'すべての行を選ぶ' });
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await expect(canvas.getByText('1 件を選択中')).toBeVisible();
    // 次のページへ移っても、選んだ行は残る
    await userEvent.click(canvas.getByRole('button', { name: '2 ページ目' }));
    await expect(canvas.getByText('23 件中 6〜10 件')).toBeVisible();
    await expect(canvas.getByText('1 件を選択中')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '1 ページ目' }));
    // 検索で結果がないときは、空の行を出す
    await userEvent.type(canvas.getByRole('searchbox', { name: '注文を検索' }), 'ないお店');
    await waitFor(() => expect(canvas.getByText('見つかりませんでした')).toBeVisible());
    await userEvent.clear(canvas.getByRole('searchbox', { name: '注文を検索' }));
    await waitFor(() => expect(body()).toHaveLength(5));
    // 1 ページの件数を 10 件にする
    await userEvent.click(canvas.getByRole('combobox', { name: '1 ページの件数' }));
    await userEvent.click(await within(document.body).findByRole('option', { name: '10 件' }));
    await waitFor(() => expect(body()).toHaveLength(10));
    await expect(canvas.getByText('23 件中 1〜10 件')).toBeVisible();
    // 撮る前にフォーカスを外す（閉じた Select の枠線が、撮るたびに出たり出なかったりする）
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull());
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  },
};
