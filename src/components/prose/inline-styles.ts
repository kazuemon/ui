import { tv } from '../../internal/tv';

// 文字の飾り（軸 57）。Prose が、素の HTML の strong・em・del・mark に当てる見た目
// 要素に付けても、Prose の根に付けても効く形で書く（src/internal/reading/heading.ts の先頭）
// strong と em はブラウザの既定のまま（太さ 700、斜体。和文は傾けて描かれる）
// del は、打ち消した文を目立たせない文として、文字も線も --color-fg-subtle にする（軸 57 の A）
// 文の中にあるので影は付けない（原則1）
export const inlineStyles = tv({
  slots: {
    strong: '[:where(&:not([data-prose]),&_strong)]:font-bold',
    em: '[:where(&:not([data-prose]),&_em)]:italic',
    del: '[:where(&:not([data-prose]),&_del)]:text-fg-subtle [:where(&:not([data-prose]),&_del)]:line-through [:where(&:not([data-prose]),&_del)]:decoration-fg-subtle',
    // 目立たせたい言葉（軸 63 の C）。警告の黄色（面用）を 45% に薄めて全面に敷く蛍光ペンの形。Primary の青の補色で、青いリンクと紛れない
    mark: '[:where(&:not([data-prose]),&_mark)]:rounded-xs [:where(&:not([data-prose]),&_mark)]:bg-[color-mix(in_oklab,var(--color-warning)_45%,transparent)] [:where(&:not([data-prose]),&_mark)]:box-decoration-clone [:where(&:not([data-prose]),&_mark)]:px-[0.1em] [:where(&:not([data-prose]),&_mark)]:text-inherit',
  },
});
