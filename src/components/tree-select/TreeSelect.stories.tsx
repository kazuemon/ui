import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TreeSelect, type TreeSelectProps } from './TreeSelect';
import { docTree, labelTree, orgTree } from './tree-select-samples';
import { DensityPair, Matrix } from '../../stories/story-parts';
import {
  enabledControl,
  type MatrixColumn,
  sourceCode,
  statePseudo,
} from '../../stories/story-states';

type Sample = MatrixColumn & { props: Partial<TreeSelectProps<string, boolean>> };

const stateRows: Sample[] = [
  { label: '空', props: {} },
  { label: '値あり', props: { defaultValue: 'principles' } },
  { label: '複数', props: { multiple: true, defaultValue: ['principles', 'tokens'] } },
  { label: 'エラー', props: { errorText: '置き場所を選んでください' } },
  { label: '押せない', props: { defaultValue: 'principles', disabled: true } },
  { label: '読み取り専用', props: { defaultValue: 'principles', readOnly: true } },
];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const colors = ['neutral', 'primary', 'secondary'] as const;

// Controls の値（単数と複数の和）を、1 つ選ぶ形・複数選ぶ形の props として渡す
const single = (args: object) => args as TreeSelectProps;
const many = (args: object) => args as TreeSelectProps<string, true>;

// 開いた面を、ページの body ではなくこの枠の中に描く。ドキュメントのページでも、ストーリーごとに収まる
function PopoverFrame({
  height = 'h-[26rem]',
  children,
}: {
  height?: string;
  children: (container: HTMLElement) => ReactNode;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className={`relative w-72 max-w-full ${height}`}>
      {container && children(container)}
    </div>
  );
}

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/TreeSelect',
  component: TreeSelect<string, boolean>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '入れ子になった選択肢を、木をたどって選ぶ欄です。欄の形は Select と同じで、押すと木の面が開きます。',
          '',
          '- 木は `items` に `{ value, label }` で渡し、入れ子の行は `children` に入れます。選べない行には `disabled` を付けます（親に付けると中もすべて選べません）。',
          '- 1 つ選ぶ形では、行を押すと選んで閉じます。欄には親からのパス（「デザイン / 原則」）を出します。親と区切りは一段淡く出し、本文と同じ色にするときは `pathVariant="default"` です。名前だけにするときは `valueDisplay="last"` です。親と子のあいだの区切りは `separator`（既定は「/」。アイコンも渡せ、`null` で区切りません）です。',
          '- 1 つ選ぶ形では、親の行（子を持つ行）は押すと開け閉めだけをし、葉を選びます。親そのものも選ばせるときは `parentSelect="self"` にします。このときは行を押すと選び、開け閉めは左の印か →・← で行います。印の押せる範囲は行の高さいっぱいの正方形で、載せると塗りで範囲が分かります。`parentSelect="row"` では、親の行は開け閉めだけにし、開いた子の先頭に置く「〇〇 のすべて」の行（`parentRowLabel`）で親を選びます。',
          '- `multiple` を付けると、行の頭にチェックボックスが出ます。親を選ぶと中もすべて選び、一部だけ選んでいるときは横線の印になります。押しても面は閉じません。欄には選んだ行をチップで並べ、チップは既定で名前だけです（`valueDisplay="path"` でパスにできます）。',
          '- 欄の中身をすべて差し替えるときは、Select と同じ `renderValue` に、値から中身を作る関数を渡します。',
          '- 複数選ぶ形の値は、葉（子のない行）だけを並べます。親の値を渡したときは、その中をすべて選んだものとして読みます。`parentSelect="self"` では、親の箱は中と連動せず、親自身の値だけが入ります（Gmail のラベルのような使い方）。',
          '- 面の中は ↑↓ で行を移り、→ で開いて中へ、← で閉じて親へ移ります。Enter・Space で選びます。文字を打つと、その文字で始まる行へ移ります。',
          '- 開いたときは、選んだ行の祖先を開いて、選んだ行にフォーカスを置きます。はじめに開く行は `defaultExpanded` でも決められます。',
          '- 出し方は `presentation` で決めます。既定の `auto` は、指で操作していて画面が狭いときだけ、画面の下から出るシートにします。',
          '- `name` を渡すと、フォームには値を文字で送ります。`multiple` では同じ名前で複数送ります。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '置き場所',
    items: docTree,
    multiple: false,
    color: 'neutral',
    pathVariant: 'muted',
    parentSelect: 'none',
    clearable: false,
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    errorText: { control: 'text' },
    placeholder: { control: 'text' },
    multiple: { control: 'boolean' },
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    valueDisplay: {
      control: 'inline-radio',
      options: ['path', 'last'],
      table: { defaultValue: { summary: "multiple ? 'last' : 'path'" } },
    },
    pathVariant: { control: 'inline-radio', options: ['muted', 'default'] },
    separator: { control: 'text' },
    parentSelect: { control: 'inline-radio', options: ['none', 'self', 'row'] },
    presentation: { control: 'inline-radio', options: ['auto', 'popover', 'sheet'] },
    items: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    expanded: { control: false },
    defaultExpanded: { control: false },
    defaultOpen: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof TreeSelect<string, boolean>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  args: { caption: '記事を置く場所を選びます' },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態（1 つ選ぶ）',
  parameters: {
    controls: { include: ['color', 'valueDisplay', 'pathVariant', 'parentSelect'] },
    docs: {
      description: {
        story:
          '選んだ行は、選択肢と同じ淡い面・太字・チェックで示します。行の形と字下げ、案内線は Tree と同じです。',
      },
      source: sourceCode(`
        <TreeSelect label="置き場所" items={items} defaultValue="principles" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <TreeSelect
          {...single(args)}
          multiple={false}
          defaultValue="principles"
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

export const OpenMultiple: Story = {
  tags: ['visual'],
  name: '開いた状態（複数選ぶ）',
  parameters: {
    controls: { include: ['color', 'valueDisplay', 'parentSelect'] },
    docs: {
      description: {
        story:
          '行の頭にチェックボックスが出ます。親を選ぶと中もすべて選び、一部だけ選んでいる親は横線の印です。',
      },
      source: sourceCode(`
        <TreeSelect label="置き場所" items={items} multiple defaultValue={['principles', 'tokens', 'inputs']} />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame height="h-[30rem]">
      {(container) => (
        <TreeSelect
          {...many(args)}
          multiple
          defaultValue={['principles', 'tokens', 'select', 'combobox', 'tree-select']}
          defaultExpanded={['design', 'components', 'inputs']}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`color` は、選んだ行の面・文字・チェックと、チェックボックスの色です。指定しないときはグレーです。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-wrap gap-6">
      {colors.map((color) => (
        <div key={color} className="flex flex-col gap-6">
          <PopoverFrame height="h-[28rem]">
            {(container) => (
              <TreeSelect
                {...single(args)}
                label={color}
                color={color}
                defaultValue="principles"
                defaultExpanded={['design']}
                presentation="popover"
                defaultOpen={openOnLoad(viewMode)}
                portalContainer={container}
                positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
              />
            )}
          </PopoverFrame>
          <PopoverFrame height="h-[22rem]">
            {(container) => (
              <TreeSelect
                {...many(args)}
                label={`${color}（複数）`}
                color={color}
                multiple
                defaultValue={['principles', 'tokens']}
                defaultExpanded={['design']}
                presentation="popover"
                defaultOpen={openOnLoad(viewMode)}
                portalContainer={container}
                positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
              />
            )}
          </PopoverFrame>
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: enabledControl, focusWithin: enabledControl }),
    docs: {
      description: {
        story:
          '欄の形は Select と同じです。押せない欄・読み取り専用の欄は開きません。複数選ぶ形はチップを並べ、欄の高さが伸びます。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={stateRows}
      rowLabel={(row) => row.label}
      columns={stateColumns}
      columnWidth="16rem"
      renderCell={(row) => <TreeSelect {...args} {...row.props} />}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  args: { defaultValue: 'principles' },
  parameters: {
    docs: {
      description: {
        story:
          '高さ・文字・余白は入力方式で切り替わります。ツールバーの「密度」でも切り替えられます。',
      },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="w-72">
        <TreeSelect {...args} />
      </div>
    </DensityPair>
  ),
};

export const PickOne: Story = {
  name: '1 つ選ぶ',
  args: { onValueChange: fn(), name: 'place', defaultValue: 'principles' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '開くと選んだ行にフォーカスが移ります。↑↓・→・← で動き、Enter で選ぶと閉じて、フォーカスは欄に戻ります。',
      },
    },
  },
  decorators: [
    (Story) => (
      <form className="max-w-xs">
        <Story />
      </form>
    ),
  ],
  play: async ({ canvas, args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const button = canvas.getByRole('button', { name: /置き場所/ });
    // 区切りは読み上げでは読まない
    await expect(button).toHaveAccessibleName('置き場所 デザイン 原則');
    await userEvent.click(button);
    const tree = await body.findByRole('tree', { name: '置き場所' });
    const selected = within(tree).getByRole('treeitem', { selected: true });
    await expect(selected).toHaveTextContent('原則');
    await waitFor(() => expect(selected).toHaveFocus());
    // ← で親へ、もう一度 ← で閉じる。↓ で次の親へ移り、→ で開いて中へ
    await userEvent.keyboard('{ArrowLeft}');
    const design = within(tree).getByRole('treeitem', { name: 'デザイン' });
    await expect(design).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(design).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}');
    await expect(within(tree).getByRole('treeitem', { name: '入力' })).toHaveFocus();
    // 型あたり: 「重」で始まる行へ
    await userEvent.keyboard('重');
    await expect(within(tree).getByRole('treeitem', { name: '重なる面' })).toHaveFocus();
    // 親の行は、Enter でも開け閉めだけをする（選ばない）
    const overlays = within(tree).getByRole('treeitem', { name: '重なる面' });
    await userEvent.keyboard('{Enter}');
    await expect(overlays).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('dialog');
    await waitFor(() => expect(body.queryByRole('tree')).not.toBeInTheDocument());
    await expect(button).toHaveFocus();
    await expect(button).toHaveAccessibleName('置き場所 部品 重なる面 Dialog');
    const hidden = canvasElement.querySelector<HTMLInputElement>('input[name="place"]');
    await expect(hidden?.value).toBe('dialog');
    // 親の行を押すと開け閉めだけをする（選ばない）
    await userEvent.click(button);
    const reopened = await body.findByRole('tree');
    const guides = within(reopened).getByRole('treeitem', { name: 'ドキュメント' });
    await userEvent.click(guides);
    await expect(guides).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    // 選べない行は選ばない
    const designRow = within(reopened).getByRole('treeitem', { name: 'デザイン' });
    await userEvent.click(designRow.querySelector<HTMLElement>('[data-slot="tree-select-caret"]')!);
    await userEvent.click(await within(reopened).findByRole('treeitem', { name: '比較の軸' }));
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.click(within(reopened).getByRole('treeitem', { name: 'はじめに' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith('intro');
  },
};

export const PickParent: Story = {
  name: '親そのものを選ぶ',
  args: {
    onValueChange: fn(),
    label: '通知の宛先',
    items: orgTree,
    parentSelect: 'self',
    defaultValue: 'sales-east-1',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`parentSelect="self"` では、親の行を押すと親そのものを選びます。開け閉めは左の印か →・← で行います。印の押せる範囲は行の高さいっぱいで、載せると範囲に塗りが出ます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /通知の宛先/ }));
    const tree = await body.findByRole('tree', { name: '通知の宛先' });
    // 印を押すと開け閉めだけ
    const dev = within(tree).getByRole('treeitem', { name: '開発本部' });
    await userEvent.click(dev.querySelector<HTMLElement>('[data-slot="tree-select-caret"]')!);
    await expect(dev).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    // 行を押すと親そのもの（本部全体）を選ぶ
    await userEvent.click(dev);
    await expect(args.onValueChange).toHaveBeenLastCalledWith('dev');
    await expect(canvas.getByRole('button', { name: /通知の宛先/ })).toHaveAccessibleName(
      '通知の宛先 開発本部'
    );
  },
};

export const PickParentRow: Story = {
  name: '子の先頭の行で親を選ぶ',
  args: { onValueChange: fn(), label: '通知の宛先', items: orgTree, parentSelect: 'row' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`parentSelect="row"` では、親の行は押すと開け閉めだけをします。開いた子の先頭の「〇〇 のすべて」の行で、親そのものを選びます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /通知の宛先/ }));
    const tree = await body.findByRole('tree', { name: '通知の宛先' });
    const sales = within(tree).getByRole('treeitem', { name: '営業本部' });
    await userEvent.click(sales);
    await expect(sales).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(await within(tree).findByRole('treeitem', { name: '営業本部 のすべて' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith('sales');
    await waitFor(() => expect(body.queryByRole('tree')).not.toBeInTheDocument());
    // 開き直すと、選んだのは「のすべて」の行で、親の行は選んだ見た目にならない
    await userEvent.click(canvas.getByRole('button', { name: /通知の宛先/ }));
    const reopened = await body.findByRole('tree');
    await expect(
      within(reopened).getByRole('treeitem', { name: '営業本部 のすべて' })
    ).toHaveAttribute('aria-selected', 'true');
    await expect(within(reopened).getByRole('treeitem', { name: '営業本部' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  },
};

export const OpenParentSelect: Story = {
  tags: ['visual'],
  name: '開いた状態（親そのものを選ぶ）',
  parameters: {
    controls: { include: ['color'] },
    // 「開発本部」の印に載せた見た目（押せる範囲の塗り）を固定する
    pseudo: {
      rootSelector: 'body',
      hover: [
        '[data-caret-preview] [data-slot="tree-select-tree"] > li:nth-child(2) > [role="treeitem"] [data-slot="tree-select-caret"]',
      ],
    },
    docs: {
      description: {
        story:
          '`parentSelect="self"` の面です。「開発本部」の行は、開閉の印に載せたときの見た目（押せる範囲の塗り）で描いています。',
      },
      source: sourceCode(`
        <TreeSelect label="通知の宛先" items={departments} parentSelect="self" defaultValue="sales" />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <PopoverFrame>
      {(container) => (
        <TreeSelect
          {...single(args)}
          label="通知の宛先"
          items={orgTree}
          parentSelect="self"
          defaultValue="sales"
          defaultExpanded={['sales']}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={container}
          popupProps={{ 'data-caret-preview': '' } as never}
          positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
        />
      )}
    </PopoverFrame>
  ),
};

export const PickMany: Story = {
  name: '複数選ぶ',
  args: { onValueChange: fn(), name: 'places', multiple: true, defaultValue: ['principles'] },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '親を選ぶと中もすべて選び、一部だけ選んでいる親は中間の状態（読み上げでは「一部選択」）になります。選んでも面は閉じません。',
      },
    },
  },
  decorators: [
    (Story) => (
      <form className="max-w-xs">
        <Story />
      </form>
    ),
  ],
  play: async ({ canvas, args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /置き場所/ }));
    const tree = await body.findByRole('tree', { name: '置き場所' });
    await expect(tree).toHaveAttribute('aria-multiselectable', 'true');
    const design = within(tree).getByRole('treeitem', { name: 'デザイン' });
    await expect(design).toHaveAttribute('aria-checked', 'mixed');
    // 親を選ぶと、選べる中の行をすべて選ぶ（選べない「比較の軸」は変えない）
    await userEvent.click(design);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['principles', 'tokens', 'adr']);
    await expect(design).toHaveAttribute('aria-checked', 'mixed');
    await expect(within(tree).getByRole('treeitem', { name: 'トークン' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    // もう一度押すと外す
    await userEvent.click(design);
    await expect(args.onValueChange).toHaveBeenLastCalledWith([]);
    // Space でも切り替える。面は閉じない
    await userEvent.click(within(tree).getByRole('treeitem', { name: '変更履歴' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['changelog']);
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith([]);
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['changelog']);
    await expect(body.getByRole('tree')).toBeInTheDocument();
    const sent = Array.from(
      canvasElement.querySelectorAll<HTMLInputElement>('input[name="places"]')
    ).map((input) => input.value);
    await expect(sent).toEqual(['changelog']);
  },
};

export const PickManySelf: Story = {
  name: '親そのものを複数選ぶ',
  args: {
    onValueChange: fn(),
    label: '記事のカテゴリ',
    items: labelTree,
    multiple: true,
    parentSelect: 'self',
    defaultValue: [],
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`multiple` と `parentSelect="self"` では、親の箱は中と連動しません。親を押すと親自身の値だけが入り、中の行は変わりません。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /記事のカテゴリ/ }));
    const tree = await body.findByRole('tree', { name: '記事のカテゴリ' });
    const dev = within(tree).getByRole('treeitem', { name: '開発' });
    await userEvent.click(dev);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['dev']);
    await expect(dev).toHaveAttribute('aria-checked', 'true');
    // 中は連動しない
    await userEvent.click(dev.querySelector<HTMLElement>('[data-slot="tree-select-caret"]')!);
    const frontend = await within(tree).findByRole('treeitem', { name: 'フロントエンド' });
    await expect(frontend).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(frontend);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['dev', 'frontend']);
    await expect(dev).toHaveAttribute('aria-checked', 'true');
  },
};

export const LockedStaysClosed: Story = {
  name: '開かない欄',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex max-w-xs flex-col gap-4">
      <TreeSelect {...args} label="押せない" disabled defaultOpen />
      <TreeSelect {...args} label="読み取り専用" readOnly defaultOpen defaultValue="principles" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.queryByRole('tree')).not.toBeInTheDocument();
  },
};
