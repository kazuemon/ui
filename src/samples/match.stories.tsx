import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../components/button/Button';
import { DescriptionItem, DescriptionList } from '../components/description-list/DescriptionList';
import { Drawer } from '../components/drawer/Drawer';
import { Heading } from '../components/heading/Heading';
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

// 試合を押すと、右から出る面で詳細を見る。押しのけない（重ねて出す）。× で閉じる、モーダルではない
//   Sidebar とは別の、Drawer の modal="passive" で作った試し置き。Overview/試合 に置き、押しのける列と混同しない

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
  return (
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
                onClick={() => setOpen(match)}
                className="cursor-pointer hover:bg-flat-hover"
              >
                <TableCell>{match.no}</TableCell>
                <TableCell>{match.teams}</TableCell>
                <TableCell align="end">
                  <Tag color={match.color}>{match.status}</Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      {/* 押しのけない、重ねて出す面。passive: 裏を暗くせず、裏の操作も止めない。閉じるのは × だけ */}
      <Drawer
        title={open?.no ?? ''}
        description={open?.teams}
        side="right"
        modal="passive"
        open={open != null}
        onOpenChange={(next) => !next && setOpen(null)}
      >
        {open && <MatchDetail match={open} />}
      </Drawer>
    </div>
  );
}

const meta = {
  title: 'Overview/試合',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MatchDrawer: Story = {
  name: '試合の詳細（押しのけない）',
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
