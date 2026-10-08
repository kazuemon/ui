import { CalendarBlankIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

import { Breadcrumb, BreadcrumbItem } from '../components/breadcrumb/Breadcrumb';
import { Button } from '../components/button/Button';
import { Combobox } from '../components/combobox/Combobox';
import { DataTable } from '../components/data-table/DataTable';
import { DataTableEmpty } from '../components/data-table/DataTableEmpty';
import { DataTableHeader } from '../components/data-table/DataTableHeader';
import { DataTableRow } from '../components/data-table/DataTableRow';
import { DatePicker } from '../components/date-picker/DatePicker';
import { DescriptionItem, DescriptionList } from '../components/description-list/DescriptionList';
import { Dialog } from '../components/dialog/Dialog';
import { Heading } from '../components/heading/Heading';
import { Icon } from '../components/icon/Icon';
import { Inspector } from '../components/inspector/Inspector';
import { InspectorLayout } from '../components/inspector/InspectorLayout';
import { NumberField } from '../components/number-field/NumberField';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '../components/segmented-control/SegmentedControl';
import { Sidebar } from '../components/sidebar/Sidebar';
import { SidebarLayout } from '../components/sidebar/SidebarLayout';
import { Sortable, SortableHandle, SortableItem } from '../components/sortable/Sortable';
import { Stat } from '../components/stat/Stat';
import { StatusPanel } from '../components/status-panel/StatusPanel';
import { Stepper, StepperStep } from '../components/stepper/Stepper';
import { TableBody, TableCell, TableHead, TableRow } from '../components/table/Table';
import { Tag } from '../components/tag/Tag';
import { Text } from '../components/text/Text';
import { TimePicker } from '../components/time-picker/TimePicker';
import { Timeline, TimelineItem } from '../components/timeline/Timeline';
import { OverlayClose, Temporal } from '../index';
import {
  AccountItems,
  DemoNavbar,
  TournamentItems,
  TournamentSwitcher,
} from '../stories/sidebar-story-parts';
import { densityOf } from './SamplePage';

// 大会プラットフォームの画面: Sidebar と Inspector の見本を兼ねる
// 左の列（Sidebar）はハンバーガーで開け閉めする列（畳むとアイコンだけ）で、ステージ＞リーグ＞グループの入れ子を持つ
// 本文はグループのページ: 道筋、大会の進み具合、数の要約、試合の表（状態で絞り込む）、シードの並び
// 表の試合を押すと、右の常駐パネル（Inspector）に詳細と試合の経過を出す。本文を押しのけ（variant="push"）、閉じるのは × か Esc
// 見本の中身は、架空のゲーム「ミラージュ・ストライカーズ」の大会

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
              本選の組み合わせに使う順です。つまみか ︙ から並べ替えます。
            </Text>
          </div>
          <Sortable
            value={seeds}
            onValueChange={setSeeds}
            moveActions="item-menu"
            aria-label="シードの順"
          >
            {seeds.map((team, index) => (
              <SortableItem key={team} value={team} accessibleName={team}>
                <SortableHandle />
                <span className="flex items-center gap-3">
                  <Text as="span" variant="subtle" className="tabular-nums">
                    {index + 1}
                  </Text>
                  {team}
                </span>
              </SortableItem>
            ))}
          </Sortable>
        </section>
      </div>
    </InspectorLayout>
  );
}

const meta = {
  title: 'Overview/見本',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '大会の管理画面の見本です。左の列でステージ＞リーグ＞グループを選び、行を押すと横のパネルで試合の詳細と経過を見ます。シードは、つまみにフォーカスして矢印キーで動かすか、︙ のメニューで並べ替えます。密度はツールバーで切り替えます。',
      },
    },
  },
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
