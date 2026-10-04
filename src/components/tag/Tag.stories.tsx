import { CalendarBlankIcon, HashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, spyOn } from 'storybook/test';

import { Tag, type TagVariant } from './Tag';
import { Avatar } from '../avatar/Avatar';
import { Icon } from '../icon/Icon';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { pressColumns, statePseudo } from '../../stories/story-states';

const userColors = ['primary', 'secondary', 'neutral'] as const;
const statusColors = ['info', 'success', 'warning', 'danger'] as const;
const allColors = [...userColors, ...statusColors];
const variants: TagVariant[] = ['soft', 'outline', 'surface', 'solid', 'dashed'];
// 見本のリンクは移らない
const stay = (event: MouseEvent) => event.preventDefault();
// 見本の画像（外に取りに行かない）
const photo = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><rect width="160" height="160" fill="#7cc4f8"/><circle cx="80" cy="64" r="30" fill="#fff4cc"/><path d="M16 160c0-35 29-56 64-56s64 21 64 56Z" fill="#2f6b58"/></svg>'
)}`;

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'カテゴリや状態を表す小さな印です。',
          '',
          '- 色は、利用者が選ぶ `primary`・`secondary`・`neutral`（既定）と、状態を表す `info`・`success`・`warning`・`danger` があります。',
          '- 状態の色は、お知らせ（`Notice` の `soft`）と同じ面と文字の色です。',
          '- 形（`variant`）は `soft`（既定）・`outline`・`surface`・`solid`・`dashed` です。',
          '- `href` を渡すとリンク（a）になり、記事のタグからそのタグの一覧へ移れます。ルーターのリンクは `render` に渡し、`link` を書きます。',
          '- `icon`・`avatar` で、文字の前にアイコンや人の顔を置けます。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: { children: 'デザイン', color: 'neutral' },
  argTypes: {
    children: { control: 'text' },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    color: {
      control: 'inline-radio',
      options: [...userColors, ...statusColors],
      table: { defaultValue: { summary: "'neutral'" } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'inherit'],
      table: { defaultValue: { summary: "'sm'" } },
    },
    variant: {
      control: 'inline-radio',
      options: variants,
      table: { defaultValue: { summary: "'soft'" } },
    },
    iconColor: { control: 'inline-radio', options: allColors },
    icon: { control: false },
    avatar: { control: false },
    render: { control: false },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: { controls: { exclude: ['color'] } },
  render: (args) => (
    <Gallery>
      <Specimen label="利用者が選ぶ色">
        <div className="flex flex-wrap gap-2">
          {userColors.map((color) => (
            <Tag key={color} {...args} color={color}>
              {color}
            </Tag>
          ))}
        </div>
      </Specimen>
      <Specimen label="状態の色">
        <div className="flex flex-wrap gap-2">
          {statusColors.map((color) => (
            <Tag key={color} {...args} color={color}>
              {color}
            </Tag>
          ))}
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Variants: Story = {
  tags: ['visual'],
  name: '形',
  parameters: {
    controls: { exclude: ['variant', 'color'] },
    docs: {
      description: {
        story: [
          '- `soft`（既定）は淡い面に濃い文字です。',
          '- `outline` は面を塗らず、文字の色を薄めた縁を引きます。soft より軽く見せたいときに使います。',
          '- `surface` は白い面に、文字の色の縁を引きます。グレーの地の上でも白く抜けて、輪郭がはっきりします。',
          '- `solid` は濃い塗りに白い文字です。いちばん強く見せたいときに使います。',
          '- `dashed` は面を塗らない破線の縁で、「準備中」「予定」のような、まだないものを表します。',
          '- どの形も大きさは同じです。',
        ].join('\n'),
      },
    },
  },
  render: (args) => (
    <Gallery>
      {variants.map((variant) => (
        <Specimen key={variant} label={variant}>
          <div className="flex w-[240px] flex-wrap gap-2">
            {allColors.map((color) => (
              <Tag key={color} {...args} variant={variant} color={color}>
                {variant === 'dashed' ? '準備中' : color}
              </Tag>
            ))}
          </div>
        </Specimen>
      ))}
      <Specimen label="グレーの地の上">
        <div className="flex w-[240px] flex-wrap gap-2 rounded-control bg-field p-3">
          {variants.map((variant) => (
            <Tag key={variant} {...args} variant={variant} color="primary">
              {variant}
            </Tag>
          ))}
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Links: Story = {
  tags: ['visual'],
  name: 'リンク',
  args: { href: '#tags/design', onClick: stay },
  parameters: {
    controls: { exclude: ['variant'] },
    pseudo: statePseudo({
      hover: '[data-slot="tag"]',
      active: '[data-slot="tag"]',
      focusVisible: '[data-slot="tag"]',
    }),
    docs: {
      description: {
        story: [
          '`href` を渡すとリンク（a）になります。hover で文字の色を淡く敷いて下線を出し、押すと沈みます。キーボードで選んだときはフォーカスの線が出ます。',
          '',
          'Next.js の Link などのルーターのリンクは `render` に渡します。部品からはリンクか分からないので、`link` を書いて押せる見た目にします。',
          '',
          '```tsx',
          '<Tag render={<NextLink href="/tags/design" />} link>デザイン</Tag>',
          '```',
          '',
          '新しいタブで開く（`target="_blank"`）タグは、文字の後ろに ↗ が付きます。`newTabIcon` で付けるかを変えられます。',
        ].join('\n'),
      },
    },
  },
  render: (args) => (
    <Matrix
      rows={variants}
      columns={pressColumns.filter((column) => !column.disabled)}
      columnWidth="15rem"
      rowLabel={(variant) => variant}
      renderCell={(variant) => (
        <div className="flex gap-2">
          <Tag {...args} variant={variant} />
          <Tag {...args} variant={variant} color="primary" />
          <Tag
            {...args}
            variant={variant}
            color="primary"
            icon={<Icon icon={HashIcon} />}
            target="_blank"
          >
            新しいタブ
          </Tag>
        </div>
      )}
    />
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link', { name: 'デザイン' });
    await expect(links[0]).toHaveAttribute('href', '#tags/design');
    await expect(links[0]).toHaveAttribute('data-link');
  },
};

export const LinkResolution: Story = {
  name: 'リンクとして描くか',
  parameters: {
    docs: {
      description: {
        story:
          '`link` の既定は `href` があるかどうかです。`link={false}` にすると、`href` を渡していてもリンクにせず、ただのタグとして描きます。`link` を付けたのに `href` も `render` もないときは、開発中に警告が出ます。新しいタブで開くときは、そのことを読み上げに添えます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Tag {...args}>href なし</Tag>
      <Tag {...args} href="#tags/design" onClick={stay}>
        href あり
      </Tag>
      <Tag {...args} href="#tags/design" target="_blank" onClick={stay} link={false}>
        link=false
      </Tag>
      <Tag {...args} render={<a href="#tags/design" onClick={stay} />} link>
        render と link
      </Tag>
      <Tag {...args} href="https://example.com" target="_blank">
        新しいタブ
      </Tag>
      <Tag {...args} render={<a href="https://example.com" target="_blank" />} link>
        render で新しいタブ
      </Tag>
      <Tag {...args} href="https://example.com" target="_blank" newTabIcon={false}>
        矢印なし
      </Tag>
      <Tag {...args} href="#tags/design" onClick={stay} newTabIcon>
        同じタブで矢印
      </Tag>
      <Tag
        {...args}
        render={<a href="#tags/design" target="_blank" onClick={stay} />}
        link
        target="_self"
      >
        Tag の target が勝つ
      </Tag>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('href なし').closest('[data-slot="tag"]')?.tagName).toBe('SPAN');
    const withHref = canvas.getByRole('link', { name: 'href あり' });
    await expect(withHref).toHaveAttribute('data-link');
    // href と link={false}: span で描き、href・target・rel を付けず、読み上げの文も足さない
    const off = canvas.getByText('link=false').closest('[data-slot="tag"]');
    await expect(off?.tagName).toBe('SPAN');
    await expect(off).not.toHaveAttribute('href');
    await expect(off).not.toHaveAttribute('target');
    await expect(off).not.toHaveAttribute('rel');
    await expect(off).not.toHaveAttribute('data-link');
    await expect(off?.textContent).not.toContain('新しいタブで開きます');
    await expect(canvas.getByRole('link', { name: 'render と link' })).toHaveAttribute('data-link');
    const newTab = canvas.getByRole('link', { name: /^新しいタブ\s*（/ });
    await expect(newTab).toHaveAttribute('rel', 'noopener noreferrer');
    const renderNewTab = canvas.getByRole('link', { name: /^render で新しいタブ\s*（/ });
    await expect(renderNewTab).toHaveAttribute('target', '_blank');
    await expect(renderNewTab).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(canvas.getAllByRole('link')).toHaveLength(7);
    // ↗: 新しいタブで開くタグに付き（render の target も見る）、読み上げには入らない。newTabIcon で上書きできる
    const arrow = (element: Element | null | undefined) =>
      element?.querySelector('[data-slot="tag-new-tab-icon"]');
    await expect(arrow(newTab)).toHaveAttribute('aria-hidden', 'true');
    await expect(arrow(renderNewTab)).not.toBeNull();
    await expect(arrow(off)).toBeNull();
    await expect(arrow(withHref)).toBeNull();
    await expect(arrow(canvas.getByRole('link', { name: /^矢印なし\s*（/ }))).toBeNull();
    await expect(arrow(canvas.getByRole('link', { name: '同じタブで矢印' }))).not.toBeNull();
    // Tag の target は render の target より勝つ。同じタブなら ↗ も読み上げの文も付けない
    const selfTarget = canvas.getByRole('link', { name: 'Tag の target が勝つ' });
    await expect(selfTarget).toHaveAttribute('target', '_self');
    await expect(arrow(selfTarget)).toBeNull();

    // link だけ（href も render もない）: 開発中に警告する
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const root = createRoot(document.createElement('div'));
    try {
      flushSync(() => root.render(<Tag link>link だけ</Tag>));
      await expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Tag: link を付けたタグには、href か、リンクの要素（render）を渡します'
        )
      );
    } finally {
      root.unmount();
      warn.mockRestore();
    }
  },
};

export const IconAndAvatar: Story = {
  tags: ['visual'],
  name: 'アイコンとアバター',
  parameters: {
    docs: {
      description: {
        story: [
          '- `icon` は文字の前に置くアイコンです。大きさは文字と同じで、色は既定で文字の色です。`iconColor` で `color` と同じ色から選べます（`solid` では文字の色のままです）。',
          '- `avatar` は文字の前に置く人の顔（`Avatar`）です。大きさはタグの高さから決まり、Avatar の `size` は使いません。',
        ].join('\n'),
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="icon（sm・md・lg）">
        <div className="flex flex-col items-start gap-2">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tag key={size} {...args} size={size} icon={<Icon icon={HashIcon} />} />
          ))}
        </div>
      </Specimen>
      <Specimen label="iconColor">
        <div className="flex flex-col items-start gap-2">
          <Tag {...args} icon={<Icon icon={CalendarBlankIcon} />} iconColor="primary">
            10 月 1 日
          </Tag>
          <Tag {...args} variant="outline" icon={<Icon icon={HashIcon} />} iconColor="success">
            公開中
          </Tag>
          <Tag {...args} variant="surface" icon={<Icon icon={HashIcon} />} iconColor="danger">
            締め切り
          </Tag>
        </div>
      </Specimen>
      <Specimen label="avatar（sm・md・lg）">
        <div className="flex flex-col items-start gap-2">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tag
              key={size}
              {...args}
              size={size}
              avatar={<Avatar src={photo} name="かずえもん" alt="" />}
            >
              かずえもん
            </Tag>
          ))}
        </div>
      </Specimen>
      <Specimen label="avatar（頭文字・形）">
        <div className="flex flex-col items-start gap-2">
          {(['soft', 'outline', 'surface', 'solid'] as const).map((variant) => (
            <Tag
              key={variant}
              {...args}
              size="md"
              variant={variant}
              color="primary"
              avatar={<Avatar name="Kazuemon" alt="" />}
            >
              Kazuemon
            </Tag>
          ))}
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさ',
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story:
          'sm（既定）・md・lg の 3 段です（ADR-0259）。inherit は段を持たず、周りの文字の大きさに従います。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="sm・md・lg">
        <div className="flex flex-wrap items-center gap-2">
          <Tag {...args} size="sm">
            sm
          </Tag>
          <Tag {...args} size="md">
            md
          </Tag>
          <Tag {...args} size="lg">
            lg
          </Tag>
        </div>
      </Specimen>
      <Specimen label="inherit（本文 16px）">
        <p style={{ fontSize: 16 }}>
          下書きの記事{' '}
          <Tag {...args} size="inherit" color="primary">
            公開前
          </Tag>{' '}
          のタグが付いています
        </p>
      </Specimen>
      <Specimen label="inherit（注記 14px）">
        <p style={{ fontSize: 14 }} className="text-fg-muted">
          下書きの記事{' '}
          <Tag {...args} size="inherit" color="primary">
            公開前
          </Tag>{' '}
          のタグが付いています
        </p>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: {
    docs: {
      description: { story: '文字の大きさは入力方式で切り替わり、タグの大きさはそれに従います。' },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="flex flex-wrap gap-2">
        <Tag {...args} color="primary" />
        <Tag {...args} />
        <Tag {...args} color="success">
          公開中
        </Tag>
      </div>
    </DensityPair>
  ),
};
