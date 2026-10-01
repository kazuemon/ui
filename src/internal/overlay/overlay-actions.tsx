'use client';

import { type ComponentProps, use, useEffect, useLayoutEffect } from 'react';

import { type OverlayActionsKind, OverlayActionsContext } from './overlay-actions-context';
import { warnOnce } from '../link-parts';
import { SheetMoreCue } from '../sheet/SheetMoreCue';
import { tv } from '../tv';

// 面の下の操作の帯の見た目。仕組みは overlay-actions-context.ts
const styles = tv({
  base: 'flex flex-wrap justify-end gap-2',
  variants: {
    kind: {
      // 中央の Dialog: 面の actions の帯と同じ余白（左右は中身の側、下は面の側が持つ）
      dialog: 'pt-(--dialog-padding)',
      // シート: 中身の下の端に貼り付ける。中身の左右の余白の外まで広げ、下は端末の安全領域の分を空ける
      sheet: [
        'sticky bottom-0 z-1 -mx-(--sheet-padding-x) bg-surface px-(--sheet-padding-x) pt-(--sheet-padding-x) pb-[max(var(--sheet-padding-x),env(safe-area-inset-bottom))]',
        "data-[layout='stack-reverse']:flex-col-reverse data-[layout=fill]:*:flex-1 data-[layout=stack]:flex-col",
      ],
      inspector: [
        'sticky bottom-0 z-1 -mx-(--sheet-padding-x) bg-surface p-(--sheet-padding-x)',
        "data-[layout='stack-reverse']:flex-col-reverse data-[layout=fill]:*:flex-1 data-[layout=stack]:flex-col",
      ],
    },
  },
});

const SLOTS: Record<OverlayActionsKind, string> = {
  dialog: 'dialog-footer',
  sheet: 'sheet-footer',
  inspector: 'inspector-footer',
};

export interface OverlayActionsProps extends ComponentProps<'div'> {
  /** 警告に出す部品の名前 */
  name: string;
}

/** 面の下の操作の帯。置いた場所（中身の中）に描き、見た目は面の actions の帯と同じにする */
export function OverlayActions({ name, className, children, ...props }: OverlayActionsProps) {
  const slot = use(OverlayActionsContext);
  const register = slot?.register;
  useLayoutEffect(() => register?.(), [register]);
  const actionsGiven = slot?.actionsGiven ?? false;
  useEffect(() => {
    if (!slot) {
      warnOnce(`${name} は Dialog・AlertDialog・Drawer・Inspector の中身に置きます`);
    } else if (actionsGiven) {
      warnOnce(
        `${name}: 面の actions と両方渡しています。下の操作は actions か ${name} のどちらか一方に書きます`
      );
    }
  }, [slot, actionsGiven, name]);
  if (!slot) {
    return (
      <div {...props} className={styles({ className })}>
        {children}
      </div>
    );
  }
  const sticky = slot.kind !== 'dialog';
  return (
    <div
      data-slot={SLOTS[slot.kind]}
      data-layout={sticky ? slot.layout : undefined}
      {...props}
      className={styles({ kind: slot.kind, className })}
    >
      {/* 続きの印は帯の上の端に付ける（中身が帯の下に隠れているあいだ出す） */}
      {sticky && (
        <SheetMoreCue
          edge="bottom"
          sheet
          sheetMoreCue="divider-always-shadow"
          divider="shadow"
          attached
        />
      )}
      {children}
    </div>
  );
}
