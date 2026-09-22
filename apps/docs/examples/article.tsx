'use client';

import { Button, Heading, TextField } from '@kazuemon/ui';

import { SamplePage } from './sample-page';
import { note } from './sites';
import { ArticleScreen, type ArticleOptions, type CalloutStyle } from './screens';
import type { Example } from './types';

// ブログの記事の見本。囲みと引用の見た目を切り替えて確かめます

export const example: Example = {
  slug: 'article',
  title: '記事',
  description: 'ブログの記事。囲みや引用の見た目を組み合わせて確かめます',
  controls: [
    {
      name: 'callout',
      label: '記事の中のコールアウトの見た目',
      type: 'select',
      options: [
        {
          value: 'soft',
          label: '淡い面',
          caption: '色に合わせた淡い面に、色ごとのアイコンと題を置きます',
        },
        {
          value: 'soft-no-icon',
          label: '淡い面（アイコンなし）',
          caption: 'soft の面から、アイコンだけを外します',
        },
        {
          value: 'muted',
          label: '控えめ',
          caption: 'グレーの面に、色付きの小さな題だけを置きます。アイコンは付きません',
        },
        {
          value: 'outline',
          label: '線だけ',
          caption: '白い面に、色の枠線とアイコンを付けます',
        },
        {
          value: 'filled',
          label: '塗り面',
          caption: '色を濃く塗りつぶし、白抜きの題とアイコンにします',
        },
      ],
    },
    {
      name: 'blockquoteAppearance',
      label: '引用の見た目',
      type: 'radio',
      options: [
        { value: 'line', label: '左の線', caption: '文の左に、色の細い線を引きます' },
        { value: 'surface', label: '面', caption: '入力欄と同じグレーの面に載せます' },
      ],
    },
    { name: 'blockquoteIcon', label: '引用に引用符を出す', type: 'switch' },
    {
      name: 'blockquoteColor',
      label: '引用の色',
      type: 'select',
      options: [
        { value: 'neutral', label: 'グレー' },
        { value: 'brand', label: '水色（ブランドカラー）' },
        { value: 'primary', label: 'ブルー' },
        { value: 'secondary', label: 'ピンク' },
      ],
    },
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
    { name: 'comments', label: 'コメント欄を出す', type: 'switch' },
  ],
  defaults: {
    callout: 'soft',
    blockquoteAppearance: 'line',
    blockquoteColor: 'neutral',
    blockquoteIcon: false,
    width: 'md',
    comments: true,
  },
  Screen: ({ args, density }) => (
    <SamplePage
      density={density}
      site={note}
      current="記事"
      width={args.width as 'sm' | 'md' | 'lg'}
    >
      {/* 記事は読みもの。Prose ができるまでは data-reading を直接付ける */}
      <div data-reading>
        <ArticleScreen
          full
          callout={args.callout as CalloutStyle}
          blockquote={
            {
              variant: args.blockquoteAppearance,
              color: args.blockquoteColor,
              icon: args.blockquoteIcon,
            } as ArticleOptions['blockquote']
          }
        />
      </div>
      {args.comments && (
        <section className="mt-12 flex flex-col gap-4 border-t border-line pt-8">
          <Heading level={2} size={3}>
            コメント
          </Heading>
          <TextField label="名前" placeholder="かずえもん" />
          <TextField label="コメント" caption="公開されます" />
          <div>
            <Button color="primary">送信する</Button>
          </div>
        </section>
      )}
    </SamplePage>
  ),
};
