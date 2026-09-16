import { type ComponentProps, useMemo, useState } from 'react';

import { NoticeRegionContext } from './notice-region-context';

// お知らせの領域（live region）
// あとから出すお知らせは、読み上げの箱（role="status"・"alert"）が先に DOM にあり、中身だけが入ると多くの読み上げソフトで知らせる。
// 箱ごと足すと、読まれない組み合わせがある。そこで、空の箱を最初から置いておき、中のお知らせ（Notice）は箱の中身として描く
// （Base UI の Toast の Viewport も、先に置いた aria-live の箱の中にトーストを描く）
// - 箱は2つ。危険は alert（割り込む）、ほかは status（区切りを待つ）— design/adr/0043
// - 中のお知らせは自分では role の箱を出さない（二重に読まない）
// - aria-atomic は false。2つ目のお知らせが入ったとき、1つ目を読み直さず、足したものだけを読む（Base UI の Viewport と同じ）
// - 空の箱は隠さない（display: none にすると箱が読み上げの木から消え、先に置いた意味がなくなる）。高さ 0 で並べる
// 並び: 危険の箱が上。お知らせどうしの間は 8px。空の箱の分の間はあけない
const boxClass = 'flex flex-col gap-2';

export interface NoticeRegionProps extends Omit<ComponentProps<'div'>, 'role'> {}

/**
 * あとから出すお知らせ（Notice）を入れる領域
 *
 * 最初から空の読み上げの箱（危険のための role="alert" と、ほかのための role="status"）を置いておき、
 * 中に入れたお知らせを、その箱の中身として描きます。箱が先にあるので、あとから出したお知らせを多くの読み上げソフトで確実に知らせます。
 *
 * - 送信の結果やエラーのように、操作のあとで出すお知らせは、この領域の中に入れます。領域はページを開いたときから置いておき、
 *   お知らせだけを出し入れします（`{saved && <Notice …/>}`）
 * - ページを開いたときからあるお知らせは、領域に入れず、そのまま置きます（お知らせが自分で role の箱を出します）
 * - 中のお知らせは、危険（`danger`）は alert の箱、ほかは status の箱に描かれます。危険の箱が上に来ます
 * - 子には Notice を直接置きます。`live={false}` の Notice は箱に入らず、領域の中にそのまま描かれます
 */
export function NoticeRegion({ children, className, ...props }: NoticeRegionProps) {
  const [alert, setAlert] = useState<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<HTMLDivElement | null>(null);
  const boxes = useMemo(() => ({ alert, status }), [alert, status]);
  return (
    <div
      data-slot="notice-region"
      {...props}
      className={[
        // 中身のある箱どうし（と領域にそのまま描いたもの）の間だけをあける
        'flex flex-col [&>:not(:empty)~:not(:empty)]:mt-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div ref={setAlert} role="alert" aria-atomic={false} className={boxClass} />
      <div ref={setStatus} role="status" aria-atomic={false} className={boxClass} />
      <NoticeRegionContext.Provider value={boxes}>{children}</NoticeRegionContext.Provider>
    </div>
  );
}
