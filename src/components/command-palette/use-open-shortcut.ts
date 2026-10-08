'use client';

import { useEffect, useRef } from 'react';

// 面を開くキーの組み合わせ（'mod+k' など）を、ページのどこで押しても受ける
//   mod は Mac では ⌘（meta）、ほかでは Ctrl。ほかに ctrl・meta・alt・shift を「+」でつなぐ。最後がキー（KeyboardEvent.key、大文字小文字は問わない）
//   打っている途中の欄の中でも受ける（⌘K はふつう文字を入れないため）。ほかの部品が先に止めたキー（defaultPrevented）は受けない

interface ParsedShortcut {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const isApple = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/** 'mod+k' を、押したキーと比べられる形にする */
export function parseShortcut(shortcut: string, apple = isApple()): ParsedShortcut {
  const parts = shortcut
    .toLowerCase()
    .split('+')
    .map((part) => part.trim());
  // 「+」そのものをキーにするとき（'mod++'）は、最後の空の 2 つを「+」に戻す
  const key = parts.at(-1) === '' && parts.length > 1 ? '+' : (parts.at(-1) ?? '');
  const mods = new Set(parts.slice(0, key === '+' ? -2 : -1));
  const mod = mods.has('mod');
  return {
    key,
    ctrl: mods.has('ctrl') || (mod && !apple),
    meta: mods.has('meta') || mods.has('cmd') || (mod && apple),
    alt: mods.has('alt') || mods.has('option'),
    shift: mods.has('shift'),
  };
}

/** 押したキーが組み合わせに当たるか */
export function matchesShortcut(event: KeyboardEvent, shortcut: ParsedShortcut) {
  return (
    event.key.toLowerCase() === shortcut.key &&
    event.ctrlKey === shortcut.ctrl &&
    event.metaKey === shortcut.meta &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift
  );
}

/**
 * キーの組み合わせを押したときに onPress を呼ぶ。shortcut が undefined のあいだは何も受けない
 */
export function useOpenShortcut(shortcut: string | undefined, onPress: () => void) {
  // 呼ぶ関数は描くたびに変わるので、受ける処理は付け直さず、いまの関数を読む
  const onPressRef = useRef(onPress);
  useEffect(() => {
    onPressRef.current = onPress;
  });
  useEffect(() => {
    if (!shortcut) return undefined;
    const parsed = parseShortcut(shortcut);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || !matchesShortcut(event, parsed)) return;
      // ブラウザの既定の動き（⌘K のアドレスバーなど）を止める
      event.preventDefault();
      onPressRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut]);
}
