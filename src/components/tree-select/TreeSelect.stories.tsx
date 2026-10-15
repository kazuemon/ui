import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TreeSelect, type TreeSelectProps } from './TreeSelect';
import { docTree, folderTree, labelTree, notifyTree, orgTree } from './tree-select-samples';
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
          '- 選べる行は、頭に印が付きます。1 つ選ぶ形は丸、複数選ぶ形（`multiple`）はチェックボックスです。子を持つ行は、右端の山形の正方形を押すと開け閉めし、それより左を押すと選びます。',
          '- 1 つ選ぶ形では、行を押すと選んで閉じます。選んだ行は淡い面と太字で示します。面を敷かず丸と太字だけにするときは `selectedIndicator="text"` です。',
          '- 親の行（子を持つ行）の選び方は `parentSelect` で決めます。',
          '  - `none`（既定）: 親は選べないまとまりです。印も左の余白もなく、行のどこを押しても開け閉めします。',
          '  - `label`: 親もほかの行と同じ 1 つの項目です。親を選んでも中の行は変わりません（フォルダ、記事のカテゴリなど）。',
          '  - `scope`（複数選ぶ形）: 親が中を覆います。親を選ぶと値は親 1 つになり、中の行は「含まれる」見た目（塗らない箱に淡いチェック）になります。あとから増えた中の行も含めたいとき（部署の宛先、クーポンの対象商品など）に使います。含まれる行を押すと、親を外して残りを個別に選びます。中を全部選んでも親にはまとめません。1 つ選ぶ形では `label` と同じです。',
          '- 親の印は、親そのものを選んでいるかだけを表します。中に選んだ行がある親には、名前の右に点が付きます（読み上げでは「配下に選択あり」と補います）。',
          '- 複数選ぶ形では、押しても面は閉じません。値は選んだ行の並びです。欄には選んだ行をチップで並べ、チップは既定で名前だけです（`valueDisplay="path"` でパスにできます）。',
          '- 欄の中身をすべて差し替えるときは、Select と同じ `renderValue` に、値から中身を作る関数を渡します。',
          '- 面の中は ↑↓ で行を移り、→ で開いて中へ、← で閉じて親へ移ります。Home・End で端へ移ります。Enter・Space で選びます（選べない親では開け閉め）。文字を打つと、その文字で始まる行へ移ります。',
          '- 開いたときは、選んだ行の祖先を開いて、選んだ行にフォーカスを置きます。はじめに開く行は `defaultExpanded` でも決められます。',
          '- 面は欄の上か下に出し、どちらにも収まらないときは面の中でスクロールします。出し方は `presentation` で決めます。既定の `auto` は、指で操作していて画面が狭いときだけ、画面の下から出るシートにします。',
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
    selectedIndicator: 'fill',
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
      table: { defaultValue: { summary: "'path'（multiple では 'last'）" } },
    },
    pathVariant: { control: 'inline-radio', options: ['muted', 'default'] },
    separator: { control: 'text' },
    parentSelect: { control: 'inline-radio', options: ['none', 'label', 'scope'] },
    selectedIndicator: { control: 'inline-radio', options: ['fill', 'text'] },
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
    controls: {
      include: ['color', 'valueDisplay', 'pathVariant', 'parentSelect', 'selectedIndicator'],
    },
    docs: {
      description: {
        story:
          '選べる行の頭に丸が付き、選んだ行は淡い面と太字で示します。親の行は選べないまとまりで、中に選んだ行があると名前の右に点が付きます。行の形と字下げ、案内線は Tree と同じです。',
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
          '選べる行の頭にチェックボックスが出ます。既定の `parentSelect="none"` では親は選べないまとまりで、中に選んだ行がある親は名前の右に点が付きます。',
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
          '`color` は、選んだ行の面・文字・丸と、チェックボックス、中に選択がある点の色です。指定しないときはグレーです。',
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

export const OpenParentSelect: Story = {
  tags: ['visual'],
  name: '開いた状態（親の選び方）',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '左は `parentSelect="label"`（1 つ選ぶ形。親の「プロジェクト」を選んでいる）、中は `selectedIndicator="text"` で面を敷かない形、右は `parentSelect="scope"`（複数選ぶ形。「営業本部」を選び、中の行は「含まれる」見た目）です。',
      },
      source: sourceCode(`
        <TreeSelect label="保存先" items={folders} parentSelect="label" defaultValue="projects" />
        <TreeSelect label="保存先" items={folders} parentSelect="label" selectedIndicator="text" defaultValue="projects" />
        <TreeSelect label="お知らせの宛先" items={departments} multiple parentSelect="scope" defaultValue={['sales']} />
      `),
    },
  },
  render: (args, { viewMode }) => (
    <div className="flex flex-wrap gap-6">
      {(['fill', 'text'] as const).map((indicator) => (
        <PopoverFrame key={indicator}>
          {(container) => (
            <TreeSelect
              {...single(args)}
              label={indicator === 'fill' ? '保存先' : '保存先（面なし）'}
              items={folderTree}
              multiple={false}
              parentSelect="label"
              selectedIndicator={indicator}
              defaultValue="projects"
              defaultExpanded={['docs']}
              presentation="popover"
              defaultOpen={openOnLoad(viewMode)}
              portalContainer={container}
              positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
            />
          )}
        </PopoverFrame>
      ))}
      <PopoverFrame>
        {(container) => (
          <TreeSelect
            {...many(args)}
            label="お知らせの宛先"
            items={orgTree}
            multiple
            parentSelect="scope"
            defaultValue={['sales']}
            defaultExpanded={['sales', 'sales-east']}
            presentation="popover"
            defaultOpen={openOnLoad(viewMode)}
            portalContainer={container}
            positionerProps={{ collisionAvoidance: { side: 'none', align: 'none' } }}
          />
        )}
      </PopoverFrame>
    </div>
  ),
};

export const PickParent: Story = {
  name: '親も選ぶ',
  args: {
    onValueChange: fn(),
    label: '保存先',
    items: folderTree,
    parentSelect: 'label',
    defaultValue: 'minutes',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`parentSelect="label"` では、親の行もほかの行と同じように頭に丸が付き、押すと親そのものを選びます。開け閉めは右端の正方形か →・← で行います。',
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
    await userEvent.click(canvas.getByRole('button', { name: /保存先/ }));
    const tree = await body.findByRole('tree', { name: '保存先' });
    // 中に選んだ行がある親には点が付き、読み上げでは補足の説明になる
    const docs = within(tree).getByRole('treeitem', { name: 'ドキュメント' });
    await expect(docs).toHaveAttribute('aria-description', '配下に選択あり');
    await expect(docs.querySelector('[data-slot="tree-select-dot"]')).not.toBeNull();
    // 右端の正方形は開け閉めだけ
    const photos = within(tree).getByRole('treeitem', { name: '写真' });
    await userEvent.click(photos.querySelector<HTMLElement>('[data-slot="tree-select-caret"]')!);
    await expect(photos).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    // 行を押すと親そのものを選んで閉じる
    await userEvent.click(photos);
    await expect(args.onValueChange).toHaveBeenLastCalledWith('photos');
    await waitFor(() => expect(body.queryByRole('tree')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: /保存先/ })).toHaveAccessibleName(
      '保存先 写真'
    );
  },
};

export const PickMany: Story = {
  name: '複数選ぶ',
  args: {
    onValueChange: fn(),
    name: 'notices',
    label: '受け取る通知',
    items: notifyTree,
    multiple: true,
    defaultValue: ['release'],
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '既定の `parentSelect="none"` では、親の行は選べないまとまりで、押すと開け閉めします。選んでも面は閉じません。',
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
    await userEvent.click(canvas.getByRole('button', { name: /受け取る通知/ }));
    const tree = await body.findByRole('tree', { name: '受け取る通知' });
    await expect(tree).toHaveAttribute('aria-multiselectable', 'true');
    // 親は印を持たず、押すと開け閉めだけ
    const account = within(tree).getByRole('treeitem', { name: 'アカウント' });
    await expect(account).not.toHaveAttribute('aria-checked');
    await expect(account.querySelector('[data-slot="tree-select-box"]')).toBeNull();
    await userEvent.click(account);
    await expect(account).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    // 子を押すと入れ替える。Space でも切り替える。面は閉じない
    await userEvent.click(await within(tree).findByRole('treeitem', { name: '支払い' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['release', 'billing']);
    await expect(account).toHaveAttribute('aria-description', '配下に選択あり');
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['release']);
    await userEvent.keyboard(' ');
    await expect(body.getByRole('tree')).toBeInTheDocument();
    const sent = Array.from(
      canvasElement.querySelectorAll<HTMLInputElement>('input[name="notices"]')
    ).map((input) => input.value);
    await expect(sent).toEqual(['release', 'billing']);
  },
};

export const PickManyLabel: Story = {
  name: '親も複数選ぶ',
  args: {
    onValueChange: fn(),
    label: '記事のカテゴリ',
    items: labelTree,
    multiple: true,
    parentSelect: 'label',
    defaultValue: [],
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`multiple` と `parentSelect="label"` では、親も独立した項目です。親を選んでも中の行は変わらず、中を選んでも親は変わりません。',
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
    await userEvent.click(dev);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['frontend']);
    await expect(frontend).toHaveAttribute('aria-checked', 'true');
  },
};

export const PickScope: Story = {
  name: '親で中を覆う',
  args: {
    onValueChange: fn(),
    label: 'お知らせの宛先',
    items: orgTree,
    multiple: true,
    parentSelect: 'scope',
    defaultValue: ['sales'],
    defaultExpanded: ['sales', 'sales-east'],
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`parentSelect="scope"` では、親を選ぶと値は親 1 つになり、中の行は「含まれる」見た目になります（あとから増えた課も宛先に入ります）。含まれる行を押すと、親を外して残りを個別に選びます。中を全部選んでも親にはまとめず、親の箱を押すと親 1 つに戻ります。',
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
    await userEvent.click(canvas.getByRole('button', { name: /お知らせの宛先/ }));
    const tree = await body.findByRole('tree', { name: 'お知らせの宛先' });
    const row = async (name: string) => (await within(tree).findAllByRole('treeitem', { name }))[0];
    const dotOf = (element: HTMLElement) =>
      element.querySelector(':scope > [data-slot="tree-select-dot"]');

    const sales = await row('営業本部');
    await expect(sales).toHaveAttribute('aria-checked', 'true');
    // 中の行は「含まれる」（読み上げでは選んだ範囲に入っている）
    const first = await row('第一課');
    await expect(first).toHaveAttribute('data-included', '');
    await expect(first).toHaveAttribute('aria-checked', 'true');
    // 入っている親を押すと、親も中も外れる。もう一度押すと親 1 つ
    await userEvent.click(sales);
    await expect(args.onValueChange).toHaveBeenLastCalledWith([]);
    await userEvent.click(sales);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['sales']);
    // 含まれる行を押すと、個別の選択に切り替わる（押した行は外れ、道筋の兄弟が入る）。親の箱は空（− にしない）
    await userEvent.click(await row('第一課'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['sales-east-2', 'sales-west']);
    await expect(sales).toHaveAttribute('aria-checked', 'false');
    // 中を全部選んでも、親にはまとめない
    await userEvent.click(await row('第一課'));
    await expect(args.onValueChange).toHaveBeenLastCalledWith([
      'sales-east-1',
      'sales-east-2',
      'sales-west',
    ]);
    const east = await row('東日本営業部');
    await expect(east).toHaveAttribute('aria-checked', 'false');
    // 中に選んだ行がある親には、開いていても閉じていても点が付く
    await waitFor(() => expect(dotOf(east)).not.toBeNull());
    await expect(east).toHaveAttribute('aria-description', '配下に選択あり');
    await userEvent.click(east.querySelector<HTMLElement>('[data-slot="tree-select-caret"]')!);
    await waitFor(() => expect(dotOf(east)).not.toBeNull());
    // 空の親の箱を押すと、親を選ぶ（個別の行は親にまとまる）
    await userEvent.click(sales);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['sales']);
    await expect(canvas.getByRole('button', { name: /お知らせの宛先/ })).toHaveAccessibleName(
      'お知らせの宛先 営業本部'
    );
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

// 開いたときに決めた上下の向きは、枝を開いて面が伸びても閉じるまで変えない（伸びた分は面の中でスクロールする）
export const KeepsSide: Story = {
  name: '枝を開いても面の向きを変えない',
  tags: ['!autodocs'],
  args: { label: '置き場所' },
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="fixed inset-x-4 bottom-[240px] max-w-xs">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /置き場所/ });
    await userEvent.click(trigger);
    const tree = await body.findByRole('tree', { name: '置き場所' });
    const dialog = tree.closest<HTMLElement>('[role="dialog"]')!;
    const positioner = dialog.parentElement!;
    const side = () => positioner.getAttribute('data-side');
    await waitFor(() => expect(positioner.style.opacity).not.toBe('0'));
    // 開く動きが終わってから測る
    await waitFor(() => expect(dialog).not.toHaveAttribute('data-starting-style'));
    await waitFor(() => expect(dialog.getAnimations()).toHaveLength(0));
    // 閉じた木は下に収まるので、下に開く
    await expect(side()).toBe('bottom');
    // 枝を開いて、下の空きより長くなっても、向きは下のまま（面は欄の下から離れない）
    await userEvent.click(within(tree).getByRole('treeitem', { name: '部品' }));
    await userEvent.click(await within(tree).findByRole('treeitem', { name: '入力' }));
    await within(tree).findByRole('treeitem', { name: 'TreeSelect' });
    await userEvent.click(within(tree).getByRole('treeitem', { name: '重なる面' }));
    await within(tree).findByRole('treeitem', { name: 'Drawer' });
    await expect(side()).toBe('bottom');
    await expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      trigger.getBoundingClientRect().bottom
    );
    await expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientHeight
    );
  },
};
