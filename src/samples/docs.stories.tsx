import { BookOpenIcon, ListIcon, PaletteIcon, SquaresFourIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SamplePage, densityOf } from './SamplePage';
import { Accordion, AccordionItem } from '../components/accordion/Accordion';
import { Affix } from '../components/affix/Affix';
import { Breadcrumb, BreadcrumbItem } from '../components/breadcrumb/Breadcrumb';
import { Button } from '../components/button/Button';
import { Callout } from '../components/callout/Callout';
import { CodeBlock } from '../components/code-block/CodeBlock';
import { CodeGroup } from '../components/code-group/CodeGroup';
import {
  bunHtml,
  npmHtml,
  pnpmHtml,
  tsxHtml,
  jsxHtml,
  yarnHtml,
} from '../components/code-group/fixtures';
import { CopyButton } from '../components/copy-button/CopyButton';
import { Drawer } from '../components/drawer/Drawer';
import { FileTree, FileTreeItem } from '../components/file-tree/FileTree';
import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import { LinkCard } from '../components/link-card/LinkCard';
import { Navbar } from '../components/navbar/Navbar';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from '../components/navigation-menu/NavigationMenu';
import { Pager } from '../components/pager/Pager';
import { Prose } from '../components/prose/Prose';
import { Step, Steps } from '../components/steps/Steps';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/Tabs';
import { TableOfContents } from '../components/table-of-contents/TableOfContents';
import { Tree, TreeItem } from '../components/tree/Tree';

// 見本のページ: ドキュメントサイト。上に Navbar（部品の一覧は NavigationMenu で開く）、左に Tree（狭い幅では Drawer）、本文、
//   右にページ内の目次（広い幅だけ。Affix で帯の下に留める）、下に次に読むページと Pager
const tocItems = [
  { id: 'add-package', text: 'パッケージを追加する', level: 2 },
  { id: 'files', text: 'ファイルの置き場所', level: 2 },
  { id: 'try-it', text: '使ってみる', level: 2 },
  { id: 'faq', text: 'よくある質問', level: 2 },
];

const nav = (
  <Tree accessibleName="ドキュメント" rowWidth="full">
    <TreeItem label="はじめに" href="#intro" />
    <TreeItem label="導入" defaultExpanded>
      <TreeItem label="インストール" href="#install" current />
      <TreeItem label="Tailwind の設定" href="#tailwind" />
      <TreeItem label="テーマと密度" href="#theme" />
    </TreeItem>
    <TreeItem label="部品" defaultExpanded>
      <TreeItem label="Button" href="#button" />
      <TreeItem label="入力" defaultExpanded>
        <TreeItem label="TextField" href="#text-field" />
        <TreeItem label="Checkbox" href="#checkbox" />
      </TreeItem>
    </TreeItem>
    <TreeItem label="デザイン原則" href="#principles" />
  </Tree>
);

function DocsScreen() {
  return (
    <>
      <Navbar
        sticky
        size="wide"
        brand={
          <a href="#top" className="flex items-center gap-2 text-fg no-underline">
            <span aria-hidden="true" className="size-6 rounded-lg bg-primary" />
            kazuemon/ui
          </a>
        }
        actions={<Button variant="outline">GitHub</Button>}
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
        <Affix belowNavbar render={<aside />} className="hidden h-fit w-60 shrink-0 lg:block">
          {nav}
        </Affix>
        <main className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <Drawer
              side="left"
              title="ドキュメント"
              trigger={
                <Button variant="outline">
                  <Icon icon={ListIcon} />
                  目次
                </Button>
              }
            >
              {nav}
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
          <Heading level={2} size="lg" id="add-package" className="mt-10">
            パッケージを追加する
          </Heading>
          <Callout status="warning" title="Tailwind が必要です" className="mt-4">
            スタイルは Tailwind CSS v4 の <code>@theme</code> を前提にしています。先に Tailwind
            を入れてください。
          </Callout>
          <Prose className="mt-6">
            <Steps headingLevel={3}>
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
                  アプリの CSS の先頭で、Tailwind のあとに <code>@kazuemon/ui/tailwind.css</code>{' '}
                  を読み込みます。
                </p>
              </Step>
              <Step title="部品を置く">
                <p>下の「使ってみる」のように、部品を名前つきで読み込んで置きます。</p>
              </Step>
            </Steps>
          </Prose>
          <Heading level={2} size="lg" id="files" className="mt-10">
            ファイルの置き場所
          </Heading>
          <Prose className="mt-2">
            <p>Next.js のプロジェクトなら、次のように置きます。</p>
            <FileTree>
              <FileTreeItem label="app">
                <FileTreeItem label="globals.css" comment="ここで読み込む" highlighted />
                <FileTreeItem label="layout.tsx" />
                <FileTreeItem label="page.tsx" />
              </FileTreeItem>
              <FileTreeItem label="package.json" />
            </FileTree>
          </Prose>
          <Heading level={2} size="lg" id="try-it" className="mt-10">
            使ってみる
          </Heading>
          <Prose className="mt-2">
            <p>部品は名前つきで読み込みます。ボタンを置く例です。</p>
          </Prose>
          <Tabs defaultValue="tsx" className="mt-4">
            <TabList aria-label="言語">
              <Tab value="tsx">TypeScript</Tab>
              <Tab value="jsx">JavaScript</Tab>
            </TabList>
            <TabPanel value="tsx">
              <div data-reading>
                <CodeBlock html={tsxHtml} />
              </div>
            </TabPanel>
            <TabPanel value="jsx">
              <div data-reading>
                <CodeBlock html={jsxHtml} />
              </div>
            </TabPanel>
          </Tabs>
          <div className="mt-4 flex items-center gap-3">
            <CopyButton text="pnpm add @kazuemon/ui" label="インストールのコマンドをコピー" />
          </div>
          <Heading level={2} size="lg" id="faq" className="mt-10">
            よくある質問
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
          <Pager
            className="mt-12"
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
          '部品のドキュメントサイトの見本です。上の帯と部品のメニュー・左の目次（狭い幅では Drawer）・手順のある本文・ファイルの構成・次に読むページを、部品だけで組みます。密度はツールバーで切り替えます。',
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
