'use client';

import { createContext, type ReactNode, use, useCallback, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

// シートで入れ子のメニューを 1 枚のシートの中で開く形（Menu の submenuSheet="fit"・"fixed"）
//   入れ子のメニューを別の面（Base UI の入れ子の Popup）にせず、同じ面の中の「パネル」として描く
//   パネルは舞台（stage）の中に重ね、いまのパネルだけを流れの中に置く。ほかは左右の外に出して隠す
//   開くと、親のパネルが左へ抜け、子のパネルが右から入る。戻るとその逆
//   舞台の高さは、いまのパネルの高さを測って書き、その変化を動かす（シートの上端が伸び縮みする）
//   fixed（submenuSheet="fixed"）では、シートの高さを親のメニューの高さのまま変えない。
//     一覧の高さを親のパネルの高さに固定し、長い子は一覧の中でスクロール、短い子は下が空く。
//     舞台は親のパネルより低くしない（滑っている途中の親のパネルを切らないため）
//   隠したパネルは visibility: hidden にする。Base UI の矢印キーと文字の検索は見えない項目を飛ばすので、
//   項目は同じ一覧に登録したままでよい（入れ子の MenuSubmenu は、親のパネルの中にいたまま、子のパネルを舞台へ portal で描く）

export interface MenuSlideEntry {
  /** 入れ子のメニュー（MenuSubmenu）ごとの id */
  id: string;
  /** 開いたときの見出しの題 */
  title: ReactNode;
}

/** 開いたあとにフォーカスをどこへ置くか。first は最初の項目（キーボード）、panel はパネル（指・マウス） */
export type MenuSlideFocus = 'first' | 'panel';

const FIRST_ITEM = '[role^="menuitem"]:not([aria-disabled="true"])';
const byId = (attribute: string, id: string) => `[${attribute}="${CSS.escape(id)}"]`;

export interface MenuSlideState {
  /** 開いている入れ子のメニューの道筋（0 番目が 1 段目） */
  path: MenuSlideEntry[];
  /** 舞台。子のパネルはここへ portal で描く */
  stage: HTMLElement | null;
  setStage: (element: HTMLElement | null) => void;
  /** シートの高さを親のメニューの高さのまま変えないか */
  fixed: boolean;
  /** どこかの段に入れ子のメニュー（MenuSubmenu）があるか。fixed のつまみ・引いて高さを変える操作は、これがあるときだけ出す
   *（入れ子がなければ高さは変わらないので、原則11・ADR-0110 により、変えられないつまみは出さない） */
  hasSubmenu: boolean;
  /** MenuSubmenu が mount 時に呼ぶ。返す関数を unmount 時に呼んで登録を解く */
  registerSubmenu: () => () => void;
  /** いまのパネルの高さ（測るまでは null） */
  height: number | null;
  /** 親のメニューのパネルの高さ（測るまでは null） */
  rootHeight: number | null;
  /** パネルの高さを知らせる。current はいまのパネルか、root は親のメニューのパネルか */
  reportHeight: (height: number, current: boolean, root: boolean) => void;
  /** 動かすか（はじめから開いておく入れ子では、最初の形を動かさずに描く） */
  animated: boolean;
  /** depth 段目に entry を開く。focus は開いたあとのフォーカスの置き場 */
  open: (entry: MenuSlideEntry, depth: number, focus: MenuSlideFocus) => void;
  /** はじめから開いておく入れ子を、動かさずに道筋へ入れる */
  openInitially: (entry: MenuSlideEntry, depth: number) => void;
  /** 1 段戻る。フォーカスは親のパネルの入れ子の項目へ */
  back: () => void;
}

export function useMenuSlideState(fixed: boolean): MenuSlideState {
  // 道筋は段ごとに置く。はじめから開いておく入れ子は、子から先に書き込まれることがあるので、穴を許して読むときに切る
  const [slots, setSlots] = useState<(MenuSlideEntry | undefined)[]>([]);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [rootHeight, setRootHeight] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  // 入れ子のメニュー（MenuSubmenu）がいくつ登録しているか。深さによらず、この舞台を共有する木の中で数える
  const [submenuCount, setSubmenuCount] = useState(0);
  const registerSubmenu = useCallback(() => {
    setSubmenuCount((current) => current + 1);
    return () => setSubmenuCount((current) => current - 1);
  }, []);
  const path = useMemo(() => {
    const out: MenuSlideEntry[] = [];
    for (const entry of slots) {
      if (!entry) break;
      out.push(entry);
    }
    return out;
  }, [slots]);
  // 段を替えたら、一覧のスクロールを先頭に戻し、フォーカスを移す。描き替えを待ってから（flushSync）、
  // Base UI が押した項目へフォーカスを戻す処理（次の描画の前）のあとに移す
  //   開いたとき: キーボードでは子のパネルの最初の項目、指・マウスでは子のパネル（項目を塗らない）
  //   戻ったとき: 親のパネルの、いま閉じた入れ子の項目（Base UI の選択もその項目に移る）
  const focusIn = useCallback(
    (target: HTMLElement | null | undefined) => {
      requestAnimationFrame(() => {
        if (!target) return;
        // ページは動かさず、一覧の中だけで見える位置に出す
        target.focus({ preventScroll: true });
        const list = stage?.parentElement;
        if (!list) return;
        const rect = target.getBoundingClientRect();
        const view = list.getBoundingClientRect();
        if (rect.bottom > view.bottom) list.scrollBy({ top: rect.bottom - view.bottom });
        else if (rect.top < view.top) list.scrollBy({ top: rect.top - view.top });
      });
    },
    [stage]
  );
  const open = useCallback(
    (entry: MenuSlideEntry, depth: number, focus: MenuSlideFocus) => {
      flushSync(() => {
        setAnimated(true);
        setSlots((current) => [...current.slice(0, depth - 1), entry]);
      });
      stage?.parentElement?.scrollTo({ top: 0 });
      const panel = stage?.querySelector<HTMLElement>(byId('data-panel-id', entry.id));
      focusIn(focus === 'first' ? panel?.querySelector<HTMLElement>(FIRST_ITEM) : panel);
    },
    [stage, focusIn]
  );
  const openInitially = useCallback((entry: MenuSlideEntry, depth: number) => {
    setSlots((current) => {
      const next = [...current];
      next[depth - 1] = entry;
      return next;
    });
  }, []);
  const back = useCallback(() => {
    const top = path.at(-1);
    if (!top) return;
    flushSync(() => {
      setAnimated(true);
      setSlots(path.slice(0, -1));
    });
    stage?.parentElement?.scrollTo({ top: 0 });
    const trigger = stage?.querySelector<HTMLElement>(byId('data-submenu-id', top.id));
    focusIn(trigger);
  }, [path, stage, focusIn]);
  const reportHeight = useCallback((next: number, current: boolean, root: boolean) => {
    if (current) setHeight(next);
    if (root) setRootHeight(next);
  }, []);
  return {
    path,
    stage,
    setStage,
    fixed,
    hasSubmenu: submenuCount > 0,
    registerSubmenu,
    height,
    rootHeight,
    reportHeight,
    animated,
    open,
    openInitially,
    back,
  };
}

// パネルの中の値。depth はそのパネルの段（0 は親のメニュー）
export interface MenuSlideContextValue extends MenuSlideState {
  depth: number;
}

export const MenuSlideContext = createContext<MenuSlideContextValue | null>(null);

export const useMenuSlide = () => use(MenuSlideContext);
