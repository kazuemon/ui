'use client';

import {
  Accordion,
  type AccordionVariant,
  AccordionItem,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Callout,
  type NoticeVariant,
  CodeBlock,
  CodeGroup,
  type CodeGroupIndicator,
  Drawer,
  Heading,
  Icon,
  Link,
  Navbar,
  type NavbarCurrentIndicator,
  NavbarLink,
  Pager,
  Prose,
  TableOfContents,
  Text,
  Time,
  Tree,
  TreeItem,
} from '@kazuemon/ui';
import { ListIcon } from '@phosphor-icons/react';

import { bunHtml, jsxHtml, npmHtml, pnpmHtml, tsxHtml, yarnHtml } from './code-group-fixtures';
import { SamplePage } from './sample-page';
import type { Example } from './types';

// 見本のページ: ドキュメントサイト。上に Navbar、左に Tree（狭い幅では Drawer）、本文、右にページ内の目次（広い幅だけ）、下に Pager
const tocItems = [
  { id: 'add-package', text: 'パッケージを追加する', level: 2 },
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

function DocsScreen({
  navbarCurrentIndicator,
  navbarSticky,
  calloutAppearance,
  codeGroupIndicator,
  accordionAppearance,
}: {
  navbarCurrentIndicator: NavbarCurrentIndicator;
  navbarSticky: boolean;
  calloutAppearance: NoticeVariant;
  codeGroupIndicator: CodeGroupIndicator;
  accordionAppearance: AccordionVariant;
}) {
  return (
    <>
      <Navbar
        sticky={navbarSticky}
        currentIndicator={navbarCurrentIndicator}
        size="wide"
        brand={
          <a href="#top" className="flex items-center gap-2 text-fg no-underline">
            <span aria-hidden="true" className="size-6 rounded-lg bg-primary" />
            kazuemon/ui
          </a>
        }
        actions={<Button variant="outline">GitHub</Button>}
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
          <Heading level={2} size={3} id="add-package" className="mt-10">
            パッケージを追加する
          </Heading>
          <Prose className="mt-2">
            <p>お使いのパッケージマネージャで追加します。</p>
          </Prose>
          <div data-reading className="mt-4">
            <CodeGroup indicator={codeGroupIndicator}>
              <CodeBlock title="pnpm" html={pnpmHtml} />
              <CodeBlock title="npm" html={npmHtml} />
              <CodeBlock title="yarn" html={yarnHtml} />
              <CodeBlock title="bun" html={bunHtml} />
            </CodeGroup>
          </div>
          <Callout
            status="warning"
            variant={calloutAppearance}
            title="Tailwind が必要です"
            className="mt-6"
          >
            スタイルは Tailwind CSS v4 の <code>@theme</code> を前提にしています。先に Tailwind
            を入れてください。
          </Callout>
          <Heading level={2} size={3} id="try-it" className="mt-10">
            使ってみる
          </Heading>
          <Prose className="mt-2">
            <p>部品は名前つきで読み込みます。ボタンを置く例です。</p>
          </Prose>
          <div data-reading className="mt-4">
            <CodeGroup indicator={codeGroupIndicator}>
              <CodeBlock title="TypeScript" html={tsxHtml} />
              <CodeBlock title="JavaScript" html={jsxHtml} />
            </CodeGroup>
          </div>
          <Heading level={2} size={3} id="faq" className="mt-10">
            よくある質問
          </Heading>
          <Accordion variant={accordionAppearance} className="mt-2">
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
        <aside className="sticky top-20 hidden h-fit w-52 shrink-0 xl:block">
          <TableOfContents label="このページの内容" items={tocItems} />
        </aside>
      </div>
    </>
  );
}

export const example: Example = {
  slug: 'docs',
  title: 'ドキュメント',
  description:
    'ドキュメントサイトの見本。上の帯・左の目次（狭い幅では Drawer）・本文・前後のページを部品だけで組みます。',
  controls: [
    {
      name: 'navbarCurrentIndicator',
      label: 'ヘッダーのいまいるページの印',
      type: 'select',
      options: [
        { value: 'text', label: '文字の色だけ' },
        { value: 'neutral', label: '淡い面' },
        { value: 'primary', label: '利用者の色の面' },
        {
          value: 'underline',
          label: '下線',
          caption:
            'ヘッダーが広いときだけ下線になります。畳んでメニューになると、文字の色だけになります',
        },
      ],
    },
    {
      name: 'navbarSticky',
      label: 'ヘッダーを固定する',
      type: 'switch',
    },
    {
      name: 'calloutAppearance',
      label: 'コールアウトの見た目',
      type: 'select',
      options: [
        {
          value: 'soft',
          label: '淡い面',
          caption: '淡い色の面に、状態の色の題とアイコンを乗せます',
        },
        { value: 'filled', label: '塗り面', caption: '状態の色を濃く塗り、白い文字にします' },
        { value: 'outline', label: '線だけ', caption: '白い面に、状態の色の枠線だけを引きます' },
        {
          value: 'muted',
          label: '控えめ',
          caption: 'グレーの面に小さな題を乗せます。アイコンは既定で出しません',
        },
      ],
    },
    {
      name: 'codeGroupIndicator',
      label: 'コードのタブの印',
      type: 'radio',
      options: [
        { value: 'line', label: '下線', caption: '選んだタブの文字を濃く太くし、下に線も引きます' },
        {
          value: 'text',
          label: '文字の色だけ',
          caption: '選んだタブの文字を濃く太くするだけで、線は引きません',
        },
      ],
    },
    {
      name: 'accordionAppearance',
      label: 'よくある質問の見た目',
      type: 'select',
      options: [
        {
          value: 'plain',
          label: '枠なし',
          caption: '塗りも線もなく、マウスを載せたときだけ淡く敷きます',
        },
        {
          value: 'open-filled',
          label: '開いた行だけ塗る',
          caption: '開いている項目だけグレーで塗ります',
        },
        {
          value: 'filled',
          label: '塗り面',
          caption: 'いつもグレーで塗り、項目のあいだを少し離します',
        },
        {
          value: 'divided',
          label: '区切り線',
          caption: '項目のあいだと一覧の上下に区切り線を引きます',
        },
      ],
    },
  ],
  defaults: {
    navbarCurrentIndicator: 'text',
    navbarSticky: true,
    calloutAppearance: 'soft',
    codeGroupIndicator: 'line',
    accordionAppearance: 'divided',
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} bare>
      <DocsScreen
        navbarCurrentIndicator={args.navbarCurrentIndicator as NavbarCurrentIndicator}
        navbarSticky={args.navbarSticky as boolean}
        calloutAppearance={args.calloutAppearance as NoticeVariant}
        codeGroupIndicator={args.codeGroupIndicator as CodeGroupIndicator}
        accordionAppearance={args.accordionAppearance as AccordionVariant}
      />
    </SamplePage>
  ),
};
