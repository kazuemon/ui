import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import {
  Sortable,
  type SortableGrabArea,
  SortableHandle,
  SortableItem,
  type SortableProps,
  type SortableVariant,
} from './Sortable';

const items = [
  { id: 'draft', label: '下書きを書く' },
  { id: 'review', label: '見直しを頼む' },
  { id: 'image', label: '見出しの画像を作る' },
  { id: 'publish', label: '公開する' },
];
const labelOf = (id: string) => items.find((item) => item.id === id)?.label ?? id;
const variants: SortableVariant[] = ['card', 'fill', 'divided'];

type SampleProps = Partial<
  Pick<
    SortableProps,
    'variant' | 'grabArea' | 'disabled' | 'moveActions' | 'dragSourceVariant' | 'motion'
  >
> & {
  /** 入る場所の見た目にする項目（並べ替えの途中を止めて見せる） */
  sourceIndex?: number;
  /** この項目だけを動かせなくする */
  lockedIndex?: number;
  /** つまみを末尾に置く */
  handleEnd?: boolean;
};

// キーボードで並べ替えられる見本。ポインタで引く動きは Recipes/Sortable（dnd-kit）
function Sample({ sourceIndex, lockedIndex, handleEnd, ...props }: SampleProps) {
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  return (
    <div className="relative w-64">
      <Sortable value={order} onValueChange={setOrder} aria-label="記事を出すまで" {...props}>
        {order.map((id, index) => (
          <SortableItem
            key={id}
            value={id}
            dragSource={index === sourceIndex}
            disabled={index === lockedIndex}
            accessibleName={labelOf(id)}
          >
            <SortableHandle placement={handleEnd ? 'end' : 'start'} />
            {labelOf(id)}
          </SortableItem>
        ))}
      </Sortable>
      {sourceIndex !== undefined && (
        // 持ち上げた写し。エンジンが描く位置の代わりに、入る場所から少しずらして重ねる
        <ul
          inert
          className="absolute inset-x-0 translate-x-3"
          style={{
            top: `calc((var(--spacing-control) + var(--sortable-gap)) * ${sourceIndex} + 26px)`,
          }}
        >
          <SortableItem value={order[sourceIndex]} dragging>
            <SortableHandle placement={handleEnd ? 'end' : 'start'} />
            {labelOf(order[sourceIndex])}
          </SortableItem>
        </ul>
      )}
    </div>
  );
}

const meta = {
  title: 'Components/Sortable',
  component: Sortable,
  subcomponents: { SortableItem, SortableHandle },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '並べ替えられるリストです。やることの順番や、表示する項目の並びのように、並びそのものが値になるところで使います。',
          '',
          '- `Sortable` の中に `SortableItem` を並べ、項目の中につまみ（`SortableHandle`）を置きます。`value` は項目の `value` をいまの順に並べた配列で、常に制御です。',
          '- キーボードでは、つまみにフォーカスして上下の矢印キーで 1 つずつ動かします。動かすと `onValueChange` に新しい並びを渡し、何番目に移ったかを読み上げます。',
          '- ポインタで引く動きは持ちません。dnd-kit などとつなぎ、引いているあいだの見た目を `SortableItem` の `dragging`（ポインタについて動く写し）と `dragSource`（入る場所）で渡します。つなぎ方は Recipes/Sortable にあります。',
          '- `SortableItem` の `accessibleName` に項目の名前を渡すと、つまみと移動のボタンの読み上げの名前に入ります（「下書きを書くを並べ替え」「下書きを書くを上へ移動」）。',
          '- `variant` は項目の面です。既定は `card`（白い面と細い輪郭）で、`fill`（入力欄と同じグレーの塗り）、`divided`（1 つの枠の中で線で区切る）を選べます。',
          '- `dragSourceVariant` は並べ替えの途中の入る場所の見せ方です。既定は `outline`（点線の枠だけ）で、`filled`（淡いグレーの面に点線の枠）を選べます。',
          '- `motion` は並べ替えたときの動きです。既定は `slide`（元の位置から滑らせる）で、`none`（動かさない）を選べます。動きを減らす設定では、`slide` でも動かしません。',
          '- つまみを置く端は `SortableHandle` の `placement` です。既定は `start`（先頭）で、`end`（末尾）を選べます。つまみは項目の端に接した塊で、項目の高さいっぱいに押せます。',
          '- `grabArea` はどこをつかんで引くかです。既定は `handle`（つまみだけ）で、`item`（項目のどこでも）を選べます。エンジンにも同じ指定をします。`item` では、指でリストの上をスクロールしようとしたときにも引き始めることがあるので、指で使う画面では `handle` を選びます。',
          '- ドラッグだけでしか並べ替えられないと、WCAG 2.2 の 2.5.7（ドラッグの動き）を満たしません。ポインタで使う人がいるなら、`moveActions` に `item-menu`（末尾の ︙ から上へ・下へ・先頭へ・末尾へ）か `buttons`（末尾の上へ・下へのボタン）を選びます。既定は `none` です。文字は `moveUpLabel`・`moveDownLabel`・`moveFirstLabel`・`moveLastLabel`・`moveMenuName` で差し替えます。',
          '- `disabled` で並べ替えられなくすると、つまみを隠します。項目ごとに止めるときは `SortableItem` の `disabled` です。',
        ].join('\n'),
      },
    },
  },
  args: {
    value: [],
    variant: 'card',
    dragSourceVariant: 'outline',
    motion: 'slide',
    grabArea: 'handle',
    moveActions: 'none',
    disabled: false,
  },
  argTypes: {
    value: { control: false },
    variant: {
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: "'card'" } },
    },
    dragSourceVariant: {
      control: 'inline-radio',
      options: ['outline', 'filled'],
      table: { defaultValue: { summary: "'outline'" } },
    },
    motion: {
      control: 'inline-radio',
      options: ['slide', 'none'],
      table: { defaultValue: { summary: "'slide'" } },
    },
    moveActions: {
      control: 'inline-radio',
      options: ['none', 'item-menu', 'buttons'],
      table: { defaultValue: { summary: "'none'" } },
    },
    grabArea: {
      control: 'inline-radio',
      options: ['handle', 'item'] satisfies SortableGrabArea[],
      table: { defaultValue: { summary: "'handle'" } },
    },
  },
} satisfies Meta<typeof Sortable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        const [order, setOrder] = useState(['draft', 'review', 'image', 'publish']);

        <Sortable value={order} onValueChange={setOrder} aria-label="記事を出すまで">
          {order.map((id) => (
            <SortableItem key={id} value={id} accessibleName={labels[id]}>
              <SortableHandle />
              {labels[id]}
            </SortableItem>
          ))}
        </Sortable>
      `),
    },
  },
  render: (args) => (
    <Sample
      variant={args.variant}
      dragSourceVariant={args.dragSourceVariant}
      motion={args.motion}
      grabArea={args.grabArea}
      moveActions={args.moveActions}
      disabled={args.disabled}
    />
  ),
};

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover（つまみ）', state: 'hover' },
  { label: 'フォーカス（つまみ）', state: 'focus' },
];
// 1 つ目の項目のつまみに hover・フォーカスを当てる
const firstHandle = 'ul[aria-label] > li:first-child [data-slot="sortable-handle"]';

export const States: Story = {
  tags: ['visual'],
  name: '面と状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: firstHandle, focusVisible: firstHandle }),
  },
  render: () => (
    <Matrix
      rows={variants}
      columns={stateColumns}
      columnWidth="16rem"
      rowLabel={(variant) => variant}
      renderCell={(variant) => <Sample variant={variant} />}
    />
  ),
};

const dragColumns: (MatrixColumn & SampleProps)[] = [
  { label: '並べ替えの途中', sourceIndex: 1 },
  { label: '入る場所（filled）', sourceIndex: 1, dragSourceVariant: 'filled' },
  { label: '1 つだけ動かせない', lockedIndex: 0 },
  { label: '並べ替えられない', disabled: true },
];

export const Dragging: Story = {
  tags: ['visual'],
  name: '並べ替えの途中と、動かせないとき',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '並べ替えの途中は、元の項目が入る場所の点線の枠になり、持ち上げた写しがその上に重なります（写しの位置はエンジンが決めます）。`dragSourceVariant="filled"` では、枠の中に淡いグレーの面を敷きます。動かせない項目はつまみを隠し、文の頭はほかの項目とそろえたままにします。リストごと並べ替えられないときは、つまみの場所も詰めます。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={variants}
      columns={dragColumns}
      columnWidth="16rem"
      rowLabel={(variant) => variant}
      renderCell={(variant, { label: _label, ...column }) => (
        <Sample variant={variant} {...column} />
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <Sample />
    </DensityPair>
  ),
};

export const Keyboard: Story = {
  name: 'キーボードと読み上げ',
  parameters: {
    docs: {
      description: {
        story:
          'つまみにフォーカスして上下の矢印キーで動かします。動かしたあともフォーカスはつまみに残り、「2 番目に移しました（4 件中）」のように読み上げます。読み上げる文は `movedText`、つまみの説明は `instructionText` で差し替えられます。',
      },
    },
  },
  render: () => <Sample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labels = () => canvas.getAllByRole('listitem').map((item) => item.textContent);
    const handle = canvas.getByRole('button', { name: '見出しの画像を作るを並べ替え' });
    await expect(handle).toHaveAccessibleDescription('上下の矢印キーで並べ替えます');

    handle.focus();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(labels()).toEqual(['下書きを書く', '見出しの画像を作る', '見直しを頼む', '公開する'])
    );
    await expect(handle).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('2 番目に移しました（4 件中）');

    // 端より先へは動かさない
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await waitFor(() => expect(labels()[0]).toBe('見出しの画像を作る'));
    await expect(handle).toHaveFocus();
  },
};

const moveActionRows = ['item-menu', 'buttons'] as const;

export const MoveActions: Story = {
  tags: ['visual'],
  name: '引かずに並べ替える操作',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'ドラッグだけでしか並べ替えられないと、WCAG 2.2 の 2.5.7 を満たしません。ポインタで使う人がいるなら、`moveActions` に `item-menu`（末尾の ︙ から上へ・下へ・先頭へ・末尾へ）か `buttons`（末尾の上へ・下へのボタン）を選びます。端の項目では、それより先へ動かす操作は押せません。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={moveActionRows}
      columns={[{ label: '先頭のつまみ' }, { label: '末尾のつまみ' }]}
      columnWidth="16rem"
      rowLabel={(moveActions) => moveActions}
      renderCell={(moveActions, column) => (
        <Sample moveActions={moveActions} handleEnd={column.label === '末尾のつまみ'} />
      )}
    />
  ),
};

export const MoveWithoutDragging: Story = {
  name: '引かずに並べ替える（確かめ）',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-8">
      <Sample moveActions="item-menu" />
      <Sample moveActions="buttons" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [menuList, buttonList] = canvasElement.querySelectorAll<HTMLElement>('ul[aria-label]');
    const body = within(canvasElement.ownerDocument.body);
    const labelsOf = (list: HTMLElement) => () =>
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent);

    // item-menu: ︙ の名前に項目の名前が入る。先頭の項目では「上へ」「先頭へ」を押せない
    const menuCanvas = within(menuList);
    const kebab = menuCanvas.getByRole('button', { name: '下書きを書くを移動' });
    await userEvent.click(kebab);
    const menu = await body.findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: '上へ移動' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await expect(within(menu).getByRole('menuitem', { name: '先頭へ移動' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await userEvent.click(within(menu).getByRole('menuitem', { name: '末尾へ移動' }));
    await waitFor(() =>
      expect(labelsOf(menuList)()).toEqual([
        '見直しを頼む',
        '見出しの画像を作る',
        '公開する',
        '下書きを書く',
      ])
    );
    // 動かしたあとは、その項目のつまみにフォーカスを戻し、位置を読み上げる
    await waitFor(() =>
      expect(menuCanvas.getByRole('button', { name: '下書きを書くを並べ替え' })).toHaveFocus()
    );
    await expect(within(menuList.parentElement ?? menuList).getByRole('status')).toHaveTextContent(
      '4 番目に移しました（4 件中）'
    );

    // buttons: 名前に項目の名前が入る。先頭の「上へ」は押せない
    const buttonCanvas = within(buttonList);
    await expect(
      buttonCanvas.getByRole('button', { name: '下書きを書くを上へ移動' })
    ).toBeDisabled();
    await expect(buttonCanvas.getByRole('button', { name: '公開するを下へ移動' })).toBeDisabled();
    await userEvent.click(buttonCanvas.getByRole('button', { name: '下書きを書くを下へ移動' }));
    await waitFor(() => expect(labelsOf(buttonList)()[1]).toBe('下書きを書く'));
    await waitFor(() =>
      expect(buttonCanvas.getByRole('button', { name: '下書きを書くを並べ替え' })).toHaveFocus()
    );
  },
};

export const Disabled: Story = {
  name: '並べ替えられない',
  render: () => <Sample disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // つまみは隠れ、フォーカスも止まらない。項目の文はそのまま読める
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.getByText('公開する')).toBeVisible();
  },
};
