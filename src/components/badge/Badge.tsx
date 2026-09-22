import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { badgeSizeClass, type SmallPartsSize } from '../../internal/small-parts-size';
import { tv } from '../../internal/tv';

// Badge（数と小さな状態の点）— 後半の軸 39 で A 案（高さ 16px の濃い塗り、重ねるときは縁 2px）に決めた。値は design/tokens.css の --badge-* にある
// タグ（src/components/tag/Tag.tsx）とは別の、素の要素で作る部品。押せない
//   数: 高さ --badge-size の pill。1桁で丸になり、2桁以上は横に伸びる（左右の余白 --badge-pad-x）。max を超えると「99+」
//   点: 数を渡さないとき。直径 --badge-dot
// 大きさ（sm・md・lg・inherit）は Tag・Badge・Chip 共通の 1 本の軸 — ADR-0259（値は src/internal/small-parts-size.ts）。既定は sm
// 色は濃い塗りに白い文字。状態の色は塗りのお知らせ（filled）と同じ、グレーはトグルの ON と同じ濃いグレー。淡い面に濃い文字のタグと見分ける
//   警告の点だけは、白地の文字・アイコンと同じオリーブ（--color-fg-warning）。黄色の点は白地で 1.20:1 しかない（原則6）
//   警告の数の丸は、黄色に濃紺の文字のまま
// children を渡すと、その右上の角に重ねる。重ねるときだけ、置く面の色（--color-surface）の縁（--badge-ring-width）で相手と切り離す
//   Badge の中心を、相手の右上の角から --badge-overlay-inset だけ内側に置く（0 は角そのもの）
//   相手が丸い（overlap="circular"）ときは、角からの内側ではなく、Badge の中心を相手の円周上（右上 45°）に置く。既定（square）は今のまま
// 読み上げ: accessibleName を渡すと、見える数字は読ませず（aria-hidden）、代わりに見えない文字（sr-only）でその文を読ませる
//   sr-only は絶対配置なので、Badge 自身を位置の基準にする（重ねるときは absolute、置くだけのときは relative）
const badge = tv({
  base: 'inline-flex shrink-0 items-center justify-center rounded-pill font-bold whitespace-nowrap tabular-nums',
  variants: {
    color: {
      primary: 'bg-primary text-on-primary',
      secondary: 'bg-fg-secondary text-on-secondary',
      neutral: 'bg-neutral-strong text-on-neutral-strong',
      info: 'bg-info text-on-info',
      success: 'bg-success text-on-success',
      warning: 'bg-warning text-on-warning',
      danger: 'bg-danger text-on-danger',
    },
    shape: {
      count:
        'h-(--badge-size) min-w-(--badge-size) px-(--badge-pad-x) text-[length:var(--badge-font)] leading-(--badge-size)',
      dot: 'size-(--badge-dot)',
    },
    overlay: {
      true: 'pointer-events-none absolute top-(--badge-overlay-inset) right-(--badge-overlay-inset) translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_var(--badge-ring-width)_var(--color-surface)]',
      false: 'relative',
    },
    // 重ねる相手の形（overlay のときだけ効く）。circular は中心を円周上（右上 45°）に置く
    overlap: {
      square: {},
      circular: {},
    },
    size: badgeSizeClass,
  },
  compoundVariants: [
    { color: 'warning', shape: 'dot', class: 'bg-fg-warning' },
    // 45° の点は、辺の中心から (1 - cos45°) ≈ 0.292893 だけ内側（半分の 14.6447% を top・right に使う）
    { overlay: true, overlap: 'circular', class: 'top-[14.6447%] right-[14.6447%]' },
  ],
  defaultVariants: {
    color: 'neutral',
    shape: 'dot',
    overlay: false,
    overlap: 'square',
    size: 'sm',
  },
});

export interface BadgeProps extends Omit<ComponentProps<'span'>, 'color' | 'children'> {
  /**
   * 数。渡さないと、数のない点になります。0 以下のときは出しません（仮）
   */
  count?: number;
  /**
   * これを超える数は「99+」のように出します
   * @default 99
   */
  max?: number;
  /**
   * 色。primary・secondary・neutral は利用者が選ぶ色（原則6）で、指定しないときは既定のグレー（neutral）になります。
   * info・success・warning・danger は状態を表す色で、塗りのお知らせ（filled）と同じ値です。通知の件数は danger が慣例です。
   * warning の数の丸は黄色に濃紺の文字です。warning の点だけは、白地で見えるよう、白地の警告の文字やアイコンと同じオリーブ色になります
   * @default 'neutral'
   */
  color?: VariantProps<typeof badge>['color'];
  /**
   * 大きさ。sm は今までの高さ（丸 16px）、md は欄の中のチップと同じ段（丸 20px）、lg は部品の高さと同じ段（丸 24px）です。
   * inherit は段を持たず、周りの文字の大きさ（em）に従います。Tag・Badge・Chip で共通の軸です（ADR-0259）
   * @default 'sm'
   */
  size?: SmallPartsSize;
  /**
   * 読み上げの名前。画面には出ません。渡すと、見えている数字の代わりにこの文を読み上げます。
   * 文字の横やボタンの中に置いて、数字だけでは意味が伝わらないときに使います（例: accessibleName={(count) => `（未読 ${count} 件）`}）。
   * 関数を渡すと、数を受け取って文を返します。数は max で丸める前の値です。点（count なし）には文字列を渡します（関数は使いません）。
   * 渡さないときは、見えている数字（「3」「99+」）をそのまま読み、点は何も読みません。
   * 重ねるとき（children）は、Badge ではなく相手の名前に数を含めます
   */
  accessibleName?: string | ((count: number) => string);
  /**
   * 重ねる相手（アイコンのボタン、アバターなど）。渡すと、その右上の角に重ねます。
   * 重ねるときは Badge に aria-hidden="true" を付けて読ませず、相手の名前に数を含めます
   * （例: <Badge count={3} aria-hidden="true"><Button aria-label="通知（未読 3 件）">…</Button></Badge>）。
   * 数が点のときも、相手の名前に意味を含めます（例: aria-label="通知（未読あり）"）
   */
  children?: ReactNode;
  /**
   * 重ねる相手（children）の形。square（既定）は四角い相手向けで、角から内側に置きます。
   * circular は Avatar のような丸い相手向けで、Badge の中心を相手の円周上（右上 45°）に置きます
   * @default 'square'
   */
  overlap?: 'square' | 'circular';
  /** 数の丸・点に付きます */
  className?: string;
}

/**
 * 数と小さな状態の点を出します。文字のラベル（分類や「公開中」などの状態）には Tag を使います。
 *
 * - 数（通知の件数など）は count で渡します。点は count を渡さないときに出ます
 * - 点は色だけで意味を伝えないよう、隣に文字（「稼働中」など）を置くか、accessibleName で読み上げの文を付けます
 * - 重ねるとき（children）は、Badge を aria-hidden にして、相手の名前に数を含めます
 * - 文字の横やボタンの中に置くときは、accessibleName で数の意味を読み上げます
 */
export function Badge({
  count,
  max = 99,
  color,
  size,
  accessibleName,
  children,
  overlap = 'square',
  className,
  ...props
}: BadgeProps) {
  const overlay = children !== undefined && children !== null;
  const shown = count === undefined || count > 0;
  const text = count === undefined ? null : count > max ? `${max}+` : count;
  const spoken =
    typeof accessibleName === 'function'
      ? count === undefined
        ? undefined
        : accessibleName(count)
      : accessibleName;
  const mark = shown ? (
    <span
      className={badge({
        color,
        size,
        shape: count === undefined ? 'dot' : 'count',
        overlay,
        overlap,
        className,
      })}
      {...props}
    >
      {spoken === undefined ? (
        text
      ) : (
        <>
          {text !== null && <span aria-hidden="true">{text}</span>}
          <span className="sr-only">{spoken}</span>
        </>
      )}
    </span>
  ) : null;
  if (!overlay) return mark;
  return (
    <span className="relative inline-flex shrink-0">
      {children}
      {mark}
    </span>
  );
}
