import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Affix } from './Affix';
import { ArticleScene, BarScene } from './story-scenes';
import { Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const meta = {
  title: 'Components/Affix',
  component: Affix,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'スクロールしても、画面の上か下の端に留まる枠です。記事の横の目次や、ページの下の「上へ戻る」を置きます。',
          '',
          '- 包む要素の範囲の中でだけ留まります。目次なら記事と同じ高さの列の中に、「上へ戻る」なら記事の中の最後に置きます。範囲の終わりまで来ると、一緒に流れていきます。',
          '- `position` は留まる端です。`top`（既定）は上、`bottom` は下です。',
          '- Navbar を `sticky` で貼り付けたページでは、`belowNavbar` を付けると帯の下に留まります。',
          '- 枠そのものは見た目を持ちません。目次やボタンが自分の見た目のまま留まります。枠の空いたところは、下の内容を押せます。',
          '- `surface` を付けると、内容が下を通る帯になります。白い面を敷いて端から離さずに留め、下の内容との境目を付けます。',
          '- 帯の境目は `surfaceEdge` で選びます。`line`（既定）は留まっているあいだだけ細い線、`shadow` は留まっているあいだだけ淡い影、`always-line` は留まる前からいつも細い線です。貼り付けた Navbar の `stickyEdge` とそろえると、上の帯どうしがなじみます。',
          '- 面を持たないとき、端からは 24px 離れて留まります。ページのレイアウトに合わせて変えるときは、`className="[--affix-gap:--spacing(4)]"` のように `--affix-gap` を上書きします。ページ全体で変えるなら、CSS の `:root` で `--affix-gap` を定めます。',
          '- 留まっているあいだは `data-stuck` が付きます。中身の見た目を変えるときに使えます。上からの離れは `--affix-inset` で読めます（目次の高さを画面に収めるときなど）。',
          '- スクロールする枠の中に置くと、画面ではなくその枠の端に留まります。',
        ].join('\n'),
      },
      source: sourceCode(`
          <Container>
            <div className="grid grid-cols-[1fr_12rem] gap-8">
              <article>
                …
                <Affix position="bottom" className="flex justify-end">
                  <Button color="white">上へ戻る</Button>
                </Affix>
              </article>
              <Affix render={<aside />} belowNavbar>
                <TableOfContents items={headings} />
              </Affix>
            </div>
          </Container>
        `),
    },
  },
  args: { position: 'top', belowNavbar: true, surface: false, surfaceEdge: 'line' },
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      table: { defaultValue: { summary: "'top'" } },
    },
    belowNavbar: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    surface: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    surfaceEdge: {
      control: 'inline-radio',
      options: ['line', 'shadow', 'always-line'],
      table: { defaultValue: { summary: "'line'" } },
    },
  },
} satisfies Meta<typeof Affix>;

export default meta;
type Story = StoryObj<typeof meta>;

// Controls は横の目次の Affix に効く。枠の中をスクロールして確かめる
export const Playground: Story = {
  name: '基本',
  render: (args) => <ArticleScene toc={args} />,
};

export const Sidebar: Story = {
  tags: ['visual'],
  name: '記事の横の目次',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '記事と同じ高さの列に置くと、スクロールしても貼り付けた Navbar の下に留まります。左はスクロールする前、右は記事を読み進めたところです。',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Specimen label="スクロールする前">
        <ArticleScene width="w-[520px]" backToTop={false} />
      </Specimen>
      <Specimen label="読み進めたところ">
        <ArticleScene width="w-[520px]" scroll={360} backToTop={false} />
      </Specimen>
    </div>
  ),
};

export const BackToTop: Story = {
  tags: ['visual'],
  name: '上へ戻る',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`position="bottom"` で記事の最後に置くと、読んでいるあいだは画面の下に留まり、記事の終わりで本来の位置に収まります。',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Specimen label="読んでいるあいだ">
        <ArticleScene width="w-[520px]" scroll={360} toc={false} />
      </Specimen>
      <Specimen label="記事の終わり">
        <ArticleScene width="w-[520px]" scroll="end" toc={false} />
      </Specimen>
    </div>
  ),
};

export const Surface: Story = {
  tags: ['visual'],
  name: '帯として留める',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`surface` を付けると、内容が下を通る帯になります。留まっているあいだだけ、下の内容との境目を付けます。',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-[repeat(2,max-content)] gap-6">
      <Specimen label="上: スクロールする前">
        <BarScene width="w-[480px]" height="h-[280px]" />
      </Specimen>
      <Specimen label="上: 留まったところ">
        <BarScene width="w-[480px]" height="h-[280px]" scroll={240} />
      </Specimen>
      <Specimen label="下: 留まったところ">
        <BarScene width="w-[480px]" height="h-[280px]" edge="bottom" />
      </Specimen>
      <Specimen label="下: 終わりまで来たところ">
        <BarScene width="w-[480px]" height="h-[280px]" edge="bottom" scroll="end" />
      </Specimen>
    </div>
  ),
};

export const SurfaceEdges: Story = {
  tags: ['visual'],
  name: '帯の境目',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`surfaceEdge` で帯の境目を選びます。左は留まる前、右は留まったところです。`line`（既定）と `shadow` は留まってから境目を出し、`always-line` は留まる前から線を引きます。',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-[repeat(3,max-content)] gap-6">
      {(['line', 'shadow', 'always-line'] as const).map((surfaceEdge) => (
        <Fragment key={surfaceEdge}>
          <Specimen label={`${surfaceEdge}: 留まる前`}>
            <BarScene width="w-[360px]" height="h-[220px]" surfaceEdge={surfaceEdge} />
          </Specimen>
          <Specimen label={`${surfaceEdge}: 上に留まったところ`}>
            <BarScene width="w-[360px]" height="h-[220px]" scroll={240} surfaceEdge={surfaceEdge} />
          </Specimen>
          <Specimen label={`${surfaceEdge}: 下に留まったところ`}>
            <BarScene
              width="w-[360px]"
              height="h-[220px]"
              edge="bottom"
              surfaceEdge={surfaceEdge}
            />
          </Specimen>
        </Fragment>
      ))}
    </div>
  ),
};

export const Behavior: Story = {
  name: '留まったことの印',
  parameters: { controls: { disable: true } },
  render: () => <ArticleScene />,
  play: async ({ canvasElement }) => {
    // 文字の読み込みで位置が決まるまで待つ
    const settled = { timeout: 3000 };
    const frame = canvasElement.querySelector<HTMLElement>('[data-slot="affix-scene"]')!;
    const [backToTop, toc] = canvasElement.querySelectorAll<HTMLElement>('[data-slot="affix"]');
    // はじめ（上の端）は、「上へ戻る」は画面の下に留まっていて、目次は留まっていない
    await waitFor(() => expect(backToTop).toHaveAttribute('data-stuck'), settled);
    await expect(toc).not.toHaveAttribute('data-stuck');
    await expect(toc.tagName).toBe('ASIDE');
    // 読み進めると目次が Navbar の下に留まる
    frame.scrollTop = 360;
    await waitFor(() => expect(toc).toHaveAttribute('data-stuck'), settled);
    // 記事の終わりでは「上へ戻る」は本来の位置に収まる
    frame.scrollTop = frame.scrollHeight;
    await waitFor(() => expect(backToTop).not.toHaveAttribute('data-stuck'), settled);
  },
};
