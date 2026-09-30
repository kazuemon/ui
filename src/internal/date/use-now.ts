'use client';

import { useSyncExternalStore } from 'react';

// 相対の書き方（RelativeTime）の「今」。ブラウザでだけ読み、決まった間隔（既定 1 分）ごとに進める
// サーバーと hydration の最初の描画では null を返し、サーバーの HTML と同じ文字（ふつうの日付）を描く
// hydration のあとに React が今の時刻で描き直すので、食い違いの警告は出ない
// 間隔ごとに 1 つのタイマーを、同じ間隔の部品で共有する

export const DEFAULT_UPDATE_INTERVAL = 60_000;

interface Clock {
  current: number | null;
  timer: ReturnType<typeof setInterval> | undefined;
  listeners: Set<() => void>;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
}

const clocks = new Map<number, Clock>();

function clockFor(interval: number): Clock {
  const existing = clocks.get(interval);
  if (existing) return existing;
  const clock: Clock = {
    current: null,
    timer: undefined,
    listeners: new Set(),
    subscribe(listener) {
      clock.listeners.add(listener);
      if (clock.timer === undefined) {
        clock.current = Date.now();
        clock.timer = setInterval(() => {
          clock.current = Date.now();
          for (const l of clock.listeners) l();
        }, interval);
      }
      return () => {
        clock.listeners.delete(listener);
        if (clock.listeners.size === 0 && clock.timer !== undefined) {
          clearInterval(clock.timer);
          clock.timer = undefined;
        }
      };
    },
    getSnapshot() {
      clock.current ??= Date.now();
      return clock.current;
    },
  };
  clocks.set(interval, clock);
  return clock;
}

const getServerSnapshot = () => null;
const subscribeNone = () => () => {};
const getNone = () => null;

/**
 * enabled のときだけ、ブラウザの今の時刻（ミリ秒）を返し、interval（ミリ秒）ごとに進める。
 * サーバーと hydration の最初の描画では null
 */
export function useNow(
  enabled: boolean,
  interval: number = DEFAULT_UPDATE_INTERVAL
): number | null {
  const clock = enabled ? clockFor(interval) : null;
  return useSyncExternalStore(
    clock ? clock.subscribe : subscribeNone,
    clock ? clock.getSnapshot : getNone,
    getServerSnapshot
  );
}
