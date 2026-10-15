// 木の型あたり（文字を打つと、その文字で始まる行へ移る）。Tree と TreeSelect の一覧、Cascader の段が使う

/** 型あたりの状態。text は打っている途中の語、time は最後に打った時刻 */
export interface Typeahead {
  text: string;
  time: number;
}

// 続けて打った文字を 1 語にまとめる時間。これより間が空いたら、打ち直しとみなす（木の標準のふるまい）
const TYPEAHEAD_RESET = 1000;

/** 行の文字。アイコンや印は読まず、文字の部分だけを見る */
function rowText(row: HTMLElement) {
  const label = row.querySelector<HTMLElement>('[data-slot="tree-label"]');
  return (label?.textContent ?? row.textContent ?? '').trim().toLowerCase();
}

/**
 * 型あたり（文字を打つと、その文字で始まる行へ移る）。木の標準のふるまい
 * 続けて打った文字は 1 語にまとめ、間が空いたら打ち直しとみなす
 * 同じ文字を続けて打ったときは、その文字で始まる行を順に送る
 * 見えている行（visibleRows）だけが相手なので、開いていない枝の中は当たらない
 * 要素でない行（Cascader の段の項目）を渡すときは、textOf で文字を渡す
 */
export function typeaheadTarget<Row = HTMLElement>(
  rows: Row[],
  index: number,
  key: string,
  state: Typeahead,
  /** 行の文字（小文字にしたもの）。書かないときは行の要素から読む */
  textOf: (row: Row) => string = rowText as unknown as (row: Row) => string
): Row | undefined {
  const now = Date.now();
  const char = key.toLowerCase();
  const fresh = now - state.time > TYPEAHEAD_RESET;
  state.text = fresh ? char : state.text + char;
  state.time = now;
  // 同じ文字を続けて打ったときは 1 文字として扱い、次の行へ送る。ほかは、いまの行から見て最初に当たる行へ
  const first = state.text.slice(0, 1);
  const repeated = state.text.length > 1 && state.text === first.repeat(state.text.length);
  const text = repeated ? first : state.text;
  const from = repeated || fresh || state.text.length === 1 ? index + 1 : index;
  for (let step = 0; step < rows.length; step += 1) {
    const row = rows[(from + step + rows.length) % rows.length];
    if (row !== undefined && textOf(row).startsWith(text)) return row;
  }
  return undefined;
}
