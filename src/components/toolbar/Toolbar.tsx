'use client';

import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { Button, type ButtonIconOnlyProps, type ButtonProps } from '../button/Button';
import { Link, type LinkProps } from '../link/Link';
import { Toggle, type ToggleIconOnlyProps, type ToggleProps } from '../toggle/Toggle';
import { ScrollFrame } from '../../internal/ScrollFrame';
import {
  ToolbarSlotContext,
  type ToolbarSlots,
  useToolbarSlots,
} from '../../internal/toolbar-slot';
import { tv } from '../../internal/tv';

// Toolbar: ボタン・トグル・区切り・欄を 1 本の帯に並べ、矢印キーで移る（Base UI の Toolbar。role="toolbar"）
//   Tab で止まるのは帯の中の 1 つだけで、帯の中は矢印キーで移る（ロービングタブインデックス）。ButtonGroup は Tab で 1 つずつ移る素の並び
//   中の項目は、既存の部品を Base UI の Toolbar.Button・Toolbar.Link の render でつないだもの（ToolbarButton・ToolbarToggle・ToolbarLink）
//     ToggleGroup は、Base UI がツールバーの中を見分けて、中の Toggle をそのまま矢印キーの並びに入れる
//     SelectControl・TextFieldControl（SearchFieldControl など）は、この部品が配る口（internal/toolbar-slot）で自分の本体を包む
//     Menu・Popover の開く口は ToolbarButton を trigger に渡す
//   帯はページと同じレイヤーで、影を持たない（原則1）。面は細い線の枠と内側の余白、角は中の部品の角に余白を足した同心の角（原則5）
//     帯の面・項目の間と区切り・はみ出したときの扱いは比べている途中（軸 551〜553）
//   押せない項目は、押せないボタンの見た目のまま矢印キーで止まる（押せない理由を Tooltip で出せるように — 原則13）。
//     Toggle と欄は押せないとき本体が止まれない（disabled 属性）ので、矢印キーで飛ばす
const toolbar = tv({
  slots: {
    // 帯の面（枠線・塗り・角）。折り返すときは帯そのもの、スクロールするときはスクロールの枠に付く
    band: [
      'rounded-(--toolbar-radius) border-(length:--toolbar-border-width) border-solid border-line bg-(color:--toolbar-bg)',
    ],
    // 項目の並び（role="toolbar"）
    list: [
      'flex items-center gap-(--toolbar-gap) p-(--toolbar-padding)',
      'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
    ],
  },
  variants: {
    wrap: {
      true: { list: 'flex-wrap' },
      false: { list: 'flex-nowrap' },
    },
    // 横の帯は置いた場所の幅いっぱいに伸び、縦の帯は中身の幅に合わせる
    orientation: {
      horizontal: {},
      vertical: { band: 'w-fit' },
    },
  },
  defaultVariants: { wrap: true, orientation: 'horizontal' },
});

// 項目のまとまり。まとまりの中は折り返さず、まとまりごと次の行へ送る
const groupStyles = tv({
  base: [
    'flex shrink-0 items-center gap-(--toolbar-gap)',
    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  ],
});

// 区切りの線。横の帯では縦の線（項目の高さから上下を縮める）、縦の帯では横の線
//   Base UI の Separator は、帯と逆の向きを data-orientation に書く
const separator = tv({
  base: [
    'shrink-0 self-stretch border-0 border-solid border-line',
    'data-[orientation=vertical]:mx-(--toolbar-separator-space) data-[orientation=vertical]:my-(--toolbar-separator-inset) data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l-(length:--border-width-thin)',
    'data-[orientation=horizontal]:mx-(--toolbar-separator-inset) data-[orientation=horizontal]:my-(--toolbar-separator-space) data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:border-t-(length:--border-width-thin)',
  ],
});

// 欄（Select・TextField）を項目として包む口。欄の本体は部品の中で組むので、ここで包む要素を渡す
//   帯・まとまりの disabled は Field が読み、中の欄を押せない見た目にする（Base UI の disabled は Trigger・input にしか届かない）
const slotParts = {
  button: (element: ReactElement, disabled: boolean) => (
    <BaseToolbar.Button disabled={disabled} focusableWhenDisabled={false} render={element} />
  ),
  input: (disabled: boolean) => (
    <BaseToolbar.Input disabled={disabled} focusableWhenDisabled={false} />
  ),
};
const enabledSlots: ToolbarSlots = { ...slotParts, disabled: false };
const disabledSlots: ToolbarSlots = { ...slotParts, disabled: true };

/** 帯の向き */
export type ToolbarOrientation = 'horizontal' | 'vertical';

export interface ToolbarProps extends Omit<ComponentProps<'div'>, 'dir'> {
  /**
   * 帯の向き。horizontal は左右の矢印キー、vertical は上下の矢印キーで項目を移ります
   * @default 'horizontal'
   */
  orientation?: ToolbarOrientation;
  /**
   * 端の項目で矢印キーを押したとき、反対の端へ回るか
   * @default true
   */
  loopFocus?: boolean;
  /**
   * 帯の項目をすべて押せなくします
   * @default false
   */
  disabled?: boolean;
  /**
   * 入りきらないときに次の行へ折り返します。false では 1 行のまま、はみ出した分を横にスクロールし、続きのある端に内側の影を落とします。
   * まとまり（ToolbarGroup）の中は折り返さず、まとまりごと次の行へ送ります
   * @default true
   */
  wrap?: boolean;
  /** 帯の読み上げの名前（aria-label）。画面に帯が 2 つ以上あるときや、見出しが近くにないときに付けます */
  'aria-label'?: string;
  /** 帯の面（枠線のある要素）に付きます。wrap={false} では、スクロールの枠に付きます */
  className?: string;
  /** 並べる項目（ToolbarButton・ToolbarToggle・ToolbarLink・ToolbarGroup・ToolbarSeparator・ToggleGroup・SelectControl・SearchFieldControl など） */
  children?: ReactNode;
}

/**
 * ボタン・トグル・欄を 1 本の帯に並べます。Tab で止まるのは帯の中の 1 つだけで、帯の中は矢印キーで移ります。
 * 中には ToolbarButton・ToolbarToggle・ToolbarLink を置きます。ToggleGroup・SelectControl・SearchFieldControl はそのまま置けます。
 * Menu などの開く口は、ToolbarButton を trigger に渡します
 */
export function Toolbar({
  orientation = 'horizontal',
  loopFocus = true,
  disabled = false,
  wrap = true,
  className,
  children,
  ...props
}: ToolbarProps) {
  const s = toolbar({ wrap, orientation });
  const list = (
    <BaseToolbar.Root
      {...props}
      orientation={orientation}
      loopFocus={loopFocus}
      disabled={disabled}
      data-slot="toolbar"
      className={wrap ? s.band({ className: [s.list(), className] }) : s.list()}
    >
      {children}
    </BaseToolbar.Root>
  );
  return (
    <ToolbarSlotContext value={disabled ? disabledSlots : enabledSlots}>
      {wrap ? (
        list
      ) : (
        // はみ出した分はスクロールし、続きのある端に内側の影を落とす（原則1）。枠そのものは止まり先にしない
        <ScrollFrame
          slot="toolbar-frame"
          focusable={false}
          orientation={orientation}
          className={s.band({ className })}
        >
          {list}
        </ScrollFrame>
      )}
    </ToolbarSlotContext>
  );
}

export interface ToolbarGroupProps extends Omit<ComponentProps<'div'>, 'dir'> {
  /**
   * まとまりの項目をすべて押せなくします
   * @default false
   */
  disabled?: boolean;
  /** まとまりの読み上げの名前（aria-label）。「文字の書式」のように、まとまりの働きを書きます */
  'aria-label'?: string;
  /** まとまりの要素（div）に付きます */
  className?: string;
  /** まとめる項目 */
  children?: ReactNode;
}

/** 帯の中の項目をまとめます。まとまりの中は折り返さず、まとまりごと次の行へ送ります */
export function ToolbarGroup({ disabled = false, className, ...props }: ToolbarGroupProps) {
  const outer = useToolbarSlots();
  const group = (
    <BaseToolbar.Group {...props} disabled={disabled} className={groupStyles({ className })} />
  );
  // まとまりごと押せないときは、中の欄（Select・SearchField）にも伝える
  return disabled && !outer?.disabled ? (
    <ToolbarSlotContext value={disabledSlots}>{group}</ToolbarSlotContext>
  ) : (
    group
  );
}

export interface ToolbarSeparatorProps extends Omit<ComponentProps<'div'>, 'children' | 'dir'> {
  /** 線の要素（div）に付きます */
  className?: string;
}

/** 帯の中の項目のあいだに引く区切りの線です。横の帯では縦の線、縦の帯では横の線になります */
export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return <BaseToolbar.Separator {...props} className={separator({ className })} />;
}

/** 帯の中のボタンの props。Button の props から、キャプション（caption）を除いたものです */
export type ToolbarButtonProps = Omit<ButtonProps, 'caption'>;
/** 帯の中のアイコンだけのボタンの props。読み上げの名前（aria-label）が要ります */
export type ToolbarButtonIconOnlyProps = Omit<ButtonIconOnlyProps, 'caption'>;

/**
 * 帯の中に置くボタンです。見た目と props は Button と同じで、帯の矢印キーの並びに入ります。
 * 押せないときも矢印キーで止まり（focusableWhenDisabled の既定が true）、押せない理由を Tooltip で出せます。
 * Menu・Popover の開く口にするときは、この部品を trigger に渡します（`<Menu trigger={<ToolbarButton>…</ToolbarButton>}>`）
 */
export function ToolbarButton(props: ToolbarButtonIconOnlyProps): ReactElement;
export function ToolbarButton(props: ToolbarButtonProps): ReactElement;
export function ToolbarButton({
  disabled,
  focusableWhenDisabled = true,
  ref,
  ...props
}: ToolbarButtonProps | ToolbarButtonIconOnlyProps) {
  // disabled は Base UI に渡し、帯・まとまりの disabled と合わせたものを Base UI が Button へ渡す
  return (
    <BaseToolbar.Button
      ref={ref}
      disabled={disabled}
      focusableWhenDisabled={focusableWhenDisabled}
      render={
        <Button
          {...(props as ButtonProps)}
          focusableWhenDisabled={focusableWhenDisabled}
          data-slot="toolbar-button"
        />
      }
    />
  );
}

/** 帯の中のトグルの props。Toggle の props から、ToggleGroup の中で使う value を除いたものです */
export type ToolbarToggleProps = Omit<ToggleProps, 'value'>;
/** 帯の中のアイコンだけのトグルの props。読み上げの名前（aria-label）が要ります */
export type ToolbarToggleIconOnlyProps = Omit<ToggleIconOnlyProps, 'value'>;

/**
 * 帯の中に 1 つだけ置くトグルです。見た目と props は Toggle と同じで、帯の矢印キーの並びに入ります。
 * いくつかのトグルから選ぶときは、ToggleGroup に Toggle を入れて、そのまま帯に置きます。
 * 押せないトグルは、矢印キーで飛ばします
 */
export function ToolbarToggle(props: ToolbarToggleIconOnlyProps): ReactElement;
export function ToolbarToggle(props: ToolbarToggleProps): ReactElement;
export function ToolbarToggle({
  disabled,
  ref,
  ...props
}: ToolbarToggleProps | ToolbarToggleIconOnlyProps) {
  return (
    <BaseToolbar.Button
      ref={ref}
      disabled={disabled}
      focusableWhenDisabled={false}
      render={<Toggle {...(props as ToggleProps)} data-slot="toolbar-toggle" />}
    />
  );
}

/** 帯の中のリンクの props。Link の props から、キャプション（caption）と押せない（disabled）を除いたものです */
export type ToolbarLinkProps = Omit<LinkProps, 'caption' | 'disabled'>;

/**
 * 帯の中に置くリンクです。見た目と props は Link と同じで、帯の矢印キーの並びに入ります。
 * 別の場所へ移るもの（ヘルプのページなど）に使い、その場で実行するものは ToolbarButton にします
 */
export function ToolbarLink({ ref, ...props }: ToolbarLinkProps) {
  return <BaseToolbar.Link ref={ref} render={<Link {...props} data-slot="toolbar-link" />} />;
}
