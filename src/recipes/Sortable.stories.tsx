import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { sourceCode } from '../stories/story-states';
import { type Task, SortableTaskTable } from './sortable-data-table';
import tableRecipe from './sortable-data-table.tsx?raw';
import { SortableList } from './sortable-dnd-kit';
import recipe from './sortable-dnd-kit.tsx?raw';
import { SortableTwoLists } from './sortable-move-between-lists';
import listsRecipe from './sortable-move-between-lists.tsx?raw';

// レシピ: 部品にせず、既存の部品を組み合わせて作るもの。ここに置くのは組み方の見本で、公開の入口（src/index.ts）には足さない
// 見せるコードは、動かしているファイルそのもの（?raw）。部品の import だけ、利用者が書く形に直す

const code = recipe.replace("'../components/sortable/Sortable'", "'@kazuemon/ui'");

const items = [
  { id: 'draft', label: '下書きを書く' },
  { id: 'review', label: '見直しを頼む' },
  { id: 'image', label: '見出しの画像を作る' },
  { id: 'publish', label: '公開する' },
];

const meta = {
  title: 'Recipes/Sortable',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '`Sortable` を、ポインタで引いて並べ替えられるようにする見本です。`Sortable` は見た目とキーボードでの並べ替えだけを持つので、引く動きは [dnd-kit](https://dndkit.com/) に任せます。',
          '',
          '- 下のコードを、自分のアプリに写して使います。`@dnd-kit/react`・`@dnd-kit/dom`・`@dnd-kit/helpers` の 3 つを入れます（どれも 0.5.0 で書いています）。`@dnd-kit/dom` は、センサーと読み上げの仕組み（`Accessibility`）を読むのに使います。dnd-kit の 0.x は API が変わることがあるので、版を上げたら型定義で確かめます。',
          '- 並びは id の配列（`order`）で持ちます。dnd-kit の `move` がそのまま扱える形で、`Sortable` の `value` にもそのまま渡せます。',
          '- キーボードでの並べ替え（つまみにフォーカスして上下の矢印キー）と、動かしたことの読み上げは `Sortable` が持ち、`onValueChange` で新しい並びを返します。そのため dnd-kit にはポインタだけ（`PointerSensor`）を任せ、dnd-kit の読み上げの仕組み（`Accessibility`）は外します。残すと、つまみに英語の役割（draggable）と押した状態（aria-pressed）が付き、引いたときに英語で読み上げます。',
          '- `PointerSensor` には、4px 動かしてから引き始める条件を付けます。付けないと、つまみを押しただけで持ち上げた写しが出て、ちらついて見えます。',
          '- 周りがずれる動き（`useSortable` の `transition`）と、離したときに収まる動き（`DragOverlay` の `dropAnimation`）は、`Sortable` の動きと同じ 250ms とシートと同じ緩急にそろえます。`Sortable` を `motion="none"` にするときは、どちらにも `null` を渡します。動きを減らす設定では、dnd-kit も動かしません。',
          '- ドラッグだけでしか並べ替えられないと、WCAG 2.2 の 2.5.7 を満たしません。このレシピは `moveActions="item-menu"` で、行の末尾に ︙ のメニュー（上へ・下へ・先頭へ・末尾へ）を置きます。`buttons` にすると、上へ・下へのボタンを並べます。',
          '- `useSortable` の `ref` を `SortableItem` に、`handleRef` を `SortableHandle` に渡すと、つまみだけで引けます。項目のどこでも引けるようにするときは `handleRef` を渡さず、`Sortable` に `grabArea="item"` を付けます。',
          '- 引いているあいだは、`DragOverlay` の中に `dragging` を付けた写しを描き、元の項目には `isDragSource` を `dragSource` で渡します。元の項目は、入る場所の枠になって周りと一緒に動きます。',
          "- Next.js の App Router では、先頭の `'use client'` が要ります。",
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  tags: ['visual'],
  name: '縦のリスト',
  parameters: { docs: { source: sourceCode(code) } },
  render: () => (
    <div className="max-w-sm">
      <SortableList defaultItems={items} label="記事を出すまで" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labels = () => canvas.getAllByRole('listitem').map((item) => item.textContent);

    // キーボード: つまみにフォーカスして下の矢印キーで 1 つ下へ。フォーカスはつまみに残り、位置を読み上げる
    const handle = canvas.getByRole('button', { name: '下書きを書くを並べ替え' });
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(labels()).toEqual(['見直しを頼む', '下書きを書く', '見出しの画像を作る', '公開する'])
    );
    await expect(handle).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('2 番目に移しました（4 件中）');
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(labels()[0]).toBe('下書きを書く'));
    await expect(handle).toHaveAccessibleDescription('上下の矢印キーで並べ替えます');
    // dnd-kit の読み上げの仕組みを外したので、つまみに英語の役割や押した状態が付かない
    await expect(handle).not.toHaveAttribute('aria-pressed');
    await expect(handle).not.toHaveAttribute('aria-roledescription');
    handle.blur();
  },
};

const tableCode = tableRecipe.replace(
  /import \{([^}]*)\} from '\.\.\/components\/[^']+';\n/g,
  (_, list: string) => `import {${list}} from '@kazuemon/ui';\n`
);

const tasks: Task[] = [
  { id: 'heading', title: '見出しを決める', owner: '佐藤', status: '進行中' },
  { id: 'figure', title: '図を描く', owner: '鈴木', status: '未着手' },
  { id: 'body', title: '本文を書く', owner: '高橋', status: '確認待ち' },
  { id: 'proof', title: '校正する', owner: '田中', status: '未着手' },
];

export const TableRows: Story = {
  tags: ['visual'],
  name: '表の行',
  parameters: {
    docs: {
      source: sourceCode(tableCode),
      description: {
        story: [
          '`DataTable` の行を、ポインタで引いて並べ替える見本です。`TableBody` の代わりに `SortableTableBody` を置き、行は `SortableItem` の `render` に `DataTableRow` を渡して描きます。',
          '',
          '- 表の行では、`DragOverlay`（ポインタについて動く写し）を使いません。写しは表の外に描かれるので、列の幅が合わなくなります。dnd-kit は、引いている行そのものを動かし、セルの幅を保ちます。引いている行には `useSortable` の `isDragging` を `dragging` で渡します。',
          '- つまみ（`SortableHandle`）は先頭の列のセルに、移動の操作（`SortableItemActions`）は末尾の列のセルに入れます。それだけを入れたセルは、中身の幅に詰まります。見出しのセルは読み上げだけの文字（`VisuallyHidden`）にし、`className="w-px"` で幅を詰めます。',
          '- ほかは縦のリストと同じです（ポインタだけを dnd-kit に任せる・4px 動かしてから引き始める・動きの長さをそろえる・︙ のメニューで引かずに並べ替える）。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="max-w-xl">
      <SortableTaskTable defaultTasks={tasks} label="記事を出すまでの作業" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const titles = () =>
      canvas
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.querySelectorAll('td')[1]?.textContent);
    const handle = canvas.getByRole('button', { name: '見出しを決めるを並べ替え' });
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(titles()).toEqual(['図を描く', '見出しを決める', '本文を書く', '校正する'])
    );
    await expect(handle).toHaveFocus();
    await expect(handle).not.toHaveAttribute('aria-roledescription');
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(titles()[0]).toBe('見出しを決める'));
    handle.blur();
  },
};

const listsCode = listsRecipe.replace(
  /import \{([^}]*)\} from '\.\.\/components\/[^']+';\n/g,
  (_, list: string) => `import {${list}} from '@kazuemon/ui';\n`
);

export const MoveBetweenLists: Story = {
  name: 'ほかのリストへ移す',
  parameters: {
    docs: {
      source: sourceCode(listsCode),
      description: {
        story: [
          '2 つのリストのあいだで、引かずに項目を移す見本です。`Sortable` は 1 つのリストの中の並べ替えだけを持つので、リストをまたぐ移動は使う側が組みます。',
          '',
          '- 両方のリストの並びを親で持ちます。',
          '- `SortableItem` の `menu` に「〜へ移動」の `MenuItem` を渡すと、︙ のメニューの既定の項目（上へ・下へ・先頭へ・末尾へ）のあとに並びます。押したら、元のリストから消し、移す先の末尾に足します。',
          '- ポインタで引いてリストをまたぐときは、dnd-kit の `DragDropProvider` で両方のリストを包み、`onDragOver` で同じように両方の並びを更新します。',
        ].join('\n'),
      },
    },
  },
  render: () => <SortableTwoLists defaultItems={items} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const labelsOf = (name: string) =>
      within(canvas.getByRole('list', { name }))
        .queryAllByRole('listitem')
        .map((item) => item.textContent);
    await userEvent.click(canvas.getByRole('button', { name: '下書きを書くを移動' }));
    const menu = await body.findByRole('menu');
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'あとでへ移動' }));
    await waitFor(() => expect(labelsOf('今日')).toEqual(['見直しを頼む']));
    await expect(labelsOf('あとで')).toEqual(['見出しの画像を作る', '公開する', '下書きを書く']);
  },
};
