'use client';

import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { type ComponentProps, type ReactNode, useMemo } from 'react';

import { tv } from '../../internal/tv';
import type { ToggleColor, ToggleVariant } from './Toggle';
import { ToggleGroupContext } from './toggle-group-context';

// ToggleGroup: 複数の Toggle をまとめる（Base UI の ToggleGroup。role="group"）。中には value 付きの Toggle を並べる
// multiple=false（既定）はラジオのように1つだけ、multiple=true はチェックボックスのように複数を押せる
// 詰め方（frame）は既定 connected、gap も選べる（軸269で決定。inset は Segmented Control の役割と近いため候補から外した）
//   connected: 隣り合わせ、仕切りの細い線で区切り、両端だけ角丸を残す。gap: それぞれ離して並べる
//   Toggle は自分の data-frame（親から見た in-data-[frame=…]）で connected の角丸だけを変えるので、ToggleGroup 側は
//   見た目の枠（gap・overflow-hidden など）だけを持てばよい
const toggleGroupStyles = tv({
  base: [
    'inline-flex items-center gap-(--toggle-group-gap)',
    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  ],
  variants: {
    frame: {
      gap: '',
      connected: [
        'gap-0 overflow-hidden rounded-(--toggle-radius)',
        'divide-x divide-(--color-line) data-[orientation=vertical]:divide-x-0 data-[orientation=vertical]:divide-y',
      ],
    },
  },
  defaultVariants: { frame: 'connected' },
});

/** ToggleGroup の詰め方。connected は隣り合わせで両端だけ角丸を残す、gap は離して並べる */
export type ToggleGroupFrame = 'gap' | 'connected';

/** 並べる向き */
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

export interface ToggleGroupProps extends Omit<
  ComponentProps<'div'>,
  'color' | 'defaultValue' | 'onChange'
> {
  /** 押している Toggle の value の並び（制御） */
  value?: string[];
  /** はじめに押している Toggle の value の並び（非制御） */
  defaultValue?: string[];
  /** 押し方が変わるときに、次の値の並びを渡して呼びます */
  onValueChange?: (value: string[]) => void;
  /**
   * グループごと押せない（Disabled）状態にします。中の Toggle がすべて押せなくなります
   * @default false
   */
  disabled?: boolean;
  /**
   * 複数の Toggle を同時に押せるようにします。false はラジオのように1つだけ（押すと、ほかは外れます）
   * @default false
   */
  multiple?: boolean;
  /**
   * 並べる向き。vertical では、上下の矢印キーで Toggle を移ります
   * @default 'horizontal'
   */
  orientation?: ToggleGroupOrientation;
  /**
   * 端の Toggle で矢印キーを押したとき、反対の端へ回るか
   * @default true
   */
  loopFocus?: boolean;
  /**
   * 中の Toggle の色。Toggle ごとの color で上書きできます
   * @default 'neutral'
   */
  color?: ToggleColor;
  /**
   * 中の Toggle の、ON の塗りの強さ。Toggle ごとの variant で上書きできます
   * @default 'filled'
   */
  variant?: ToggleVariant;
  /**
   * 詰め方。connected は隣り合わせて仕切りの細い線で区切り、両端だけ角丸を残します。gap はそれぞれ離して並べます
   * @default 'connected'
   */
  frame?: ToggleGroupFrame;
  /** グループの読み上げの名前（aria-label）。見出しが近くにないときに付けます */
  'aria-label'?: string;
  /** グループの枠（div）に付きます */
  className?: string;
  /** 並べる Toggle。value を付けて置きます */
  children?: ReactNode;
}

/**
 * Toggle をまとめて、1つ（ラジオのよう）か複数（チェックボックスのよう）を押せるようにします。
 * 中には value を付けた Toggle を並べます。押している value の並びが value（defaultValue）です
 */
export function ToggleGroup({
  value,
  defaultValue,
  onValueChange,
  disabled,
  multiple,
  orientation,
  loopFocus,
  color,
  variant,
  frame,
  className,
  ...props
}: ToggleGroupProps) {
  const context = useMemo(() => ({ color, variant }), [color, variant]);
  return (
    <ToggleGroupContext.Provider value={context}>
      <BaseToggleGroup
        {...props}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
        disabled={disabled}
        multiple={multiple}
        orientation={orientation}
        loopFocus={loopFocus}
        data-frame={frame ?? 'connected'}
        className={toggleGroupStyles({ frame, className })}
      />
    </ToggleGroupContext.Provider>
  );
}
