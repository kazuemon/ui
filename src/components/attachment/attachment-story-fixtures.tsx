'use client';

// Attachment のストーリーと比較のストーリーで使う見本のファイルと、送る動きの見せかけ（部品ではない）
import { useCallback, useEffect, useRef, useState } from 'react';

const photoSvg = (sky: string, hill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${sky}"/><circle cx="84" cy="36" r="14" fill="#fff4cc"/><path d="M0 90 L40 56 L70 84 L120 60 L120 120 L0 120Z" fill="${hill}"/></svg>`;

/** 送ったあとの画像（url） */
export const savedPhotoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(photoSvg('#cfeafc', '#2f6b58'))}`;

/** いま選んだ画像（file）。描ける中身を持つ（送ったあとの savedPhotoUrl と同じ絵） */
export const photoFile = (name = 'summer-trip.svg') =>
  new File([photoSvg('#cfeafc', '#2f6b58')], name, { type: 'image/svg+xml' });

/** 画像でないファイル。中身は空で、大きさは Attachment の size で渡す */
export const docFile = (name = 'portfolio.pdf', type = 'application/pdf') =>
  new File([''], name, { type });

export type FakeStatus = 'idle' | 'uploading' | 'failed' | 'sent';

export interface FakeItem {
  id: number;
  file: File;
  /** 見せる大きさ（バイト）。書かないときは file の大きさ */
  size?: number;
  status: FakeStatus;
  progress: number;
  /** 送ると失敗する見本 */
  failOnce?: boolean;
}

/**
 * 送る動きの見せかけ。send で送り始め、少しずつ進み、終わると url を持つ（failOnce の項目は途中で一度失敗する）
 */
export function useFakeUpload(initial: () => Omit<FakeItem, 'status' | 'progress'>[]) {
  const [items, setItems] = useState<FakeItem[]>(() =>
    initial().map((item) => ({ ...item, status: 'idle', progress: 0 }))
  );
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);

  const tick = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((item): FakeItem => {
        if (item.status !== 'uploading') return item;
        const progress = Math.min(100, item.progress + 7 + (item.id % 3) * 4);
        if (item.failOnce && progress >= 55) {
          return { ...item, status: 'failed', progress, failOnce: false };
        }
        return progress >= 100 ? { ...item, status: 'sent', progress: 100 } : { ...item, progress };
      });
      if (!next.some((item) => item.status === 'uploading')) {
        window.clearInterval(timer.current);
        timer.current = undefined;
      }
      return next;
    });
  }, []);

  const start = useCallback(() => {
    if (timer.current === undefined) timer.current = window.setInterval(tick, 220);
  }, [tick]);

  const send = useCallback(() => {
    setItems((prev) =>
      prev.map((item) =>
        item.status === 'idle' || item.status === 'failed'
          ? { ...item, status: 'uploading', progress: item.status === 'failed' ? 0 : item.progress }
          : item
      )
    );
    start();
  }, [start]);

  const retry = useCallback(
    (id: number) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'uploading', progress: 0 } : item))
      );
      start();
    },
    [start]
  );

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    window.clearInterval(timer.current);
    timer.current = undefined;
    setItems(initial().map((item) => ({ ...item, status: 'idle', progress: 0 })));
    // initial は呼ぶたびに新しい File を作る見本の関数で、変わらない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, send, retry, remove, reset };
}

/** 見せかけの項目を Attachment の props にする */
export function fakeProps(item: FakeItem) {
  return {
    file: item.status === 'sent' ? undefined : item.file,
    name: item.file.name,
    size: item.size ?? item.file.size,
    type: item.file.type,
    url:
      item.status === 'sent'
        ? item.file.type.startsWith('image/')
          ? savedPhotoUrl
          : `#${item.file.name}`
        : undefined,
    progress: item.status === 'uploading' ? item.progress : undefined,
    errorText: item.status === 'failed' ? '送れませんでした' : undefined,
  };
}

/** いつもの 3 つ（画像・PDF・失敗する ZIP） */
export const sampleItems = () => [
  { id: 1, file: photoFile(), size: 38_000 },
  { id: 2, file: docFile(), size: 1_240_000 },
  {
    id: 3,
    file: docFile('2026-summer-trip-photos-all.zip', 'application/zip'),
    size: 48_200_000,
    failOnce: true,
  },
];
