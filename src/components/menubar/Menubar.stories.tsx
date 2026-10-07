import type { Meta, StoryObj } from '@storybook/react-vite';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Menubar, MenubarMenu, type MenubarMenuProps } from './Menubar';
import { DensityPair, Matrix, ScreenFrame } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
} from '../menu/MenuItem';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

type MenuOptions = Partial<Omit<MenubarMenuProps, 'label' | 'children'>>;

/** ファイル・編集・表示・ヘルプの 4 つのメニュー。open で開いておくメニューを選ぶ */
function AppMenus({
  open,
  container,
  presentation = 'popover',
}: {
  open?: 'file' | 'edit' | 'view';
  container?: HTMLElement;
  presentation?: MenuOptions['presentation'];
}) {
  const common: MenuOptions = { presentation, portalContainer: container };
  return (
    <>
      <MenubarMenu label="ファイル" defaultOpen={open === 'file'} {...common}>
        <MenuItem shortcut="Ctrl+N">新規</MenuItem>
        <MenuItem shortcut="Ctrl+O">開く…</MenuItem>
        <MenuSubmenu
          items={
            <>
              <MenuItem>議事録.md</MenuItem>
              <MenuItem>見積もり.xlsx</MenuItem>
            </>
          }
        >
          最近使ったファイル
        </MenuSubmenu>
        <MenuSeparator />
        <MenuItem shortcut="Ctrl+S">保存</MenuItem>
        <MenuItem disabled description="変更がありません">
          元に戻す
        </MenuItem>
      </MenubarMenu>
      <MenubarMenu label="編集" defaultOpen={open === 'edit'} {...common}>
        <MenuItem shortcut="Ctrl+Z">取り消す</MenuItem>
        <MenuItem shortcut="Ctrl+Shift+Z">やり直す</MenuItem>
        <MenuSeparator />
        <MenuItem shortcut="Ctrl+X">切り取り</MenuItem>
        <MenuItem shortcut="Ctrl+C">コピー</MenuItem>
        <MenuItem shortcut="Ctrl+V">貼り付け</MenuItem>
        <MenuSeparator />
        <MenuItem status="danger">すべて削除</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="表示" defaultOpen={open === 'view'} {...common}>
        <MenuGroup label="表示するもの">
          <MenuCheckboxItem defaultChecked>ツールバー</MenuCheckboxItem>
          <MenuCheckboxItem>ステータスバー</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup label="並べ方">
          <MenuRadioGroup defaultValue="list">
            <MenuRadioItem value="list">一覧</MenuRadioItem>
            <MenuRadioItem value="grid">格子</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenubarMenu>
      <MenubarMenu label="ヘルプ" disabled {...common}>
        <MenuItem>使い方</MenuItem>
      </MenubarMenu>
    </>
  );
}

const meta = {
  title: 'Components/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'アプリの上に並ぶ、メニューの帯です（ファイル・編集・表示…）。1 つ開いているあいだは、隣のトリガーに載せるか左右の矢印キーで、隣のメニューへ移ります。',
          '',
          '- `Menubar` の中に `MenubarMenu` を並べます。`label` がトリガーの文字になります。',
          '- メニューの中身は `Menu` と同じ部品（`MenuItem`・`MenuCheckboxItem`・`MenuRadioGroup`・`MenuGroup`・`MenuSeparator`・`MenuSubmenu`）を使います。`MenubarMenu` は `Menu` と同じ見た目の props（`color`・`markPlacement`・`radioMark`・`groupLabelStyle` など）を取ります。',
          '- 帯の中はキーボードの矢印キーで動きます。Tab では帯に 1 回だけ止まります。',
          '- 指で操作していて画面が狭いときは、`Menu` と同じく画面の下から出るシートで開きます。シートの見出しには `label` を出します（変えるときは `title`）。',
          '- 縦に積むときは `orientation="vertical"` にします。メニューは右に開きます。',
          '- 1 つのメニューを押せなくするときは `MenubarMenu` の `disabled`、帯ごと押せなくするときは `Menubar` の `disabled` です。',
          '- 読み上げの名前は `accessibleName` で付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    accessibleName: 'アプリのメニュー',
    orientation: 'horizontal',
    disabled: false,
    modal: true,
    loopFocus: true,
  },
  argTypes: {
    accessibleName: { control: 'text' },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: "'horizontal'" } },
    },
  },
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <Menubar {...args}>
      <AppMenus />
    </Menubar>
  ),
  parameters: {
    docs: {
      source: sourceCode(`
        <Menubar accessibleName="アプリのメニュー">
          <MenubarMenu label="ファイル">
            <MenuItem shortcut="Ctrl+N">新規</MenuItem>
            <MenuItem shortcut="Ctrl+S">保存</MenuItem>
          </MenubarMenu>
          <MenubarMenu label="編集">
            <MenuItem shortcut="Ctrl+Z">取り消す</MenuItem>
          </MenubarMenu>
        </Menubar>
      `),
    },
  },
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: '開いているトリガーには、押したときと同じ濃さの塗りを敷きます。' },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[420px]">
      {(frame) => (
        <Menubar {...args}>
          <AppMenus open={openOnLoad(viewMode) ? 'edit' : undefined} container={frame} />
        </Menubar>
      )}
    </ScreenFrame>
  ),
};

export const Vertical: Story = {
  tags: ['visual'],
  name: '縦の帯',
  args: { orientation: 'vertical' },
  parameters: {
    controls: { disable: true },
    docs: { description: { story: '縦に積んだ帯です。メニューは右に開きます。' } },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[360px]">
      {(frame) => (
        <Menubar {...args} className="w-40">
          <AppMenus open={openOnLoad(viewMode) ? 'view' : undefined} container={frame} />
        </Menubar>
      )}
    </ScreenFrame>
  ),
};

// トリガーの状態。開いている見た目は、開いたときに付く data-popup-open を足して固定する
const triggerColumns: (MatrixColumn & { open?: boolean; disabled?: boolean })[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
  { label: '開いている', open: true },
  { label: '押せない', disabled: true },
];

export const TriggerStates: Story = {
  tags: ['visual'],
  name: 'トリガーの状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="menubar-trigger"]',
      active: '[data-slot="menubar-trigger"]',
      focusVisible: '[data-slot="menubar-trigger"]',
    }),
  },
  render: (args) => (
    <Matrix
      rows={['trigger']}
      columns={triggerColumns}
      rowLabel={() => 'トリガー'}
      columnWidth="7rem"
      renderCell={(_row, column) => (
        <Menubar {...args}>
          <MenubarMenu
            label="編集"
            disabled={column.disabled}
            triggerProps={column.open ? { 'data-popup-open': '' } : undefined}
          >
            <MenuItem>取り消す</MenuItem>
          </MenubarMenu>
        </Menubar>
      )}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <DensityPair>
      <Menubar {...args}>
        <AppMenus />
      </Menubar>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Menubar {...args}>
      <AppMenus />
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const bar = canvas.getByRole('menubar', { name: 'アプリのメニュー' });
    await expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    const file = within(bar).getByRole('menuitem', { name: 'ファイル' });
    const edit = within(bar).getByRole('menuitem', { name: '編集' });
    const help = within(bar).getByRole('menuitem', { name: 'ヘルプ' });
    await expect(file).toHaveAttribute('aria-haspopup', 'menu');
    await expect(help).toHaveAttribute('aria-disabled', 'true');

    // 帯の中は左右の矢印キーで動く
    file.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(edit).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(file).toHaveFocus());

    // Enter で開き、最初の項目に移る
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(file).toHaveAttribute('aria-expanded', 'true'));
    const fileMenu = await body.findByRole('menu', { name: 'ファイル' });
    await waitFor(() =>
      expect(within(fileMenu).getByRole('menuitem', { name: '新規' })).toHaveFocus()
    );

    // 開いたまま右の矢印キーで、隣のメニューへ移る
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(edit).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(file).toHaveAttribute('aria-expanded', 'false'));
    const editMenu = await body.findByRole('menu', { name: '編集' });
    await waitFor(() => expect(editMenu).toBeVisible());

    // 1 つ開いているあいだは、隣のトリガーに載せるだけで移る
    await userEvent.hover(canvas.getByRole('menuitem', { name: '表示' }));
    await waitFor(() =>
      expect(canvas.getByRole('menuitem', { name: '表示' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    );

    // Esc で閉じ、フォーカスは帯のトリガーに戻る
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    await waitFor(() =>
      expect(canvasElement.ownerDocument.activeElement?.getAttribute('data-slot')).toBe(
        'menubar-trigger'
      )
    );
  },
};
