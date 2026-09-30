'use client';

import { useCallback, useSyncExternalStore } from 'react';

// 同じ groupId の CodeGroup どうしで、選んだタブの名前をそろえる
//   選んだ名前はページの中で共有し、端末（localStorage）にも覚える。次に開いたページでも同じタブから始まる
//   サーバーと、水和（hydration）の最初の描画では、覚えた名前を読まない（getServerSnapshot が null）。
//   描いたあとで覚えた名前に切り替えるので、サーバーの HTML とずれない
//   localStorage が使えないとき（プライベートの窓、保存を止めた設定）は、ページの中でだけそろえる

const STORAGE_PREFIX = 'kazuemon-ui:code-group:';

const values = new Map<string, string | null>();
const listeners = new Map<string, Set<() => void>>();

function read(groupId: string): string | null {
  if (values.has(groupId)) return values.get(groupId) ?? null;
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_PREFIX + groupId);
  } catch {
    // 読めないときは、覚えていないものとして扱う
  }
  values.set(groupId, stored);
  return stored;
}

function notify(groupId: string) {
  for (const listener of listeners.get(groupId) ?? []) listener();
}

function write(groupId: string, value: string) {
  values.set(groupId, value);
  try {
    window.localStorage.setItem(STORAGE_PREFIX + groupId, value);
  } catch {
    // 書けないときも、ページの中ではそろえる
  }
  notify(groupId);
}

// ほかのタブ（ブラウザの）で選んだときも追う
function onStorage(event: StorageEvent) {
  if (event.key === null) {
    for (const groupId of listeners.keys()) {
      values.delete(groupId);
      notify(groupId);
    }
    return;
  }
  if (!event.key.startsWith(STORAGE_PREFIX)) return;
  const groupId = event.key.slice(STORAGE_PREFIX.length);
  values.set(groupId, event.newValue);
  notify(groupId);
}

function subscribe(groupId: string, listener: () => void) {
  let set = listeners.get(groupId);
  if (!set) {
    set = new Set();
    listeners.set(groupId, set);
  }
  if (listeners.size === 1 && set.size === 0) window.addEventListener('storage', onStorage);
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(groupId);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

const none = () => null;

/**
 * groupId でそろえる、選んだタブの名前。groupId がないときは null を返し、書いても何もしない
 */
export function useCodeGroupSync(groupId: string | undefined) {
  const subscribeGroup = useCallback(
    (listener: () => void) => (groupId === undefined ? () => {} : subscribe(groupId, listener)),
    [groupId]
  );
  const getSnapshot = useCallback(() => (groupId === undefined ? null : read(groupId)), [groupId]);
  const shared = useSyncExternalStore(subscribeGroup, getSnapshot, none);
  const setShared = useCallback(
    (value: string) => {
      if (groupId !== undefined) write(groupId, value);
    },
    [groupId]
  );
  return [shared, setShared] as const;
}
