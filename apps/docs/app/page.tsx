// ドキュメントサイトのトップ。部品はそれぞれ 'use client' を持つので、このページはサーバーのまま描く
import {
  Affix,
  Callout,
  Container,
  Link,
  Prose,
  TableOfContents,
  type TableOfContentsItem,
  Text,
} from '@kazuemon/ui';

import { SiteHeader } from './site-header';

const STORYBOOK = 'https://story.ui.k6n.jp/';
const REPOSITORY = 'https://github.com/kazuemon/ui';
const PRINCIPLES = 'https://github.com/kazuemon/ui/blob/main/design/principles.md';
const ADR = 'https://github.com/kazuemon/ui/blob/main/design/adr/README.md';

const toc: TableOfContentsItem[] = [
  { id: 'motivation', text: 'なぜ作っているのか', level: 2 },
  { id: 'milestone', text: 'マイルストーン', level: 2 },
  { id: 'storybook', text: 'いま見られるもの', level: 2 },
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
              <h2 id="storybook">いま見られるもの</h2>

              <p>
                部品は 70
                個ほどです。状態と密度を並べたストーリーと、実際の画面に並べた見本（記事・ドキュメント・サインイン・設定・一覧・SNS）が
                Storybook にあります。
              </p>
            </Prose>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link variant="button" color="primary" href={STORYBOOK} target="_blank">
                Storybook を見る
              </Link>
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
