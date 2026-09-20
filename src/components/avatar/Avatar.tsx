'use client';

import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { AvatarUserIcon } from './avatar-icons';
import { initialsFromName } from './initials';
import { tv } from '../../internal/tv';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';

// アバター（人やものの顔。画像か、頭文字か、人のアイコン）— 軸 140・141。値は design/tokens.css の --avatar-*
//   押せないので影は付けず、ページと同じレイヤーに置く（原則1）。hover でも変わらない（原則3）
//   白っぽい画像が白地に溶けないよう、細い輪郭を足す（原則1。Image の輪郭と同じ濃さ）。付けるかは利用者が選ぶ — 軸 140
//   形は、小物の丸（pill）が既定。四角（rounded）の角は大きさの段に従い、小さい段は部品の角、大きい段はカードの角（原則5）— 軸 140
//   画像は 1:1 で、はみ出た分は切る（object-cover）
//   画像がないとき・読み込めないときは、名前の頭文字が既定。人のアイコンも選べる — 軸 141
//   頭文字の色は、淡い面に同じ色相の濃い文字（原則6・12。Tag と同じ組）。指定しないときはグレー
//     名前から色を自動で決めることはしない。色は利用者が選ぶ（原則6）
//   大きさは段で持ち、入力方式では変えない（原則11。押すものではないので、指でも大きくしない）
//   読み上げ: 画像が読み込めているときは img の alt が名前になる
//     頭文字・アイコンに切り替わったときは、それを飾りとして読み上げから外し（aria-hidden）、
//     代わりに名前（alt ?? name）を見えない文字で置く。一覧に並んだときに誰のアバターか分かるようにするため
//     alt="" のときは何も読ませない（周りの文字に名前があって、二度読ませたくないとき）
const avatar = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle',
      'size-(--avatar-size) rounded-(--avatar-radius)',
      'text-(length:--avatar-text) leading-none font-bold select-none',
    ],
    image: 'size-full object-cover',
    fallback: 'flex size-full items-center justify-center',
    // 頭文字・アイコンを包む飾りの層。並び方は fallback のままにする（display: contents）
    fallbackContent: 'contents',
  },
  variants: {
    // 大きさの段。四角のときの角も、段ごとに持つ（小さい段は部品の角、大きい段はカードの角）
    size: {
      sm: {
        root: [
          '[--avatar-size:var(--avatar-size-sm)] [--avatar-text:var(--avatar-text-sm)]',
          '[--avatar-radius-rounded:var(--avatar-radius-rounded-sm)]',
        ],
      },
      md: {
        root: [
          '[--avatar-size:var(--avatar-size-md)] [--avatar-text:var(--avatar-text-md)]',
          '[--avatar-radius-rounded:var(--avatar-radius-rounded-md)]',
        ],
      },
      lg: {
        root: [
          '[--avatar-size:var(--avatar-size-lg)] [--avatar-text:var(--avatar-text-lg)]',
          '[--avatar-radius-rounded:var(--avatar-radius-rounded-lg)]',
        ],
      },
      xl: {
        root: [
          '[--avatar-size:var(--avatar-size-xl)] [--avatar-text:var(--avatar-text-xl)]',
          '[--avatar-radius-rounded:var(--avatar-radius-rounded-xl)]',
        ],
      },
    },
    // 形（原則5）: circle は小物の丸、rounded は四角（角は大きさの段に従う）
    shape: {
      circle: { root: '[--avatar-radius:var(--avatar-radius-circle)]' },
      rounded: { root: '[--avatar-radius:var(--avatar-radius-rounded)]' },
    },
    // 頭文字の面と文字（原則6）。指定しないときはグレー
    color: {
      neutral: { root: 'bg-neutral text-fg-muted' },
      primary: { root: 'bg-primary-subtle text-on-primary-subtle' },
      secondary: { root: 'bg-secondary-subtle text-on-secondary-subtle' },
    },
    // 細い輪郭（原則1）。画像の上にも引くので、内側に引く（outline-offset を負にする）
    outline: {
      true: {
        root: [
          '[outline:var(--avatar-outline-width)_solid_var(--avatar-outline-color)]',
          '[outline-offset:calc(var(--avatar-outline-width)*-1)]',
        ],
      },
      false: {},
    },
  },
  defaultVariants: { size: 'md', shape: 'circle', color: 'neutral', outline: true },
});

/** 画像がないとき・読み込めないときに出すもの — 軸 141 */
export type AvatarFallback = 'initials' | 'icon';

export interface AvatarProps
  extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof avatar> {
  /** 画像の URL。読み込めなかったときは、頭文字か人のアイコン（`fallback`）に切り替わります */
  src?: string;
  /**
   * 読み上げの名前。書かないときは `name` を使います。画像が読み込めたときは画像の代わりの文になり、
   * 頭文字やアイコンに切り替わったときは、見えない文字として同じ名前を読み上げに届けます。
   * 名前が周りの文字にも出ていて、二度読ませたくないときは空文字にします（そのときは何も読みません）
   */
  alt?: string;
  /**
   * 頭文字のもとになる名前。画像がないとき・読み込めないときに、
   * 和文は 1 文字、欧文は語頭 2 文字までを出します（「かずえもん」→「か」、`Kazuya Miyamoto` → `KM`）。
   * `alt` を書かないときは、この名前が読み上げの名前にもなります
   */
  name?: string;
  /**
   * 画像がないとき・読み込めないときに出すもの。initials は `name` の頭文字、icon は人のアイコンです。
   * `name` がないときは、initials でも面だけになります
   * @default 'initials'
   */
  fallback?: AvatarFallback;
  /**
   * 頭文字やアイコンの代わりに置く中身。渡すと `fallback` より優先します。
   * 中身は飾りとして読み上げから外し、名前（`alt` か `name`）を見えない文字で読ませます
   */
  children?: ComponentProps<'span'>['children'];
  /**
   * 大きさ。sm は文字の行の中、md は一覧の行、lg はカードの見出し、xl はプロフィールの見出しに合う段です
   * @default 'md'
   */
  size?: VariantProps<typeof avatar>['size'];
  /**
   * 形。circle は丸、rounded は四角です。四角の角は大きさの段に従い、sm・md は部品と同じ角、lg・xl はカードと同じ角になります
   * @default 'circle'
   */
  shape?: VariantProps<typeof avatar>['shape'];
  /**
   * 頭文字と人のアイコンの色。primary・secondary は利用者が選ぶ色（原則6）で、指定しないときは色を持たないグレーです。
   * 名前から色を自動で決めることはしません
   * @default 'neutral'
   */
  color?: VariantProps<typeof avatar>['color'];
  /**
   * 細い輪郭を付けるか。白っぽい画像が白地に溶けないように付けます
   * @default true
   */
  outline?: boolean;
}

/**
 * アバター。画像を 1:1 で出し、画像がないときや読み込めなかったときは、名前の頭文字（または人のアイコン）を出します。
 * どちらのときも、読み上げには名前（`alt` か `name`）が届きます
 */
export function Avatar({
  src,
  alt,
  name,
  fallback = 'initials',
  size,
  shape,
  color,
  outline,
  children,
  className,
  ...props
}: AvatarProps) {
  const styles = avatar({ size, shape, color, outline });
  const initials = name ? initialsFromName(name) : null;
  const fallbackContent = children ?? (fallback === 'icon' ? <AvatarUserIcon /> : initials);
  // 読み上げの名前。alt="" のときは、周りの文字に名前があるとみなして何も読ませない
  const label = alt ?? name ?? '';
  return (
    <BaseAvatar.Root data-slot="avatar" className={styles.root({ className })} {...props}>
      {src && <BaseAvatar.Image src={src} alt={label} className={styles.image()} />}
      <BaseAvatar.Fallback className={styles.fallback()}>
        {/* 頭文字とアイコンは飾り。名前は下の見えない文字で読ませる */}
        <span aria-hidden="true" className={styles.fallbackContent()}>
          {fallbackContent}
        </span>
        {label && <VisuallyHidden>{label}</VisuallyHidden>}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
