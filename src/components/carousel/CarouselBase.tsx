'use client';

import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useRef,
} from 'react';

import { CarouselSelectionContext } from '../../internal/carousel-context';
import { focusRing } from '../../internal/focus-styles';
import { PositionCount, PositionDots } from '../../internal/position-indicator';
import { breakpointVars, type Responsive } from '../../internal/breakpoints';
import { CaretLeftIcon, CaretRightIcon, PauseIcon, PlayIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';
import { Button } from '../button/Button';
import type { CarouselEngine } from './carousel-engine';
import { perViewCounts } from './per-view';
import { useAutoPlay } from './use-auto-play';
import type { CarouselState } from './use-carousel-state';

// 横に送って 1 枚ずつ見せる並び（作品のスクリーンショット、記事の中の数枚の画像）。値は design/tokens.css の --carousel-*
//   いまの 1 枚（useCarouselState）・見た目（CarouselView）・送る仕組み（engine。既定は use-scroll-snap-engine.ts）を分ける。
//     仕組みは carousel-engine.ts の形の hook。Carousel.tsx が 3 つを組む（ほかの仕組みも、同じように組めば差し込める）
//   構造（WAI-ARIA の Carousel パターン）: section（aria-roledescription="カルーセル"・名前）> 枠 > 並び > スライド
//     スライドは group（aria-roledescription="スライド"・「3 / 5」）。Thumbnails を組んだときは tabpanel（Thumbnails が tab）
//     いまの 1 枚が変わったら、画面に出さない知らせの箱が「3 / 5」を 1 回だけ読む（原則15）。見える「3 / 5」は読み上げに出さない
//   スライドはページと同じレイヤー。影を付けない（原則1）。枠の角はカードの角で、フォーカスの線がこの角に沿う（原則5）
//   枠はキーボードで止まり、←→ で 1 枚ずつ、Home・End で最初と最後へ送る
//   前へ・次へはアイコンだけのボタン（原則21: 単体なので太い線）
//     置き場所は controlsPosition（軸 285・決定）
//     bottom（既定）: 枠の下の行の両端に置き、位置の印は中央。枠線のボタン（ページに置く控えめな操作 — 原則7）。画像に重ねない（ImageZoom の × と同じ考え）
//     bottom-end: 枠の下の行の右にまとめ、位置の印は左
//     overlay: 画像の左右の中央に重ねる。白い塗りのボタン（浮いた押すもの。影と輪郭で、どの画像の上でも縁が分かる — 原則1）
//     端のスライドでは押せない見た目で残す（原則13。Pagination の前へ・次へと同じ。軸 289・決定）
//     押したボタンが押せなくなるときは、フォーカスを反対のボタンへ移す（押せないボタンからフォーカスが外れて、ページの先頭に戻らないように）
//   位置の印（indicator）: dots は点（いまの 1 枚は横に伸ばして濃くする）、count は「3 / 5」（Pagination のいちばん狭い形と同じ）、none は出さない
//     点と数は internal/position-indicator.tsx（Gallery と共有）
//     点は押せない（押せる範囲を部品の大きさに取れないため — 原則17）。送るのは前へ・次へ・指・キーボード・Thumbnails
//     Thumbnails を組んだときは、Thumbnails が位置を示すので既定で出さない（軸 286・決定）
//   peek（軸 287・決定）: 1 枚を少し狭くして中央に止め、両隣の端をのぞかせる。既定は 1 枚を幅いっぱい
//   続きがあることは、位置の印と次へのボタンで見せる。枠の端に影は落とさない（画像そのものに影がかかるため）
//   slidesPerView: 1 画面に並べる枚数。数か、画面の幅の段ごとの数（Grid の columns と同じ形）。1 つずつ送り、止まる位置は「枚数 − 並べる数 + 1」
//     1 枚の幅は「(枠の幅 − 間 ×（並べる数 − 1）) ÷ 並べる数」。ちょうど収め、次の 1 枚の端はのぞかせない（軸 452・決定）
//     いま何枚並んでいるかは、送る仕組み（engine）が測って visibleCount で返す（画面の幅の段は CSS が決めるため）
//   loop: 端でつながる。最後の次は最初へ、最初の前は最後へ戻る（並びを巻き戻して送る。複製は置かない）
//   autoPlay（use-auto-play.ts）: 間（autoPlayInterval）ごとに次へ送り、最後のあとは最初へ戻る。止めるボタンを必ず出す（WCAG 2.2.2）
//     送っているあいだは、読み上げの「3 / 5」を黙らせる（WAI-ARIA の Carousel パターン）
//     止めるボタンは、下の行の位置の印の左に置く、線のないいちばん軽いボタン（前へ・次へより一段控えめ。画像に重ねない — 軸 451・決定）
//   thumbnailsPlacement: Thumbnails の置き場所。bottom は枠の下、start・end は枠の横に縦に並べる（Thumbnails は縦向きになる）

const styles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-(--carousel-controls-gap)',
    // Thumbnails を包む。横に置くときは枠の高さに合わせ（自分の高さで行を伸ばさない）、はみ出す分は帯の中でスクロールする
    thumbnails: 'min-w-0',
    // 自動の送りを止めるボタンと位置の印を、下の行の 1 つの欄にまとめる
    autoplayInline:
      'flex items-center gap-(--carousel-autoplay-inline-gap) [justify-self:var(--carousel-indicator-justify)] [grid-area:indicator]',
    stage: 'relative min-w-0',
    // 1 枚の幅（--carousel-slide-size）は、枠の幅に対する割合（cqi）で書く
    viewport: [
      '@container relative rounded-(--radius-card)',
      ...focusRing,
      'transition-[outline-color,outline-offset] duration-(--focus-ring-duration) ease-(--ease-press) motion-reduce:transition-none',
    ],
    // 並びは中身の幅（w-max）。center で最初と最後の 1 枚も中央に止めるときは、両端に --carousel-track-inset の余白を取る
    track: 'flex w-max items-start gap-(--carousel-gap) px-(--carousel-track-inset)',
    slide: [
      'w-(--carousel-slide-size) min-w-0 shrink-0 grow-0',
      '[scroll-snap-align:var(--carousel-snap-align)] [scroll-snap-stop:always]',
    ],
    controls: [
      'grid min-w-0 items-center gap-2',
      'grid-cols-(--carousel-controls-columns) [grid-template-areas:var(--carousel-controls-areas)]',
    ],
    prev: '[grid-area:prev]',
    next: '[grid-area:next]',
    indicator: '[justify-self:var(--carousel-indicator-justify)] [grid-area:indicator]',
    overlayPrev:
      'pointer-events-none absolute inset-y-0 left-(--carousel-overlay-inset) flex items-center *:pointer-events-auto',
    overlayNext:
      'pointer-events-none absolute inset-y-0 right-(--carousel-overlay-inset) flex items-center *:pointer-events-auto',
    // 位置の印の形と色は internal/position-indicator.tsx（Gallery と共有）。ここは行の中の高さと文字の大きさ
    dots: 'h-(--spacing-control)',
    count: 'h-(--spacing-control) text-(length:--text-control) leading-(--leading-control)',
  },
  variants: {
    mode: {
      // 枠そのものが横にスクロールし、scroll-snap で 1 枚ずつ止まる。つまみは出さない（位置は印とボタンで見せる）
      scroll: {
        viewport: [
          'snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        ],
      },
      // 枠を切り取り、中の並びを仕組みが動かす（Embla など）
      transform: { viewport: 'overflow-hidden' },
    },
    // 前へ・次へと位置の印の並び。bottom-end は印を左、ボタンを右にまとめる
    controlsPosition: {
      bottom: {},
      'bottom-end': {
        controls:
          "[--carousel-controls-areas:'indicator_prev_next'] [--carousel-controls-columns:1fr_auto_auto] [--carousel-indicator-justify:start]",
      },
      overlay: {},
    },
    // 両隣を少し見せる。1 枚を狭くして中央に止め、最初と最後の 1 枚も中央に止まるよう両端に余白を取る
    // 1 画面に複数枚。並べる数は --carousel-per-view（画面の幅の段ごとに --carousel-per-view-<段> から読む）
    perView: {
      true: {
        root: [
          '[--carousel-per-view-base:initial] [--carousel-per-view-lg:initial] [--carousel-per-view-md:initial] [--carousel-per-view-sm:initial] [--carousel-per-view-xl:initial]',
          '[--carousel-per-view:var(--carousel-per-view-base,1)]',
          'sm:[--carousel-per-view:var(--carousel-per-view-sm,var(--carousel-per-view-base,1))]',
          'md:[--carousel-per-view:var(--carousel-per-view-md,var(--carousel-per-view-sm,var(--carousel-per-view-base,1)))]',
          'lg:[--carousel-per-view:var(--carousel-per-view-lg,var(--carousel-per-view-md,var(--carousel-per-view-sm,var(--carousel-per-view-base,1))))]',
          'xl:[--carousel-per-view:var(--carousel-per-view-xl,var(--carousel-per-view-lg,var(--carousel-per-view-md,var(--carousel-per-view-sm,var(--carousel-per-view-base,1)))))]',
          '[--carousel-gap:var(--carousel-per-view-gap)]',
          '[--carousel-slide-size:calc((100cqi-var(--carousel-gap)*(var(--carousel-per-view)-1))/var(--carousel-per-view))]',
        ],
      },
      false: {},
    },
    // Thumbnails の置き場所。start・end は枠の横に置き、前へ・次へと位置の印の行は枠の下だけに置く
    thumbnailsPlacement: {
      bottom: {},
      start: {
        root: [
          'grid [grid-template-columns:auto_minmax(0,1fr)] items-start gap-x-(--carousel-thumbnails-side-gap)',
          "[grid-template-areas:'thumbnails_stage'_'._controls']",
        ],
        stage: '[grid-area:stage]',
        controls: '[grid-area:controls]',
        thumbnails: 'h-0 min-h-full [grid-area:thumbnails]',
      },
      end: {
        root: [
          'grid [grid-template-columns:minmax(0,1fr)_auto] items-start gap-x-(--carousel-thumbnails-side-gap)',
          "[grid-template-areas:'stage_thumbnails'_'controls_.']",
        ],
        stage: '[grid-area:stage]',
        controls: '[grid-area:controls]',
        thumbnails: 'h-0 min-h-full [grid-area:thumbnails]',
      },
    },
    peek: {
      true: {
        root: [
          '[--carousel-gap:var(--carousel-peek-gap)] [--carousel-slide-size:var(--carousel-peek-slide-size)] [--carousel-snap-align:center]',
          '[--carousel-track-inset:calc((100cqi-var(--carousel-peek-slide-size))/2)]',
        ],
      },
      false: {},
    },
  },
});

/** 1 画面に並べる枚数。数か、画面の幅の段ごとの数（`{ base: 1, md: 3 }`。Grid の columns と同じ段） */
export type CarouselSlidesPerView = Responsive<number>;

/** Thumbnails の置き場所。bottom は枠の下、start は枠の左、end は枠の右に縦に並べる */
export type CarouselThumbnailsPlacement = 'bottom' | 'start' | 'end';

/** 位置の印。dots は点、count は「3 / 5」、none は出さない */
export type CarouselIndicator = 'dots' | 'count' | 'none';

/** 前へ・次への置き場所。bottom は枠の下の行の両端、bottom-end は下の行の右にまとめる、overlay は画像の左右の中央に重ねる */
export type CarouselControlsPosition = 'bottom' | 'bottom-end' | 'overlay';

export interface CarouselProps extends Omit<
  ComponentProps<'section'>,
  'children' | 'defaultValue' | 'onChange'
> {
  /** スライド。並べた子の 1 つずつが 1 枚になります（Image・Figure・カードなど） */
  children?: ReactNode;
  /** いまの 1 枚（0 から数える。制御） */
  value?: number;
  /**
   * はじめの 1 枚（0 から数える。非制御）
   * @default 0
   */
  defaultValue?: number;
  /** いまの 1 枚が変わるときに、次の値を渡して呼びます。指やトラックパッドで送ったときも呼びます */
  onValueChange?: (value: number) => void;
  /** 読み上げの名前（「作品の画面」など）。何のスライドかを、中を読む前に伝えます */
  accessibleName?: string;
  /**
   * 位置の印。dots は点、count は「3 / 5」、none は出しません
   * @default thumbnails があれば 'none'、なければ 'dots'
   */
  indicator?: CarouselIndicator;
  /**
   * 前へ・次へのボタンの置き場所。bottom は枠の下の行の両端（位置の印は中央）、bottom-end は下の行の右にまとめます（位置の印は左）。
   * どちらも枠線のボタンです。overlay は画像の左右の中央に重ねます（白いボタン）
   * @default 'bottom'
   */
  controlsPosition?: CarouselControlsPosition;
  /**
   * 両隣のスライドの端を少し見せます。1 枚を少し狭くして中央に止めます。書かないときは 1 枚を幅いっぱいに見せます
   * @default false
   */
  peek?: boolean;
  /**
   * 1 画面に並べる枚数。数か、画面の幅の段ごとの数（`{ base: 1, md: 3 }`。段は Grid の `columns` と同じ）を渡します。
   * 送るのは 1 枚ずつです。書かないときは 1 枚を幅いっぱいに見せます（`peek` は 1 枚のときだけ効きます）。
   * 数は 1 以上の整数です。小数は切り捨て、1 未満の段は渡していないものとして 1 つ下の段の値を使います
   */
  slidesPerView?: CarouselSlidesPerView;
  /**
   * 端でつなぎます。最後の次は最初へ、最初の前は最後へ戻ります。前へ・次へはいつも押せます
   * @default false
   */
  loop?: boolean;
  /**
   * 間（`autoPlayInterval`）ごとに、自動で次の 1 枚へ送ります。最後のあとは最初へ戻ります。
   * 止めるボタンを出し、マウスを載せているあいだと、中にキーボードのフォーカスがあるあいだも止まります。
   * 動きを減らす設定では、止めた状態で始まります（ボタンで送りはじめられます）
   * @default false
   */
  autoPlay?: boolean;
  /**
   * 自動で送る間（ミリ秒）
   * @default 5000
   */
  autoPlayInterval?: number;
  /**
   * 自動の送りを止めるボタンの読み上げの名前
   * @default '自動の送りを止める'
   */
  pauseName?: string;
  /**
   * 止めた送りを始めるボタンの読み上げの名前
   * @default '自動の送りを始める'
   */
  playName?: string;
  /**
   * 枠の下に置く Thumbnails（`<Thumbnails>…</Thumbnails>`）。置くと、Thumbnails の value と切り替えを Carousel とつなぎます
   */
  thumbnails?: ReactNode;
  /**
   * Thumbnails の置き場所。bottom は枠の下、start は枠の左、end は枠の右です。start・end では Thumbnails を縦に並べ、枠の高さに収めます
   * @default 'bottom'
   */
  thumbnailsPlacement?: CarouselThumbnailsPlacement;
  /**
   * 前へのボタンの読み上げの名前
   * @default '前のスライド'
   */
  prevName?: string;
  /**
   * 次へのボタンの読み上げの名前
   * @default '次のスライド'
   */
  nextName?: string;
  /** いちばん外の要素（section）に付きます */
  className?: string;
}

export interface CarouselViewProps extends Omit<
  CarouselProps,
  'children' | 'value' | 'defaultValue' | 'onValueChange'
> {
  /** useCarouselState の返り値 */
  state: CarouselState;
  /** 送る仕組み（carousel-engine.ts の形の hook の返り値） */
  engine: CarouselEngine;
}

interface StepButtonProps {
  direction: 'prev' | 'next';
  overlay: boolean;
  name: string;
  viewportId: string;
  disabled: boolean;
  onClick: () => void;
  ref: Ref<HTMLButtonElement>;
  className?: string;
}

/** 前へ・次へのボタン。below は枠線のボタン、overlay は白い塗りのボタン（丸） */
function StepButton({
  direction,
  overlay,
  name,
  viewportId,
  disabled,
  onClick,
  ref,
  className,
}: StepButtonProps) {
  return (
    <Button
      ref={ref}
      iconOnly
      variant={overlay ? 'filled' : 'outline'}
      color={overlay ? 'white' : 'neutral'}
      shape={overlay ? 'circle' : 'square'}
      aria-label={name}
      aria-controls={viewportId}
      disabled={disabled}
      onClick={onClick}
      data-slot={`carousel-${direction}`}
      className={className}
    >
      {direction === 'prev' ? <CaretLeftIcon standalone /> : <CaretRightIcon standalone />}
    </Button>
  );
}

/** 使う側のハンドラのあとに、部品のハンドラを呼ぶ */
function chain<E>(own: ((event: E) => void) | undefined, ours: (event: E) => void) {
  return (event: E) => {
    own?.(event);
    ours(event);
  };
}

interface AutoPlayButtonProps {
  playing: boolean;
  pauseName: string;
  playName: string;
  viewportId: string;
  onClick: () => void;
}

/** 自動の送りを止める・始めるボタン。送っているあいだは一時停止の印、止めたら再生の印 */
function AutoPlayButton({
  playing,
  pauseName,
  playName,
  viewportId,
  onClick,
}: AutoPlayButtonProps) {
  return (
    <Button
      iconOnly
      variant="underline"
      color="neutral"
      aria-label={playing ? pauseName : playName}
      aria-controls={viewportId}
      onClick={onClick}
      data-slot="carousel-autoplay"
    >
      {playing ? <PauseIcon standalone /> : <PlayIcon standalone />}
    </Button>
  );
}

/**
 * Carousel の見た目。いまの 1 枚（state）と送る仕組み（engine）を受け取って描く。公開の Carousel は scroll-snap の仕組みを渡す
 */
export function CarouselView({
  state: { slides, count, index, change: changeTo },
  engine: { mode, bindViewport, canPrev: engineCanPrev, canNext: engineCanNext, visibleCount },
  accessibleName,
  indicator: indicatorProp,
  controlsPosition = 'bottom',
  peek = false,
  slidesPerView,
  loop = false,
  autoPlay = false,
  autoPlayInterval = 5000,
  pauseName = '自動の送りを止める',
  playName = '自動の送りを始める',
  thumbnails,
  thumbnailsPlacement = 'bottom',
  prevName = '前のスライド',
  nextName = '次のスライド',
  className,
  style,
  ...props
}: CarouselViewProps) {
  // 止まる位置の数。複数枚を並べるときは、最後の数枚がまとめて見えた位置が最後
  const stops = Math.max(1, count - Math.max(1, visibleCount ?? 1) + 1);
  const position = Math.min(index, stops - 1);
  const wraps = loop && stops > 1;
  // 端でつながるときは、外のエンジンが端と言っても押せる（反対の端へ回す）
  const canPrev = wraps || (engineCanPrev ?? position > 0);
  const canNext = wraps || (engineCanNext ?? position < stops - 1);
  const indicator = indicatorProp ?? (thumbnails != null ? 'none' : 'dots');
  const perViewByBreakpoint = perViewCounts(slidesPerView);
  const perView = perViewByBreakpoint != null;
  const s = styles({
    mode,
    controlsPosition,
    peek: peek && !perView,
    perView,
    thumbnailsPlacement: thumbnails != null ? thumbnailsPlacement : 'bottom',
  });

  // 端でつながるときは、範囲の外を反対の端へ回す
  const change = (next: number) => {
    if (wraps && next < 0) changeTo(stops - 1);
    else if (wraps && next > stops - 1) changeTo(0);
    else changeTo(Math.min(next, stops - 1));
  };

  const auto = useAutoPlay({
    enabled: autoPlay && stops > 1,
    interval: autoPlayInterval,
    position,
    onTick: () => changeTo(position + 1 > stops - 1 ? 0 : position + 1),
  });

  const id = useId();
  const viewportId = `${id}-viewport`;
  const slideId = useCallback((i: number) => `${id}-slide-${i}`, [id]);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // 押したボタンが押せなくなるときは、フォーカスを反対のボタンへ移す
  const goPrev = () => {
    if (
      !wraps &&
      position - 1 <= 0 &&
      engineCanPrev === undefined &&
      document.activeElement === prevRef.current
    )
      nextRef.current?.focus();
    change(position - 1);
  };
  const goNext = () => {
    if (
      !wraps &&
      position + 1 >= stops - 1 &&
      engineCanNext === undefined &&
      document.activeElement === nextRef.current
    )
      prevRef.current?.focus();
    change(position + 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // 中のリンクやボタンにいるときは奪わない
    if (event.target !== event.currentTarget) return;
    const next = {
      ArrowLeft: position - 1,
      ArrowRight: position + 1,
      Home: 0,
      End: stops - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    change(next);
  };

  const overlay = controlsPosition === 'overlay';
  const prevButton = (
    <StepButton
      direction="prev"
      overlay={overlay}
      name={prevName}
      viewportId={viewportId}
      disabled={!canPrev}
      onClick={goPrev}
      ref={prevRef}
      className={overlay ? undefined : s.prev()}
    />
  );
  const nextButton = (
    <StepButton
      direction="next"
      overlay={overlay}
      name={nextName}
      viewportId={viewportId}
      disabled={!canNext}
      onClick={goNext}
      ref={nextRef}
      className={overlay ? undefined : s.next()}
    />
  );

  const showAutoPlay = autoPlay && stops > 1;
  const autoPlayButton = (
    <AutoPlayButton
      playing={auto.playing}
      pauseName={pauseName}
      playName={playName}
      viewportId={viewportId}
      onClick={auto.toggle}
    />
  );

  const indicatorElement =
    indicator === 'dots' ? (
      <PositionDots
        index={position}
        count={stops}
        slot="carousel-dots"
        className={showAutoPlay ? s.dots() : s.indicator({ className: s.dots() })}
      />
    ) : indicator === 'count' ? (
      <PositionCount
        index={position}
        count={stops}
        slot="carousel-count"
        className={showAutoPlay ? s.count() : s.indicator({ className: s.count() })}
      />
    ) : null;
  // 止めるボタンは、位置の印の左に置く
  const indicatorCell = showAutoPlay ? (
    <div className={s.autoplayInline()}>
      {autoPlayButton}
      {indicatorElement}
    </div>
  ) : (
    indicatorElement
  );
  const showControls = !overlay || indicatorCell !== null;

  return (
    <section
      aria-roledescription="カルーセル"
      aria-label={accessibleName}
      data-slot="carousel"
      {...props}
      {...(showAutoPlay && {
        // 使う側が渡したハンドラも呼ぶ
        onPointerEnter: chain(props.onPointerEnter, auto.rootProps.onPointerEnter),
        onPointerLeave: chain(props.onPointerLeave, auto.rootProps.onPointerLeave),
        onFocus: chain(props.onFocus, auto.rootProps.onFocus),
        onBlur: chain(props.onBlur, auto.rootProps.onBlur),
      })}
      style={{ ...breakpointVars('carousel-per-view', perViewByBreakpoint), ...style }}
      className={s.root({ className })}
    >
      <div className={s.stage()}>
        <div
          ref={bindViewport}
          id={viewportId}
          tabIndex={0}
          onKeyDown={onKeyDown}
          data-slot="carousel-viewport"
          className={s.viewport()}
        >
          <div data-slot="carousel-track" className={s.track()}>
            {slides.map((slide, i) => (
              <div
                key={i}
                id={slideId(i)}
                role={thumbnails != null ? 'tabpanel' : 'group'}
                aria-roledescription="スライド"
                aria-label={`${i + 1} / ${count}`}
                data-slot="carousel-slide"
                data-current={i === index || undefined}
                className={s.slide()}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>
        {overlay && (
          <>
            <div className={s.overlayPrev()}>{prevButton}</div>
            <div className={s.overlayNext()}>{nextButton}</div>
          </>
        )}
      </div>
      {showControls && (
        <div data-slot="carousel-controls" className={s.controls()}>
          {!overlay && prevButton}
          {indicatorCell}
          {!overlay && nextButton}
        </div>
      )}
      {thumbnails != null && (
        <div data-slot="carousel-thumbnails" className={s.thumbnails()}>
          <CarouselSelectionContext
            value={{
              value: index,
              onValueChange: changeTo,
              slideId,
              orientation: thumbnailsPlacement === 'bottom' ? 'horizontal' : 'vertical',
              // 帯の内側（スライドの側）に棒、外側につまみ
              slideSide: thumbnailsPlacement === 'end' ? 'start' : 'end',
            }}
          >
            {thumbnails}
          </CarouselSelectionContext>
        </div>
      )}
      {/* いまの位置が変わったときに、1 回だけ読む。自動で送っているあいだは黙る */}
      <div aria-live={auto.running ? 'off' : 'polite'} aria-atomic="true" className="sr-only">
        {`${position + 1} / ${stops}`}
      </div>
    </section>
  );
}
