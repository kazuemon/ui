'use client';

import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  use,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'tailwind-variants';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden';
import { ItemContext, ListContext, type SortableMoveActions } from './sortable-context';
import { ItemMoveActions } from './SortableMoveActions';
import { defaultMovedText, useSortableList } from './use-sortable-list';

export type { SortableMoveActions } from './sortable-context';
export { type SortableItemActionsValue, useSortableItemActions } from './SortableMoveActions';

// 並べ替えられるリスト。見た目と、キーボードでの並べ替えだけを持つ
//   ポインタで引く動き（ドラッグ）は持たない。dnd-kit などの外のエンジンに任せ、状態は props（dragging・dragSource）で受ける
//   エンジンが要素を直接動かせるよう、項目（SortableItem）とつまみ（SortableHandle）は ref を受ける
// キーボード: つまみにフォーカスして上下の矢印キーで 1 つずつ動かす。value を並べ替えて onValueChange を呼ぶだけなので、エンジンに頼らない
//   動かしたあとは、つまみにフォーカスを戻し、何番目に移ったかを読み上げの箱（role=status）で 1 回だけ伝える（原則15）
//   動いた項目は、元の位置から滑らせる（原則14。長さは --sortable-move-duration — ADR-0341。motion="none" と動きを減らす設定では 0）
// 項目の面（variant — ADR-0337）: 既定は card（白い面と細い輪郭）。fill（入力欄と同じグレーの塗り）、divided（線で区切る）も選べる
// 持ち上げた項目（dragging — ADR-0338）はページの上に重なるので、白い面と細い輪郭に、濃く近い影を付け、少しだけ大きくする（持っている実感を出す）
// 入る場所（dragSource — ADR-0339）は、中身を消した点線の枠。dragSourceVariant="filled" では淡い塗りも敷く
// つまみ（ADR-0340）: 既定は先頭のつまみだけで引く。placement="end"（末尾）と grabArea="item"（項目のどこでも）も選べる
// 並べ替えられないとき（disabled）は、つまみを出さない（原則16: できないことの印は出さない）。文は薄くしない（原則13）
// 引かずに並べ替える操作（moveActions — ADR-0342）: 既定は none。item-menu（︙）・buttons（上へ・下へ）で、
//   ポインタだけでも引かずに並べ替えを終えられるようにする（WCAG 2.2 の 2.5.7）。SortableMoveActions.tsx
//   ︙ のメニューは、既定の移動の項目（上へ・下へ・先頭へ・末尾へ）だけを出す。ほかのリストへの移動などは使う側が menu で足し、
//   hideMoveItems で既定の項目を消して、useSortableItemActions の関数で組み直せる（部品は「〜へ移動」を組み立てない）
// 表の行（render に tr）: つまみの列は部品が足さない。使う側が置きたいセルに SortableHandle を置く（取っ手の列を先頭に置く形が既定の見本）

const sortable = tv({
  slots: {
    // 動きを減らす設定では、キーボードで動かした項目を滑らせない（use-move-animation が長さを読む）
    list: 'flex list-none flex-col p-0 motion-reduce:[--sortable-move-duration:0ms]',
    item: [
      'group/sortable-item relative flex min-h-(--spacing-control) items-center',
      'px-(--spacing-control-x) py-(--sortable-item-py)',
      // つまみは項目の端に重ねて置く（absolute）ので、つまみのある側だけ、つまみの幅と中身とのあいだを空ける
      //   つまみを隠したリスト（hidden）では空けない。1 つだけ止めた項目（invisible）は空けたまま、文の頭をそろえる
      'has-[>*>[data-slot=sortable-handle][data-placement=start]:not([hidden])]:ps-[calc(var(--sortable-handle-width)+var(--sortable-item-gap))]',
      'has-[>*>[data-slot=sortable-handle][data-placement=end]:not([hidden])]:pe-[calc(var(--sortable-handle-width)+var(--sortable-item-gap))]',
      'text-(length:--text-control) leading-(--leading-control) text-fg',
      // 末尾の移動の操作（SortableMoveActions）は、末尾のつまみがあればその手前に、なければ項目の端に接して置く
      '[--sortable-actions-end:calc(var(--spacing-control-x)*-1)] has-[>*>[data-slot=sortable-handle][data-placement=end]:not([hidden])]:[--sortable-actions-end:0px]',
      'bg-(color:--sortable-item-bg) [box-shadow:var(--sortable-item-shadow)]',
      // 入る場所: 中身を消し（場所は残す）、点線の枠だけを見せる。線は寸法を変えないよう内側の outline で描く
      'data-drag-source:[box-shadow:none] data-drag-source:[outline-style:dashed]',
      'data-drag-source:[outline-width:var(--sortable-source-line-width)] data-drag-source:[outline-color:var(--sortable-source-line-color)]',
      'data-drag-source:[outline-offset:calc(var(--sortable-source-line-width)*-1)]',
      // 持ち上げた項目: 白い面・細い輪郭・濃く近い影で、少しだけ大きく。出るときに、置いてあった見た目から持ち上がる
      'data-dragging:z-1 data-dragging:cursor-grabbing data-dragging:bg-(color:--sortable-lifted-bg)',
      'data-dragging:scale-(--sortable-lifted-scale) data-dragging:[box-shadow:var(--sortable-lifted-shadow)]',
      'data-dragging:[transition:scale_var(--duration-press)_var(--ease-press),box-shadow_var(--duration-press)_var(--ease-press)]',
      'data-dragging:starting:scale-100 data-dragging:starting:[box-shadow:var(--sortable-item-shadow)]',
      'motion-reduce:[transition:none]',
    ],
    // 中身（文とつまみ）。入る場所では、文字だけの子もまとめて薄くする
    content: [
      'flex min-w-0 flex-1 items-center gap-(--sortable-item-gap) self-stretch',
      'group-data-drag-source/sortable-item:opacity-0',
    ],
    handle: [
      'absolute inset-y-0 inline-flex cursor-grab touch-none items-center justify-center text-fg-subtle',
      'w-(--sortable-handle-width) rounded-(--sortable-handle-radius)',
      // 項目の端に接した塊で、高さは項目いっぱい（原則8 の端のボタンと同じ考え方）。置く端は placement
      'data-[placement=end]:end-0 data-[placement=start]:start-0',
      // 平らな押すもの: hover で文字の色を淡く敷く（原則3）。押しても沈めない（押したまま引くので、沈むと引き始めがずれて見える）
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'hover:[--flat-bg:var(--color-flat-hover)] active:[--flat-bg:var(--color-flat-press)]',
      'group-data-dragging/sortable-item:cursor-grabbing group-data-dragging/sortable-item:[--flat-bg:transparent]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      // 並べ替えられないとき、つまみは出さない（原則16）。リストごと止めたときは場所も詰める（hidden）。
      //   1 つの項目だけを止めたときは場所を残し、ほかの項目と文の頭をそろえる（visibility で隠すのでフォーカスも止まらない）
      'data-locked:invisible',
      // フォーカスの線は、項目の外へはみ出さないよう内側に引く（原則2: 下に並びを持つ部品は内側）
      ...focusRing,
      '[--focus-ring-offset:calc(var(--focus-ring-width)*-1)]',
    ],
    handleIcon: 'size-(--spacing-icon)',
    // 表の行（SortableItem の render に tr を渡したとき）。面と余白は表のものを使い、並べ替えの状態だけを足す
    row: [
      'group/sortable-item',
      // つまみ・移動の操作だけを入れたセル（取っ手の列・操作の列）は、中身の幅に詰め、左右の余白を持たない
      '[&>td:has(>[data-slot=sortable-handle]:only-child)]:w-px [&>td:has(>[data-slot=sortable-handle]:only-child)]:px-0 [&>td:has(>[data-slot=sortable-handle]:only-child)]:py-0',
      // つまみだけのセルでは、つまみの高さで行を支える（文字の行の高さからはみ出させない。はみ出すと表の枠がスクロールする）
      '[&>td>[data-slot=sortable-handle]:only-child]:my-0',
      '[&>td:has(>[data-slot=sortable-actions]:only-child)]:w-px [&>td:has(>[data-slot=sortable-actions]:only-child)]:px-0 [&>td:has(>[data-slot=sortable-actions]:only-child)]:py-0',
      // 持ち上げた行: セルに面を敷き、行に影を落とす（リストの持ち上げた項目と同じ面と影）。表の行は幅いっぱいに並ぶので、大きくするとはみ出す（列の線もずれる）。形によらず大きくしない
      //   面はセルに置く（dnd-kit が引いている行の背景を消すため）
      'data-dragging:relative data-dragging:z-1 data-dragging:cursor-grabbing',
      'data-dragging:[box-shadow:var(--sortable-lifted-shadow)] data-dragging:*:bg-(color:--sortable-lifted-bg)',
      'data-dragging:[transition:box-shadow_var(--duration-press)_var(--ease-press)]',
      'data-dragging:starting:[box-shadow:none]',
      'motion-reduce:[transition:none]',
      // 入る場所（DragOverlay で写しを描くとき）: セルの中身を消し、点線の枠を残す
      'data-drag-source:[outline-style:dashed] data-drag-source:*:text-transparent data-drag-source:*:*:opacity-0',
      'data-drag-source:[outline-width:var(--sortable-source-line-width)] data-drag-source:[outline-color:var(--sortable-source-line-color)]',
      'data-drag-source:[outline-offset:calc(var(--sortable-source-line-width)*-1)]',
    ],
    // 動かさない行（SortableSeparator）。見出しの文字だけで、上の空きで分ける（Menu のまとまりの見出しと同じ考え方）
    separator: [
      'flex items-center gap-(--sortable-separator-gap)',
      'pt-(--sortable-separator-pt) pb-(--sortable-separator-pb)',
      'text-(length:--text-label) leading-(--leading-label) font-bold text-fg-muted',
    ],
  },
  variants: {
    // 項目の面（ADR-0337）
    variant: {
      // グレーの塗り。入力欄と同じ、書き換えられる値の見た目（原則8）。持ち上げると白い面に変わる
      fill: {
        list: 'gap-(--sortable-gap)',
        item: 'rounded-(--sortable-item-radius) [--sortable-item-bg:var(--color-field)] [--sortable-item-hover-bg:var(--color-field-hover)] [--sortable-item-shadow:none]',
      },
      // 白い面と細い輪郭（既定）。影は付けない（ページと同じレイヤー。原則1）
      card: {
        list: 'gap-(--sortable-gap)',
        item: 'rounded-(--sortable-item-radius) [--sortable-item-bg:var(--color-surface)] [--sortable-item-hover-bg:var(--color-field)] [--sortable-item-shadow:inset_0_0_0_var(--border-width-thin)_var(--color-surface-line)]',
      },
      // 1 つの枠の中で、項目を細い線で区切る（表の行と同じ）
      divided: {
        list: 'rounded-(--sortable-item-radius) border-(length:--border-width-thin) border-line',
        // 枠の中では、見出しの頭を項目の文字の端にそろえ、線は項目と同じ区切りの線（下の辺）だけにする
        separator: [
          'px-(--spacing-control-x) pb-(--sortable-separator-pt) after:hidden',
          'not-last:border-b-(length:--border-width-thin) not-last:border-line',
        ],
        item: [
          '[--sortable-item-bg:var(--color-surface)] [--sortable-item-hover-bg:var(--color-field)] [--sortable-item-shadow:none]',
          'not-last:border-b-(length:--border-width-thin) not-last:border-line',
          'first:rounded-t-[calc(var(--sortable-item-radius)-var(--border-width-thin))] last:rounded-b-[calc(var(--sortable-item-radius)-var(--border-width-thin))]',
          'data-dragging:rounded-(--sortable-item-radius) data-dragging:border-b-0',
        ],
      },
    },
    // 入る場所の塗り（ADR-0339）。outline は点線の枠だけ（既定。地が透ける）、filled は入力欄の塗りの上に点線の枠
    dragSourceVariant: {
      outline: { item: 'data-drag-source:bg-transparent' },
      filled: { item: 'data-drag-source:bg-field' },
    },
    // 表の行のつまみ。行の端に重ねず、置かれたセル（取っ手の列）の中に、部品の高さで置く
    row: {
      // 上下は文字の行の高さからはみ出す分だけ外へ出し、行を高くしない（セルの文字とつまみの中心がそろう）
      true: {
        handle:
          'static my-[calc((1lh-var(--spacing-control))/2)] inline-flex h-(--spacing-control) shrink-0 align-middle',
      },
      false: {},
    },
    // 動かさない行の線（showDivider）。見出しのあとの残りの幅に細い線を引く。文字のない区切りは線だけになる
    showDivider: {
      true: {
        separator: [
          'pt-(--sortable-separator-divider-pt)',
          "after:h-(--border-width-thin) after:flex-1 after:bg-line after:content-['']",
        ],
      },
      false: {},
    },
    // 並べ替えの動き（ADR-0341）。slide は元の位置から滑らせる（既定）、none は動かさない
    motion: {
      slide: {},
      none: { list: '[--sortable-move-duration:0ms]' },
    },
    // どこをつかんで引くか。item は項目のどこをつかんでも引ける（つまみは、キーボードの口と目印として残す）
    //   item では項目全体が押すものになるので、hover で面を半段濃くする（原則3。入力欄と同じ手応え）
    grabArea: {
      handle: {},
      item: {
        row: 'cursor-grab data-disabled:cursor-default',
        item: [
          'cursor-grab [transition:background-color_var(--duration-press)_var(--ease-press)] motion-reduce:[transition:none]',
          'not-data-disabled:not-data-drag-source:not-data-dragging:hover:bg-(color:--sortable-item-hover-bg)',
          'data-disabled:cursor-default',
        ],
      },
    },
  },
  defaultVariants: {
    variant: 'card',
    grabArea: 'handle',
    dragSourceVariant: 'outline',
    motion: 'slide',
    showDivider: false,
  },
});

/** 項目の面の見せ方 */
export type SortableVariant = NonNullable<VariantProps<typeof sortable>['variant']>;
/** どこをつかんで引くか */
export type SortableGrabArea = NonNullable<VariantProps<typeof sortable>['grabArea']>;
/** 入る場所の見せ方 */
export type SortableDragSourceVariant = NonNullable<
  VariantProps<typeof sortable>['dragSourceVariant']
>;
/** 並べ替えの動き */
export type SortableMotion = NonNullable<VariantProps<typeof sortable>['motion']>;

export interface SortableProps extends Omit<
  ComponentProps<'ul'>,
  'defaultValue' | 'onChange' | 'children'
> {
  /** 項目の並び。SortableItem の value を、いまの順に並べた配列です */
  value: string[];
  /** キーボードで並べ替えたときに、新しい並びを渡して呼びます。ポインタで引く並べ替えは、使う側がエンジンの知らせから value を更新します */
  onValueChange?: (value: string[]) => void;
  /**
   * 項目の面。card は白い面と細い輪郭、fill は入力欄と同じグレーの塗り、divided は 1 つの枠の中で細い線で区切ります
   * @default 'card'
   */
  variant?: SortableVariant;
  /**
   * 並べ替えの途中で、持ち上げた項目が入る場所の見せ方。outline は点線の枠だけ、filled は淡いグレーの面に点線の枠です
   * @default 'outline'
   */
  dragSourceVariant?: SortableDragSourceVariant;
  /**
   * 並べ替えたときの動き。slide は動いた項目を元の位置から滑らせ、none は動かさずに入れ替えます。動きを減らす設定では、slide でも動かしません。
   * エンジン（dnd-kit）の動きも同じ長さにそろえます（Recipes/Sortable）
   * @default 'slide'
   */
  motion?: SortableMotion;
  /**
   * どこをつかんで引くか。handle はつまみだけ、item は項目のどこでも引けます。見た目（手の形のカーソル）を合わせるだけなので、エンジンにも同じ指定をします。
   * item では、指でリストの上をスクロールしようとしたときにも引き始めることがあります
   * @default 'handle'
   */
  grabArea?: SortableGrabArea;
  /**
   * 並べ替えられなくします。つまみを隠します
   * @default false
   */
  disabled?: boolean;
  /**
   * キーボードで動かしたあとに読み上げる文。位置（1 から数える）と項目の数を受けます
   * @default (position, total) => `${position} 番目に移しました（${total} 件中）`
   */
  movedText?: (position: number, total: number) => string;
  /**
   * つまみの説明として読み上げる、キーボードでの動かし方
   * @default '上下の矢印キーで並べ替えます'
   */
  instructionText?: string;
  /**
   * 引かずに並べ替える操作。ポインタだけでも、引かずに並べ替えを終えられるようにします（WCAG 2.2 の 2.5.7）。
   * item-menu は項目の末尾の ︙ から（上へ・下へ・先頭へ・末尾へ）、buttons は項目の末尾の「上へ」「下へ」のボタンで動かします。none は出しません
   * @default 'none'
   */
  moveActions?: SortableMoveActions;
  /**
   * 1 つ上へ動かす操作の文字。buttons のボタンの読み上げでは、項目の名前（SortableItem の accessibleName）を前に付けます
   * @default '上へ移動'
   */
  moveUpLabel?: string;
  /**
   * 1 つ下へ動かす操作の文字
   * @default '下へ移動'
   */
  moveDownLabel?: string;
  /**
   * 先頭へ動かす操作の文字
   * @default '先頭へ移動'
   */
  moveFirstLabel?: string;
  /**
   * 末尾へ動かす操作の文字
   * @default '末尾へ移動'
   */
  moveLastLabel?: string;
  /**
   * item-menu の ︙ のボタンの読み上げの名前と、シートで開いたときの題。項目の名前（SortableItem の accessibleName）を前に付けます（「下書きを書くを移動」）
   * @default '移動'
   */
  moveMenuName?: string;
  /**
   * item-menu の ︙ のメニューに、既定の移動の項目（上へ・下へ・先頭へ・末尾へ）を出しません。
   * SortableItem の menu に、自分で組んだ項目を渡します。動かす関数は useSortableItemActions から読みます
   * @default false
   */
  hideMoveItems?: boolean;
  /** 項目（SortableItem）を value の順に並べます */
  children?: ReactNode;
  /** 一覧の要素（ul）に付きます */
  className?: string;
}

/**
 * 並べ替えられるリスト
 *
 * 見た目とキーボードでの並べ替えを持ちます。ポインタで引く動きは持たないので、dnd-kit などとつなぎます（Recipes/Sortable）。
 */
export function Sortable({
  value,
  onValueChange,
  variant = 'card',
  dragSourceVariant = 'outline',
  motion = 'slide',
  grabArea = 'handle',
  disabled = false,
  movedText = defaultMovedText,
  instructionText = '上下の矢印キーで並べ替えます',
  moveActions = 'none',
  moveUpLabel = '上へ移動',
  moveDownLabel = '下へ移動',
  moveFirstLabel = '先頭へ移動',
  moveLastLabel = '末尾へ移動',
  moveMenuName = '移動',
  hideMoveItems = false,
  className,
  children,
  ref,
  ...props
}: SortableProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const mergedRef = useMergedRefs(ref, listRef);
  const instructionId = useId();
  const { context, announcement } = useSortableList(listRef, {
    value,
    onValueChange,
    variant,
    dragSourceVariant,
    grabArea,
    disabled,
    instructionId,
    movedText,
    moveActions,
    labels: {
      up: moveUpLabel,
      down: moveDownLabel,
      first: moveFirstLabel,
      last: moveLastLabel,
      menu: moveMenuName,
    },
    hideMoveItems,
  });
  const { list } = sortable({ variant, motion });
  return (
    <ListContext value={context}>
      <ul ref={mergedRef} className={list({ className })} {...props}>
        {children}
      </ul>
      <span id={instructionId} hidden>
        {instructionText}
      </span>
      <VisuallyHidden role="status">{announcement}</VisuallyHidden>
    </ListContext>
  );
}

export interface SortableItemProps extends Omit<ComponentProps<'li'>, 'value'> {
  /** この項目を見分ける値。Sortable の value に並べる値です */
  value: string;
  /**
   * ポインタについて動く、持ち上げた項目の見た目にします。エンジンが引いているあいだに描く写し（dnd-kit の DragOverlay の中身）に付けます。
   * 表の行では、引いている行そのもの（dnd-kit の isDragging）に付けます
   * @default false
   */
  dragging?: boolean;
  /**
   * 並べ替えの途中で、持ち上げた項目が入る場所の見た目にします。中身を消して枠だけを残します（dnd-kit の isDragSource）
   * @default false
   */
  dragSource?: boolean;
  /**
   * この項目だけを動かせなくします。つまみを隠します
   * @default false
   */
  disabled?: boolean;
  /**
   * 項目の読み上げの名前（「下書きを書く」）。項目そのものには付けず、つまみと移動のボタンの名前に入れて、どの項目を動かすかを伝えます
   * （「下書きを書くを並べ替え」「下書きを書くを上へ移動」）
   */
  accessibleName?: string;
  /**
   * ︙ のメニュー（Sortable の moveActions="item-menu"）に足す項目（MenuItem を並べる）。既定の移動の操作のあとに、区切り線を挟んで並べます。
   * ほかのリストへの移動・複製・削除のような、その項目だけの操作を入れます。Sortable の hideMoveItems では、これがメニューの中身のすべてになります
   */
  menu?: ReactNode;
  /**
   * 描く要素（Base UI の render と同じ）。表の行にするときは `render={<DataTableRow />}` か `render={<tr />}` を渡し、SortableTableBody の中に置きます。
   * 行では、中身をそのまま行に入れます（セルを並べます）。つまみ（SortableHandle）と移動の操作（SortableItemActions）は、置きたいセルの中に入れます
   */
  render?: ReactElement;
  /** 項目の中身。文と、つまみ（SortableHandle）を入れます。つまみを置く端は SortableHandle の placement で決めます */
  children?: ReactNode;
  /** 項目の要素（li。render を渡したときはその要素）に付きます */
  className?: string;
}

/**
 * 並べ替えられるリストの項目
 */
export function SortableItem({
  value,
  dragging = false,
  dragSource = false,
  disabled = false,
  accessibleName,
  menu,
  render,
  className,
  children,
  ref,
  ...props
}: SortableItemProps) {
  const listContext = use(ListContext);
  const styles = sortable({
    variant: listContext?.variant,
    grabArea: listContext?.grabArea,
    dragSourceVariant: listContext?.dragSourceVariant,
  });
  const itemDisabled = disabled || (listContext?.disabled ?? false);
  const row = render != null;
  // リストの項目は、何番目・何件中を value の並びから付ける（間に挟んだ区切りの行を数えない）
  //   表の行（tr）には付けない（行の位置は表が持つ）
  const position = listContext == null || row ? -1 : listContext.order.indexOf(value);
  const itemContext = useMemo(
    () => ({ value, locked: disabled, name: accessibleName, menu, row }),
    [value, disabled, accessibleName, menu, row]
  );
  const element = useRender({
    render,
    defaultTagName: 'li',
    ref,
    props: {
      ...props,
      className: row ? styles.row({ className }) : styles.item({ className }),
      'data-value': value,
      'aria-posinset': position < 0 ? undefined : position + 1,
      'aria-setsize': position < 0 ? undefined : listContext?.order.length,
      'data-dragging': dragging || undefined,
      'data-drag-source': (dragSource && !dragging) || undefined,
      'data-disabled': itemDisabled || undefined,
      children: row ? (
        children
      ) : (
        <>
          <div className={styles.content()}>{children}</div>
          <ItemMoveActions />
        </>
      ),
    },
  });
  return <ItemContext value={itemContext}>{element}</ItemContext>;
}

export interface SortableItemActionsProps {
  /** 包む要素（div）に付きます */
  className?: string;
}

/**
 * 項目の移動の操作（Sortable の moveActions）を、置きたい場所に置きます。表の行（SortableItem の render）で、操作の列のセルに入れます。
 * リストの項目では、項目の末尾に自動で置くので要りません
 */
export function SortableItemActions({ className }: SortableItemActionsProps) {
  return <ItemMoveActions className={className} />;
}

export interface SortableSeparatorProps extends ComponentProps<'li'> {
  /**
   * 見出しのあとの残りの幅に、細い線を引きます。variant="divided" では、項目と同じ区切りの線で分けるので使いません
   * @default false
   */
  showDivider?: boolean;
  /** 見出しの文字（「明日」「ここから下は公開しない」）。書かないときは showDivider を付け、線だけの区切りにします */
  children?: ReactNode;
  /** 区切りの要素（li）に付きます */
  className?: string;
}

/**
 * 並びの途中に挟む、動かさない行（区切りや見出し）。Sortable の value には入れず、項目のあいだに置きます。
 * 項目はキーボードや移動の操作で、区切りをまたいで動きます。区切りの位置は、使う側が並びのどこに描くかで決めます
 */
export function SortableSeparator({
  showDivider = false,
  children,
  className,
  ...props
}: SortableSeparatorProps) {
  const listContext = use(ListContext);
  const { separator } = sortable({ variant: listContext?.variant, showDivider });
  const hasLabel = children != null && children !== false;
  return (
    <li
      role={hasLabel ? undefined : 'separator'}
      data-slot="sortable-separator"
      className={separator({ className })}
      {...props}
    >
      {children}
    </li>
  );
}

/** つまみを置く端 */
export type SortableHandlePlacement = 'start' | 'end';

export interface SortableHandleProps extends Omit<ComponentProps<'button'>, 'children'> {
  /**
   * つまみを置く端。start は項目の先頭（左）、end は末尾（右）です。引いているあいだの写しにも同じ値を渡します
   * @default 'start'
   */
  placement?: SortableHandlePlacement;
  /**
   * つまみの読み上げの名前。書かないときは、SortableItem の accessibleName から「〇〇を並べ替え」を作ります。どちらもないときは「並べ替え」です
   */
  accessibleName?: string;
  /** つまみのボタン（button）に付きます */
  className?: string;
}

/**
 * 項目をつかむつまみ。キーボードでは、フォーカスして上下の矢印キーで動かします
 */
export function SortableHandle({
  accessibleName,
  placement = 'start',
  className,
  ref,
  onKeyDown,
  ...props
}: SortableHandleProps) {
  const listContext = use(ListContext);
  const itemContext = use(ItemContext);
  const handleRef = useRef<HTMLButtonElement>(null);
  const mergedRef = useMergedRefs(ref, handleRef);
  const itemValue = itemContext?.value;
  const itemName = itemContext?.name;
  const name = accessibleName ?? (itemName ? `${itemName}を並べ替え` : '並べ替え');

  // キーボードや移動の操作で動かした項目は、描き直しで要素が並べ替わるとフォーカスを失うことがあるので、戻す
  useLayoutEffect(() => {
    const element = handleRef.current;
    if (!element || !listContext?.claimFocus(itemValue)) return;
    if (document.activeElement !== element) element.focus();
    element.scrollIntoView?.({ block: 'nearest' });
  });

  const { handle, handleIcon } = sortable({ row: itemContext?.row ?? false });
  return (
    <button
      ref={mergedRef}
      type="button"
      aria-label={name}
      aria-describedby={listContext?.instructionId}
      hidden={listContext?.disabled}
      data-locked={itemContext?.locked || undefined}
      data-placement={placement}
      className={handle({ className })}
      data-slot="sortable-handle"
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        // 動かせない項目（項目の disabled・リストの disabled）は、フォーカスが残っていても動かさない
        if (
          event.defaultPrevented ||
          !listContext ||
          listContext.disabled ||
          itemContext?.locked ||
          itemValue === undefined
        )
          return;
        const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
        if (!delta) return;
        event.preventDefault();
        const index = listContext.order.indexOf(itemValue);
        listContext.moveTo(itemValue, index + delta);
      }}
    >
      <DotsSixVerticalIcon className={handleIcon()} />
    </button>
  );
}

// Phosphor Icons の DotsSixVertical（Fill。MIT License、著作権表示は src/internal/icons.tsx）
function DotsSixVerticalIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className={className}>
      <circle cx="92" cy="60" r="16" />
      <circle cx="164" cy="60" r="16" />
      <circle cx="92" cy="128" r="16" />
      <circle cx="164" cy="128" r="16" />
      <circle cx="92" cy="196" r="16" />
      <circle cx="164" cy="196" r="16" />
    </svg>
  );
}
