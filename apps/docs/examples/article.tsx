'use client';

import {
  Bleed,
  Button,
  Collapsible,
  Embed,
  Heading,
  HeadingAnchor,
  ImageZoom,
  LinkCard,
  Mark,
  Prose,
  Stack,
  Tag,
  Text,
  TextField,
  Time,
} from '@kazuemon/ui';

import { night, sunset } from './article-images';
import { markdownArticleHtml } from './markdown-html';
import { SamplePage } from './sample-page';
import { note } from './sites';
import type { Example } from './types';

// ブログの記事。Markdown を変換した HTML を Prose に入れ、変換では作れない部分（拡大できる画像・埋め込み・
// 畳んだ補足・見出しのリンク）は部品で書いて間に挟む。脚注は記事の最後に置くので、変換した HTML を脚注の前で分ける
const [bodyHtml, footnoteRest] = markdownArticleHtml.split('<section data-footnotes');
const footnotesHtml = `<section data-footnotes${footnoteRest}`;

// 埋め込みの中身（見本では、外のサイトを読まずに data: の HTML を出す）
const demoVideo = `data:text/html;charset=utf-8,${encodeURIComponent(
  '<title>デザインの進め方の動画</title><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#1c3a5e"><div style="width:64px;height:64px;border-radius:50%;background:#fff;opacity:.7"></div></body>'
)}`;

export const example: Example = {
  slug: 'article',
  title: '記事',
  description:
    'Markdown を変換した記事に、拡大できる画像・埋め込み・畳んだ補足・関連する記事を添えた 1 本',
  controls: [{ name: 'comments', label: 'コメント欄を出す', type: 'switch' }],
  defaults: { comments: true },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={note} current="記事">
      <article className="flex flex-col">
        <div className="flex items-center gap-2">
          <Time dateTime="2026-09-17" dateStyle="long" size="sm" variant="subtle" />
          <Tag size="sm">Design</Tag>
        </div>
        <Heading level={1} className="mt-1">
          Markdown で書いた記事の見本
        </Heading>
        <Prose className="mt-6">
          <Bleed>
            <ImageZoom
              src={sunset}
              alt="夕焼けの空と山の絵"
              width={1280}
              height={720}
              caption="押すと大きく見られます"
            />
          </Bleed>
          {/* 変換した HTML は、Prose の子の div に入れる。見本の文字列は手で書いたもの（ビルド時に自分で作った HTML だけを入れる） */}
          <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          <Heading level={2} id="embed">
            埋め込みと補足
            <HeadingAnchor href="#embed" />
          </Heading>
          <p>
            動画は、押したときに読み込みます。読み込むまでは外のサイトに何も送りません。見出しに載せると、
            <Mark>この節へのリンク</Mark>が出ます。
          </p>
          <Embed provider="youtube" clickToLoad src={demoVideo} title="デザインの進め方の動画" />
          <Collapsible variant="card" title="補足: 和文フォントの補正">
            <p>
              和文フォントは、縦の寸法を漢字の枠に合わせて補正しています。欧文と並べても、行の中央にそろいます。
            </p>
          </Collapsible>
          <ImageZoom src={night} alt="夜の空と山の絵" width={1280} height={720} caption="夜の絵" />
          <div dangerouslySetInnerHTML={{ __html: footnotesHtml }} />
        </Prose>
      </article>
      <Stack gap="md" className="mt-12 border-t border-line pt-8" render={<section />}>
        <Heading level={2} size="lg">
          関連する記事
        </Heading>
        <LinkCard
          href="#design-loop"
          title="候補を並べて選ぶループでデザインシステムを作る"
          description="原則とトークンを先に決め、Storybook に候補を並べて 1 軸ずつ選んでいく進め方と、その記録の残し方について。"
          site="Kazue Log"
          image={sunset}
        />
        <LinkCard
          href="#fonts"
          title="和文と欧文を同じ行にそろえる"
          description="IBM Plex Sans JP の縦の寸法を補正して、行の中央に文字を置く方法。"
          site="Kazue Log"
          image={night}
        />
      </Stack>
      {args.comments && (
        <Stack gap="md" className="mt-12 border-t border-line pt-8" render={<section />}>
          <Heading level={2} size="lg">
            コメント
          </Heading>
          <TextField label="名前" placeholder="かずえもん" />
          <TextField label="コメント" caption="公開されます" />
          <div>
            <Button color="primary">送信する</Button>
          </div>
        </Stack>
      )}
      <Text size="sm" variant="subtle" className="mt-8">
        最終更新: <Time dateTime="2026-09-20" dateStyle="long" />
      </Text>
    </SamplePage>
  ),
};
