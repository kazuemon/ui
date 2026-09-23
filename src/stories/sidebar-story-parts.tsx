import {
  BookOpenTextIcon,
  BroadcastIcon,
  ChatCircleDotsIcon,
  HardDrivesIcon,
  InfoIcon,
  MedalIcon,
  PlusIcon,
  TrophyIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';

import { Button } from '../components/button/Button';
import { Navbar } from '../components/navbar/Navbar';
import { SidebarItem } from '../components/sidebar/SidebarItem';
import { SidebarTrigger } from '../components/sidebar/SidebarLayout';

// Sidebar のストーリーと見本のページが共有する中身。架空のゲーム「ミラージュ・ストライカーズ」の大会の試合管理

export const TOURNAMENT = 'ミラージュ杯 Season2 チーム戦';

/** 入れ子の末尾に置く「作成」の行。行き先を持たず、押すと onCreate を呼ぶ */
function CreateItem({ onCreate }: { onCreate?: () => void }) {
  return <SidebarItem label="作成" icon={<PlusIcon />} onClick={onCreate} />;
}

/**
 * 大会の試合管理の行き先。ステージ＞リーグ＞グループの 3 段で、各段の末尾に「作成」の行を置く。
 * 外部のページ（新しいタブで開く）も含む
 */
export function TournamentItems({
  current = 'Aグループ',
  onCreate,
}: {
  current?: string;
  onCreate?: () => void;
}) {
  const is = (name: string) => name === current;
  return (
    <>
      <SidebarItem label="大会の概要" icon={<InfoIcon />} href="#overview" current={is('概要')} />
      <SidebarItem label="ステージ" icon={<MedalIcon />} defaultExpanded>
        <SidebarItem label="予選リーグ" defaultExpanded>
          <SidebarItem label="Aグループ" href="#a" current={is('Aグループ')} />
          <SidebarItem label="Bグループ" href="#b" current={is('Bグループ')} />
          <SidebarItem label="Cグループ" href="#c" current={is('Cグループ')} />
          <CreateItem onCreate={onCreate} />
        </SidebarItem>
        <SidebarItem label="決勝リーグ">
          <SidebarItem label="準決勝" href="#semi" />
          <SidebarItem label="決勝" href="#final" />
          <CreateItem onCreate={onCreate} />
        </SidebarItem>
        <CreateItem onCreate={onCreate} />
      </SidebarItem>
      <SidebarItem label="参加チーム" icon={<UsersThreeIcon />} href="#teams" />
      <SidebarItem label="賞品・賞金" icon={<TrophyIcon />} href="#prizes" />
      <SidebarItem label="マッチサーバー" icon={<HardDrivesIcon />} href="#servers" />
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
      <SidebarItem label="お問い合わせ" icon={<ChatCircleDotsIcon />} href="#contact" />
    </>
  );
}

/** 帯。左端に開閉のボタン、右端に操作 */
export function DemoNavbar({ title = TOURNAMENT }: { title?: string }) {
  return (
    <Navbar
      size="full"
      brand={
        <span className="flex min-w-0 items-center gap-3">
          <SidebarTrigger />
          <span className="truncate text-(length:--text-control)">{title}</span>
        </span>
      }
      actions={<Button variant="outline">同期</Button>}
    />
  );
}
