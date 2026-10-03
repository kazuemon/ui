import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useState } from 'react';
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
import { SortableItemActions, SortableSeparator, useSortableItemActions } from './Sortable';
import { SortableTableBody } from './SortableTableBody';
import { Button } from '../button/Button';
import { DataTableHeader } from '../data-table/DataTableHeader';
import { Dialog } from '../dialog/Dialog';
import { DataTableRow } from '../data-table/DataTableRow';
import { DataTable } from '../data-table/DataTable';
import { MenuItem, MenuSeparator } from '../menu/MenuItem';
import { TableCell, TableHead, TableRow } from '../table/Table';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';

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
          '- ドラッグだけでしか並べ替えられないと、WCAG 2.2 の 2.5.7（ドラッグの動き）を満たしません。ポインタで使う人がいるなら、`moveActions` に `item-menu`（末尾の ︙ から上へ・下へ・先頭へ・末尾へ）か `buttons`（末尾の上へ・下へのボタン）を選びます。既定は `none` です。文字は `moveUpLabel`・`moveDownLabel`・`moveFirstLabel`・`moveLastLabel`・`moveMenuName` で差し替えます。︙ のメニューに項目を足すときは `SortableItem` の `menu`、既定の項目を消して組み直すときは `hideMoveItems` と `useSortableItemActions` です。',
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

// 動かさない行（区切り・見出し）を挟んだ見本。value は項目だけで、区切りは「上から 2 件のあと」に描く
function SeparatorSample({
  variant,
  showDivider,
}: {
  variant?: SortableVariant;
  showDivider?: boolean;
}) {
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  return (
    <div className="w-64">
      <Sortable
        value={order}
        onValueChange={setOrder}
        aria-label={`今週やること（${variant ?? 'card'}${showDivider ? '・線' : ''}）`}
        variant={variant}
      >
        <SortableSeparator showDivider={showDivider}>今日</SortableSeparator>
        {order.map((id, index) => (
          <Fragment key={id}>
            {index === 2 && (
              <SortableSeparator showDivider={showDivider}>明日以降</SortableSeparator>
            )}
            <SortableItem value={id} accessibleName={labelOf(id)}>
              <SortableHandle />
              {labelOf(id)}
            </SortableItem>
          </Fragment>
        ))}
      </Sortable>
    </div>
  );
}

export const Separators: Story = {
  tags: ['visual'],
  name: '動かさない行（区切り・見出し）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`SortableSeparator` は、並びの途中に挟む動かさない行です。`value` には入れず、項目のあいだに描きます。項目は区切りをまたいで動き、区切りの位置は使う側がどこに描くかで決めます（ここでは上から 2 件のあと）。見出しの文字だけで、上の空きで分けます。`showDivider` を付けると、文字のあとの残りの幅に細い線を引きます（下の段）。文字を書かずに `showDivider` を付けると、線だけの区切りになります。`divided` では、項目と同じ区切りの線で分けるので `showDivider` は使いません。済んだ項目のように、項目そのものを止めるときは `SortableItem` の `disabled` です。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-8">
        {variants.map((variant) => (
          <SeparatorSample key={variant} variant={variant} />
        ))}
      </div>
      <div className="flex flex-wrap gap-8">
        <SeparatorSample variant="card" showDivider />
        <SeparatorSample variant="fill" showDivider />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: '今週やること（card）' });
    const canvas = within(list);
    const labels = () =>
      canvas
        .getAllByRole('listitem')
        .map((item) => item.textContent)
        .filter((text) => text !== '');
    // 2 件目を下へ動かすと、区切り（明日以降）をまたいで 3 件目に入る
    const handle = canvas.getByRole('button', { name: '見直しを頼むを並べ替え' });
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(labels()).toEqual([
        '今日',
        '下書きを書く',
        '見出しの画像を作る',
        '明日以降',
        '見直しを頼む',
        '公開する',
      ])
    );
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(labels()[2]).toBe('見直しを頼む'));
    handle.blur();
  },
};

function MenuSample() {
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  const remove = (id: string) => setOrder((current) => current.filter((other) => other !== id));
  return (
    <div className="w-72">
      <Sortable
        value={order}
        onValueChange={setOrder}
        aria-label="今日やること"
        moveActions="item-menu"
      >
        {order.map((id) => (
          <SortableItem
            key={id}
            value={id}
            accessibleName={labelOf(id)}
            menu={
              <MenuItem status="danger" onClick={() => remove(id)}>
                削除
              </MenuItem>
            }
          >
            <SortableHandle />
            {labelOf(id)}
          </SortableItem>
        ))}
      </Sortable>
    </div>
  );
}

// 既定の項目を消して、︙ のメニューを組み直す。動かす関数は useSortableItemActions から読む
function OwnMenuItems({ onRemove }: { onRemove: () => void }) {
  const { index, total, moveFirst, moveLast } = useSortableItemActions();
  return (
    <>
      <MenuItem disabled={index <= 0} onClick={moveFirst}>
        いちばん上へ
      </MenuItem>
      <MenuItem disabled={index >= total - 1} onClick={moveLast}>
        いちばん下へ
      </MenuItem>
      <MenuSeparator />
      <MenuItem status="danger" onClick={onRemove}>
        削除
      </MenuItem>
    </>
  );
}

function OwnMenuSample() {
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  const remove = (id: string) => setOrder((current) => current.filter((other) => other !== id));
  return (
    <div className="w-72">
      <Sortable
        value={order}
        onValueChange={setOrder}
        aria-label="あとでやること"
        moveActions="item-menu"
        hideMoveItems
      >
        {order.map((id) => (
          <SortableItem
            key={id}
            value={id}
            accessibleName={labelOf(id)}
            menu={<OwnMenuItems onRemove={() => remove(id)} />}
          >
            <SortableHandle />
            {labelOf(id)}
          </SortableItem>
        ))}
      </Sortable>
    </div>
  );
}

export const MenuExtras: Story = {
  name: 'メニューに足す項目と、組み直したメニュー',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '`moveActions="item-menu"` の ︙ のメニューは、何もしなければ上へ・下へ・先頭へ・末尾へを出します。',
          '',
          '- `SortableItem` の `menu` に `MenuItem` を渡すと、既定の項目のあとに区切り線を挟んで並べます（左）。複製・削除のような、その項目だけの操作を入れます。ほかのリストへ移す操作も、ここに足して、両方の並びを使う側が更新します（Recipes/Sortable の「ほかのリストへ移す」）。',
          '- `Sortable` の `hideMoveItems` は既定の項目を出さず、`menu` がメニューの中身のすべてになります（右）。`menu` の中で `useSortableItemActions` を呼ぶと、その項目を動かす関数（`moveUp`・`moveDown`・`moveFirst`・`moveLast`・`moveTo`）といまの位置（`index`・`total`）を受け取れます。動かしたあとの読み上げとフォーカスの戻し方は、既定の項目と同じです。',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-8">
      <MenuSample />
      <OwnMenuSample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const [extraList, ownList] = within(canvasElement).getAllByRole('list');
    const labelsOf = (list: HTMLElement) => () =>
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent);

    // 足した項目: 既定の移動の項目のあとに「削除」が並ぶ
    await userEvent.click(within(extraList).getByRole('button', { name: '下書きを書くを移動' }));
    let menu = await body.findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: '末尾へ移動' })).toBeInTheDocument();
    await userEvent.click(within(menu).getByRole('menuitem', { name: '削除' }));
    await waitFor(() => expect(labelsOf(extraList)()).toHaveLength(3));

    // 組み直したメニュー: 既定の項目は出ず、useSortableItemActions の関数で動かす
    await userEvent.click(within(ownList).getByRole('button', { name: '下書きを書くを移動' }));
    menu = await body.findByRole('menu');
    await expect(within(menu).queryByRole('menuitem', { name: '上へ移動' })).toBeNull();
    await expect(within(menu).getByRole('menuitem', { name: 'いちばん上へ' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'いちばん下へ' }));
    await waitFor(() =>
      expect(labelsOf(ownList)()).toEqual([
        '見直しを頼む',
        '見出しの画像を作る',
        '公開する',
        '下書きを書く',
      ])
    );
    await waitFor(() =>
      expect(within(ownList).getByRole('button', { name: '下書きを書くを並べ替え' })).toHaveFocus()
    );
    await expect(within(ownList.parentElement ?? ownList).getByRole('status')).toHaveTextContent(
      '4 番目に移しました（4 件中）'
    );
  },
};

const tasks = [
  { id: 't1', title: '見出しを決める', owner: '佐藤' },
  { id: 't2', title: '図を描く', owner: '鈴木' },
  { id: 't3', title: '本文を書く', owner: '高橋' },
];

function TableSample({
  moveActions,
  variant,
  draggingId,
}: Pick<SortableProps, 'moveActions'> & {
  variant?: 'lines' | 'framed' | 'banded';
  draggingId?: string;
}) {
  const [order, setOrder] = useState(() => tasks.map((task) => task.id));
  const taskOf = (id: string) => tasks.find((task) => task.id === id);
  return (
    <div className="w-[420px]">
      <DataTable variant={variant} accessibleName="作業の順番">
        <TableHead>
          <TableRow>
            <DataTableHeader className="w-px">
              <VisuallyHidden>並べ替え</VisuallyHidden>
            </DataTableHeader>
            <DataTableHeader>作業</DataTableHeader>
            <DataTableHeader>担当</DataTableHeader>
            {moveActions !== 'none' && (
              <DataTableHeader className="w-px">
                <VisuallyHidden>操作</VisuallyHidden>
              </DataTableHeader>
            )}
          </TableRow>
        </TableHead>
        <SortableTableBody value={order} onValueChange={setOrder} moveActions={moveActions}>
          {order.map((id) => (
            <SortableItem
              key={id}
              value={id}
              render={<DataTableRow />}
              accessibleName={taskOf(id)?.title}
              dragging={id === draggingId}
            >
              <TableCell>
                <SortableHandle />
              </TableCell>
              <TableCell>{taskOf(id)?.title}</TableCell>
              <TableCell>{taskOf(id)?.owner}</TableCell>
              {moveActions !== 'none' && (
                <TableCell>
                  <SortableItemActions />
                </TableCell>
              )}
            </SortableItem>
          ))}
        </SortableTableBody>
      </DataTable>
    </div>
  );
}

export const TableRows: Story = {
  tags: ['visual'],
  name: '表の行',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '表の行を並べ替えるときは、`TableBody` の代わりに `SortableTableBody` を置き、`SortableItem` の `render` に `DataTableRow`（か `tr`）を渡します。props は `Sortable` と同じです。つまみの列は部品が足さないので、つまみ（`SortableHandle`）と移動の操作（`SortableItemActions`）を、置きたいセルの中に入れます。ふつうは先頭に取っ手の列、末尾に操作の列を足し、見出しのセルは読み上げだけの文字（`VisuallyHidden`）にします。それだけを入れたセルは、中身の幅に詰まります。行のどこを掴んでも引けるようにするときは `grabArea="item"` を付けます（つまみを置くかは使う側が決めます。キーボードで動かすにはつまみか ︙ が要ります）。引いている行は、リストと同じ面と影で浮かせます。表の行は幅いっぱいに並ぶので、表の見た目によらず大きくしません。ポインタで引くつなぎ方は Recipes/Sortable にあります。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <TableSample moveActions="none" />
      <TableSample moveActions="item-menu" />
      <TableSample moveActions="buttons" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getAllByRole('table')[0];
    const canvas = within(table);
    const titles = () =>
      canvas
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.querySelectorAll('td')[1]?.textContent);
    const handle = canvas.getByRole('button', { name: '見出しを決めるを並べ替え' });
    await expect(handle).toHaveAccessibleDescription('上下の矢印キーで並べ替えます');
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(titles()).toEqual(['図を描く', '見出しを決める', '本文を書く']));
    await expect(handle).toHaveFocus();
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body)
          .getAllByRole('status')
          .map((s) => s.textContent)
      ).toContain('2 番目に移しました（3 件中）')
    );
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(titles()[0]).toBe('見出しを決める'));
    handle.blur();
  },
};

export const TableRowLifted: Story = {
  name: '表の行を引いているとき',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '引いている行（`dragging`）は、リストと同じ面と影で浮かせます。表の行は幅いっぱいに並ぶので、`lines`・`framed`・`banded` のどれでも大きくしません。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      {(['lines', 'framed', 'banded'] as const).map((variant) => (
        <TableSample key={variant} variant={variant} draggingId="t2" />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [lines, framed, banded] = within(canvasElement).getAllByRole('table');
    const scaleOf = (table: HTMLElement) => {
      const row = within(table).getByRole('button', { name: '図を描くを並べ替え' }).closest('tr');
      return row == null ? null : getComputedStyle(row).scale;
    };
    for (const table of [lines, framed, banded]) {
      await waitFor(() => expect(['none', '1']).toContain(scaleOf(table)));
      const row = within(table).getByRole('button', { name: '図を描くを並べ替え' }).closest('tr');
      await waitFor(() =>
        expect(row == null ? 'none' : getComputedStyle(row).boxShadow).not.toBe('none')
      );
    }
  },
};

export const InDialog: Story = {
  name: 'Dialog の中で',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`Dialog` の中にも、そのまま置けます。動かしたことの知らせは、`Dialog` の中で読み上げます。',
      },
    },
  },
  render: () => (
    <Dialog title="並べ替える" trigger={<Button>並べ替える</Button>}>
      <div className="flex flex-col gap-6">
        <Sample />
        <TableSample />
      </div>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: '並べ替える' }));
    const dialog = await body.findByRole('dialog', { name: '並べ替える' });
    const inDialog = within(dialog);
    // リストと表の行を 1 つずつ動かし、知らせの領域が Dialog の中にあることを確かめる
    for (const [scope, name] of [
      [inDialog.getByRole('list', { name: '記事を出すまで' }), '見直しを頼むを並べ替え'],
      [inDialog.getByRole('table', { name: '作業の順番' }), '図を描くを並べ替え'],
    ] as const) {
      within(scope).getByRole('button', { name }).focus();
      await userEvent.keyboard('{ArrowDown}');
    }
    await waitFor(() =>
      expect(inDialog.getAllByRole('status').map((status) => status.textContent)).toEqual([
        '3 番目に移しました（4 件中）',
        '3 番目に移しました（3 件中）',
      ])
    );
    await userEvent.keyboard('{Escape}');
  },
};
