import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Navbar, NavbarLink, NavbarMenuList } from './Navbar';
import { landscape } from '../../../design/stories/samples/images';
import { DensityPair, Matrix, PhoneFrame } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import { Button } from '../button/Button';

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
const links = (current = 'Works') =>
  pages.map((page) => (
    <NavbarLink
      key={page.label}
      href={page.href}
      current={page.label === current}
      onClick={(event) => event.preventDefault()}
    >
      {page.label}
    </NavbarLink>
  ));

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
          '- 行き先は `NavbarLink` を並べます。いまいるページには `current` を付けます（読み上げでは「現在のページ」）。',
          '- `brand` には、トップへのリンクにしたロゴやサイトの名前を渡します。`actions` には、帯の右端に置くボタンなどを渡します。',
          '- 帯の幅が 768px より狭いときは、行き先をメニューのボタンに畳みます。畳むかどうかは画面の幅ではなく帯そのものの幅で決まるので、画面の一部に置いた帯も、置いた幅に合わせて畳まれます。押すと、行き先を縦に並べた面が開きます。行き先を押すと面は閉じます。',
          '- メニューの面は、指で操作していて画面が狭いときは下から出すシート、それ以外は右から出すパネルです。`menuSide` で固定できます。',
          '- `size` は中身の幅の上限で、Container と同じです。本文の Container と同じ値にすると、端がそろいます。',
          '- いまいるページの印は `currentIndicator` で選びます。`text`（既定）は文字を濃く太く、`neutral` はグレーの面、`primary` は淡い青の面、`underline` は文字の下に青い線です。',
          '- `sticky` を付けると、スクロールしても画面の上に貼り付きます（既定は付けません）。下の内容との境目は `stickyEdge`（`line` 既定・`shadow`）、面は `stickyBackdrop`（`solid` 既定・`blur`）で選びます。',
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
    label: 'メイン',
    menuLabel: 'メニュー',
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
      options: ['solid', 'blur'],
      table: { defaultValue: { summary: "'solid'" } },
    },
    menuSide: {
      control: 'inline-radio',
      options: ['auto', 'bottom', 'left', 'right'],
      table: { defaultValue: { summary: "'auto'" } },
    },
    brand: { control: false },
    actions: { control: false },
    children: { control: false },
    container: { control: false },
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
          <NavbarLink href="/works" current>Works</NavbarLink>
          <NavbarLink href="/blog">Blog</NavbarLink>
          <NavbarLink href="/about">About</NavbarLink>
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
            <NavbarMenuList label="メイン" currentIndicator={indicator}>
              {links()}
            </NavbarMenuList>
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
          <Navbar {...args} brand={brand} container={frame}>
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
