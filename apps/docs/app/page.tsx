// ドキュメントサイトのトップ。部品はそれぞれ 'use client' を持つので、このページはサーバーのまま描く
import {
  Affix,
  Callout,
  Container,
  Grid,
  Link,
  LinkCard,
  Prose,
  TableOfContents,
  type TableOfContentsItem,
  Text,
} from '@kazuemon/ui';
import NextLink from 'next/link';

import { examples } from '../examples/manifest';
import { SiteHeader } from './site-header';

const STORYBOOK = 'https://story.ui.k6n.jp/';
const REPOSITORY = 'https://github.com/kazuemon/ui';
const PRINCIPLES = 'https://github.com/kazuemon/ui/blob/main/design/principles.md';
const ADR = 'https://github.com/kazuemon/ui/blob/main/design/adr/README.md';

// トップページから見本への動線に出す 3 つ（記事・サインイン・ダッシュボード。画面の種類が伝わる組み合わせ）
const FEATURED_EXAMPLE_SLUGS = ['article', 'sign-in', 'dashboard'];
const featuredExamples = FEATURED_EXAMPLE_SLUGS.map((slug) =>
  examples.find((example) => example.slug === slug)
).filter((example) => example !== undefined);

const toc: TableOfContentsItem[] = [
  { id: 'motivation', text: 'なぜ作っているのか', level: 2 },
  { id: 'milestone', text: 'マイルストーン', level: 2 },
  { id: 'seen', text: 'いま見られるもの', level: 2 },
  { id: 'examples', text: '見本のページ', level: 3 },
  { id: 'storybook', text: 'Storybook', level: 3 },
  { id: 'github', text: 'GitHub', level: 3 },
];

const milestones = [
  'ドキュメント整備（部品ごとのページと、使い方）',
  'ダークモード',
  '多言語',
  'Tailwind なしでも使えるようにする',
  'スタイルの衝突を避ける',
  'ツリーシェイク',
  'テーマの上書き（ブランドの色や角を差し替えられるようにする）',
  'npm 公開 🎉',
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

              <Callout status="info" title="現在開発中です">
                <p>
                  @kazuemon/ui は、まだ公開していません！
                  部品も、このサイトも作っている途中です。いまの部品と、その状態や props は{' '}
                  <Link href={STORYBOOK}>Storybook</Link> で見られます。
                </p>
              </Callout>

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

              <p>npm に公開するまでに、決めることと作るものです。</p>

              {/* Markdown（GFM）のチェックリストと同じ形。見た目は Prose が当てる */}
              <ul className="contains-task-list">
                {milestones.map((label) => (
                  <li key={label} className="task-list-item">
                    <input type="checkbox" disabled /> {label}
                  </li>
                ))}
              </ul>
            </Prose>

            <Prose as="article" className="mt-10">
              <h2 id="seen">いま見られるもの</h2>

              <p>部品は 70 個ほどです。実際の画面に並べた見本、Storybook、GitHub で見られます。</p>

              <h3 id="examples">見本のページ</h3>

              <p>
                よくある画面を実際のコンポーネントで構成したサンプルページです（記事・ドキュメント・サインイン・設定・一覧・SNS
                など）。
              </p>
            </Prose>

            <Grid columns={{ base: 1, sm: 3 }} className="mt-4">
              {featuredExamples.map(({ slug, title, description }) => (
                <LinkCard
                  key={slug}
                  title={title}
                  description={description}
                  site={false}
                  render={<NextLink href={`/examples/${slug}`} />}
                />
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
