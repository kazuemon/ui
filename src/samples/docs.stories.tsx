import { ListIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SamplePage, densityOf } from './SamplePage';
import { Accordion, AccordionItem } from '../components/accordion/Accordion';
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
import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import { Navbar, NavbarLink } from '../components/navbar/Navbar';
import { Pager } from '../components/pager/Pager';
import { Prose } from '../components/prose/Prose';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/Tabs';
import { TableOfContents } from '../components/table-of-contents/TableOfContents';
import { Tree, TreeItem } from '../components/tree/Tree';

// 見本のページ: ドキュメントサイト。上に Navbar、左に Tree（狭い幅では Drawer）、本文、右にページ内の目次（広い幅だけ）、下に Pager
const tocItems = [
  { id: 'add-package', text: 'パッケージを追加する', level: 2 },
  { id: 'try-it', text: '使ってみる', level: 2 },
  { id: 'faq', text: 'よくある質問', level: 2 },
];

const nav = (
  <Tree label="ドキュメント" rowWidth="full">
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
        actions={<Button appearance="outline">GitHub</Button>}
      >
        <NavbarLink href="#docs" current>
          ドキュメント
        </NavbarLink>
        <NavbarLink href="#components">部品</NavbarLink>
        <NavbarLink href="#blog">ブログ</NavbarLink>
      </Navbar>
      <div className="mx-auto flex max-w-[1280px] gap-10 px-5 py-8">
        <aside className="sticky top-20 hidden h-fit w-60 shrink-0 lg:block">{nav}</aside>
        <main className="min-w-0 flex-1">
          <div className="mb-4 lg:hidden">
            <Drawer
              side="left"
              title="ドキュメント"
              trigger={
                <Button appearance="outline">
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
          <Heading level={2} size={3} id="add-package" className="mt-10">
            パッケージを追加する
          </Heading>
          <Prose className="mt-2">
            <p>お使いのパッケージマネージャで追加します。</p>
          </Prose>
          <div data-reading className="mt-4">
            <CodeGroup>
              <CodeBlock title="pnpm" html={pnpmHtml} />
              <CodeBlock title="npm" html={npmHtml} />
              <CodeBlock title="yarn" html={yarnHtml} />
              <CodeBlock title="bun" html={bunHtml} />
            </CodeGroup>
          </div>
          <Callout color="warning" title="Tailwind が必要です" className="mt-6">
            スタイルは Tailwind CSS v4 の <code>@theme</code> を前提にしています。先に Tailwind
            を入れてください。
          </Callout>
          <Heading level={2} size={3} id="try-it" className="mt-10">
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
            <TabPanel value="tsx" className="pt-4">
              <div data-reading>
                <CodeBlock html={tsxHtml} />
              </div>
            </TabPanel>
            <TabPanel value="jsx" className="pt-4">
              <div data-reading>
                <CodeBlock html={jsxHtml} />
              </div>
            </TabPanel>
          </Tabs>
          <div className="mt-4 flex items-center gap-3">
            <CopyButton text="pnpm add @kazuemon/ui" label="インストールのコマンドをコピー" />
          </div>
          <Heading level={2} size={3} id="faq" className="mt-10">
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
          <Pager
            className="mt-12"
            prev={{ href: '#intro', title: 'はじめに' }}
            next={{ href: '#tailwind', title: 'Tailwind の設定' }}
          />
        </main>
        <aside className="sticky top-20 hidden h-fit w-52 shrink-0 xl:block">
          <TableOfContents label="このページの内容" items={tocItems} />
        </aside>
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
          '部品のドキュメントサイトの見本です。上の帯・左の目次（狭い幅では Drawer）・本文・前後のページを、部品だけで組みます。密度はツールバーで切り替えます。',
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
