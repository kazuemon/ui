import { Children, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';

// リンク（Link と、Button の render）で共有する小物 — design/adr/0046

/** 渡された要素（render）が、新しいタブで開くか */
export function opensNewTab(render: ReactElement | undefined) {
  const props: unknown = render?.props;
  return (
    typeof props === 'object' && props !== null && 'target' in props && props.target === '_blank'
  );
}

/**
 * 新しいタブで開くことを、読み上げだけに足す文（画面には出さない）
 * sr-only は絶対配置なので、位置の基準（relative）を持つ要素の中に置く
 */
export const NewTabNote = () =>
  createElement('span', { className: 'sr-only' }, '（新しいタブで開きます）');

/** 最後の子が、type の要素か（利用者が同じアイコンを置いたかを見る） */
export function endsWithElement(children: ReactNode, type: unknown) {
  const last = Children.toArray(children).at(-1);
  return isValidElement(last) && last.type === type;
}

/**
 * 子を、最後の要素（アイコン）と、その前（文字など）に分ける
 * 最後が文字のときと、子が1つだけのときは分けない（trailing は null）
 */
export function splitTrailing(children: ReactNode): {
  lead: ReactNode[];
  trailing: ReactElement | null;
} {
  const items = Children.toArray(children);
  const last = items.at(-1);
  if (items.length < 2 || !isValidElement(last)) return { lead: items, trailing: null };
  return { lead: items.slice(0, -1), trailing: last };
}

// ── 押せないリンク（disabled — design/adr/0046）────────────────
// href を外した <a role="link" aria-disabled="true">。Tab では止まらず、押しても何もしない
// 読み上げでは「リンク、利用不可」。見た目の切り替えは data-disabled で書く（<a> は :disabled にならない）

/** 押せないリンクに付ける属性 */
export const disabledLinkProps = {
  role: 'link',
  'aria-disabled': 'true',
  'data-disabled': '',
} as const;

// 渡された要素（render）から残す属性。見た目と読み上げのものだけ
const KEPT_ATTRIBUTES = new Set(['id', 'className', 'style', 'title', 'lang', 'dir']);

/**
 * 押せないときに描く <a>。渡された要素（Next.js の Link など）は描かず、
 * その props から見た目と読み上げの属性（id・class・style・title・aria-*・data-* など）だけを移す。
 * href・target・onClick、ルーターの props（prefetch など）は捨てる
 */
export function disabledAnchor(render: ReactElement | undefined): ReactElement {
  const props: unknown = render?.props;
  const kept =
    typeof props === 'object' && props !== null
      ? Object.fromEntries(
          Object.entries(props).filter(
            ([key]) =>
              KEPT_ATTRIBUTES.has(key) || key.startsWith('aria-') || key.startsWith('data-')
          )
        )
      : {};
  return createElement('a', kept);
}

const NAVIGATION = new Set([
  'href',
  'target',
  'rel',
  'download',
  'ping',
  'hrefLang',
  'referrerPolicy',
  'onClick',
]);

/** 部品に渡された props から、移る先と押したときの動き（href・target・onClick など）を外す */
export function withoutNavigation(props: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !NAVIGATION.has(key)));
}

const warned = new Set<string>();

/** 使い方の誤りを、開発時だけ1回知らせる */
export function warnOnce(message: string) {
  if (!import.meta.env?.DEV || warned.has(message)) return;
  warned.add(message);
  console.warn(`@kazuemon/ui: ${message}`);
}
