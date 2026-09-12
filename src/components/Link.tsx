import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

// 原則5: リンクなどの小物は pill。原則7の例外: 密度の高い並び（More、SNS のアカウント一覧）は枠線
// 影のない平らな要素なので、hover と押下は塗りの濃さで表し、押下で 1px 沈む（原則3、design/adr/0027）
// 文字のリンクの下線と hover は design/adr/0030。大きさは仮
const link = tv({
  base: 'cursor-pointer text-(color:--link-color)',
  variants: {
    appearance: {
      // 文字のリンク。hover・押下で背景を敷かず、押下で沈むだけ（design/adr/0027。塗りのトークンは transparent）
      // 塗りを敷く場合に文字に詰まらないよう左右にはみ出させる。文章の中で折り返せるよう inline のまま沈める
      // 下線の有無・太さ・色は、通常と hover でトークンから読む（ふだんは淡く、hover で下線だけ濃く — design/adr/0030）
      // 背景に線を描く仕組みは、比べたが採らなかった動き（F1〜F4）を比較のストーリーで再現するために残している
      text: [
        'relative -mx-1 rounded-(--link-text-radius) box-decoration-clone px-1 py-0.5 underline-offset-4',
        '[text-decoration-line:var(--link-decoration)] [text-decoration-color:var(--color-link-underline)] [text-decoration-thickness:var(--link-underline-width)]',
        'hover:[text-decoration-line:var(--link-decoration-hover)] hover:[text-decoration-color:var(--color-link-underline-hover)] hover:[text-decoration-thickness:var(--link-underline-width-hover)]',
        // hover で文字（と下線）を濃くする。リンクの色に黒を --link-hover-darken だけ混ぜる
        'hover:text-[color:color-mix(in_oklab,var(--link-color),black_var(--link-hover-darken))]',
        // 下線を動かすときは、背景に線を2本描く（上: hover で伸びる線、下: ふだんの線）。文字の幅だけに引く
        // 文字の下線の太さは、1 倍の画面では 1px から 2px へ一段で切り替わり、なめらかに動かせないため
        '[background-image:linear-gradient(color-mix(in_oklab,var(--color-link-grow)_var(--link-grow-alpha),transparent),color-mix(in_oklab,var(--color-link-grow)_var(--link-grow-alpha),transparent)),linear-gradient(var(--color-link-underline),var(--color-link-underline))]',
        '[--link-grow-alpha:var(--link-grow-alpha-rest)] hover:[--link-grow-alpha:var(--link-grow-alpha-hover)]',
        'bg-no-repeat bg-origin-content',
        '[background-size:var(--link-grow-size-rest),var(--link-base-line-size)] [background-position:var(--link-grow-pos-rest),0_100%]',
        'hover:[background-size:var(--link-grow-size-hover),var(--link-base-line-size)] hover:[background-position:var(--link-grow-pos-hover),0_100%]',
        'hover:bg-link-hover active:top-(--flat-press-depth) active:bg-link-press',
        // 下線の変化（伸びる線の大きさと濃さ、文字の下線の色）は --link-grow-duration で動かす
        // 位置は動かさない（離したときに抜ける向きを変えられる）
        '[transition:background-color_var(--duration-press)_var(--ease-press),top_var(--duration-press)_var(--ease-press),color_var(--duration-press)_var(--ease-press),background-size_var(--link-grow-duration)_var(--link-grow-ease),--link-grow-alpha_var(--link-grow-duration)_var(--link-grow-ease),text-decoration-color_var(--link-grow-duration)_var(--link-grow-ease)]',
        'motion-reduce:[transition:none]',
      ],
      // 枠線のリンク。枠線のボタンと同じく、文字の色を淡く敷く
      outline: [
        // pill（原則5）。文字のリンクは背景を敷かないので角丸を付けない（付けると背景に描く下線の端が丸く欠ける）
        'inline-flex h-(--size-control) items-center gap-2 rounded-pill border-[1.5px] border-current px-(--space-control-x) whitespace-nowrap',
        'text-(length:--text-control) leading-(--leading-control) font-bold',
        'hover:bg-flat-hover active:translate-y-(--flat-press-depth) active:bg-flat-press',
        'transition-[background-color,translate,color] duration-(--duration-press) ease-press motion-reduce:transition-none',
      ],
    },
    // 利用者が選ぶ色（原則6）。指定しないときはグレー（neutral）— design/adr/0028
    // 色は --link-color に入れる（hover で濃くするときにもとの色を参照するため）
    color: {
      primary: '[--link-color:var(--color-primary)]',
      secondary: '[--link-color:var(--color-fg-secondary)]',
      neutral: '[--link-color:var(--color-fg-muted)]',
    },
  },
  defaultVariants: { appearance: 'text', color: 'neutral' },
});

export interface LinkProps extends Omit<ComponentProps<'a'>, 'color'>, VariantProps<typeof link> {}

/**
 * リンク
 */
export function Link({ appearance, color, className, ...props }: LinkProps) {
  return <a className={link({ appearance, color, className })} {...props} />;
}
