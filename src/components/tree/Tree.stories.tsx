import { FileTextIcon, FolderIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Tree, TreeItem } from './Tree';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { type PreviewState, statePseudo } from '../../stories/story-states';
import { Icon } from '../icon/Icon';

const docs = (
  <>
    <TreeItem label="はじめに" href="#intro" />
    <TreeItem label="部品" defaultExpanded>
      <TreeItem label="Button" href="#button" />
      <TreeItem label="TextField" href="#text-field" current />
      <TreeItem label="入力" defaultExpanded>
        <TreeItem label="Checkbox" href="#checkbox" />
        <TreeItem label="Radio" href="#radio" />
      </TreeItem>
    </TreeItem>
    <TreeItem label="デザイン原則" href="#principles" />
    <TreeItem label="準備中" href="#soon" disabled />
  </>
);

const meta = {
  title: 'Components/Tree',
  component: Tree,
  subcomponents: { TreeItem },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '入れ子の行き先を木の形で並べます。ドキュメントの目次や、ファイルの一覧に使います。',
          '',
          '- `Tree` に読み上げの名前（`accessibleName`）を渡し、中に `TreeItem` を並べます。`TreeItem` の中に `TreeItem` を入れると、開け閉めできる行になります。',
          '- 行き先は `href`（または `render` で Next.js の `Link` など）で渡します。いまいるページの行には `current` を付けます。',
          '- 外のサイトへの行き先は `target="_blank"` を付けます。右上向きの矢印（↗）が付き、読み上げに「新しいタブで開きます」が入り、`rel="noopener noreferrer"` も付きます（Link と同じ扱いです）。',
          '- 行の頭のアイコンは `icon` で渡します。渡さないときは置きません。',
          '- Tab で入るのは 1 行だけです。↑ ↓ で行を移り、→ で開いて中へ、← で閉じて親へ、Home・End で端へ移ります。子を持つ行は Space で開け閉めします。',
          '- 文字を打つと、その文字で始まる行へ移ります。続けて打った文字は 1 語として扱い、少し間が空くと打ち直しになります。開いていない枝の中の行には移りません。',
          '- 開いている行を自分で持つときは `expanded`・`onExpandedChange` を使います。はじめから開けておくときは `defaultExpanded` です。',
          '- 字下げの案内線は `hideGuides` で消せます。いまいる行の色は `color` で選びます。',
          '- 行の塗り（hover・いまいる行）は、既定では字下げの分だけ左を空けます。木の幅いっぱいに塗るときは `rowWidth="full"` にします。',
          '- いまいる行の印は `currentIndicator` です。`fill`（既定）は淡い面と太字、`text` は太字だけです。',
          '- 開け閉めは中身の高さが動きます（`panelMotion="none"` ですぐ切り替わります）。',
          '- 行の文字は選べません（開け閉めのために続けて押したとき、文字が選ばれないようにするため）。選べるようにするときは `selectable` を付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    accessibleName: 'ドキュメント',
    color: 'neutral',
    hideGuides: false,
    rowWidth: 'indent',
    currentIndicator: 'fill',
    panelMotion: 'collapse',
    selectable: false,
  },
  argTypes: {
    color: { control: 'inline-radio', options: ['primary', 'secondary', 'neutral'] },
    hideGuides: { control: 'boolean' },
    rowWidth: { control: 'inline-radio', options: ['indent', 'full'] },
    currentIndicator: { control: 'inline-radio', options: ['fill', 'text'] },
    panelMotion: { control: 'inline-radio', options: ['collapse', 'none'] },
    selectable: { control: 'boolean' },
    children: { control: false },
  },
  render: (args) => (
    <div className="w-64">
      <Tree {...args}>{docs}</Tree>
    </div>
  ),
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

const stateColumns: { label: string; state?: PreviewState }[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

export const States: Story = {
  tags: ['visual'],
  name: '行の状態',
  parameters: {
    controls: { disable: true },
    // 入れ子の行に当てる（案内線と、行の塗り・フォーカスの線の重なりが分かる）
    pseudo: statePseudo({
      hover: '[data-slot="tree-item"][href="#checkbox"]',
      active: '[data-slot="tree-item"][href="#checkbox"]',
      focusVisible: '[data-slot="tree-item"][href="#checkbox"]',
    }),
  },
  render: (args) => (
    <Gallery columnWidth="16rem">
      {stateColumns.map((column) => (
        <Specimen key={column.label} label={column.label}>
          <div data-preview={column.state} className="w-56">
            <Tree {...args}>{docs}</Tree>
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Colors: Story = {
  tags: ['visual'],
  name: 'いまいる行の色と案内線',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Gallery columnWidth="16rem">
      {(['neutral', 'primary', 'secondary'] as const).map((color) => (
        <Specimen key={color} label={color}>
          <div className="w-56">
            <Tree {...args} color={color}>
              {docs}
            </Tree>
          </div>
        </Specimen>
      ))}
      <Specimen label="案内線なし（hideGuides）">
        <div className="w-56">
          <Tree {...args} hideGuides>
            {docs}
          </Tree>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const WithIcons: Story = {
  tags: ['visual'],
  name: 'アイコンつき（ファイルの一覧）',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="w-64">
      <Tree {...args} accessibleName="ファイル">
        <TreeItem label="src" icon={<Icon icon={FolderIcon} size="control" />} defaultExpanded>
          <TreeItem label="index.ts" icon={<Icon icon={FileTextIcon} size="control" />} href="#a" />
          <TreeItem
            label="components"
            icon={<Icon icon={FolderIcon} size="control" />}
            defaultExpanded
          >
            <TreeItem
              label="Button.tsx"
              icon={<Icon icon={FileTextIcon} size="control" />}
              href="#b"
              current
            />
          </TreeItem>
        </TreeItem>
        <TreeItem label="README.md" icon={<Icon icon={FileTextIcon} size="control" />} href="#c" />
      </Tree>
    </div>
  ),
};

export const RowLook: Story = {
  tags: ['visual'],
  name: '行の塗りの範囲と、いまいる行の印',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: '[data-slot="tree-item"][href="#button"]' }),
  },
  render: (args) => (
    <Gallery columnWidth="16rem">
      <Specimen label='rowWidth="indent"（既定）'>
        <div data-preview="hover" className="w-56">
          <Tree {...args}>{docs}</Tree>
        </div>
      </Specimen>
      <Specimen label='rowWidth="full"'>
        <div data-preview="hover" className="w-56">
          <Tree {...args} rowWidth="full">
            {docs}
          </Tree>
        </div>
      </Specimen>
      <Specimen label='currentIndicator="fill"（既定）'>
        <div className="w-56">
          <Tree {...args}>{docs}</Tree>
        </div>
      </Specimen>
      <Specimen label='currentIndicator="text"'>
        <div className="w-56">
          <Tree {...args} currentIndicator="text">
            {docs}
          </Tree>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <DensityPair>
      <div className="w-56">
        <Tree {...args}>{docs}</Tree>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const tree = canvas.getByRole('tree', { name: 'ドキュメント' });
    await expect(tree).toBeVisible();
    const items = canvas.getAllByRole('treeitem');
    // 子を持つ行には aria-expanded が付く
    await expect(canvas.getByRole('treeitem', { name: '部品' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    // いまいるページの行
    await expect(canvas.getByRole('treeitem', { name: 'TextField' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    // Tab で止まるのは 1 行だけ。↓ で次の行へ移る
    const first = items[0];
    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(async () => {
      await expect(canvas.getByRole('treeitem', { name: '部品' })).toHaveFocus();
    });
    // ← で閉じる
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(async () => {
      await expect(canvas.getByRole('treeitem', { name: '部品' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });
    // → で開く
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(async () => {
      await expect(canvas.getByRole('treeitem', { name: '部品' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });
  },
};

// 型あたりの見本。頭文字の同じ行（Badge・Button）と、閉じたままの枝（docs）を並べる
const files = (
  <>
    <TreeItem label="README.md" href="#readme" />
    <TreeItem label="src" defaultExpanded>
      <TreeItem label="Badge.tsx" href="#badge" />
      <TreeItem label="Button.tsx" href="#button" />
      <TreeItem label="Tree.tsx" href="#tree" />
    </TreeItem>
    <TreeItem label="docs">
      <TreeItem label="Button.md" href="#button-md" />
    </TreeItem>
  </>
);

export const Typeahead: Story = {
  name: '型あたり',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: [
          '文字を打つと、その文字で始まる行へ移ります。続けて打った文字は 1 語として扱うので、「bu」と打つと Badge ではなく Button へ移ります。',
          '少し間が空くと打ち直しになり、次に打った文字から探し直します。開いていない枝の中の行（docs の中）には移りません。',
        ].join('\n\n'),
      },
    },
  },
  render: (args) => (
    <div className="w-64">
      <Tree {...args} accessibleName="ファイル">
        {files}
      </Tree>
    </div>
  ),
  play: async ({ canvas }) => {
    const rows = canvas.getAllByRole('treeitem');
    rows[0]?.focus();
    // 続けて打った文字は 1 語。「bu」は Badge.tsx ではなく Button.tsx に当たる
    await userEvent.keyboard('bu');
    await waitFor(async () => {
      await expect(canvas.getByRole('treeitem', { name: 'Button.tsx' })).toHaveFocus();
    });
    // 間が空いたら打ち直し
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await userEvent.keyboard('d');
    await waitFor(async () => {
      await expect(canvas.getByRole('treeitem', { name: 'docs' })).toHaveFocus();
    });
    // 閉じている枝の中（docs の Button.md）は相手にしない。回り込んで src の Button.tsx へ移る
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await userEvent.keyboard('bu');
    await waitFor(async () => {
      await expect(canvas.getByRole('treeitem', { name: 'Button.tsx' })).toHaveFocus();
    });
  },
};
