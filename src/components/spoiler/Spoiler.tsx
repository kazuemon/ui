import {
  type ComponentProps,
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
// 隠し方・見せたあとの残り方は design/tokens.css の --spoiler-*（軸 156・157）
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
    revealed: {
      false: {
        root: [
          'cursor-pointer select-none [background:var(--spoiler-fill)]',
          'hover:[background:var(--spoiler-fill-hover)] active:top-(--flat-press-depth)',
        ],
        content: 'text-(color:--spoiler-text) [filter:blur(var(--spoiler-blur))]',
      },
      true: {
        root: [
          '[background:var(--spoiler-revealed-fill)]',
          'underline [text-decoration-color:var(--spoiler-revealed-line)] decoration-dotted decoration-1 underline-offset-4',
        ],
        content: 'text-inherit [filter:none]',
      },
    },
  },
  defaultVariants: { revealed: false },
});

export interface SpoilerProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** 隠しておく言葉 */
  children: ReactNode;
  /**
   * 隠しているあいだの、読み上げでの名前。中身は読ませず、この名前のボタンとして読みます
   * @default 'ネタバレを表示'
   */
  label?: string;
  /**
   * はじめから見せておくか（制御しないとき）
   * @default false
   */
  defaultRevealed?: boolean;
  /** 見せているか（制御するとき）。onRevealedChange と組み合わせます */
  revealed?: boolean;
  /** 押して見せたときに呼ばれます */
  onRevealedChange?: (revealed: boolean) => void;
}

/**
 * 文中で隠しておき、押すと見える言葉。ネタバレや、クイズの答えに使います
 */
export function Spoiler({
  children,
  label = 'ネタバレを表示',
  defaultRevealed = false,
  revealed: revealedProp,
  onRevealedChange,
  className,
  onClick,
  onKeyDown,
  ...props
}: SpoilerProps) {
  const [revealedState, setRevealedState] = useState(defaultRevealed);
  const revealed = revealedProp ?? revealedState;
  const hidden = !revealed;
  const styles = spoiler({ revealed });

  const reveal = () => {
    if (revealedProp === undefined) setRevealedState(true);
    onRevealedChange?.(true);
  };

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
    if (hidden && !event.defaultPrevented) reveal();
  };

  // 隠しているあいだはボタンとして動く（Enter・Space で見せる）
  // 見せたあとはボタンでなくなるので、ネイティブの button ではなく span に役割を付け外しする。
  //   要素を置き換えないので、フォーカスがそのまま残り、面と文字の色が移り変わる
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (!hidden || event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      reveal();
    }
  };

  return (
    <span
      data-slot="spoiler"
      data-revealed={revealed ? '' : undefined}
      role={hidden ? 'button' : undefined}
      aria-label={hidden ? label : undefined}
      tabIndex={hidden ? 0 : -1}
      {...props}
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
