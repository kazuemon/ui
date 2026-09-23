import {
  HardDrivesIcon,
  InfoIcon,
  MedalIcon,
  PlusIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';

import { Button } from '../components/button/Button';
import { Navbar } from '../components/navbar/Navbar';
import { SidebarItem } from '../components/sidebar/SidebarItem';
import { SidebarTrigger } from '../components/sidebar/SidebarLayout';

// Sidebar のストーリーと見本のページが共有する中身。架空のゲーム「ミラージュ・ストライカーズ」の大会の試合管理

export const TOURNAMENT = 'ミラージュ杯 Season2 チーム戦';

/** 「ステージ」の行の末尾の操作。アイコンだけのボタン */
export function AddStageButton() {
  return (
    <Button iconOnly variant="underline" aria-label="ステージを追加">
      <PlusIcon />
    </Button>
  );
}

/** 大会の試合管理の行き先。ステージ＞リーグ＞グループの 3 段 */
export function TournamentItems({ current = 'Aグループ' }: { current?: string }) {
  const is = (name: string) => name === current;
  return (
    <>
      <SidebarItem label="大会の概要" icon={<InfoIcon />} href="#overview" current={is('概要')} />
      <SidebarItem
        label="ステージ"
        icon={<MedalIcon />}
        action={<AddStageButton />}
        defaultExpanded
      >
        <SidebarItem label="予選リーグ" defaultExpanded>
          <SidebarItem label="Aグループ" href="#a" current={is('Aグループ')} />
          <SidebarItem label="Bグループ" href="#b" current={is('Bグループ')} />
          <SidebarItem label="Cグループ" href="#c" current={is('Cグループ')} />
        </SidebarItem>
        <SidebarItem label="決勝リーグ">
          <SidebarItem label="準決勝" href="#semi" />
          <SidebarItem label="決勝" href="#final" />
        </SidebarItem>
      </SidebarItem>
      <SidebarItem label="参加チーム" icon={<UsersThreeIcon />} href="#teams" />
      <SidebarItem label="マッチサーバー" icon={<HardDrivesIcon />} href="#servers" />
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
