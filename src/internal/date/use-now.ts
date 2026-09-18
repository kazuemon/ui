import { useSyncExternalStore } from 'react';

// 相対の書き方（RelativeTime）の「今」。ブラウザでだけ読み、1 分ごとに進める
// サーバーと hydration の最初の描画では null を返し、サーバーの HTML と同じ文字（ふつうの日付）を描く
// hydration のあとに React が今の時刻で描き直すので、食い違いの警告は出ない

const TICK = 60_000;

let current: number | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === undefined) {
    current = Date.now();
    timer = setInterval(() => {
      current = Date.now();
      for (const l of listeners) l();
    }, TICK);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  current ??= Date.now();
  return current;
}

const getServerSnapshot = () => null;
const subscribeNone = () => () => {};
const getNone = () => null;

/** enabled のときだけ、ブラウザの今の時刻（ミリ秒）を返す。サーバーと hydration の最初の描画では null */
export function useNow(enabled: boolean): number | null {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeNone,
    enabled ? getSnapshot : getNone,
    getServerSnapshot
  );
}
