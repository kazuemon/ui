'use client';

import { type ComponentProps, type FocusEvent, type ReactNode, useEffect, useRef } from 'react';

import { tv } from '../../internal/tv';
import { Spinner } from '../loading/Loading';
import { useLoadingOverlay } from './use-loading-overlay';

// 領域の上に重ねる読み込み中の幕。原則14（待っているあいだは知らせる。ここは下の操作を止める形）
//   幕は面の色を透かして、下の内容を淡く見せる。真ん中に回る円を 1 つ置く（Spinner の lg）
//   下の領域は inert にして、押せず・フォーカスも入らない。幕が出ているあいだだけ止める
//   読み上げは、幕とは別の status の箱（いつも DOM にある）に、幕が出たときだけ文を入れて知らせる
const loadingOverlay = tv({
  slots: {
    root: 'relative',
    veil: [
      'z-10 flex cursor-progress flex-col items-center justify-center gap-3 rounded-[inherit] bg-(--loading-overlay-bg) text-(color:--loading-overlay-fg) backdrop-blur-(--loading-overlay-blur)',
      'data-[state=closed]:pointer-events-none data-[state=closed]:animate-[loading-overlay-out_var(--loading-overlay-duration-out)_var(--ease-press)_both] data-[state=open]:animate-[loading-overlay-in_var(--loading-overlay-duration-in)_var(--ease-press)_both] motion-reduce:animate-none',
    ],
    text: 'text-(length:--text-control) leading-(--leading-control)',
  },
  variants: {
    variant: {
      light: {},
      dark: {
        veil: '[--loading-overlay-bg:var(--loading-overlay-bg-dark)] [--loading-overlay-fg:var(--palette-white)]',
      },
    },
    blur: {
      true: {},
      false: { veil: '[--loading-overlay-blur:0px]' },
    },
    fullscreen: {
      true: { veil: 'fixed inset-0' },
      false: { veil: 'absolute inset-0' },
    },
  },
  compoundVariants: [
    // 淡い幕でぼかさないときは、面の色を濃くして下をほとんど見せない
    {
      variant: 'light',
      blur: false,
      class: { veil: '[--loading-overlay-bg:var(--loading-overlay-bg-unblurred)]' },
    },
  ],
  defaultVariants: { variant: 'light', blur: true, fullscreen: false },
});

/** 幕の色 */
export type LoadingOverlayVariant = 'light' | 'dark';

export interface LoadingOverlayProps extends ComponentProps<'div'> {
  /**
   * 読み込み中か。true のあいだ、下の領域に幕をかぶせて操作を止めます
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込み中であることを伝える文。読み上げで知らせます（幕が出たとき）。`showLoadingText` で、円の下に見せることもできます
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /**
   * `loadingText` を円の下に見せます
   * @default false
   */
  showLoadingText?: boolean;
  /**
   * 幕の色。light は面の色を透かした淡い幕、dark は後ろを暗くして白い円と文言を載せる幕です（ImageZoom と同じ語）
   * @default 'light'
   */
  variant?: LoadingOverlayVariant;
  /**
   * 幕の後ろをぼかします。light で false にすると、ぼかさない代わりに面の色を濃くかぶせて、下をほとんど見せません
   * @default true
   */
  blur?: boolean;
  /**
   * `loading` になってから幕を出すまでの待ち（ミリ秒）。そのあいだに終われば幕は出ません。既定は待たずにすぐ出します。一瞬で終わる読み込みで幕を出したくないときは、200 ほどを渡します
   * @default 0
   */
  delay?: number;
  /**
   * 一度出した幕を、少なくともこの長さ（ミリ秒）は出しておきます。出てすぐ消えるちらつきを防ぎます
   * @default 0
   */
  minDuration?: number;
  /**
   * 幕が出る動き（フェード）の長さ（ミリ秒）。0 だとすぐ出ます
   * @default 0
   */
  enterDuration?: number;
  /**
   * 幕が消える動き（フェード）の長さ（ミリ秒）。一瞬で終わる読み込みでも、消えるときに余裕を持たせます
   * @default 400
   */
  exitDuration?: number;
  /**
   * 領域ではなく画面全体にかぶせます。画面を読み込んでいるときに使います
   * @default false
   */
  fullscreen?: boolean;
  /** 幕の下に置く領域（カード・表など）。幕が出ているあいだは、押せず、フォーカスも入りません */
  children?: ReactNode;
}

/**
 * カードや表などの領域の上に重ねて、読み込み中であることを示し、下の操作を止める幕です
 */
export function LoadingOverlay({
  loading = false,
  variant,
  blur = true,
  loadingText = '読み込んでいます',
  showLoadingText = false,
  delay = 0,
  minDuration = 0,
  enterDuration,
  exitDuration,
  fullscreen = false,
  className,
  style,
  children,
  ...props
}: LoadingOverlayProps) {
  const { shown, mounted, unmount } = useLoadingOverlay(loading, delay, minDuration);
  const styles = loadingOverlay({ variant, blur, fullscreen });
  const veilRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const wasShown = useRef(false);

  // 下の領域のフォーカスを覚えておき、幕が消えたとき、フォーカスがどこにもなければ戻す
  const rememberFocus = (event: FocusEvent<HTMLElement>) => {
    lastFocused.current = event.target;
  };
  useEffect(() => {
    if (shown) {
      wasShown.current = true;
      return;
    }
    if (!wasShown.current) return;
    wasShown.current = false;
    const target = lastFocused.current;
    if (
      target?.isConnected &&
      (!document.activeElement || document.activeElement === document.body)
    ) {
      target.focus({ preventScroll: true });
    }
  }, [shown]);

  // 消える動きが終わったら DOM から外す。動きがないとき（動きを減らす設定・長さ 0）はすぐ外す
  useEffect(() => {
    const veil = veilRef.current;
    if (shown || !mounted || !veil) return undefined;
    void getComputedStyle(veil).animationName;
    const animations = veil.getAnimations();
    if (animations.length === 0) {
      unmount();
      return undefined;
    }
    let cancelled = false;
    Promise.all(animations.map((animation) => animation.finished)).then(
      () => {
        if (!cancelled) unmount();
      },
      () => {}
    );
    return () => {
      cancelled = true;
    };
  });

  return (
    <div
      data-slot="loading-overlay"
      className={styles.root({ className })}
      style={{
        ...(enterDuration === undefined
          ? null
          : { '--loading-overlay-duration-in': `${enterDuration}ms` }),
        ...(exitDuration === undefined
          ? null
          : { '--loading-overlay-duration-out': `${exitDuration}ms` }),
        ...style,
      }}
      {...props}
    >
      {/* aria-busy は下の領域にだけ付ける。知らせの status の箱に付けると、読み上げが終わるまで待たされる */}
      <div
        className="contents"
        inert={shown}
        aria-busy={loading || undefined}
        onFocus={rememberFocus}
      >
        {children}
      </div>
      <div role="status" className="sr-only">
        {shown ? loadingText : null}
      </div>
      {mounted && (
        <div
          ref={veilRef}
          data-slot="loading-overlay-veil"
          data-state={shown ? 'open' : 'closed'}
          className={styles.veil()}
          aria-hidden
        >
          <Spinner
            size="lg"
            className="[--spinner-size:var(--loading-overlay-spinner-size)] [--spinner-stroke:var(--loading-overlay-spinner-stroke)]"
          />
          {showLoadingText && <span className={styles.text()}>{loadingText}</span>}
        </div>
      )}
    </div>
  );
}
