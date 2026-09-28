'use client';

import type { ComponentProps } from 'react';

import type { FieldLabelLayoutProps } from '../../internal/field/Field';
import { FieldLayoutContext } from '../../internal/field/field-layout';
import { tv } from '../../internal/tv';

// 欄を縦に並べ、横に置くラベルの列をそろえる親（軸 388）
// 2 列の grid（ラベルの列は最も長いラベルの幅）で、中の欄は subgrid でこの列に乗る
// 入れ物（container）にするので、狭いときに上に戻すか（narrowLabelPlacement）は、並び全体の幅で測る
const fieldGroup = tv({
  base: '@container grid grid-cols-[auto_minmax(0,1fr)] gap-x-(--field-label-gap) gap-y-(--stack-gap)',
  variants: {
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
 * 組み立てた Field では、子を 2 つの箱に分けると、1 つ目がラベルの列、2 つ目が本体の列に乗ります
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
    <FieldLayoutContext value={{ labelPlacement, labelVariant, narrowLabelPlacement }}>
      <div data-field-group="" className={fieldGroup({ gap, className })} {...props}>
        {children}
      </div>
    </FieldLayoutContext>
  );
}
