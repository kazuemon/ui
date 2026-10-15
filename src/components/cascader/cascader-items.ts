// Cascader の選択肢の木を読む計算（DOM を読まない）

/** Cascader の値の 1 段（選択肢の value）の型。文字か数 */
export type CascaderValueItem = string | number;

/**
 * Cascader の選択肢。`children` を持つものは次の段を開く親、持たないものは選ぶと決まる葉です
 * `Value` は値の型（文字か数）です
 */
export interface CascaderItem<Value extends CascaderValueItem = string> {
  /** 選択肢の値。同じ段の中で重ならないようにします（段が違えば同じ値でも構いません） */
  value: Value;
  /** 選択肢の文字。欄に出す文と、読み上げの名前にもなります */
  label: string;
  /** 次の段の選択肢。空の配列は、子のない親（選ぶものがない段）として扱います */
  children?: CascaderItem<Value>[];
  /**
   * 選べない選択肢にします。親を選べないときは、次の段も開きません
   * @default false
   */
  disabled?: boolean;
}

/** 親か（次の段を開くか） */
export const isParent = <Value extends CascaderValueItem>(item: CascaderItem<Value>) =>
  item.children !== undefined;

/**
 * 値の道筋（段ごとの value）から、段ごとの選択肢を返す。途中で見つからない段があれば、そこで切る
 */
export function itemsOnPath<Value extends CascaderValueItem>(
  items: CascaderItem<Value>[],
  path: readonly Value[]
): CascaderItem<Value>[] {
  const out: CascaderItem<Value>[] = [];
  let level: CascaderItem<Value>[] | undefined = items;
  for (const value of path) {
    const item: CascaderItem<Value> | undefined = level?.find((option) => option.value === value);
    if (!item) break;
    out.push(item);
    level = item.children;
  }
  return out;
}

/**
 * 開いている段の並び。1 段目はいつも出し、道筋の親ごとに、その子の段を足す
 * 押せない親と、子のない親（children が空）の先は出さない
 */
export function columnsOnPath<Value extends CascaderValueItem>(
  items: CascaderItem<Value>[],
  path: readonly Value[]
): CascaderItem<Value>[][] {
  const columns: CascaderItem<Value>[][] = [items];
  for (const item of itemsOnPath(items, path)) {
    if (!item.children || item.disabled) break;
    columns.push(item.children);
  }
  return columns;
}

/** 道筋がちょうど同じか */
export const samePath = <Value>(a: readonly Value[], b: readonly Value[]) =>
  a.length === b.length && a.every((value, i) => value === b[i]);
