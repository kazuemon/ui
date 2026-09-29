'use client';

import type { ComponentProps } from 'react';

import type { FieldLabelLayoutProps } from '../../internal/field/Field';
import { FieldLayoutContext } from '../../internal/field/field-layout';
import { tv } from '../../internal/tv';

// 欄を縦に並べ、横に置くラベルの列をそろえる親（軸 388）
// 2 列の grid（ラベルの列は最も長いラベルの幅）で、中の欄は subgrid でこの列に乗る
// 子はどれも 2 列をまたぐ（Field 以外の子 — ボタンや 1 つだけの Checkbox — もラベルの列に押し込まれない）
// narrowLabelPlacement="top" のときは入れ物（container）にし、狭いときに上に戻すかを並び全体の幅で測る
const fieldGroup = tv({
  base: 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-(--field-label-gap) gap-y-(--stack-gap) [&>*]:col-span-full',
  variants: {
    narrow: {
      start: '',
      top: '@container',
    },
    gap: {
      sm: '[--stack-gap:var(--stack-gap-sm)]',
      md: '[--stack-gap:var(--stack-gap-md)]',
      lg: '[--stack-gap:var(--stack-gap-lg)]',
    },
  },
  defaultVariants: { gap: 'lg' },
});

export type FieldGroupGap = 'sm' | 'md' | 'lg';

export interface FieldGroupProps extends ComponentProps<'div'>, FieldLabelLayoutProps {
  /**
   * 欄と欄の間（Stack と同じ段）
   * @default 'lg'
   */
  gap?: FieldGroupGap;
}

/**
 * 入力欄を縦に並べ、ラベルを横に置いて列をそろえます。ラベルの列は、中で最も長いラベルの幅になります
 * 中の欄の labelPlacement などの既定を決めます（既定は start）。欄ごとの指定が勝ちます
 * 組み立てた Field では、子を 2 つの箱に分けます。1 つ目がラベルの列、2 つ目が本体の列に乗ります
 * narrowLabelPlacement="top" のときは、FieldGroup に幅を与えてください（並び全体の幅で、上に戻すかを測ります）
 * 既定は中の子孫すべてに届きます。FieldGroup の中から開く Dialog・Popover の中の欄も横になるので、その欄では labelPlacement を渡します
 */
export function FieldGroup({
  labelPlacement = 'start',
  labelVariant,
  narrowLabelPlacement,
  gap,
  className,
  children,
  ...props
}: FieldGroupProps) {
  return (
    <FieldLayoutContext value={{ labelPlacement, labelVariant, narrowLabelPlacement, group: true }}>
      <div
        data-field-group=""
        className={fieldGroup({ gap, narrow: narrowLabelPlacement ?? 'start', className })}
        {...props}
      >
        {children}
      </div>
    </FieldLayoutContext>
  );
}
