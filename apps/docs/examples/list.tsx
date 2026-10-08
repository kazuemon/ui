'use client';

// 見本のページ: 管理画面ふうの一覧。数の要約、検索と絞り込みの帯、効いている絞り込み、表、行のメニュー（右クリックでも開く）、
// 詳細の Dialog、読み込み中と空の状態

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Chip,
  ContextMenu,
  DataTable,
  DataTableEmpty,
  DataTableHeader,
  DataTableLoading,
  type DataTableProps,
  DataTableRow,
  DescriptionItem,
  DescriptionList,
  Dialog,
  Heading,
  Icon,
  Menu,
  MenuItem,
  MenuSeparator,
  NumberFormat,
  type OverlayPresentation,
  Pagination,
  type PaginationCurrentIndicator,
  RelativeTime,
  SearchField,
  Select,
  Stack,
  Stat,
  StatusPanel,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tag,
  Text,
  ThemeProvider,
  Time,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  Tooltip,
  VisuallyHidden,
} from '@kazuemon/ui';
import {
  DotsThreeIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

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
                <Button variant="underline" onClick={onOpen}>
                  {member.name}
                </Button>
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

function ListPage({
  state,
  tableAppearance,
  currentIndicator,
}: {
  state: ListState;
  tableAppearance: DataTableProps['variant'];
  currentIndicator: PaginationCurrentIndicator;
}) {
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
  const count = (s: Status) => all.filter((m) => m.status === s).length;
  const statusName = statusItems.find((item) => item.value === status)?.label;
  // 見本の全体では 12 ページぶんある想定。絞り込むと件数が減るので、ページ数もそれに合わせて減らす
  const pageCount = Math.max(1, Math.ceil((shown.length / members.length) * 12));
  const tableWrapRef = useRef<HTMLDivElement>(null);

  // 絞り込みが変わったら、ページを先頭に戻す（レンダー中に直接更新する。effect にすると 2 度描画になる）
  const filterKey = `${query}\0${status}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  // 横スクロールの位置は DOM を触る必要があるので、こちらは effect で戻す
  useEffect(() => {
    tableWrapRef.current?.querySelector('[data-scroll-viewport]')?.scrollTo({ left: 0 });
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- 絞り込みが変わったら位置を戻す（本体では読まない）
  }, [query, status]);

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

      <div ref={tableWrapRef}>
        <DataTable accessibleName="メンバーの一覧" loading={busy} variant={tableAppearance}>
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
      </div>

      {state === 'normal' && (
        <Pagination
          page={page}
          count={pageCount}
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

export const example: Example = {
  slug: 'list',
  title: '一覧',
  description: 'メンバーを管理する画面の一覧。行から詳細を開く',
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
          tableAppearance={args.tableAppearance as DataTableProps['variant']}
          currentIndicator={args.currentIndicator as PaginationCurrentIndicator}
        />
      </ThemeProvider>
    </SamplePage>
  ),
};
