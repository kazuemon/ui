import type { ComponentProps } from 'react';

import { kbdStyles } from '../../internal/reading/code';
import { tv } from '../../internal/tv';

// キーボードのキー。見た目のクラス列は src/internal/reading/code.ts（Prose も同じものを使う）
const kbd = tv({ base: kbdStyles });

export type KbdProps = ComponentProps<'kbd'>;

/**
 * キーボードのキー。組み合わせは Kbd を並べ、間に「+」などの文字を置きます
 */
export function Kbd({ className, ...props }: KbdProps) {
  return <kbd className={kbd({ className })} {...props} />;
}
