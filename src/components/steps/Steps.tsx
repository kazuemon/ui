import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';

import { headingStyles } from '../../internal/reading/heading';
import { textStyles } from '../../internal/reading/text';
import { textLinkSizeReset } from '../../internal/reading/text-link';
import { tv } from '../../internal/tv';

// 記事の中の番号付きの手順（1. インストールする 2. 設定する…）。1 段は、番号の印・題（見出し）・本文
// ページと同じレイヤーの読みもの（原則1・19）。影を付けず、押せない。文字は読む文字（--text-body）で、密度で変わる（原則11）
// 要素は <ol>・<li>。番号は li の list-item の数を印に描く（<ol start> が効く）。印の文字は読み上げに出さない（ol が番号を伝える）
//   Safari は list-style: none の ol を一覧として読まないので、role="list" を付ける
// 印の形（軸 154）と、段をつなぐ線（軸 155）はトークン（design/tokens.css の --steps-*）で持つ
//   印は、題の 1 行目の中央にそろえる（題がないときは本文の 1 行目）
//   線は、印の中心の下から次の段の印の上まで引く。最後の段には引かない
//
// Prose の中に置いても、Prose が素の ol・li に当てる見た目（li::before の番号・字下げ・項目の間）を打ち消す
//   Prose の規則は詳細度が低い（:where で包む）か、要素だけの詳細度なので、ここのクラス（クラス 1 つ以上）が勝つ
//   印と線は li ではなく中の包み（step-inner）の ::before・::after に描く（Prose の li::before と重ならない）
//   本文の中の箇条書きは li の中にあるので、Prose と List は入れ子の印にする。本文の直下のリストは、入れ子でない印に戻す

const steps = tv({
  base: [
    'm-0 list-none ps-0',
    textStyles.size.md,
    textStyles.tone.default,
    // Prose が li に当てる印（::before）と項目の間を消し、段の間を空ける
    '[&>li]:relative [&>li]:list-none [&>li]:before:content-none',
    '[&>li+li]:mt-(--steps-gap)',
  ],
});

const inner = tv({
  base: [
    'relative ps-[calc(var(--steps-marker-size)+var(--steps-marker-gap))]',
    // 印の上端。1 行目（--step-line）の中央に、印の中心をそろえる
    '[--step-marker-top:calc((var(--step-line)-var(--steps-marker-size))/2)]',
    // 印（番号）。読み上げでは読まない（content の / "" が代わりの文。ol が番号を伝える）
    'before:absolute before:start-0 before:top-(--step-marker-top) before:flex before:items-center before:justify-center',
    'before:size-(--steps-marker-size) before:rounded-(--steps-marker-radius)',
    'before:bg-(--color-steps-marker) before:text-(color:--color-steps-marker-fg)',
    'before:[box-shadow:inset_0_0_0_var(--steps-marker-ring)_var(--color-steps-marker-ring)]',
    'before:text-(length:--steps-marker-text) before:leading-none before:font-(--steps-marker-weight) before:tabular-nums',
    'before:content-[counter(list-item)_/_""]',
    // 段をつなぐ線。印の下から、次の段の印の上まで
    'after:absolute after:w-0 after:content-[""]',
    'after:start-[calc(var(--steps-marker-size)/2-var(--steps-line-width)/2)]',
    'after:top-[calc(var(--step-marker-top)+var(--steps-marker-size)+var(--steps-line-gap))]',
    'after:bottom-[calc(var(--step-marker-top)-var(--steps-gap)+var(--steps-line-gap))]',
    'after:[border-inline-start:var(--steps-line-width)_var(--steps-line-style)_var(--color-steps-line)]',
    '[li:last-child>&]:after:content-none',
  ],
  variants: {
    // 1 行目の高さ（印をそろえる行）。題の大きさ、題がないときは本文
    line: {
      2: '[--step-line:var(--leading-heading-2)]',
      3: '[--step-line:var(--leading-heading-3)]',
      4: '[--step-line:var(--leading-heading-4)]',
      body: '[--step-line:var(--leading-body)]',
    },
  },
});

const title = tv({
  base: [headingStyles.base, textLinkSizeReset, 'm-0'],
  variants: {
    size: headingStyles.size,
  },
});

// 本文。Prose の要素のあいだの余白は本文の中まで届かないので、同じ値をここで付ける
//   Prose が素の要素に当てる余白の打ち消し（pre の m-0 など。クラス 1 つ＋要素）より強くするため、:not(:first-child) で詳細度を足す
const body = tv({
  base: [
    '[&>*:not(:first-child)]:mt-(--prose-block-gap) [&>p+p:not(:first-child)]:mt-(--prose-paragraph-gap)',
    // 本文の直下のリストは、段の li の中にあっても入れ子の印にしない
    '[&>ul]:[--lm-h:var(--list-bullet-height)] [&>ul]:[--lm-radius:var(--list-bullet-radius)] [&>ul]:[--lm-w:var(--list-bullet-width)]',
    '[&>ul]:[--lm-bg:var(--color-list-bullet)] [&>ul]:[--lm-ring-color:var(--color-list-bullet-ring)] [&>ul]:[--lm-ring:var(--list-bullet-ring)]',
  ],
  variants: {
    titled: {
      true: 'mt-(--steps-title-gap)',
      false: '',
    },
  },
});

export type StepsHeadingLevel = 2 | 3 | 4 | 5 | 6;

// 段から題の大きさ。5・6 段は 4（Heading と同じ）
const sizeOfLevel = { 2: 2, 3: 3, 4: 4, 5: 4, 6: 4 } as const;

const LevelContext = createContext<StepsHeadingLevel>(3);

export interface StepsProps extends Omit<ComponentProps<'ol'>, 'type' | 'reversed'> {
  /**
   * 各段の題を描く見出しの段。記事の構造に合わせ、手順を置く節の見出しより 1 段下にします。大きさは段に従います（5・6 段は 4 と同じ）
   * @default 3
   */
  headingLevel?: StepsHeadingLevel;
  /** 最初の番号 */
  start?: number;
  children?: ReactNode;
}

/**
 * 記事の中の番号付きの手順。Step を順に並べます
 */
export function Steps({ headingLevel = 3, className, children, ...props }: StepsProps) {
  return (
    <LevelContext.Provider value={headingLevel}>
      {/* list-style: none の ol を Safari が一覧として読むよう、role="list" を明示する */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol role="list" data-slot="steps" className={steps({ className })} {...props}>
        {children}
      </ol>
    </LevelContext.Provider>
  );
}

export interface StepProps extends Omit<ComponentProps<'li'>, 'title'> {
  /** 段の題。Steps の headingLevel の見出しで描きます。省略すると、本文の 1 行目に番号をそろえます */
  title?: ReactNode;
  children?: ReactNode;
}

/**
 * 手順の 1 段。番号は並びの順に付きます
 */
export function Step({ title: titleText, className, children, ...props }: StepProps) {
  const level = useContext(LevelContext);
  const Tag = `h${level}` as const;
  const size = sizeOfLevel[level];
  const titled = titleText != null && titleText !== false;
  return (
    <li data-slot="step" className={className} {...props}>
      <div data-slot="step-inner" className={inner({ line: titled ? size : 'body' })}>
        {titled ? (
          <Tag data-slot="step-title" className={title({ size })}>
            {titleText}
          </Tag>
        ) : null}
        {children != null ? (
          <div data-slot="step-body" className={body({ titled })}>
            {children}
          </div>
        ) : null}
      </div>
    </li>
  );
}
