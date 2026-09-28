import { choiceSize } from '../../internal/choice/choice-styles';
import { Skeleton } from '../skeleton/Skeleton';

// 読み込み中の行。行の形を先に置き、読み込んだら本物の行に差し替える（原則14: 場所取りは面を横切る光）
//   セルには文字の行の Skeleton を置くので、行の高さは本物の行と同じ。読み込んでも下の内容が跳ばない
//   光は画面を基準にして、行をまたいで 1 本が横切る（sweep-viewport）
//   帯の長さは列ごとに少し変え、同じ長さが格子に並ばないようにする
// 読み上げには、帯を出さず、最初のセルの読み上げにだけ届ける文で知らせる。表の aria-busy は DataTable の loading で付ける
const widths = ['w-[72%]', 'w-[48%]', 'w-[86%]', 'w-[60%]', 'w-[40%]'];

export interface DataTableLoadingProps {
  /** 表の列の数 */
  columns: number;
  /**
   * 置く行の数。1 ページに出す行の数にそろえると、読み込んだときに高さが変わりません
   * @default 5
   */
  rows?: number;
  /**
   * 最初の列を選択の列にします。帯の代わりに、選ぶ箱の大きさの面を置きます
   * @default false
   */
  showSelectColumn?: boolean;
  /**
   * 読み込み中であることを伝える文（読み上げ用）
   * @default '読み込んでいます'
   */
  loadingText?: string;
}

/** 読み込み中の行。本物の行と同じ高さの場所取りを、rows の数だけ並べます */
export function DataTableLoading({
  columns,
  rows = 5,
  showSelectColumn = false,
  loadingText = '読み込んでいます',
}: DataTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }, (_line, row) => (
        <tr key={row} data-slot="data-table-loading">
          {Array.from({ length: columns }, (_cell, column) => (
            <td key={column} className={showSelectColumn && column === 0 ? 'w-px' : undefined}>
              {row === 0 && column === 0 && <span className="sr-only">{loadingText}</span>}
              {showSelectColumn && column === 0 ? (
                <span className={`flex h-[1lh] items-center ${choiceSize}`}>
                  <Skeleton
                    animation="sweep-viewport"
                    className="size-(--choice-size) rounded-(--checkbox-radius)"
                  />
                </span>
              ) : (
                <Skeleton
                  variant="text"
                  animation="sweep-viewport"
                  className={widths[(column + row) % widths.length]}
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
