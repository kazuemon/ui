'use client';

import {
  Children,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from 'react';

import { CarouselSelectionContext } from '../../internal/carousel-context';
import { focusRing } from '../../internal/focus-styles';
import { ScrollFrame } from '../../internal/ScrollFrame';
import { tv } from '../../internal/tv';

// 小さな画像を並べ、押して切り替える帯。値は design/tokens.css の --thumbnails-*
//   Carousel の thumbnails に渡すと、Carousel のいまの 1 枚とつながる（internal/carousel-context.ts）。
//   それ以外（Gallery など）では value・onValueChange で組む。どちらも渡したときは value・onValueChange を先に使う
//   構造（WAI-ARIA の Tabs パターン）: tablist > tab。tab の名前は中の画像の alt。Carousel と組んだときは aria-controls でスライドを指す
//     ←→ で選びながら移り（選ぶと Carousel も送る）、Home・End で最初と最後へ。Tab で止まるのは選んでいる 1 つだけ
//   1 つずつは平らな押すもの（原則3）: hover で本文の色を淡く敷き、押すと沈む。選んでいるものは hover も沈みもしない（Tabs と同じ）
//   選んでいる印は、画像の下に離して引く棒（Tabs の line の印と同じ太さ。色は部品の色 — 原則6）。
//     indicator="underline-dim" では、選んでいない画像を少し薄くする（軸 288・決定）
//     枠線はフォーカスとエラーのものなので、選んでいる印には使わない（原則2）
//   フォーカスの線は画像のまわりに引く。棒は線より下に離して引くので、線が棒を越えない
//   角は部品の角（押すもの — 原則5）。画像の細い輪郭は Figure と同じ濃さ（白っぽい画像が白地に溶けないように）
//   並びが入り切らないときは横にスクロールする。続きは左右の端の内側の影で見せる（原則1。ScrollArea と同じ）
//     選んでいるものが見えている範囲の外に出たら、見える位置まで送る（動きを減らす設定では滑らせない）

const styles = tv({
  slots: {
    // フォーカスの線（外に 4px）が枠で切れないよう、枠を広げて内側に余白を取る（Tabs と同じ）
    root: [
      'min-w-0 [--thumbnails-room:calc(var(--focus-ring-offset)+var(--focus-ring-width))]',
      '-mx-(--thumbnails-room) -mt-(--thumbnails-room)',
    ],
    viewport: [
      'px-(--thumbnails-room) pt-(--thumbnails-room)',
      'pb-[max(var(--thumbnails-room),calc(var(--thumbnails-bar-gap)+var(--thumbnails-bar-height)))]',
    ],
    list: 'flex w-max gap-(--thumbnails-gap)',
    item: [
      'relative block shrink-0 cursor-pointer appearance-none border-0 bg-transparent p-0',
      'aspect-(--thumbnails-item-ratio) w-(--thumbnails-item-width) rounded-(--thumbnails-radius)',
      // 中の画像を 1 つずつの大きさに切り取って埋める
      '[&_img]:block [&_img]:size-full [&_img]:rounded-[inherit] [&_img]:object-cover',
      '[&_img]:opacity-(--thumbnails-rest-opacity) not-aria-selected:hover:[&_img]:opacity-(--thumbnails-hover-opacity) aria-selected:[&_img]:opacity-100',
      '[&_img]:transition-opacity [&_img]:duration-(--duration-press) [&_img]:ease-(--ease-press) motion-reduce:[&_img]:transition-none',
      // 画像の上に重ねる層: 細い輪郭・hover と押下の淡い塗り
      "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-['']",
      'before:[box-shadow:inset_0_0_0_var(--border-width-thin)_var(--thumbnails-outline)]',
      'not-aria-selected:hover:before:bg-[color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),transparent)]',
      'not-aria-selected:active:translate-y-(--flat-press-depth) not-aria-selected:active:before:bg-[color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),transparent)]',
      // 選んでいる印の棒。画像の下に離して引く
      "after:pointer-events-none after:absolute after:inset-x-0 after:top-[calc(100%+var(--thumbnails-bar-gap))] after:h-(--thumbnails-bar-height) after:rounded-pill after:content-['']",
      'aria-selected:cursor-default aria-selected:after:bg-(--thumbnails-own)',
      ...focusRing,
      '[transition:translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
    ],
  },
  variants: {
    // 選んでいる印の色（原則6）。指定しないときは濃いグレー（Tabs と同じ）。フォーカスの線も部品の色
    color: {
      neutral: { root: '[--thumbnails-own:var(--color-neutral-strong)]' },
      primary: {
        root: '[--color-own-focus:var(--color-primary)] [--thumbnails-own:var(--color-primary)]',
      },
      secondary: {
        root: '[--color-own-focus:var(--color-fg-secondary)] [--thumbnails-own:var(--color-fg-secondary)]',
      },
    },
    // 選んでいる印（軸 288・決定）。underline は下の棒だけ、underline-dim は棒に加えてほかの画像を少し薄くする
    indicator: {
      underline: {},
      'underline-dim': {
        root: '[--thumbnails-hover-opacity:var(--thumbnails-dim-hover-opacity)] [--thumbnails-rest-opacity:var(--thumbnails-dim-rest-opacity)]',
      },
    },
  },
  defaultVariants: { color: 'neutral', indicator: 'underline' },
});

/** 選んでいる印の色 */
export type ThumbnailsColor = 'neutral' | 'primary' | 'secondary';

/** 選んでいる印。underline は下の棒だけ、underline-dim は棒に加えてほかの画像を少し薄くする */
export type ThumbnailsIndicator = 'underline' | 'underline-dim';

export interface ThumbnailsProps extends Omit<
  ComponentProps<'div'>,
  'children' | 'color' | 'defaultValue' | 'onChange'
> {
  /**
   * 小さな画像。並べた子の 1 つずつが、押して選べる 1 つになります。`img`（Next.js の Image も）を並べ、alt を書きます。
   * alt が、読み上げでのその 1 つの名前になります
   */
  children?: ReactNode;
  /** 選んでいる 1 つ（0 から数える。制御）。Carousel の thumbnails に渡したときは、書かなければ Carousel のいまの 1 枚です */
  value?: number;
  /**
   * はじめに選んでおく 1 つ（0 から数える。非制御）
   * @default 0
   */
  defaultValue?: number;
  /** 選んでいる 1 つが変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: number) => void;
  /**
   * 並びの読み上げの名前
   * @default '画像を選ぶ'
   */
  accessibleName?: string;
  /**
   * 選んでいる印の色。neutral は濃いグレー、primary は青、secondary はピンクです
   * @default 'neutral'
   */
  color?: ThumbnailsColor;
  /**
   * 選んでいる印。underline は画像の下に棒を引きます。underline-dim は棒に加えて、選んでいない画像を少し薄くします
   * @default 'underline'
   */
  indicator?: ThumbnailsIndicator;
  /** いちばん外の要素に付きます */
  className?: string;
}

const clamp = (value: number, count: number) =>
  Math.min(Math.max(value, 0), Math.max(count - 1, 0));

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 小さな画像を並べ、押して切り替える帯。Carousel の `thumbnails` に渡すと、いまの 1 枚を示して切り替えます
 *
 * Carousel の外（Gallery など）では、`value`・`onValueChange` で、選んでいる番号と切り替えを受け取ります。
 */
export function Thumbnails({
  children,
  value,
  defaultValue = 0,
  onValueChange,
  accessibleName = '画像を選ぶ',
  color,
  indicator,
  className,
  ...props
}: ThumbnailsProps) {
  const carousel = use(CarouselSelectionContext);
  const items = Children.toArray(children).filter(
    (child) => !(typeof child === 'string' && child.trim() === '')
  );
  const count = items.length;
  const [state, setState] = useState(defaultValue);
  const selected = clamp(value ?? carousel?.value ?? state, count);
  const select = (next: number) => {
    const clamped = clamp(next, count);
    if (clamped === selected) return;
    setState(clamped);
    onValueChange?.(clamped);
    carousel?.onValueChange(clamped);
  };
  const s = styles({ color, indicator });

  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const placed = useRef(false);

  // 選んでいるものが見えている範囲の外に出たら、帯の中だけを送る（ページは動かさない）
  useEffect(() => {
    const item = tabs.current[selected];
    if (!viewport || !item) return;
    const room = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
    const view = viewport.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    let delta = 0;
    if (rect.left < view.left + room) delta = rect.left - view.left - room;
    else if (rect.right > view.right - room) delta = rect.right - view.right + room;
    const first = !placed.current;
    placed.current = true;
    if (delta === 0) return;
    viewport.scrollBy({ left: delta, behavior: first || reducedMotion() ? 'instant' : 'smooth' });
  }, [selected, viewport]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = {
      ArrowLeft: selected - 1,
      ArrowRight: selected + 1,
      Home: 0,
      End: count - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const clamped = clamp(next, count);
    select(clamped);
    tabs.current[clamped]?.focus();
  };

  return (
    <div data-slot="thumbnails" {...props} className={s.root({ className })}>
      <ScrollFrame
        slot="thumbnails-frame"
        orientation="horizontal"
        focusable={false}
        viewportClassName={s.viewport()}
        onViewport={setViewport}
      >
        <div
          role="tablist"
          aria-label={accessibleName}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className={s.list()}
        >
          {items.map((item, i) => (
            <button
              key={i}
              ref={(element) => {
                tabs.current[i] = element;
              }}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-controls={carousel?.slideId?.(i)}
              tabIndex={i === selected ? 0 : -1}
              onClick={() => select(i)}
              data-slot="thumbnails-item"
              className={s.item()}
            >
              {item}
            </button>
          ))}
        </div>
      </ScrollFrame>
    </div>
  );
}
