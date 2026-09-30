import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type ReactNode, useState } from 'react';

import { Button } from '../button/Button';
import { Text } from '../text/Text';
import {
  AccountItems,
  DemoNavbar,
  TournamentItems,
  TournamentSwitcher,
} from '../../stories/sidebar-story-parts';
import { Sidebar, type SidebarProps } from './Sidebar';
import { SidebarLayout, type SidebarLayoutProps } from './SidebarLayout';

const colors = ['primary', 'secondary', 'neutral'] as const;

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'ページの横に並ぶ列です。SidebarLayout の中に置き、行（SidebarItem）を並べます。入れ子は、行の中に SidebarItem を入れます。',
          '',
          '- SidebarLayout の `placement`: `under-header`（既定）は帯を端から端まで通し、その下で列と本文を並べます。`full-height` は列を上から下まで通し、帯は本文の側に入ります。`header` は省けます。そのときは、狭い画面で列を開く SidebarTrigger を本文などに置いてください。',
          '- 開け閉めのボタンは SidebarTrigger です。帯の中などに置きます。`collapseButton` を付けると、列の下端にも畳む・開くボタンが出ます。',
          '- 行は SidebarSection で節に分けられます（節は何個でも並べられます）。節の題は、列の中身と一緒にスクロールし、Drawer の中にも出ます。畳んだ列では題を出さず、節のあいだに線を引きます。',
          '- 畳むと、アイコンだけが残ります。入れ子のある行は、載せる（か押す）と横に面が出て、入れ子を開きます。畳んだ列の行にはアイコンを置いてください。',
          '- 置かれた面の幅が 48rem より狭いときは、列をやめて Drawer に切り替わります（Drawer の題は `drawerLabel`）。出す向きは `narrowSide`（`left` が既定、`right`・`bottom`、指の画面だけ下から出す `auto`）です。',
          '- `color` は、いまいる行の色です。指定しないときはグレーです。',
          '- 入れ子に足す操作（グループの作成など）は、入れ子の末尾に「作成」の行（行き先を持たない SidebarItem）として置きます。`target="_blank"` の行には、右上向きの矢印が付き、読み上げに「新しいタブで開きます」が入ります。',
          '- 行が縦に収まらないときは、列の中がスクロールします。',
          '- `header`・`footer` に置いた行は、列の上・下に固定され、スクロールしません（大会やワークスペースの切り替え、アカウント、設定など）。スクロールする行とのあいだには区切り線を引きます（`hideDivider` で消せます）。`headerVariant`・`footerVariant` を `filled` にすると、上・下それぞれに淡い面を敷けます。',
          '- `variant="muted"` にすると、列の地が淡いグレーになります。本文との境の線は、どちらの地でも引きます。',
          '- 行の札（件数・点）は SidebarItem の `badge` です。`{ count: 3 }` で数字の札（100 以上は「99+」、上限は `max`）、`{ shape: \'dot\' }` で点、色は `color`（既定はグレー）です。畳んだ列では、アイコンの右上に重ねます。点にするときは Sidebar の `collapsedItemBadgeShape="dot"`、行ごとに変えるときは `collapsedShape` です。',
          '- 行ごとの操作は SidebarItem の `menu` に MenuItem を並べます。行の右端に ︙ のボタンが付きます。ふだんの濃さは Sidebar の `itemMenuIndicator`（既定の `subtle` は半分の濃さで、載せると濃く）です。',
          '- SidebarSection に `collapsible` を付けると、題を押して節を畳めます。印の濃さは Sidebar の `sectionIndicator` です。',
          '- SidebarLayout に `resizable` を付けると、列の端をつかんで幅を変えられます（`minWidth`〜`maxWidth`。キーボードでは ← →、ダブルクリックではじめの幅に戻る）。いちばん狭い幅よりさらに細くすると畳み、畳んだ列からは右へ引き出すと開きます（`collapseOnResize={false}` で止められます）。`resizeHandle="grip"` で、つまみをいつも見せます。',
          '- 狭い画面の Drawer の開閉を外から決めるときは、SidebarLayout の `drawerOpen` と `onDrawerOpenChange` を使います（ページを移ったあとに閉じるときなど）。',
          '- `narrowPresentation="menu"` にすると、狭い画面では Menu と同じく画面の下からシートを出し、入れ子の行を押すと中身が横に滑って入れ替わります。入れ子に入ったときの題は SidebarItem の `submenuTitle`（既定は行の文字）で、畳んだ列の横に出す面の見出しにも使います。',
        ].join('\n'),
      },
    },
  },
  args: { drawerLabel: 'メニュー', color: 'neutral', collapseButton: false },
  argTypes: {
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    narrowSide: {
      control: 'inline-radio',
      options: ['left', 'right', 'bottom', 'auto'],
      table: { defaultValue: { summary: "'left'" } },
    },
    children: { control: false },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Content({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-6">
      <h2 className="text-xl font-heading">Aグループ</h2>
      <Text variant="muted">第1試合　ノヴァ隊 対 月影ギルド</Text>
      <Text variant="muted">第2試合　ハーヴェスト 対 アイアンフォックス</Text>
      {children}
    </div>
  );
}

function Frame({
  height = 520,
  width,
  children,
  ...props
}: Omit<SidebarLayoutProps, 'sidebar' | 'children'> & {
  sidebar: ReactNode;
  height?: number;
  width?: number;
  children?: ReactNode;
}) {
  return (
    <div style={{ height, width }} className="border border-line">
      <SidebarLayout header={<DemoNavbar />} {...props}>
        <Content>{children}</Content>
      </SidebarLayout>
    </div>
  );
}

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <Frame
      sidebar={
        <Sidebar {...args}>
          <TournamentItems />
        </Sidebar>
      }
    />
  ),
};

export const Placement: Story = {
  name: '置き方',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-4 p-4">
      {(['under-header', 'full-height'] as const).map((placement) => (
        <div key={placement} className="flex flex-col gap-2">
          <Text variant="muted">
            {placement === 'under-header' ? 'under-header（既定）' : 'full-height'}
          </Text>
          <Frame
            placement={placement}
            width={880}
            height={340}
            sidebar={
              <Sidebar {...args}>
                <TournamentItems />
              </Sidebar>
            }
          />
        </div>
      ))}
    </div>
  ),
};

export const Collapsed: Story = {
  name: '畳んだ列',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="p-6">
      <Frame
        defaultCollapsed
        width={880}
        height={400}
        sidebar={
          <Sidebar {...args} collapseButton>
            <TournamentItems />
          </Sidebar>
        }
      />
    </div>
  ),
};

export const Colors: Story = {
  name: '色',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-3 p-4">
      {colors.map((color) => (
        <div key={color} className="flex flex-col gap-1">
          <Text variant="muted">{color}</Text>
          <div style={{ height: 240, width: 880 }} className="border border-line">
            <SidebarLayout
              sidebar={
                <Sidebar {...args} color={color}>
                  <TournamentItems />
                </Sidebar>
              }
            >
              <Content />
            </SidebarLayout>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** 広い骨組み（800px）の左の一部だけを見せる。SidebarLayout は置かれた面が 48rem より狭いと Drawer にするため */
function Cropped({
  label,
  width = 360,
  height = 400,
  ...props
}: Omit<SidebarLayoutProps, 'children'> & { label: string; width?: number; height?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Text variant="muted">{label}</Text>
      <div style={{ width, height }} className="overflow-hidden border border-line">
        <div style={{ width: 800, height }}>
          <SidebarLayout header={<DemoNavbar />} {...props}>
            <Content />
          </SidebarLayout>
        </div>
      </div>
    </div>
  );
}

function DashboardSidebar(props: Partial<SidebarProps>) {
  return (
    <Sidebar header={<TournamentSwitcher />} footer={<AccountItems />} {...props}>
      <TournamentItems dashboard />
    </Sidebar>
  );
}

export const Dashboard: Story = {
  name: '管理画面（上下の固定・件数・行ごとの操作）',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      <Cropped label="開いた列" height={640} resizable sidebar={<DashboardSidebar />} />
      <Cropped
        label="畳んだ列"
        width={200}
        height={640}
        defaultCollapsed
        sidebar={<DashboardSidebar />}
      />
      <Cropped
        label='畳んだ列（collapsedItemBadgeShape="dot"）'
        width={200}
        height={640}
        defaultCollapsed
        sidebar={<DashboardSidebar collapsedItemBadgeShape="dot" />}
      />
    </div>
  ),
};

export const Surfaces: Story = {
  name: '列の地と上下の面',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      {(
        [
          ['plain（既定）', {}],
          ['muted', { variant: 'muted' }],
          ['hideDivider', { hideDivider: true }],
          ['headerVariant="filled"', { headerVariant: 'filled' }],
          [
            'muted・上下の面',
            { variant: 'muted', headerVariant: 'filled', footerVariant: 'filled' },
          ],
        ] as const
      ).map(([label, props]) => (
        <Cropped
          key={label}
          label={label}
          width={340}
          height={380}
          sidebar={<DashboardSidebar {...props} />}
        />
      ))}
    </div>
  ),
};

export const Indicators: Story = {
  name: '行ごとの操作と節の印の濃さ',
  tags: ['visual'],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      {(['subtle', 'always', 'hover'] as const).map((indicator) => (
        <Cropped
          key={indicator}
          label={indicator === 'subtle' ? 'subtle（既定）' : indicator}
          width={340}
          height={600}
          sidebar={<DashboardSidebar itemMenuIndicator={indicator} sectionIndicator={indicator} />}
        />
      ))}
    </div>
  ),
};

export const Resize: Story = {
  name: '幅を変える',
  parameters: { controls: { disable: true } },
  render: () => <Frame resizable resizeHandle="grip" sidebar={<DashboardSidebar />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: '列の幅' });
    const before = Number(handle.getAttribute('aria-valuenow'));
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', String(before + 16));
    await userEvent.keyboard('{Home}');
    await expect(handle).toHaveAttribute('aria-valuenow', '200');
    // いちばん狭い幅で ← を押すと畳み、畳んだ列で → を押すと開く
    const nav = canvas.getByRole('navigation', { name: 'メニュー' });
    await userEvent.keyboard('{ArrowLeft}');
    await expect(nav).toHaveAttribute('data-collapsed');
    await userEvent.keyboard('{ArrowRight}');
    await expect(nav).not.toHaveAttribute('data-collapsed');
    // 行ごとの操作のボタンは、行の名前と合わせて読む
    await expect(
      canvas.getByRole('button', { name: 'Aグループ その他の操作' })
    ).toBeInTheDocument();
    // 畳める節は、題が開け閉めのボタンになる
    const section = canvas.getByRole('button', { name: '関連情報' });
    await expect(section).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(section);
    await expect(section).toHaveAttribute('aria-expanded', 'false');
  },
};

export const NarrowMenu: Story = {
  name: '狭い画面（Menu のシート）',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="p-6">
      <Frame width={400} height={560} sidebar={<DashboardSidebar narrowPresentation="menu" />} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'メニューを開閉する' }));
    const body = within(canvasElement.ownerDocument.body);
    const menu = await body.findByRole('menu');
    // 入れ子の行を押すと、同じシートの中で入れ子の中身に入れ替わる
    await userEvent.click(within(menu).getByRole('menuitem', { name: /ステージ/ }));
    await expect(await body.findByRole('menuitem', { name: /予選リーグ/ })).toBeVisible();
  },
};

export const Narrow: Story = {
  name: '狭い画面（Drawer）',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="p-6">
      <Frame
        width={400}
        height={560}
        sidebar={
          <Sidebar {...args}>
            <TournamentItems />
          </Sidebar>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'メニューを開閉する' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const drawer = await body.findByRole('dialog', { name: 'メニュー' });
    await expect(within(drawer).getByRole('link', { name: 'Aグループ' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

function ControlledDrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Frame
      width={400}
      height={560}
      drawerOpen={open}
      onDrawerOpenChange={setOpen}
      sidebar={
        <Sidebar>
          <TournamentItems />
        </Sidebar>
      }
    >
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          外から開く
        </Button>
        <span data-testid="drawer-state">{open ? '開いている' : '閉じている'}</span>
      </div>
    </Frame>
  );
}

export const ControlledDrawer: Story = {
  name: '狭い画面の Drawer を外から開閉する',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'SidebarLayout の `drawerOpen` と `onDrawerOpenChange` で、狭い画面の Drawer の開閉を外から決めます。ページを移ったあとの処理で閉じるときなどに使います。',
      },
    },
  },
  render: () => (
    <div className="p-6">
      <ControlledDrawerDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '外から開く' }));
    await body.findByRole('dialog', { name: 'メニュー' });
    await expect(canvas.getByTestId('drawer-state')).toHaveTextContent('開いている');
    // 開閉のボタンも開いた状態を読む（裏は止まっているので hidden で探す）
    await expect(
      canvas.getByRole('button', { name: 'メニューを開閉する', hidden: true })
    ).toHaveAttribute('aria-expanded', 'true');
    // Esc で閉じると、onDrawerOpenChange に閉じる値が届く
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'メニュー' })).toBeNull());
    await expect(canvas.getByTestId('drawer-state')).toHaveTextContent('閉じている');
  },
};

export const Accessibility: Story = {
  name: '読み上げとキーボード',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Frame
      sidebar={
        <Sidebar {...args}>
          <TournamentItems />
        </Sidebar>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'メニュー' });
    // いまいる行は aria-current="page"
    await expect(within(nav).getByRole('link', { name: 'Aグループ' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    // 節（SidebarSection）の題は、列の中身にある。畳んだ列にすると、列の一覧に題が名前として残る
    await expect(within(nav).getByRole('list', { name: '試合管理' })).toBeInTheDocument();
    await expect(within(nav).getByRole('list', { name: '関連情報' })).toBeInTheDocument();
    // 新しいタブで開く行は、読み上げに「新しいタブで開きます」が入り、rel が付く
    const rules = within(nav).getByRole('link', { name: /大会ルール.*新しいタブで開きます/ });
    await expect(rules).toHaveAttribute('rel', 'noopener noreferrer');
    // 入れ子の末尾の「作成」は、行き先を持たないボタン
    await expect(within(nav).getAllByRole('button', { name: '作成' }).length).toBeGreaterThan(0);
    // 入れ子のある行は、開け閉めするボタン
    const league = within(nav).getByRole('button', { name: '決勝リーグ' });
    await expect(league).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(league);
    await expect(league).toHaveAttribute('aria-expanded', 'true');
    // ボタンで畳むと、アイコンだけになる（行の名前は残る）
    const trigger = canvas.getByRole('button', { name: 'メニューを開閉する' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(within(nav).getByRole('link', { name: '参加チーム' })).toBeVisible();
  },
};
