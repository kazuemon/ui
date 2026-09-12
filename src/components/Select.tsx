import { Select as BaseSelect } from '@base-ui/react/select';
import {
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { Field } from './Field';
import { FieldAddon } from './FieldAddon';
import type { AddonShape } from './field-addon-context';
import { controlBox } from './field-styles';
import { focusRing } from './focus-styles';
import { CaretDownIcon, CheckIcon, XIcon } from './icons';

export interface SelectItem {
  label: string;
  value: string;
}

/** 選択肢の出し方。popover: 本体の下に浮かべる、sheet: 画面の下から出すシート、auto: 指で操作していて画面が狭いときはシート */
export type SelectPresentation = 'popover' | 'sheet' | 'auto';

/** シートを開いたときの高さ。half: 選択肢が長いときは半分の高さで開き、つまみを出す。full: 高さいっぱいで開く */
export type SheetDetent = 'half' | 'full';

/**
 * シートで、選択肢の上下に続きがあることの見せ方。下の端はどれも内側の影
 * shadow: 上も内側の影。divider: 上は区切り線（スクロールすると出る）
 * divider-always: 上は区切り線（いつも出す）。divider-shadow: 上は区切り線と内側の影（スクロールすると出る）
 * divider-always-shadow: 上は区切り線（いつも出す）と内側の影（スクロールすると出る）
 */
export type SheetMoreCue =
  | 'shadow'
  | 'divider'
  | 'divider-always'
  | 'divider-shadow'
  | 'divider-always-shadow';

export interface SelectProps {
  label: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  items: SelectItem[];
  placeholder?: string;
  /** 本体の前に付く文字（グレーのラベル）。例: 都道府県を選んだあとの市区町村の欄に「東京都」 */
  prefix?: ReactNode;
  /** prefix の形。既定は attached（本体の端に接する）、floating は本体の内側に浮かせる */
  addonShape?: AddonShape;
  defaultValue?: string;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  /** 選択肢を開いているか。開閉を外から決めるときに使う */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか。既定は true */
  modal?: boolean;
  /** 浮かぶ選択肢を描く場所。既定は body */
  container?: HTMLElement | null;
  /** 画面の端に当たったとき、選択肢を反対側に出すか・ずらすか。既定は Base UI のまま（反対側に出す） */
  collisionAvoidance?: ComponentProps<typeof BaseSelect.Positioner>['collisionAvoidance'];
  /** 選択肢の出し方。既定は auto（指で操作していて画面が狭いときはシート） */
  presentation?: SelectPresentation;
  /** シートを開いたときの高さ。既定は half */
  sheetDetent?: SheetDetent;
  /** シートで、選択肢の上下に続きがあることの見せ方。既定は divider-always-shadow */
  sheetMoreCue?: SheetMoreCue;
  /** 浮かぶ選択肢で、上下に続きがあることを内側の影で見せるか。既定は shadow */
  popoverMoreCue?: 'none' | 'shadow';
  /**
   * 浮かぶ選択肢の高さの上限。既定は screen
   * none: 画面の端まで伸ばす。screen: 画面の高さの半分（項目の数の上限は --select-popup-max-rows）で、最後の項目を半分見せる
   */
  popoverMaxHeight?: 'none' | 'screen';
  className?: string;
}

// auto では、指で操作していて、画面が狭いときにシートにする（design/adr/0037）
// シートにする理由は指の動きを減らすことなので、入力方式を見る。狭さは Tailwind のブレイクポイントで決める
//   縦長: md（768px）より狭い — スマートフォン、iPad mini
//   横長: lg（1024px）より狭い — スマートフォンの横持ち
// それより広い画面（タブレット）では浮かべたまま
const SHEET_QUERY = [
  '(pointer: coarse) and (orientation: portrait) and (max-width: 767.98px)',
  '(pointer: coarse) and (orientation: landscape) and (max-width: 1023.98px)',
].join(', ');
// シートの高さの上限と、半分で開くときの目安（画面の高さに対する割合）
const SHEET_FULL = 0.85;
const SHEET_HALF = 0.5;
// 続きの印が最も濃くなるまでのスクロールの量（px）
const CUE_RAMP = 24;
// 浮かぶ選択肢の高さの上限（画面の高さに対する割合）。popoverMaxHeight="screen" のとき
const POPOVER_MAX = 0.5;

// 画面の高さ。浮かぶ部分を描く場所（container）が画面より低いときは、その高さ（比較のストーリーの枠）
function screenHeight(container: HTMLElement | null | undefined) {
  return Math.min(container?.clientHeight ?? Infinity, window.innerHeight);
}

// 高さの上限の中に入る項目の数を数え、最後の項目が半分だけ見える高さにする（「まだ続きがある」ことを見せる）
function peekHeight(limit: number, option: number, fixed: number) {
  const rows = Math.max(1, Math.floor((limit - fixed) / option - 0.5));
  return Math.round(fixed + (rows + 0.5) * option);
}

function useNarrowScreen() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(SHEET_QUERY);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(SHEET_QUERY).matches,
    () => false
  );
}

interface SheetMetrics {
  /** 中身をすべて出したときの高さ */
  content: number;
  /** 半分で開くときの高さ。最後の項目が半分だけ見えるところで切る（「まだ続きがある」ことを見せる） */
  half: number;
  /** 高さの上限 */
  full: number;
}

/**
 * 選択肢から1つを選ぶ入力欄
 */
export function Select({
  label,
  caption,
  error,
  disabled,
  items,
  placeholder,
  prefix,
  addonShape = 'attached',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  container,
  collisionAvoidance,
  presentation = 'auto',
  sheetDetent = 'half',
  sheetMoreCue = 'divider-always-shadow',
  popoverMoreCue = 'shadow',
  popoverMaxHeight = 'screen',
  className,
  ...rootProps
}: SelectProps) {
  const narrow = useNarrowScreen();
  const sheet = presentation === 'sheet' || (presentation === 'auto' && narrow);

  // 開閉は部品の中でも持つ（シートの × とつまみで閉じるため）
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const [detent, setDetent] = useState<SheetDetent>(sheetDetent);
  // 選んだ・Esc・×・つまみで閉じたときは、フォーカスが本体に戻るまで、開いているときと同じ見た目を保つ（data-closing）
  // Base UI は閉じる動きが終わってからフォーカスを本体に戻すので、そのあいだ本体の青い枠線が一瞬消えていた
  // 外を押して閉じたときは、押した先にフォーカスが移るので保たない
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (!closing) return undefined;
    const id = setTimeout(() => setClosing(false), 600);
    return () => clearTimeout(id);
  }, [closing]);
  const changeOpen = (next: boolean, reason?: string) => {
    if (next) setDetent(sheetDetent);
    setOpenState(next);
    onOpenChange?.(next);
    setClosing(!next && reason !== 'outside-press' && reason !== 'focus-out');
  };

  // シートの高さ: 開いたときに見出しと選択肢の高さを測る
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<SheetMetrics | null>(null);
  // 上下に続きがあることの印の濃さ（--cue-top・--cue-bottom、0〜1）。スクロールした量に合わせて濃くし、急に出さない
  // 印の左右の位置（--cue-left・--cue-right）: シートでは端から描き（内側の余白の分だけ外へ出す）、
  // スクロールバーがあるときはその手前で止める。スクロールと高さの変化のたびに、要素の style に直接書く
  const updateCues = useCallback(() => {
    const list = listRef.current;
    const popup = list?.parentElement;
    if (!list || !popup) return;
    const rest = Math.max(0, list.scrollHeight - list.scrollTop - list.clientHeight);
    popup.style.setProperty('--cue-top', String(Math.min(1, list.scrollTop / CUE_RAMP)));
    popup.style.setProperty('--cue-bottom', String(Math.min(1, rest / CUE_RAMP)));
    const scrollbar = list.offsetWidth - list.clientWidth;
    const bleed = 'calc(var(--select-popup-padding) * -1)';
    popup.style.setProperty('--cue-left', bleed);
    popup.style.setProperty('--cue-right', scrollbar > 0 ? `${scrollbar}px` : bleed);
  }, []);
  const observer = useRef<ResizeObserver | null>(null);
  const measure = useCallback(
    (popup: HTMLDivElement | null) => {
      observer.current?.disconnect();
      if (!popup || !headerRef.current || !listRef.current) return;
      const style = getComputedStyle(popup);
      const frame =
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth);
      const header = headerRef.current.offsetHeight;
      const option =
        listRef.current.querySelector<HTMLElement>('[role="option"]')?.offsetHeight ?? 44;
      const screen = screenHeight(container);
      const rows = Math.max(1, Math.floor((screen * SHEET_HALF - frame - header) / option));
      setMetrics({
        content: frame + header + listRef.current.scrollHeight,
        half: Math.round(frame + header + (rows + 0.5) * option),
        full: Math.round(screen * SHEET_FULL),
      });
      observer.current = new ResizeObserver(updateCues);
      observer.current.observe(listRef.current);
    },
    [container, updateCues]
  );

  // 浮かぶ選択肢: 続きの影を出すときは、高さの変化を見て影の濃さを直す
  // popoverMaxHeight="screen" のときは、高さの上限（--select-popup-max-height）を、画面の高さの半分のうち
  // 最後の項目が半分見える高さにする。本体の下の空き（--available-height）での上限は、選択肢の CSS がかける
  const popoverCue = !sheet && popoverMoreCue === 'shadow';
  const popoverFit = !sheet && popoverMaxHeight === 'screen';
  const fitPopover = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const option = list.querySelector<HTMLElement>('[role="option"]')?.offsetHeight ?? 40;
    const style = getComputedStyle(list);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    // 項目の数の上限（--select-popup-max-rows）。大きな画面で長くなりすぎないようにする
    const maxRows = parseFloat(style.getPropertyValue('--select-popup-max-rows')) || Infinity;
    const limit = Math.min(screenHeight(container) * POPOVER_MAX, maxRows * option + padding);
    if (list.scrollHeight > limit) {
      list.style.setProperty(
        '--select-popup-max-height',
        `${peekHeight(limit, option, padding)}px`
      );
    } else {
      list.style.removeProperty('--select-popup-max-height');
    }
  }, [container]);
  const observeCues = useCallback(
    (popup: HTMLDivElement | null) => {
      observer.current?.disconnect();
      if (!popup || !listRef.current) return;
      const update = () => {
        if (popoverFit) fitPopover();
        updateCues();
      };
      requestAnimationFrame(update);
      observer.current = new ResizeObserver(update);
      observer.current.observe(listRef.current);
    },
    [fitPopover, popoverFit, updateCues]
  );

  // 選択肢が長いときだけ、半分の高さで開いてつまみを出す。つまみを引くと高さが変わり、下まで引くと閉じる
  const long = sheet && sheetDetent === 'half' && !!metrics && metrics.content > metrics.half + 1;
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragStart = useRef<{ y: number; height: number; moved: boolean } | null>(null);
  const restingHeight =
    long && metrics
      ? detent === 'half'
        ? metrics.half
        : Math.min(metrics.content, metrics.full)
      : undefined;
  const sheetHeight = dragHeight ?? restingHeight;

  const onHandleDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (restingHeight === undefined) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { y: event.clientY, height: restingHeight, moved: false };
  };
  const onHandleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || !metrics) return;
    const dy = event.clientY - start.y;
    if (Math.abs(dy) > 4) start.moved = true;
    if (start.moved) setDragHeight(Math.min(metrics.full, Math.max(0, start.height - dy)));
  };
  const onHandleUp = () => {
    const start = dragStart.current;
    dragStart.current = null;
    const height = dragHeight;
    setDragHeight(null);
    if (!start || !metrics) return;
    // 引かずに押したときは、半分と高さいっぱいを切り替える
    if (!start.moved || height === null) {
      setDetent(detent === 'half' ? 'full' : 'half');
      return;
    }
    if (height < metrics.half * 0.6) {
      changeOpen(false);
      return;
    }
    const full = Math.min(metrics.content, metrics.full);
    setDetent(Math.abs(height - metrics.half) <= Math.abs(height - full) ? 'half' : 'full');
  };

  // 選択肢が長いとき、上下に続きがあることを見せる印（sheetMoreCue）。濃さはスクロールした量に合わせる（updateCues）
  //   下の端はどれも内側の影（--color-select-sheet-edge-shadow）。上の端は、shadow: 内側の影、divider: 区切り線
  //   divider-always: いつも出す区切り線、divider-shadow: 区切り線と内側の影
  //   区切り線はシートの幅いっぱいに引き、影はスクロールバーの手前で止める
  const moreCue = (edge: 'top' | 'bottom') => {
    const top = edge === 'top';
    const level = top ? 'var(--cue-top, 0)' : 'var(--cue-bottom, 0)';
    // 浮かぶ選択肢は見出しがないので、上も影だけ
    const shadow =
      !top ||
      !sheet ||
      sheetMoreCue === 'shadow' ||
      sheetMoreCue === 'divider-shadow' ||
      sheetMoreCue === 'divider-always-shadow';
    const divider = sheet && top && sheetMoreCue !== 'shadow';
    const dividerAlways =
      sheetMoreCue === 'divider-always' || sheetMoreCue === 'divider-always-shadow';
    return (
      <div
        aria-hidden
        className={['pointer-events-none relative z-1 h-3 shrink-0', top ? '-mb-3' : '-mt-3'].join(
          ' '
        )}
      >
        {shadow && (
          <div
            className={[
              'absolute inset-y-0 right-[var(--cue-right,0px)] left-[var(--cue-left,0px)] from-(color:--color-select-sheet-edge-shadow) to-transparent',
              top ? 'bg-linear-to-b' : 'bg-linear-to-t',
            ].join(' ')}
            style={{ opacity: level }}
          />
        )}
        {divider && (
          <div
            className="absolute -inset-x-(--select-popup-padding) top-0 h-px bg-(color:--color-select-popup-line)"
            style={{ opacity: dividerAlways ? 1 : level }}
          />
        )}
      </div>
    );
  };

  return (
    <Field
      label={label}
      caption={caption}
      error={error}
      disabled={disabled}
      className={className}
      nativeLabel={false}
    >
      <BaseSelect.Root
        items={items}
        disabled={disabled}
        open={open}
        onOpenChange={(next, details) => changeOpen(next, details.reason)}
        {...rootProps}
      >
        {/* 選択肢を開いているあいだも、フォーカス中と同じ見た目にする */}
        {/* prefix は本体の左の余白を打ち消して、端から置く（--field-addon-pad） */}
        <BaseSelect.Trigger
          data-slot="control"
          data-closing={closing || undefined}
          onFocus={() => setClosing(false)}
          data-addon-shape={addonShape}
          className={controlBox({
            className: [
              'cursor-pointer text-left data-popup-open:border-focus data-popup-open:bg-field-focus',
              'data-closing:border-focus data-closing:bg-field-focus',
              '[--field-addon-pad:calc(var(--space-control-x)-var(--field-border-width))]',
            ],
          })}
        >
          {prefix != null && <FieldAddon>{prefix}</FieldAddon>}
          <BaseSelect.Value
            className="min-w-0 flex-1 truncate data-placeholder:text-fg-subtle"
            placeholder={placeholder}
          />
          <BaseSelect.Icon className="flex text-fg-muted">
            <CaretDownIcon />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal container={container}>
          {/* シートのときは、後ろの画面を暗くする（--color-select-sheet-backdrop） */}
          {sheet && (
            <BaseSelect.Backdrop className="fixed inset-0 z-10 bg-(color:--color-select-sheet-backdrop) transition-opacity duration-(--duration-sheet) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
          )}
          {/* 浮かぶ部分は、白い面に細い境界線とやわらかい影（浮かぶ UI の影は重なりを表す — design/adr/0036）
              選んだ項目は淡い青。見た目は design/tokens.css の --select-popup-*・--color-select-* で決める
              シートのときは、Base UI が付ける位置（インラインの style）を上書きして、画面の下に固定する */}
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            collisionAvoidance={collisionAvoidance}
            sideOffset={4}
            data-presentation={sheet ? 'sheet' : 'popover'}
            className={[
              'z-10 outline-none',
              sheet &&
                'inset-x-0! top-auto! bottom-0! left-0! flex max-h-[85%] flex-col [position:fixed]! [transform:none]!',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <BaseSelect.Popup
              ref={sheet ? measure : popoverCue || popoverFit ? observeCues : undefined}
              data-slot="select-popup"
              data-dragging={dragHeight !== null || undefined}
              style={sheetHeight !== undefined ? { height: sheetHeight } : undefined}
              className={[
                'p-(--select-popup-padding) text-(length:--text-control) leading-(--leading-control) text-fg outline-none',
                'border-(length:--select-popup-line-width) border-(color:--color-select-popup-line) bg-(color:--color-select-popup)',
                sheet
                  ? [
                      // シート: 上の角だけ丸め、下から滑り出る。高さはつまみに合わせて動く（引いているあいだは動きを止める）
                      // 下端は端末の安全領域の分だけ空ける
                      'flex min-h-0 w-full flex-col rounded-t-(--select-sheet-radius) border-x-0 border-b-0 [box-shadow:var(--shadow-select-sheet)]',
                      // 下端の余白（端末の安全領域の分）は選択肢の内側に持たせ、続きの印がシートの下端に接するようにする
                      'py-0',
                      '[transition:translate_var(--duration-sheet)_var(--ease-sheet),height_var(--duration-sheet)_var(--ease-sheet)] data-dragging:[transition:none] motion-reduce:[transition:none]',
                      'data-ending-style:translate-y-full data-starting-style:translate-y-full',
                    ].join(' ')
                  : [
                      // 上下の余白は選択肢の内側に持たせ、続きの影が面の上下の端に接するようにする。角丸で切り抜く
                      'min-w-(--anchor-width) origin-(--transform-origin) overflow-clip rounded-control py-0 [box-shadow:var(--shadow-select-popup)]',
                      'transition-[opacity,scale] duration-(--duration-press) ease-press data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0',
                    ].join(' '),
              ].join(' ')}
            >
              {/* シートの見出し: つまみ・ラベル・閉じるボタン・ヘルプテキスト
                  ラベルとヘルプテキストは、本体に付いているので読み上げでは隠す */}
              {sheet && (
                <div
                  ref={headerRef}
                  onPointerDown={onHandleDown}
                  onPointerMove={onHandleMove}
                  onPointerUp={onHandleUp}
                  onPointerCancel={onHandleUp}
                  className={[
                    'flex shrink-0 flex-col select-none',
                    long && 'cursor-grab touch-none',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {/* つまみ: 選択肢が長いときだけ出す。場所はいつも取っておく（高さを測るため） */}
                  <div aria-hidden className="flex h-4 items-center justify-center">
                    <div
                      className={[
                        'h-1 w-9 rounded-pill bg-(color:--color-line)',
                        !long && 'invisible',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  </div>
                  {/* ラベルとヘルプテキストは1つのまとまりにし、× とは切り離す
                      × は右上に固定する（ヘルプテキストが長くなっても動かない）。ラベルの行は × の中央にそろえる */}
                  <div className="relative">
                    <div
                      aria-hidden
                      className="flex flex-col gap-0.5 py-[calc((var(--size-control)-var(--leading-label))/2)] pr-(--size-control) pl-[calc(var(--space-control-x)-var(--select-popup-padding))]"
                    >
                      <div className="text-(length:--text-label) leading-(--leading-label) font-bold">
                        {label}
                      </div>
                      {caption && (
                        <div className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle">
                          {caption}
                        </div>
                      )}
                    </div>
                    {/* 選ばずに閉じる。アイコンだけのボタンなので線は Bold（design/adr/0018）
                        Tab では止まらない（開いた直後のフォーカスを選んだ項目に置くため）。キーボードでは Esc で閉じる */}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label="閉じる"
                      onClick={() => changeOpen(false)}
                      className={[
                        'absolute top-0 right-0 flex size-(--size-control) cursor-pointer items-center justify-center rounded-[calc(var(--radius-control)-var(--select-popup-padding))] text-fg-muted',
                        ...focusRing,
                        '[transition:background-color_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press)]',
                        'hover:bg-flat-hover active:bg-flat-press motion-reduce:[transition:none]',
                      ].join(' ')}
                    >
                      <XIcon standalone />
                    </button>
                  </div>
                </div>
              )}
              {(long || popoverCue) && moreCue('top')}
              <BaseSelect.List
                ref={listRef}
                onScroll={sheet || popoverCue ? updateCues : undefined}
                className={
                  sheet
                    ? 'min-h-0 flex-1 overflow-y-auto pb-[max(var(--select-popup-padding),env(safe-area-inset-bottom))]'
                    : // 浮かぶ選択肢の高さの上限（--select-popup-max-height）。未設定なら画面の端まで伸ばす
                      'max-h-[min(var(--available-height),var(--select-popup-max-height,var(--available-height)))] overflow-y-auto py-(--select-popup-padding)'
                }
              >
                {items.map((item) => (
                  <BaseSelect.Item
                    key={item.value}
                    value={item.value}
                    className={[
                      'flex h-(--size-control) cursor-pointer items-center gap-(--space-control-x) rounded-[calc(var(--radius-control)-var(--select-popup-padding))] px-[calc(var(--space-control-x)-var(--select-popup-padding))] outline-none select-none',
                      // hover（キーボードで選んでいるときも同じ）は、選んだ項目の見た目より優先する
                      'data-highlighted:bg-(color:--color-select-item-highlight)',
                      'data-selected:text-(color:--color-on-select-item-selected) data-selected:not-data-highlighted:bg-(color:--color-select-item-selected)',
                      // 選んだ項目の hover（開いた直後は、選んだ項目が hover と同じ状態になる）
                      'data-selected:data-highlighted:bg-(color:--color-select-item-selected-highlight)',
                    ].join(' ')}
                  >
                    <BaseSelect.ItemText className="flex-1">{item.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="flex text-(color:--color-select-check)">
                      <CheckIcon />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
              {(long || popoverCue) && moreCue('bottom')}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </Field>
  );
}
