import { Blockquote, type BlockquoteProps } from '../components/blockquote/Blockquote';
import { Code } from '../components/code/Code';
import { Heading } from '../components/heading/Heading';
import { Kbd } from '../components/kbd/Kbd';
import { Link } from '../components/link/Link';
import { Callout } from '../components/callout/Callout';
import type { NoticeVariant } from '../internal/notice-surface/notice-surface';
import { Tag } from '../components/tag/Tag';
import { Text } from '../components/text/Text';

// 比較のストーリーと見本のページで共有する画面。要素のあいだの余白は仮（Prose の軸で決める）

/** 引用符のアイコン（Phosphor の Quotes、Regular の線）。見本のページで Blockquote の icon に渡す */
export const QuotesIcon = () => (
  <svg
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ strokeWidth: 'var(--icon-stroke)' }}
  >
    <path d="M108,144H40a8,8,0,0,1-8-8V72a8,8,0,0,1,8-8h60a8,8,0,0,1,8,8v88a40,40,0,0,1-40,40" />
    <path d="M224,144H156a8,8,0,0,1-8-8V72a8,8,0,0,1,8-8h60a8,8,0,0,1,8,8v88a40,40,0,0,1-40,40" />
  </svg>
);

/** 記事の中の囲みの見た目。soft-no-icon は soft からアイコンを外した形 */
export type CalloutStyle = NoticeVariant | 'soft-no-icon';

export interface ArticleOptions {
  blockquote?: Pick<BlockquoteProps, 'variant' | 'color'> & { icon?: boolean };
  callout?: CalloutStyle;
}

/** ブログの記事 */
export const ArticleScreen = ({
  blockquote = {},
  callout,
  full = false,
}: ArticleOptions & { full?: boolean }) => (
  <article className="flex flex-col">
    <Text size="sm" variant="subtle">
      2026年9月17日・Design
    </Text>
    <Heading level={1} className="mt-1">
      ポートフォリオを Next.js で作り直しました
    </Heading>
    <div className="mt-3 flex flex-wrap gap-2">
      <Tag color="primary">Next.js</Tag>
      <Tag>Design System</Tag>
    </div>
    <Text className="mt-4">
      3 年ぶりに、自分のサイトを作り直しました。今回は UI Library の @kazuemon/ui
      を先に作り、その部品だけでページを組んでいます。くわしい経緯は
      <Link href="#about">このサイトについて</Link>
      にまとめました。
    </Text>
    <Heading level={2} className="mt-10">
      Design System を作る理由
    </Heading>
    <Text className="mt-3">
      デスクトップ優先の UI はモバイルに合わず、モバイル優先の UI
      はデスクトップで密度が低くなります。どちらにも、それぞれに合った密度の部品が欲しかったのです。
    </Text>
    {full && (
      <>
        <Blockquote
          className="mt-5"
          variant={blockquote.variant}
          color={blockquote.color}
          icon={blockquote.icon ? <QuotesIcon /> : undefined}
          source="— @kazuemon/ui の README"
        >
          コンポーネントがいっぱいあるけど、マテリアルデザインほどかたい感じじゃないモダンな UI
          ライブラリがつくりたい。
        </Blockquote>
        <Callout
          variant={callout === 'soft-no-icon' ? 'soft' : callout}
          icon={callout === 'soft-no-icon' ? false : undefined}
          status="info"
          title="補足"
          className="mt-5"
        >
          部品の振る舞いは Base UI を土台にしています。
        </Callout>
      </>
    )}
    <Heading level={3} className="mt-8">
      密度の切り替え
    </Heading>
    <Text className="mt-2">
      寸法は入力方式で決めます。<Code>data-density="coarse"</Code>{' '}
      を付けると、指で操作するときの大きさに固定できます。
    </Text>
    {full && (
      <>
        <Callout
          variant={callout === 'soft-no-icon' ? 'soft' : callout}
          icon={callout === 'soft-no-icon' ? false : undefined}
          status="warning"
          title="注意"
          className="mt-5"
        >
          <Code>coarse-large</Code> は、名前を変えるかもしれません。
        </Callout>
        <Text className="mt-4">
          Storybook では、ツールバーの「密度」か <Kbd>⌘</Kbd> + <Kbd>K</Kbd>{' '}
          から切り替えます。閉じるときは <Kbd>Esc</Kbd> です。
        </Text>
      </>
    )}
    <Heading level={4} className="mt-6">
      指で操作するとき
    </Heading>
    <Text className="mt-2">Select は、画面の下から出る Bottom Sheet になります。</Text>
    {full && (
      <Callout
        variant={callout === 'soft-no-icon' ? 'soft' : callout}
        icon={callout === 'soft-no-icon' ? false : undefined}
        title="メモ"
        className="mt-5"
      >
        タブレットとマウスでは、浮かぶ選択肢のままです。
      </Callout>
    )}
    <Text size="sm" variant="subtle" className="mt-3">
      ※ 画面の幅ではなく、入力方式で判定します。
    </Text>
  </article>
);
