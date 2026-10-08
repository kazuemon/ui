import { ChatCircleIcon, DotsThreeIcon, HeartIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useState } from 'react';

import { OverlayClose } from '..';
import { Avatar } from '../components/avatar/Avatar';
import { AvatarGroup } from '../components/avatar-group/AvatarGroup';
import { Badge } from '../components/badge/Badge';
import { Button } from '../components/button/Button';
import { Code } from '../components/code/Code';
import { Dialog } from '../components/dialog/Dialog';
import { Gallery } from '../components/gallery/Gallery';
import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import { ImageZoom } from '../components/image-zoom/ImageZoom';
import { LinkCard } from '../components/link-card/LinkCard';
import { Menu } from '../components/menu/Menu';
import { MenuItem, MenuSeparator } from '../components/menu/MenuItem';
import { NumberFormat } from '../components/number-format/NumberFormat';
import { PreviewCard, PreviewCardBody } from '../components/preview-card/PreviewCard';
import { RelativeTime } from '../components/relative-time/RelativeTime';
import { Skeleton } from '../components/skeleton/Skeleton';
import { Spoiler } from '../components/spoiler/Spoiler';
import { Stack } from '../components/stack/Stack';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/Tabs';
import { Tag } from '../components/tag/Tag';
import { TagsInput } from '../components/tags-input/TagsInput';
import { Text } from '../components/text/Text';
import { Textarea } from '../components/textarea/Textarea';
import { Toggle } from '../components/toggle/Toggle';
import { galleryImages, landscape, screenshot } from './images';
import { SamplePage, densityOf } from './SamplePage';

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

// 名前のリンクに載せると、その人のプロフィールを出す
function ProfileLink({ person }: { person: Person }) {
  return (
    <PreviewCard
      href={`#${person.handle.slice(1)}`}
      align="start"
      popupClassName="w-64"
      content={
        <PreviewCardBody>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={person.name} size="lg" />
              <div className="flex min-w-0 flex-col">
                <Text as="span" className="font-bold">
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
      <Avatar name={person.name} className="self-center" />
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Text as="span" className="font-bold">
            <ProfileLink person={person} />
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
                <Avatar key={liker.handle} name={liker.name} />
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
      <Stack gap="sm" className="flex-1">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" lines={2} />
      </Stack>
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
      <Stack gap="md">
        <Textarea label="いまどうしてる？" minRows={4} maxCount={280} showCount />
        <TagsInput label="タグ" items={tagSuggestions} placeholder="打って Enter で足す" />
      </Stack>
    </Dialog>
  );
}

function SnsScreen() {
  // 最初は読み込み中を見せ、そのあと本物の投稿に替える
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(id);
  }, []);

  return (
    <Stack gap="md">
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
      <Tabs defaultValue="recommended">
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
                  tags={['写真']}
                  likes={342}
                  likedBy={[kazuemon, ken]}
                  media={<Gallery items={galleryImages.slice(0, 3)} columns={3} />}
                >
                  週末に撮った写真です。押すと大きく見られます。
                </Post>
                <Post person={hanako} hours={9} likes={56}>
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
            <Avatar name={taro.name} />
            <div className="flex min-w-0 flex-col">
              <Text as="span" className="font-bold">
                <ProfileLink person={taro} />
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
    </Stack>
  );
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SNS のタイムラインの見本です。タブでおすすめとフォロー中を切り替えます。名前に載せるとプロフィール（PreviewCard）が出て、時刻は RelativeTime、いいねは Toggle と NumberFormat で数えます。投稿には画像（Gallery・ImageZoom）・リンク（LinkCard）・ネタバレ（Spoiler）を付けられます。投稿を書くダイアログでは、文字数（Textarea の maxCount）とタグ（TagsInput）を入れます。はじめは読み込み中の表示（Skeleton）を出します。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sns: Story = {
  name: 'SNS',
  render: (_args, { globals }) => (
    <SamplePage density={densityOf(globals)} width="sm">
      <SnsScreen />
    </SamplePage>
  ),
};
