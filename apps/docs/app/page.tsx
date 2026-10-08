// ドキュメントサイトのトップ。部品はそれぞれ 'use client' を持つので、このページはサーバーのまま描く
import {
  Affix,
  Callout,
  CodeBlock,
  Container,
  Grid,
  Link,
  Prose,
  TableOfContents,
  type TableOfContentsItem,
  Text,
} from '@kazuemon/ui';
import NextLink from 'next/link';

import { ExampleCard } from '../examples/example-card';
import { examples } from '../examples/manifest';
import { SiteHeader } from './site-header';

const STORYBOOK = 'https://story.ui.k6n.jp/';
const REPOSITORY = 'https://github.com/kazuemon/ui';
const PRINCIPLES = 'https://github.com/kazuemon/ui/blob/main/design/principles.md';
const ADR = 'https://github.com/kazuemon/ui/blob/main/design/adr/README.md';
const NPM = 'https://www.npmjs.com/package/@kazuemon/ui';
const CHANGELOG = 'https://github.com/kazuemon/ui/blob/main/CHANGELOG.md';

const INSTALL_SH = `pnpm add @kazuemon/ui

# 日本語の推奨フォント（IBM Plex Sans JP）を使うときに必要です
pnpm add @fontsource/ibm-plex-sans-jp

# Icon などに Phosphor のアイコンを渡すときに必要です
pnpm add @phosphor-icons/react`;

const INSTALL_CSS = `@import 'tailwindcss';
@import '@kazuemon/ui/tailwind.css';
@import '@kazuemon/ui/fonts.css'; /* 欧文と等幅（Mulish・Geist Mono） */
@import '@kazuemon/ui/fonts-ja.css'; /* 和文（IBM Plex Sans JP） */`;

// トップページから見本への動線に出す 3 つ（記事・新規登録・ダッシュボード。画面の種類が伝わる組み合わせ）
const FEATURED_EXAMPLE_SLUGS = ['article', 'sign-up', 'dashboard'];
const featuredExamples = FEATURED_EXAMPLE_SLUGS.map((slug) =>
  examples.find((example) => example.slug === slug)
).filter((example) => example !== undefined);

const toc: TableOfContentsItem[] = [
  { id: 'install', text: 'インストール', level: 2 },
  { id: 'motivation', text: 'なぜ作っているのか', level: 2 },
  { id: 'milestone', text: 'マイルストーン', level: 2 },
  { id: 'seen', text: 'いま見られるもの', level: 2 },
  { id: 'examples', text: '見本のページ', level: 3 },
  { id: 'storybook', text: 'Storybook', level: 3 },
  { id: 'github', text: 'GitHub', level: 3 },
];

const milestones = [
  { label: 'npm でのテスト公開（v0）', done: true },
  { label: 'Server Components 対応', done: true },
  { label: 'ツリーシェイク', done: true },
  { label: 'ドキュメント整備（部品ごとのページと、使い方）', done: false },
  { label: 'ダークモード', done: false },
  { label: '多言語', done: false },
  { label: 'Tailwind なしでも使えるようにする', done: false },
  { label: 'スタイルの衝突を避ける', done: false },
  { label: 'テーマの上書き（ブランドの色や角を差し替えられるようにする）', done: false },
  { label: 'v1 の公開 🎉', done: false },
];

const footerLinks = [
  { label: 'Storybook', href: STORYBOOK },
  { label: 'GitHub', href: REPOSITORY },
  { label: 'デザイン原則', href: PRINCIPLES },
  { label: 'ADR', href: ADR },
];

export default function Home() {
  return (
    <>
      <SiteHeader current="home" />

      <Container size="default" render={<main className="py-10" />}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="min-w-0">
            <Prose as="article">
              <h1>@kazuemon/ui</h1>

              <p>
                @kazuemon/ui
                は、かずえもんの好みのデザインと、いろいろなところから学んだ考え方を反映させた、React
                の UI コンポーネントライブラリです。
              </p>

              <Callout status="warning" title="v0 としてテスト公開中です">
                <p>
                  <Link href={NPM}>npm</Link> で v0 として公開しています。v1
                  までは、版を上げるたびに props
                  の名前や見た目を変える破壊的な変更が頻繁に入ります。使うときは版を固定し、上げる前に{' '}
                  <Link href={CHANGELOG}>CHANGELOG</Link> を確かめてください。
                </p>
              </Callout>

              <h2 id="install">インストール</h2>

              <p>Tailwind CSS v4 と React 19 が必要です。</p>
            </Prose>

            <CodeBlock language="sh" className="mt-4">
              <code>{INSTALL_SH}</code>
            </CodeBlock>

            <Prose as="article" className="mt-6">
              <p>
                アプリの CSS で、<code>tailwindcss</code> のあとに読みます。部品のクラスは、アプリの
                Tailwind がまとめて作ります。
              </p>
            </Prose>

            <CodeBlock language="css" className="mt-4">
              <code>{INSTALL_CSS}</code>
            </CodeBlock>

            <Prose as="article" className="mt-10">
              <h2 id="motivation">なぜ作っているのか</h2>

              <ul>
                <li>
                  好みに合うライブラリに出会えませんでした
                  <ul>
                    <li>
                      どれも完成度は高いのに、自分の作りたい画面にはしっくり来ません。ただ、何が足りないのかを自分でも言えませんでした
                    </li>
                  </ul>
                </li>
                <li>
                  パソコンとスマートフォンの両方で使いやすいものが欲しい
                  <ul>
                    <li>
                      画面の幅で切り替えるだけでは、指で押しにくかったり、デスクトップで間延びしたりします
                    </li>
                  </ul>
                </li>
                <li>
                  ドキュメントが、そのライブラリ自身で作られていないのが不満
                  <ul>
                    <li>
                      「この見た目が欲しいのに、これは配られていない」ということがよくあります。だからこのサイトも、専用の部品を作らず、配っている部品だけで組んでいます
                    </li>
                  </ul>
                </li>
                <li>
                  AI と一緒にどこまで作れるかの検証
                  <ul>
                    <li>これは、ライブラリそのものと同じくらい大きな目的です</li>
                  </ul>
                </li>
              </ul>
            </Prose>

            <Prose as="article" className="mt-10">
              <h2 id="milestone">マイルストーン</h2>

              <p>v1 を公開するまでに、決めることと作るものです。</p>

              {/* Markdown（GFM）のチェックリストと同じ形。見た目は Prose が当てる */}
              <ul className="contains-task-list">
                {milestones.map(({ label, done }) => (
                  <li key={label} className="task-list-item">
                    <input type="checkbox" checked={done} disabled /> {label}
                  </li>
                ))}
              </ul>
            </Prose>

            <Prose as="article" className="mt-10">
              <h2 id="seen">いま見られるもの</h2>

              <p>
                部品は 110 個あまりです。実際の画面に並べた見本、Storybook、GitHub で見られます。
              </p>

              <h3 id="examples">見本のページ</h3>

              <p>
                よくある画面を実際のコンポーネントで構成したサンプルページです（記事・ドキュメント・サインイン・設定・一覧・SNS
                など）。
              </p>
            </Prose>

            <Grid columns={{ base: 1, sm: 3 }} className="mt-4">
              {featuredExamples.map((example) => (
                <ExampleCard key={example.slug} example={example} headingLevel={4} />
              ))}
            </Grid>

            <div className="mt-4">
              <Link variant="button" color="primary" render={<NextLink href="/examples" />}>
                他の見本も見る
              </Link>
            </div>

            <Prose as="article" className="mt-10">
              <h3 id="storybook">Storybook</h3>

              <p>部品の一覧です。状態・色・密度を並べて、1 つずつ確かめられます。</p>
            </Prose>

            <div className="mt-4">
              <Link variant="outline" href={STORYBOOK} target="_blank">
                Storybook を見る
              </Link>
            </div>

            <Prose as="article" className="mt-10">
              <h3 id="github">GitHub</h3>

              <p>デザイン原則や、決めた経緯（ADR）も公開しています。ソースコードも読めます。</p>
            </Prose>

            <div className="mt-4">
              <Link variant="outline" href={REPOSITORY} target="_blank">
                GitHub で見る
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <Affix belowNavbar render={<aside />}>
              <TableOfContents items={toc} />
            </Affix>
          </div>
        </div>
      </Container>

      <footer className="mt-16 border-t border-line py-8">
        <Container size="wide">
          <nav aria-label="サイトの行き先" className="mb-4">
            <ul className="flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
              {footerLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <Text size="sm" variant="subtle">
            © 2026 kazuemon
          </Text>
        </Container>
      </footer>
    </>
  );
}
