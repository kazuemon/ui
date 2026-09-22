'use client';

import { Heading, Prose, Text } from '@kazuemon/ui';

import { markdownArticleHtml } from './markdown-html';
import { SamplePage } from './sample-page';
import { note } from './sites';
import type { Example } from './types';

// Markdown を変換した HTML を、Prose にそのまま入れた見本

export const example: Example = {
  slug: 'markdown-prose',
  title: 'Markdown（Prose）',
  description: 'Markdown を変換した HTML を、Prose にそのまま入れた記事',
  controls: [
    {
      name: 'width',
      label: '本文の幅',
      type: 'radio',
      options: [
        { value: 'sm', label: '細い（480px）' },
        { value: 'md', label: '記事（720px）' },
        { value: 'lg', label: '広い（1080px）' },
      ],
    },
    { name: 'meta', label: '日付と題を出す', type: 'switch' },
  ],
  defaults: { width: 'md', meta: true },
  Screen: ({ args, density }) => (
    <SamplePage
      density={density}
      site={note}
      current="記事"
      width={args.width as 'sm' | 'md' | 'lg'}
    >
      <article className="flex flex-col">
        {args.meta && (
          <>
            <Text size="sm" variant="subtle">
              2026年9月17日・Design
            </Text>
            <Heading level={1} className="mt-1">
              Markdown で書いた記事の見本
            </Heading>
          </>
        )}
        {/* 変換した HTML は、Prose の子の div に入れる。見本の文字列は手で書いたもの */}
        <Prose className="mt-4">
          <div dangerouslySetInnerHTML={{ __html: markdownArticleHtml }} />
        </Prose>
      </article>
    </SamplePage>
  ),
};
