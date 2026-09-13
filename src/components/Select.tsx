import { Select as BaseSelect } from '@base-ui/react/select';
import {
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  type CaptionPlacement,
  Field,
  type FieldLoadingBehavior,
  FieldLoadingBar,
  FieldSpinner,
} from './Field';
import { FieldAddon } from './FieldAddon';
import type { AddonShape } from './field-addon-context';
import { controlBox, fieldStyles } from './field-styles';
import { focusRing } from './focus-styles';
import { CaretDownIcon, CheckIcon, WarningCircleIcon, WarningIcon, XIcon } from './icons';
import { type LoadingIndicator, Spinner } from './Loading';

/**
 * 選択肢に付く文の種類（design/adr/0044）
 * reason: 選べない理由。キャプションと同じ灰色の文字だけ（アイコンなし）。disabled の選択肢に付ける
 * warning: 選べるが、選ぶ前に知っておくこと。本体の下の警告の行と同じ三角とオリーブ色の文字
 */
export type SelectItemNoteKind = 'reason' | 'warning';

/** 選択肢に付く文（ラベルの下の2行目）。文は呼び出し側が渡す。部品は文を組み立てない */
export interface SelectItemNote {
  kind: SelectItemNoteKind;
  text: ReactNode;
}

export interface SelectItem {
  label: string;
  value: string;
  /**
   * 選べない（design/adr/0044）。ラベルを押せない文字の色にし、押しても選ばれない
   * 矢印キーでは止まり、選べないこと（disabled）と note が読まれる。文字を打って探すときは飛ばす（Base UI のまま）
   */
  disabled?: boolean;
  /**
   * ラベルの下の2行目（design/adr/0044）。読み上げの名前はラベルだけで、この文は説明になる
   * 2行目のある選択肢だけ高くなる（指用 52px・マウス用 48px）
   */
  note?: SelectItemNote;
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
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない。シートでは見出しのラベルの下にも出す */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下（design/adr/0041）
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /**
   * エラーの内容。本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする
   * シートでは、見出しのヘルプテキストの下にも同じ行を出す（浮かぶ選択肢には出さない — design/adr/0044）
   */
  error?: ReactNode;
  /**
   * 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない
   * error と両方あるときは、エラーの行の下に出す（design/adr/0041 の追記）
   * シートでは、見出しのヘルプテキストの下にも同じ行を出す（error と同じ。両方あるときはエラー → 警告）
   */
  warning?: ReactNode;
  disabled?: boolean;
  /**
   * 選択肢。各項目に disabled（選べない）と note（ラベルの下の2行目）を付けられる（design/adr/0044）
   * 選べない理由や警告の文は、呼び出し側が組み立てて渡す（書き方は実装ガイドラインで決める）。部品は渡された文をそのまま出す
   */
  items: SelectItem[];
  placeholder?: string;
  /** 本体の前に付く文字（グレーのラベル）。例: 都道府県を選んだあとの市区町村の欄に「東京都」 */
  prefix?: ReactNode;
  /**
   * prefix の形。attached は本体の端に接する塊、floating は本体の内側に 4px 浮かせます（design/adr/0035）
   * @default 'attached'
   */
  addonShape?: AddonShape;
  defaultValue?: string;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  /** 選択肢を開いているか。開閉を外から決めるときに使う */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか
   * @default true
   */
  modal?: boolean;
  /**
   * 浮かぶ選択肢（popover）・シート（sheet）を描く場所
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 画面の端に当たったとき、選択肢を反対側に出すか・ずらすか。既定は Base UI のまま（反対側に出す） */
  collisionAvoidance?: ComponentProps<typeof BaseSelect.Positioner>['collisionAvoidance'];
  /**
   * 選択肢の出し方。auto は指で操作していて画面が狭いときだけシートにします。popover はいつも浮かべ、
   * sheet はいつもシートにします。シートにするのは指の動きを減らすためで、狭さそのものが理由ではありません（design/adr/0037）
   * @default 'auto'
   */
  presentation?: SelectPresentation;
  /**
   * シートを開いたときの高さ。half は選択肢が長いときに半分の高さで開き、つまみを出します。full は高さいっぱいで開きます
   * @default 'half'
   */
  sheetDetent?: SheetDetent;
  /**
   * シートで、選択肢の上下に続きがあることの見せ方。下の端はどれも内側の影です。上の端は、shadow は内側の影、
   * divider は区切り線（スクロールすると出る）、divider-always はいつも出す区切り線、
   * divider-shadow・divider-always-shadow は区切り線と内側の影の組み合わせです
   * @default 'divider-always-shadow'
   */
  sheetMoreCue?: SheetMoreCue;
  /**
   * 浮かぶ選択肢で、上下に続きがあることを内側の影で見せるか。none は見せません
   * @default 'shadow'
   */
  popoverMoreCue?: 'none' | 'shadow';
  /**
   * 浮かぶ選択肢の高さの上限
   * none: 画面の端まで伸ばす。screen: 画面の高さの半分（項目の数の上限は --select-popup-max-rows）で、最後の項目を半分見せる
   * @default 'screen'
   */
  popoverMaxHeight?: 'none' | 'screen';
  /**
   * 選択肢を読み込んでいる（design/adr/0042）。印を出し、本体に aria-busy を付ける
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込んでいるあいだの欄の扱い（design/adr/0042）
   * non-blocking: 止めない。プレースホルダはそのまま出し、開ける。開くと、選択肢の最後に loadingText の行（role="status"）を出す。回る円は ▼ の左
   * blocking: 止める。押せない欄と同じ見た目にし、プレースホルダの場所に loadingText を出す。▼ を隠し（回る円は ▼ のあった場所）、開けない
   * @default 'non-blocking'
   */
  loadingBehavior?: FieldLoadingBehavior;
  /**
   * 読み込んでいるあいだの印。spinner は回る円、bar は下端に流れる線です
   * @default 'spinner'
   */
  loadingIndicator?: LoadingIndicator;
  /**
   * 読み込んでいるあいだの文。blocking ではプレースホルダの場所に（プレースホルダと同じ色）、non-blocking では開いた選択肢の行に出す
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /**
   * Disabled のときの ▼。show はプレースホルダの場所の文と同じ色（--color-select-icon-disabled）で出し、hide は隠します
   * @default 'show'
   */
  disabledIcon?: 'show' | 'hide';
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

// 選択肢の各項目の高さ。note のある項目は高いので、項目ごとに測る（design/adr/0044）。隠れた項目（高さ 0）は数えない
function optionHeights(list: HTMLElement, fallback: number) {
  const heights = [...list.querySelectorAll<HTMLElement>('[role="option"]')]
    .map((el) => el.offsetHeight)
    .filter((height) => height > 0);
  return heights.length ? heights : [fallback];
}

// 項目 rows 個分の高さ（小数のときは、最後の項目のその割合）。項目が足りないときは、最後の項目の高さで数える
function rowsLength(heights: number[], rows: number) {
  if (!Number.isFinite(rows)) return Infinity;
  const at = (i: number) => heights[Math.min(i, heights.length - 1)];
  const whole = Math.floor(rows);
  let length = 0;
  for (let i = 0; i < whole; i += 1) length += at(i);
  return length + (rows - whole) * at(whole);
}

// 高さ avail の中に入る項目を上から数え、次の項目を半分だけ見せる高さを返す（「まだ続きがある」ことを見せる）
// halfInside: true は、半分の項目まで avail に収める（浮かぶ選択肢）。false は、収まる項目のあとに半分を足す（シート）
// 少なくとも1項目は出す。項目の高さがすべて同じときは、これまでの計算（（項目の数 ＋ 0.5）× 高さ）と同じになる
function peekLength(heights: number[], avail: number, halfInside: boolean) {
  const at = (i: number) => heights[Math.min(i, heights.length - 1)];
  let rows = 1;
  let used = at(0);
  while (used + at(rows) + (halfInside ? at(rows + 1) / 2 : 0) <= avail) {
    used += at(rows);
    rows += 1;
  }
  return used + at(rows) / 2;
}

const styles = fieldStyles();

// 選択肢の2行目（design/adr/0044）。文の大きさと行の高さはキャプションと同じ
//   reason: 選べない理由。キャプションと同じ灰色（--color-select-item-reason）の文字だけ
//   warning: 本体の下の警告の行と同じ形（三角＋ --color-fg-warning）。選んだ項目の青い文字の中でも、警告の色のまま
function SelectItemNoteLine({ note, id }: { note: SelectItemNote; id: string }) {
  if (note.kind === 'reason')
    return (
      <span
        id={id}
        data-slot="select-item-note"
        data-kind="reason"
        className="text-(length:--text-caption) leading-(--leading-caption) text-(color:--color-select-item-reason)"
      >
        {note.text}
      </span>
    );
  return (
    <span
      id={id}
      data-slot="select-item-note"
      data-kind="warning"
      className={styles.message({ className: 'text-fg-warning' })}
    >
      <WarningIcon className={styles.messageIcon()} />
      <span className="min-w-0">{note.text}</span>
    </span>
  );
}

// 選択肢の1項目。見た目は design/tokens.css の --select-popup-*・--color-select-* で決める（design/adr/0036）
// note のある項目だけ、ラベルの下に2行目を出して高さを伸ばす（上下 6px。1行の項目は --size-control のまま）
//   読み上げの名前はラベルだけ（aria-labelledby）、2行目は説明（aria-describedby）
// 選べない項目（disabled — design/adr/0044）: ラベルは押せない文字の色。押しても選ばれない
//   マウスの hover では塗らない（押せないため）。矢印キーでは止まるので、キーボードで止まったとき（focus-visible）だけ、
//   ほかの項目と同じ hover の塗りで、いまの場所を見せる
function SelectOption({ item }: { item: SelectItem }) {
  const id = useId();
  const { note } = item;
  const labelId = `${id}label`;
  const noteId = `${id}note`;
  return (
    <BaseSelect.Item
      value={item.value}
      disabled={item.disabled}
      aria-labelledby={note ? labelId : undefined}
      aria-describedby={note ? noteId : undefined}
      className={[
        'flex min-h-(--size-control) cursor-pointer items-center gap-(--space-control-x) rounded-[calc(var(--radius-control)-var(--select-popup-padding))] px-[calc(var(--space-control-x)-var(--select-popup-padding))] outline-none select-none',
        note && 'py-1.5',
        // hover（キーボードで選んでいるときも同じ）は、選んだ項目の見た目より優先する
        'data-highlighted:bg-(color:--color-select-item-highlight)',
        'data-selected:text-(color:--color-on-select-item-selected) data-selected:not-data-highlighted:bg-(color:--color-select-item-selected)',
        // 選んだ項目の hover（開いた直後は、選んだ項目が hover と同じ状態になる）
        'data-selected:data-highlighted:bg-(color:--color-select-item-selected-highlight)',
        // 選べない項目: hover の塗りを消し、キーボードで止まったとき（focus-visible）だけ付け直す
        // :not(:focus-visible) の形は使わない（Storybook の pseudo-states アドオンが書き換え、いつも塗りが消えていた）
        'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-select-item-disabled) data-disabled:data-highlighted:bg-transparent',
        'data-disabled:data-highlighted:focus-visible:bg-(color:--color-select-item-highlight)',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <BaseSelect.ItemText id={note ? labelId : undefined}>{item.label}</BaseSelect.ItemText>
        {note && <SelectItemNoteLine note={note} id={noteId} />}
      </div>
      <BaseSelect.ItemIndicator className="flex text-(color:--color-select-check)">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
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
  captionPlacement,
  error,
  warning,
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
  loading = false,
  loadingBehavior = 'non-blocking',
  loadingIndicator = 'spinner',
  loadingText = '読み込んでいます',
  disabledIcon = 'show',
  className,
  ...rootProps
}: SelectProps) {
  const narrow = useNarrowScreen();
  const sheet = presentation === 'sheet' || (presentation === 'auto' && narrow);
  // 読み込んでいるあいだ（design/adr/0042）。blocking は開けず、値も変えられない（readOnly）。フォーカスは外さない
  // non-blocking は、開いた選択肢の最後に「読み込んでいます」の行を出す
  const blocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !blocking;
  // シートの見出しに出す欄の文（design/adr/0044）。本体の下の行と同じ。両方渡したときは両方、エラー → 警告の順（design/adr/0041 の追記）
  const sheetId = useId();
  const sheetCaptionId = `${sheetId}caption`;
  const sheetMessages: { kind: 'error' | 'warning'; content: ReactNode; id: string }[] = [];
  if (error) sheetMessages.push({ kind: 'error', content: error, id: `${sheetId}error` });
  if (warning) sheetMessages.push({ kind: 'warning', content: warning, id: `${sheetId}warning` });

  // 開閉は部品の中でも持つ（シートの × とつまみで閉じるため）
  const [openState, setOpenState] = useState(defaultOpen);
  const open = blocking ? false : (openProp ?? openState);
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
    if (next && blocking) return;
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
      const heights = optionHeights(listRef.current, 44);
      const screen = screenHeight(container);
      setMetrics({
        content: frame + header + listRef.current.scrollHeight,
        half: Math.round(
          frame + header + peekLength(heights, screen * SHEET_HALF - frame - header, false)
        ),
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
    const heights = optionHeights(list, 40);
    const style = getComputedStyle(list);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    // 項目の数の上限（--select-popup-max-rows）。大きな画面で長くなりすぎないようにする
    const maxRows = parseFloat(style.getPropertyValue('--select-popup-max-rows')) || Infinity;
    const limit = Math.min(
      screenHeight(container) * POPOVER_MAX,
      rowsLength(heights, maxRows) + padding
    );
    if (list.scrollHeight > limit) {
      list.style.setProperty(
        '--select-popup-max-height',
        `${Math.round(padding + peekLength(heights, limit - padding, true))}px`
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
      captionPlacement={captionPlacement}
      error={error}
      warning={warning}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      className={className}
      nativeLabel={false}
    >
      {(messageIds) => (
        <BaseSelect.Root
          items={items}
          disabled={disabled}
          readOnly={blocking || undefined}
          open={open}
          onOpenChange={(next, details) => changeOpen(next, details.reason)}
          {...rootProps}
        >
          {/* 選択肢を開いているあいだも、フォーカス中と同じ見た目にする */}
          {/* prefix は本体の左の余白を打ち消して、端から置く（--field-addon-pad） */}
          {/* 説明はキャプション → エラー → 警告の順（見た目の順 — design/adr/0041） */}
          {/* 読み込んでいるあいだ（design/adr/0042）: 回る円は、止めないときは ▼ の左（間は 8px。ボタンの回る円とラベルの間と同じ）、
            止めるときは ▼ を隠してその場所に置く。線は本体の下端（本体を位置の基準にする）
            止めるときは、押せない欄と同じ見た目（controlBox）にする
            プレースホルダの場所の文（ふだんの文・押せないときの理由・止めるときの loadingText）は、どれも --color-fg-subtle
            押せない文字の色（--color-on-field-disabled）は選んだ値だけ。値が入った押せない欄と、文を出している欄を見分けるため */}
          <BaseSelect.Trigger
            aria-describedby={messageIds}
            aria-disabled={blocking || undefined}
            aria-busy={loading || undefined}
            data-slot="control"
            data-closing={closing || undefined}
            onFocus={() => setClosing(false)}
            data-addon-shape={addonShape}
            className={controlBox({
              className: [
                'text-left data-popup-open:border-focus data-popup-open:bg-field-focus',
                blocking ? 'cursor-progress' : 'cursor-pointer',
                loading && 'relative',
                'data-closing:border-focus data-closing:bg-field-focus',
                '[--field-addon-pad:calc(var(--space-control-x)-var(--field-border-width))]',
              ],
            })}
          >
            {prefix != null && <FieldAddon>{prefix}</FieldAddon>}
            <BaseSelect.Value
              className="min-w-0 flex-1 truncate data-placeholder:text-fg-subtle"
              placeholder={blocking ? loadingText : placeholder}
            />
            {loading && loadingIndicator === 'spinner' && (
              <FieldSpinner
                className={blocking ? undefined : 'me-[calc(8px-var(--space-control-x))]'}
              />
            )}
            {/* ▼。Disabled のときはプレースホルダの場所の文と同じ色（--color-select-icon-disabled。disabledIcon="hide" で隠す）
              止めて読み込んでいるあいだは隠す */}
            <BaseSelect.Icon
              className={[
                'flex text-fg-muted group-data-disabled/field:text-[color:var(--color-select-icon-disabled,var(--color-fg-muted))]',
                (blocking || (disabled && disabledIcon === 'hide')) && 'hidden',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <CaretDownIcon />
            </BaseSelect.Icon>
            {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
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
                {/* シートの見出し: つまみ・ラベル・閉じるボタン・ヘルプテキスト・欄のエラー・警告
                  ラベル・ヘルプテキスト・エラー・警告は、本体に付いているので読み上げでは隠す
                  ヘルプテキストとエラー・警告は、選択肢の一覧（listbox）の説明にもつなぐ（design/adr/0044） */}
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
                      × は右上に固定する（ヘルプテキストが長くなっても動かない）。ラベルの行は × の中央にそろえる
                      ヘルプテキストは、本体のどちら（captionPlacement）に置いていても、ラベルの下に出す
                      欄のエラー・警告は、ヘルプテキストの下に、本体の下と同じ行（アイコン＋文）で出す（design/adr/0044）
                      シートが本体の下の行を隠すことがあるため。浮かぶ選択肢には出さない
                      両方あるときはエラー → 警告。行の間は、ヘルプテキストとの間と同じ 4px（design/adr/0041 の追記） */}
                    <div className="relative">
                      <div
                        aria-hidden
                        className="flex flex-col gap-0.5 py-[calc((var(--size-control)-var(--leading-label))/2)] pr-(--size-control) pl-[calc(var(--space-control-x)-var(--select-popup-padding))]"
                      >
                        <div className="text-(length:--text-label) leading-(--leading-label) font-bold">
                          {label}
                        </div>
                        {caption && (
                          <div
                            id={sheetCaptionId}
                            className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle"
                          >
                            {caption}
                          </div>
                        )}
                        {sheetMessages.map(({ kind, content, id }) => {
                          const Icon = kind === 'error' ? WarningCircleIcon : WarningIcon;
                          return (
                            <div
                              key={kind}
                              id={id}
                              data-slot="select-sheet-message"
                              data-kind={kind}
                              className={styles.message({
                                className: [
                                  'mt-0.5',
                                  kind === 'error' ? 'text-danger' : 'text-fg-warning',
                                ].join(' '),
                              })}
                            >
                              <Icon className={styles.messageIcon()} />
                              <span className="min-w-0">{content}</span>
                            </div>
                          );
                        })}
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
                {/* 一覧の説明（design/adr/0044）: ヘルプテキスト → 欄のエラー → 警告
                  シートは見出しの文を、浮かぶ選択肢は本体の上下の文（本体の説明と同じ）を指す
                  選択肢に付く文（note）は、その選択肢の説明にあるので入れない */}
                <BaseSelect.List
                  ref={listRef}
                  aria-describedby={
                    sheet
                      ? [caption && sheetCaptionId, ...sheetMessages.map((message) => message.id)]
                          .filter(Boolean)
                          .join(' ') || undefined
                      : messageIds
                  }
                  onScroll={sheet || popoverCue ? updateCues : undefined}
                  // 「読み込んでいます」の行を出すときは、下の余白をその行に持たせる
                  className={
                    sheet
                      ? [
                          'min-h-0 flex-1 overflow-y-auto',
                          !loadingRow &&
                            'pb-[max(var(--select-popup-padding),env(safe-area-inset-bottom))]',
                        ]
                          .filter(Boolean)
                          .join(' ')
                      : // 浮かぶ選択肢の高さの上限（--select-popup-max-height）。未設定なら画面の端まで伸ばす
                        [
                          'max-h-[min(var(--available-height),var(--select-popup-max-height,var(--available-height)))] overflow-y-auto',
                          loadingRow
                            ? 'pt-(--select-popup-padding)'
                            : 'py-(--select-popup-padding)',
                        ].join(' ')
                  }
                >
                  {items.map((item) => (
                    <SelectOption key={item.value} item={item} />
                  ))}
                </BaseSelect.List>
                {(long || popoverCue) && moreCue('bottom')}
                {/* 止めずに読み込んでいるあいだ、選択肢の最後に出す行（design/adr/0042）。選べない。高さと左の余白は項目と同じ
                  選択肢の一覧（listbox）の中には選択肢しか置けないので、一覧のすぐ下に置き、読み上げには role="status" で伝える */}
                {loadingRow && (
                  <div
                    role="status"
                    data-slot="select-loading"
                    className={[
                      'flex h-(--size-control) shrink-0 items-center gap-2 px-[calc(var(--space-control-x)-var(--select-popup-padding))] text-fg-muted select-none',
                      sheet
                        ? 'mb-[max(var(--select-popup-padding),env(safe-area-inset-bottom))]'
                        : 'mb-(--select-popup-padding)',
                    ].join(' ')}
                  >
                    <Spinner />
                    {loadingText}
                  </div>
                )}
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
      )}
    </Field>
  );
}
