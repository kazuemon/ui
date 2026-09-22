import type { ComponentProps } from 'react';
import { extendTailwindMerge } from 'tailwind-merge';

import { twMergeConfig } from '../tv';

// <部位>Props の受け口（ADR-0250）。Base UI を包む部品は、知らない props を流さず、
// 届かない部位には部位の名前を付けた1つの口を置く。口は部品の中の要素にそのまま広げ、
// className は部品のクラスと tailwind-merge で合成する（あとに書いた利用者のクラスが勝つ）

const merge = extendTailwindMerge(twMergeConfig);

/** 浮かぶ部分の部位（Popup・Positioner）に広げる props。div の部分型 */
export type ListboxSlotProps = Omit<ComponentProps<'div'>, 'children'>;

/** 打つ欄の部位に広げる props */
export type ListboxInputProps = Omit<ComponentProps<'input'>, 'children'>;

/** 部品のクラスに、<部位>Props の className を重ねる */
export function mergeSlotClass(base: string, extra?: string): string {
  return extra ? merge(base, extra) : base;
}
