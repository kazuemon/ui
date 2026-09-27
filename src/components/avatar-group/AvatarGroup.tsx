'use client';

import { Children, cloneElement, type ComponentProps, isValidElement, type ReactNode } from 'react';

import type { VariantProps } from 'tailwind-variants';

import { Avatar, type AvatarProps } from '../avatar/Avatar';
import { tv } from '../../internal/tv';

// アバターを重ねて並べる形。src/components/avatar の組み合わせで、新しい振る舞いは持たない
// backlog（Avatar・Breadcrumb・Pager・CodeGroup・Toast・Tree）にあった「縁の色や重なりの量を決めます」を、
// 軸 0315（design/stories/axis-0315-avatar-group-overlap.stories.tsx。ADR-0315）で決めた
//   縁の色: 重なる部分を、置いた面の色（--color-surface）で区切る。Badge が通知の数を相手に重ねるときと同じ考え。
//     線に近づける案（背景の色に依存しない）も比べたが、採らず現行のまま。Avatar 自身の細い輪郭
//     （画像が白地に溶けないための --avatar-outline-*）とは役割が違うので、両方残す
//   重なりの量: overlap props（sm・md・lg）で選べる。md（隣のアバターの 30%）が既定、sm（18%）・lg（45%）も選べる。
//     太くする案（縁の太さ）は採らず、現行の太さのまま。アバターごとの --avatar-size を基準にするので、大きさの段が違っても比は変わらない
//   expandOnHover（ADR-0315 で追加）: マウスを載せたアバターの右側が、次のアバターに隠れて見えないままだと
//     確かめづらいという声を受けて、hover で次のアバターを退け、隠れた分を見せる。opt-in（既定オフ）。
//     指では hover がないため、この効果は出ない（原則3）。Avatar の中身や alt は変えないので、読み上げには影響しない
// 並べる向き: 横一列。あとに置いたアバターが前のアバターの上に重なる（DOM の並び順のまま、z-index は使わない）。
//   読み上げの順（先頭から）と見た目の前後を逆にしない判断。縦に並べる形・重なる向きを選べる形は作っていない（backlog に残したまま）
// 最大表示数: max で決める。超えた分は「+N」のアバターにまとめる（N は隠れた数）。max は「+N」の枠も含めた表示の総数
//   例: 6 個渡して max=4 なら、アバター 3 個 + 「+N」（+3）の 4 枠になる。max を渡さないときは、隠さず全部並べる（原則20: 決めるのは使う側）
// 子は Avatar を想定するが、Avatar 以外の要素が混ざっていても、その要素はそのまま出す（重なりの縁だけ付けない）
// size を渡すと、子の Avatar の大きさをそろえて上書きする。渡さないときは、子がそれぞれ持つ大きさのまま重ねる
const avatarGroup = tv({
  slots: {
    root: 'inline-flex items-center',
    // 重なる縁。box-shadow は Avatar 自身の rounded を追う。outline を使う Avatar の細い輪郭とは重ならない
    item: 'relative shrink-0 shadow-[0_0_0_var(--avatar-group-ring-width)_var(--color-surface)]',
  },
  variants: {
    // 先頭以外は、直前のアバターの上に重ねる
    pull: {
      true: { item: 'ml-[calc(var(--avatar-size)*-1*var(--avatar-group-overlap))]' },
      false: {},
    },
    // 重なりの量（ADR-0315）。--avatar-size に対する比を、root に置いて子へ継がせる
    overlap: {
      sm: { root: '[--avatar-group-overlap:var(--avatar-group-overlap-sm)]' },
      md: { root: '[--avatar-group-overlap:var(--avatar-group-overlap-md)]' },
      lg: { root: '[--avatar-group-overlap:var(--avatar-group-overlap-lg)]' },
    },
    // hover で、次のアバターを退けて隠れた右側を見せる（ADR-0315）。マウス用の密度でだけ意味を持つ（原則3・11）
    expandOnHover: {
      true: {
        item: [
          'transition-[margin-left] duration-(--duration-fast) ease-(--ease-press) motion-reduce:transition-none',
          '[&:hover+[data-avatar-group-item]]:ml-0',
        ],
      },
      false: {},
    },
  },
  defaultVariants: { pull: false, overlap: 'md', expandOnHover: false },
});

/** 隣のアバターと重ねる量。sm 18%・md（既定）30%・lg 45%（--avatar-size の比。ADR-0315） */
export type AvatarGroupOverlap = NonNullable<VariantProps<typeof avatarGroup>['overlap']>;

export interface AvatarGroupProps extends Omit<ComponentProps<'div'>, 'color'> {
  /** 並べる Avatar 要素。Avatar 以外が混ざっていても、そのまま出します（重なりの縁は付きません） */
  children?: ReactNode;
  /**
   * 一度に出す数の上限。超えた分は「+N」のアバターにまとめます（N は隠れた数）。
   * この数には「+N」自身の枠も含みます（`max={4}` で 6 個渡すと、アバター 3 個と「+N」の 4 枠になります）。
   * 渡さないときは、隠さず全部並べます
   */
  max?: number;
  /**
   * 子の Avatar に渡す大きさ。渡すと、子がそれぞれ持つ `size` を上書きしてそろえます。
   * 渡さないときは、子がそれぞれ持つ大きさのまま重ねます
   */
  size?: AvatarProps['size'];
  /**
   * 隣のアバターと重ねる量。sm は浅く（18%）、lg は深く（45%）重ねます
   * @default 'md'
   */
  overlap?: AvatarGroupOverlap;
  /**
   * マウスを載せたアバターの右側が次のアバターに隠れているとき、次のアバターを退けて見せるか。
   * 指では hover がないため、この効果は出ません
   * @default false
   */
  expandOnHover?: boolean;
  /**
   * 「+N」のアバターに出す文字。N は隠れた数です
   * @default (hiddenCount) => `+${hiddenCount}`
   */
  moreLabel?: (hiddenCount: number) => string;
  /**
   * 「+N」のアバターの読み上げの名前。渡さないときは `moreLabel` と同じ文字を読みます
   */
  moreName?: (hiddenCount: number) => string;
  /** いちばん外の要素（div）に付きます */
  className?: string;
}

const defaultMoreLabel = (hiddenCount: number) => `+${hiddenCount}`;

/**
 * Avatar を重ねて並べます。1 つの場所に集まった人やものをまとめて見せるときに使います
 *
 * - `max` を渡すと、超えた分を「+N」のアバターにまとめます（N は隠れた数）
 * - `size` を渡すと、子の Avatar の大きさをそろえて上書きします
 * - `overlap` で重なりの量を、`expandOnHover` で hover したときに隣を退けるかを選べます
 */
export function AvatarGroup({
  children,
  max,
  size,
  overlap,
  expandOnHover = false,
  moreLabel = defaultMoreLabel,
  moreName,
  className,
  ...props
}: AvatarGroupProps) {
  const styles = avatarGroup({ overlap });
  const items = Children.toArray(children);
  const total = items.length;
  const showCount = max !== undefined && max < total ? Math.max(max - 1, 0) : total;
  const visible = items.slice(0, showCount);
  const hiddenCount = total - showCount;
  // 「+N」の形（丸・四角）を、先頭のアバターに合わせる。渡っていないときは Avatar の既定（丸）のまま
  const firstShape =
    isValidElement<AvatarProps>(items[0]) && items[0].type === Avatar
      ? items[0].props.shape
      : undefined;
  // hover で押しのける先（次のアバター）を選ぶための印（[data-avatar-group-item]:hover+[data-avatar-group-item]）。
  // expandOnHover が false のときも付けておいて害はない（対応する CSS のクラスが付かないので何も起きない）
  const dataItem = { 'data-avatar-group-item': '' };

  return (
    <div data-slot="avatar-group" className={styles.root({ className })} {...props}>
      {visible.map((child, index) =>
        isValidElement<AvatarProps>(child) && child.type === Avatar
          ? cloneElement(child, {
              ...dataItem,
              size: size ?? child.props.size,
              className: styles.item({
                pull: index > 0,
                expandOnHover,
                className: child.props.className,
              }),
            })
          : child
      )}
      {max !== 0 && hiddenCount > 0 && (
        <Avatar
          key="avatar-group-more"
          {...dataItem}
          size={size}
          shape={firstShape}
          color="neutral"
          alt={(moreName ?? moreLabel)(hiddenCount)}
          className={styles.item({ pull: visible.length > 0, expandOnHover })}
        >
          {moreLabel(hiddenCount)}
        </Avatar>
      )}
    </div>
  );
}
