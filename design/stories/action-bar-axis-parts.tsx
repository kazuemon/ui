import { CopyIcon, TrashIcon } from '@phosphor-icons/react';
import type { CSSProperties, ReactNode } from 'react';

import {
  ActionBar,
  ActionBarButton,
  type ActionBarProps,
} from '../../src/components/action-bar/ActionBar';
import {
  SelectableListScene,
  type SelectableListSceneProps,
} from '../../src/components/action-bar/story-scenes';
import { Icon } from '../../src/components/icon/Icon';

// ActionBar の比較（軸 651〜654）で共有する見本

/** 開いた面（⋮ のメニュー）を出したまま、ページをスクロールして見比べられるようにする */
export const scrollableDecorator = (Story: () => ReactNode) => (
  <>
    <style>{'html, body { overflow: auto !important; }'}</style>
    <Story />
  </>
);

/** 行を選ぶと帯が出る、操作できる見本 */
export function ListCell(props: SelectableListSceneProps) {
  return <SelectableListScene height={300} width="420px" {...props} />;
}

/** 帯を開いたまま置く、固定の見本（フォーカス・押せない操作を見る列） */
export function StaticCell({
  preview,
  icons = false,
  disabled = false,
  width = 420,
  style,
  barProps,
}: {
  preview?: string;
  icons?: boolean;
  disabled?: boolean;
  width?: number;
  style?: CSSProperties;
  barProps?: Partial<ActionBarProps>;
}) {
  return (
    <div data-preview={preview}>
      <div
        className="flex h-[120px] flex-col justify-end overflow-hidden rounded-card border border-line bg-bg"
        style={{ width, ...style }}
      >
        <ActionBar open label="2 件を選択中" onClear={() => {}} {...barProps}>
          <ActionBarButton icon={icons ? <Icon icon={CopyIcon} /> : undefined} disabled={disabled}>
            複製
          </ActionBarButton>
          <ActionBarButton icon={icons ? <Icon icon={TrashIcon} /> : undefined} status="danger">
            削除
          </ActionBarButton>
        </ActionBar>
      </div>
    </div>
  );
}

/** フォーカスの列で線を出すボタン（× のボタン） */
export const focusTarget =
  '[data-slot="action-bar"] [data-slot="toolbar-button"][aria-label="選択を外す"]';
