'use client';

import { createContext, useCallback, useMemo, useState } from 'react';

import type { OverlayActionsLayout } from '../sheet/SheetPopup';

/**
 * 面の下の操作を、中身のどこに置いても同じ帯に見せる仕組み（DialogActions・DrawerActions・InspectorActions・AlertDialogActions）
 * 面（中央の Dialog・シート・Inspector）が context で形と並べ方を配り、置かれた帯は面に知らせる（面は中身の下の余白と続きの印を帯に譲る）
 *   dialog: 中央に浮かべる Dialog。中身の流れの最後に置き、右に寄せる（中身の左右の余白は中身の側が持つ）
 *   sheet・inspector: 中身はスクロールする。帯を中身の下の端に貼り付け（sticky）、中身の左右の余白の外まで面を広げる
 *     続きの印（下の端の影と区切り線）は帯の上の端に付ける
 */
export type OverlayActionsKind = 'dialog' | 'sheet' | 'inspector';

interface OverlayActionsContextValue {
  kind: OverlayActionsKind;
  /** 並べ方。auto は面の側で解いてから渡す */
  layout: Exclude<OverlayActionsLayout, 'auto'>;
  /** 面の actions にも渡されているか（両方は開発時に警告） */
  actionsGiven: boolean;
  /** 帯が置かれたことを面に知らせる。外したときに呼ぶ関数を返す */
  register: () => () => void;
}

// null は「帯を置く面の外」。Popover のように帯を持たない面は null を配り直し、外の面に帯が写らないようにする
export const OverlayActionsContext = createContext<OverlayActionsContextValue | null>(null);

/** 面の側: 中身に置かれた帯の数を数え、配る値を作る */
export function useOverlayActionsSlot(
  kind: OverlayActionsKind,
  layout: Exclude<OverlayActionsLayout, 'auto'>,
  actionsGiven: boolean
) {
  const [count, setCount] = useState(0);
  const register = useCallback(() => {
    setCount((n) => n + 1);
    return () => setCount((n) => n - 1);
  }, []);
  const value = useMemo(
    () => ({ kind, layout, actionsGiven, register }),
    [kind, layout, actionsGiven, register]
  );
  return { placed: count > 0, value };
}
