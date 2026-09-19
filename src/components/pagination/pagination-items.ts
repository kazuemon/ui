// ページ番号の並びを作る計算（DOM を読まない）
//   どのページにいても、項目の数（番号と省略の数）は同じにする。ページを送っても並びの幅が変わらず、
//   前へ・次へのボタンの位置が動かない（MUI の usePagination と同じ考え方）
//   項目の数は、ページ数が足りているとき 2 × boundaries + 2 × siblings + 3

/** 並びの 1 つ。数はページ番号、start-ellipsis・end-ellipsis は省略 */
export type PaginationSlot = number | 'start-ellipsis' | 'end-ellipsis';

const range = (start: number, end: number) =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * ページ番号の並びを返す
 * @param page いまのページ（1 から数える）
 * @param count ページの数
 * @param siblings いまのページの左右に出す番号の数
 * @param boundaries 両端に出す番号の数
 */
export function paginationSlots(
  page: number,
  count: number,
  siblings: number,
  boundaries: number
): PaginationSlot[] {
  if (count < 1) return [];
  const startPages = range(1, Math.min(boundaries, count));
  const endPages = range(Math.max(count - boundaries + 1, boundaries + 1), count);
  const siblingsStart = Math.max(
    Math.min(page - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblings, boundaries + siblings * 2 + 2),
    // 末尾の番号の 2 つ手前まで（末尾を出さないときは、最後のページの 1 つ手前まで）
    (endPages[0] ?? count + 1) - 2
  );
  return [
    ...startPages,
    // 省略するのが 1 ページだけのときは、「…」ではなくその番号を出す（幅は同じ）
    ...(siblingsStart > boundaries + 2
      ? (['start-ellipsis'] as const)
      : boundaries + 1 < count - boundaries
        ? [boundaries + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaries - 1
      ? (['end-ellipsis'] as const)
      : count - boundaries > boundaries
        ? [count - boundaries]
        : []),
    ...endPages,
  ];
}
