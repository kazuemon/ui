import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import { Affix } from '../affix/Affix';
import { Collapsible } from '../collapsible/Collapsible';
import { ScrollArea } from '../scroll-area/ScrollArea';
import { TableOfContents, type TableOfContentsProps } from './TableOfContents';
import { longHeadings, useSceneItems } from './story-items';
import { Article, SceneFrame, type SceneScroll } from './story-scenes';
import { DensityPair, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const meta = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'ブログ記事の目次です。見出しの一覧を渡すと入れ子の一覧で並べ、今読んでいる見出しを示します。',
          '',
          '- `items` に見出しの `id`・`text`・`level`（h2 なら 2）を記事の順に渡します。いちばん小さい段が 1 段目になり、段が深い見出しは直前の浅い見出しの下に入ります。リンクは `#id` へ移ります。',
          '- 今読んでいる見出しは、スクロールのたびに求めて `aria-current="location"` を付けます。記事がページでスクロールしても、スクロールする枠の中にあっても追えます。',
          '- 見出しが枠の上から `offset`（既定は枠の高さの 4 分の 1）より上に来ると、今の見出しになります。見出しに `scroll-margin-top` を付けていれば、それより手前にはしません。貼り付けた Navbar の下に見出しを止めるページでも、リンクで移った見出しが今の見出しになります。',
          '- `currentId` を渡すと、スクロールから求めずにその見出しを示します。今の見出しを自分で持つときや、ページの外の仕組み（ルーター）から決めるときに使います。スクロールから求めた見出しが変わると `onCurrentChange` が呼ばれます。',
          '- 一覧の上に `label`（既定は「目次」）を題として出し、読み上げでは目次の名前として読みます。Collapsible の行など、外に題があるときは `hideLabel` で題を消します。',
          '- 今の見出しの印は `currentIndicator` です。`line`（既定）は一覧の左の線に濃い線を重ねて太字に、`text` は太字だけにします。印の色は `color` で選び、既定の `neutral` は本文の色です。',
          '- 入れ子の段は字下げで見せます。`guides` で段ごとの細い線を引き、`track={false}` で一覧の左の線を消し、`subtleNested` で 2 段目より下の文字を一段淡くします。見出しが 3 段になる記事や、どの見出しの下かを追わせたいときは `guides` が向きます。',
          '- 記事の横に置くときは Affix に入れて画面に留めます。目次が長いときは ScrollArea に入れて高さを画面に収めます。今の見出しの行は、枠の中だけがスクロールして見えるところに来ます。',
          '',
          '見出しの一覧は、記事を組み立てる側で作ります。MDX なら、見出しに id を付ける rehype-slug と同じ github-slugger で、remark のプラグインから集めます。',
          '',
          '```ts',
          "import GithubSlugger from 'github-slugger';",
          "import { toString } from 'mdast-util-to-string';",
          "import { visit } from 'unist-util-visit';",
          '',
          '// h2・h3 を集めて、file.data.headings に置く',
          'export function remarkHeadings() {',
          '  return (tree, file) => {',
          '    const slugger = new GithubSlugger();',
          '    const headings = [];',
          "    visit(tree, 'heading', (node) => {",
          '      if (node.depth < 2 || node.depth > 3) return;',
          '      const text = toString(node);',
          '      headings.push({ id: slugger.slug(text), text, level: node.depth });',
          '    });',
          '    file.data.headings = headings;',
          '  };',
          '}',
          '```',
        ].join('\n'),
      },
    },
  },
  args: {
    items: [],
    label: '目次',
    hideLabel: false,
    currentIndicator: 'line',
    color: 'neutral',
    track: true,
    guides: false,
    subtleNested: false,
  },
  argTypes: {
    items: { control: false },
    label: { control: 'text', table: { defaultValue: { summary: "'目次'" } } },
    hideLabel: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    currentId: { control: false },
    offset: { control: 'number', table: { defaultValue: { summary: '枠の高さの 4 分の 1' } } },
    currentIndicator: { control: 'inline-radio', options: ['line', 'text'] },
    color: { control: 'inline-radio', options: ['neutral', 'primary', 'secondary'] },
    track: { control: 'boolean' },
    guides: { control: 'boolean' },
    subtleNested: { control: 'boolean' },
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 記事と、横に留めた目次 */
function ArticleWithToc({
  scroll,
  width,
  toc,
}: {
  scroll?: SceneScroll;
  width?: number;
  toc?: Partial<TableOfContentsProps>;
}) {
  const items = useSceneItems();
  return (
    <SceneFrame scroll={scroll} width={width}>
      <div className="grid grid-cols-[1fr_11rem] gap-8">
        <Article items={items} />
        <Affix render={<aside />}>
          <TableOfContents items={items} {...toc} />
        </Affix>
      </div>
    </SceneFrame>
  );
}

// Controls は目次に効く。枠の中をスクロールすると、今の見出しが移る
export const Playground: Story = {
  name: '基本',
  render: ({ items: _items, ...args }) => <ArticleWithToc toc={args} />,
};

/** 状態の一覧に並べる、今の見出しを決めた短い目次 */
function FixedToc({ hideLabel = true }: { hideLabel?: boolean }) {
  const items = useSceneItems().slice(0, 4);
  return <TableOfContents items={items} currentId={items[1]?.id} hideLabel={hideLabel} />;
}

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

// 行ごとに、状態を当てるリンクを変える。other は最初の見出し、current は今の見出し
const target = {
  other: '[data-row="other"] nav > ul > li:first-child > a',
  current: '[data-row="current"] a[aria-current]',
};
const at = (state: string) => [
  `[data-preview="${state}"] ${target.other}`,
  `[data-preview="${state}"] ${target.current}`,
];

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '上の行は今の見出しではない行（最初の見出し）、下の行は今の見出しに状態を当てています。',
      },
    },
    pseudo: {
      rootSelector: 'body',
      hover: [...at('hover'), ...at('active')],
      active: at('active'),
      focusVisible: at('focus'),
    },
  },
  render: () => (
    <Matrix
      rows={['other', 'current'] as const}
      columns={stateColumns}
      columnWidth="11rem"
      rowLabel={(row) => (row === 'other' ? 'ほかの見出し' : '今の見出し')}
      renderCell={(row) => (
        <div data-row={row}>
          <FixedToc />
        </div>
      )}
    />
  ),
};

/** 種類の一覧に並べる目次。2〜3 段の見出しを入れ、今の見出しは 2 段目 */
function VariantToc(props: Partial<TableOfContentsProps>) {
  const all = useSceneItems();
  const items = [0, 1, 2, 3, 7, 8, 9].flatMap((i) => (all[i] ? [all[i]] : []));
  return <TableOfContents items={items} currentId={items[2]?.id} hideLabel {...props} />;
}

const variantColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const variantPseudo = statePseudo({
  hover: 'a[aria-current]',
  focusVisible: 'a[aria-current]',
});

const indicatorRows: [label: string, props: Partial<TableOfContentsProps>][] = [
  ['line（既定）', {}],
  ['text', { currentIndicator: 'text' }],
  ['line・primary', { color: 'primary' }],
  ['line・secondary', { color: 'secondary' }],
];

export const CurrentIndicators: Story = {
  tags: ['visual'],
  name: '今の見出しの印',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`currentIndicator` で印の形を、`color` で印の色を選びます。どの印でも今の見出しは太字です。hover とフォーカスは今の見出しに当てています。',
      },
    },
    pseudo: variantPseudo,
  },
  render: () => (
    <Matrix
      rows={indicatorRows}
      columns={variantColumns}
      columnWidth="12rem"
      rowLabel={([label]) => label}
      renderCell={([, props]) => <VariantToc {...props} />}
    />
  ),
};

const nestingRows: [label: string, props: Partial<TableOfContentsProps>][] = [
  ['字下げ（既定）', {}],
  ['guides', { guides: true }],
  ['track={false}', { track: false }],
  ['subtleNested', { subtleNested: true }],
];

export const Nesting: Story = {
  tags: ['visual'],
  name: '入れ子の見せ方',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '既定では一覧の左に細い線を 1 本引き、段は字下げで見せます。`guides` は段ごとの細い線を足し、`track={false}` は左の線を消し（今の見出しの印の線は残ります）、`subtleNested` は 2 段目より下の文字を一段淡くします。',
      },
    },
    pseudo: variantPseudo,
  },
  render: () => (
    <Matrix
      rows={nestingRows}
      columns={variantColumns}
      columnWidth="12rem"
      rowLabel={([label]) => label}
      renderCell={([, props]) => <VariantToc {...props} />}
    />
  ),
};

/** 入れ子の目次（今の見出しは 3 段目） */
function NestedToc() {
  const items = useSceneItems();
  return <TableOfContents items={items} currentId={items[9]?.id} className="w-[13rem]" />;
}

export const Densities: Story = {
  tags: ['visual'],
  name: '入れ子と密度',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '見出しの段は字下げで並べます。文字の大きさは、マウスでも指でも同じです。長い見出しは折り返し、今の見出しになって太くなっても折り返す位置は変わりません。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <NestedToc />
    </DensityPair>
  ),
};

export const BesideArticle: Story = {
  tags: ['visual'],
  name: '記事の横に置く',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '記事と同じ高さの列に Affix で留めます。左はスクロールする前、右は読み進めたところです。',
      },
      source: sourceCode(`
        <div className="grid grid-cols-[1fr_12rem] gap-8">
          <article>…</article>
          <Affix render={<aside />} belowNavbar>
            <TableOfContents items={headings} />
          </Affix>
        </div>
      `),
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Specimen label="スクロールする前">
        <ArticleWithToc width={560} />
      </Specimen>
      <Specimen label="読み進めたところ">
        <ArticleWithToc width={560} scroll={640} />
      </Specimen>
    </div>
  ),
};

function LongTocScene({ scroll }: { scroll?: SceneScroll }) {
  const items = useSceneItems(longHeadings);
  return (
    <SceneFrame scroll={scroll} width={560}>
      <div className="grid grid-cols-[1fr_11rem] gap-8">
        <Article items={items} />
        <Affix render={<aside />}>
          {/* 実際のページでは 100dvh。ここではスクロールする枠の高さ（--scene-height） */}
          <ScrollArea className="max-h-[calc(var(--scene-height)-var(--affix-inset)-var(--affix-gap))]">
            <TableOfContents items={items} />
          </ScrollArea>
        </Affix>
      </div>
    </SceneFrame>
  );
}

export const LongList: Story = {
  tags: ['visual'],
  name: '長い目次',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '目次が画面より長いときは、ScrollArea に入れて高さを画面に収めます。Affix の上からの離れは `--affix-inset` で読めるので、画面の高さからそれと下の離れ（`--affix-gap`）を引きます。今の見出しの行は、枠の中だけがスクロールして見えるところに来ます。',
      },
      source: sourceCode(`
        <Affix render={<aside />} belowNavbar>
          <ScrollArea className="max-h-[calc(100dvh-var(--affix-inset)-var(--affix-gap))]">
            <TableOfContents items={headings} />
          </ScrollArea>
        </Affix>
      `),
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Specimen label="はじめ">
        <LongTocScene />
      </Specimen>
      <Specimen label="後ろの章を読んでいるところ">
        <LongTocScene scroll={2400} />
      </Specimen>
    </div>
  ),
};

function NarrowScene() {
  const items = useSceneItems();
  const [open, setOpen] = useState(true);
  return (
    <SceneFrame width={360} height={480}>
      <div className="flex flex-col gap-6">
        <Collapsible title="目次" appearance="filled" open={open} onOpenChange={setOpen}>
          <TableOfContents items={items} hideLabel onItemClick={() => setOpen(false)} />
        </Collapsible>
        <Article items={items} />
      </div>
    </SceneFrame>
  );
}

export const Narrow: Story = {
  tags: ['visual'],
  name: '狭い画面',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '横に並べる幅がないときは、記事の上に Collapsible で畳んで置きます。題は Collapsible の行が持つので `hideLabel` で消し、見出しを押したら `onItemClick` で閉じます。',
      },
      source: sourceCode(`
        const [open, setOpen] = useState(false);

        <Collapsible title="目次" appearance="filled" open={open} onOpenChange={setOpen}>
          <TableOfContents items={headings} hideLabel onItemClick={() => setOpen(false)} />
        </Collapsible>
        <article>…</article>
      `),
    },
  },
  render: () => <NarrowScene />,
};

export const Tracking: Story = {
  name: '今の見出しを追う',
  args: { onCurrentChange: fn() },
  parameters: { controls: { disable: true } },
  render: ({ onCurrentChange }) => <ArticleWithToc toc={{ onCurrentChange }} />,
  play: async ({ args, canvas, canvasElement }) => {
    const settled = { timeout: 3000 };
    const frame = canvasElement.querySelector<HTMLElement>('[data-slot="toc-scene"]')!;
    // 見える文字（太字の写しではないほう）
    const current = () =>
      canvasElement.querySelector('[aria-current="location"] > span:first-child')?.textContent ??
      null;
    // 読み進めると、線を越えた最後の見出しが今の見出しになる
    const density = [...canvasElement.querySelectorAll('h2')].find(
      (h) => h.textContent === '密度の切り替え'
    )!;
    await waitFor(() => expect(frame.scrollHeight).toBeGreaterThan(frame.clientHeight), settled);
    frame.scrollTop += density.getBoundingClientRect().top - frame.getBoundingClientRect().top - 20;
    await waitFor(() => expect(current()).toBe('密度の切り替え'), settled);
    await waitFor(() => expect(args.onCurrentChange).toHaveBeenLastCalledWith(density.id), settled);
    // 目次のリンクで移ったとき（見出しが枠の上の端に来る）も、その見出しが今の見出しになる
    //   テストのページではリンクを押して URL を変えられないので、リンクの行き先へ同じように移る
    const link = canvas.getByRole('link', { name: '動きの手応え' });
    const destination = document.getElementById(link.getAttribute('href')?.slice(1) ?? '');
    destination?.scrollIntoView({ block: 'start' });
    await waitFor(() => expect(current()).toBe('動きの手応え'), settled);
    // 下の端まで来ると、最後の見出しが今の見出しになる
    frame.scrollTop = frame.scrollHeight;
    await waitFor(() => expect(current()).toBe('まとめ'), settled);
  },
};

export const Accessibility: Story = {
  name: '読み上げ',
  parameters: { controls: { disable: true } },
  render: () => <FixedToc hideLabel={false} />,
  play: async ({ canvas }) => {
    // nav の名前は「目次」。見える題は読み上げから外し、二度読ませない
    const nav = canvas.getByRole('navigation', { name: '目次' });
    await expect(nav).toBeVisible();
    await expect(canvas.getByText('目次')).toHaveAttribute('aria-hidden', 'true');
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(4);
    // 見える文字と太字の写しのうち、名前になるのは見える文字だけ
    await expect(links[0]).toHaveAccessibleName('はじめに');
    await expect(links[0]?.getAttribute('href')).toMatch(/^#.+-intro$/);
    // 今の見出しは aria-current="location"
    await expect(links[1]).toHaveAttribute('aria-current', 'location');
    await expect(links[0]).not.toHaveAttribute('aria-current');
    // 入れ子の見出しは、親の見出しの li の中の一覧に入る
    const nested = links[2]?.closest('ul');
    await expect(nested?.closest('li')?.querySelector('a')).toBe(links[1]);
  },
};
