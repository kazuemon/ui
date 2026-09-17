import { Blockquote } from '../../../src/components/blockquote/Blockquote';
import { Callout } from '../../../src/components/callout/Callout';
import { Code } from '../../../src/components/code/Code';
import { CodeBlock } from '../../../src/components/code-block/CodeBlock';
import { diffHtml, shellHtml } from '../../../src/components/code-block/fixtures';
import { Divider } from '../../../src/components/divider/Divider';
import { Figure } from '../../../src/components/figure/Figure';
import { figureImageClassName } from '../../../src/components/figure/figure-styles';
import { FootnoteItem, FootnoteRef, Footnotes } from '../../../src/components/footnote/Footnote';
import { Heading } from '../../../src/components/heading/Heading';
import { Kbd } from '../../../src/components/kbd/Kbd';
import { Link } from '../../../src/components/link/Link';
import { List, ListItem } from '../../../src/components/list/List';
import { inlineStyles } from '../../../src/components/prose/inline-styles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../src/components/table/Table';
import { Text } from '../../../src/components/text/Text';
import { landscape, screenshot } from './images';

// 見本のページの「Markdown の記事」。Markdown を HTML に変換したときに出る要素を、ひととおり並べる
// Prose はまだないので、要素のあいだの余白は仮（Prose の軸で決める）。文字の飾りは inlineStyles を当てる

const s = inlineStyles();

export const MarkdownArticleScreen = () => (
  <article data-reading className="flex flex-col">
    <Text size="sm" tone="subtle">
      2026年9月17日・Design
    </Text>
    <Heading level={1} className="mt-1">
      Markdown で書いた記事の見本
    </Heading>
    <Text className="mt-4">
      この記事は、Markdown から変換した HTML の要素を
      <strong className={s.strong()}>ひととおり</strong>
      並べたものです。強調は <em className={s.em()}>ページから離れているもの</em>
      のように使い、古い情報は <del className={s.del()}>9月12日</del> 9月17日のように打ち消します。
      <br />
      改行のあとの行には、<mark className={s.mark()}>目立たせたい言葉</mark>と
      <Link href="#docs">文字のリンク</Link>
      を置きました。
    </Text>

    <Heading level={2} className="mt-10">
      リスト
    </Heading>
    <List className="mt-3">
      <ListItem>部品の高さは、マウスでも指でも 44px です。</ListItem>
      <ListItem>
        文字は、パソコンでは 16px、スマホの機能の画面では 14px にします。記事の中では、スマホでも
        16px のままです。
        <List>
          <ListItem>入力欄の文字は、どちらも 16px</ListItem>
          <ListItem>ラベルとキャプションは、どちらも同じ</ListItem>
        </List>
      </ListItem>
      <ListItem>
        <Code>data-reading</Code> を付けた要素の中が、読みものです。
      </ListItem>
    </List>
    <List as="ol" start={9} className="mt-4">
      <ListItem>Heading と Text を足す</ListItem>
      <ListItem>Prose を作る</ListItem>
      <ListItem>CodeBlock を作る</ListItem>
    </List>
    <List task className="mt-4">
      <ListItem checked>見出しと本文の大きさ</ListItem>
      <ListItem checked={false}>要素のあいだの余白</ListItem>
    </List>

    <Heading level={2} className="mt-10">
      コード
    </Heading>
    <Text className="mt-3">ライブラリは pnpm で入れます。</Text>
    <CodeBlock className="mt-4" html={shellHtml} />
    <CodeBlock className="mt-5" title="src/lib/posts.ts" html={diffHtml} />

    <Heading level={2} className="mt-10">
      引用と囲み
    </Heading>
    <Blockquote className="mt-3" source="— @kazuemon/ui の README">
      コンポーネントがいっぱいあるけど、マテリアルデザインほどかたい感じじゃないモダンな UI
      ライブラリがつくりたい。
    </Blockquote>
    <Callout color="warning" title="注意" className="mt-5">
      <Kbd>⌘</Kbd> + <Kbd>K</Kbd> の検索は、まだ使えません。
    </Callout>

    <Divider className="my-10" />

    <Heading level={2}>画像と表</Heading>
    <Figure className="mt-4" src={landscape} alt="空と山の絵" caption="図 1. 空と山" />
    <p className="mt-5">
      <img className={figureImageClassName} src={screenshot} alt="白っぽい画面の絵" />
    </p>
    <Table className="mt-5">
      <TableHead>
        <TableRow>
          <TableHeader>部品</TableHeader>
          <TableHeader>中の名前</TableHeader>
          <TableHeader align="right">高さ</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>ボタン</TableCell>
          <TableCell>
            <Code>Button</Code>
          </TableCell>
          <TableCell align="right">44px</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>入力欄</TableCell>
          <TableCell>
            <Code>TextField</Code>
          </TableCell>
          <TableCell align="right">44px</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>大きい指用</TableCell>
          <TableCell>
            <Code>coarse-large</Code>
          </TableCell>
          <TableCell align="right">52px</TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <Heading level={3} className="mt-8">
      脚注
    </Heading>
    <Text className="mt-2">
      和文と欧文を混ぜても、文字は行の中央にそろえます
      <FootnoteRef id="1" />
      。行の高さは整数の値にします
      <FootnoteRef id="2" />。
    </Text>
    <Divider className="mt-10" />
    <Footnotes label="脚注" className="mt-6">
      <FootnoteItem id="1">
        和文フォントは、縦の寸法を漢字の枠に合わせて補正しています。
      </FootnoteItem>
      <FootnoteItem id="2">端数があると、置かれた位置によって文字だけがずれます。</FootnoteItem>
    </Footnotes>
  </article>
);
