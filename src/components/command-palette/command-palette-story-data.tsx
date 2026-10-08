// ストーリーで使う候補の見本（CommandPalette のストーリーと、比較のストーリーで共有する）
import {
  ArchiveIcon,
  ArticleIcon,
  CopyIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  MoonIcon,
  PencilSimpleIcon,
  PlusIcon,
  SignOutIcon,
  TrashIcon,
  UserIcon,
} from '@phosphor-icons/react';

import type { CommandPaletteGroup } from './CommandPalette';

export const sampleGroups: CommandPaletteGroup[] = [
  {
    label: '操作',
    items: [
      {
        value: 'new-post',
        label: '新しい記事を書く',
        keywords: ['new', 'post', 'しんき'],
        icon: <PlusIcon />,
        shortcut: 'Ctrl+N',
      },
      {
        value: 'edit',
        label: 'この記事を編集',
        keywords: ['edit'],
        icon: <PencilSimpleIcon />,
        shortcut: 'Ctrl+E',
      },
      {
        value: 'duplicate',
        label: '複製',
        keywords: ['copy', 'duplicate'],
        icon: <CopyIcon />,
        shortcut: 'Ctrl+D',
      },
      {
        value: 'archive',
        label: 'アーカイブ',
        icon: <ArchiveIcon />,
        disabled: true,
        description: '公開してからアーカイブできます',
      },
      {
        value: 'delete',
        label: '削除',
        keywords: ['delete', 'remove'],
        icon: <TrashIcon />,
        status: 'danger',
      },
    ],
  },
  {
    label: 'ページ',
    items: [
      { value: 'home', label: 'ホーム', keywords: ['home'], icon: <HouseIcon /> },
      {
        value: 'posts',
        label: '記事の一覧',
        keywords: ['posts', 'blog'],
        icon: <ArticleIcon />,
        description: '公開中 24・下書き 3',
      },
      { value: 'drafts', label: '下書き', keywords: ['draft'], icon: <FileTextIcon /> },
      { value: 'profile', label: 'プロフィール', keywords: ['profile'], icon: <UserIcon /> },
    ],
  },
  {
    label: '設定',
    items: [
      {
        value: 'settings',
        label: '設定を開く',
        keywords: ['settings', 'preferences'],
        icon: <GearSixIcon />,
        shortcut: 'Ctrl+,',
      },
      {
        value: 'theme',
        label: '暗い配色に切り替える',
        keywords: ['dark', 'theme'],
        icon: <MoonIcon />,
      },
      {
        value: 'sign-out',
        label: 'サインアウト',
        keywords: ['logout', 'sign out'],
        icon: <SignOutIcon />,
      },
    ],
  },
];
