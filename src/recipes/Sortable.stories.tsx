import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { sourceCode } from '../stories/story-states';
import { SortableList } from './sortable-dnd-kit';
import recipe from './sortable-dnd-kit.tsx?raw';

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
          '- ドラッグだけでしか並べ替えられないと、WCAG 2.2 の 2.5.7 を満たしません。ポインタで使う人がいるなら、`Sortable` の `moveActions` に `item-menu` か `buttons` を選びます。',
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
      <SortableList items={items} label="記事を出すまで" />
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
