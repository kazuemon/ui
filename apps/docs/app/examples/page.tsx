// 見本のページの一覧。部品を実際の画面に並べたものを、1 つずつ開いて確かめられる
import { Container, LinkCard, Prose } from '@kazuemon/ui';
import type { Metadata } from 'next';
import NextLink from 'next/link';

import { examples } from '../../examples/manifest';
import { SiteHeader } from '../site-header';

export const metadata: Metadata = {
  title: '見本 | @kazuemon/ui',
  description: '@kazuemon/ui の部品を、実際の画面に並べた見本のページです',
};

export default function ExamplesIndex() {
  return (
    <>
      <SiteHeader current="examples" />

      <Container size="default" render={<main className="py-10" />}>
        <Prose as="article">
          <h1>見本のページ</h1>

          <p>
            部品を実際の画面に並べたものです。どのページも、右下のボタンから密度や props
            を切り替えられます。
          </p>
        </Prose>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {examples.map(({ slug, title, description }) => (
            <LinkCard
              key={slug}
              title={title}
              description={description}
              site={false}
              render={<NextLink href={`/examples/${slug}`} />}
            />
          ))}
        </div>
      </Container>
    </>
  );
}
