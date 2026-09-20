import { createContext, use } from 'react';

import type { DensityScope } from '../../internal/density-scope';

/** 選んだ印（チェック・ラジオ）の色。primary・secondary は利用者が選ぶ色、neutral は色を持たない（原則6） */
export type MenuColor = 'primary' | 'secondary' | 'neutral';

/** チェックとラジオの印の場所。start は文字の前、end は右端 */
export type MenuMarkPlacement = 'start' | 'end';

/**
 * 1 つだけを選ぶ項目（ラジオ）の印
 *   radio: ラジオと同じ丸を小さく。どの項目にもグレーの丸を置き、選んだ丸は印の色に白い点
 *   dot: 選んだ項目にだけ小さな点
 *   check: 選んだ項目にだけチェック（チェックの項目と同じ印）
 */
export type MenuRadioMark = 'radio' | 'dot' | 'check';

/** グループの見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレー */
export type MenuGroupLabelStyle = 'label' | 'caption';

/**
 * シートで入れ子のメニューを開く形
 *   fixed: 1 枚のシートのまま、中身を右から滑り込ませる。高さは最初に開いたメニューの高さのまま変えず、
 *     上のつまみを引くと変えられる（Select のシートのつまみと同じ操作）。長い中身はシートの中でスクロールする
 *   fit: fixed と同じく滑り込ませるが、高さは中身に合わせて伸び縮みする（つまみは出さない）
 *   cover: 親のシートを覆う高さの、別のシートを下から重ねる
 */
export type MenuSubmenuSheet = 'fixed' | 'fit' | 'cover';

// Menu が中の項目と入れ子のメニュー（MenuSubmenu）に配る値
//   sheet: いま画面の下から出すシートで出しているか。入れ子のメニューも同じ出し方にする
//   container・densityScope: 入れ子のメニューの面も、同じ場所・同じ密度で描く
//   closeAll: 入れ子のシートの × から、メニューをすべて閉じる
export interface MenuContextValue {
  sheet: boolean;
  container: HTMLElement | null | undefined;
  densityScope: DensityScope;
  color: MenuColor;
  markPlacement: MenuMarkPlacement;
  radioMark: MenuRadioMark;
  /** 印を持たない項目にも、印の場所を空けて文字の左をそろえるか（Menu の alignMarks と、印を持つ項目の有無から決める） */
  reserveMarkSpace: boolean;
  groupLabelStyle: MenuGroupLabelStyle;
  submenuSheet: MenuSubmenuSheet;
  closeOnSwipe: boolean;
  closeLabel?: string;
  backLabel?: string;
  closeAll: () => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext() {
  const context = use(MenuContext);
  if (!context) throw new Error('Menu の項目は Menu の中に置きます');
  return context;
}

// 入れ子のメニューの面が、親の面（シートの高さ）を知るため。MenuSurface が中に配る
export const MenuParentSurface = createContext<HTMLElement | null>(null);
