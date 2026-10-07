import {
  BookOpenTextIcon,
  BrowserIcon,
  DeviceMobileIcon,
  MicrophoneStageIcon,
  PaintBrushIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  NavigationMenu,
  NavigationMenuGroup,
  NavigationMenuItem,
  NavigationMenuLink,
} from './NavigationMenu';
import { DensityPair, Matrix, PhoneFrame, ScreenFrame } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import { Button } from '../button/Button';
import { Navbar } from '../navbar/Navbar';

// 開いた状態のストーリーも、ドキュメントのページでは閉じて描く（開くとページが流れるため）
const openOnLoad = (viewMode: string) => viewMode !== 'docs';

const brand = (
  <a href="#top" className="flex items-center gap-2 text-fg no-underline">
    <span aria-hidden="true" className="size-6 rounded-lg bg-primary" />
    k6n
  </a>
);

// 帯に並べる中身。見本では移らない（# の行き先）
const items = (current?: string) => (
  <>
    <NavigationMenuItem label="Works" value="works">
      <NavigationMenuLink
        href="#web"
        icon={<BrowserIcon />}
        description="企業とイベントのサイト"
        current={current === 'web'}
      >
        Web サイト
      </NavigationMenuLink>
      <NavigationMenuLink
        href="#apps"
        icon={<DeviceMobileIcon />}
        description="iOS と Web のアプリ"
      >
        アプリ
      </NavigationMenuLink>
      <NavigationMenuLink
        href="#illustrations"
        icon={<PaintBrushIcon />}
        description="キャラクターと挿絵"
      >
        イラスト
      </NavigationMenuLink>
      <NavigationMenuLink
        href="#talks"
        icon={<MicrophoneStageIcon />}
        description="勉強会とカンファレンスの登壇"
      >
        登壇
      </NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem label="Blog" value="blog" columns={2}>
      <NavigationMenuGroup label="技術">
        <NavigationMenuLink href="#frontend" description="React・CSS・アクセシビリティ">
          フロントエンド
        </NavigationMenuLink>
        <NavigationMenuLink href="#design-system" description="この UI ライブラリの作り方">
          デザインシステム
        </NavigationMenuLink>
      </NavigationMenuGroup>
      <NavigationMenuGroup label="そのほか">
        <NavigationMenuLink href="#diary" description="月に一度のふりかえり">
          日記
        </NavigationMenuLink>
        <NavigationMenuLink
          href="https://example.com/zenn"
          target="_blank"
          description="外のサイトに書いた記事"
        >
          Zenn
        </NavigationMenuLink>
      </NavigationMenuGroup>
    </NavigationMenuItem>
    <NavigationMenuLink href="#about" current={current === 'about'}>
      About
    </NavigationMenuLink>
  </>
);

const meta = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'ページの上の帯から、行き先の一覧を下に開くメニューです。項目にマウスを載せるか押すと、題と説明つきの行き先を並べた面が開きます。項目を移ると、面の大きさが滑らかに変わります。',
          '',
          '- `Navbar` の中に、`NavbarLinks` の代わりに置きます。帯の行き先と同じ見た目で、いまいるページの印は `Navbar` の `currentIndicator` に従います。',
          '- 開く項目は `NavigationMenuItem` です。`label` が帯に出る名前、children が開いた面に並べる行き先です。列の数は `columns`（既定 1）で決めます。',
          '- 行き先は `NavigationMenuLink` です。`NavigationMenuItem` の中では、`icon`（前のアイコン）・題（children）・`description`（題の下の説明）の行になります。`NavigationMenu` に直に並べると、面を開かない帯の行き先になります。',
          '- 行き先を見出しでまとめるときは `NavigationMenuGroup` に入れます。まとまりは 1 つで 1 列を使うので、`columns` をまとまりの数に合わせます。',
          '- いまいるページの行き先には `current` を付けます（`aria-current="page"`）。開いた面の中では題が太くなります。',
          '- `target="_blank"` の行き先は、題の後ろに右上向きの矢印が付き、読み上げに「新しいタブで開きます」が入ります。矢印は `newTabIcon` で付け外しできます。ルーターのリンクは `render` に渡します。',
          '- `Navbar` の帯が狭いときは、`narrowPlacement`（既定 `menu`）で `Navbar` のメニューへ畳みます。メニューの中では面を開かず、項目の名前を見出しにして、行き先を縦に並べます。',
          '- 行き先のアイコンは `iconVariant` で見せ方を選べます。`plain`（既定）はアイコンだけ、`soft` は入力欄と同じグレーの角丸の箱に入れます。',
          '- 項目を移ったときの動きは `switchMotion` で選べます。`slide`（既定）は面の大きさと中身が滑らかに変わり、`none` はすぐ切り替えます。動きを減らす設定では、どちらでも動かしません。',
          '- 開く項目を外から決めるときは、`NavigationMenuItem` の `value` と、`NavigationMenu` の `value`・`onValueChange` を使います。',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      table: { defaultValue: { summary: "'start'" } },
    },
    switchMotion: {
      control: 'inline-radio',
      options: ['slide', 'none'],
      table: { defaultValue: { summary: "'slide'" } },
    },
    portalContainer: { control: false },
    popupProps: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: sourceCode(`
        <Navbar brand={brand} actions={<Button color="primary">Contact</Button>}>
          <NavigationMenu>
            <NavigationMenuItem label="Works">
              <NavigationMenuLink href="/works/web" icon={<BrowserIcon />} description="企業とイベントのサイト">
                Web サイト
              </NavigationMenuLink>
              …
            </NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenu>
        </Navbar>
      `),
    },
  },
  render: (args) => (
    <div className="min-h-[420px]">
      <Navbar brand={brand} actions={<Button color="primary">Contact</Button>}>
        <NavigationMenu {...args}>{items()}</NavigationMenu>
      </Navbar>
    </div>
  ),
};

export const Open: Story = {
  tags: ['visual'],
  name: '開いた状態',
  parameters: {
    controls: { include: ['align'] },
    docs: { description: { story: 'Works を開いたところです。' } },
  },
  render: (args, { viewMode }) => (
    <ScreenFrame height="h-[440px]" width="w-[880px]">
      {(frame) => (
        <div className="-mx-6 -mt-6 w-[calc(100%+3rem)]">
          <Navbar brand={brand} actions={<Button color="primary">Contact</Button>}>
            <NavigationMenu
              key={args.align}
              {...args}
              defaultValue={openOnLoad(viewMode) ? 'works' : null}
              portalContainer={frame}
            >
              {items('web')}
            </NavigationMenu>
          </Navbar>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const Groups: Story = {
  tags: ['visual'],
  name: '見出しでまとめる',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`NavigationMenuGroup` で見出しを付け、`columns={2}` で 2 列に並べたところです。説明のない行き先は題だけの行になります。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[400px]" width="w-[880px]">
      {(frame) => (
        <div className="-mx-6 -mt-6 w-[calc(100%+3rem)]">
          <Navbar brand={brand}>
            <NavigationMenu
              defaultValue={openOnLoad(viewMode) ? 'blog' : null}
              portalContainer={frame}
            >
              {items()}
            </NavigationMenu>
          </Navbar>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const IconBox: Story = {
  tags: ['visual'],
  name: 'アイコンを箱に入れる',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`NavigationMenuLink` の `iconVariant="soft"` で、アイコンを入力欄と同じグレーの角丸の箱に入れたところです。箱が題と説明の 2 行の高さにそろい、行の頭がそろって見えます。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[440px]" width="w-[880px]">
      {(frame) => (
        <div className="-mx-6 -mt-6 w-[calc(100%+3rem)]">
          <Navbar brand={brand}>
            <NavigationMenu
              defaultValue={openOnLoad(viewMode) ? 'works' : null}
              portalContainer={frame}
            >
              <NavigationMenuItem label="Works" value="works">
                <NavigationMenuLink
                  href="#web"
                  icon={<BrowserIcon />}
                  iconVariant="soft"
                  description="企業とイベントのサイト"
                  current
                >
                  Web サイト
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="#apps"
                  icon={<DeviceMobileIcon />}
                  iconVariant="soft"
                  description="iOS と Web のアプリ"
                >
                  アプリ
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="#illustrations"
                  icon={<PaintBrushIcon />}
                  iconVariant="soft"
                  description="キャラクターと挿絵"
                >
                  イラスト
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="#talks"
                  icon={<MicrophoneStageIcon />}
                  iconVariant="soft"
                  description="勉強会とカンファレンスの登壇"
                >
                  登壇
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuLink href="#about">About</NavigationMenuLink>
            </NavigationMenu>
          </Navbar>
        </div>
      )}
    </ScreenFrame>
  ),
};

export const SwitchMotion: Story = {
  name: '項目を移る動き',
  args: { switchMotion: 'none' },
  parameters: {
    layout: 'fullscreen',
    controls: { include: ['switchMotion'] },
    docs: {
      description: {
        story:
          '`switchMotion="none"` では、面を開いたまま隣の項目へ移ったとき、面の大きさと中身をすぐ切り替えます。開くとき・閉じるときの動きは残ります。',
      },
    },
  },
  render: (args) => (
    <div className="min-h-[420px]">
      <Navbar brand={brand}>
        <NavigationMenu {...args}>{items()}</NavigationMenu>
      </Navbar>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Works' }));
    const positioner = await waitFor(() => {
      const popup = document.querySelector('[data-slot="navigation-menu-popup"]');
      if (!popup?.parentElement) throw new Error('面が開いていません');
      return popup.parentElement;
    });
    const duration = getComputedStyle(positioner)
      .getPropertyValue('--navigation-menu-switch-duration')
      .trim();
    if (args.switchMotion === 'none') await expect(duration).toBe('0ms');
    else await expect(duration).not.toBe('0ms');
    await userEvent.keyboard('{Escape}');
  },
};

const triggerColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

export const TriggerStates: Story = {
  tags: ['visual'],
  name: '帯の項目の状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: ':is([data-slot="navigation-menu-trigger"], [data-slot="navigation-menu-link"])',
      focusVisible:
        ':is([data-slot="navigation-menu-trigger"], [data-slot="navigation-menu-link"])',
    }),
    docs: {
      description: {
        story:
          '開く項目は帯の行き先と同じ見た目に、▼ が付きます。開いているあいだは文字を濃くし、hover と同じ淡い塗りを残します（▼ は回しません）。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={['開く項目', '行き先'] as const}
      columns={triggerColumns}
      rowLabel={(row) => row}
      renderCell={(row) => (
        <NavigationMenu>
          {row === '開く項目' ? (
            <NavigationMenuItem label="Works">
              <NavigationMenuLink href="#web">Web サイト</NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuLink href="#about">About</NavigationMenuLink>
          )}
        </NavigationMenu>
      )}
    />
  ),
};

export const LinkStates: Story = {
  tags: ['visual'],
  name: '面の中の行き先の状態',
  parameters: {
    controls: { disable: true },
    pseudo: {
      rootSelector: 'body',
      hover: ['.story-hover'],
      focusVisible: ['.story-focus'],
    },
    docs: {
      description: {
        story:
          'hover とキーボードで止まったときは、グレーの塗りを敷きます（キーボードではフォーカスの線も出ます）。いまいるページの行き先は題を太くします。',
      },
    },
  },
  render: (_args, { viewMode }) => (
    <ScreenFrame height="h-[460px]">
      {(frame) => (
        <NavigationMenu
          defaultValue={openOnLoad(viewMode) ? 'states' : null}
          portalContainer={frame}
        >
          <NavigationMenuItem label="状態" value="states">
            <NavigationMenuLink href="#a" icon={<BrowserIcon />} description="説明の文">
              通常
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#b"
              icon={<BrowserIcon />}
              description="説明の文"
              className="story-hover"
            >
              hover
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#c"
              icon={<BrowserIcon />}
              description="説明の文"
              className="story-focus"
            >
              フォーカス（キーボード）
            </NavigationMenuLink>
            <NavigationMenuLink href="#d" icon={<BrowserIcon />} description="説明の文" current>
              いまいるページ
            </NavigationMenuLink>
            <NavigationMenuLink href="#e" description="アイコンなし">
              アイコンなし
            </NavigationMenuLink>
            <NavigationMenuLink href="#f" icon={<BookOpenTextIcon />}>
              説明なし
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenu>
      )}
    </ScreenFrame>
  ),
};

export const InNavbarMenu: Story = {
  tags: ['visual'],
  name: 'Navbar のメニューに畳む',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '帯が狭いときは Navbar のメニューへ畳みます。メニューの中では面を開かず、項目の名前を見出しにして、行き先を縦に並べます。説明とアイコンは出しません。',
      },
    },
  },
  render: () => (
    <PhoneFrame>
      {(frame) => (
        <div className="-mx-5 -mt-8">
          <Navbar brand={brand} menuSide="bottom" portalContainer={frame}>
            <NavigationMenu>{items('web')}</NavigationMenu>
          </Navbar>
        </div>
      )}
    </PhoneFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'メニュー' }));
    const menu = await canvas.findByRole('dialog', { name: 'メニュー' });
    const nav = within(menu).getByRole('navigation', { name: 'メイン' });
    // 項目の名前が見出しになり、行き先の並びの名前になる
    await expect(within(nav).getByRole('list', { name: 'Works' })).toBeInTheDocument();
    await expect(within(nav).getByRole('list', { name: '技術' })).toBeInTheDocument();
    await expect(within(nav).getByRole('link', { name: 'Web サイト' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(within(nav).queryByRole('button')).toBeNull();
  },
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <NavigationMenu>{items('about')}</NavigationMenu>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="min-h-[360px]">
      <NavigationMenu accessibleName="サイト">{items()}</NavigationMenu>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const nav = canvas.getByRole('navigation', { name: 'サイト' });
    const works = within(nav).getByRole('button', { name: 'Works' });
    await expect(works).toHaveAttribute('aria-expanded', 'false');

    // 押すと開き、行き先の名前は題、説明は aria-describedby で添える
    await userEvent.click(works);
    await waitFor(() => expect(works).toHaveAttribute('aria-expanded', 'true'));
    const web = await body.findByRole('link', { name: 'Web サイト' });
    await expect(web).toHaveAccessibleDescription('企業とイベントのサイト');

    // 新しいタブで開く行き先は、名前に「新しいタブで開きます」が入る
    await userEvent.click(within(nav).getByRole('button', { name: 'Blog' }));
    const zenn = await body.findByRole('link', { name: /^Zenn\s*（新しいタブで開きます）$/ });
    await expect(zenn).toHaveAttribute('rel', 'noopener noreferrer');

    // Esc で閉じる
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('link', { name: /Zenn/ })).toBeNull());

    // 帯に直に並べた行き先はリンク
    await expect(within(nav).getByRole('link', { name: 'About' })).toBeVisible();
  },
};
