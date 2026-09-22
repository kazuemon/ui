import {
  ArchiveIcon,
  CopyIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
// userEvent は play の引数ではなく storybook/test から読む
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Menu } from './Menu';
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
} from './MenuItem';
import { DensityPair, PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';
import { Button } from '../button/Button';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとフォーカスが移り、ページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

// hover・キーボードの選択と同じ塗りに固定する（見た目の一覧で使う）
const highlighted: CSSProperties & Record<`--${string}`, string> = {
  '--menu-item-bg': 'var(--menu-item-highlight)',
};

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '押して開く、操作の一覧です。項目を押すと実行して閉じます。外を押すか Esc でも閉じます。',
          '',
          '- 開くボタンは `trigger` に要素（`Button` など）で渡します。',
          '- その場で実行する項目は `MenuItem`、別の場所へ移る項目は `MenuLinkItem` です。`MenuLinkItem` に `target="_blank"` を付けると、後ろに右上向きの矢印が付きます。',
          '- `MenuItem` には `icon`（前のアイコン）、`shortcut`（後ろのショートカットの文字）、`description`（2 行目）を付けられます。ショートカットは表示だけで、キーの操作は使う側で付けます。',
          '- 削除のように取り消せない操作には `status="danger"` を付けます。文字が赤くなり、hover で赤を淡く敷きます。',
          '- 押せない項目は `disabled` にし、理由を `description` に書きます。`MenuLinkItem` も `disabled` にでき、押しても移りません。',
          '- 入・切を切り替える項目は `MenuCheckboxItem`、1 つだけを選ぶ項目は `MenuRadioGroup` の中の `MenuRadioItem` です。どちらも押しても閉じません。印の色は `color`、印の場所（前か右端か）は `markPlacement` で選びます。ラジオの印は `radioMark` で選びます（既定の `radio` はラジオと同じ丸、`dot` は選んだ項目に小さな点、`check` はチェック）。',
          '- 印を持つ項目があるメニューでは、既定で印のない項目（`MenuItem`・`MenuLinkItem`・`MenuSubmenu`）にも印の場所を空け、文字の左をそろえます。そろえたくないときは `alignMarks={false}` にします。',
          '- 見出し付きのまとまりは `MenuGroup`、区切り線は `MenuSeparator` です。見出しの文字は `groupLabelStyle` で選びます（`label` は入力欄のラベルと同じ太字、`caption` はキャプションと同じ小さいグレー）。',
          '- 入れ子のメニューは `MenuSubmenu` です。マウスでは載せるだけで開きます。シートでの開き方は `submenuSheet` で選びます（既定の `fixed` は 1 枚のシートのまま中身が横に滑り、入れ子があるときだけ、高さは最初に開いたメニューの高さのまま、上のつまみで変えられます）。',
          '- 出し方は `presentation` で決めます。既定の `auto` は、指で操作していて画面が狭いときだけ、画面の下から出るシートにします。シートでは `title` を見出しに出し、ショートカットは出しません。',
          '- シートを、はじく・下へ引いて閉じられるようにするには `closeOnSwipe` を付けます（既定は `false`）。付けると、入れ子がなくてもつまみを出します。',
          '- 外を押しても閉じないようにするときは `dismissible={false}`、Esc で閉じないようにするときは `closeOnEscape={false}` です。開くボタンごと押せなくするときは `disabled` にします。',
        ].join('\n'),
      },
    },
  },
  args: {
    trigger: <Button variant="outline">操作</Button>,
    side: 'bottom',
    align: 'start',
    presentation: 'auto',
    color: 'neutral',
    markPlacement: 'start',
    radioMark: 'radio',
    alignMarks: true,
    groupLabelStyle: 'label',
    submenuSheet: 'fixed',
    closeOnSwipe: false,
    title: '操作',
  },
  argTypes: {
    title: { control: 'text' },
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
      table: { defaultValue: { summary: "'bottom'" } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: "'start'" } },
    },
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
    alignMarks: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
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
    closeOnSwipe: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    trigger: { control: false },
    children: { control: false },
    portalContainer: { control: false },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const actions = (
  <>
    <MenuItem icon={<PencilSimpleIcon />} shortcut="Ctrl+E">
      編集
    </MenuItem>
    <MenuItem icon={<CopyIcon />} shortcut="Ctrl+D">
      複製
    </MenuItem>
    <MenuItem icon={<ShareNetworkIcon />}>共有</MenuItem>
    <MenuItem icon={<DownloadSimpleIcon />} disabled description="公開してから書き出せます">
      書き出す
    </MenuItem>
    <MenuSeparator />
    <MenuItem icon={<ArchiveIcon />}>アーカイブ</MenuItem>
    <MenuItem icon={<TrashIcon />} status="danger">
      削除
    </MenuItem>
  </>
);

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Menu title="操作" trigger={<Button variant="outline">操作</Button>}>
          <MenuItem icon={<PencilSimpleIcon />} shortcut="Ctrl+E">編集</MenuItem>
          <MenuItem icon={<CopyIcon />} shortcut="Ctrl+D">複製</MenuItem>
          <MenuItem icon={<DownloadSimpleIcon />} disabled description="公開してから書き出せます">
            書き出す
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon={<TrashIcon />} status="danger">削除</MenuItem>
        </Menu>
      `),
    },
  },
  render: (args) => <Menu {...args}>{actions}</Menu>,
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { include: ['side', 'align'] },
    docs: { description: { story: '本体のそばに浮かべた形です。' } },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[440px]">
      {(frame) => (
        <Menu
          key={`${args.side}-${args.align}`}
          {...args}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {actions}
        </Menu>
      )}
    </ScreenFrame>
  ),
};

export const ItemStates: Story = {
  tags: ['visual'],
  name: '項目の状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'hover とキーボードの選択はどちらもグレーの塗りです。危険な項目は赤を淡く敷きます。押せない項目は hover で塗らず、キーボードで止まったときだけ塗ります。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[420px]">
      {(frame) => (
        <Menu
          trigger={<Button variant="outline">操作</Button>}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <MenuItem icon={<PencilSimpleIcon />}>通常</MenuItem>
          <MenuItem icon={<CopyIcon />} style={highlighted}>
            hover・キーボードの選択
          </MenuItem>
          <MenuItem icon={<DownloadSimpleIcon />} disabled description="押せない理由">
            押せない
          </MenuItem>
          <MenuItem
            icon={<DownloadSimpleIcon />}
            disabled
            description="キーボードで止まったとき"
            style={highlighted}
          >
            押せない
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon={<TrashIcon />} status="danger">
            危険
          </MenuItem>
          <MenuItem icon={<TrashIcon />} status="danger" style={highlighted}>
            危険の hover
          </MenuItem>
        </Menu>
      )}
    </ScreenFrame>
  ),
};

const viewOptions = (
  <>
    <MenuGroup label="表示">
      <MenuCheckboxItem defaultChecked>行番号</MenuCheckboxItem>
      <MenuCheckboxItem>折り返し</MenuCheckboxItem>
      <MenuCheckboxItem disabled description="この形式では使えません">
        ミニマップ
      </MenuCheckboxItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuGroup label="並び順">
      <MenuRadioGroup defaultValue="updated">
        <MenuRadioItem value="updated">更新日</MenuRadioItem>
        <MenuRadioItem value="created">作成日</MenuRadioItem>
        <MenuRadioItem value="title">題名</MenuRadioItem>
      </MenuRadioGroup>
    </MenuGroup>
  </>
);

export const CheckAndRadio: Story = {
  tags: ['visual'],
  name: 'チェックとラジオ',
  parameters: {
    controls: { include: ['color', 'markPlacement', 'radioMark', 'groupLabelStyle'] },
    docs: {
      description: {
        story:
          '入・切を切り替える項目と、1 つだけを選ぶ項目です。押しても閉じず、続けて切り替えられます。印の色は `color` で選びます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[480px]">
      {(frame) => (
        <Menu
          trigger={<Button variant="outline">表示</Button>}
          presentation="popover"
          color={args.color}
          markPlacement={args.markPlacement}
          radioMark={args.radioMark}
          groupLabelStyle={args.groupLabelStyle}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {viewOptions}
        </Menu>
      )}
    </ScreenFrame>
  ),
};

export const MarkEndAndCaption: Story = {
  tags: ['visual'],
  name: '印を右端に・見出しを控えめに',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`markPlacement="end"` で印を右端に置くと、文字の左がふつうの項目とそろいます。`groupLabelStyle="caption"` で見出しをキャプションと同じ小さいグレーにすると、項目が主役になります。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[480px]">
      {(frame) => (
        <Menu
          trigger={<Button variant="outline">表示</Button>}
          presentation="popover"
          color="primary"
          markPlacement="end"
          groupLabelStyle="caption"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {viewOptions}
        </Menu>
      )}
    </ScreenFrame>
  ),
};

// アイコンは付けない（アイコンの分だけ文字の位置がずれ、印の場所がそろっているかの確かめに向かないため）
const mixedItems = (
  <>
    <MenuCheckboxItem defaultChecked>行番号</MenuCheckboxItem>
    <MenuSeparator />
    <MenuItem>名前を変える</MenuItem>
    <MenuItem status="danger">削除</MenuItem>
  </>
);

// 見た目の比較ではなく、そろう・そろわないの確かめ（play）だけなので撮らない
export const AlignMarks: Story = {
  name: '印のない項目の字下げ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '印を持つ項目（`MenuCheckboxItem`・`MenuRadioItem`）があるメニューでは、既定（`alignMarks`）で印のない項目にも印の場所を空け、文字の左をそろえます。`alignMarks={false}` にすると、印のない項目は字下げせず、印を持つ項目だけがそろいます。',
      },
    },
  },
  render: () => (
    <div className="flex gap-8">
      <ScreenFrame height="h-[260px]">
        {(frame) => (
          <Menu
            trigger={<Button variant="outline">既定（そろう）</Button>}
            presentation="popover"
            portalContainer={frame}
          >
            {mixedItems}
          </Menu>
        )}
      </ScreenFrame>
      <ScreenFrame height="h-[260px]">
        {(frame) => (
          <Menu
            trigger={<Button variant="outline">alignMarks=false</Button>}
            presentation="popover"
            alignMarks={false}
            portalContainer={frame}
          >
            {mixedItems}
          </Menu>
        )}
      </ScreenFrame>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    async function labelLeft(triggerName: string, itemName: string) {
      await userEvent.click(canvas.getByRole('button', { name: triggerName }));
      const menu = await body.findByRole('menu');
      const label = within(menu).getByText(itemName);
      const left = label.getBoundingClientRect().left;
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
      return left;
    }

    // 既定（alignMarks 既定 true）: 印を持つ項目と持たない項目の文字の左がそろう
    const checkedLeft = await labelLeft('既定（そろう）', '行番号');
    const plainLeft = await labelLeft('既定（そろう）', '名前を変える');
    await expect(plainLeft).toBe(checkedLeft);

    // alignMarks=false: 印を持たない項目は字下げせず、左がそろわない
    const checkedLeftOff = await labelLeft('alignMarks=false', '行番号');
    const plainLeftOff = await labelLeft('alignMarks=false', '名前を変える');
    await expect(plainLeftOff).toBeLessThan(checkedLeftOff);
  },
};

export const Links: Story = {
  tags: ['visual'],
  name: 'リンクの項目',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '別の場所へ移る項目は `MenuLinkItem` です。`target="_blank"` のときは右上向きの矢印を付け、読み上げに「新しいタブで開きます」を足します。`disabled` にすると、押せない `MenuItem` と同じ見た目になり、押しても移りません。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[320px]">
      {(frame) => (
        <Menu
          trigger={<Button variant="outline">アカウント</Button>}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          <MenuLinkItem href="#profile">プロフィール</MenuLinkItem>
          <MenuLinkItem href="#settings">設定</MenuLinkItem>
          <MenuLinkItem href="https://example.com/help" target="_blank">
            ヘルプ
          </MenuLinkItem>
          <MenuLinkItem href="#billing" disabled description="管理者だけ移れます">
            請求
          </MenuLinkItem>
        </Menu>
      )}
    </ScreenFrame>
  ),
};

const submenuItems = (
  <>
    <MenuItem icon={<PencilSimpleIcon />}>編集</MenuItem>
    <MenuSubmenu
      icon={<ShareNetworkIcon />}
      items={
        <>
          <MenuItem>リンクを写す</MenuItem>
          <MenuItem>メールで送る</MenuItem>
          <MenuItem>SNS に投稿</MenuItem>
        </>
      }
    >
      共有
    </MenuSubmenu>
    <MenuSeparator />
    <MenuItem icon={<TrashIcon />} status="danger">
      削除
    </MenuItem>
  </>
);

export const Submenu: Story = {
  tags: ['visual'],
  name: '入れ子のメニュー',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`MenuSubmenu` は、項目の横に入れ子のメニューを開きます。マウスでは載せるだけで、キーボードでは → で開き、← で戻ります。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[320px]">
      {(frame) => (
        <Menu
          trigger={<Button variant="outline">操作</Button>}
          presentation="popover"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {submenuItems}
        </Menu>
      )}
    </ScreenFrame>
  ),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode === 'docs') return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(await body.findByRole('menuitem', { name: '共有' }));
    await body.findByRole('menuitem', { name: 'リンクを写す' });
  },
};

export const Sheet: Story = {
  tags: ['visual'],
  name: 'シート',
  parameters: {
    controls: { include: ['title', 'closeOnSwipe'] },
    docs: {
      description: {
        story:
          '`presentation="sheet"` のとき、または `auto` で指で操作していて画面が狭いときは、画面の下から出るシートにします。`title` を見出しに出し、ショートカットは出しません。入れ子がないので、既定ではつまみを出しません。`closeOnSwipe` を付けると、つまみを出し、はじく・下へ引いて閉じられます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Menu
          {...args}
          presentation="sheet"
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {actions}
        </Menu>
      )}
    </PhoneFrame>
  ),
};

const sheetSubmenuItems = (open: boolean) => (
  <>
    <MenuItem icon={<PencilSimpleIcon />}>編集</MenuItem>
    <MenuSubmenu
      icon={<ShareNetworkIcon />}
      defaultOpen={open}
      items={
        <>
          <MenuItem>リンクを写す</MenuItem>
          <MenuItem>メールで送る</MenuItem>
          <MenuItem>SNS に投稿</MenuItem>
        </>
      }
    >
      共有
    </MenuSubmenu>
    <MenuItem icon={<DownloadSimpleIcon />}>書き出す</MenuItem>
    <MenuSeparator />
    <MenuItem icon={<TrashIcon />} status="danger">
      削除
    </MenuItem>
  </>
);

export const SheetSubmenu: Story = {
  tags: ['visual'],
  name: 'シートの入れ子のメニュー',
  parameters: {
    controls: { include: ['submenuSheet'] },
    docs: {
      description: {
        story:
          'シートで入れ子のメニューを開いたところです。開き方は `submenuSheet` で選びます。既定の `fixed` は 1 枚のシートのまま中身が右から滑り込み、高さは最初に開いたメニューの高さのまま、上のつまみで変えられます（入れ子があるので、つまみは既定でも出ます）。`fit`（`fixed` と同じく滑り込むが、高さは中身に合わせて伸び縮みする）・`cover`（親を覆う高さの別のシートを下から重ねる）も選べます。どの形も、見出しの左の ‹ で親に戻り、右の × ですべてを閉じます。',
      },
    },
  },
  render: (args, { viewMode }) => (
    <PhoneFrame>
      {(frame) => (
        <Menu
          key={args.submenuSheet}
          title="操作"
          trigger={<Button variant="outline">操作</Button>}
          presentation="sheet"
          submenuSheet={args.submenuSheet}
          defaultOpen={openOnLoad(viewMode)}
          portalContainer={frame}
        >
          {sheetSubmenuItems(openOnLoad(viewMode))}
        </Menu>
      )}
    </PhoneFrame>
  ),
  play: async ({ canvasElement, viewMode, args }) => {
    if (viewMode === 'docs') return;
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('menuitem', { name: 'リンクを写す' });
    // 入れ子のシートの見出しのボタンは、働きどおりの名前で読む
    if (args.submenuSheet === 'fit' || args.submenuSheet === 'fixed') {
      // シートは 1 枚のまま。一覧の名前は入れ子のメニューの題になり、親の項目は隠れる
      await expect(body.getAllByRole('button', { name: '戻る' })).toHaveLength(1);
      await expect(body.getAllByRole('button', { name: '閉じる' })).toHaveLength(1);
      await expect(body.getByRole('menu', { name: '共有' })).toBeVisible();
      await expect(body.queryByRole('menuitem', { name: '編集' })).toBeNull();
    } else {
      await expect(body.getAllByRole('button', { name: '戻る' })).toHaveLength(1);
      await expect(body.getAllByRole('button', { name: '閉じる' })).toHaveLength(2);
    }
  },
};

export const SheetSubmenuSlide: Story = {
  ...SheetSubmenu,
  tags: ['visual', '!autodocs'],
  name: 'シートの入れ子のメニュー（1 枚のまま滑らせる）',
  args: { submenuSheet: 'fit' },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: (_args, { viewMode }) => (
    <DensityPair>
      <DensityMenu open={openOnLoad(viewMode)} />
    </DensityPair>
  ),
};

// 2 つを同時に開いておくため、開閉を外から決める（片方を開くと、もう片方が閉じないように）
function DensityMenu({ open }: { open: boolean }) {
  return (
    <div className="relative h-[380px] w-[300px]">
      <Menu
        trigger={<Button variant="outline">操作</Button>}
        presentation="popover"
        modal={false}
        open={open}
      >
        {actions}
      </Menu>
    </div>
  );
}

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  args: { onOpenChange: fn() },
  parameters: { controls: { disable: true } },
  render: (args) => {
    return (
      <div className="flex flex-col gap-4">
        <Menu
          trigger={<Button variant="outline">操作</Button>}
          presentation="popover"
          onOpenChange={args.onOpenChange}
        >
          <MenuItem shortcut="Ctrl+E">編集</MenuItem>
          <MenuItem disabled description="公開してから書き出せます">
            書き出す
          </MenuItem>
          <MenuLinkItem href="#billing" disabled description="管理者だけ移れます">
            請求
          </MenuLinkItem>
          <MenuSeparator />
          <MenuGroup label="表示">
            <MenuCheckboxItem>折り返し</MenuCheckboxItem>
          </MenuGroup>
          <MenuRadioGroup defaultValue="a">
            <MenuRadioItem value="a">更新日</MenuRadioItem>
            <MenuRadioItem value="b">題名</MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '操作' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    // キーボードで開くと、最初の項目に移る
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = await body.findByRole('menu');
    const edit = within(menu).getByRole('menuitem', { name: '編集' });
    await waitFor(() => expect(edit).toHaveFocus());
    // ショートカットは名前に入れず、説明として読む
    await expect(edit).toHaveAccessibleDescription('Ctrl+E');

    // 押せない項目にも矢印キーで止まり、押せないことと理由が読まれる
    await userEvent.keyboard('{ArrowDown}');
    const exporting = within(menu).getByRole('menuitem', { name: '書き出す' });
    await waitFor(() => expect(exporting).toHaveFocus());
    await expect(exporting).toHaveAttribute('aria-disabled', 'true');
    await expect(exporting).toHaveAccessibleDescription('公開してから書き出せます');

    // 押せないリンクの項目（MenuLinkItem）も、href を持たず、押しても移らず閉じない
    const billing = within(menu).getByRole('menuitem', { name: '請求' });
    await expect(billing).toHaveAttribute('aria-disabled', 'true');
    await expect(billing).not.toHaveAttribute('href');
    await userEvent.click(billing);
    await expect(menu).toBeVisible();

    // チェックの項目は押しても閉じず、状態が切り替わる
    const wrap = within(menu).getByRole('menuitemcheckbox', { name: '折り返し' });
    await expect(within(menu).getByRole('group', { name: '表示' })).toContainElement(wrap);
    await userEvent.click(wrap);
    await expect(wrap).toHaveAttribute('aria-checked', 'true');
    await expect(menu).toBeVisible();
    const title = within(menu).getByRole('menuitemradio', { name: '題名' });
    await userEvent.click(title);
    await expect(title).toHaveAttribute('aria-checked', 'true');

    // Esc で閉じ、フォーカスは開いたボタンに戻る
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};
