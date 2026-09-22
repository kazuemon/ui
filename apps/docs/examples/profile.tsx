'use client';

import {
  Avatar,
  Button,
  DescriptionItem,
  DescriptionList,
  type DescriptionListDivider,
  Heading,
  Link,
  LinkCard,
  Stat,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  Text,
  Time,
  Timeline,
  type TimelineDatePlacement,
  TimelineItem,
  type TimelineMarkerType,
} from '@kazuemon/ui';
import { useState } from 'react';

import { SamplePage } from './sample-page';
import { town } from './sites';
import type { Example } from './types';

// プロフィール: コミュニティのメンバーのページ。顔と名前、数字、プロフィールの項目、活動の流れ、書いた記事
// ほかの人のページではフォローのボタン、自分のページでは編集のボタンを出す。書いていない項目は、書くよう促す

type Viewer = 'other' | 'self' | 'blank';
type AvatarShape = 'circle' | 'square';

const activities = [
  { date: '2026-09-18', title: '記事を書きました', body: '指とマウスで、部品の大きさを変える' },
  { date: '2026-09-12', title: '勉強会で話しました', body: 'UI 勉強会 #2「候補を並べて決める」' },
  { date: '2026-08-30', title: 'バッジをもらいました', body: '10 本の記事を書いた人' },
  { date: '2026-06-01', title: 'コミュニティに参加しました' },
];

const articles = [
  {
    href: '#density',
    title: '指とマウスで、部品の大きさを変える',
    description: '入力方式で密度を切り替える仕組みと、指で押して詰めた寸法の話です。',
  },
  {
    href: '#server-components',
    title: 'UI ライブラリを Server Components に対応させる',
    description: "'use client' を付けるファイルを、テストで確かめられるようにしました。",
  },
];

function ProfileScreen({
  viewer,
  avatarShape,
  divider,
  markerType,
  datePlacement,
}: {
  viewer: Viewer;
  avatarShape: AvatarShape;
  divider: DescriptionListDivider;
  markerType: TimelineMarkerType;
  datePlacement: TimelineDatePlacement;
}) {
  const [following, setFollowing] = useState(false);
  const blank = viewer === 'blank';
  const own = viewer !== 'other';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name="かずえもん" size="xl" shape={avatarShape} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading level={1} size={2}>
            かずえもん
          </Heading>
          <Text variant="subtle">@kazuemon</Text>
        </div>
        {own ? (
          <Button variant="outline">プロフィールを編集</Button>
        ) : (
          <Button
            color={following ? 'neutral' : 'primary'}
            variant={following ? 'outline' : 'filled'}
            aria-pressed={following}
            onClick={() => setFollowing(!following)}
          >
            {following ? 'フォロー中' : 'フォローする'}
          </Button>
        )}
      </div>

      {blank ? (
        <Text variant="muted">
          自己紹介はまだありません。<Link href="#edit">自己紹介を書く</Link>
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          <Text>
            UI ライブラリを作っています。見た目は、候補を並べて 1 つ選ぶやり方で決めています。
          </Text>
          <div className="flex flex-wrap gap-2">
            {['デザイン', 'React', 'アクセシビリティ', 'タイポグラフィ'].map((skill) => (
              <Tag key={skill} color="primary">
                {skill}
              </Tag>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Stat label="記事" value={blank ? 0 : 12} size="heading-3" />
        <Stat label="フォロワー" value={blank ? 0 : following ? 129 : 128} size="heading-3" />
        <Stat label="フォロー中" value={blank ? 0 : 36} size="heading-3" />
      </div>

      <DescriptionList divider={divider}>
        <DescriptionItem term="住んでいるところ">{blank ? '—' : '東京'}</DescriptionItem>
        <DescriptionItem term="サイト">
          {blank ? '—' : <Link href="#site">k6n.jp</Link>}
        </DescriptionItem>
        <DescriptionItem term="参加した日">2026 年 6 月 1 日</DescriptionItem>
      </DescriptionList>

      <Tabs defaultValue="activity" panelGap="lg">
        <TabList aria-label="プロフィールの中身">
          <Tab value="activity">活動</Tab>
          <Tab value="articles">書いた記事</Tab>
        </TabList>
        <TabPanel value="activity">
          <Timeline markerType={markerType} datePlacement={datePlacement}>
            {(blank ? activities.slice(-1) : activities).map((a, i) => (
              <TimelineItem
                key={a.date}
                date={<Time dateTime={a.date} />}
                title={a.title}
                emphasis={i === 0}
              >
                {a.body}
              </TimelineItem>
            ))}
          </Timeline>
        </TabPanel>
        <TabPanel value="articles">
          {blank ? (
            <div className="flex flex-col items-start gap-2">
              <Text variant="muted">まだ記事はありません。</Text>
              {own && <Button variant="outline">記事を書く</Button>}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {articles.map((a) => (
                <LinkCard key={a.href} {...a} site={false} />
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}

export const example: Example = {
  slug: 'profile',
  title: 'プロフィール',
  description: 'コミュニティのメンバーのページ。数字・プロフィールの項目・活動の流れを並べます。',
  initialLabel: 'ほかの人のページ',
  presets: [
    { label: '自分のページ', args: { viewer: 'self' } },
    { label: '書いていない人', args: { viewer: 'blank' } },
  ],
  controls: [
    {
      name: 'avatarShape',
      label: 'アバターの形',
      type: 'radio',
      options: [
        { value: 'circle', label: '丸' },
        { value: 'square', label: '四角', caption: '大きいアバターは、カードと同じ角になります' },
      ],
    },
    {
      name: 'divider',
      label: 'プロフィールの項目の区切り',
      type: 'select',
      options: [
        { value: 'none', label: 'なし' },
        { value: 'line', label: '線', caption: '項目のあいだに線を引きます' },
        { value: 'framed', label: '枠', caption: '全体を枠で囲みます' },
        { value: 'leader-dotted', label: '点線のリーダー', caption: '語と説明を点線でつなぎます' },
        { value: 'leader-solid', label: '線のリーダー', caption: '語と説明を線でつなぎます' },
      ],
    },
    {
      name: 'markerType',
      label: '活動の点',
      type: 'radio',
      options: [
        { value: 'neutral', label: 'グレー' },
        { value: 'outline', label: '白抜き' },
        { value: 'primary', label: 'ブルー' },
      ],
    },
    {
      name: 'datePlacement',
      label: '活動の日付の位置',
      type: 'radio',
      options: [
        { value: 'stack', label: '題の上' },
        { value: 'inline', label: '題の横' },
        { value: 'aside', label: '線の左', caption: '狭い画面では題の上に積みます' },
      ],
    },
  ],
  defaults: {
    viewer: 'other',
    avatarShape: 'circle',
    divider: 'line',
    markerType: 'neutral',
    datePlacement: 'stack',
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={town} current="メンバー" width="md">
      <ProfileScreen
        viewer={args.viewer as Viewer}
        avatarShape={args.avatarShape as AvatarShape}
        divider={args.divider as DescriptionListDivider}
        markerType={args.markerType as TimelineMarkerType}
        datePlacement={args.datePlacement as TimelineDatePlacement}
      />
    </SamplePage>
  ),
};
