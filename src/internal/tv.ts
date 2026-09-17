import type { ConfigExtension, DefaultClassGroupIds, DefaultThemeGroupIds } from 'tailwind-merge';
import { createTV } from 'tailwind-variants';

// tailwind-merge に、design/tokens.css の @theme で足したクラスの名前を知らせる — design/adr/0077
// 知らせないと、tailwind-merge は h-control・rounded-control などを別の種類のクラスとみなし、
//   className で h-full を渡しても h-control が残る（上書きが効かない）。text-caption は色のクラスとみなされ、text-fg-subtle と並べると消える
// 色（bg-primary など）は、知らない名前も色として扱うので、並べなくてよい
// 角丸の xs〜4xl は tailwind-merge が既に知っているので、並べなくてよい
// 名前の一覧は tokens.css と同じにする（src/components/tv.test.ts が確かめる）

/**
 * tailwind-merge の設定。@kazuemon/ui のクラス（h-control・text-caption・rounded-control など）の名前を知らせます。
 * 利用者が自分の `cn()` で tailwind-merge を使うときは、`extendTailwindMerge(twMergeConfig)` で同じ設定を使います
 */
export const twMergeConfig = {
  extend: {
    theme: {
      spacing: ['control', 'control-x', 'field-gap', 'icon'],
      text: [
        'control',
        'input',
        'label',
        'caption',
        'body',
        'body-sm',
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
      ],
      leading: [
        'control',
        'input',
        'label',
        'caption',
        'body',
        'body-sm',
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
      ],
      radius: ['control', 'card', 'pill'],
      shadow: ['raised', 'raised-hover', 'raised-press', 'overlay', 'sheet'],
      ease: ['press', 'sheet'],
      animate: ['loading-in', 'loading-bar', 'spin-reduced', 'loading-bar-reduced'],
      'font-weight': ['heading'],
    },
  },
} satisfies ConfigExtension<DefaultClassGroupIds, DefaultThemeGroupIds>;

/** 部品の見た目を書く tv。上の設定で className をまとめる */
export const tv = createTV({ twMergeConfig });
