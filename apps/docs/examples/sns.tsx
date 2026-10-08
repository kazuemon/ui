'use client';

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Code,
  Dialog,
  Gallery,
  Heading,
  Icon,
  ImageZoom,
  LinkCard,
  Menu,
  type OverlayPresentation,
  MenuItem,
  MenuSeparator,
  NumberFormat,
  OverlayClose,
  PreviewCard,
  PreviewCardBody,
  RelativeTime,
  Skeleton,
  Spoiler,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  type TabsColor,
  Tag,
  TagsInput,
  Text,
  Textarea,
  ThemeProvider,
  Toggle,
} from '@kazuemon/ui';
import { ChatCircleIcon, DotsThreeIcon, HeartIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { landscape, screenshot } from './images';
import { SamplePage } from './sample-page';
import { postImages } from './sns-images';
import { town } from './sites';
import { environmentNote, type Density, type Example, type ExampleArgs } from './types';

// SNS のタイムライン: 投稿の一覧、タブでの切り替え、投稿のメニュー、プロフィールのプレビュー、
// 画像・リンク・ネタバレの付いた投稿、いいね、投稿を書くダイアログ、読み込み中

// 相対時刻の基準。見本の表示が日によって変わらないよう、いまの時刻を決めておく
const NOW = new Date('2026-10-08T12:00:00+09:00');
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 60 * 60 * 1000);

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
const mika: Person = { name: 'Mika', handle: '@mika', bio: '写真を撮っています。' };
const ken: Person = { name: 'Ken', handle: '@ken', bio: '週末は山にいます。' };

const tagSuggestions = ['kazuemonui', 'デザイン', '写真', '読書', '開発', 'お知らせ'];

type AvatarShape = 'circle' | 'square';

// 名前のリンクに載せると、その人のプロフィールを出す
function ProfileLink({ person, avatarShape }: { person: Person; avatarShape: AvatarShape }) {
  return (
    <PreviewCard
      href={`#${person.handle.slice(1)}`}
      align="start"
      popupClassName="w-64"
      content={
        <PreviewCardBody>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={person.name} shape={avatarShape} size="lg" />
              <div className="flex min-w-0 flex-col">
                <Text as="span" weight="bold">
                  {person.name}
                </Text>
                <Text as="span" size="sm" variant="subtle">
                  {person.handle}
                </Text>
              </div>
            </div>
            <Text size="sm">{person.bio}</Text>
          </div>
        </PreviewCardBody>
      }
    >
      {person.name}
    </PreviewCard>
  );
}

function Post({
  person,
  hours,
  avatarShape,
  children,
  tags,
  media,
  likes,
  likedBy = [],
  liked = false,
}: {
  person: Person;
  /** 何時間前の投稿か */
  hours: number;
  avatarShape: AvatarShape;
  children: ReactNode;
  tags?: string[];
  /** 本文の下に置く画像やリンク */
  media?: ReactNode;
  likes: number;
  /** いいねした人（先頭の数人の顔を出す） */
  likedBy?: Person[];
  liked?: boolean;
}) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 border-b border-line py-4 first:pt-0">
      {/* アバター・名前・メニューは 1 行に並べ、縦は中央でそろえる（ボタンの高さが行の高さを決める） */}
      <Avatar name={person.name} shape={avatarShape} className="self-center" />
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Text as="span" weight="bold">
            <ProfileLink person={person} avatarShape={avatarShape} />
          </Text>
          <Text as="span" size="sm" variant="subtle" className="truncate">
            {person.handle}・<RelativeTime dateTime={hoursAgo(hours)} now={NOW} />
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
        {media}
        {tags && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag key={tag} color="primary">
                #{tag}
              </Tag>
            ))}
          </div>
        )}
        {likedBy.length > 0 && (
          <div className="flex items-center gap-2">
            <AvatarGroup size="xs" max={3}>
              {likedBy.map((liker) => (
                <Avatar key={liker.handle} name={liker.name} shape={avatarShape} />
              ))}
            </AvatarGroup>
            <Text as="span" size="sm" variant="subtle">
              {likedBy[0]?.name} さんたちがいいねしました
            </Text>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="underline" size="sm">
            <Icon icon={ChatCircleIcon} /> 返信
          </Button>
          <Toggle variant="underline" size="sm" color="primary" defaultPressed={liked}>
            <Icon icon={HeartIcon} /> いいね <NumberFormat value={likes} />
          </Toggle>
          <Button variant="underline" size="sm">
            <Icon icon={ShareNetworkIcon} /> 共有
          </Button>
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
  // 開いた直後のフォーカスは、閉じるボタンではなくテキストエリアへ
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <Dialog
      title="投稿する"
      trigger={<Button color="primary">投稿する</Button>}
      dismissible={false}
      // 書きかけが消えないよう、Esc でも閉じない（dismissible は後ろを押したときだけ）
      closeOnEscape={false}
      autoFocus={textareaRef}
      actions={
        <>
          <OverlayClose render={<Button variant="outline">キャンセル</Button>} />
          <OverlayClose render={<Button color="primary">投稿する</Button>} />
        </>
      }
    >
      <Stack gap="md">
        <Textarea label="いまどうしてる？" minRows={4} maxCount={280} showCount ref={textareaRef} />
        <TagsInput label="タグ" items={tagSuggestions} placeholder="打って Enter で足す" />
      </Stack>
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
    if (!loading) return undefined;
    const id = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(id);
  }, [loading]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Heading level={1} size="xl">
          ホーム
        </Heading>
        <div className="flex items-center gap-2">
          {/* 数は Badge の children に相手を入れて重ねる。読み上げは相手の名前に含める */}
          <Badge count={3} color="secondary" aria-hidden="true">
            <Button variant="outline" aria-label="通知（未読 3 件）">
              通知
            </Button>
          </Badge>
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
                  hours={2}
                  avatarShape={avatarShape}
                  tags={['kazuemonui', 'デザイン']}
                  likes={1280}
                  likedBy={[hanako, taro, mika, ken]}
                  liked
                  media={
                    <LinkCard
                      href="https://example.com/articles/design-loop"
                      title="候補を並べて選ぶループでデザインシステムを作る"
                      description="原則とトークンを先に決め、Storybook に候補を並べて 1 軸ずつ選んでいく進め方。"
                      image={screenshot}
                    />
                  }
                >
                  見出しと本文の大きさを決めています。<Code>--text-body</Code>{' '}
                  は密度で変わります。書いた記事はこちらです。
                </Post>
                <Post
                  person={mika}
                  hours={5}
                  avatarShape={avatarShape}
                  tags={['写真']}
                  likes={342}
                  likedBy={[kazuemon, ken]}
                  media={<Gallery items={postImages} columns={3} />}
                >
                  週末に撮った写真です。押すと大きく見られます。
                </Post>
                <Post person={hanako} hours={9} avatarShape={avatarShape} likes={56}>
                  読み終わりました。最後の章で、犯人は <Spoiler>図書館の司書</Spoiler>{' '}
                  でした。まだの人は気をつけて。
                </Post>
              </>
            }
          />
        </TabPanel>
        <TabPanel value="following">
          <Timeline
            loading={loading}
            posts={
              <Post
                person={ken}
                hours={26}
                avatarShape={avatarShape}
                likes={18}
                likedBy={[mika]}
                media={
                  <ImageZoom
                    src={landscape}
                    alt="山頂から見た山並みと空"
                    width={1600}
                    height={900}
                  />
                }
              >
                山頂に着きました。
              </Post>
            }
          />
        </TabPanel>
      </Tabs>
      <section className="flex flex-col gap-3 pt-2">
        <Heading level={2} size="md">
          おすすめのユーザー
        </Heading>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={taro.name} shape={avatarShape} />
            <div className="flex min-w-0 flex-col">
              <Text as="span" weight="bold">
                <ProfileLink person={taro} avatarShape={avatarShape} />
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
    '小さなコミュニティの SNS のタイムライン。画像・リンク・ネタバレの付いた投稿と、いいね',
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
