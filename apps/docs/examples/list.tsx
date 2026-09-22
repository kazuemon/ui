'use client';

// 見本のページ: 管理画面ふうの一覧。検索・絞り込み、表、行のメニュー、詳細の Dialog、読み込み中と空の状態

import {
  Avatar,
  Badge,
  Button,
  Dialog,
  Heading,
  Link,
  Icon,
  Menu,
  MenuItem,
  MenuSeparator,
  Pagination,
  type OverlayPresentation,
  type PaginationCurrentIndicator,
  RelativeTime,
  Select,
  Skeleton,
  Table,
  type TableProps,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Text,
  ThemeProvider,
  TextField,
  Tooltip,
} from '@kazuemon/ui';
import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { SamplePage } from './sample-page';
import { desk } from './sites';
import { environmentNote, type Example } from './types';

type Status = 'active' | 'invited' | 'suspended';
type ListState = 'normal' | 'loading' | 'empty';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: Status;
  tags: string[];
  lastSeen: number;
}

const now = new Date('2026-09-19T09:00:00+09:00').getTime();
const ago = (minutes: number) => now - minutes * 60_000;

const members: Member[] = [
  {
    id: '1',
    name: 'かずえもん',
    email: 'kazuemon@example.com',
    role: 'オーナー',
    status: 'active',
    tags: ['デザイン'],
    lastSeen: ago(3),
  },
  {
    id: '2',
    name: 'Hanako Yamada',
    email: 'hanako@example.com',
    role: '編集者',
    status: 'active',
    tags: ['記事', '翻訳'],
    lastSeen: ago(95),
  },
  {
    id: '3',
    name: 'Taro Suzuki',
    email: 'taro@example.com',
    role: '編集者',
    status: 'invited',
    tags: ['開発'],
    lastSeen: ago(60 * 24 * 3),
  },
  {
    id: '4',
    name: 'Mika Tanaka',
    email: 'mika@example.com',
    role: '閲覧者',
    status: 'suspended',
    tags: [],
    lastSeen: ago(60 * 24 * 40),
  },
  {
    id: '5',
    name: 'Ken Ito',
    email: 'ken@example.com',
    role: '閲覧者',
    status: 'active',
    tags: ['開発', 'デザイン'],
    lastSeen: ago(60 * 5),
  },
];

const statusLabel: Record<Status, string> = {
  active: '有効',
  invited: '招待中',
  suspended: '停止中',
};
const statusColor = { active: 'success', invited: 'info', suspended: 'danger' } as const;

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Badge color={statusColor[status]} accessibleName={statusLabel[status]} />
      <span>{statusLabel[status]}</span>
    </span>
  );
}

function RowMenu({ member, onOpen }: { member: Member; onOpen: () => void }) {
  return (
    <Menu
      title={member.name}
      trigger={
        <Button iconOnly variant="outline" aria-label={`${member.name} の操作`}>
          <Icon icon={DotsThreeIcon} standalone />
        </Button>
      }
    >
      <MenuItem onClick={onOpen}>詳細を見る</MenuItem>
      <MenuItem icon={<PencilSimpleIcon />}>編集する</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<TrashIcon />} status="danger">
        削除する
      </MenuItem>
    </Menu>
  );
}

function SkeletonRows() {
  return Array.from({ length: 5 }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="size-8" />
          <Skeleton variant="text" className="w-28" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton variant="text" className="w-16" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" className="w-16" />
      </TableCell>
      <TableCell>
        <Skeleton radius="pill" className="h-5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" className="w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="size-(--spacing-control)" />
      </TableCell>
    </TableRow>
  ));
}

function ListPage({
  state,
  tableAppearance,
  currentIndicator,
}: {
  state: ListState;
  tableAppearance: TableProps['variant'];
  currentIndicator: PaginationCurrentIndicator;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>('all');
  const [selected, setSelected] = useState<Member | null>(null);
  // 見本なので、ページを替えても行は替わらない（ページ送りの置き方だけを見る）
  const [page, setPage] = useState(1);

  const shown =
    state === 'empty'
      ? []
      : members.filter(
          (m) =>
            (status === 'all' || m.status === status) &&
            (m.name + m.email).toLowerCase().includes(query.toLowerCase())
        );
  const busy = state === 'loading';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading level={1} size={2}>
            メンバー
          </Heading>
          <Text variant="muted" className="mt-1">
            チームに参加している人と、招待中の人です。
          </Text>
        </div>
        <Button color="primary">メンバーを招待</Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <TextField
            label="検索"
            placeholder="名前かメールアドレス"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            label="状態"
            value={status}
            onValueChange={setStatus}
            disabled={busy}
            items={[
              { label: 'すべて', value: 'all' },
              { label: '有効', value: 'active' },
              { label: '招待中', value: 'invited' },
              { label: '停止中', value: 'suspended' },
            ]}
          />
        </div>
      </div>

      <div aria-busy={busy}>
        {/* 行の中身（アバター・タグ・ボタン）の高さがまちまちなので、セルは縦中央でそろえる
        （ライブラリの表は、読みものに合わせて上そろえが既定） */}
        <Table accessibleName="メンバーの一覧" variant={tableAppearance} verticalAlign="middle">
          <TableHead>
            <TableRow>
              <TableHeader>名前</TableHeader>
              <TableHeader>役割</TableHeader>
              <TableHeader>状態</TableHeader>
              <TableHeader>タグ</TableHeader>
              <TableHeader>最終ログイン</TableHeader>
              <TableHeader>
                <span className="sr-only">操作</span>
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {busy ? (
              <SkeletonRows />
            ) : (
              shown.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="flex min-w-0 flex-col">
                        <Link
                          href={`#member-${m.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelected(m);
                          }}
                        >
                          {m.name}
                        </Link>
                        <Text as="span" size="sm" variant="subtle">
                          {m.email}
                        </Text>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{m.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.tags.length === 0 ? (
                        <Text as="span" size="sm" variant="subtle">
                          なし
                        </Text>
                      ) : (
                        m.tags.map((t) => <Tag key={t}>{t}</Tag>)
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip content="ログインした日時">
                      <span>
                        <RelativeTime dateTime={m.lastSeen} now={now} />
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="end">
                    <RowMenu member={m} onOpen={() => setSelected(m)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!busy && shown.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Heading level={2} size={4}>
              見つかりませんでした
            </Heading>
            <Text variant="muted">条件を変えるか、新しいメンバーを招待してください。</Text>
            <Button variant="outline">メンバーを招待</Button>
          </div>
        )}
      </div>

      {state === 'normal' && (
        <Pagination
          page={page}
          count={12}
          onPageChange={setPage}
          currentIndicator={currentIndicator}
        />
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? ''}
        description={selected?.email}
        actions={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>
              閉じる
            </Button>
            <Button color="primary">編集する</Button>
          </>
        }
      >
        {selected && (
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="text-(length:--text-caption) text-fg-subtle">役割</dt>
              <dd>{selected.role}</dd>
            </div>
            <div>
              <dt className="text-(length:--text-caption) text-fg-subtle">状態</dt>
              <dd>
                <StatusBadge status={selected.status} />
              </dd>
            </div>
            <div>
              <dt className="text-(length:--text-caption) text-fg-subtle">最終ログイン</dt>
              <dd>
                <RelativeTime dateTime={selected.lastSeen} now={now} />
              </dd>
            </div>
          </dl>
        )}
      </Dialog>
    </div>
  );
}

export const example: Example = {
  slug: 'list',
  title: '一覧',
  description: '検索・絞り込みができる表と、行から開く詳細です。',
  initialLabel: '読み込み済み',
  presets: [
    { label: '読み込み中', args: { state: 'loading' } },
    { label: '空', args: { state: 'empty' } },
  ],
  controls: [
    {
      name: 'tableAppearance',
      label: '表の見た目',
      type: 'radio',
      options: [
        { value: 'lines', label: '線', caption: '見出しの下に線を 1 本だけ引きます' },
        { value: 'framed', label: '枠', caption: '表の外を枠で囲み、見出しの行に面を敷きます' },
        { value: 'banded', label: '帯', caption: '見出しの行に面を敷き、セルの余白を広くとります' },
      ],
    },
    {
      name: 'presentation',
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
          caption: 'マウスのときの形。詳細は画面の中央に、メニューと選択肢は押したところに出します',
        },
        {
          value: 'sheet',
          label: 'シート',
          caption: '指のときの形。画面の下から出します',
        },
      ],
    },
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
    tableAppearance: 'lines',
    presentation: 'auto',
    currentIndicator: 'neutral',
  },
  Screen: ({ args, density }) => (
    <SamplePage density={density} site={desk} current="メンバー" width="lg">
      {/* 重なるものの出し方は、部品ごとに渡さず ThemeProvider でまとめて決める（詳細・メニュー・選択肢に効く） */}
      <ThemeProvider presentation={args.presentation as OverlayPresentation}>
        <ListPage
          state={args.state as ListState}
          tableAppearance={args.tableAppearance as TableProps['variant']}
          currentIndicator={args.currentIndicator as PaginationCurrentIndicator}
        />
      </ThemeProvider>
    </SamplePage>
  ),
};
