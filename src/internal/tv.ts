import {
  type ConfigExtension,
  type DefaultClassGroupIds,
  type DefaultThemeGroupIds,
  extendTailwindMerge,
} from 'tailwind-merge';
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

/**
 * 部品の要素に付ける目印のクラス。この要素とその中にだけ、Tailwind のリセットと同じものを当てる（src/styles/reset.css）
 * Tailwind を使わないアプリには、ページ全体のリセットを配らないため
 */
export const SCOPE_CLASS = 'kz-ui';

const baseTV = createTV({ twMergeConfig });

/** tv の設定の、どの部位（base と slots のすべて）にも目印のクラスを足す */
function withScope<T extends { base?: unknown; slots?: Record<string, unknown> }>(options: T): T {
  return {
    ...options,
    base: [SCOPE_CLASS, options.base],
    ...(options.slots && {
      slots: Object.fromEntries(
        Object.entries(options.slots).map(([name, value]) => [name, [SCOPE_CLASS, value]])
      ),
    }),
  };
}

/**
 * 部品の見た目を書く tv。上の設定で className をまとめ、どの部位にも目印のクラス（SCOPE_CLASS）を足す
 * 足すのはクラスの中身だけで、部位の名前や variants の型は変わらない
 */
export const tv: typeof baseTV = (options, config) => baseTV(withScope(options), config);

/**
 * クラス名をまとめる（上の設定の tailwind-merge）。あとに渡したクラスが勝つ
 * tv を使えない場所（部位の props で受け取った className を、部品が組み立てたクラスに重ねるとき）で使う
 */
export const cn = extendTailwindMerge(twMergeConfig);
