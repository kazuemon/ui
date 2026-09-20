import { createContext } from 'react';

/** お知らせの領域（NoticeRegion）が先に置いた箱。中のお知らせは、自分の色の箱へ描かれる */
export interface NoticeRegionBoxes {
  /** 危険（danger）を入れる role="alert" の箱 */
  alert: HTMLElement | null;
  /** 情報・成功・警告を入れる role="status" の箱 */
  status: HTMLElement | null;
  /** 領域そのもの。× で閉じたあと、前にも後ろにもフォーカスできるものがないときの行き先（原則15） */
  root: HTMLElement | null;
}

/** 領域の外では null。お知らせは、自分で role の箱を出す */
export const NoticeRegionContext = createContext<NoticeRegionBoxes | null>(null);
