'use client';

import { Menubar as BaseMenubar } from '@base-ui/react/menubar';
import { type ComponentProps, createContext, type ReactNode, use } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import { Menu, type MenuProps } from '../menu/Menu';

// Menubar: アプリの上に並ぶ「ファイル・編集・表示…」のメニューの帯（Base UI の Menubar）
//   振る舞いは Base UI: 帯の中は矢印キーで動き（Tab では帯に 1 回だけ止まる）、1 つ開いているあいだは
//   隣のトリガーに載せる・左右の矢印キーで隣のメニューへ移る
//   開いた中身は Menu の面と項目をそのまま使う（MenubarMenu は Menu に、帯のトリガーを渡したもの）
//   帯（軸 541）: 既定は面を持たない（帯を置く場所の面にそのまま並べる）。面・輪郭・余白はトークンで変えられる
//   トリガー（軸 542）: 平らな押すもの（原則3）。角は部品の角（押して開くボタンなので pill にしない — 原則5）
//     hover は文字の色を淡く敷き、押すと沈む（Navbar の行き先と同じ手応え。塗りは --flat-bg に置く — ADR-0112）
//     帯に余白があるときは、角を帯の角から余白を引いた同心の角にする（原則5）
//   開いているトリガー（軸 543）: 既定は押下と同じ濃さの塗り（hover より一段濃く、隣を hover していても見分けられる）
//   押せないトリガー: 押せない文字の色（Menu の押せない項目と同じ）。hover・押下の手応えを返さない
const menubar = tv({
  slots: {
    root: [
      'flex items-center',
      'rounded-(--menubar-radius) border-(length:--menubar-line-width) border-(color:--menubar-line) bg-(color:--menubar-bg) p-(--menubar-padding)',
    ],
    trigger: [
      'relative inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap outline-none select-none',
      'h-[var(--menubar-trigger-height,var(--spacing-control))] px-(--menubar-trigger-padding-x)',
      'text-[length:var(--menubar-trigger-text,var(--text-control))] leading-[var(--menubar-trigger-leading,var(--leading-control))]',
      '[font-weight:var(--menubar-trigger-weight)] text-(color:--menubar-trigger-fg)',
      'rounded-[calc(var(--menubar-radius)-var(--menubar-padding))]',
      // 塗り: ふだんは透明、開いているあいだは --menubar-trigger-open-bg。hover と押下は、その上に本文の色を淡く敷く
      'bg-(color:--flat-bg) [--flat-bg:var(--menubar-trigger-rest)] [--menubar-trigger-rest:transparent]',
      'not-data-disabled:hover:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),var(--menubar-trigger-rest))]',
      'not-data-disabled:active:translate-y-(--flat-press-depth) not-data-disabled:active:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),var(--menubar-trigger-rest))]',
      // 開いているあいだの印: 塗り・文字の色・太さと、文字の下の線（線の太さが 0 のときは引かない）
      'data-popup-open:text-(color:--menubar-trigger-open-fg) data-popup-open:[--menubar-trigger-rest:var(--menubar-trigger-open-bg)]',
      'data-popup-open:[font-weight:var(--menubar-trigger-open-weight,var(--menubar-trigger-weight))]',
      "data-popup-open:after:pointer-events-none data-popup-open:after:absolute data-popup-open:after:inset-x-(--menubar-trigger-padding-x) data-popup-open:after:bottom-1 data-popup-open:after:h-(--menubar-trigger-open-bar) data-popup-open:after:rounded-pill data-popup-open:after:bg-(color:--menubar-trigger-open-bar-color) data-popup-open:after:content-['']",
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled)',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
    ],
  },
  variants: {
    orientation: {
      horizontal: { root: 'flex-row' },
      vertical: { root: 'flex-col items-stretch', trigger: 'justify-start' },
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export type MenubarOrientation = 'horizontal' | 'vertical';

// 帯の向き。縦の帯のメニューは、既定で右に開く
const MenubarOrientationContext = createContext<MenubarOrientation>('horizontal');

export interface MenubarProps {
  /** メニュー。MenubarMenu を並べます */
  children?: ReactNode;
  /** 読み上げの名前。画面には出ません（帯が何のメニューかを伝えます） */
  accessibleName?: string;
  /**
   * 向き。horizontal は横に並べて左右の矢印キーで動き、vertical は縦に積んで上下の矢印キーで動きます
   * @default 'horizontal'
   */
  orientation?: MenubarOrientation;
  /**
   * 帯ごと押せないか
   * @default false
   */
  disabled?: boolean;
  /**
   * メニューを開いているあいだ、ほかの部分の操作とページのスクロールを止めるか
   * @default true
   */
  modal?: boolean;
  /**
   * 端のトリガーで矢印キーを押したとき、反対の端へ回るか
   * @default true
   */
  loopFocus?: boolean;
  /** いちばん外の要素（role="menubar"）に足すクラス */
  className?: string;
}

/**
 * アプリの上に並ぶ、メニューの帯（ファイル・編集・表示…）。MenubarMenu を並べます。
 * 1 つ開いているあいだは、隣のトリガーに載せるか左右の矢印キーで、隣のメニューへ移ります
 */
export function Menubar({
  children,
  accessibleName,
  orientation = 'horizontal',
  disabled = false,
  modal = true,
  loopFocus = true,
  className,
}: MenubarProps) {
  return (
    <BaseMenubar
      aria-label={accessibleName}
      orientation={orientation}
      disabled={disabled}
      modal={modal}
      loopFocus={loopFocus}
      data-slot="menubar"
      className={menubar({ orientation }).root({ class: className })}
    >
      <MenubarOrientationContext value={orientation}>{children}</MenubarOrientationContext>
    </BaseMenubar>
  );
}

export interface MenubarMenuProps extends Omit<
  MenuProps,
  'trigger' | 'modal' | 'openOnHover' | 'openDelay' | 'closeDelay' | 'title' | 'side'
> {
  /** 帯に並ぶトリガーの文字（ファイル・編集など）。開いたメニューの名前にもなります */
  label: ReactNode;
  /**
   * 題。シートで出すときに見出しに出します。書かないときは label を出します
   */
  title?: ReactNode;
  /**
   * トリガーのどちら側に出すか。画面の端に当たるときは反対側に出します
   * @default 横の帯では 'bottom'、縦の帯では 'right'
   */
  side?: MenuProps['side'];
  /** トリガー（button）に足す props（id・data-*・aria-* など） */
  triggerProps?: Omit<ComponentProps<'button'>, 'children' | 'disabled'> & {
    [data: `data-${string}`]: string | undefined;
  };
}

/**
 * Menubar の中の 1 つのメニュー。label がトリガーの文字になり、押すと中身（MenuItem・MenuCheckboxItem・
 * MenuRadioGroup・MenuGroup・MenuSeparator・MenuSubmenu）を開きます。中身と見た目の props は Menu と同じです
 */
export function MenubarMenu({
  label,
  title,
  side,
  triggerProps,
  children,
  ...menuProps
}: MenubarMenuProps) {
  const orientation = use(MenubarOrientationContext);
  const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {};
  return (
    <Menu
      {...menuProps}
      title={title ?? label}
      side={side ?? (orientation === 'vertical' ? 'right' : 'bottom')}
      trigger={
        <button
          type="button"
          {...restTriggerProps}
          data-slot="menubar-trigger"
          className={menubar({ orientation }).trigger({ class: triggerClassName })}
        >
          {label}
        </button>
      }
    >
      {children}
    </Menu>
  );
}
