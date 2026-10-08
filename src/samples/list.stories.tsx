import {
  DotsThreeIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Avatar } from '../components/avatar/Avatar';
import { AvatarGroup } from '../components/avatar-group/AvatarGroup';
import { Badge } from '../components/badge/Badge';
import { Button } from '../components/button/Button';
import { Chip } from '../components/chip/Chip';
import { ContextMenu } from '../components/context-menu/ContextMenu';
import { DataTable } from '../components/data-table/DataTable';
import { DataTableEmpty } from '../components/data-table/DataTableEmpty';
import { DataTableHeader } from '../components/data-table/DataTableHeader';
import { DataTableLoading } from '../components/data-table/DataTableLoading';
import { DataTableRow } from '../components/data-table/DataTableRow';
import { DescriptionItem, DescriptionList } from '../components/description-list/DescriptionList';
import { Dialog } from '../components/dialog/Dialog';
import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import { Link } from '../components/link/Link';
import { Menu } from '../components/menu/Menu';
import { MenuItem, MenuSeparator } from '../components/menu/MenuItem';
import { NumberFormat } from '../components/number-format/NumberFormat';
import { Pagination } from '../components/pagination/Pagination';
import { RelativeTime } from '../components/relative-time/RelativeTime';
import { SearchField } from '../components/search-field/SearchField';
import { Select } from '../components/select/Select';
import { Stack } from '../components/stack/Stack';
import { Stat } from '../components/stat/Stat';
import { StatusPanel } from '../components/status-panel/StatusPanel';
import { TableBody, TableCell, TableHead, TableRow } from '../components/table/Table';
import { Tag } from '../components/tag/Tag';
import { Text } from '../components/text/Text';
import { Time } from '../components/time/Time';
import { Toolbar, ToolbarButton, ToolbarSeparator } from '../components/toolbar/Toolbar';
import { Tooltip } from '../components/tooltip/Tooltip';
import { VisuallyHidden } from '../components/visually-hidden/VisuallyHidden';
import { SamplePage, densityOf } from './SamplePage';

// 見本のページ: 管理画面ふうの一覧。数の要約、検索と絞り込みの帯、効いている絞り込み、表、行のメニュー（右クリックでも開く）、
// 詳細の Dialog、読み込み中と空の状態

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

const statusItems = [
  { label: 'すべて', value: 'all' },
  { label: '有効', value: 'active' },
  { label: '招待中', value: 'invited' },
  { label: '停止中', value: 'suspended' },
];

const COLUMNS = 6;

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* 隣に同じ文字があるので、点には名前を付けない（二重に読まれる） */}
      <Badge color={statusColor[status]} />
      <span>{statusLabel[status]}</span>
    </span>
  );
}

// 行の操作。︙ のメニューと、行を右クリックしたときのメニューで同じ項目を出す
function RowActions({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      <MenuItem onClick={onOpen}>詳細を見る</MenuItem>
      <MenuItem icon={<PencilSimpleIcon />}>編集する</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<TrashIcon />} status="danger">
        削除する
      </MenuItem>
    </>
  );
}

function MemberRow({ member, onOpen }: { member: Member; onOpen: () => void }) {
  return (
    <ContextMenu
      title={member.name}
      trigger={
        <DataTableRow status={member.status === 'suspended' ? 'muted' : undefined}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar name={member.name} size="sm" />
              <div className="flex min-w-0 flex-col">
                {/* 名前は詳細へのリンクとして見せる（行の並びは文字のまま）。見本では詳細を Dialog で開く */}
                <Link
                  href={`#member-${member.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpen();
                  }}
                >
                  {member.name}
                </Link>
                <Text as="span" size="sm" variant="subtle">
                  {member.email}
                </Text>
              </div>
            </div>
          </TableCell>
          <TableCell>{member.role}</TableCell>
          <TableCell>
            <StatusBadge status={member.status} />
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1">
              {member.tags.length === 0 ? (
                <Text as="span" size="sm" variant="subtle">
                  なし
                </Text>
              ) : (
                member.tags.map((t) => <Tag key={t}>{t}</Tag>)
              )}
            </div>
          </TableCell>
          <TableCell>
            <Tooltip content={<Time dateTime={member.lastSeen} withTime />}>
              <span>
                <RelativeTime dateTime={member.lastSeen} now={now} />
              </span>
            </Tooltip>
          </TableCell>
          <TableCell align="end">
            <Menu
              title={member.name}
              trigger={
                <Button iconOnly variant="outline" aria-label={`${member.name} の操作`}>
                  <Icon icon={DotsThreeIcon} standalone />
                </Button>
              }
            >
              <RowActions onOpen={onOpen} />
            </Menu>
          </TableCell>
        </DataTableRow>
      }
    >
      <RowActions onOpen={onOpen} />
    </ContextMenu>
  );
}

function ListPage({ state }: { state: ListState }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>('all');
  const [selected, setSelected] = useState<Member | null>(null);
  // 見本なので、ページを替えても行は替わらない（ページ送りの置き方だけを見る）
  const [page, setPage] = useState(1);

  // 空の状態では、チームにまだ誰もいない
  const all = state === 'empty' ? [] : members;
  const shown = all.filter(
    (m) =>
      (status === 'all' || m.status === status) &&
      (m.name + m.email).toLowerCase().includes(query.toLowerCase())
  );
  const busy = state === 'loading';
  // 見本の全体では 12 ページぶんある想定。絞り込むと件数が減るので、ページ数もそれに合わせて減らす
  const pageCount = Math.max(1, Math.ceil((shown.length / members.length) * 12));

  // 絞り込みが変わったら、ページを先頭に戻す（レンダー中に直接更新する。effect にすると 2 度描画になる）
  const filterKey = `${query}\0${status}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }
  const count = (s: Status) => all.filter((m) => m.status === s).length;
  const statusName = statusItems.find((item) => item.value === status)?.label;

  return (
    <Stack gap="lg">
      <Stack direction="horizontal" gap="md" justify="between" align="end">
        <div>
          <Heading level={1} size="xl">
            メンバー
          </Heading>
          <Text variant="muted" className="mt-1">
            チームに参加している人と、招待中の人です。
          </Text>
        </div>
        <Stack direction="horizontal" gap="md" align="center">
          <AvatarGroup max={4} aria-label="チームのメンバー">
            {all.map((m) => (
              <Avatar key={m.id} name={m.name} />
            ))}
          </AvatarGroup>
          <Button color="primary">メンバーを招待</Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat
          label="メンバー"
          value={<NumberFormat value={all.length} />}
          unit="人"
          loading={busy}
        />
        <Stat
          label="有効"
          value={<NumberFormat value={count('active')} />}
          unit="人"
          loading={busy}
        />
        <Stat
          label="招待中"
          value={<NumberFormat value={count('invited')} />}
          unit="人"
          loading={busy}
        />
        <Stat
          label="停止中"
          value={<NumberFormat value={count('suspended')} />}
          unit="人"
          loading={busy}
        />
      </div>

      <Stack gap="sm">
        <Toolbar aria-label="一覧の操作" disabled={busy}>
          <SearchField
            accessibleName="検索"
            placeholder="名前かメールアドレス"
            value={query}
            onValueChange={setQuery}
            className="min-w-48 flex-1"
          />
          <Select
            accessibleName="状態"
            value={status}
            onValueChange={setStatus}
            items={statusItems}
            className="w-40"
          />
          <ToolbarSeparator />
          <ToolbarButton variant="outline">書き出す</ToolbarButton>
        </Toolbar>
        {(query !== '' || status !== 'all') && (
          <div className="flex flex-wrap gap-2" aria-label="効いている絞り込み" role="group">
            {query !== '' && (
              <Chip removeName={`「${query}」の絞り込みを外す`} onRemove={() => setQuery('')}>
                「{query}」を含む
              </Chip>
            )}
            {status !== 'all' && (
              <Chip removeName={`${statusName}の絞り込みを外す`} onRemove={() => setStatus('all')}>
                {statusName}
              </Chip>
            )}
          </div>
        )}
      </Stack>

      <DataTable accessibleName="メンバーの一覧" loading={busy}>
        <TableHead>
          <TableRow>
            <DataTableHeader>名前</DataTableHeader>
            <DataTableHeader>役割</DataTableHeader>
            <DataTableHeader>状態</DataTableHeader>
            <DataTableHeader>タグ</DataTableHeader>
            <DataTableHeader>最終ログイン</DataTableHeader>
            <DataTableHeader>
              <VisuallyHidden>操作</VisuallyHidden>
            </DataTableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {busy ? (
            <DataTableLoading columns={COLUMNS} />
          ) : shown.length === 0 ? (
            <DataTableEmpty colSpan={COLUMNS}>
              <StatusPanel
                size="sm"
                status="info"
                icon={<Icon icon={MagnifyingGlassIcon} size="lg" standalone />}
                title="見つかりませんでした"
                headingLevel={2}
                actions={<Button variant="outline">メンバーを招待</Button>}
              >
                条件を変えるか、新しいメンバーを招待してください。
              </StatusPanel>
            </DataTableEmpty>
          ) : (
            shown.map((m) => <MemberRow key={m.id} member={m} onOpen={() => setSelected(m)} />)
          )}
        </TableBody>
      </DataTable>

      {state === 'normal' && <Pagination page={page} count={pageCount} onPageChange={setPage} />}

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
              <Time dateTime={selected.lastSeen} withTime />（
              <RelativeTime dateTime={selected.lastSeen} now={now} />）
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
          '管理画面ふうの一覧の見本です。名前を押すか、行のメニュー（行を右クリックしても開きます）から「詳細を見る」を選ぶと、詳細が開きます（広い画面では中央に、指で操作する狭い画面では下のシートに出ます）。検索や状態で絞り込むと、効いている絞り込みが帯の下に並び、× で外せます。状態は Controls で切り替えます。',
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
