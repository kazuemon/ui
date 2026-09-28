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

import { Button } from '../components/button/Button';
import { MenuItem } from '../components/menu/MenuItem';
import { Navbar } from '../components/navbar/Navbar';
import { SidebarItem } from '../components/sidebar/SidebarItem';
import { SidebarSection } from '../components/sidebar/SidebarSection';
import { SidebarTrigger } from '../components/sidebar/SidebarLayout';

// Sidebar のストーリーと見本のページが共有する中身。架空のゲーム「ミラージュ・ストライカーズ」の大会の試合管理

export const TOURNAMENT = 'ミラージュ杯 Season2 チーム戦';

/** 入れ子の末尾に置く「作成」の行。行き先を持たず、押すと onCreate を呼ぶ */
function CreateItem({ onCreate }: { onCreate?: () => void }) {
  return <SidebarItem label="作成" icon={<PlusIcon />} onClick={onCreate} />;
}

/** グループ・リーグの行ごとの操作 */
function GroupMenu() {
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

/**
 * 大会の試合管理の行き先。ステージ＞リーグ＞グループの 3 段で、各段の末尾に「作成」の行を置く。
 * 外部のページ（新しいタブで開く）も含む
 */
export function TournamentItems({
  current = 'Aグループ',
  onCreate,
  dashboard = false,
}: {
  current?: string;
  onCreate?: () => void;
  /** 管理画面の形: 件数・行ごとのメニュー・畳める節を足す */
  dashboard?: boolean;
}) {
  const is = (name: string) => name === current;
  const menu = dashboard ? <GroupMenu /> : undefined;
  const count = (n: number) => (dashboard ? n : undefined);
  return (
    <>
      <SidebarSection title="試合管理" collapsible={dashboard}>
        <SidebarItem label="大会の概要" icon={<InfoIcon />} href="#overview" current={is('概要')} />
        <SidebarItem label="ステージ" icon={<MedalIcon />} defaultExpanded count={count(2)}>
          <SidebarItem label="予選リーグ" defaultExpanded menu={menu}>
            <SidebarItem label="Aグループ" href="#a" current={is('Aグループ')} menu={menu} />
            <SidebarItem
              label="Bグループ"
              href="#b"
              current={is('Bグループ')}
              count={count(2)}
              menu={menu}
            />
            <SidebarItem label="Cグループ" href="#c" current={is('Cグループ')} menu={menu} />
            <CreateItem onCreate={onCreate} />
          </SidebarItem>
          <SidebarItem label="決勝リーグ" menu={menu}>
            <SidebarItem label="準決勝" href="#semi" />
            <SidebarItem label="決勝" href="#final" />
            <CreateItem onCreate={onCreate} />
          </SidebarItem>
          <CreateItem onCreate={onCreate} />
        </SidebarItem>
        <SidebarItem
          label="参加チーム"
          icon={<UsersThreeIcon />}
          href="#teams"
          count={count(3)}
          color="primary"
        />
        <SidebarItem label="賞品・賞金" icon={<TrophyIcon />} href="#prizes" />
        <SidebarItem
          label="マッチサーバー"
          icon={<HardDrivesIcon />}
          href="#servers"
          showDot={dashboard}
          color="danger"
        />
      </SidebarSection>
      <SidebarSection title="関連情報" collapsible={dashboard}>
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
          count={count(128)}
        />
      </SidebarSection>
    </>
  );
}

/** 列の上に固定する行: 大会の切り替え（入れ子にほかの大会） */
export function TournamentSwitcher() {
  return (
    <SidebarItem label={TOURNAMENT} icon={<TrophyIcon weight="fill" />}>
      <SidebarItem label="ミラージュ杯 Season1" href="#s1" />
      <SidebarItem label="春のスプリント杯" href="#spring" />
      <SidebarItem label="大会を作成" icon={<PlusIcon />} />
    </SidebarItem>
  );
}

/** 列の下に固定する行: お知らせ・設定・アカウント */
export function AccountItems() {
  return (
    <>
      <SidebarItem label="お知らせ" icon={<BellIcon />} href="#notice" count={5} />
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
