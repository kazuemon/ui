// width・height から枠の比を作るときに使う、数だけの値の判定。Image・Video が共有する（2 つ目の部品が使うので internal へ）

/** 数か、数だけの文字なら数を返す。それ以外（undefined・空文字・auto など）は undefined */
export function toMediaSize(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : undefined;
}
