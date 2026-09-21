'use client';

import { useState } from 'react';

// 読み込みの知らせ（design/adr/0042、ADR-0055）。本体のそばにいつも置く、見えない status の箱の中身
//   開くと同時に DOM に入る箱は、読み上げソフトによっては読まれない。aria-busy も多くの読み上げソフトで読まれない。
//   そこで、閉じていても消えない箱を本体のそばに置き、中身だけを入れ替える
//   読み込んでいるあいだに開いた（開いているあいだに読み込みを始めた）: loadingText
//   開いたまま読み込みが終わった: loadedText（選択肢の数）。閉じたら空に戻す
// 見える読み込み中の行は role の箱にしない（二重に読まないため）
// Select・Combobox・Autocomplete が共有する

interface LoadingAnnouncement {
  open: boolean;
  loading: boolean;
  text: string;
}

interface LoadingAnnouncementOptions {
  open: boolean;
  /** 止めずに読み込んでいるあいだ（一覧の最後に行を出す側）。止めているあいだ（blocking）は知らせない */
  loadingRow: boolean;
  loadingText: string;
  loadedText: (count: number) => string;
  /** 読み込みが終わったときの選択肢の数 */
  count: number;
}

/** いま status の箱に出す文。開閉と読み込みの移り変わりだけで決まる */
export function useLoadingAnnouncement({
  open,
  loadingRow,
  loadingText,
  loadedText,
  count,
}: LoadingAnnouncementOptions) {
  const [announcement, setAnnouncement] = useState<LoadingAnnouncement>(() => ({
    open,
    loading: loadingRow,
    text: open && loadingRow ? loadingText : '',
  }));
  if (announcement.open !== open || announcement.loading !== loadingRow) {
    let { text } = announcement;
    if (!open) text = '';
    else if (loadingRow) text = loadingText;
    else if (announcement.open && announcement.loading) text = loadedText(count);
    setAnnouncement({ open, loading: loadingRow, text });
    return text;
  }
  return announcement.text;
}
