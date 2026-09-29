'use client';

import {
  Button,
  DescriptionItem,
  DescriptionList,
  Heading,
  Inspector,
  InspectorLayout,
  MenuItem,
  Navbar,
  Sidebar,
  SidebarItem,
  type SidebarItemBadge,
  SidebarLayout,
  SidebarSection,
  SidebarTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Text,
} from '@kazuemon/ui';
import {
  BellIcon,
  BookOpenTextIcon,
  BroadcastIcon,
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
import { useRef, useState } from 'react';

import type { Example } from './types';

// 大会プラットフォーム: 大会の管理画面。左の列（Sidebar）でステージ＞リーグ＞グループを選び、表の行を押すと
// 右の常駐パネル（Inspector）で試合の詳細を見る。本文を押しのけ、閉じるのは × か Esc
// 架空のゲーム「ミラージュ・ストライカーズ」の大会（src/stories/sidebar-story-parts.tsx と同じ中身）

const TOURNAMENT = 'ミラージュ杯 Season2 チーム戦';

interface Match {
  no: string;
  teams: string;
  status: string;
  color: 'neutral' | 'primary';
  time: string;
  venue: string;
  note: string;
}

const matches: Match[] = [
  {
    no: '第1試合',
    teams: 'ノヴァ隊 対 月影ギルド',
    status: '終了',
    color: 'neutral',
    time: '18:00〜18:32',
    venue: 'サーバー A',
    note: 'ノヴァ隊の勝利（2-0）',
  },
  {
    no: '第2試合',
    teams: 'ハーヴェスト 対 アイアンフォックス',
    status: '進行中',
    color: 'primary',
    time: '18:40〜（進行中）',
    venue: 'サーバー B',
    note: '第2セット、ハーヴェストが 1-0',
  },
  {
    no: '第3試合',
    teams: 'ノヴァ隊 対 ハーヴェスト',
    status: '19:30 開始',
    color: 'neutral',
    time: '19:30〜（予定）',
    venue: 'サーバー A',
    note: '観戦の配信リンクは未公開',
  },
];

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

function MatchDetail({ match }: { match: Match }) {
  return (
    <DescriptionList>
      <DescriptionItem term="対戦">{match.teams}</DescriptionItem>
      <DescriptionItem term="時間">{match.time}</DescriptionItem>
      <DescriptionItem term="サーバー">{match.venue}</DescriptionItem>
      <DescriptionItem term="メモ">{match.note}</DescriptionItem>
    </DescriptionList>
  );
}

function GroupScreen() {
  const [open, setOpen] = useState<Match | null>(null);
  // パネルの中に焦点があるまま閉じたとき、焦点を戻す先（最後に押した試合番号か行）
  const returnFocus = useRef<HTMLElement | null>(null);
  const openMatch = (match: Match, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    setOpen(match);
  };
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
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Text variant="muted">ステージ / 予選リーグ</Text>
            <Heading level={1} size="xl">
              Aグループ
            </Heading>
          </div>
          <Button color="primary">試合を追加</Button>
        </div>
        <section className="flex flex-col gap-3" aria-labelledby="matches">
          <Heading level={2} size="lg" id="matches">
            試合
          </Heading>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>試合</TableHeader>
                <TableHeader>対戦</TableHeader>
                <TableHeader align="end">状態</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.map((match) => (
                <TableRow
                  key={match.no}
                  // 行を押したときは、閉じたあと行の試合番号のボタンに焦点を戻す（行そのものは焦点を受けない）
                  onClick={(event) =>
                    openMatch(
                      match,
                      event.currentTarget.querySelector('button') ?? event.currentTarget
                    )
                  }
                  className="cursor-pointer hover:bg-flat-hover"
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
                    <Tag color={match.color}>{match.status}</Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </InspectorLayout>
  );
}

export const example: Example = {
  slug: 'tournament',
  title: '大会プラットフォーム',
  description:
    '大会の管理画面。左の列（Sidebar）でステージ＞リーグ＞グループを選び、行を押すと横のパネル（Inspector）で試合の詳細を見ます。',
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
