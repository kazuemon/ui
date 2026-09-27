'use client';

import { Children, cloneElement, type ComponentProps, isValidElement, type ReactNode } from 'react';

import { Avatar, type AvatarProps } from '../avatar/Avatar';
import { tv } from '../../internal/tv';

// アバターを重ねて並べる形。src/components/avatar の組み合わせで、新しい振る舞いは持たない
// backlog（Avatar・Breadcrumb・Pager・CodeGroup・Toast・Tree）に「重ねて並べる形は作っていません。
//   縁の色や重なりの量を決めます」とあった、その 2 つを含む原則にない判断（design/backlog.md 2026-09-27 更新）
//   縁の色: 重なる部分を、置いた面の色（--color-surface）で区切る。Badge が通知の数を相手に重ねるときと同じ考え（原則1・6 に無い判断だが、
//     Badge の重ねる縁と手触りをそろえた）。Avatar 自身の細い輪郭（画像が白地に溶けないための --avatar-outline-*）とは役割が違うので、両方残す
//   重なりの量: 隣のアバターの 30%（--avatar-group-overlap）。アバターごとの --avatar-size を基準にするので、大きさの段が違っても比は変わらない
//   並べる向き: 横一列。あとに置いたアバターが前のアバターの上に重なる（DOM の並び順のまま、z-index は使わない）。
//     読み上げの順（先頭から）と見た目の前後を逆にしない判断。縦に並べる形・重なる向きを選べる形は作っていない
//   最大表示数: max で決める。超えた分は「+N」のアバターにまとめる（N は隠れた数）。max は「+N」の枠も含めた表示の総数
//     例: 6 個渡して max=4 なら、アバター 3 個 + 「+N」（+3）の 4 枠になる。max を渡さないときは、隠さず全部並べる（原則20: 決めるのは使う側）
// 子は Avatar を想定するが、Avatar 以外の要素が混ざっていても、その要素はそのまま出す（重なりの縁だけ付けない）
// size を渡すと、子の Avatar の大きさをそろえて上書きする。渡さないときは、子がそれぞれ持つ大きさのまま重ねる
const avatarGroup = tv({
  slots: {
    root: 'inline-flex items-center',
    // 重なる縁（原則にない判断）。box-shadow は Avatar 自身の rounded を追う。outline を使う Avatar の細い輪郭とは重ならない
    item: 'relative shrink-0 shadow-[0_0_0_var(--avatar-group-ring-width)_var(--color-surface)]',
  },
  variants: {
    // 先頭以外は、直前のアバターの上に重ねる（原則にない判断: 重なりの量）
    overlap: {
      true: { item: 'ml-[calc(var(--avatar-size)*-1*var(--avatar-group-overlap))]' },
      false: {},
    },
  },
  defaultVariants: { overlap: false },
});

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
 */
export function AvatarGroup({
  children,
  max,
  size,
  moreLabel = defaultMoreLabel,
  moreName,
  className,
  ...props
}: AvatarGroupProps) {
  const styles = avatarGroup();
  const items = Children.toArray(children);
  const total = items.length;
  const showCount = max !== undefined && max < total ? Math.max(max - 1, 0) : total;
  const visible = items.slice(0, showCount);
  const hiddenCount = total - showCount;
  // 「+N」の形（丸・四角）を、先頭のアバターに合わせる。渡っていないときは Avatar の既定（丸）のまま
  const firstShape = isValidElement<AvatarProps>(items[0]) ? items[0].props.shape : undefined;

  return (
    <div data-slot="avatar-group" className={styles.root({ className })} {...props}>
      {visible.map((child, index) =>
        isValidElement<AvatarProps>(child)
          ? cloneElement(child, {
              size: size ?? child.props.size,
              className: styles.item({ overlap: index > 0, className: child.props.className }),
            })
          : child
      )}
      {hiddenCount > 0 && (
        <Avatar
          key="avatar-group-more"
          size={size}
          shape={firstShape}
          color="neutral"
          alt={(moreName ?? moreLabel)(hiddenCount)}
          className={styles.item({ overlap: visible.length > 0 })}
        >
          {moreLabel(hiddenCount)}
        </Avatar>
      )}
    </div>
  );
}
