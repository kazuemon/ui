import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { markdownArticleHtml } from '../../samples/markdown-html';
import { Prose } from './Prose';
import { DensityPair } from '../../stories/story-parts';

const meta = {
  title: 'Components/Prose',
  component: Prose,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の本文です。Markdown などを HTML に変換したものを中に入れると、見出し・段落・リスト・引用・コード・表・画像・区切り線・脚注に、Heading や Table などの部品と同じ見た目と、要素のあいだの余白を付けます。',
          '',
          '```tsx',
          '<Prose as="article">',
          '  <div dangerouslySetInnerHTML={{ __html: html }} />',
          '</Prose>',
          '```',
          '',
          '- 変換した HTML は、Prose の子の `div` に `dangerouslySetInnerHTML` で入れます。Prose は HTML の文字列を受け取る props を持ちません。入れた文字列はスクリプトも含めてそのまま動くので、ビルド時に自分で変換した HTML だけを入れ、利用者が書いた文や外から取ってきた文をエスケープせずに入れないでください。子の `div` に入れると、Prose の中の HTML の前後に React の要素を並べることもできます。',
          '- 想定する要素は、GFM（remark-gfm）で変換したときに出るものです: `h1`〜`h6`・`p`・`a`・`strong`・`em`・`del`・`code`・`br`・`ul`・`ol`・`li`・チェックリスト（`input type="checkbox" disabled`）・`blockquote`・`table`（列の寄せは `align` 属性）・`img`・`hr`・脚注（`data-footnote-ref`・`data-footnotes`・`data-footnote-backref`）。Markdown の中に書いた `kbd`・`mark` にも見た目が付きます。',
          '- 複数行のコードは、Shiki（`createCssVariablesTheme`）と `@shikijs/transformers` で色分けした `pre.shiki` を想定します。強調行・差分・フォーカス・語の強調も CodeBlock と同じ見た目になります。',
          '- 部品の既定の見た目を当てます。引用は左のグレーの線、区切り線は幅いっぱいの細い線、表は行のあいだの横線、コードはグレーの面、リンクは Primary の青い文字です。見た目を変えたいときは、Prose で変えずに部品を直接使います（Prose は見た目を選ぶ props を持ちません）。',
          '- 要素のあいだの余白は、マウスで操作しているときは見出しと区切り線の上を広く、指で操作しているときは詰めます。',
          '- 脚注の一覧の上には、線などの区切りを付けません。付けるときは、変換のあとに自分で付けます。',
          '- 文字のリンクは、周りの文字の大きさ（本文の 16px）のままです。',
          '- 部品の機能は付きません。コードのコピーのボタンは出ず、表と長いコードは、それ自身が横にスクロールします。横にはみ出しているあいだだけ Tab で止まり、矢印キーで横に動かせます。幅に満たない表は、Table と違い中身の幅になります。',
          '- 囲み（`> [!NOTE]`）は変換しません。囲みや題の付いたコードを使うときは、Callout や CodeBlock を Prose の外に置きます。',
          '- `data-reading` を付けるので、中の本文は指で操作していても 16px です。表は指で 14px、コードはどちらも 14px です。',
          '- `as` で描く要素を選びます（既定は `div`。記事の本文は `article`）。',
        ].join('\n'),
      },
    },
  },
  args: { as: 'div' },
  argTypes: {
    as: { control: 'inline-radio', options: ['div', 'article', 'section', 'main'] },
  },
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <Prose {...args} className="max-w-[720px]">
      <div dangerouslySetInnerHTML={{ __html: markdownArticleHtml }} />
    </Prose>
  ),
};

// 見本の記事を、撮れる高さに分ける（h2 と表の前で切る）
const sections = markdownArticleHtml.split(/(?=<h2>)/);
const [imagesAndTable = '', ...rest] = sections.slice(4);
const tableIndex = imagesAndTable.indexOf('<table>');
const parts = {
  textAndLists: sections.slice(0, 2).join(''),
  codeAndQuote: sections.slice(2, 4).join(''),
  images: imagesAndTable.slice(0, tableIndex),
  tableAndFootnotes: [imagesAndTable.slice(tableIndex), ...rest].join(''),
};

const densityStory = (name: string, html: string): Story => ({
  tags: ['visual'],
  name,
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <Prose className="w-[24rem]">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </DensityPair>
  ),
});

export const TextAndLists = densityStory('文章とリスト', parts.textAndLists);
export const CodeAndQuote = densityStory('コードと引用', parts.codeAndQuote);
export const Images = densityStory('画像', parts.images);
export const TableAndFootnotes = densityStory('表と脚注', parts.tableAndFootnotes);

export const Structure: Story = {
  name: '要素と読み上げ',
  args: { as: 'article' },
  render: (args) => (
    <Prose {...args} className="max-w-[720px]">
      <div dangerouslySetInnerHTML={{ __html: markdownArticleHtml }} />
    </Prose>
  ),
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('[data-prose]');
    await expect(root?.tagName).toBe('ARTICLE');
    await expect(root).toHaveAttribute('data-reading');

    // 最初の要素の上には余白を付けない
    const first = root?.querySelector('div > p');
    await expect(first && getComputedStyle(first).marginTop).toBe('0px');

    // 脚注の戻るリンク: 文字の ↩ は隠すが、名前（aria-label）は残る
    const backref = canvas.getByRole('link', { name: 'Back to reference 1' });
    await expect(getComputedStyle(backref, '::before').maskImage).toContain('data:image/svg+xml');
    // 脚注の見出しは読み上げだけ
    await expect(canvas.getByRole('heading', { name: 'Footnotes' })).toHaveClass('sr-only');

    // 表と pre は、それだけが横にスクロールする
    const table = root?.querySelector('table');
    await expect(table && getComputedStyle(table).overflowX).toBe('auto');
    const pre = root?.querySelector('pre');
    await expect(pre && getComputedStyle(pre).overflowX).toBe('auto');
    // Tab で止まるのは、横にはみ出しているものだけ（Shiki が付けた tabindex は、はみ出していなければ外す）
    const scrollers = Array.from(root?.querySelectorAll<HTMLElement>('table, pre') ?? []);
    await expect(scrollers.length).toBeGreaterThan(0);
    await waitFor(async () => {
      for (const element of scrollers) {
        await expect(element.hasAttribute('tabindex')).toBe(
          element.scrollWidth > element.clientWidth + 1
        );
      }
    });
    // pre は面の色を持つ（Shiki が style に書く地を面の色にする）
    await expect(pre && getComputedStyle(pre).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

    // チェックリストの箱は押せない
    for (const box of canvas.getAllByRole('checkbox')) await expect(box).toBeDisabled();
  },
};
