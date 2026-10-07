import {
  ArchiveIcon,
  CopyIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, type ReactNode, useRef, useState } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ContextMenu } from './ContextMenu';
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
} from '../menu/MenuItem';
import { PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '範囲を右クリック（指では長押し）すると、ポインタの位置に開く、操作の一覧です。項目を押すと実行して閉じます。外を押すか Esc でも閉じます。',
          '',
          '- 右クリック・長押しを受ける範囲は `trigger` に要素（`div` など）で渡します。範囲の大きさと見た目は使う側で決めます。',
          '- 項目は Menu と同じです。`MenuItem`・`MenuLinkItem`・`MenuCheckboxItem`・`MenuRadioGroup`・`MenuGroup`・`MenuSeparator`・`MenuSubmenu` をそのまま置けます。印の色・場所・見出しの文字などの props も Menu と同じ名前です。',
          '- 右クリックを知らない人にも届くよう、同じ操作を画面のどこか（項目の `⋯` ボタンなど。`Menu` で作れます）にも置きます。',
          '- 指で操作していて画面が狭いときは、画面の下から出るシートになります（`presentation` で決めます）。シートでは `title` を見出しに出します。',
          '- 開かないようにするときは `disabled` にします。範囲を右クリックすると、ブラウザの一覧が出ます。',
          '- 開いているあいだ、範囲に淡い面を敷くときは `highlightArea` にします。',
          '- 一覧の角を、ポインタから少しずらすときは `offsetX`・`offsetY`（px）で渡します。',
          '- ポインタの位置ではなく、ある要素に出したいときは `positionerProps` の `anchor` に渡します。',
        ].join('\n'),
      },
    },
  },
  args: {
    trigger: <div />,
    presentation: 'auto',
    color: 'neutral',
    markPlacement: 'start',
    radioMark: 'radio',
    alignMarks: true,
    groupLabelStyle: 'label',
    submenuSheet: 'fixed',
    closeOnSwipe: false,
    popoverScrollbar: 'scroll',
    highlightArea: false,
    offsetX: 0,
    offsetY: 0,
    title: '操作',
  },
  argTypes: {
    title: { control: 'text' },
    presentation: {
      control: 'inline-radio',
      options: ['auto', 'popover', 'sheet'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    color: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'neutral'],
      table: { defaultValue: { summary: "'neutral'" } },
    },
    markPlacement: {
      control: 'inline-radio',
      options: ['start', 'end'],
      table: { defaultValue: { summary: "'start'" } },
    },
    radioMark: {
      control: 'inline-radio',
      options: ['radio', 'dot', 'check'],
      table: { defaultValue: { summary: "'radio'" } },
    },
    alignMarks: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    groupLabelStyle: {
      control: 'inline-radio',
      options: ['label', 'caption'],
      table: { defaultValue: { summary: "'label'" } },
    },
    submenuSheet: {
      control: 'inline-radio',
      options: ['fixed', 'fit', 'cover'],
      table: { defaultValue: { summary: "'fixed'" } },
    },
    closeOnSwipe: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    popoverScrollbar: {
      control: 'inline-radio',
      options: ['scroll', 'always'],
      table: { defaultValue: { summary: "'scroll'" } },
    },
    highlightArea: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    offsetX: { control: 'number', table: { defaultValue: { summary: '0' } } },
    offsetY: { control: 'number', table: { defaultValue: { summary: '0' } } },
    trigger: { control: false },
    children: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// 範囲の見本（ファイルの行）。trigger の要素は props と ref を受けられるように、DOM の要素にする
function Area({
  children = 'レポート.pdf を右クリック',
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={`flex h-36 w-full items-center justify-center rounded-card border border-dashed border-line-strong text-fg-muted ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

const actions = (
  <>
    <MenuItem icon={<PencilSimpleIcon />} shortcut="Ctrl+E">
      名前を変える
    </MenuItem>
    <MenuItem icon={<CopyIcon />} shortcut="Ctrl+D">
      複製
    </MenuItem>
    <MenuItem icon={<ShareNetworkIcon />}>共有</MenuItem>
    <MenuSeparator />
    <MenuItem icon={<ArchiveIcon />}>アーカイブ</MenuItem>
    <MenuItem icon={<TrashIcon />} status="danger">
      削除
    </MenuItem>
  </>
);

// 開いた形を撮る・見せるため、最初に開いた一覧だけ印の要素へ出す。一度閉じたら、右クリックした位置に出る
function AtPointer({
  frame,
  open,
  x,
  y,
  children,
  ...props
}: {
  frame: HTMLElement;
  open: boolean;
  x: number;
  y: number;
  children: ReactNode;
} & Partial<React.ComponentProps<typeof ContextMenu>>) {
  const pointer = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(open);
  return (
    <>
      <span ref={pointer} aria-hidden className="absolute z-0 size-0" style={{ left: x, top: y }} />
      <ContextMenu
        trigger={<Area>レポート.pdf</Area>}
        presentation="popover"
        defaultOpen={open}
        portalContainer={frame}
        positionerProps={pinned ? { anchor: pointer } : undefined}
        {...props}
        onOpenChange={(next) => {
          if (!next) setPinned(false);
          props.onOpenChange?.(next);
        }}
      >
        {children}
      </ContextMenu>
    </>
  );
}

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <ContextMenu
          title="レポート.pdf"
          trigger={<div className="h-36 rounded-card border">…</div>}
        >
          <MenuItem icon={<PencilSimpleIcon />}>名前を変える</MenuItem>
          <MenuItem icon={<CopyIcon />}>複製</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<TrashIcon />} status="danger">削除</MenuItem>
        </ContextMenu>
      `),
    },
  },
  render: (args) => (
    <ContextMenu {...args} trigger={<Area />}>
      {actions}
    </ContextMenu>
  ),
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'ポインタの位置に、一覧の左上の角を置きます。' } },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[420px]">
      {(frame) => (
        <AtPointer frame={frame} open={openOnLoad(viewMode)} x={220} y={70}>
          {actions}
        </AtPointer>
      )}
    </ScreenFrame>
  ),
};

export const AreaAndOffset: Story = {
  tags: ['visual'],
  name: '範囲の面・ポインタからのずれ',
  parameters: {
    controls: { include: ['highlightArea', 'offsetX', 'offsetY'] },
    docs: {
      description: {
        story:
          '`highlightArea` で、開いているあいだ範囲に淡い面を敷きます。`offsetX`・`offsetY` で、一覧の角をポインタから離します（px）。',
      },
    },
  },
  args: { highlightArea: true, offsetX: 8, offsetY: 8 },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[420px]">
      {(frame) => (
        <AtPointer
          frame={frame}
          open={openOnLoad(viewMode)}
          x={220}
          y={70}
          highlightArea={args.highlightArea}
          offsetX={args.offsetX}
          offsetY={args.offsetY}
        >
          {actions}
        </AtPointer>
      )}
    </ScreenFrame>
  ),
};

export const CheckAndSubmenu: Story = {
  tags: ['visual'],
  name: 'チェック・ラジオ・入れ子',
  parameters: {
    controls: { include: ['color', 'markPlacement', 'radioMark', 'groupLabelStyle'] },
    docs: {
      description: {
        story:
          'チェック・ラジオ・入れ子の項目も Menu と同じです。チェックとラジオは押しても閉じません。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[460px]">
      {(frame) => (
        <AtPointer
          frame={frame}
          open={openOnLoad(viewMode)}
          x={180}
          y={60}
          color={args.color}
          markPlacement={args.markPlacement}
          radioMark={args.radioMark}
          groupLabelStyle={args.groupLabelStyle}
        >
          <MenuCheckboxItem defaultChecked>行番号</MenuCheckboxItem>
          <MenuCheckboxItem>折り返し</MenuCheckboxItem>
          <MenuSeparator />
          <MenuGroup label="並び順">
            <MenuRadioGroup defaultValue="updated">
              <MenuRadioItem value="updated">更新日</MenuRadioItem>
              <MenuRadioItem value="title">題名</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
          <MenuSeparator />
          <MenuSubmenu
            items={
              <>
                <MenuItem>下書き</MenuItem>
                <MenuItem>公開</MenuItem>
              </>
            }
          >
            移す
          </MenuSubmenu>
        </AtPointer>
      )}
    </ScreenFrame>
  ),
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート（長押し）',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '指で操作していて画面が狭いときは、長押しで画面の下から出るシートになります。見出しに `title` を出します。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <ContextMenu
          title="レポート.pdf"
          trigger={<Area>レポート.pdf を長押し</Area>}
          presentation="sheet"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {actions}
        </ContextMenu>
      )}
    </PhoneFrame>
  ),
};

const onRename = fn();

// 右クリックの合図（contextmenu）を、範囲の中のポインタの位置に送る
function rightClick(target: HTMLElement) {
  const { left, top } = target.getBoundingClientRect();
  target.dispatchEvent(
    new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: left + 40,
      clientY: top + 30,
    })
  );
}

export const RightClick: Story = {
  name: '右クリックで開く',
  parameters: { controls: { disable: true } },
  render: () => (
    <ContextMenu title="レポート.pdf" trigger={<Area />} presentation="popover">
      <MenuItem onClick={onRename}>名前を変える</MenuItem>
      <MenuItem disabled>書き出す</MenuItem>
    </ContextMenu>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const area = canvas.getByText('レポート.pdf を右クリック');
    // 左クリックでは開かない
    await userEvent.click(area);
    await expect(body.queryByRole('menu')).toBeNull();
    // 右クリックで開く
    rightClick(area);
    const menu = await body.findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: '名前を変える' })).toBeInTheDocument();
    await expect(within(menu).getByRole('menuitem', { name: '書き出す' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    // 項目を押すと実行して閉じる
    await userEvent.click(within(menu).getByRole('menuitem', { name: '名前を変える' }));
    await expect(onRename).toHaveBeenCalled();
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    // Esc でも閉じる
    rightClick(area);
    await body.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
  },
};

export const Disabled: Story = {
  name: '開かない',
  parameters: { controls: { disable: true } },
  render: () => (
    <ContextMenu disabled trigger={<Area>右クリックしてもブラウザの一覧が出ます</Area>}>
      {actions}
    </ContextMenu>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    rightClick(canvas.getByText('右クリックしてもブラウザの一覧が出ます'));
    await expect(body.queryByRole('menu')).toBeNull();
  },
};

export const HighlightedArea: Story = {
  name: '開いているあいだの範囲の面',
  parameters: { controls: { disable: true } },
  render: () => (
    <ContextMenu highlightArea trigger={<Area />} presentation="popover" offsetX={8} offsetY={8}>
      {actions}
    </ContextMenu>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const area = canvas.getByText('レポート.pdf を右クリック');
    const before = getComputedStyle(area).backgroundColor;
    rightClick(area);
    await body.findByRole('menu');
    await waitFor(() => expect(getComputedStyle(area).backgroundColor).not.toBe(before));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(getComputedStyle(area).backgroundColor).toBe(before));
  },
};
