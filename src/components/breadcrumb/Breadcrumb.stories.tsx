import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const path = [
  { label: 'ホーム', href: '#home' },
  { label: '作品', href: '#works' },
  { label: 'デザインシステム', href: '#ui' },
];

// 見本では移らない（押しても Storybook のページを動かさない）
const items = (depth = path.length) =>
  path.slice(0, depth).map((page, index) => (
    <BreadcrumbItem
      key={page.label}
      href={page.href}
      current={index === depth - 1}
      onClick={(event) => event.preventDefault()}
    >
      {page.label}
    </BreadcrumbItem>
  ));

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'いまいるページまでの道を並べる案内です。ページの本文の上に置きます。',
          '',
          '- 道は `BreadcrumbItem` を、上の階層から順に並べます。最後の項目に `current` を付けると、リンクにせず「現在のページ」として読まれます。',
          '- `accessibleName` は並び（nav）の読み上げの名前です（既定は「現在の場所」）。同じページにパンくずを 2 つ以上置くときは、それぞれ別の名前にします。',
          '- `separator` は項目のあいだの区切りの印です。`caret`（既定）は右向きの山、`slash` は「/」です。ほかの形にするときは、文字やアイコンをそのまま渡します。読み上げからは外れます。',
          '- `variant` は行き先の見た目です。`underline`（既定）は文章の中の文字のリンクと同じ淡い下線、`hover-underline` は hover のときだけ下線が出る形、`pill` は Navbar の行き先と同じ平らな pill です。',
          '- 入りきらないときは折り返します。',
          '- Next.js の `Link` は、`BreadcrumbItem` の `render` に渡します。',
        ].join('\n'),
      },
    },
  },
  args: { accessibleName: '現在の場所', separator: 'caret', variant: 'underline' },
  argTypes: {
    separator: {
      control: 'inline-radio',
      options: ['caret', 'slash'],
      table: { defaultValue: { summary: "'caret'" } },
    },
    variant: {
      control: 'inline-radio',
      options: ['underline', 'hover-underline', 'pill'],
      table: { defaultValue: { summary: "'underline'" } },
    },
    children: { control: false },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Breadcrumb>
          <BreadcrumbItem href="/">ホーム</BreadcrumbItem>
          <BreadcrumbItem href="/works">作品</BreadcrumbItem>
          <BreadcrumbItem current>デザインシステム</BreadcrumbItem>
        </Breadcrumb>
      `),
    },
  },
  render: (args) => <Breadcrumb {...args}>{items()}</Breadcrumb>,
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
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="breadcrumb-link"]',
      active: '[data-slot="breadcrumb-link"]',
      focusVisible: '[data-slot="breadcrumb-link"]',
    }),
  },
  render: (args) => (
    <Matrix
      rows={['行き先', 'いまいるページ']}
      columns={stateColumns}
      columnWidth="11rem"
      rowLabel={(row) => row}
      renderCell={(row) => (
        <Breadcrumb {...args}>
          <BreadcrumbItem href="#home" current={row === 'いまいるページ'}>
            ホーム
          </BreadcrumbItem>
        </Breadcrumb>
      )}
    />
  ),
};

const variants = ['underline', 'hover-underline', 'pill'] as const;

export const Variants: Story = {
  tags: ['visual'],
  name: '行き先の見た目',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="breadcrumb-link"]',
      active: '[data-slot="breadcrumb-link"]',
      focusVisible: '[data-slot="breadcrumb-link"]',
    }),
    docs: {
      description: {
        story: '`variant` で選びます。いまいるページ（右端）は、どの見た目でも本文の色の太字です。',
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={variants}
      columns={stateColumns}
      columnWidth="13rem"
      rowLabel={(variant) => variant}
      renderCell={(variant) => (
        <Breadcrumb {...args} variant={variant}>
          <BreadcrumbItem href="#works">作品</BreadcrumbItem>
          <BreadcrumbItem current>デザインシステム</BreadcrumbItem>
        </Breadcrumb>
      )}
    />
  ),
};

const separatorOptions = [
  ['caret', 'caret（既定）'],
  ['slash', 'slash'],
] as const;

export const Separators: Story = {
  tags: ['visual'],
  name: '区切りの印',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`separator` で選びます。用意してあるのは `caret`（既定）と `slash` です。ほかの形にするときは、文字やアイコンをそのまま渡します。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {separatorOptions.map(([separator, label]) => (
        <div key={separator} className="flex items-center gap-6">
          <span className="w-32 text-xs font-bold text-fg-subtle">{label}</span>
          <Breadcrumb {...args} separator={separator}>
            {items()}
          </Breadcrumb>
        </div>
      ))}
      <div className="flex items-center gap-6">
        <span className="w-32 text-xs font-bold text-fg-subtle">任意の印（ReactNode）</span>
        <Breadcrumb {...args} separator="・">
          {items()}
        </Breadcrumb>
      </div>
    </div>
  ),
};

export const Depths: Story = {
  tags: ['visual'],
  name: '段の数',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '1 段だけのときは、いまいるページだけを置きます。入りきらないときは折り返します（ここでは幅 260px の枠に入れています）。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Breadcrumb {...args}>{items(1)}</Breadcrumb>
      <Breadcrumb {...args}>{items(2)}</Breadcrumb>
      <Breadcrumb {...args}>{items()}</Breadcrumb>
      <div className="w-[260px] border border-line p-3">
        <Breadcrumb {...args}>
          {items(2)}
          <BreadcrumbItem current>パンくずリストの長い題が入りきらないとき</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <DensityPair>
      <Breadcrumb {...args}>{items()}</Breadcrumb>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: (args) => <Breadcrumb {...args}>{items()}</Breadcrumb>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // nav の名前は label。中身は ol の並び
    const nav = canvas.getByRole('navigation', { name: '現在の場所' });
    await expect(within(nav).getAllByRole('listitem')).toHaveLength(3);

    // 上の階層はリンク、いまいるページはリンクにせず aria-current="page"
    await expect(within(nav).getAllByRole('link')).toHaveLength(2);
    await expect(within(nav).queryByRole('link', { name: 'デザインシステム' })).toBeNull();
    await expect(within(nav).getByText('デザインシステム')).toHaveAttribute('aria-current', 'page');

    // 区切りは読み上げから外す（リンクの名前にも入らない）
    const separators = nav.querySelectorAll('[data-slot="breadcrumb-separator"]');
    await expect(separators).toHaveLength(2);
    for (const separator of separators) {
      await expect(separator).toHaveAttribute('aria-hidden', 'true');
    }
    await expect(within(nav).getByRole('link', { name: '作品' })).toBeVisible();
  },
};
