'use client';

import { Menubar as BaseMenubar } from '@base-ui/react/menubar';
import { type ComponentProps, createContext, type ReactNode, use } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import type { ButtonProps } from '../button/Button';
import { Menu, type MenuProps } from '../menu/Menu';

// Menubar: アプリの上に並ぶ「ファイル・編集・表示…」のメニューの帯（Base UI の Menubar）
//   振る舞いは Base UI: 帯の中は矢印キーで動き（Tab では帯に 1 回だけ止まる）、1 つ開いているあいだは
//   隣のトリガーに載せる・左右の矢印キーで隣のメニューへ移る
//   開いた中身は Menu の面と項目をそのまま使う（MenubarMenu は Menu に、帯のトリガーを渡したもの）
//   帯（軸 541）: 面を持たない（枠・塗り・余白なし）。帯を置く場所の面にそのまま並べる。面が要るときは className で敷く
//   トリガー（軸 542）: 平らな押すもの（原則3）。角は部品の角（押して開くボタンなので pill にしない — 原則5）
//     hover は色を淡く敷き、押すと沈む（Navbar の行き先と同じ手応え。塗りは --flat-bg に置く — ADR-0112）
//     size="sm" は Button の sm と同じく、高さ・文字を自分の中だけ小さい段に差し替える（軸 542）
//   開いているトリガー（軸 543）: 押下と同じ濃さの塗りを残す（hover より一段濃く、隣を hover していても見分けられる）
//     色は Button と同じ color の語彙。hover・押下・開いているときに敷く色と、開いているときの文字の色を変える
//   押せないトリガー: 押せない文字の色（Menu の押せない項目と同じ）。hover・押下の手応えを返さない
const menubar = tv({
  slots: {
    root: 'flex items-center [--menubar-ink:var(--color-fg)]',
    trigger: [
      'relative inline-flex h-(--spacing-control) shrink-0 cursor-pointer items-center rounded-control px-3 whitespace-nowrap text-fg outline-none select-none',
      'text-(length:--text-control) leading-(--leading-control)',
      // 塗り: ふだんは透明、開いているあいだは押下と同じ濃さ。hover と押下は、その上に色を淡く敷く
      'bg-(color:--flat-bg) [--flat-bg:var(--menubar-rest)] [--menubar-rest:transparent]',
      'not-data-disabled:hover:[--flat-bg:color-mix(in_oklab,var(--menubar-ink)_var(--flat-hover-mix),var(--menubar-rest))]',
      'not-data-disabled:active:translate-y-(--flat-press-depth) not-data-disabled:active:[--flat-bg:color-mix(in_oklab,var(--menubar-ink)_var(--flat-press-mix),var(--menubar-rest))]',
      'data-popup-open:text-(color:--menubar-ink) data-popup-open:[--menubar-rest:color-mix(in_oklab,var(--menubar-ink)_var(--flat-press-mix),transparent)]',
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
    color: {
      neutral: '',
      primary: { root: '[--menubar-ink:var(--color-primary)]' },
      secondary: { root: '[--menubar-ink:var(--color-fg-secondary)]' },
      danger: { root: '[--menubar-ink:var(--color-fg-danger)]' },
    },
    // 大きさの段（Button の size と同じ）。sm は密度の寸法を自分の中だけ小さい段に差し替える。密度では変えない
    size: {
      md: '',
      sm: {
        root: [
          '[--spacing-control:var(--spacing-control-sm)]',
          '[--leading-control:var(--leading-control-sm)] [--text-control:var(--text-control-sm)]',
        ],
      },
    },
  },
  defaultVariants: { orientation: 'horizontal', color: 'neutral', size: 'md' },
});

export type MenubarOrientation = 'horizontal' | 'vertical';
export type MenubarColor = Exclude<NonNullable<ButtonProps['color']>, 'white'>;
export type MenubarSize = 'md' | 'sm';

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
   * hover・押下・開いているトリガーに敷く色（Button の color と同じ語彙。white は取りません）。
   * 開いているトリガーは、押したときと同じ濃さでこの色を敷き、文字もこの色にします
   * @default 'neutral'
   */
  color?: MenubarColor;
  /**
   * 大きさ。sm は帯を低く詰めたいときの、一段小さいトリガーです。
   * 指で操作するときも同じ大きさで、押せる高さ（44px）より低くなります。指で押すことが多い画面には md を使います
   * @default 'md'
   */
  size?: MenubarSize;
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
  /** いちばん外の要素（role="menubar"）に足すクラス。帯に面が要るときは、ここで背景や余白を敷きます */
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
  color = 'neutral',
  size = 'md',
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
      className={menubar({ orientation, color, size }).root({ class: className })}
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
