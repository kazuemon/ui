'use client';

import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Combobox,
  DataTable,
  DataTableEmpty,
  DataTableHeader,
  DataTableRow,
  DatePicker,
  DescriptionItem,
  DescriptionList,
  Dialog,
  Heading,
  Icon,
  Inspector,
  InspectorLayout,
  MenuItem,
  Navbar,
  NumberField,
  OverlayClose,
  SegmentedControl,
  SegmentedControlItem,
  Sidebar,
  SidebarItem,
  type SidebarItemBadge,
  SidebarLayout,
  SidebarSection,
  SidebarTrigger,
  Sortable,
  SortableHandle,
  SortableItem,
  Stat,
  StatusPanel,
  Stepper,
  StepperStep,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tag,
  Temporal,
  Text,
  TimePicker,
  Timeline,
  TimelineItem,
} from '@kazuemon/ui';
import {
  BellIcon,
  BookOpenTextIcon,
  BroadcastIcon,
  CalendarBlankIcon,
  ChatCircleDotsIcon,
  CopyIcon,
  GearSixIcon,
  HardDrivesIcon,
  InfoIcon,
  MedalIcon,
  PencilSimpleIcon,
  PlusIcon,
  SignOutIcon,
  TrashIcon,
  TrophyIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { type Dispatch, type SetStateAction, useRef, useState } from 'react';

import type { Example } from './types';

// 大会プラットフォーム: 大会の管理画面。左の列（Sidebar）でステージ＞リーグ＞グループを選ぶ
// 本文はグループのページ: 道筋、大会の進み具合、数の要約、試合の表（状態で絞り込む）、シードの並び（引いて並べ替える）
// 表の試合を押すと、右の常駐パネル（Inspector）に詳細と試合の経過を出す。本文を押しのけ、閉じるのは × か Esc
// 架空のゲーム「ミラージュ・ストライカーズ」の大会（src/samples/tournament.stories.tsx と同じ中身）

const TOURNAMENT = 'ミラージュ杯 Season2 チーム戦';

type MatchStatus = 'done' | 'live' | 'upcoming';

interface MatchEvent {
  time: string;
  title: string;
  type?: 'primary' | 'success';
}

interface Match {
  no: string;
  teams: string;
  status: MatchStatus;
  time: string;
  venue: string;
  note: string;
  events: MatchEvent[];
}

const statusLabel: Record<MatchStatus, string> = {
  done: '終了',
  live: '進行中',
  upcoming: '予定',
};

const matches: Match[] = [
  {
    no: '第1試合',
    teams: 'ノヴァ隊 対 月影ギルド',
    status: 'done',
    time: '18:00〜18:32',
    venue: 'サーバー A',
    note: 'ノヴァ隊の勝利（2-0）',
    events: [
      { time: '18:00', title: '試合開始' },
      { time: '18:14', title: '第1セット: ノヴァ隊' },
      { time: '18:32', title: '第2セット: ノヴァ隊。ノヴァ隊の勝利', type: 'success' },
    ],
  },
  {
    no: '第2試合',
    teams: 'ハーヴェスト 対 アイアンフォックス',
    status: 'live',
    time: '18:40〜（進行中）',
    venue: 'サーバー B',
    note: '第2セット、ハーヴェストが 1-0',
    events: [
      { time: '18:40', title: '試合開始' },
      { time: '18:57', title: '第1セット: ハーヴェスト' },
      { time: '18:59', title: '第2セット 進行中', type: 'primary' },
    ],
  },
  {
    no: '第3試合',
    teams: 'ノヴァ隊 対 ハーヴェスト',
    status: 'upcoming',
    time: '19:30〜（予定）',
    venue: 'サーバー A',
    note: '観戦の配信リンクは未公開',
    events: [],
  },
];

const teams = ['ノヴァ隊', '月影ギルド', 'ハーヴェスト', 'アイアンフォックス'];
const teamItems = teams.map((team) => ({ label: team, value: team }));

function MatchDetail({ match }: { match: Match }) {
  return (
    <div className="flex flex-col gap-6">
      <DescriptionList>
        <DescriptionItem term="対戦">{match.teams}</DescriptionItem>
        <DescriptionItem term="時間">{match.time}</DescriptionItem>
        <DescriptionItem term="サーバー">{match.venue}</DescriptionItem>
        <DescriptionItem term="メモ">{match.note}</DescriptionItem>
      </DescriptionList>
      <section className="flex flex-col gap-3" aria-labelledby="match-events">
        <Heading level={3} size="md" id="match-events">
          試合の経過
        </Heading>
        {match.events.length === 0 ? (
          <Text variant="muted">まだ始まっていません。</Text>
        ) : (
          <Timeline headingLevel={false} markerSize="sm">
            {match.events.map((event) => (
              <TimelineItem
                key={event.time}
                date={event.time}
                title={event.title}
                markerType={event.type}
              />
            ))}
          </Timeline>
        )}
      </section>
    </div>
  );
}

// 試合を足す Dialog。見本なので、追加を押しても表は変わらない
function AddMatchDialog() {
  return (
    <Dialog
      presentation="auto"
      title="試合を追加"
      description="Aグループに試合を足します。"
      trigger={<Button color="primary">試合を追加</Button>}
      actions={
        <>
          <OverlayClose render={<Button variant="outline">やめる</Button>} />
          <OverlayClose render={<Button color="primary">追加する</Button>} />
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Combobox label="チーム 1" items={teamItems} placeholder="チームを選ぶ" />
          <Combobox label="チーム 2" items={teamItems} placeholder="チームを選ぶ" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePicker label="日付" defaultValue={Temporal.PlainDate.from('2026-10-10')} />
          <TimePicker label="開始時刻" defaultValue={Temporal.PlainTime.from('20:00')} />
        </div>
        <NumberField label="先取するセット数" min={1} max={5} defaultValue={2} />
      </div>
    </Dialog>
  );
}

// シードの並び。キーボードと読み上げは Sortable が持つので、dnd-kit にはポインタで引く動きだけを任せる
//   （Recipes/Sortable と同じつなぎ方）。引き始めるのは 4px 動かしてから
const sensors = [
  PointerSensor.configure({
    activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })],
  }),
];
// 周りがずれる動きと、離したときに収まる動きを、Sortable（motion="slide"）と同じ長さと緩急にそろえる
const transition = { duration: 250, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' };

function SeedLabel({ team, index }: { team: string; index: number }) {
  return (
    <span className="flex items-center gap-3">
      <Text as="span" variant="subtle" className="tabular-nums">
        {index + 1}
      </Text>
      {team}
    </span>
  );
}

function SeedList({
  value,
  onValueChange,
}: {
  value: string[];
  onValueChange: Dispatch<SetStateAction<string[]>>;
}) {
  return (
    <DragDropProvider
      sensors={sensors}
      plugins={(defaults) => defaults.filter((plugin) => plugin !== Accessibility)}
      onDragEnd={(event) => onValueChange((current) => move(current, event))}
    >
      {/* 引かなくても並べ替えられるよう、行の末尾に ︙ のメニューを置く（WCAG 2.2 の 2.5.7） */}
      <Sortable
        value={value}
        onValueChange={onValueChange}
        moveActions="item-menu"
        aria-label="シードの順"
      >
        {value.map((team, index) => (
          <SeedRow key={team} team={team} index={index} />
        ))}
      </Sortable>
      {/* 引いているあいだ、ポインタについて動く写し */}
      <DragOverlay tag="ul" dropAnimation={transition}>
        {(source) => (
          <SortableItem value={String(source.id)} dragging>
            <SortableHandle />
            <SeedLabel team={String(source.id)} index={value.indexOf(String(source.id))} />
          </SortableItem>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}

function SeedRow({ team, index }: { team: string; index: number }) {
  const { ref, handleRef, isDragSource } = useSortable({ id: team, index, transition });
  return (
    <SortableItem ref={ref} value={team} dragSource={isDragSource} accessibleName={team}>
      <SortableHandle ref={handleRef} />
      <SeedLabel team={team} index={index} />
    </SortableItem>
  );
}

function GroupScreen() {
  const [open, setOpen] = useState<Match | null>(null);
  const [filter, setFilter] = useState<MatchStatus | 'all'>('all');
  const [seeds, setSeeds] = useState(teams);
  // パネルの中に焦点があるまま閉じたとき、焦点を戻す先（最後に押した試合番号か行）
  const returnFocus = useRef<HTMLElement | null>(null);
  const openMatch = (match: Match, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    setOpen(match);
  };
  const shown = matches.filter((match) => filter === 'all' || match.status === filter);
  return (
    <InspectorLayout
      className="h-full"
      open={open != null}
      onOpenChange={(next) => !next && setOpen(null)}
      inspector={
        <Inspector title={open?.no ?? ''} description={open?.teams} returnFocus={returnFocus}>
          {open && <MatchDetail match={open} />}
        </Inspector>
      }
    >
      <div className="mx-auto flex max-w-[880px] flex-col gap-8 p-6">
        <div className="flex flex-col gap-3">
          <Breadcrumb>
            <BreadcrumbItem href="#stage" onClick={(event) => event.preventDefault()}>
              ステージ
            </BreadcrumbItem>
            <BreadcrumbItem href="#qualifier" onClick={(event) => event.preventDefault()}>
              予選リーグ
            </BreadcrumbItem>
            <BreadcrumbItem current>Aグループ</BreadcrumbItem>
          </Breadcrumb>
          <div className="flex items-end justify-between gap-4">
            <Heading level={1} size="xl">
              Aグループ
            </Heading>
            <AddMatchDialog />
          </div>
        </div>

        <Stepper value={1} accessibleName="大会の進み具合">
          <StepperStep label="エントリー" />
          <StepperStep label="予選リーグ" />
          <StepperStep label="本選" />
          <StepperStep label="結果発表" />
        </Stepper>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Stat label="参加チーム" value={teams.length} unit="チーム" />
          <Stat label="終わった試合" value={1} unit={`/ ${matches.length} 試合`} />
          <Stat
            label="次の試合"
            value="19:30"
            caption={
              <span className="inline-flex items-center gap-1">
                <Icon icon={CalendarBlankIcon} />
                第3試合
              </span>
            }
          />
        </div>

        <section className="flex flex-col gap-3" aria-labelledby="matches">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Heading level={2} size="lg" id="matches">
              試合
            </Heading>
            <SegmentedControl<MatchStatus | 'all'>
              accessibleName="試合の状態で絞り込む"
              value={filter}
              onValueChange={setFilter}
            >
              <SegmentedControlItem value="all">すべて</SegmentedControlItem>
              <SegmentedControlItem value="live">進行中</SegmentedControlItem>
              <SegmentedControlItem value="upcoming">予定</SegmentedControlItem>
              <SegmentedControlItem value="done">終了</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <DataTable accessibleName="試合" color="primary">
            <TableHead>
              <TableRow>
                <DataTableHeader>試合</DataTableHeader>
                <DataTableHeader>対戦</DataTableHeader>
                <DataTableHeader align="end">状態</DataTableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {shown.length === 0 ? (
                <DataTableEmpty colSpan={3}>
                  <StatusPanel size="sm" title="当てはまる試合はありません" headingLevel={3}>
                    ほかの状態を選んでください。
                  </StatusPanel>
                </DataTableEmpty>
              ) : (
                shown.map((match) => (
                  <DataTableRow
                    key={match.no}
                    selected={open?.no === match.no}
                    status={match.status === 'done' ? 'muted' : undefined}
                    // 行を押したときは、閉じたあと行の試合番号のボタンに焦点を戻す（行そのものは焦点を受けない）
                    onClick={(event) =>
                      openMatch(
                        match,
                        event.currentTarget.querySelector('button') ?? event.currentTarget
                      )
                    }
                    className="cursor-pointer"
                  >
                    <TableCell>
                      {/* 行を押しても開くが、キーボードと読み上げのために、試合番号をボタンにする */}
                      <Button
                        variant="underline"
                        className="h-auto px-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          openMatch(match, event.currentTarget);
                        }}
                      >
                        {match.no}
                      </Button>
                    </TableCell>
                    <TableCell>{match.teams}</TableCell>
                    <TableCell align="end">
                      <Tag color={match.status === 'live' ? 'primary' : 'neutral'}>
                        {match.status === 'upcoming' ? '19:30 開始' : statusLabel[match.status]}
                      </Tag>
                    </TableCell>
                  </DataTableRow>
                ))
              )}
            </TableBody>
          </DataTable>
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="seeds">
          <div className="flex flex-col gap-1">
            <Heading level={2} size="lg" id="seeds">
              シード
            </Heading>
            <Text variant="muted">
              本選の組み合わせに使う順です。つまみを引くか、︙ やキーボード（つまみで
              Space）で並べ替えます。
            </Text>
          </div>
          <SeedList value={seeds} onValueChange={setSeeds} />
        </section>
      </div>
    </InspectorLayout>
  );
}

/** 行ごとの操作（名前を変える・複製・削除） */
function RowMenu() {
  return (
    <>
      <MenuItem icon={<PencilSimpleIcon />}>名前を変える</MenuItem>
      <MenuItem icon={<CopyIcon />}>複製</MenuItem>
      <MenuItem icon={<TrashIcon />} status="danger">
        削除
      </MenuItem>
    </>
  );
}

/** 入れ子の末尾に置く「作成」の行。行き先を持たない */
function CreateItem() {
  return <SidebarItem label="作成" icon={<PlusIcon />} />;
}

/** 列の中身: 大会の切り替え・試合管理（ステージ＞リーグ＞グループ）・関連情報 */
function TournamentSidebar() {
  const badge = (value: SidebarItemBadge) => value;
  return (
    <Sidebar
      header={
        <SidebarItem label={TOURNAMENT} icon={<TrophyIcon weight="fill" />} submenuTitle="大会一覧">
          <SidebarItem label="ミラージュ杯 Season1" href="#s1" />
          <SidebarItem label="春のスプリント杯" href="#spring" />
          <SidebarItem label="大会を作成" icon={<PlusIcon />} />
        </SidebarItem>
      }
      footer={
        <>
          <SidebarItem label="お知らせ" icon={<BellIcon />} href="#notice" badge={{ count: 5 }} />
          <SidebarItem label="設定" icon={<GearSixIcon />} href="#settings" />
          <SidebarItem
            label="かずえもん"
            icon={<UserCircleIcon />}
            href="#account"
            menu={
              <>
                <MenuItem icon={<UserCircleIcon />}>プロフィール</MenuItem>
                <MenuItem icon={<SignOutIcon />}>ログアウト</MenuItem>
              </>
            }
          />
        </>
      }
      collapseButton
    >
      <SidebarSection title="試合管理" collapsible>
        <SidebarItem label="大会の概要" icon={<InfoIcon />} href="#overview" />
        <SidebarItem
          label="ステージ"
          icon={<MedalIcon />}
          defaultExpanded
          badge={badge({ count: 2 })}
        >
          <SidebarItem label="予選リーグ" defaultExpanded menu={<RowMenu />}>
            <SidebarItem label="Aグループ" href="#a" current menu={<RowMenu />} />
            <SidebarItem
              label="Bグループ"
              href="#b"
              badge={badge({ count: 2 })}
              menu={<RowMenu />}
            />
            <SidebarItem label="Cグループ" href="#c" menu={<RowMenu />} />
            <CreateItem />
          </SidebarItem>
          <SidebarItem label="決勝リーグ" menu={<RowMenu />}>
            <SidebarItem label="準決勝" href="#semi" />
            <SidebarItem label="決勝" href="#final" />
            <CreateItem />
          </SidebarItem>
          <CreateItem />
        </SidebarItem>
        <SidebarItem
          label="参加チーム"
          icon={<UsersThreeIcon />}
          href="#teams"
          badge={badge({ count: 3, color: 'primary' })}
        />
        <SidebarItem label="賞品・賞金" icon={<TrophyIcon />} href="#prizes" />
        <SidebarItem
          label="マッチサーバー"
          icon={<HardDrivesIcon />}
          href="#servers"
          badge={badge({ shape: 'dot', color: 'danger' })}
        />
      </SidebarSection>
      <SidebarSection title="関連情報" collapsible>
        <SidebarItem
          label="大会ルール"
          icon={<BookOpenTextIcon />}
          href="https://example.com/mirage-cup/rules"
          target="_blank"
        />
        <SidebarItem
          label="配信ページ"
          icon={<BroadcastIcon />}
          href="https://example.com/mirage-cup/live"
          target="_blank"
        />
        <SidebarItem
          label="お問い合わせ"
          icon={<ChatCircleDotsIcon />}
          href="#contact"
          badge={badge({ count: 128, collapsedShape: 'dot' })}
        />
      </SidebarSection>
    </Sidebar>
  );
}

export const example: Example = {
  slug: 'tournament',
  title: '大会プラットフォーム',
  description:
    '大会の管理画面。左の列（Sidebar）でステージ＞リーグ＞グループを選び、行を押すと横のパネル（Inspector）で試合の詳細と経過を見ます。シードは引いて並べ替えます。',
  controls: [],
  defaults: {},
  fillViewport: true,
  Screen: ({ density }) => (
    <div data-density={density === 'auto' ? undefined : density} className="h-dvh bg-bg text-fg">
      <SidebarLayout
        header={
          <Navbar
            size="full"
            brand={
              <span className="flex min-w-0 items-center gap-3">
                <SidebarTrigger />
                <span className="truncate text-(length:--text-control)">{TOURNAMENT}</span>
              </span>
            }
          />
        }
        resizable
        sidebar={<TournamentSidebar />}
      >
        <GroupScreen />
      </SidebarLayout>
    </div>
  ),
};
