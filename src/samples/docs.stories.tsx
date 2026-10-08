import { BookOpenIcon, ListIcon, PaletteIcon, SquaresFourIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useState } from 'react';

import { Accordion, AccordionItem } from '../components/accordion/Accordion';
import { Affix } from '../components/affix/Affix';
import { Breadcrumb, BreadcrumbItem } from '../components/breadcrumb/Breadcrumb';
import { Button } from '../components/button/Button';
import { Callout } from '../components/callout/Callout';
import { CodeBlock } from '../components/code-block/CodeBlock';
import { CodeGroup } from '../components/code-group/CodeGroup';
import { Drawer } from '../components/drawer/Drawer';
import { FileTree, FileTreeItem } from '../components/file-tree/FileTree';
import { HeadingAnchor } from '../components/heading-anchor/HeadingAnchor';
import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import { LinkCard } from '../components/link-card/LinkCard';
import { Link } from '../components/link/Link';
import { Mark } from '../components/mark/Mark';
import { Navbar } from '../components/navbar/Navbar';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from '../components/navigation-menu/NavigationMenu';
import { Pager } from '../components/pager/Pager';
import { Prose } from '../components/prose/Prose';
import { ScrollArea } from '../components/scroll-area/ScrollArea';
import { SearchField } from '../components/search-field/SearchField';
import { SkipLink } from '../components/skip-link/SkipLink';
import { Step, Steps } from '../components/steps/Steps';
import { TableOfContents } from '../components/table-of-contents/TableOfContents';
import { Text } from '../components/text/Text';
import { Time } from '../components/time/Time';
import { Tree, TreeItem } from '../components/tree/Tree';
import {
  bunHtml,
  jsxHtml,
  npmHtml,
  pnpmHtml,
  tsxHtml,
  yarnHtml,
} from '../components/code-group/fixtures';
import { SamplePage, densityOf } from './SamplePage';

// 見本のページ: ドキュメントサイト。先頭に本文へ飛ぶ SkipLink、上に Navbar（部品の一覧は NavigationMenu で開く）、
// 左に検索の欄と Tree の目次（長いので ScrollArea の中。狭い幅では Drawer）、本文、右にページ内の目次（広い幅だけ）。
// 左右の列は Affix で帯の下に留める。下に次に読むページ（LinkCard）と Pager。
// 本文の見出しには HeadingAnchor、導入は Steps、ファイルの置き場所は FileTree で見せる。
// 検索の欄に語を打つと、目次の代わりに一致したページを並べ、一致した語を Mark で目立たせる
const tocItems = [
  { id: 'setup', text: '導入の手順', level: 2 },
  { id: 'faq', text: 'よくある質問', level: 2 },
];

const nav = (
  <Tree accessibleName="ドキュメント" rowWidth="full">
    <TreeItem label="はじめに" href="#intro" />
    <TreeItem label="導入" defaultExpanded>
      <TreeItem label="インストール" href="#install" current />
      <TreeItem label="Tailwind の設定" href="#tailwind" />
      <TreeItem label="テーマと密度" href="#theme" />
      <TreeItem label="フォント" href="#fonts" />
    </TreeItem>
    <TreeItem label="部品" defaultExpanded>
      <TreeItem label="Button" href="#button" />
      <TreeItem label="Link" href="#link" />
      <TreeItem label="入力" defaultExpanded>
        <TreeItem label="TextField" href="#text-field" />
        <TreeItem label="SearchField" href="#search-field" />
        <TreeItem label="Checkbox" href="#checkbox" />
        <TreeItem label="Select" href="#select" />
      </TreeItem>
      <TreeItem label="重なる面" defaultExpanded>
        <TreeItem label="Dialog" href="#dialog" />
        <TreeItem label="Drawer" href="#drawer" />
        <TreeItem label="Popover" href="#popover" />
      </TreeItem>
      <TreeItem label="読みもの" defaultExpanded>
        <TreeItem label="Prose" href="#prose" />
        <TreeItem label="CodeBlock" href="#code-block" />
        <TreeItem label="Steps" href="#steps" />
      </TreeItem>
    </TreeItem>
    <TreeItem label="デザイン原則" href="#principles" />
    <TreeItem label="更新の記録" href="#changelog" />
  </Tree>
);

/** 検索の対象。ページの題・置き場所・書き出し。このページの節（#setup・#faq）のほかは、ドキュメントのほかのページへ移る */
const searchIndex = [
  {
    href: '#setup',
    title: '導入の手順',
    section: 'インストール',
    excerpt: 'パッケージを追加し、スタイルを読み込み、部品を置きます。',
  },
  {
    href: '#faq',
    title: 'よくある質問',
    section: 'インストール',
    excerpt: 'React のバージョン、Next.js で使えるか、ダークモードについて。',
  },
  {
    href: '#intro',
    title: 'はじめに',
    section: 'ドキュメント',
    excerpt: 'かずえもんのための部品集です。React と Tailwind CSS で動きます。',
  },
  {
    href: '#install',
    title: 'インストール',
    section: '導入',
    excerpt: 'パッケージを追加して、スタイルを読み込みます。',
  },
  {
    href: '#tailwind',
    title: 'Tailwind の設定',
    section: '導入',
    excerpt: 'CSS の入口で tailwind.css を読み込み、テーマの値を使えるようにします。',
  },
  {
    href: '#theme',
    title: 'テーマと密度',
    section: '導入',
    excerpt: 'ダークモードは ThemeProvider で、指とマウスの密度は data-density で切り替えます。',
  },
  {
    href: '#fonts',
    title: 'フォント',
    section: '導入',
    excerpt: '欧文と和文のフォントを、別々の CSS で読み込みます。',
  },
  {
    href: '#button',
    title: 'Button',
    section: '部品',
    excerpt: '押すと何かが起きるボタン。色と見た目を選べます。',
  },
  {
    href: '#search-field',
    title: 'SearchField',
    section: '部品 / 入力',
    excerpt: '検索の語を打つ欄。Esc で値を消せます。',
  },
  {
    href: '#drawer',
    title: 'Drawer',
    section: '部品 / 重なる面',
    excerpt: '画面の端から出る面。狭い幅の目次やメニューに使います。',
  },
  {
    href: '#steps',
    title: 'Steps',
    section: '部品 / 読みもの',
    excerpt: '番号の付いた手順。導入の説明に使います。',
  },
  {
    href: '#principles',
    title: 'デザイン原則',
    section: 'ドキュメント',
    excerpt: '部品の見た目と振る舞いを決めている考えです。',
  },
];

/** text の中の query（大文字と小文字は区別しない）を Mark で包む */
function highlight(text: string, query: string): ReactNode {
  const needle = query.toLowerCase();
  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let from = 0;
  let at = lower.indexOf(needle);
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<Mark key={at}>{text.slice(at, at + needle.length)}</Mark>);
    from = at + needle.length;
    at = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}

/** 検索の結果。題・置き場所・書き出しのどれかに語を含むページを並べる */
function SearchResults({ query }: { query: string }) {
  const needle = query.toLowerCase();
  const hits = searchIndex.filter((page) =>
    [page.title, page.section, page.excerpt].some((text) => text.toLowerCase().includes(needle))
  );
  return (
    <div className="flex flex-col gap-3">
      <Text size="sm" variant="subtle" role="status">
        {hits.length > 0
          ? `${hits.length} 件見つかりました`
          : `「${query}」に一致するページはありません`}
      </Text>
      {hits.length > 0 && (
        <ul className="flex flex-col gap-4">
          {hits.map((page) => (
            <li key={page.href} className="flex flex-col gap-1">
              <Link href={page.href}>{highlight(page.title, query)}</Link>
              <Text size="sm" variant="subtle">
                {highlight(page.section, query)}
              </Text>
              <Text size="sm">{highlight(page.excerpt, query)}</Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DocsScreen() {
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const searching = query.trim() !== '';
  const search = (
    <SearchField
      label="ドキュメント内を検索"
      placeholder="例: テーマ"
      value={query}
      onValueChange={setQuery}
    />
  );
  // 語があるあいだは、目次の代わりに検索の結果を出す
  const sidebarBody = searching ? <SearchResults query={query.trim()} /> : nav;

  return (
    <>
      <SkipLink href="#docs-main" />
      <Navbar
        sticky
        size="wide"
        brand={
          <a href="#top" className="flex items-center gap-2 text-fg no-underline">
            <span aria-hidden="true" className="size-6 rounded-lg bg-primary" />
            kazuemon/ui
          </a>
        }
        actions={
          <Link href="https://github.com/kazuemon/ui" variant="outline">
            GitHub
          </Link>
        }
      >
        <NavigationMenu>
          <NavigationMenuLink href="#docs" current>
            ドキュメント
          </NavigationMenuLink>
          <NavigationMenuItem label="部品">
            <NavigationMenuLink
              href="#components"
              icon={<SquaresFourIcon />}
              description="ボタン・入力・表など、ひとつずつの部品"
            >
              部品の一覧
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#principles"
              icon={<PaletteIcon />}
              description="影・色・余白をどう決めているか"
            >
              デザイン原則
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#recipes"
              icon={<BookOpenIcon />}
              description="部品を組み合わせて作る画面の例"
            >
              レシピ
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuLink href="#blog">ブログ</NavigationMenuLink>
        </NavigationMenu>
      </Navbar>
      <div className="mx-auto flex max-w-[1280px] gap-10 px-5 py-8">
        {/* 目次が画面より長いときは、ScrollArea の中だけをスクロールさせる（ページは動かさない） */}
        <Affix
          belowNavbar
          render={<aside />}
          className="hidden h-fit w-60 shrink-0 flex-col gap-4 lg:flex"
        >
          {search}
          <ScrollArea
            accessibleName={searching ? '検索の結果' : 'ドキュメントの目次'}
            orientation="vertical"
            className="max-h-[calc(100dvh-13rem)]"
          >
            {sidebarBody}
          </ScrollArea>
        </Affix>
        <main id="docs-main" className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <Drawer
              side="left"
              title="ドキュメント"
              open={navOpen}
              onOpenChange={setNavOpen}
              trigger={
                <Button variant="outline">
                  <Icon icon={ListIcon} />
                  目次
                </Button>
              }
            >
              <div className="flex flex-col gap-4">
                {search}
                {/* リンクを押したら、行き先へ移りつつドロワーを閉じる（検索欄と、Tree の開閉の行では閉じない） */}
                <div
                  className="flex flex-col gap-4"
                  onClickCapture={(event) => {
                    if ((event.target as Element).closest('a[href]')) setNavOpen(false);
                  }}
                >
                  {sidebarBody}
                  {/* 広い画面の右のページ内目次が隠れるので、狭い画面ではここに置く */}
                  {!searching && (
                    <TableOfContents
                      label="このページの内容"
                      items={tocItems}
                      className="border-t border-line pt-4"
                    />
                  )}
                </div>
              </div>
            </Drawer>
          </div>
          <Breadcrumb>
            <BreadcrumbItem href="#docs">ドキュメント</BreadcrumbItem>
            <BreadcrumbItem href="#start">導入</BreadcrumbItem>
            <BreadcrumbItem current>インストール</BreadcrumbItem>
          </Breadcrumb>
          <Heading level={1} className="mt-4">
            インストール
          </Heading>
          <Prose className="mt-4">
            <p>
              パッケージを追加して、スタイルを読み込みます。Tailwind CSS v4
              を使うプロジェクトで動きます。
            </p>
          </Prose>
          <Callout status="warning" title="Tailwind が必要です" className="mt-6">
            スタイルは Tailwind CSS v4 の <code>@theme</code> を前提にしています。先に Tailwind
            を入れてください。
          </Callout>
          <Heading level={2} id="setup" className="mt-10">
            導入の手順
            <HeadingAnchor href="#setup" />
          </Heading>
          <div data-reading className="mt-4">
            <Steps>
              <Step title="パッケージを追加する">
                <p>お使いのパッケージマネージャで追加します。</p>
                <CodeGroup>
                  <CodeBlock title="pnpm" html={pnpmHtml} />
                  <CodeBlock title="npm" html={npmHtml} />
                  <CodeBlock title="yarn" html={yarnHtml} />
                  <CodeBlock title="bun" html={bunHtml} />
                </CodeGroup>
              </Step>
              <Step title="スタイルを読み込む">
                <p>
                  アプリの CSS の入口で、Tailwind のあとに読み込みます。Next.js
                  なら、ふつうは次の場所です。
                </p>
                <FileTree title="my-app">
                  <FileTreeItem label="app">
                    <FileTreeItem label="layout.tsx" comment="globals.css を読み込む" />
                    <FileTreeItem label="globals.css" comment="ここに書き足す" highlighted />
                    <FileTreeItem label="page.tsx" />
                  </FileTreeItem>
                  <FileTreeItem label="package.json" />
                  <FileTreeItem label="postcss.config.mjs" />
                </FileTree>
                <CodeBlock title="postcss.config.mjs">
                  <code>{"export default {\n  plugins: { '@tailwindcss/postcss': {} },\n};"}</code>
                </CodeBlock>
                <CodeBlock title="app/globals.css">
                  <code>{"@import 'tailwindcss';\n@import '@kazuemon/ui/tailwind.css';"}</code>
                </CodeBlock>
              </Step>
              <Step title="部品を置く">
                <p>部品は名前つきで読み込みます。ボタンを置く例です。</p>
                <CodeGroup>
                  <CodeBlock title="TypeScript" html={tsxHtml} />
                  <CodeBlock title="JavaScript" html={jsxHtml} />
                </CodeGroup>
              </Step>
            </Steps>
          </div>
          <Heading level={2} id="faq" className="mt-10">
            よくある質問
            <HeadingAnchor href="#faq" />
          </Heading>
          <Accordion className="mt-2">
            <AccordionItem value="react" title="React のバージョンは？">
              React 19 以降で動きます。
            </AccordionItem>
            <AccordionItem value="next" title="Next.js で使えますか？">
              使えます。リンクは <code>render</code> に Next.js の <code>Link</code> を渡します。
            </AccordionItem>
            <AccordionItem value="dark" title="ダークモードは？">
              ThemeProvider で切り替えます。
            </AccordionItem>
          </Accordion>
          <Heading level={2} size="lg" className="mt-12">
            次に読む
          </Heading>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LinkCard
              href="#tailwind"
              title="Tailwind の設定"
              description="@theme のトークンと、利用者の Tailwind を合わせる方法"
              site={false}
            />
            <LinkCard
              href="#theme"
              title="テーマと密度"
              description="ThemeProvider で、ダークモードと押しやすさの密度を切り替える"
              site={false}
            />
          </div>
          {/* ページの終わりの行。更新日・リンクのコピー・編集への案内を並べる */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <Text size="sm" variant="subtle">
              最終更新: <Time dateTime="2026-09-20" />
            </Text>
            <Link href="#edit">GitHub で編集する</Link>
          </div>
          <Pager
            className="mt-10"
            prev={{ href: '#intro', title: 'はじめに' }}
            next={{ href: '#tailwind', title: 'Tailwind の設定' }}
          />
        </main>
        <Affix belowNavbar render={<aside />} className="hidden h-fit w-52 shrink-0 xl:block">
          <TableOfContents label="このページの内容" items={tocItems} />
        </Affix>
      </div>
    </>
  );
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '部品のドキュメントサイトの見本です。上の帯と部品のメニュー・左の検索と目次（狭い幅では Drawer）・手順のある本文・ページ内の目次・次に読むページを、部品だけで組みます。検索の欄に語を打つと、目次の代わりに一致したページを並べます。密度はツールバーで切り替えます。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docs: Story = {
  name: 'ドキュメント',
  render: (_args, { globals }) => (
    <SamplePage density={densityOf(globals)} bare>
      <DocsScreen />
    </SamplePage>
  ),
};
