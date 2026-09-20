import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { HashIcon, LinkSimpleHorizontalIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

// 見出しに付くページ内リンク。見出し（Heading・Prose の h2 など）の中に置く。値は design/tokens.css の --heading-anchor-*
// 働きはリンク（原則18）。押せる範囲は印と、その周りの 4px だけ（文字のリンクと同じ。原則17）
// 印は文字の仲間（原則21）。大きさは見出しの文字に比例し、線は細い（文字と並ぶため）。色は控えめな灰色で、hover で Primary
// 見せ方（reveal）: hover は、見出しに hover したときと、キーボードでフォーカスしたときだけ現れる。隠しているあいだも Tab では止まる
//   指（--density-coarse が 1）では hover がないので、reveal にかかわらず、いつも見せる
//   always は、ふだんから見せる
// 位置（placement）: end は文字の後ろ（見出しの最後の子）。start は見出しの左の余白へ張り出す（見出しの最初の子）
//   張り出す分は余白がないと切れるので、左に余白がある読みものの中で使う
// 動き: 現れる・消えるは opacity を速く（原則14）。位置は動かさない。動きを減らす設定では、すぐに切り替える
// 読み上げ: 見出しの中に置くので、見出しの名前は「見出しの文字 + label」になる
// 縦の位置は Icon と同じ: 印の中心を、漢字の枠の中心（ベースラインから --icon-text-center の高さ）に置く
const headingAnchor = tv({
  base: [
    // Prose の中の a の見た目（下線・色・左右の張り出し）は、ここで置き直す
    'relative inline-flex cursor-pointer rounded-(--link-text-radius) px-1 py-0.5 text-(color:--heading-anchor-color) no-underline',
    'align-[calc(var(--icon-text-center)-var(--heading-anchor-icon-size)/2)]',
    // 印の大きさ。利用者が渡した svg にも同じ大きさをかける
    '[&_svg]:size-(--heading-anchor-icon-size) [&_svg]:shrink-0',
    '[opacity:max(var(--heading-anchor-rest-opacity),calc(var(--density-coarse)*var(--heading-anchor-touch-opacity)))]',
    'hover:text-(color:--heading-anchor-color-hover) focus-visible:text-(color:--heading-anchor-color-hover) focus-visible:opacity-100',
    // 見出しに hover したとき。見出しのどこでも現れる
    '[:is(h1,h2,h3,h4,h5,h6):hover_&]:opacity-100',
    'active:top-(--flat-press-depth)',
    '[transition:opacity_var(--heading-anchor-duration)_var(--ease-press),color_var(--duration-press)_var(--ease-press),top_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
    '[--color-own-focus:var(--color-primary)]',
    ...focusRing,
  ],
  variants: {
    reveal: {
      hover: '',
      always: '[--heading-anchor-rest-opacity:1]',
    },
    placement: {
      end: 'ml-(--heading-anchor-gap)',
      // 幅（印 + 左右の 4px）と間の分だけ左へ出し、文字の位置は動かさない
      start:
        'mr-(--heading-anchor-gap) ml-[calc(-1*(var(--heading-anchor-icon-size)+var(--spacing)*2+var(--heading-anchor-gap)))]',
    },
  },
  defaultVariants: { reveal: 'hover', placement: 'end' },
});

export interface HeadingAnchorProps
  extends Omit<ComponentProps<'a'>, 'children' | 'href'>, VariantProps<typeof headingAnchor> {
  /** 移る先。見出しの id を指します（例: `#usage`） */
  href: string;
  /**
   * 読み上げる名前。見出しの中に置くので、見出しの名前は「見出しの文字 + この文」になります。
   * 見出しの文字を含めない、短い文にします
   * @default 'このセクションへのリンク'
   */
  label?: string;
  /**
   * 現れ方。hover は、見出しに hover したときと、キーボードでフォーカスしたときだけ現れ、ふだんは見えません（Tab では止まります）。
   * always は、ふだんから見せます。指で操作しているときは、hover がないので、どちらでもいつも見えます
   * @default 'hover'
   */
  reveal?: VariantProps<typeof headingAnchor>['reveal'];
  /**
   * 置く場所。end は文字の後ろで、見出しの最後の子に置きます。start は見出しの左の余白へ張り出し、見出しの最初の子に置きます。
   * start は左の余白がないと切れます
   * @default 'end'
   */
  placement?: VariantProps<typeof headingAnchor>['placement'];
  /**
   * 印の形。link は鎖、hash は井げた（#）です。色と大きさは同じです
   * @default 'link'
   */
  mark?: 'link' | 'hash';
  /** 印の差し替え。指定すると `mark` より優先します。アイコン（`<Icon>` や `<svg>`）を渡すと置き換えます。大きさは見出しの文字に合わせます */
  children?: ReactNode;
}

/**
 * 見出しに付く、ページ内のその場所へのリンク。見出しの中に置き、見出しの `id` を `href` で指します
 */
export function HeadingAnchor({
  href,
  label = 'このセクションへのリンク',
  reveal,
  placement,
  mark = 'link',
  className,
  children,
  ...props
}: HeadingAnchorProps) {
  return (
    <a
      {...props}
      href={href}
      aria-label={label}
      data-slot="heading-anchor"
      className={headingAnchor({ reveal, placement, className })}
    >
      {children ?? (mark === 'hash' ? <HashIcon /> : <LinkSimpleHorizontalIcon />)}
    </a>
  );
}
