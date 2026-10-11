'use client';

import { CopyIcon, DownloadSimpleIcon, FolderSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { type CSSProperties, useState } from 'react';

import { Checkbox } from '../checkbox/Checkbox';
import { Icon } from '../icon/Icon';
import {
  ActionBar,
  ActionBarButton,
  type ActionBarNarrowDisplay,
  type ActionBarProps,
} from './ActionBar';

// ストーリーで使う場面（部品ではない）。スクロールする枠の中に、選べる行の一覧と ActionBar を置く

const FILES = [
  '2026 年 春の旅行の写真',
  '見積書（10 月分）',
  'デザインのラフ v3',
  '会議のメモ 10/03',
  'ポートフォリオの原稿',
  'アイコンの素材',
  '請求書（9 月分）',
  'ブログの下書き: 文字の組み方',
  '動画の書き出し（1080p）',
  '読書のメモ',
  'スクリーンショット 10/08',
  '家計簿 2026',
];

export interface SelectableListSceneProps {
  /** はじめに選んでいる行（0 から数える） */
  defaultSelected?: number[];
  /** 行の数 */
  rows?: number;
  /** 操作の数。two は複製・削除、many は複製・書き出す・移動・削除 */
  actions?: 'two' | 'many';
  /** ActionBar の narrowDisplay */
  narrowDisplay?: ActionBarNarrowDisplay;
  /** 操作にアイコンを付けるか */
  icons?: boolean;
  /** 選択を外すボタン（×）を置くか */
  clearable?: boolean;
  /** 枠の高さ（px） */
  height?: number;
  /** 枠の幅（CSS の長さ）。書かないときは置いた場所の幅いっぱい */
  width?: string;
  /** 枠の幅をつまんで変えられるようにする */
  resizable?: boolean;
  /** 最後の行までスクロールしておく */
  scrollToEnd?: boolean;
  style?: CSSProperties;
  /** ActionBar に渡すそのほかの props（variant など） */
  barProps?: Partial<ActionBarProps>;
}

/** 選べる行の一覧と ActionBar。行を選ぶと帯が出て、削除で選んだ行が消えます */
export function SelectableListScene({
  defaultSelected = [1, 2],
  rows = 12,
  actions = 'two',
  narrowDisplay,
  icons = false,
  clearable = true,
  height = 360,
  width,
  resizable = false,
  scrollToEnd = false,
  style,
  barProps,
}: SelectableListSceneProps) {
  const [items, setItems] = useState(() => FILES.slice(0, rows).map((name, id) => ({ id, name })));
  const [selected, setSelected] = useState<Set<number>>(() => new Set(defaultSelected));
  const toggle = (id: number, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  const clear = () => setSelected(new Set());
  const remove = () => {
    setItems((prev) => prev.filter((item) => !selected.has(item.id)));
    clear();
  };
  const icon = (glyph: typeof CopyIcon) => (icons ? <Icon icon={glyph} /> : undefined);
  return (
    <div
      ref={(el) => {
        if (scrollToEnd && el) el.scrollTop = el.scrollHeight;
      }}
      className="overflow-auto rounded-card border border-line bg-bg"
      style={{
        height,
        width,
        resize: resizable ? 'horizontal' : undefined,
        minWidth: resizable ? 240 : undefined,
        maxWidth: '100%',
        ...style,
      }}
    >
      <p className="px-4 pt-4 pb-2 text-sm font-bold text-fg-subtle">ファイル</p>
      <ul className="flex flex-col px-2">
        {items.map((item) => (
          <li
            key={item.id}
            data-selected={selected.has(item.id) ? '' : undefined}
            className="rounded-control px-2 data-selected:bg-primary-subtle"
          >
            <Checkbox
              label={item.name}
              checked={selected.has(item.id)}
              onCheckedChange={(on) => toggle(item.id, on)}
            />
          </li>
        ))}
      </ul>
      <ActionBar
        open={selected.size > 0}
        label={`${selected.size} 件を選択中`}
        onClear={clearable ? clear : undefined}
        narrowDisplay={narrowDisplay}
        {...barProps}
      >
        <ActionBarButton icon={icon(CopyIcon)}>複製</ActionBarButton>
        {actions === 'many' && (
          <ActionBarButton icon={icon(DownloadSimpleIcon)}>書き出す</ActionBarButton>
        )}
        {actions === 'many' && (
          <ActionBarButton icon={icon(FolderSimpleIcon)}>移動</ActionBarButton>
        )}
        <ActionBarButton icon={icon(TrashIcon)} status="danger" onClick={remove}>
          削除
        </ActionBarButton>
      </ActionBar>
    </div>
  );
}
