import { ChatCircleIcon, DotsThreeIcon, HeartIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useEffect, useState } from 'react';

import { Avatar } from '../components/avatar/Avatar';
import { Badge } from '../components/badge/Badge';
import { Button } from '../components/button/Button';
import { Code } from '../components/code/Code';
import { Dialog } from '../components/dialog/Dialog';
import { Icon } from '../components/icon/Icon';
import { Heading } from '../components/heading/Heading';
import { Link } from '../components/link/Link';
import { Menu } from '../components/menu/Menu';
import { MenuItem, MenuSeparator } from '../components/menu/MenuItem';
import { Popover } from '../components/popover/Popover';
import { Skeleton } from '../components/skeleton/Skeleton';
import { Stack } from '../components/stack/Stack';
import { Tab, TabList, TabPanel, Tabs } from '../components/tabs/Tabs';
import { Tag } from '../components/tag/Tag';
import { Text } from '../components/text/Text';
import { Textarea } from '../components/textarea/Textarea';
import { OverlayClose } from '../internal/overlay/overlay-close';
import { SamplePage, densityOf } from './SamplePage';

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

function ProfilePreview({ person, children }: { person: Person; children: ReactNode }) {
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
          <Avatar name={person.name} size="lg" />
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
  children,
  tags,
}: {
  person: Person;
  time: string;
  children: ReactNode;
  tags?: string[];
}) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 border-b border-line py-4 first:pt-0">
      {/* アバター・名前・メニューは 1 行に並べ、縦は中央でそろえる（ボタンの高さが行の高さを決める） */}
      <Avatar name={person.name} className="self-center" />
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <ProfilePreview person={person}>
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
      <Textarea label="いまどうしてる？" minRows={4} caption="280 文字まで" />
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
        <Heading level={1} size={2}>
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
                <Post person={kazuemon} time="2 時間前" tags={['kazuemonui', 'デザイン']}>
                  見出しと本文の大きさを決めています。<Code>--text-body</Code> は密度で変わります。
                </Post>
                <Post person={hanako} time="5 時間前">
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
              <Post person={taro} time="昨日">
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
            <Avatar name={taro.name} />
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
          'SNS のタイムラインの見本です。タブでおすすめとフォロー中を切り替え、投稿のメニュー・プロフィールのプレビュー・投稿を書くダイアログを備えます。はじめは読み込み中の表示（Skeleton）を出します。',
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
