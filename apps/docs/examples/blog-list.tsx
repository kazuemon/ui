'use client';

import {
  Autocomplete,
  Button,
  Card,
  type CardVariant,
  CardBody,
  CardImage,
  Chip,
  Heading,
  Icon,
  Pagination,
  type PaginationCurrentIndicator,
  Select,
  Skeleton,
  Tag,
  Text,
  Time,
} from '@kazuemon/ui';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { svg } from './images';
import { SamplePage } from './sample-page';
import { note } from './sites';
import type { Example } from './types';

// 記事一覧: ブログの記事をカードで並べる。言葉で探す・タグで絞る・並べ替える、読み込み中と見つからないとき
// カードは全体が 1 つのリンク（href）。中にほかのリンクやボタンは置かない
// 探す欄は Autocomplete。打つと記事の題を候補に出し、選ぶとその題で絞る（候補を選ばずに打った言葉でも絞れる）

type ListState = 'normal' | 'loading' | 'empty';
type Layout = 'grid' | 'list';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  image: string;
}

/** 記事の見出し画像。色の違う、簡単な図形の絵 */
const cover = (bg: string, fg: string, shape: string) =>
  svg(`<rect width="1600" height="900" fill="${bg}"/><g fill="${fg}">${shape}</g>`);

const posts: Post[] = [
  {
    slug: 'density',
    title: '指とマウスで、部品の大きさを変える',
    excerpt: '入力方式で密度を切り替える仕組みと、指で押して詰めた寸法の話です。',
    date: '2026-09-18',
    tags: ['デザイン', '密度'],
    image: cover(
      '#e3f4fe',
      '#35b9fd',
      '<circle cx="560" cy="450" r="220"/><circle cx="1080" cy="450" r="120"/>'
    ),
  },
  {
    slug: 'server-components',
    title: 'UI ライブラリを Server Components に対応させる',
    excerpt: "'use client' を付けるファイルを、テストで確かめられるようにしました。",
    date: '2026-09-15',
    tags: ['React', '実装'],
    image: cover(
      '#e9f2fe',
      '#2474df',
      '<rect x="420" y="250" width="320" height="400" rx="40"/><rect x="860" y="250" width="320" height="400" rx="40" opacity=".5"/>'
    ),
  },
  {
    slug: 'sheet',
    title: '重なる面は、狭い画面でシートにする',
    excerpt: 'Popover と Dialog を、画面の下から出るシートに切り替える条件を決めました。',
    date: '2026-09-10',
    tags: ['デザイン', 'スマホ'],
    image: cover(
      '#ffebee',
      '#e41966',
      '<rect x="500" y="420" width="600" height="360" rx="48"/><rect x="740" y="450" width="120" height="16" rx="8" fill="#ffffff"/>'
    ),
  },
  {
    slug: 'tokens',
    title: 'トークンは、役割の名前で呼ぶ',
    excerpt: '値・尺度・役割の 3 段に分けて、部品が値を直接持たないようにした話。',
    date: '2026-09-02',
    tags: ['デザイン', 'トークン'],
    image: cover(
      '#f2f4f4',
      '#525c60',
      '<rect x="380" y="330" width="240" height="240" rx="32"/><rect x="680" y="330" width="240" height="240" rx="32" opacity=".7"/><rect x="980" y="330" width="240" height="240" rx="32" opacity=".4"/>'
    ),
  },
  {
    slug: 'japanese-type',
    title: '和文と欧文の高さをそろえる',
    excerpt: 'フォントの補正 CSS を作って、和欧混植の行の高さを落ち着かせました。',
    date: '2026-08-26',
    tags: ['タイポグラフィ'],
    image: cover(
      '#fff8d6',
      '#727200',
      '<rect x="360" y="300" width="880" height="36" rx="18"/><rect x="360" y="420" width="700" height="36" rx="18"/><rect x="360" y="540" width="800" height="36" rx="18"/>'
    ),
  },
  {
    slug: 'combobox',
    title: '打って絞る選ぶ欄を作る',
    excerpt: '都道府県のように長い選択肢を、打って探せる Combobox の決めごとです。',
    date: '2026-08-20',
    tags: ['実装', 'フォーム'],
    image: cover(
      '#e4f7ea',
      '#008132',
      '<rect x="420" y="260" width="760" height="100" rx="24"/><rect x="420" y="400" width="760" height="260" rx="24" opacity=".35"/>'
    ),
  },
];

const allTags = [...new Set(posts.flatMap((p) => p.tags))];

function PostCard({
  post,
  cardVariant,
  imageZoom,
  layout,
}: {
  post: Post;
  cardVariant: CardVariant;
  imageZoom: boolean;
  layout: Layout;
}) {
  return (
    <Card
      href={`#${post.slug}`}
      variant={cardVariant}
      imageZoom={imageZoom}
      className={layout === 'list' ? 'sm:grid sm:grid-cols-[240px_1fr]' : undefined}
    >
      {/* 横に並べるときは、画像の比率を外して、文の高さいっぱいに広げる（比率のままだと、画像の下に余白が残る） */}
      <CardImage
        src={post.image}
        alt=""
        frameProps={{
          className: layout === 'list' ? 'sm:aspect-auto! sm:h-full sm:min-h-32' : undefined,
        }}
      />
      <CardBody className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <Heading level={2} size={4}>
          {post.title}
        </Heading>
        <Text size="sm" variant="muted">
          {post.excerpt}
        </Text>
        <Time dateTime={post.date} size="sm" variant="subtle" />
      </CardBody>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton radius="card" className="aspect-video w-full" />
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" lines={2} />
    </div>
  );
}

function BlogListScreen({
  state,
  layout,
  cardVariant,
  imageZoom,
  currentIndicator,
}: {
  state: ListState;
  layout: Layout;
  cardVariant: CardVariant;
  imageZoom: boolean;
  currentIndicator: PaginationCurrentIndicator;
}) {
  const [query, setQuery] = useState(state === 'empty' ? 'Vue' : '');
  const [tag, setTag] = useState<string | null>(null);
  const [order, setOrder] = useState<string | null>('new');
  const [page, setPage] = useState(1);
  const busy = state === 'loading';

  const shown = posts
    .filter((p) => (tag ? p.tags.includes(tag) : true))
    .filter((p) => (p.title + p.excerpt).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) =>
      order === 'new' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );

  const gridClass =
    layout === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading level={1} size={2}>
          ブログ
        </Heading>
        <Text variant="muted" className="mt-1">
          UI ライブラリを作りながら決めたことを書いています。
        </Text>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Autocomplete
            label="記事を探す"
            placeholder="題か本文の言葉"
            icon={<Icon icon={MagnifyingGlassIcon} />}
            items={posts.map((p) => ({ label: p.title, value: p.title }))}
            emptyText="当てはまる題がありません"
            clearable
            value={query}
            onValueChange={setQuery}
            disabled={busy}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            label="タグ"
            placeholder="すべて"
            value={tag}
            onValueChange={setTag}
            disabled={busy}
            items={allTags.map((t) => ({ label: t, value: t }))}
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            label="並べ方"
            value={order}
            onValueChange={setOrder}
            disabled={busy}
            items={[
              { label: '新しい順', value: 'new' },
              { label: '古い順', value: 'old' },
            ]}
          />
        </div>
      </div>

      {/* 絞り込んでいる条件は、外せる小物で並べる */}
      {(tag || query) && !busy && (
        <div className="flex flex-wrap items-center gap-2">
          <Text as="span" size="sm" variant="subtle">
            {shown.length} 件
          </Text>
          {tag && (
            <Chip onRemove={() => setTag(null)} removeName={`タグ「${tag}」を外す`}>
              {tag}
            </Chip>
          )}
          {query && (
            <Chip onRemove={() => setQuery('')} removeName={`「${query}」での絞り込みを外す`}>
              「{query}」
            </Chip>
          )}
        </div>
      )}

      <div aria-busy={busy}>
        {busy ? (
          <div className={gridClass}>
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Heading level={2} size={4}>
              記事が見つかりませんでした
            </Heading>
            <Text variant="muted">言葉を変えるか、絞り込みを外してください。</Text>
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setTag(null);
              }}
            >
              絞り込みを外す
            </Button>
          </div>
        ) : (
          <div className={gridClass}>
            {shown.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                cardVariant={cardVariant}
                imageZoom={imageZoom}
                layout={layout}
              />
            ))}
          </div>
        )}
      </div>

      {!busy && shown.length > 0 && (
        <Pagination
          page={page}
          count={8}
          onPageChange={setPage}
          currentIndicator={currentIndicator}
        />
      )}
    </div>
  );
}

export const example: Example = {
  slug: 'blog-list',
  title: '記事一覧',
  description: 'ブログの記事をカードで並べた一覧。言葉で探す・タグで絞る・並べ替えるを確かめます。',
  initialLabel: '読み込み済み',
  presets: [
    { label: '読み込み中', args: { state: 'loading' } },
    { label: '見つからない', args: { state: 'empty' } },
  ],
  controls: [
    {
      name: 'layout',
      label: 'カードの並べ方',
      type: 'radio',
      options: [
        { value: 'grid', label: '格子', caption: '広い画面では 3 列、スマホでは 1 列にします' },
        {
          value: 'list',
          label: '縦 1 列',
          caption: '画像を左、文を右に置きます（スマホでは縦に積みます）',
        },
      ],
    },
    {
      name: 'cardAppearance',
      label: 'カードの型',
      type: 'radio',
      options: [
        { value: 'default', label: '標準', caption: '画像をカードの端まで届かせます' },
        { value: 'nested', label: '入れ子', caption: '画像をカードの内側に、余白を空けて収めます' },
      ],
    },
    { name: 'imageZoom', label: 'hover で画像を少し大きくする', type: 'switch' },
    {
      name: 'currentIndicator',
      label: 'ページ送りの印',
      type: 'select',
      options: [
        { value: 'neutral', label: 'グレー' },
        { value: 'neutral-strong', label: '濃いグレー' },
        { value: 'primary', label: 'ブルー' },
        { value: 'secondary', label: 'ピンク' },
      ],
    },
  ],
  defaults: {
    state: 'normal',
    layout: 'grid',
    cardAppearance: 'default',
    imageZoom: false,
    currentIndicator: 'neutral',
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={note} current="記事" width="lg">
      <BlogListScreen
        state={args.state as ListState}
        layout={args.layout as Layout}
        cardVariant={args.cardAppearance as CardVariant}
        imageZoom={args.imageZoom as boolean}
        currentIndicator={args.currentIndicator as PaginationCurrentIndicator}
      />
    </SamplePage>
  ),
};
