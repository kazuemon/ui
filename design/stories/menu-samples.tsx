// Menu の比較（後半の軸 121〜124）で共有する見本。軸がすべて決まったら、比較のストーリーと一緒に消す
import { CopyIcon, DownloadSimpleIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { type CSSProperties, type ReactNode, useState } from 'react';

import { Button } from '../../src/components/button/Button';
import {
  Menu,
  type MenuColor,
  type MenuGroupLabelStyle,
  type MenuMarkPlacement,
  type MenuRadioMark,
} from '../../src/components/menu/Menu';
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from '../../src/components/menu/MenuItem';

/** hover・キーボードの選択と同じ塗りに固定する（項目の style に渡す） */
const highlighted: CSSProperties & Record<`--${string}`, string> = {
  '--menu-item-bg': 'var(--menu-item-highlight)',
};

/**
 * 比較の 1 マスに置く、開いたままのメニュー。面はマスの中に描く（行ごとのトークンの上書きが効くように）
 * 同じページで何枚も開いておくため、開閉を外から決め、ほかの操作を止めない
 */
export function MenuSample({
  children,
  height = 340,
  color,
  density,
  markPlacement,
  radioMark,
  groupLabelStyle,
  className,
}: {
  children: ReactNode;
  height?: number;
  color?: MenuColor;
  density?: 'fine' | 'coarse';
  markPlacement?: MenuMarkPlacement;
  radioMark?: MenuRadioMark;
  groupLabelStyle?: MenuGroupLabelStyle;
  /** マスに足すクラス。部品の props にない見た目（採らなかった案）を、中の要素へのクラスで描く */
  className?: string;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density={density}
      className={['relative w-[360px] [transform:translateZ(0)]', className]
        .filter(Boolean)
        .join(' ')}
      style={{ height }}
    >
      {frame && (
        <Menu
          trigger={<Button appearance="outline">開く</Button>}
          presentation="popover"
          modal={false}
          open
          // 画面の外に続くマスでも、反対側へ出さずに本体の下に置く（比べやすくするため）
          collisionAvoidance={{ side: 'none', align: 'none' }}
          color={color}
          markPlacement={markPlacement}
          radioMark={radioMark}
          groupLabelStyle={groupLabelStyle}
          container={frame}
          // 高さの上限は画面から測るので、画面の外に続くマスでは切れる。比べるときは外す
          className="max-h-none!"
        >
          {children}
        </Menu>
      )}
    </div>
  );
}

/** チェックの項目（1 つ目を入、2 つ目を切、3 つ目は押せない） */
export const CheckItems = ({ hover = false }: { hover?: boolean }) => (
  <MenuGroup label="表示">
    <MenuCheckboxItem defaultChecked style={hover ? highlighted : undefined}>
      行番号
    </MenuCheckboxItem>
    <MenuCheckboxItem>折り返し</MenuCheckboxItem>
    <MenuCheckboxItem defaultChecked disabled description="この形式では使えません">
      ミニマップ
    </MenuCheckboxItem>
  </MenuGroup>
);

/** ラジオの項目（1 つ目を選ぶ） */
export const RadioItems = ({ hover = false }: { hover?: boolean }) => (
  <MenuGroup label="並び順">
    <MenuRadioGroup defaultValue="updated">
      <MenuRadioItem value="updated" style={hover ? highlighted : undefined}>
        更新日
      </MenuRadioItem>
      <MenuRadioItem value="created">作成日</MenuRadioItem>
      <MenuRadioItem value="title">題名</MenuRadioItem>
    </MenuRadioGroup>
  </MenuGroup>
);

/** ショートカットのある項目。hover で 1 つ目を塗る */
export const ShortcutItems = ({ hover = false }: { hover?: boolean }) => (
  <>
    <MenuItem icon={<PencilSimpleIcon />} shortcut="Ctrl+E" style={hover ? highlighted : undefined}>
      編集
    </MenuItem>
    <MenuItem icon={<CopyIcon />} shortcut="Ctrl+D">
      複製
    </MenuItem>
    <MenuItem icon={<DownloadSimpleIcon />} shortcut="Ctrl+Shift+S">
      名前を付けて保存
    </MenuItem>
    <MenuItem icon={<DownloadSimpleIcon />} shortcut="Ctrl+P" disabled>
      印刷
    </MenuItem>
    <MenuSeparator />
    <MenuItem icon={<TrashIcon />} shortcut="Del" danger>
      削除
    </MenuItem>
  </>
);
