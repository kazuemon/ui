import {
  cloneElement,
  type ComponentProps,
  createElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { NewTabNote } from '../../internal/link-parts';
import { leadingAvatarClass, leadingIcon } from '../../internal/small-parts-leading';
import { type SmallPartsSize, tagSizeClass } from '../../internal/small-parts-size';
import { tv } from '../../internal/tv';

// タグ（分類や「公開中」などの状態を表す文字のラベル）。原則5: 小物は pill
// 数と小さな状態の点は Badge、消せる小物は Chip として分ける
// 淡い面に、同じ色相の濃い文字を載せる（design/adr/0007 の塗り方）。色は利用者が選ぶ（原則6）
// 指定しないときはグレー（neutral）— design/adr/0028
// 状態を表す色（info・success・warning・danger）は、利用者が選ぶ色とは別。お知らせの soft と同じ面と文字
//   warning — design/adr/0038。info・success・danger — design/adr/0043（info は primary と同じ値）
// 大きさ（sm・md・lg・inherit）は Tag・Badge・Chip 共通の 1 本の軸 — ADR-0259（値は src/internal/small-parts-size.ts）
// 形（variant）— 軸 418: soft（淡い面。既定）・outline（面なし・文字の色を薄めた縁）・surface（白い面・文字の色の縁）・
//   solid（濃い塗り）・dashed（面なし・破線の縁。「まだない」の印）
//   outline は Button の outline と同じく面を塗らない。白い面を敷く形は SegmentedControl のつまみと同じ surface と呼ぶ
//   色ごとに面・文字・濃い塗りを --tag-color-* に置き、variant がそれを --tag-bg・--tag-fg・縁へ振り分ける
//   縁はどの形でも同じ幅で引き（塗りの形では透明）、左右の余白から縁の幅を引く。形を変えても寸法は変わらない
// リンク（href・render・link）— 軸 417 の D: ブログのタグから一覧のページへ移る
//   平らな押すもの（原則3）: hover で文字の色を淡く敷いて下線を出し、押すと濃く敷いて沈む。影は付けない（この大きさでは影で押せると読めない）
//   敷く色は面の上に重ねる層（background-image）なので、どの形・色にも効く
//   link の既定は href があるか（link ?? href != null）。Link など、ほかのリンクの部品と同じ決まり
//   Tag はサーバーのまま描けるよう、フックを使わない（render は cloneElement で重ねる）
// 先頭のアイコン・アバター（icon・avatar）— 軸 419・420。置き方は src/internal/small-parts-leading.ts（Chip と共有）
//   アイコンは文字と同じ大きさで、色は既定で文字の色。iconColor で color と同じ色から選べる（solid では文字の色のまま）
const tag = tv({
  base: [
    'relative inline-flex items-center rounded-pill font-bold whitespace-nowrap no-underline',
    // 大きさは size 変化が --tag-*（src/internal/small-parts-size.ts）を差し替える
    'h-[var(--tag-height)]',
    'px-[calc(var(--tag-pad-x)_-_var(--tag-border-width))]',
    'text-[length:var(--tag-font)]',
    'leading-[var(--tag-leading)]',
    // 面・文字・縁は variant が --tag-bg・--tag-fg・--tag-border-* を決める
    'bg-(color:--tag-bg) text-(color:--tag-fg) [--small-parts-host-height:var(--tag-height)]',
    '[border:var(--tag-border-width)_var(--tag-border-style)_var(--tag-border-color)]',
    // 先頭のアバターは、左の余白をアバターの周りの余白（--small-parts-avatar-inset）にする
    'has-data-[slot=tag-avatar]:pl-[max(0px,calc(var(--small-parts-avatar-inset)_-_var(--tag-border-width)))]',
  ],
  variants: {
    variant: {
      soft: '[--tag-bg:var(--tag-color-subtle)] [--tag-border-color:transparent] [--tag-border-style:solid] [--tag-fg:var(--tag-color-on-subtle)]',
      outline:
        '[--tag-bg:transparent] [--tag-border-color:color-mix(in_oklab,currentColor_var(--tag-outline-border-mix),transparent)] [--tag-border-style:solid] [--tag-fg:var(--tag-color-on-subtle)]',
      surface:
        '[--tag-bg:var(--color-surface)] [--tag-border-color:currentColor] [--tag-border-style:solid] [--tag-fg:var(--tag-color-on-subtle)]',
      solid:
        '[--tag-bg:var(--tag-color-strong)] [--tag-border-color:transparent] [--tag-border-style:solid] [--tag-fg:var(--tag-color-on-strong)]',
      dashed:
        '[--tag-bg:transparent] [--tag-border-color:color-mix(in_oklab,currentColor_var(--tag-dashed-border-mix),transparent)] [--tag-border-style:dashed] [--tag-fg:var(--tag-color-on-subtle)]',
    },
    color: {
      primary:
        '[--color-own-focus:var(--color-primary)] [--tag-color-on-strong:var(--color-on-primary)] [--tag-color-on-subtle:var(--color-on-primary-subtle)] [--tag-color-strong:var(--color-primary)] [--tag-color-subtle:var(--color-primary-subtle)]',
      secondary:
        '[--color-own-focus:var(--color-fg-secondary)] [--tag-color-on-strong:var(--color-on-secondary)] [--tag-color-on-subtle:var(--color-on-secondary-subtle)] [--tag-color-strong:var(--color-fg-secondary)] [--tag-color-subtle:var(--color-secondary-subtle)]',
      neutral:
        '[--tag-color-on-strong:var(--color-on-neutral-strong)] [--tag-color-on-subtle:var(--color-fg-muted)] [--tag-color-strong:var(--color-neutral-strong)] [--tag-color-subtle:var(--color-neutral)]',
      info: '[--tag-color-on-strong:var(--color-on-info)] [--tag-color-on-subtle:var(--color-fg-info)] [--tag-color-strong:var(--color-info)] [--tag-color-subtle:var(--color-info-subtle)]',
      success:
        '[--tag-color-on-strong:var(--color-on-success)] [--tag-color-on-subtle:var(--color-fg-success)] [--tag-color-strong:var(--color-success)] [--tag-color-subtle:var(--color-success-subtle)]',
      warning:
        '[--tag-color-on-strong:var(--color-on-warning)] [--tag-color-on-subtle:var(--color-fg-warning)] [--tag-color-strong:var(--color-warning)] [--tag-color-subtle:var(--color-warning-subtle)]',
      danger:
        '[--tag-color-on-strong:var(--color-on-danger)] [--tag-color-on-subtle:var(--color-fg-danger)] [--tag-color-strong:var(--color-danger)] [--tag-color-subtle:var(--color-danger-subtle)]',
    },
    size: tagSizeClass,
    link: {
      true: [
        'top-0 cursor-pointer',
        ...focusRing,
        // 押せるときの手応え: 面の上に文字の色を敷く層・下線・沈み（平らな押すものと同じ濃さと深さ）
        '[background-image:linear-gradient(var(--tag-link-overlay),var(--tag-link-overlay))] [--tag-link-overlay:transparent]',
        'hover:[--tag-link-overlay:color-mix(in_oklab,currentColor_var(--flat-hover-mix),transparent)]',
        'hover:underline hover:[text-underline-offset:0.2em]',
        'active:[--tag-link-overlay:color-mix(in_oklab,currentColor_var(--flat-press-mix),transparent)]',
        'active:top-(--flat-press-depth)',
        '[transition:background-image_var(--duration-press)_var(--ease-press),top_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
        'motion-reduce:[transition:none]',
      ],
      false: '',
    },
  },
  defaultVariants: { variant: 'soft', color: 'neutral', size: 'sm', link: false },
});

export type TagVariant = 'soft' | 'outline' | 'surface' | 'solid' | 'dashed';
/** タグの色。primary・secondary・neutral は利用者が選ぶ色、info・success・warning・danger は状態を表す色 */
export type TagColor = NonNullable<VariantProps<typeof tag>['color']>;

export interface TagProps
  extends Omit<ComponentProps<'span'>, 'color'>, Omit<VariantProps<typeof tag>, 'link'> {
  /**
   * 形。soft は淡い面に濃い文字、outline は面を塗らず文字の色を薄めた縁、surface は白い面に文字の色の縁、
   * solid は濃い塗りに白い文字、dashed は面を塗らない破線の縁で「まだない」もの（準備中・予定）を表します。
   * surface はグレーの地の上でも白く抜けて、輪郭がはっきりします
   * @default 'soft'
   */
  variant?: TagVariant;
  /**
   * 色。primary・secondary・neutral は利用者が選ぶ色（原則6）で、指定しないときは既定のグレー（neutral）になります。
   * info・success・warning・danger は状態を表す色で、淡い面のお知らせ（soft）の面と題と同じ値です（design/adr/0038・0043）
   * @default 'neutral'
   */
  color?: TagColor;
  /**
   * 大きさ。sm は今までの高さ（20px）、md は欄の中のチップと同じ高さ、lg は部品の高さと同じです。
   * inherit は段を持たず、周りの文字の大きさ（em）に従います。Tag・Badge・Chip で共通の軸です（ADR-0259）
   * @default 'sm'
   */
  size?: SmallPartsSize;
  /** 渡すと、タグがリンク（a）になります。記事のタグから、そのタグの一覧のページへ移るときに使います */
  href?: string;
  /** href か render と一緒に渡すと、リンクの開き方になります（'_blank' で新しいタブ） */
  target?: string;
  /**
   * href か render と一緒に渡すリンクの rel
   * @default target が '_blank' なら 'noopener noreferrer'
   */
  rel?: string;
  /**
   * 描く要素。Next.js の Link などを渡すと、その要素にタグの見た目を重ねます（例: `render={<NextLink href="/tags/design" />}`）。
   * リンクの見た目にするときは `link` も渡します。className は Tag に書きます
   */
  render?: ReactElement;
  /**
   * リンクとして描くか。押せるときの手応え（hover・押下・フォーカスの線）が付きます。
   * href を渡すと既定で true です。render にルーターのリンクを渡すときは、部品からはリンクか分からないので書きます
   * @default href != null
   */
  link?: boolean;
  /** 文字の前に置くアイコン（`<Icon icon={HashIcon} />` など）。大きさは文字と同じで、タグが決めます */
  icon?: ReactNode;
  /**
   * 先頭のアイコンの色。color と同じ色から選びます（その色のタグの文字と同じ色）。書かないと、タグの文字と同じ色です。
   * solid では文字の色のままです
   */
  iconColor?: TagColor;
  /** 文字の前に置くアバター（`<Avatar src="…" name="…" />`）。大きさはタグの高さから決めます */
  avatar?: ReactNode;
  /** タグの文字（分類や「公開中」などの状態） */
  children?: ReactNode;
  /** タグ（span。リンクのときは a か render の要素）に付きます */
  className?: string;
}

/**
 * タグ
 */
export function Tag({
  variant,
  color,
  size,
  href,
  target,
  rel,
  render,
  link,
  icon,
  iconColor,
  avatar,
  className,
  children,
  ...props
}: TagProps) {
  const isLink = link ?? href != null;
  // 開き方（target・rel）は、a か render の要素（ルーターのリンク）に渡す。書いていない属性は渡さない（render の側の値を消さない）
  const anchor = href != null || render != null;
  const newTab = anchor && target === '_blank';
  const linkRel = newTab ? (rel ?? 'noopener noreferrer') : rel;
  const own = {
    ...props,
    ...(href != null && { href }),
    ...(anchor && target != null && { target }),
    ...(anchor && linkRel != null && { rel: linkRel }),
    'data-slot': 'tag',
    'data-link': isLink || undefined,
    className: tag({ variant, color, size, link: isLink, className }),
    children: (
      <>
        {avatar != null && (
          <span data-slot="tag-avatar" className={leadingAvatarClass}>
            {avatar}
          </span>
        )}
        {icon != null && (
          <span
            data-slot="tag-icon"
            aria-hidden
            className={leadingIcon({ color: variant === 'solid' ? undefined : iconColor })}
          >
            {icon}
          </span>
        )}
        {children}
        {newTab && <NewTabNote />}
      </>
    ),
  };
  if (render) return cloneElement(render, own);
  return createElement(href != null ? 'a' : 'span', own);
}
