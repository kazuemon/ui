import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Avatar } from '../components/avatar/Avatar';
import { Badge } from '../components/badge/Badge';
import { Button } from '../components/button/Button';
import { DescriptionItem, DescriptionList } from '../components/description-list/DescriptionList';
import { Dialog } from '../components/dialog/Dialog';
import { Heading } from '../components/heading/Heading';
import { Link } from '../components/link/Link';
import { Menu } from '../components/menu/Menu';
import { MenuItem, MenuSeparator } from '../components/menu/MenuItem';
import { RelativeTime } from '../components/relative-time/RelativeTime';
import { Select } from '../components/select/Select';
import { Skeleton } from '../components/skeleton/Skeleton';
import { Stack } from '../components/stack/Stack';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table/Table';
import { Pagination } from '../components/pagination/Pagination';
import { Tag } from '../components/tag/Tag';
import { Text } from '../components/text/Text';
import { TextField } from '../components/text-field/TextField';
import { Tooltip } from '../components/tooltip/Tooltip';
import { SamplePage, densityOf } from './SamplePage';

// 見本のページ: 管理画面ふうの一覧。検索・絞り込み、表、行のメニュー、詳細の Dialog、読み込み中と空の状態

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
          <DotsThreeIcon />
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

function ListPage({ state }: { state: ListState }) {
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
    <Stack gap="lg">
      <Stack direction="horizontal" gap="md" justify="between" align="end">
        <div>
          <Heading level={1} size={2}>
            メンバー
          </Heading>
          <Text variant="muted" className="mt-1">
            チームに参加している人と、招待中の人です。
          </Text>
        </div>
        <Button color="primary">メンバーを招待</Button>
      </Stack>

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
        <Table accessibleName="メンバーの一覧">
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
          <Stack gap="sm" align="center" className="py-12 text-center">
            <Heading level={2} size={4}>
              見つかりませんでした
            </Heading>
            <Text variant="muted">条件を変えるか、新しいメンバーを招待してください。</Text>
            <Button variant="outline">メンバーを招待</Button>
          </Stack>
        )}
      </div>

      {state === 'normal' && <Pagination page={page} count={12} onPageChange={setPage} />}

      <Dialog
        presentation="auto"
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
          <DescriptionList layout="stacked" termStyle="label">
            <DescriptionItem term="役割">{selected.role}</DescriptionItem>
            <DescriptionItem term="状態">
              <StatusBadge status={selected.status} />
            </DescriptionItem>
            <DescriptionItem term="最終ログイン">
              <RelativeTime dateTime={selected.lastSeen} now={now} />
            </DescriptionItem>
          </DescriptionList>
        )}
      </Dialog>
    </Stack>
  );
}

interface PageArgs {
  state: ListState;
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '管理画面ふうの一覧の見本です。名前を押すか行のメニューから「詳細を見る」を選ぶと、詳細が開きます（広い画面では中央に、指で操作する狭い画面では下のシートに出ます）。状態は Controls で切り替えます。',
      },
    },
  },
  args: { state: 'normal' },
  argTypes: {
    state: {
      name: '一覧の状態',
      control: {
        type: 'inline-radio',
        labels: { normal: '通常', loading: '読み込み中', empty: '空' },
      },
      options: ['normal', 'loading', 'empty'],
    },
  },
} satisfies Meta<PageArgs>;

export default meta;
type Story = StoryObj<PageArgs>;

export const List: Story = {
  name: '一覧',
  render: (args, { globals }) => (
    <SamplePage density={densityOf(globals)} width="lg">
      <ListPage state={args.state} />
    </SamplePage>
  ),
};
