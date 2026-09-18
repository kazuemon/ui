import type { ComponentProps } from 'react';

import { markStyles } from '../../internal/reading/mark';
import { tv } from '../../internal/tv';

// 目立たせたい言葉。見た目のクラス列は src/internal/reading/mark.ts（Prose も同じものを使う）
const mark = tv({ base: markStyles });

export type MarkProps = ComponentProps<'mark'>;

/**
 * 文の中で目立たせたい言葉。黄色を薄く敷きます
 */
export function Mark({ className, ...props }: MarkProps) {
  return <mark className={mark({ className })} {...props} />;
}
