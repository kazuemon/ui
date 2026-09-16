import {
  Children,
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

// リンク（Link と、Button の render）で共有する小物 — design/adr/0046

/** 渡された要素（render）が、新しいタブで開くか */
export function opensNewTab(render: ReactElement | undefined) {
  const props: unknown = render?.props;
  return (
    typeof props === 'object' && props !== null && 'target' in props && props.target === '_blank'
  );
}

const NEW_TAB_TEXT = '（新しいタブで開きます）';

/**
 * 新しいタブで開くことを、読み上げだけに足す文（画面には出さない）
 * sr-only は絶対配置なので、位置の基準（relative）を持つ要素の中に置く
 * id は、名前を aria-labelledby で付けたリンクが、並びの後ろにこの文を足すときに使う（newTabNaming）
 */
export const NewTabNote = ({ id }: { id?: string }) =>
  createElement('span', { id, className: 'sr-only' }, NEW_TAB_TEXT);

// ── 渡された要素（render）の props ────────────────
// Base UI の useRender は、部品の props の上に渡された要素の props を重ねる（同じ属性は要素の側が勝つ）
// 部品で決めた値（名前・説明）は、要素の側にも同じ属性があれば、要素の側でも書き換える

/** 渡された要素（render）の props の値 */
export function renderPropOf(render: ReactElement | undefined, key: string): unknown {
  const props: unknown = render?.props;
  return typeof props === 'object' && props !== null ? Reflect.get(props, key) : undefined;
}

/** 部品で決めた値のうち、渡された要素（render）にもある属性を、要素の側で書き換える */
export function withRenderOverrides(
  render: ReactElement | undefined,
  overrides: Record<string, unknown>
): ReactElement | undefined {
  const keys = Object.keys(overrides).filter((key) => renderPropOf(render, key) !== undefined);
  if (!render || !keys.length) return render;
  return cloneElement(render, Object.fromEntries(keys.map((key) => [key, overrides[key]])));
}

const nonEmpty = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : undefined;

/**
 * 新しいタブで開くリンクの名前と、読み上げだけに足す文
 * 名前を付けていないとき: 中の文（NewTabNote）が、そのまま名前に入る
 * 名前を aria-label・aria-labelledby で付けたとき: 中の文は名前に入らないので、名前そのものに足す
 *   aria-labelledby: 並びの後ろに、中の文の id を足す（中の文には id を付ける）
 *   aria-label: 名前の後ろに「（新しいタブで開きます）」を足す。中の文は置かない（名前には入らず、二重に読まれうるため）
 *   両方あるときは aria-labelledby が名前になるので、そちらに足す
 * 名前は、部品の props と渡された要素（render）の props の両方から読む（要素の側が勝つ）
 */
export function newTabNaming(
  own: { 'aria-label'?: string; 'aria-labelledby'?: string },
  render: ReactElement | undefined,
  noteId: string
): { props: Record<string, string>; note: ReactElement | null } {
  const read = (key: 'aria-label' | 'aria-labelledby') =>
    nonEmpty(renderPropOf(render, key) ?? own[key]);
  const labelledBy = read('aria-labelledby');
  if (labelledBy)
    return {
      props: { 'aria-labelledby': `${labelledBy} ${noteId}` },
      note: createElement(NewTabNote, { id: noteId }),
    };
  const label = read('aria-label');
  if (label) return { props: { 'aria-label': `${label}${NEW_TAB_TEXT}` }, note: null };
  return { props: {}, note: createElement(NewTabNote) };
}

/**
 * 子を平らな並びにする。Fragment（<>…</>）は開いて、その中の子を並びに入れる
 * children を1つの Fragment にまとめて渡されても、最初・最後のアイコンを見分けられるようにする
 * key は Fragment の key を前に付けて、並びの中で重ならないようにする
 */
export function flattenChildren(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      return flattenChildren(child.props.children, `${prefix}${String(child.key)}/`);
    }
    return prefix && isValidElement(child)
      ? [cloneElement(child, { key: `${prefix}${String(child.key)}` })]
      : [child];
  });
}

/** 最後の子が、type の要素か（利用者が同じアイコンを置いたかを見る） */
export function endsWithElement(children: ReactNode, type: unknown) {
  const last = flattenChildren(children).at(-1);
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
  const items = flattenChildren(children);
  const last = items.at(-1);
  if (items.length < 2 || !isValidElement(last)) return { lead: items, trailing: null };
  return { lead: items.slice(0, -1), trailing: last };
}

/**
 * 最後のアイコンを除いた子（splitTrailing の lead）を、最初の要素（前のアイコン）と、文字などに分ける
 * 最初が文字のときと、1つだけのときは分けない（icon は null）
 */
export function splitLeading(lead: ReactNode[]): {
  icon: ReactElement | null;
  label: ReactNode[];
} {
  const first = lead[0];
  if (lead.length < 2 || !isValidElement(first)) return { icon: null, label: lead };
  return { icon: first, label: lead.slice(1) };
}

// ── 押せないリンク（disabled — design/adr/0046）────────────────
// href を外した <a>。Tab では止まらず、押しても何もしない。見た目の切り替えは data-disabled で書く（<a> は :disabled にならない）
// 読み上げは、見た目に合わせて分ける
//   枠線のリンク・ボタンの見た目のリンク: role="link" aria-disabled="true"。「リンク、利用不可」と読まれる
//   文字のリンク: role・aria-disabled を付けない。href のない <a> は HTML-AAM では generic になり、リンクと読まれず、ただの文字になる

/** 押せないリンク（枠線のリンク・ボタンの見た目のリンク）に付ける属性。読み上げでは「リンク、利用不可」 */
export const disabledLinkProps = {
  role: 'link',
  'aria-disabled': 'true',
  'data-disabled': '',
} as const;

/** 押せない文字のリンクに付ける属性。見た目の切り替えだけで、読み上げではただの文字 */
export const disabledTextLinkProps = {
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

/**
 * 使い方の誤りを、開発時だけ1回知らせる
 * 開発時かどうかは process.env.NODE_ENV で見る（React・Base UI と同じ）。使う側のバンドラーが本番では置き換えて消す
 * typeof process の確かめは付けない。付けると、process のないブラウザ向けの開発中にも警告が出なくなる
 */
export function warnOnce(message: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(message)) return;
  warned.add(message);
  console.warn(`@kazuemon/ui: ${message}`);
}
