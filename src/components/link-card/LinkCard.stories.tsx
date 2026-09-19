import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';
import { expect, userEvent } from 'storybook/test';

import { LinkCard } from './LinkCard';
import { landscape, svg } from '../../samples/images';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';
import { Prose } from '../prose/Prose';

// 見本の favicon（外に取りに行かないよう、SVG の data URL で作る）
const favicon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#3ea8ff"/><path d="M9 22 L16 9 L23 22 Z" fill="#fff"/></svg>'
)}`;

// 見本の OG 画像（白っぽい地に題の文字の代わりの帯）
const ogImage = svg(`
  <rect width="1600" height="900" fill="#e3f4fe"/>
  <rect x="120" y="300" width="1100" height="72" rx="36" fill="#7cc8fb"/>
  <rect x="120" y="420" width="760" height="72" rx="36" fill="#7cc8fb"/>
  <circle cx="1340" cy="660" r="100" fill="#fff6d6"/>
`);

const longTitle =
  'とても長い題のページへのリンクカードで、2 行を超えた分は最後に三点を付けて切り、カードの高さがそろうようにします';
const longDescription =
  '説明も同じく決まった行数で切ります。OG の description は長いことが多いので、そのまま渡しても崩れないようにしています。ここまでは見えません。';

const sample = {
  href: 'https://zenn.dev/kazuemon/articles/design-loop',
  title: '候補を並べて選ぶループでデザインシステムを作る',
  description:
    '原則とトークンを先に決め、Storybook に候補を並べて 1 軸ずつ選んでいく進め方と、その記録の残し方について。',
  favicon,
  image: ogImage,
} satisfies ComponentProps<typeof LinkCard>;

const meta = {
  title: 'Components/LinkCard',
  component: LinkCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の中から別のページへ移るカードです。題・説明・サイト・画像を並べ、カード全体が 1 つのリンクになります。',
          '',
          '- 中身は props で渡します。部品はページを読みに行きません。題（`title`）は必須で、説明（`description`）・画像（`image`）・favicon（`favicon`）は、あるものだけを渡します。favicon は渡したときだけ出ます。',
          '- サイトの行には、`href` のドメインを出します。名前を変えたいときは `site` に、出さないときは `site={false}` を渡します。サイト内のリンク（`/blog/1` など）はドメインを出しません。行の位置は `sitePlacement`（既定 `top`。題の上）で、`bottom` にすると説明の下に置けます。',
          '- 画像の位置は `layout` で選べます。既定は `end`（文が左・画像が右）で、`start`（画像が左）・`top`（画像が上）も選べます。画像がなければ、どの `layout` でも文だけのカードになります。',
          '- 題・説明は決まった行数を超えた分を … で切ります。行数は `titleLines`・`descriptionLines`（どちらも既定 2）で変えられます。',
          '- `target="_blank"` のときは、読み上げに「新しいタブで開きます」を足し、サイトの後ろに ↗ を付けます。',
          '- 読み上げでは、題がリンクの名前、説明とサイトが補足になります。',
          '- 記事（`Prose`）の中にそのまま置けます。上下の余白は `Prose` が付けます。Next.js の `Link` は `render` に渡します。',
        ].join('\n'),
      },
    },
  },
  args: sample,
  argTypes: {
    image: { control: 'text' },
    render: { control: false },
    site: { control: 'text' },
    target: { control: 'inline-radio', options: [undefined, '_blank'] },
    layout: { control: 'inline-radio', options: ['end', 'start', 'top'] },
    sitePlacement: { control: 'inline-radio', options: ['top', 'bottom'] },
    imageZoom: { control: 'boolean' },
    titleLines: { control: { type: 'number', min: 1, max: 4 } },
    descriptionLines: { control: { type: 'number', min: 1, max: 4 } },
  },
} satisfies Meta<typeof LinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const column = (Story: () => ReactNode) => <div className="max-w-2xl">{Story()}</div>;

export const Playground: Story = {
  name: '基本',
  decorators: [column],
  parameters: {
    docs: {
      source: sourceCode(`
        <LinkCard
          href="https://zenn.dev/kazuemon/articles/design-loop"
          title="候補を並べて選ぶループでデザインシステムを作る"
          description="原則とトークンを先に決め、Storybook に候補を並べて 1 軸ずつ選んでいく進め方と、その記録の残し方について。"
          favicon="https://zenn.dev/favicon.ico"
          image="https://example.com/og.png"
        />
      `),
    },
  },
};

export const Contents: Story = {
  tags: ['visual'],
  name: '中身の組み合わせ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '渡したものだけを並べます。題と説明は決まった行数で切ります。サイト内のリンクはドメインを出しません。',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
  render: () => (
    <Gallery columnWidth="24rem">
      <Specimen label="すべて">
        <LinkCard {...sample} />
      </Specimen>
      <Specimen label="画像なし">
        <LinkCard {...sample} image={undefined} />
      </Specimen>
      <Specimen label="説明なし">
        <LinkCard {...sample} description={undefined} />
      </Specimen>
      <Specimen label="favicon なし・画像なし">
        <LinkCard {...sample} favicon={undefined} image={undefined} />
      </Specimen>
      <Specimen label="長い題と説明">
        <LinkCard {...sample} title={longTitle} description={longDescription} />
      </Specimen>
      <Specimen label="サイト内のリンク（ドメインなし）">
        <LinkCard
          href="/blog/2026-09-19"
          title="前の記事: Card と Navbar を作った"
          description="同じサイトの記事へのリンクです。"
        />
      </Specimen>
      <Specimen label="サイトの名前を指定">
        <LinkCard {...sample} site="Zenn" image={undefined} />
      </Specimen>
      <Specimen label="新しいタブ">
        <LinkCard {...sample} target="_blank" />
      </Specimen>
    </Gallery>
  ),
};

export const Layouts: Story = {
  tags: ['visual'],
  name: '画像の位置',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '画像の位置は `layout` で選びます。既定は `end`（文が左・画像が右）で、`start`（画像が左）・`top`（画像が上）も選べます。',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
  render: () => (
    <Gallery columnWidth="24rem">
      <Specimen label="end（既定）">
        <LinkCard {...sample} layout="end" />
      </Specimen>
      <Specimen label="start">
        <LinkCard {...sample} layout="start" />
      </Specimen>
      <Specimen label="top">
        <LinkCard {...sample} layout="top" />
      </Specimen>
    </Gallery>
  ),
};

export const SitePlacement: Story = {
  tags: ['visual'],
  name: 'サイトの行の位置',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'サイトの行の位置は `sitePlacement` で選びます。既定は `top`（題の上）で、`bottom` にすると説明の下に置けます。favicon は渡したときだけ出ます。',
      },
    },
  },
  decorators: [column],
  render: () => (
    <div className="flex flex-col gap-4">
      <LinkCard {...sample} sitePlacement="top" />
      <LinkCard {...sample} sitePlacement="bottom" />
      <LinkCard {...sample} favicon={undefined} sitePlacement="top" />
    </div>
  ),
};

export const Lines: Story = {
  tags: ['visual'],
  name: '題・説明の行数',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '題・説明の最大の行数は `titleLines`・`descriptionLines`（どちらも既定 2）で変えられます。超えた分は … で切ります。',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-4xl">{Story()}</div>],
  render: () => (
    <Gallery columnWidth="24rem">
      <Specimen label="既定（2 行・2 行）">
        <LinkCard {...sample} title={longTitle} description={longDescription} />
      </Specimen>
      <Specimen label="説明を 1 行に">
        <LinkCard
          {...sample}
          title={longTitle}
          description={longDescription}
          descriptionLines={1}
        />
      </Specimen>
      <Specimen label="題・説明とも 1 行に">
        <LinkCard
          {...sample}
          title={longTitle}
          description={longDescription}
          titleLines={1}
          descriptionLines={1}
        />
      </Specimen>
    </Gallery>
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
  name: '状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="link-card"]',
      active: '[data-slot="link-card"]',
      focusVisible: '[data-slot="link-card"]',
    }),
    docs: {
      description: {
        story:
          'ボタンと同じ薄い影で浮かせ、hover で影を減らして面を淡く塗ります。押すと少し沈みます。hover で画像を少し大きくしたいときは `imageZoom` を渡します。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={['画像あり', '画像なし'] as const}
      columns={stateColumns}
      columnWidth="15rem"
      rowLabel={(row) => row}
      renderCell={(row) => (
        <LinkCard {...sample} image={row === '画像あり' ? sample.image : undefined} />
      )}
    />
  ),
};

export const InProse: Story = {
  tags: ['visual'],
  name: '記事の中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'MDX の記事では、段落のあいだにそのまま置きます。上下の余白は `Prose` が付けます。記事の中のリンクの見た目は、カードには付きません。',
      },
      source: sourceCode(`
        前に書いた記事も読んでみてください。

        <LinkCard href="https://zenn.dev/…" title="…" description="…" image="…" />

        ここから本題です。
      `),
    },
  },
  decorators: [column],
  render: () => (
    <Prose>
      <p>
        進め方の全体は、<a href="#">前に書いた記事</a>にまとめています。
      </p>
      <LinkCard {...sample} />
      <p>ここから本題です。今回はリンクカードを作りました。</p>
      <LinkCard {...sample} image={landscape} target="_blank" />
    </Prose>
  ),
};

export const Narrow: Story = {
  tags: ['visual'],
  name: '狭い幅',
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'スマートフォンの幅では、画像を幅の割合で縮めます。' },
    },
  },
  render: () => (
    <div data-density="coarse" className="flex w-[343px] flex-col gap-4">
      <LinkCard {...sample} />
      <LinkCard {...sample} image={undefined} />
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-[36rem] max-w-full">
        <LinkCard {...sample} />
      </div>
    </DensityPair>
  ),
};

// Next.js の Link の代わり。href などを受け取り、渡された props を a に付ける
function FrameworkLink(props: ComponentProps<'a'> & { href: string }) {
  return <a data-framework-link="" {...props} />;
}

export const FrameworkLinkStory: Story = {
  name: 'Next.js の Link',
  decorators: [column],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'サイト内の記事へは、Next.js の `Link` などを `render` に渡します。`href` は渡した要素に書きます。',
      },
      source: sourceCode(`
        import NextLink from 'next/link';

        <LinkCard render={<NextLink href="/blog/1" />} title="…" description="…" />
      `),
    },
  },
  render: () => (
    <LinkCard
      render={<FrameworkLink href="/blog/1" />}
      title="前の記事: Card と Navbar を作った"
      description="同じサイトの記事へのリンクです。"
    />
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: '前の記事: Card と Navbar を作った' });
    await expect(link).toHaveAttribute('href', '/blog/1');
    await expect(link).toHaveAttribute('data-framework-link');
    await expect(link).toHaveAttribute('data-slot', 'link-card');
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  decorators: [column],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <LinkCard {...sample} />
      <LinkCard {...sample} title="新しいタブで開くカード" target="_blank" />
      <LinkCard {...sample} title="名前を付けたカード" aria-label="設計の記事" target="_blank" />
    </div>
  ),
  play: async ({ canvas }) => {
    // 名前は題だけ。説明とサイトは補足になる
    const same = canvas.getByRole('link', { name: sample.title });
    await expect(same).toHaveAttribute('href', sample.href);
    await expect(same).not.toHaveAttribute('target');
    await expect(same).not.toHaveAttribute('rel');
    await expect(same).toHaveAccessibleDescription(`${sample.description} zenn.dev`);
    // OG 画像は飾り（alt が空）なので、読み上げに入らない
    await expect(canvas.queryAllByRole('img')).toHaveLength(0);

    const newTab = canvas.getByRole('link', {
      name: '新しいタブで開くカード （新しいタブで開きます）',
    });
    await expect(newTab).toHaveAttribute('target', '_blank');
    await expect(newTab).toHaveAttribute('rel', 'noopener noreferrer');

    await expect(
      canvas.getByRole('link', { name: '設計の記事（新しいタブで開きます）' })
    ).toBeInTheDocument();

    // Tab で順に止まる
    await userEvent.tab();
    await expect(same).toHaveFocus();
    await userEvent.tab();
    await expect(newTab).toHaveFocus();
  },
};
