import { useState } from 'react';

import { Button } from '../../src/components/button/Button';
import {
  CommandPalette,
  type CommandPaletteProps,
} from '../../src/components/command-palette/CommandPalette';
import { sampleGroups } from '../../src/components/command-palette/command-palette-story-data';

// CommandPalette の比較（軸 590〜592）で共有する見本
//   PaletteFrame: 画面の代わりの枠（transform で位置の基準にする）の中に、開いたままの面を置く。
//     打って絞り込み、↑↓ と Enter も試せる。裏を止めず（modal={false}）、外を押しても Esc でも閉じない（並べて見比べるため）
//   OpenOnScreen: 押すと、行のトークンのまま画面いっぱいに開く（ふだんの使われ方。⌘K の代わり）

const common: Pick<CommandPaletteProps, 'accessibleName' | 'placeholder' | 'items' | 'emptyText'> =
  {
    accessibleName: 'コマンドを探す',
    placeholder: 'コマンドやページを探す',
    items: sampleGroups,
    emptyText: '当たるコマンドがありません',
  };

export function PaletteFrame({
  defaultValue,
  height = 'h-[520px]',
  showOpenButton = false,
}: {
  /** 下に「画面で開く」ボタンを置く（行のトークンのまま、画面いっぱいに開く） */
  showOpenButton?: boolean;
  /** はじめに打ってある文字 */
  defaultValue?: string;
  height?: string;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [last, setLast] = useState<string>();
  return (
    <div className="flex flex-col gap-2">
      <div
        ref={setFrame}
        data-density="fine"
        className={`relative ${height} w-[680px] [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
      >
        {/* 後ろを暗くした画面の代わり（裏を止めない面は自分では暗くしないため） */}
        <div className="absolute inset-0 bg-backdrop" />
        {frame && (
          <CommandPalette
            {...common}
            presentation="popover"
            defaultOpen
            defaultValue={defaultValue}
            modal={false}
            dismissible={false}
            closeOnEscape={false}
            autoFocus={false}
            portalContainer={frame}
            onSelect={(item, event) => {
              event.preventDefault();
              setLast(item.label);
            }}
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {showOpenButton && <OpenOnScreen />}
        <p className="text-xs text-fg-subtle">
          選んだ候補: {last ?? 'なし'}（並べた見本は閉じません）
        </p>
      </div>
    </div>
  );
}

export function OpenOnScreen() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className="flex items-center gap-2">
      {container && (
        <CommandPalette
          {...common}
          presentation="popover"
          portalContainer={container}
          trigger={
            <Button variant="outline" size="sm">
              画面で開く
            </Button>
          }
        />
      )}
    </div>
  );
}

/** 開いた面が裏のスクロールを止めても、比較のページは流せるようにする */
export const scrollableDecorator = (Story: () => React.ReactNode) => (
  <>
    <style>{'html, body { overflow: auto !important; }'}</style>
    <Story />
  </>
);
