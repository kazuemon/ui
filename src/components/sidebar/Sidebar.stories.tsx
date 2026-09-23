import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { type ReactNode } from 'react';

import { Text } from '../text/Text';
import { DemoNavbar, TournamentItems } from '../../stories/sidebar-story-parts';
import { Sidebar } from './Sidebar';
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
          '- SidebarLayout の `placement`: `below`（既定）は帯を動かさず、その下で列と本文を並べます。`full` は列を上から下まで通し、帯は本文の側に入ります。',
          '- 開け閉めのボタンは SidebarTrigger です。帯の中などに置きます。`collapseButton` を付けると、列の下端にも畳む・開くボタンが出ます。',
          '- 畳むと、アイコンだけが残ります。入れ子のある行は、載せる（か押す）と横に面が出て、入れ子を開きます。畳んだ列の行にはアイコンを置いてください。',
          '- 置かれた面の幅が 48rem より狭いときは、列をやめて Drawer に切り替わります。出す向きは `narrowSide`（`left` が既定、`right`・`bottom`、指の画面だけ下から出す `auto`）です。',
          '- `color` は、いまいる行の色です。指定しないときはグレーです。',
          '- 入れ子に足す操作（グループの作成など）は、入れ子の末尾に「作成」の行（行き先を持たない SidebarItem）として置きます。`target="_blank"` の行には、右上向きの矢印が付き、読み上げに「新しいタブで開きます」が入ります。',
          '- 行が縦に収まらないときは、列の中がスクロールします。',
        ].join('\n'),
      },
    },
  },
  args: { title: '試合管理', color: 'neutral', collapseButton: false },
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
  ...props
}: Omit<SidebarLayoutProps, 'sidebar' | 'children'> & {
  sidebar: ReactNode;
  height?: number;
  width?: number;
}) {
  return (
    <div style={{ height, width }} className="border border-line">
      <SidebarLayout header={<DemoNavbar />} {...props}>
        <Content />
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
      {(['below', 'full'] as const).map((placement) => (
        <div key={placement} className="flex flex-col gap-2">
          <Text variant="muted">{placement === 'below' ? 'below（既定）' : 'full'}</Text>
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
    const drawer = await body.findByRole('dialog', { name: '試合管理' });
    await expect(within(drawer).getByRole('link', { name: 'Aグループ' })).toHaveAttribute(
      'aria-current',
      'page'
    );
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
    const nav = canvas.getByRole('navigation', { name: '試合管理' });
    // いまいる行は aria-current="page"
    await expect(within(nav).getByRole('link', { name: 'Aグループ' })).toHaveAttribute(
      'aria-current',
      'page'
    );
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
