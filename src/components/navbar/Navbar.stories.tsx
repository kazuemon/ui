import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Navbar, NavbarGroup, NavbarLink, NavbarLinks, NavbarMenuList } from './Navbar';
import { landscape, night } from '../../samples/images';
import { DensityPair, Matrix, PhoneFrame } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import { Button } from '../button/Button';
import { SearchField } from '../search-field/SearchField';

const pages = [
  { label: 'Works', href: '#works' },
  { label: 'Blog', href: '#blog' },
  { label: 'About', href: '#about' },
];

const brand = (
  <a href="#top" className="flex items-center gap-2 text-fg no-underline">
    <span aria-hidden="true" className="size-6 rounded-lg bg-primary" />
    k6n
  </a>
);

// 見本では移らない（押しても Storybook のページを動かさない）
const links = (current = 'Works') => (
  <NavbarLinks>
    {pages.map((page) => (
      <NavbarLink
        key={page.label}
        href={page.href}
        current={page.label === current}
        onClick={(event) => event.preventDefault()}
      >
        {page.label}
      </NavbarLink>
    ))}
  </NavbarLinks>
);

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'ページの上の帯です。左にロゴ、中に行き先、右に操作を 1 行に並べます。',
          '',
          '- 行き先は `NavbarLinks` の中に `NavbarLink` を並べ、`Navbar` の中に置きます。いまいるページには `current` を付けます（読み上げでは「現在のページ」）。',
          '- 行き先のほかのもの（検索の欄など）は `NavbarGroup` に入れて、`NavbarLinks` と並べて置きます。どちらにも入れずに置いたものは、帯が狭いときも帯に残ります。',
          '- `narrowPlacement` が `menu` のまとまりは、帯とメニューの 2 か所に描かれます。検索の欄など状態を持つものを入れるときは、`value` と `onValueChange` で外から状態を渡すと、帯とメニューで同じ値になります。',
          '- `brand` には、トップへのリンクにしたロゴやサイトの名前を渡します。`actions` には、帯の右端に置くボタンなどを渡します。',
          '- 帯の幅が 768px より狭いときは、行き先をメニューのボタンに畳みます。`NavbarLinks`・`NavbarGroup` ごとに `narrowPlacement` で、メニューに畳む（`menu`。既定）・帯に残す（`bar`）・隠す（`hidden`）を選べます。畳むかどうかは画面の幅ではなく帯そのものの幅で決まるので、画面の一部に置いた帯も、置いた幅に合わせて畳まれます。押すと、行き先を縦に並べた面が開きます。行き先を押すと面は閉じます。',
          '- メニューの面は、指で操作していて画面が狭いときは下から出すシート、それ以外は右から出すパネルです。`menuSide` で固定できます。',
          '- メニューの開閉を外から決めるときは `menuOpen` と `onMenuOpenChange` を使います（ページを移ったあとに閉じるときなど）。',
          '- 外のサイトへの行き先は `target="_blank"` を付けます。右上向きの矢印（↗）が付き、読み上げに「新しいタブで開きます」が入り、`rel="noopener noreferrer"` も付きます（Link と同じ扱いです）。',
          '- `size` は中身の幅の上限で、Container と同じです。本文の Container と同じ値にすると、端がそろいます。',
          '- いまいるページの印は `currentIndicator` で選びます。`text`（既定）は文字を濃く太く、`neutral` はグレーの面、`primary` は淡い青の面、`underline` は文字の下に青い線です。',
          '- `sticky` を付けると、スクロールしても画面の上に貼り付きます（既定は付けません）。下の内容との境目は `stickyEdge`（`line` 既定・`shadow`）、面は `stickyBackdrop`（`solid` 既定・`blur`・`transparent-until-scroll`）で選びます。`transparent-until-scroll` は、いちばん上では面と境目を消して後ろを見せ、スクロールすると `solid` と同じ面にします。',
          '- 透かしているあいだの文字は `transparentVariant` で守ります。`plain`（既定）は面を敷かず本文の色のままで、明るい画像に向きます。`scrim` は上から暗い幕を敷いて文字を白く、`frosted` は白を薄く敷いて後ろをぼかし、`text-shadow` は面を敷かずに文字を白くして淡い影を落とします。暗い画像には `scrim` か `text-shadow` を使います。帯を画像に重ねるには、帯の下の余白を使う側で詰めます（`className="-mb-(--navbar-height)"` など）。',
          '- `stickyBehavior="hide-on-scroll"` で、スクロールした量だけ帯を押し上げて隠し、上へ戻すと出します。スクロールを止めると、隠すか出すか近い方へ寄せます。帯の中にフォーカスがあるときと、メニューを開いているときは隠しません。',
          '- Next.js の `Link` は、`NavbarLink` の `render` に渡します。',
        ].join('\n'),
      },
    },
  },
  args: {
    size: 'default',
    sticky: false,
    currentIndicator: 'text',
    stickyEdge: 'line',
    stickyBackdrop: 'solid',
    stickyBehavior: 'always',
    transparentVariant: 'plain',
    accessibleName: 'メイン',
    menuTitle: 'メニュー',
    menuSide: 'auto',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['prose', 'default', 'wide', 'full'],
      table: { defaultValue: { summary: "'default'" } },
    },
    currentIndicator: {
      control: 'inline-radio',
      options: ['text', 'neutral', 'primary', 'underline'],
      table: { defaultValue: { summary: "'text'" } },
    },
    stickyEdge: {
      control: 'inline-radio',
      options: ['line', 'shadow'],
      table: { defaultValue: { summary: "'line'" } },
    },
    stickyBackdrop: {
      control: 'inline-radio',
      options: ['solid', 'blur', 'transparent-until-scroll'],
      table: { defaultValue: { summary: "'solid'" } },
    },
    stickyBehavior: {
      control: 'inline-radio',
      options: ['always', 'hide-on-scroll'],
      table: { defaultValue: { summary: "'always'" } },
    },
    transparentVariant: {
      control: 'inline-radio',
      options: ['plain', 'scrim', 'frosted', 'text-shadow'],
      table: { defaultValue: { summary: "'plain'" } },
    },
    menuSide: {
      control: 'inline-radio',
      options: ['auto', 'bottom', 'left', 'right'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    brand: { control: false },
    actions: { control: false },
    children: { control: false },
    portalContainer: { control: false },
    menuOpen: { control: false },
    onMenuOpenChange: { control: false },
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Navbar
          brand={<a href="/">k6n</a>}
          actions={<Button color="primary">Contact</Button>}
        >
          <NavbarLinks>
            <NavbarLink href="/works" current>Works</NavbarLink>
            <NavbarLink href="/blog">Blog</NavbarLink>
            <NavbarLink href="/about">About</NavbarLink>
          </NavbarLinks>
        </Navbar>
      `),
    },
  },
  render: (args) => (
    <Navbar {...args} brand={brand} actions={<Button color="primary">Contact</Button>}>
      {links()}
    </Navbar>
  ),
};

export const Widths: Story = {
  tags: ['visual'],
  name: '広いときと狭いとき',
  parameters: {
    controls: { include: ['size'] },
    docs: {
      description: {
        story:
          '帯の幅が 768px より狭いときは、行き先をメニューのボタンに畳みます。ロゴと `actions` は帯に残ります。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-8 bg-field py-8">
      <div className="w-[1024px] max-w-full bg-bg">
        <Navbar {...args} brand={brand} actions={<Button color="primary">Contact</Button>}>
          {links()}
        </Navbar>
      </div>
      <div className="w-[375px] bg-bg" data-density="coarse">
        <Navbar {...args} brand={brand} actions={<Button color="primary">Contact</Button>}>
          {links()}
        </Navbar>
      </div>
    </div>
  ),
};

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

export const States: Story = {
  tags: ['visual'],
  name: '行き先の状態',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="navbar-link"]',
      active: '[data-slot="navbar-link"]',
      focusVisible: '[data-slot="navbar-link"]',
    }),
  },
  render: () => (
    <Matrix
      rows={[false, true]}
      columns={stateColumns}
      rowLabel={(current) => (current ? 'いまいるページ' : 'ほかのページ')}
      renderCell={(current) => (
        <ul className="flex">
          <NavbarLink href="#" current={current}>
            Works
          </NavbarLink>
        </ul>
      )}
    />
  ),
};

const indicators = ['text', 'neutral', 'primary', 'underline'] as const;

export const CurrentIndicators: Story = {
  tags: ['visual'],
  name: 'いまいるページの印',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`currentIndicator` で選びます。メニューの中の行では、`underline` は `text` と同じ見た目です。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {indicators.map((indicator) => (
        <div key={indicator} className="flex items-center gap-6">
          <span className="w-20 text-xs font-bold text-fg-subtle">{indicator}</span>
          <div className="w-[800px] border border-line">
            <Navbar
              brand={brand}
              currentIndicator={indicator}
              actions={<Button color="primary">Contact</Button>}
            >
              {links()}
            </Navbar>
          </div>
          <div className="w-48 rounded-card border border-line p-4">
            <NavbarMenuList currentIndicator={indicator}>{links()}</NavbarMenuList>
          </div>
        </div>
      ))}
    </div>
  ),
};

const stickyVariants = [
  ['line', 'solid'],
  ['shadow', 'solid'],
  ['line', 'blur'],
  ['shadow', 'blur'],
] as const;

// 描いたあと、決めた位置までスクロールしておく（内容が帯の下を通っているところ）
const scrolled = (node: HTMLDivElement | null) => {
  if (node) node.scrollTop = 150;
};

export const Sticky: Story = {
  tags: ['visual'],
  name: '貼り付けたとき',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`sticky` を付けると、スクロールした内容が帯の下を通ります。境目は `stickyEdge`、面は `stickyBackdrop` で選びます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {stickyVariants.map(([edge, backdrop]) => (
        <div key={`${edge}-${backdrop}`} className="flex items-center gap-6">
          <span className="w-36 text-xs font-bold text-fg-subtle">
            {edge}・{backdrop}
          </span>
          <div ref={scrolled} className="h-40 w-[800px] overflow-y-auto border border-line bg-bg">
            <Navbar sticky stickyEdge={edge} stickyBackdrop={backdrop} brand={brand}>
              {links()}
            </Navbar>
            <div className="mx-auto max-w-[640px] py-6">
              <img
                src={landscape}
                alt=""
                className="aspect-video w-full rounded-card object-cover"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

const transparentVariants = ['plain', 'scrim', 'frosted', 'text-shadow'] as const;

export const TransparentTop: Story = {
  tags: ['visual'],
  name: 'いちばん上で透かすとき',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`stickyBackdrop="transparent-until-scroll"` で、いちばん上にいるあいだの帯です。文字の守り方は `transparentVariant` で選びます。左は明るい画像、右は暗い画像の上です。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {transparentVariants.map((variant) => (
        <div key={variant} className="flex items-center gap-6">
          <span className="w-24 text-xs font-bold text-fg-subtle">{variant}</span>
          {[landscape, night].map((image) => (
            <div key={image} className="h-40 w-[560px] overflow-y-auto border border-line bg-bg">
              <Navbar
                sticky
                stickyBackdrop="transparent-until-scroll"
                transparentVariant={variant}
                className="-mb-(--navbar-height)"
                brand={<span>k6n</span>}
                actions={<Button variant="outline">Contact</Button>}
              >
                {links()}
              </Navbar>
              <img src={image} alt="" className="block h-48 w-full object-cover" />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-[800px] border border-line">
        <Navbar brand={brand} actions={<Button color="primary">Contact</Button>}>
          {links()}
        </Navbar>
      </div>
    </DensityPair>
  ),
};

// 行き先のほかに置くもの。検索の欄は帯に残し、ヘルプは隠し、ログインはメニューに畳む
const groups = (
  <>
    {links()}
    <NavbarGroup narrowPlacement="bar" className="min-w-0 flex-1">
      <SearchField accessibleName="サイト内を検索" placeholder="検索" className="min-w-0 flex-1" />
    </NavbarGroup>
    <NavbarGroup narrowPlacement="hidden">
      <Button variant="outline">ヘルプ</Button>
    </NavbarGroup>
    <NavbarGroup>
      <Button color="primary">ログイン</Button>
    </NavbarGroup>
  </>
);

export const NarrowPlacement: Story = {
  tags: ['visual'],
  name: '狭いときの行き先',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '行き先のほかのものは `NavbarGroup` に入れます。帯が狭いときの行き先は、`narrowPlacement` で、メニューに畳む（`menu`。既定）・帯に残す（`bar`）・隠す（`hidden`）から選びます。ここでは、行き先とログインはメニューに畳み、検索の欄は帯に残し、ヘルプは隠しています。',
      },
      source: sourceCode(`
        <Navbar brand={<a href="/">k6n</a>}>
          <NavbarLinks>
            <NavbarLink href="/works" current>Works</NavbarLink>
            <NavbarLink href="/blog">Blog</NavbarLink>
          </NavbarLinks>
          <NavbarGroup narrowPlacement="bar">
            <SearchField accessibleName="サイト内を検索" placeholder="検索" />
          </NavbarGroup>
          <NavbarGroup narrowPlacement="hidden">
            <Button variant="outline">ヘルプ</Button>
          </NavbarGroup>
          <NavbarGroup>
            <Button color="primary">ログイン</Button>
          </NavbarGroup>
        </Navbar>
      `),
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div data-testid="wide" className="w-[1024px] max-w-full border border-line">
        <Navbar brand={brand} menuSide="right">
          {groups}
        </Navbar>
      </div>
      <div data-testid="narrow" className="w-[375px] border border-line" data-density="coarse">
        <Navbar brand={brand} menuSide="right">
          {groups}
        </Navbar>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const wide = within(within(canvasElement).getByTestId('wide'));
    const narrow = within(within(canvasElement).getByTestId('narrow'));

    // 広い帯: どのまとまりも帯に並び、メニューのボタンはない
    const nav = wide.getByRole('navigation', { name: 'メイン' });
    await expect(within(nav).getByRole('list')).toBeVisible();
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    await expect(wide.getByRole('searchbox', { name: 'サイト内を検索' })).toBeVisible();
    await expect(wide.getByRole('button', { name: 'ヘルプ' })).toBeVisible();
    await expect(wide.getByRole('button', { name: 'ログイン' })).toBeVisible();
    await expect(wide.queryByRole('button', { name: 'メニュー' })).toBeNull();

    // 狭い帯: bar は残り、menu と hidden は帯から消える
    await expect(narrow.getByRole('searchbox', { name: 'サイト内を検索' })).toBeVisible();
    await expect(narrow.queryByRole('navigation', { name: 'メイン' })).toBeNull();
    await expect(narrow.queryByRole('button', { name: 'ヘルプ' })).toBeNull();
    await expect(narrow.queryByRole('button', { name: 'ログイン' })).toBeNull();

    // メニューには menu のまとまりだけが並ぶ（行き先は nav と ul のまま）
    const menuButton = narrow.getByRole('button', { name: 'メニュー' });
    await userEvent.click(menuButton);
    const menu = within(await body.findByRole('dialog', { name: 'メニュー' }));
    const menuNav = menu.getByRole('navigation', { name: 'メイン' });
    await expect(within(menuNav).getAllByRole('listitem')).toHaveLength(3);
    await expect(menu.getByRole('button', { name: 'ログイン' })).toBeVisible();
    await expect(menu.queryByRole('searchbox')).toBeNull();
    await expect(menu.queryByRole('button', { name: 'ヘルプ' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'メニュー' })).toBeNull());
    // 撮る前に、戻ったフォーカスを外す（フォーカスの線を写さない）
    menuButton.blur();
  },
};

function OnlyBarDemo() {
  return (
    <div className="w-[375px] border border-line">
      <Navbar brand={brand}>
        <NavbarLinks narrowPlacement="bar">
          <NavbarLink href="#works" current onClick={(event) => event.preventDefault()}>
            Works
          </NavbarLink>
          <NavbarLink href="#blog" onClick={(event) => event.preventDefault()}>
            Blog
          </NavbarLink>
        </NavbarLinks>
      </Navbar>
    </div>
  );
}

export const LinksInBar: Story = {
  name: '行き先を帯に残す',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '行き先が少ないときは、`NavbarLinks` に `narrowPlacement="bar"` を付けると、狭い帯でも畳まずに並べます。メニューに畳むものがないときは、メニューのボタンも出しません。',
      },
    },
  },
  render: () => <OnlyBarDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'メイン' });
    await expect(nav).toBeVisible();
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.queryByRole('button', { name: 'メニュー' })).toBeNull();
  },
};

// 自分の部品で包んだ行き先（サイトの共通の部品にまとめるときなど）
// 自分の部品が、まとまりを要素で包んで返す形
function SiteLinks() {
  return (
    <div className="flex items-center gap-2">
      {links('Blog')}
      <span className="text-xs text-fg-subtle">β</span>
    </div>
  );
}

export const WrappedLinks: Story = {
  name: '包んだ部品の中に置く',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`NavbarLinks`・`NavbarGroup` は、自分の部品で包んで置いても、狭い帯ではメニューに畳みます。まとまりに入れずに置いたもの（ここでは部品の中でまとまりと並べた「β」の印）は、狭い帯でも帯に残り、メニューには出しません。',
      },
    },
  },
  render: () => (
    <div className="w-[375px] border border-line">
      <Navbar brand={brand} menuSide="right">
        <SiteLinks />
      </Navbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('β')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'メニュー' }));
    const menu = within(await body.findByRole('dialog', { name: 'メニュー' }));
    const nav = menu.getByRole('navigation', { name: 'メイン' });
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    // 包んだ要素ごと出るので、行き先を押せる
    await expect(within(nav).getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(menu.getByText('β')).not.toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'メニュー' })).toBeNull());
  },
};

export const Menu: Story = {
  tags: ['visual'],
  name: 'メニューを開いたところ',
  parameters: {
    layout: 'padded',
    controls: { include: ['menuSide'] },
    docs: {
      description: {
        story:
          '畳んだ行き先は、メニューのボタンを押すと縦に並べて出します。ここではスマートフォンの画面の代わりの枠の中で、下から出すシートに固定しています。',
      },
    },
  },
  args: { menuSide: 'bottom' },
  render: (args) => (
    <PhoneFrame>
      {(frame) => (
        <div className="-mx-5 -mt-8">
          <Navbar {...args} brand={brand} portalContainer={frame}>
            {links()}
          </Navbar>
        </div>
      )}
    </PhoneFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'メニュー' }));
    const menu = await canvas.findByRole('dialog', { name: 'メニュー' });
    await expect(within(menu).getByRole('link', { name: 'Works' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="w-[375px]">
      <Navbar {...args} brand={brand} menuSide="right">
        {links('Blog')}
      </Navbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(canvasElement.querySelector('header')).toBeInTheDocument();

    // 狭い帯では行き先は隠れ、メニューのボタンだけが読まれる
    await expect(canvas.queryByRole('navigation', { name: 'メイン' })).toBeNull();
    const button = canvas.getByRole('button', { name: 'メニュー' });

    // 開くと、行き先が「メイン」の nav に並び、いまいるページに aria-current が付く
    await userEvent.click(button);
    const menu = await body.findByRole('dialog', { name: 'メニュー' });
    const nav = within(menu).getByRole('navigation', { name: 'メイン' });
    await expect(within(nav).getByRole('list')).toBeInTheDocument();
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    await expect(within(nav).getAllByRole('link')).toHaveLength(3);
    await expect(within(nav).getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    // 行き先を押すと閉じる
    await userEvent.click(within(nav).getByRole('link', { name: 'About' }));
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'メニュー' })).toBeNull());
  },
};

function ControlledMenuDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-[375px] flex-col gap-4">
      <Navbar brand={brand} menuSide="right" menuOpen={open} onMenuOpenChange={setOpen}>
        {links()}
      </Navbar>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          外から開く
        </Button>
        <span data-testid="menu-state">{open ? '開いている' : '閉じている'}</span>
      </div>
    </div>
  );
}

export const ControlledMenu: Story = {
  name: 'メニューを外から開閉する',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`menuOpen` と `onMenuOpenChange` で、メニューの開閉を外から決めます。ページを移ったあとの処理で閉じるときなどに使います。',
      },
      source: sourceCode(`
        const [open, setOpen] = useState(false);

        <Navbar brand={brand} menuOpen={open} onMenuOpenChange={setOpen}>
          …
        </Navbar>
      `),
    },
  },
  render: () => <ControlledMenuDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    // 外から開ける
    await userEvent.click(canvas.getByRole('button', { name: '外から開く' }));
    const menu = await body.findByRole('dialog', { name: 'メニュー' });
    await expect(canvas.getByTestId('menu-state')).toHaveTextContent('開いている');
    // 行き先を押して閉じると、onMenuOpenChange に閉じる値が届く
    await userEvent.click(within(menu).getByRole('link', { name: 'About' }));
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'メニュー' })).toBeNull());
    await expect(canvas.getByTestId('menu-state')).toHaveTextContent('閉じている');
  },
};


export const HideOnScroll: Story = {
  name: 'スクロールで隠す',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`stickyBehavior="hide-on-scroll"` で、下へスクロールすると帯を隠し、上へ戻すと出します。`stickyBackdrop="transparent-until-scroll"` と合わせると、いちばん上では透けます。',
      },
    },
  },
  render: () => (
    <div data-testid="scroller" className="h-60 w-[800px] overflow-y-auto border border-line bg-bg">
      <Navbar
        sticky
        stickyBehavior="hide-on-scroll"
        stickyBackdrop="transparent-until-scroll"
        brand={brand}
      >
        {links()}
      </Navbar>
      <div className="h-[1600px]" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = canvas.getByTestId('scroller');
    const header = canvasElement.querySelector('header')!;
    const scrollTo = (top: number) => {
      scroller.scrollTop = top;
      scroller.dispatchEvent(new Event('scroll'));
    };

    // いちばん上では透かし、隠さない
    await expect(header).not.toHaveAttribute('data-scrolled');
    await expect(header).not.toHaveAttribute('data-hidden');

    // 帯の高さより下へ送ると隠れ、面は不透明になる
    scrollTo(400);
    await waitFor(() => expect(header).toHaveAttribute('data-hidden'));
    await expect(header).toHaveAttribute('data-scrolled');

    // 上へ戻すと、止まったあとに出る
    scrollTo(300);
    await waitFor(() => expect(header).not.toHaveAttribute('data-hidden'));
    await waitFor(() => expect(header).not.toHaveAttribute('data-following'));

    // 隠したあとでも、帯の中にフォーカスが入ったら出し、フォーカスがあるあいだは隠さない
    scrollTo(800);
    await waitFor(() => expect(header).toHaveAttribute('data-hidden'));
    canvas.getAllByRole('link')[0].focus();
    await waitFor(() => expect(header).not.toHaveAttribute('data-hidden'));
    scrollTo(1200);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(header).not.toHaveAttribute('data-hidden');
  },
};
