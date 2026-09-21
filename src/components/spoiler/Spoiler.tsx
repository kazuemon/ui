'use client';

import {
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useState,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// 文中で隠しておき、押すと見える言葉（ネタバレ・答え）
// 文の中に置くので inline のまま折り返し、大きさ・余白は周りの文字に対する比（em）で持つ
// 面と文字の色は周りの文字の色（currentColor）から作る。白地・グレーの面・色の面・濃い塗りのどこでも一段濃い面になる（Code と同じ考え方）
// 文の中にあるので影は付けない（原則1）。押すものなので、hover で面を濃くし、押すと沈む（原則3。文字のリンクと同じ 1px）
// フォーカスの線はキーボードのときだけ（原則2）。見せたあとも同じ要素にフォーカスを残す
// 見せる・隠すときは、既定ではすぐに切り替える。duration を渡したときだけ、その長さで移る（--spoiler-duration）
// 隠し方ごとの面は design/tokens.css の --spoiler-{hatched,soft,blur}-fill*
// 見せたあとは、既定では跡を残さず、文の一部に戻す。隠し直せるときだけ、押せることが分かるよう周りの文字の色の点線の下線を残す（ADR-0182）
// 左右の余白は見せたあとも残す。消すと隠しているときと幅が変わり、周りの文が動くため
const spoiler = tv({
  slots: {
    root: [
      'relative rounded-sm box-decoration-clone px-[0.15em]',
      '[transition:background_var(--spoiler-duration)_var(--ease-press),top_var(--duration-press)_var(--ease-press),text-decoration-color_var(--spoiler-duration)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
    ],
    content: [
      '[transition:color_var(--spoiler-duration)_var(--ease-press),filter_var(--spoiler-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
    ],
  },
  variants: {
    variant: { hatched: {}, soft: {}, blur: {} },
    revealed: {
      false: {
        root: 'cursor-pointer select-none active:top-(--flat-press-depth)',
      },
      true: {
        root: '[background:none]',
        content: 'text-inherit [filter:none]',
      },
    },
    // 隠し直せるときは、見せたあとも押せるものとして振る舞う
    toggleable: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variant: 'hatched',
      revealed: false,
      class: {
        root: '[background:var(--spoiler-hatched-fill)] hover:[background:var(--spoiler-hatched-fill-hover)]',
        content: 'text-transparent',
      },
    },
    {
      variant: 'soft',
      revealed: false,
      class: {
        root: '[background:var(--spoiler-soft-fill)] hover:[background:var(--spoiler-soft-fill-hover)]',
        content: 'text-transparent',
      },
    },
    {
      variant: 'blur',
      revealed: false,
      class: {
        root: '[background:var(--spoiler-blur-fill)] hover:[background:var(--spoiler-blur-fill-hover)]',
        content: '[filter:blur(var(--spoiler-blur-radius))]',
      },
    },
    {
      revealed: true,
      toggleable: true,
      class: {
        root: [
          'cursor-pointer active:top-(--flat-press-depth)',
          'underline [text-decoration-color:color-mix(in_oklab,currentColor_40%,transparent)] decoration-dotted decoration-1 underline-offset-4',
        ],
      },
    },
  ],
  defaultVariants: { variant: 'hatched', revealed: false, toggleable: false },
});

export type SpoilerVariant = 'hatched' | 'soft' | 'blur';

export interface SpoilerProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** 隠しておく言葉 */
  children: ReactNode;
  /**
   * 隠し方。hatched は斜線の模様で覆い、soft は淡い面で覆います。
   * blur は文字をぼかすので、おおよその長さと形が見えます（短い数字や英字は形から推し量れることがあります）
   * @default 'hatched'
   */
  variant?: SpoilerVariant;
  /**
   * 隠しているあいだの、読み上げでの名前。中身は読ませず、この名前のボタンとして読みます
   * @default 'ネタバレを表示'
   */
  accessibleName?: string;
  /**
   * もう一度押したら隠し直すか。true のときは、見せたあともボタンのままで、読み上げでは開閉（aria-expanded）として読みます。
   * 見せたあとは、押せることが分かるよう点線の下線を残します。false のときは、見せたあとは跡を残さず、周りの文と同じに見えます
   * @default false
   */
  toggleable?: boolean;
  /**
   * 見せる・隠すときに移り変わる長さ（ms）。0 ではすぐに切り替えます。動きを減らす設定では、指定があってもすぐに切り替えます
   * @default 0
   */
  duration?: number;
  /**
   * はじめから見せておくか（制御しないとき）
   * @default false
   */
  defaultRevealed?: boolean;
  /** 見せているか（制御するとき）。onRevealedChange と組み合わせます */
  revealed?: boolean;
  /** 押して見せたとき・隠し直したときに呼ばれます */
  onRevealedChange?: (revealed: boolean) => void;
  /** 隠す言葉を包む要素（span）に付きます */
  className?: string;
}

/**
 * 文中で隠しておき、押すと見える言葉。ネタバレや、クイズの答えに使います
 */
export function Spoiler({
  children,
  variant = 'hatched',
  accessibleName = 'ネタバレを表示',
  toggleable = false,
  duration = 0,
  defaultRevealed = false,
  revealed: revealedProp,
  onRevealedChange,
  className,
  style,
  onClick,
  onKeyDown,
  ...props
}: SpoilerProps) {
  const [revealedState, setRevealedState] = useState(defaultRevealed);
  const revealed = revealedProp ?? revealedState;
  const hidden = !revealed;
  // 押せるのは、隠しているあいだと、隠し直せるときの見せたあと
  const pressable = hidden || toggleable;
  const styles = spoiler({ variant, revealed, toggleable });

  const setRevealed = (next: boolean) => {
    if (revealedProp === undefined) setRevealedState(next);
    onRevealedChange?.(next);
  };

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
    if (!pressable || event.defaultPrevented) return;
    // 見せたあとの文字を選んでいるときは、隠し直さない（なぞって写すため）
    if (revealed) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && event.currentTarget.contains(selection.anchorNode))
        return;
    }
    setRevealed(hidden);
  };

  // 押せるあいだはボタンとして動く（Enter・Space で見せる・隠す）
  // 隠し直さないときは、見せたあとボタンでなくなるので、ネイティブの button ではなく span に役割を付け外しする。
  //   要素を置き換えないので、フォーカスがそのまま残る
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (!pressable || event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setRevealed(hidden);
    }
  };

  return (
    <span
      data-slot="spoiler"
      data-revealed={revealed ? '' : undefined}
      role={pressable ? 'button' : undefined}
      // 見せたあとは、中身がボタンの名前になる（隠し直せるとき）
      aria-label={hidden ? accessibleName : undefined}
      aria-expanded={toggleable ? revealed : undefined}
      tabIndex={pressable ? 0 : -1}
      {...props}
      style={{ '--spoiler-duration': `${duration}ms`, ...style } as CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={styles.root({ className })}
    >
      {/* 隠しているあいだは、中身を読ませず、中のリンクなども押せなくする（inert） */}
      <span data-slot="spoiler-content" inert={hidden} className={styles.content()}>
        {children}
      </span>
    </span>
  );
}
