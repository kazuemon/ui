import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

import { Button } from '../components/button/Button';
import { DescriptionItem, DescriptionList } from '../components/description-list/DescriptionList';
import { Heading } from '../components/heading/Heading';
import { Inspector } from '../components/inspector/Inspector';
import { InspectorLayout } from '../components/inspector/InspectorLayout';
import { Sidebar } from '../components/sidebar/Sidebar';
import { SidebarLayout } from '../components/sidebar/SidebarLayout';
import { Tag } from '../components/tag/Tag';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table/Table';
import { Text } from '../components/text/Text';
import {
  AccountItems,
  DemoNavbar,
  TournamentItems,
  TournamentSwitcher,
} from '../stories/sidebar-story-parts';
import { densityOf } from './SamplePage';

// 大会プラットフォームの画面: Sidebar と Inspector の見本を兼ねる
// 左の列（Sidebar）はハンバーガーで開け閉めする列（畳むとアイコンだけ）で、ステージ＞リーグ＞グループの入れ子を持つ
// 表の試合を押すと、右の常駐パネル（Inspector）に詳細を出す。本文を押しのけ（variant="push"）、閉じるのは × か Esc
// 見本の中身は、架空のゲーム「ミラージュ・ストライカーズ」の大会

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
            <Heading level={1} size={2}>
              Aグループ
            </Heading>
          </div>
          <Button color="primary">試合を追加</Button>
        </div>
        <section className="flex flex-col gap-3" aria-labelledby="matches">
          <Heading level={2} size={3} id="matches">
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
                  onClick={(event) => openMatch(match, event.currentTarget)}
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

const meta = {
  title: 'Overview/見本',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tournament: Story = {
  name: '大会プラットフォーム',
  render: (_args, { globals }) => (
    <div data-density={densityOf(globals)} className="h-screen bg-bg text-fg">
      <SidebarLayout
        header={<DemoNavbar />}
        resizable
        sidebar={
          <Sidebar header={<TournamentSwitcher />} footer={<AccountItems />} collapseButton>
            <TournamentItems dashboard />
          </Sidebar>
        }
      >
        <GroupScreen />
      </SidebarLayout>
    </div>
  ),
};
