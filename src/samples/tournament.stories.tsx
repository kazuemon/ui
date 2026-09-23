import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tag } from '../components/tag/Tag';
import { Button } from '../components/button/Button';
import { Heading } from '../components/heading/Heading';
import { Sidebar } from '../components/sidebar/Sidebar';
import { SidebarLayout } from '../components/sidebar/SidebarLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table/Table';
import { Text } from '../components/text/Text';
import { DemoNavbar, TournamentItems } from '../stories/sidebar-story-parts';
import { densityOf } from './SamplePage';

// 大会の試合管理の画面: ハンバーガーで開け閉めする列（畳むとアイコンだけ）と、ステージ＞リーグ＞グループの入れ子
// 見本の中身は、架空のゲーム「ミラージュ・ストライカーズ」の大会

const standings = [
  ['1', 'ノヴァ隊', '3', '0', '9'],
  ['2', '月影ギルド', '2', '1', '6'],
  ['3', 'ハーヴェスト', '1', '2', '3'],
  ['4', 'アイアンフォックス', '0', '3', '0'],
];

const matches = [
  { no: '第1試合', teams: 'ノヴァ隊 対 月影ギルド', status: '終了', color: 'neutral' as const },
  {
    no: '第2試合',
    teams: 'ハーヴェスト 対 アイアンフォックス',
    status: '進行中',
    color: 'primary' as const,
  },
  {
    no: '第3試合',
    teams: 'ノヴァ隊 対 ハーヴェスト',
    status: '19:30 開始',
    color: 'neutral' as const,
  },
];

function GroupScreen() {
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
      <section className="flex flex-col gap-3" aria-labelledby="standings">
        <Heading level={2} size={3} id="standings">
          順位
        </Heading>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>順位</TableHeader>
              <TableHeader>チーム</TableHeader>
              <TableHeader align="end">勝</TableHeader>
              <TableHeader align="end">敗</TableHeader>
              <TableHeader align="end">勝ち点</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {standings.map(([rank, team, win, lose, points]) => (
              <TableRow key={team}>
                <TableCell>{rank}</TableCell>
                <TableCell>{team}</TableCell>
                <TableCell align="end">{win}</TableCell>
                <TableCell align="end">{lose}</TableCell>
                <TableCell align="end">{points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <section className="flex flex-col gap-3" aria-labelledby="matches">
        <Heading level={2} size={3} id="matches">
          試合
        </Heading>
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {matches.map((match) => (
            <li key={match.no} className="flex items-center justify-between gap-4 py-3">
              <div className="flex flex-col">
                <Text variant="muted">{match.no}</Text>
                <Text>{match.teams}</Text>
              </div>
              <Tag color={match.color}>{match.status}</Tag>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const meta = {
  title: 'Overview/見本',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tournament: Story = {
  name: '試合管理',
  render: (_args, { globals }) => (
    <div data-density={densityOf(globals)} className="h-screen bg-bg text-fg">
      <SidebarLayout
        header={<DemoNavbar />}
        sidebar={
          <Sidebar collapseButton>
            <TournamentItems />
          </Sidebar>
        }
      >
        <GroupScreen />
      </SidebarLayout>
    </div>
  ),
};
