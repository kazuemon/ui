import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';

import { headingStyles } from '../../internal/reading/heading';
import { textStyles } from '../../internal/reading/text';
import { textLinkSizeReset } from '../../internal/reading/text-link';
import { tv } from '../../internal/tv';

// 記事の中の番号付きの手順（1. インストールする 2. 設定する…）。1 段は、番号の印・題（見出し）・本文
// ページと同じレイヤーの読みもの（原則1・19）。影を付けず、押せない。文字は読む文字（--text-body）で、密度で変わる（原則11）
// 要素は <ol>・<li>。番号は li の list-item の数を印に描く（<ol start> が効く）。印の文字は読み上げに出さない（ol が番号を伝える）
//   Safari は list-style: none の ol を一覧として読まないので、role="list" を付ける
// 印（ADR-0181）は marker で選ぶ。どれも影を付けず、押せる見た目にしない
//   neutral（既定）は淡いグレーの丸に本文の色の太い数字（色を持たない部品の印はグレー — 原則6）
//   outline は塗らずに線の強いグレーの輪郭と一段淡い数字、number は丸を置かず題と同じくらいの淡い大きな数字
//   primary は Primary ボタンと同じ青の丸に白い数字（丸も数字も 4.5:1 を越える）
//   印は、題の 1 行目の中央にそろえる（題がないときは本文の 1 行目）
// 段をつなぐ線（ADR-0172）は line で選ぶ。既定は細い実線、点線と線なしも選べる
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
    'before:size-(--steps-marker-size) before:rounded-(--step-marker-radius)',
    'before:bg-(--step-marker-bg) before:text-(color:--step-marker-fg)',
    'before:[box-shadow:inset_0_0_0_var(--step-marker-ring)_var(--step-marker-ring-color)]',
    'before:text-(length:--step-marker-text) before:leading-none before:font-(--font-weight-heading) before:tabular-nums',
    'before:content-[counter(list-item)_/_""]',
    // 段をつなぐ線。印の下から、次の段の印の上まで
    'after:absolute after:w-0 after:content-[""]',
    'after:start-[calc(var(--steps-marker-size)/2-var(--steps-line-width)/2)]',
    'after:top-[calc(var(--step-marker-top)+var(--steps-marker-size)+var(--steps-line-gap))]',
    'after:bottom-[calc(var(--step-marker-top)-var(--steps-gap)+var(--steps-line-gap))]',
    'after:[border-inline-start:var(--steps-line-width)_var(--step-line-style)_var(--color-steps-line)]',
    '[li:last-child>&]:after:content-none',
  ],
  variants: {
    // 印の種類。丸の塗り・輪郭・角と、数字の色・大きさを置く
    marker: {
      neutral: [
        '[--step-marker-bg:var(--color-neutral)] [--step-marker-fg:var(--color-fg)]',
        '[--step-marker-radius:var(--radius-pill)] [--step-marker-ring-color:transparent] [--step-marker-ring:0px] [--step-marker-text:var(--steps-marker-text)]',
      ],
      outline: [
        '[--step-marker-bg:transparent] [--step-marker-fg:var(--color-fg-muted)]',
        '[--step-marker-radius:var(--radius-pill)] [--step-marker-ring-color:var(--color-line-strong)] [--step-marker-ring:var(--border-width-medium)] [--step-marker-text:var(--steps-marker-text)]',
      ],
      number: [
        '[--step-marker-bg:transparent] [--step-marker-fg:var(--color-fg-subtle)]',
        '[--step-marker-radius:0px] [--step-marker-ring-color:transparent] [--step-marker-ring:0px] [--step-marker-text:var(--steps-marker-number-text)]',
      ],
      primary: [
        '[--step-marker-bg:var(--color-primary)] [--step-marker-fg:var(--color-on-primary)]',
        '[--step-marker-radius:var(--radius-pill)] [--step-marker-ring-color:transparent] [--step-marker-ring:0px] [--step-marker-text:var(--steps-marker-text)]',
      ],
    },
    // 段をつなぐ線の種類。点線は太さと印とのあいだを点線用の値に差し替える
    line: {
      solid: '[--step-line-style:solid]',
      dotted: [
        '[--step-line-style:dotted]',
        '[--steps-line-gap:var(--steps-line-dotted-gap)] [--steps-line-width:var(--steps-line-dotted-width)]',
      ],
      none: 'after:content-none',
    },
    // 1 行目の高さ（印をそろえる行）。題の大きさ、題がないときは本文
    firstLine: {
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

export type StepsLine = 'solid' | 'dotted' | 'none';

export type StepsMarker = 'neutral' | 'outline' | 'number' | 'primary';

const StepsContext = createContext<{
  level: StepsHeadingLevel;
  line: StepsLine;
  marker: StepsMarker;
}>({
  level: 3,
  line: 'solid',
  marker: 'neutral',
});

export interface StepsProps extends Omit<ComponentProps<'ol'>, 'type' | 'reversed'> {
  /**
   * 各段の題を描く見出しの段。記事の構造に合わせ、手順を置く節の見出しより 1 段下にします。大きさは段に従います（5・6 段は 4 と同じ）
   * @default 3
   */
  headingLevel?: StepsHeadingLevel;
  /**
   * 段をつなぐ縦の線。solid は細い実線、dotted は点線、none は線を引かず番号と余白だけで段を見せます
   * @default 'solid'
   */
  line?: StepsLine;
  /**
   * 番号の印。neutral は淡いグレーの丸、outline は輪郭だけの丸と淡い数字、number は丸を置かない淡い大きな数字、primary は Primary の青の丸に白い数字です
   * @default 'neutral'
   */
  marker?: StepsMarker;
  /** 最初の番号 */
  start?: number;
  children?: ReactNode;
}

/**
 * 記事の中の番号付きの手順。Step を順に並べます
 */
export function Steps({
  headingLevel = 3,
  line = 'solid',
  marker = 'neutral',
  className,
  children,
  ...props
}: StepsProps) {
  return (
    <StepsContext.Provider value={{ level: headingLevel, line, marker }}>
      {/* list-style: none の ol を Safari が一覧として読むよう、role="list" を明示する */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol role="list" data-slot="steps" className={steps({ className })} {...props}>
        {children}
      </ol>
    </StepsContext.Provider>
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
  const { level, line, marker } = useContext(StepsContext);
  const Tag = `h${level}` as const;
  const size = sizeOfLevel[level];
  const titled = titleText != null && titleText !== false;
  return (
    <li data-slot="step" className={className} {...props}>
      <div
        data-slot="step-inner"
        className={inner({ marker, line, firstLine: titled ? size : 'body' })}
      >
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
