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
import { type ReactNode } from 'react';

import { MenuItem } from '../../src/components/menu/MenuItem';
import { Sidebar } from '../../src/components/sidebar/Sidebar';
import { SidebarItem } from '../../src/components/sidebar/SidebarItem';
import { SidebarLayout, type SidebarLayoutProps } from '../../src/components/sidebar/SidebarLayout';
import { SidebarSection } from '../../src/components/sidebar/SidebarSection';
import { DemoNavbar } from '../../src/stories/sidebar-story-parts';

// 軸 379〜384 の比較で共有する見本。架空のゲーム大会「ミラージュ杯」の管理画面（ダッシュボードの左の列）
//   部品は本物（src/components/sidebar）。候補はトークンの上書きだけで作る。比較が終わったら消す

export interface Features {
  /** 列の上・下に固定する行 */
  edges?: boolean;
  /** 行の件数 */
  counts?: boolean;
  /** 行ごとのメニュー */
  menus?: boolean;
  /** 節を畳める */
  collapsible?: boolean;
}

function GroupMenu() {
  return (
    <>
      <MenuItem icon={<PencilSimpleIcon />}>名前を変える</MenuItem>
      <MenuItem icon={<CopyIcon />}>複製</MenuItem>
      <MenuItem icon={<TrashIcon />}>削除</MenuItem>
    </>
  );
}

export function DashboardItems({ counts, menus, collapsible }: Features) {
  const menu = menus ? <GroupMenu /> : undefined;
  return (
    <>
      <SidebarSection title="試合管理" collapsible={collapsible}>
        <SidebarItem label="大会の概要" icon={<InfoIcon />} href="#overview" />
        <SidebarItem
          label="ステージ"
          icon={<MedalIcon />}
          defaultExpanded
          count={counts ? 2 : undefined}
        >
          <SidebarItem label="予選リーグ" defaultExpanded menu={menu}>
            <SidebarItem label="Aグループ" href="#a" current menu={menu} />
            <SidebarItem label="Bグループ" href="#b" count={counts ? 2 : undefined} menu={menu} />
            <SidebarItem label="Cグループ" href="#c" menu={menu} />
            <SidebarItem label="作成" icon={<PlusIcon />} />
          </SidebarItem>
          <SidebarItem label="決勝リーグ" menu={menu}>
            <SidebarItem label="準決勝" href="#semi" />
            <SidebarItem label="決勝" href="#final" />
          </SidebarItem>
        </SidebarItem>
        <SidebarItem
          label="参加チーム"
          icon={<UsersThreeIcon />}
          href="#teams"
          count={counts ? 3 : undefined}
        />
        <SidebarItem label="賞品・賞金" icon={<TrophyIcon />} href="#prizes" />
        <SidebarItem label="マッチサーバー" icon={<HardDrivesIcon />} href="#servers" />
      </SidebarSection>
      <SidebarSection title="関連情報" collapsible={collapsible} defaultExpanded={!collapsible}>
        <SidebarItem label="大会ルール" icon={<BookOpenTextIcon />} href="#rules" />
        <SidebarItem label="配信ページ" icon={<BroadcastIcon />} href="#live" />
        <SidebarItem
          label="お問い合わせ"
          icon={<ChatCircleDotsIcon />}
          href="#contact"
          count={counts ? 128 : undefined}
        />
      </SidebarSection>
    </>
  );
}

/** 列の上に固定する行: 大会の切り替え */
export function DashboardHeader() {
  return (
    <SidebarItem label="ミラージュ杯 Season2" icon={<TrophyIcon weight="fill" />}>
      <SidebarItem label="ミラージュ杯 Season1" href="#s1" />
      <SidebarItem label="春のスプリント杯" href="#spring" />
      <SidebarItem label="大会を作成" icon={<PlusIcon />} />
    </SidebarItem>
  );
}

/** 列の下に固定する行: お知らせ・設定・アカウント */
export function DashboardFooter({ counts, menus }: Features) {
  return (
    <>
      <SidebarItem
        label="お知らせ"
        icon={<BellIcon />}
        href="#notice"
        count={counts ? 5 : undefined}
      />
      <SidebarItem label="設定" icon={<GearSixIcon />} href="#settings" />
      <SidebarItem
        label="かずえもん"
        icon={<UserCircleIcon />}
        href="#account"
        menu={
          menus ? (
            <>
              <MenuItem icon={<UserCircleIcon />}>プロフィール</MenuItem>
              <MenuItem icon={<SignOutIcon />}>ログアウト</MenuItem>
            </>
          ) : undefined
        }
      />
    </>
  );
}

/**
 * 比較のマスの中の画面。広い画面の骨組み（800px）を作り、左の一部（width）だけを見せる。
 * SidebarLayout は置かれた面が 48rem より狭いと Drawer にするので、骨組みそのものは広く取る
 */
export function Frame({
  features = {},
  width = 360,
  height = 560,
  collapsed,
  layoutProps,
  children,
}: {
  features?: Features;
  width?: number;
  height?: number;
  collapsed?: boolean;
  layoutProps?: Partial<SidebarLayoutProps>;
  children?: ReactNode;
}) {
  return (
    <div style={{ width, height }} className="overflow-hidden rounded-card border border-line">
      <div style={{ width: 800, height }}>
        <SidebarLayout
          header={<DemoNavbar title="ミラージュ杯 管理" />}
          {...(collapsed !== undefined && { collapsed })}
          motion="none"
          {...layoutProps}
          sidebar={
            <Sidebar
              header={features.edges ? <DashboardHeader /> : undefined}
              footer={features.edges ? <DashboardFooter {...features} /> : undefined}
            >
              <DashboardItems {...features} />
            </Sidebar>
          }
        >
          {children ?? (
            <div className="flex flex-col gap-3 p-6">
              <h2 className="text-xl font-heading">Aグループ</h2>
              <p className="text-sm text-fg-muted">第1試合　ノヴァ隊 対 月影ギルド</p>
              <p className="text-sm text-fg-muted">第2試合　ハーヴェスト 対 アイアンフォックス</p>
            </div>
          )}
        </SidebarLayout>
      </div>
    </div>
  );
}
