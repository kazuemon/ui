import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { tv } from '../../internal/tv';
import { skeletonMotion, skeletonSurface } from '../../internal/skeleton-styles';

// 読み込み中の場所取り（軸 89）。形だけ先に置き、読み込んだら実物に差し替える
// 角は、代わりに置くものの角に合わせる（原則5）: 画像はカードの角、ボタン・入力欄は部品の角、タグ・トグルは pill、顔は丸
// 文字の行は、周りの文字の大きさと行の高さを受け継ぐ。1 行は周りの行の高さ（1lh）を取り、帯（--skeleton-text-bar）をその中央に置く
//   行の高さを実物と同じにするので、読み込んだときに下の内容が跳ばない
// 動きは animation で選ぶ（既定は面ごとに通る光。クラス列は src/internal/skeleton-styles.ts）。文字の行では、帯ごとに動かす
// 読み上げには出さない（aria-hidden）。読み込み中であることは、包む側の aria-busy と、読み上げにだけ届ける文で知らせる
const skeleton = tv({
  slots: {
    root: 'block',
    line: 'flex h-[1lh] items-center',
    bar: [skeletonSurface, 'block h-(--skeleton-text-bar) w-full rounded-(--skeleton-text-radius)'],
  },
  variants: {
    shape: {
      block: { root: [skeletonSurface, 'w-full'] },
      circle: { root: [skeletonSurface, 'size-(--spacing-control) shrink-0 rounded-full'] },
      text: { root: 'w-full' },
    },
    animation: {
      sweep: { bar: skeletonMotion.sweep },
      'sweep-viewport': { bar: skeletonMotion['sweep-viewport'] },
      pulse: { bar: skeletonMotion.pulse },
    },
    radius: {
      control: {},
      card: {},
      pill: {},
      none: {},
    },
  },
  compoundVariants: [
    // 面を持つのは、block・circle では root（text では帯。帯は animation の variant で付ける）
    ...(['sweep', 'sweep-viewport', 'pulse'] as const).map((animation) => ({
      shape: ['block' as const, 'circle' as const],
      animation,
      class: { root: skeletonMotion[animation] },
    })),
    { shape: 'block', radius: 'control', class: { root: 'rounded-control' } },
    { shape: 'block', radius: 'card', class: { root: 'rounded-card' } },
    { shape: 'block', radius: 'pill', class: { root: 'rounded-pill' } },
  ],
  defaultVariants: { shape: 'block', radius: 'control', animation: 'sweep' },
});

export interface SkeletonProps extends ComponentProps<'span'>, VariantProps<typeof skeleton> {
  /**
   * 形。block は面（画像・ボタン・入力欄の代わり）、text は文字の行、circle は丸（顔の画像の代わり）です。
   * block の幅は既定で幅いっぱい、高さは className（h-40・h-control など）で決めます。circle の大きさの既定は部品の高さです
   * @default 'block'
   */
  shape?: VariantProps<typeof skeleton>['shape'];
  /**
   * block の角。代わりに置くものの角に合わせます。control はボタン・入力欄、card は画像・カード、pill はタグ・トグルです
   * @default 'control'
   */
  radius?: VariantProps<typeof skeleton>['radius'];
  /**
   * 動き。どれも、動きを減らす設定ではその場の明滅に置き換わります
   * - sweep: 縦の光の帯が、面ごとに左から右へ通ります。ふだんはこれを使います
   * - sweep-viewport: 光の帯を画面を基準にして通します。カードの一覧のように同じ形の面が並ぶ場所で、1 本の光が面をまたいで横切ります。
   *   帯の幅は画面の幅に合わせて決まります。transform の付いた要素の中や iOS の Safari では、面ごとに通る光になります
   * - pulse: 光の帯を出さず、面の濃さをゆっくり明滅させます。小さな面がひとつだけのときや、動きを控えたい画面で使います
   * @default 'sweep'
   */
  animation?: VariantProps<typeof skeleton>['animation'];
  /**
   * text の行の数。2 行以上のときは、最後の行を短くします
   * @default 1
   */
  lines?: number;
}

/**
 * 読み込み中の場所取り。読み込む前から、実物と同じ形と大きさの面を置きます
 *
 * 読み上げには出しません。包む要素に `aria-busy` を付け、読み込み中であることは読み上げにだけ届ける文で知らせます。
 */
export function Skeleton({
  shape,
  radius,
  animation,
  lines = 1,
  className,
  ...props
}: SkeletonProps) {
  const styles = skeleton({ shape, radius, animation });
  if (shape !== 'text') {
    return (
      <span aria-hidden data-slot="skeleton" className={styles.root({ className })} {...props} />
    );
  }
  const count = Math.max(1, Math.floor(lines));
  return (
    <span aria-hidden data-slot="skeleton" className={styles.root({ className })} {...props}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={styles.line()}>
          <span
            className={styles.bar({
              className: count > 1 && i === count - 1 ? 'w-(--skeleton-last-line)' : undefined,
            })}
          />
        </span>
      ))}
    </span>
  );
}
