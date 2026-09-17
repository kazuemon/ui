import type { ReactNode } from 'react';

import { Badge } from '../../../src/components/badge/Badge';
import { Blockquote, type BlockquoteProps } from '../../../src/components/blockquote/Blockquote';
import { Button } from '../../../src/components/button/Button';
import { Code } from '../../../src/components/code/Code';
import { Heading } from '../../../src/components/heading/Heading';
import { Kbd } from '../../../src/components/kbd/Kbd';
import { Link } from '../../../src/components/link/Link';
import { Callout, type CalloutAppearance } from '../../../src/components/callout/Callout';
import { Select } from '../../../src/components/select/Select';
import { Switch } from '../../../src/components/switch/Switch';
import { Tag } from '../../../src/components/tag/Tag';
import { Text } from '../../../src/components/text/Text';
import { TextField } from '../../../src/components/text-field/TextField';

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
export type CalloutStyle = CalloutAppearance | 'soft-no-icon';

export interface ArticleOptions {
  blockquote?: Pick<BlockquoteProps, 'appearance' | 'color'> & { icon?: boolean };
  callout?: CalloutStyle;
}

/** ブログの記事 */
export const ArticleScreen = ({
  blockquote = {},
  callout,
  full = false,
}: ArticleOptions & { full?: boolean }) => (
  <article className="flex flex-col">
    <Text size="sm" tone="subtle">
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
          appearance={blockquote.appearance}
          color={blockquote.color}
          icon={blockquote.icon ? <QuotesIcon /> : undefined}
          source="— @kazuemon/ui の README"
        >
          コンポーネントがいっぱいあるけど、マテリアルデザインほどかたい感じじゃないモダンな UI
          ライブラリがつくりたい。
        </Blockquote>
        <Callout
          appearance={callout === 'soft-no-icon' ? 'soft' : callout}
          icon={callout === 'soft-no-icon' ? false : undefined}
          color="info"
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
          appearance={callout === 'soft-no-icon' ? 'soft' : callout}
          icon={callout === 'soft-no-icon' ? false : undefined}
          color="warning"
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
        appearance={callout === 'soft-no-icon' ? 'soft' : callout}
        icon={callout === 'soft-no-icon' ? false : undefined}
        color="neutral"
        title="メモ"
        className="mt-5"
      >
        タブレットとマウスでは、浮かぶ選択肢のままです。
      </Callout>
    )}
    <Text size="sm" tone="subtle" className="mt-3">
      ※ 画面の幅ではなく、入力方式で判定します。
    </Text>
  </article>
);

/** 設定画面 */
export const SettingsScreen = () => (
  <div className="flex flex-col">
    <Heading level={1} size={2}>
      設定
    </Heading>
    <Text tone="muted" className="mt-1">
      通知と表示の設定です。変更はすぐに反映されます。
    </Text>
    <Heading level={2} size={3} className="mt-8">
      通知
    </Heading>
    <div className="mt-3 flex flex-col gap-2">
      <Switch label="メールで受け取る" caption="週に 1 回、まとめて届きます" defaultChecked />
      <Switch label="プッシュ通知" />
    </div>
    <Heading level={2} size={3} className="mt-8">
      プロフィール
    </Heading>
    <div className="mt-3 flex flex-col gap-4">
      <TextField label="表示名" defaultValue="かずえもん" caption="ほかの人に表示される名前です" />
      <Select
        label="言語"
        items={[
          { label: '日本語', value: 'ja' },
          { label: 'English', value: 'en' },
        ]}
        defaultValue="ja"
        presentation="popover"
      />
    </div>
    <Text size="sm" tone="subtle" className="mt-4">
      メールアドレスの変更は、<Link href="#account">アカウント</Link>から行います。
    </Text>
    <div className="mt-6 flex gap-2">
      <Button color="primary">保存する</Button>
      <Button appearance="outline">キャンセル</Button>
    </div>
  </div>
);

const Post = ({
  name,
  handle,
  time,
  children,
  tags,
}: {
  name: string;
  handle: string;
  time: string;
  children: ReactNode;
  tags?: string[];
}) => (
  <div className="flex flex-col gap-2 border-b border-line py-4">
    <div className="flex items-baseline gap-2">
      <Text as="span" className="font-bold">
        {name}
      </Text>
      <Text as="span" size="sm" tone="subtle">
        {handle}・{time}
      </Text>
    </div>
    <Text>{children}</Text>
    {tags && (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag} color="primary">
            #{tag}
          </Tag>
        ))}
      </div>
    )}
    <div className="flex gap-4">
      <Link href="#reply">返信</Link>
      <Link href="#share">共有</Link>
    </div>
  </div>
);

/** SNS のタイムライン */
export const SnsScreen = () => (
  <div className="flex flex-col">
    <div className="flex items-center justify-between">
      <Heading level={1} size={2}>
        ホーム
      </Heading>
      <span className="relative inline-flex">
        <Button appearance="outline">通知</Button>
        <Badge count={3} color="secondary" className="absolute -top-1 -right-1" />
      </span>
    </div>
    <Post name="かずえもん" handle="@kazuemon" time="2 時間前" tags={['kazuemonui', 'デザイン']}>
      見出しと本文の大きさを決めています。<Code>--text-body</Code> は密度で変わります。
    </Post>
    <Post name="Hanako" handle="@hanako" time="5 時間前">
      スマホで読むと、行の間が広いほうが読みやすいですね。
    </Post>
    <Heading level={2} size={4} className="mt-6">
      おすすめのユーザー
    </Heading>
    <div className="mt-2 flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <Text as="span" className="font-bold">
          Taro
        </Text>
        <Text as="span" size="sm" tone="subtle">
          フロントエンドエンジニア
        </Text>
      </div>
      <Button appearance="outline" color="primary">
        フォロー
      </Button>
    </div>
  </div>
);
