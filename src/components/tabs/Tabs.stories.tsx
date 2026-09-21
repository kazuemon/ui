import { FileTextIcon, GearSixIcon, HouseIcon, SparkleIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabsColor,
  type TabsIndicator,
  type TabsIndicatorMotion,
} from './Tabs';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import { Badge } from '../badge/Badge';

const colors: TabsColor[] = ['neutral', 'primary', 'secondary'];
const indicators: TabsIndicator[] = ['line', 'underline', 'subtle', 'segmented', 'text'];

const panelClass = 'text-(length:--text-control) leading-(--leading-control) text-fg-muted';

/** 見本のタブ。3 つの見出しと中身 */
function Sample({
  color,
  indicator,
  indicatorMotion,
  disabled = false,
}: {
  color?: TabsColor;
  indicator?: TabsIndicator;
  indicatorMotion?: TabsIndicatorMotion;
  disabled?: boolean;
}) {
  return (
    <Tabs
      color={color}
      indicator={indicator}
      indicatorMotion={indicatorMotion}
      defaultValue="overview"
    >
      <TabList aria-label="プロフィール">
        <Tab value="overview">概要</Tab>
        <Tab value="works">作品</Tab>
        <Tab value="blog" disabled={disabled}>
          ブログ
        </Tab>
      </TabList>
      <TabPanel value="overview" className={panelClass}>
        かずえもんの概要です。
      </TabPanel>
      <TabPanel value="works" className={panelClass}>
        作ったものの一覧です。
      </TabPanel>
      <TabPanel value="blog" className={panelClass}>
        書いた記事の一覧です。
      </TabPanel>
    </Tabs>
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  subcomponents: { TabList, Tab, TabPanel },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '同じ場所に置く中身を、見出し（タブ）で切り替えます。選んだタブの中身だけを出します。',
          '',
          '- `Tabs` の中に、`Tab` を並べた `TabList` と、`Tab` と同じ `value` の `TabPanel` を置きます。',
          '- はじめに選ぶタブは `defaultValue` で渡します。外で持つときは `value` と `onValueChange` を使います。',
          '- `color` は選んだタブの印とフォーカスの線の色です。指定しないときはグレー（`neutral`）で、`primary`・`secondary` を選べます。',
          '- `indicator` は選んだタブの印です。既定は `line`（下の線＋並び全体の下の境界線）で、`underline`（下の線だけ）・`subtle`（部品の色の淡い面の pill）・`segmented`（溝と白いつまみ）・`text`（印なし、文字の色だけ）を選べます。',
          '- `indicatorMotion` は選んだタブが変わったときの印の動きです。既定は `slide`（滑って移る）で、`none`（すぐ切り替える）を選べます。',
          '- `orientation` は並べる向きです。既定は `horizontal`（横に並べ、中身は下）で、`vertical`（縦に積み、中身は右）を選べます。縦のときは上下の矢印キーで移ります。',
          '- キーボードでは、Tab で並びに入り、左右の矢印キーでタブを移ります。Enter か Space で選びます。`activateOnFocus` を付けると、矢印キーで移ったタブをすぐ選びます。',
          '- 並びが入り切らない幅では、横にスクロールします。続きがある端には影が出ます。',
          '- `Tab` の `icon` に見出しの前のアイコンを、見出しの後ろに `Badge`（件数）を置けます。',
          '- 押せないタブは `disabled` にします。矢印キーでは止まり、読み上げで「利用不可」と分かりますが、選べません。',
          '- ページを移るタブにするときは、`Tab` の `render` にリンク（Next.js の `Link` など）を渡し、いまのページに合わせて `value` を渡します。',
        ].join('\n'),
      },
    },
  },
  args: { color: 'neutral', indicator: 'line', indicatorMotion: 'slide' },
  argTypes: {
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    indicator: {
      control: 'inline-radio',
      options: indicators,
      table: { defaultValue: { summary: "'line'" } },
    },
    indicatorMotion: {
      control: 'inline-radio',
      options: ['slide', 'none'],
      table: { defaultValue: { summary: "'slide'" } },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: "'horizontal'" } },
    },
    children: { control: false },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Tabs defaultValue="overview">
          <TabList aria-label="プロフィール">
            <Tab value="overview">概要</Tab>
            <Tab value="works">作品</Tab>
            <Tab value="blog">ブログ</Tab>
          </TabList>
          <TabPanel value="overview">…</TabPanel>
          <TabPanel value="works">…</TabPanel>
          <TabPanel value="blog">…</TabPanel>
        </Tabs>
      `),
    },
  },
  render: (args) => (
    <Sample color={args.color} indicator={args.indicator} indicatorMotion={args.indicatorMotion} />
  ),
};

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover（作品）・押せない（ブログ）', state: 'hover' },
  { label: '押下（作品）', state: 'active' },
  { label: 'フォーカス（概要）', state: 'focus' },
];

// 2 つ目のタブ（作品）に hover と押下を、1 つ目（選んでいる概要）にフォーカスを当てる
const secondTab = 'button[data-slot="tab"]:nth-of-type(2)';
const firstTab = 'button[data-slot="tab"]:nth-of-type(1)';

export const States: Story = {
  tags: ['visual'],
  name: '色と状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: secondTab, active: secondTab, focusVisible: firstTab }),
  },
  render: () => (
    <Matrix
      rows={colors}
      columns={stateColumns}
      columnWidth="15rem"
      rowLabel={(color) => color}
      renderCell={(color, column) => <Sample color={color} disabled={column.state === 'hover'} />}
    />
  ),
};

const indicatorColorColumns: (MatrixColumn & { color: TabsColor })[] = colors.map((color) => ({
  label: color,
  color,
}));

export const Indicators: Story = {
  tags: ['visual'],
  name: '選んだタブの印',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '`indicator` で選びます。既定は `line`（下の線＋並び全体の下の境界線）です。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={indicators}
      columns={indicatorColorColumns}
      columnWidth="15rem"
      rowLabel={(indicator) => indicator}
      renderCell={(indicator, column) => <Sample indicator={indicator} color={column.color} />}
    />
  ),
};

export const WithIcons: Story = {
  tags: ['visual'],
  name: 'アイコンと件数',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      source: sourceCode(`
        <Tab value="home" icon={<HouseIcon />}>ホーム</Tab>
        <Tab value="posts" icon={<FileTextIcon />}>
          記事 <Badge count={12} label={(n) => \`（\${n} 件）\`} />
        </Tab>
      `),
    },
  },
  render: (args) => (
    <Tabs color={args.color} defaultValue="home">
      <TabList aria-label="ダッシュボード">
        <Tab value="home" icon={<HouseIcon />}>
          ホーム
        </Tab>
        <Tab value="posts" icon={<FileTextIcon />}>
          記事 <Badge count={12} accessibleName={(n) => `（${n} 件）`} />
        </Tab>
        <Tab value="new" icon={<SparkleIcon />}>
          新着 <Badge color="danger" accessibleName="（新着あり）" />
        </Tab>
        <Tab value="settings" icon={<GearSixIcon />} disabled>
          設定
        </Tab>
      </TabList>
    </Tabs>
  ),
};

const manyTabs = ['概要', '作品', 'ブログ', 'スライド', '登壇', '経歴', 'リンク', 'お問い合わせ'];

export const Overflow: Story = {
  tags: ['visual'],
  name: '入り切らないとき',
  parameters: {
    controls: { include: ['color'] },
    docs: {
      description: {
        story:
          '並びが入り切らない幅では、横にスクロールします。続きがある端に内側の影が出て、並びにマウスを載せるとつまみが出ます。キーボードで移ると、フォーカスしたタブが見える位置までスクロールします。はじめに選んでおいたタブが見えている範囲の外にあるときも、開いた時点でその位置までスクロールします。',
      },
    },
  },
  render: (args) => (
    <div className="w-[320px] max-w-full" data-density="coarse">
      <Tabs color={args.color} defaultValue="お問い合わせ">
        <TabList aria-label="プロフィール">
          {manyTabs.map((label) => (
            <Tab key={label} value={label}>
              {label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  ),
  play: async ({ canvas }) => {
    // はじめに選んでおいた、見えている範囲の外のタブが見えるまでスクロールしている
    const active = canvas.getByRole('tab', { name: 'お問い合わせ' });
    await waitFor(() => expect(active.getBoundingClientRect().right).toBeGreaterThan(0));
  },
};

export const Vertical: Story = {
  name: '縦向き',
  parameters: {
    controls: { include: ['color', 'indicator'] },
    docs: {
      description: {
        story:
          '`orientation="vertical"` にすると、タブを縦に積み、中身を右に置きます。選んだタブの印は縦の棒になり、`subtle`・`segmented` ではタブ全体の塗りになります。上下の矢印キーでタブを移ります。',
      },
      source: sourceCode(`
        <Tabs orientation="vertical" defaultValue="overview">
          <TabList aria-label="プロフィール">
            <Tab value="overview">概要</Tab>
            <Tab value="works">作品</Tab>
            <Tab value="blog">ブログ</Tab>
          </TabList>
          <TabPanel value="overview">…</TabPanel>
          <TabPanel value="works">…</TabPanel>
          <TabPanel value="blog">…</TabPanel>
        </Tabs>
      `),
    },
  },
  render: (args) => (
    <Tabs orientation="vertical" color={args.color} indicator={args.indicator} defaultValue="works">
      <TabList aria-label="プロフィール">
        <Tab value="overview">概要</Tab>
        <Tab value="works">作品</Tab>
        <Tab value="blog">ブログ</Tab>
        <Tab value="contact">お問い合わせ</Tab>
      </TabList>
      <TabPanel value="overview" className={panelClass}>
        かずえもんの概要です。
      </TabPanel>
      <TabPanel value="works" className={panelClass}>
        作ったものの一覧です。
      </TabPanel>
      <TabPanel value="blog" className={panelClass}>
        書いた記事の一覧です。
      </TabPanel>
      <TabPanel value="contact" className={panelClass}>
        連絡先です。
      </TabPanel>
    </Tabs>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { include: ['color'] } },
  render: (args) => (
    <DensityPair>
      <Sample color={args.color} />
    </DensityPair>
  ),
};

export const Links: Story = {
  name: 'ページを移るタブ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`render` にリンクを渡すと、タブがリンクになります。選んでいるタブは、いまのページのパスを `value` に渡して決めます。中身はページが描くので、`TabPanel` は置きません。',
      },
      source: sourceCode(`
        const pathname = usePathname();

        <Tabs value={pathname}>
          <TabList aria-label="設定">
            <Tab value="/settings" render={<Link href="/settings" />}>一般</Tab>
            <Tab value="/settings/profile" render={<Link href="/settings/profile" />}>
              プロフィール
            </Tab>
          </TabList>
        </Tabs>
      `),
    },
  },
  render: () => (
    <Tabs value="#profile">
      <TabList aria-label="設定">
        {/* 見本では移らない（押しても Storybook のページを動かさない） */}
        <Tab value="#general" render={<a href="#general" onClick={(e) => e.preventDefault()} />}>
          一般
        </Tab>
        <Tab value="#profile" render={<a href="#profile" onClick={(e) => e.preventDefault()} />}>
          プロフィール
        </Tab>
      </TabList>
    </Tabs>
  ),
};

// play: 矢印キーで移る・押せないタブは選べない・Enter で選ぶ・読み上げの役割
export const Keyboard: Story = {
  name: 'キーボードの確かめ',
  parameters: { controls: { disable: true } },
  render: () => <Sample disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist', { name: 'プロフィール' });
    const [overview, works, blog] = within(list).getAllByRole('tab');
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('かずえもんの概要です。');
    await expect(blog).toHaveAttribute('aria-disabled', 'true');

    // Tab で選んでいるタブに入る。並びの枠には止まらない
    await userEvent.tab();
    await expect(overview).toHaveFocus();

    // 右へ移る。既定では移っただけでは選ばない
    await userEvent.keyboard('{ArrowRight}');
    await expect(works).toHaveFocus();
    await expect(overview).toHaveAttribute('aria-selected', 'true');

    // 押せないタブ（ブログ）にも止まる（読み上げで「利用不可」と分かる）。選べない
    await userEvent.keyboard('{ArrowRight}');
    await expect(blog).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(blog).toHaveAttribute('aria-selected', 'false');

    // 端から先頭へ回る
    await userEvent.keyboard('{ArrowRight}');
    await expect(overview).toHaveFocus();

    // 左へ戻って回り、押せないタブを越えて作品へ。Enter で選ぶ
    await userEvent.keyboard('{ArrowLeft}');
    await expect(blog).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(works).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(works).toHaveAttribute('aria-selected', 'true'));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('作ったものの一覧です。');
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', works.id);

    // Tab で中身へ移る
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  },
};
