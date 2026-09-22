'use client';

import {
  Avatar,
  Badge,
  Button,
  Code,
  Dialog,
  Heading,
  Icon,
  Link,
  Menu,
  type OverlayPresentation,
  MenuItem,
  MenuSeparator,
  OverlayClose,
  Popover,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabsColor,
  Tag,
  Text,
  Textarea,
  ThemeProvider,
} from '@kazuemon/ui';
import { ChatCircleIcon, DotsThreeIcon, HeartIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import { type ReactNode, useEffect, useState } from 'react';

import { SamplePage } from './sample-page';
import { town } from './sites';
import { environmentNote, type Density, type Example, type ExampleArgs } from './types';

// SNS のタイムライン: 投稿の一覧、タブでの切り替え、投稿のメニュー、プロフィールのプレビュー、投稿を書くダイアログ、読み込み中

interface Person {
  name: string;
  handle: string;
  bio: string;
}

const kazuemon: Person = {
  name: 'かずえもん',
  handle: '@kazuemon',
  bio: 'UI ライブラリを作っています。',
};
const hanako: Person = { name: 'Hanako', handle: '@hanako', bio: 'デザインと読書が好きです。' };
const taro: Person = { name: 'Taro', handle: '@taro', bio: 'フロントエンドエンジニア' };

type AvatarShape = 'circle' | 'square';

function ProfilePreview({
  person,
  avatarShape,
  children,
}: {
  person: Person;
  avatarShape: AvatarShape;
  children: ReactNode;
}) {
  return (
    <Popover
      side="bottom"
      align="start"
      className="w-64"
      trigger={
        <button type="button" className="cursor-pointer rounded-control text-left">
          {children}
        </button>
      }
      title={person.name}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={person.name} shape={avatarShape} size="lg" />
          <Text size="sm" variant="subtle">
            {person.handle}
          </Text>
        </div>
        <Text size="sm">{person.bio}</Text>
        <Button variant="outline" color="primary">
          フォローする
        </Button>
      </div>
    </Popover>
  );
}

function Post({
  person,
  time,
  avatarShape,
  children,
  tags,
}: {
  person: Person;
  time: string;
  avatarShape: AvatarShape;
  children: ReactNode;
  tags?: string[];
}) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 border-b border-line py-4 first:pt-0">
      {/* アバター・名前・メニューは 1 行に並べ、縦は中央でそろえる（ボタンの高さが行の高さを決める） */}
      <Avatar name={person.name} shape={avatarShape} className="self-center" />
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <ProfilePreview person={person} avatarShape={avatarShape}>
            <Text as="span" className="font-bold">
              {person.name}
            </Text>
          </ProfilePreview>
          <Text as="span" size="sm" variant="subtle" className="truncate">
            {person.handle}・{time}
          </Text>
        </div>
        <Menu
          title="投稿"
          align="end"
          trigger={
            <Button variant="outline" iconOnly aria-label="その他">
              <Icon icon={DotsThreeIcon} standalone />
            </Button>
          }
        >
          <MenuItem>リンクをコピー</MenuItem>
          <MenuItem>この人をミュート</MenuItem>
          <MenuSeparator />
          <MenuItem status="danger">報告する</MenuItem>
        </Menu>
      </div>
      <div className="col-start-2 flex min-w-0 flex-col gap-3">
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
          <Link href="#reply">
            <Icon icon={ChatCircleIcon} /> 返信
          </Link>
          <Link href="#like">
            <Icon icon={HeartIcon} /> いいね
          </Link>
          <Link href="#share">
            <Icon icon={ShareNetworkIcon} /> 共有
          </Link>
        </div>
      </div>
    </article>
  );
}

function PostSkeleton() {
  return (
    <div className="flex gap-3 border-b border-line py-4 first:pt-0" aria-busy="true">
      <Skeleton variant="circle" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  );
}

function Timeline({ loading, posts }: { loading: boolean; posts: ReactNode }) {
  if (loading)
    return (
      <div>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  return <div>{posts}</div>;
}

function Compose() {
  return (
    <Dialog
      title="投稿する"
      trigger={<Button color="primary">投稿する</Button>}
      dismissible={false}
      actions={
        <>
          <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
          <OverlayClose render={<Button color="primary">投稿する</Button>} />
        </>
      }
    >
      <Textarea label="いまどうしてる？" minRows={4} caption="280 文字まで" />
    </Dialog>
  );
}

function SnsScreen({
  initialLoading,
  avatarShape,
  tabsColor,
}: {
  initialLoading: boolean;
  avatarShape: AvatarShape;
  tabsColor: TabsColor;
}) {
  // 最初は読み込み中を見せ、そのあと本物の投稿に替える（切替画面で外したときは、最初から本物を出す）
  // initialLoading が変わったら、描画の中で loading を作り直す（effect でいきなり setState しない）
  const [loading, setLoading] = useState(initialLoading);
  const [appliedInitialLoading, setAppliedInitialLoading] = useState(initialLoading);
  if (initialLoading !== appliedInitialLoading) {
    setAppliedInitialLoading(initialLoading);
    setLoading(initialLoading);
  }
  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(id);
  }, [loading]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Heading level={1} size={2}>
          ホーム
        </Heading>
        <div className="flex items-center gap-2">
          <span className="relative inline-flex">
            <Button variant="outline">通知</Button>
            <Badge count={3} color="secondary" className="absolute -top-1 -right-1" />
          </span>
          <Compose />
        </div>
      </div>
      <Tabs defaultValue="recommended" color={tabsColor}>
        <TabList aria-label="タイムライン">
          <Tab value="recommended">おすすめ</Tab>
          <Tab value="following">フォロー中</Tab>
        </TabList>
        <TabPanel value="recommended">
          <Timeline
            loading={loading}
            posts={
              <>
                <Post
                  person={kazuemon}
                  time="2 時間前"
                  avatarShape={avatarShape}
                  tags={['kazuemonui', 'デザイン']}
                >
                  見出しと本文の大きさを決めています。<Code>--text-body</Code> は密度で変わります。
                </Post>
                <Post person={hanako} time="5 時間前" avatarShape={avatarShape}>
                  スマホで読むと、行の間が広いほうが読みやすいですね。
                </Post>
              </>
            }
          />
        </TabPanel>
        <TabPanel value="following">
          <Timeline
            loading={loading}
            posts={
              <Post person={taro} time="昨日" avatarShape={avatarShape}>
                新しいプロジェクトを始めました。
              </Post>
            }
          />
        </TabPanel>
      </Tabs>
      <section className="flex flex-col gap-3 pt-2">
        <Heading level={2} size={4}>
          おすすめのユーザー
        </Heading>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={taro.name} shape={avatarShape} />
            <div className="flex min-w-0 flex-col">
              <Text as="span" className="font-bold">
                {taro.name}
              </Text>
              <Text as="span" size="sm" variant="subtle">
                {taro.bio}
              </Text>
            </div>
          </div>
          <Button variant="outline" color="primary">
            フォロー
          </Button>
        </div>
      </section>
    </div>
  );
}

export const example: Example = {
  slug: 'sns',
  title: 'SNS',
  description:
    'タイムライン・タブ・投稿のメニュー・プロフィールのプレビューを備えた SNS の見本です。',
  initialLabel: '読み込み中',
  presets: [{ label: '読み込み済み', args: { initialLoading: false } }],
  controls: [
    {
      name: 'avatarShape',
      label: 'アバターの形',
      type: 'radio',
      options: [
        { value: 'circle', label: '丸' },
        {
          value: 'square',
          label: '四角',
          caption:
            '角は大きさの段に従います。小さいアバターは部品と同じ角、大きいアバターはカードと同じ角になります',
        },
      ],
    },
    {
      name: 'tabsColor',
      label: 'タブの色',
      type: 'radio',
      options: [
        { value: 'neutral', label: 'グレー' },
        { value: 'primary', label: 'ブルー' },
        { value: 'secondary', label: 'ピンク' },
      ],
    },
    {
      name: 'menuPresentation',
      label: '重なるものの出し方',
      type: 'radio',
      options: [
        {
          value: 'auto',
          label: '自動',
          caption: (environment) =>
            environment.sheet === undefined
              ? '指で操作していて、画面が狭いときだけシートになります'
              : `いまは${environment.sheet ? 'シート' : '浮かせる形'}になります（${environmentNote(environment)}）`,
        },
        {
          value: 'popover',
          label: '浮かせる',
          caption:
            'マウスのときの形。メニューとプレビューは押したところ、投稿は画面の中央に出します',
        },
        {
          value: 'sheet',
          label: 'シート',
          caption: '指のときの形。画面の下から出します',
        },
      ],
    },
  ],
  defaults: {
    initialLoading: true,
    avatarShape: 'circle',
    tabsColor: 'neutral',
    menuPresentation: 'auto',
  },
  Screen: ({ args, density }: { args: ExampleArgs; density: Density }) => (
    <SamplePage density={density} site={town} current="ホーム" width="sm">
      {/* 重なるものの出し方は、部品ごとに渡さず ThemeProvider でまとめて決める
      （投稿のメニュー・プロフィールのプレビュー・投稿を書くダイアログに効く） */}
      <ThemeProvider presentation={args.menuPresentation as OverlayPresentation}>
        <SnsScreen
          initialLoading={args.initialLoading as boolean}
          avatarShape={args.avatarShape as AvatarShape}
          tabsColor={args.tabsColor as TabsColor}
        />
      </ThemeProvider>
    </SamplePage>
  ),
};
