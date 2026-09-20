'use client';

import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, ElementType, ReactElement } from 'react';

import { tv } from '../../internal/tv';

// 利用者が持ち込むアイコン（Phosphor・Lucide・Heroicons・自前の SVG）の大きさ・色・線の太さ・読み上げをそろえる入口
// Icon は @phosphor-icons/react を import しない（optional の peer dependency。使わない人に依存を強いない）
// 包む要素は足さず、渡された部品（icon）か子の <svg> に className などを混ぜて、<svg> を 1 つだけ描く（useRender）
// 大きさ: 既定（text）は周りの文字に比例する（--icon-size-text）。ボタン・リンク・見出し・文のどこに置いても文字に合う（後半の軸 88）
//   control は周りの部品と同じ、部品の中の文字と並ぶ大きさ（--spacing-icon。密度で変わる — design/adr/0080）。文字の大きさと関係なく、周りの部品にそろえたいときに選ぶ
// 線の太さ（design/adr/0018）: 文字と並ぶときは Regular、アイコン単体（standalone）は Bold。太さは --icon-weight（viewBox 256 に対する線幅）
//   Phosphor の形（viewBox 256・塗り）: Regular の形に、同じ色の線を外側へ足して太くする。Phosphor の太さは、同じ骨格の線の幅の違いなので、
//     Regular（幅 16）に幅 8 の線を重ねると Bold（幅 24）と同じ形になる。React の weight を渡さないので、Phosphor 以外に知らない props を渡さない
//   Phosphor と同じ描き方の線の SVG（viewBox 256・fill="none"）: 線幅を --icon-weight にする（部品の中のアイコンと同じ）
//   ほかの viewBox（Lucide の 24 など）は触らない。太さはそのライブラリの props（strokeWidth など）で渡す
//   足す線の幅が 0（Regular のまま）のときは、線を透明にする。Chrome は calc() で 0 になった線幅を 0 と扱わず、
//     画面の 1 ピクセルの細い線（hairline）を描くので、等倍の画面では Regular が太く描かれ、Bold との差が逆に見えていた
//   利用者が weight を渡したときは、足す線を付けない（渡された太さのまま描く）
// 文の中の縦の位置: アイコンの中心を、漢字の枠の中心（ベースラインから --icon-text-center の高さ）に置く
//   align-middle（ベースライン + x の高さの半分）だと、和文の行では漢字の中心より下に見える。flex で並べたときは効かない
//   大きさは --icon-size に入れて、寸法と縦の位置の両方で読む
const icon = tv({
  base: 'inline-block size-(--icon-size) shrink-0 align-[calc(var(--icon-text-center)-var(--icon-size)/2)]',
  variants: {
    size: {
      text: '[--icon-size:var(--icon-size-text)]',
      control: '[--icon-size:var(--spacing-icon)]',
      sm: '[--icon-size:var(--icon-size-sm)]',
      md: '[--icon-size:var(--icon-size-md)]',
      lg: '[--icon-size:var(--icon-size-lg)]',
    },
    standalone: {
      true: '[--icon-weight:var(--icon-weight-standalone)]',
      false: '[--icon-weight:var(--icon-weight-inline)]',
    },
    weighted: {
      true: [
        "[&[viewBox='0_0_256_256']:not([fill=none])]:[stroke:currentColor] [&[viewBox='0_0_256_256']:not([fill=none])]:[stroke-width:calc(var(--icon-weight)-16)]",
        "[&[viewBox='0_0_256_256']:not([fill=none])]:[stroke-opacity:clamp(0,calc(var(--icon-weight)-16),1)]",
        "[&[viewBox='0_0_256_256']:not([fill=none])]:[stroke-linecap:round] [&[viewBox='0_0_256_256']:not([fill=none])]:[stroke-linejoin:round]",
        "[&[viewBox='0_0_256_256'][fill=none]]:[stroke-width:var(--icon-weight)]",
      ],
      false: '',
    },
  },
  defaultVariants: { size: 'text', standalone: false, weighted: true },
});

export type IconSize = 'text' | 'control' | 'sm' | 'md' | 'lg';

interface IconOwnProps<C extends ElementType> {
  /**
   * 描くアイコンの部品。className を受け取って <svg> を描く React の部品なら、どのライブラリのものでも使えます（例: `@phosphor-icons/react` の `MagnifyingGlassIcon`）。
   * 渡さないときは、子に置いた <svg> を描きます
   */
  icon?: C;
  /** icon を渡さないときに描く <svg>。1 つだけ置きます */
  children?: ReactElement;
  /**
   * 読み上げる名前。書くと画像（role="img"）として読まれ、書かないと飾りとして読み上げから外します。
   * アイコンだけのボタンやリンクでは、ここではなく、ボタンやリンクに aria-label で名前を付けます
   */
  label?: string;
  /**
   * 大きさ。text は周りの文字の大きさに比例します（文字の 1.25 倍）。文の流れの中に置くと、アイコンの中心が漢字の中心にそろいます。
   * control は周りの部品と同じ、部品の中の文字と並ぶ大きさで、密度で変わります。文字の大きさと関係なく部品にそろえたいときに使います。sm・md・lg は密度で変わらない段です
   * @default 'text'
   */
  size?: IconSize;
  /**
   * アイコンだけで置くか（アイコンだけのボタンなど）。線を太くし、比べる文字がなくても形が読めるようにします。
   * 文字と並ぶときは細い線で、文字の線の太さとそろえます
   * @default false
   */
  standalone?: boolean;
  className?: string;
}

export type IconProps<C extends ElementType = 'svg'> = IconOwnProps<C> &
  Omit<ComponentProps<C>, keyof IconOwnProps<C>>;

/**
 * アイコンを、部品の中の文字とそろえた大きさ・色・線の太さで描く
 *
 * `icon` に部品を渡すか（`<Icon icon={MagnifyingGlassIcon} />`）、子に <svg> を置きます（`<Icon><svg viewBox="0 0 24 24">…</svg></Icon>`）。
 * 色は周りの文字の色（currentColor）に従います。状態の色は className（`text-fg-danger` など）で付けます。
 */
export function Icon<C extends ElementType = 'svg'>({
  icon: IconComponent,
  children,
  label,
  size,
  standalone,
  className,
  ...props
}: IconProps<C>) {
  // weight（Phosphor）を渡したときは、その太さのまま描く
  const weighted = !('weight' in props);
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: 'false' };
  // 型は IconProps で確かめているので、描くときは要素の種類として扱う
  const Component: ElementType | undefined = IconComponent;
  return useRender({
    render: Component ? <Component /> : children,
    defaultTagName: 'svg',
    props: {
      ...props,
      ...a11y,
      'data-slot': 'icon',
      className: icon({ size, standalone, weighted, className }),
    },
  });
}
