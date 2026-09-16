import { Select as BaseSelect } from '@base-ui/react/select';
import {
  type ComponentProps,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
  FieldSuccessMark,
} from './Field';
import { FieldAddon } from './FieldAddon';
import type { AddonShape } from './field-addon-context';
import { controlBox, fieldStyles } from './field-styles';
import { focusRing } from './focus-styles';
import { useFormSubmittingLock } from './form-context';
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

/** 選んだ項目の印の色。primary・secondary は利用者が選ぶ色、neutral は色を持たない（グレー）— 原則6、design/adr/0047 */
export type SelectColor = 'primary' | 'secondary' | 'neutral';

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
  /**
   * 成功の内容（「お届けできます」など）。本体の下に丸のチェックと緑の文字で出し、本体の ▼ の左（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。error があるときは、欄の見た目はエラーを優先します
   */
  success?: ReactNode;
  /**
   * 成功のとき、本体の ▼ の左にチェックを置くか。false では下の行だけを出します
   * @default true
   */
  successMark?: boolean;
  /** 情報の内容（「前回と同じ時間帯を選んでいます」など）。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  info?: ReactNode;
  disabled?: boolean;
  /**
   * 選んだ項目の印（面・文字・チェック）の色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（グレー）を選べます（原則6）。
   * hover とキーボードの選択は、色を指定していても入力欄と同じグレーです。指定しないときは既定のグレー（neutral）になります
   * @default 'neutral'
   */
  color?: SelectColor;
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
   * 本体の祖先に付いた data-density と coarse-large は、描く場所がその外でも、浮かぶ選択肢とシートに写します
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
   * つまみを引くと高さが変わります。上へはじくと高さいっぱいに広がり、下へはじくと、引いた距離が短くても一段下がります（半分からは閉じる）
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
   * 読み込んでいるあいだに開くと、読み上げで loadingText を知らせ、開いたまま読み込みが終わると loadedText を知らせる
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込んでいるあいだの欄の扱い（design/adr/0042）
   * non-blocking: 止めない。プレースホルダはそのまま出し、開ける。開くと、選択肢の最後に loadingText の行を出す。回る円は ▼ の左
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
   * non-blocking で読み込んでいるあいだに開いたときは、この文を読み上げでも知らせる
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /**
   * 読み込みが終わったときに、読み上げで知らせる文です。読み込んでいるあいだに開き、開いたまま読み込みが終わったときに、選択肢の数を受け取って返します
   * @default (count) => `${count} 件の選択肢`
   */
  loadedText?: (count: number) => string;
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
// シートのつまみを引く操作のしきい値。値は実機で詰める
// iOS・Android のシートと、vaul・Base UI の Drawer にならい、離す直前の速さで「はじいた」かを見る
//   flingVelocity: はじいたとみなす速さ（px/ms）。Base UI の Drawer は 0.5、vaul は 0.4、Android は 500px/s
//   velocityWindow: 離す直前のこの時間（ms）の動きから速さを出す。それより前から止まっていたら、はじいていない（Base UI は 80ms）
//   minVelocityDuration: 速さを出すときの時間の下限（ms）。動きの記録が1つしかないときに、速さが大きくなりすぎないようにする（Base UI は 16ms）
//   closeRatio: はじかずに離したとき、半分の高さのこの割合より低ければ閉じる
//   moveSlop: 動いた量がこれ以下（px）なら、引かずに押したとみなす
const SHEET_DRAG = {
  flingVelocity: 0.5,
  velocityWindow: 80,
  minVelocityDuration: 16,
  closeRatio: 0.6,
  moveSlop: 4,
} as const;
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

// 一覧の中身の高さ（項目の高さの合計＋上下の余白）。scrollHeight は一覧が引き伸ばされると中身より大きくなるので使わない
function listContentLength(list: HTMLElement) {
  const style = getComputedStyle(list);
  let length = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  for (const el of list.querySelectorAll<HTMLElement>('[role="option"]')) length += el.offsetHeight;
  return length;
}

// 一覧の下に置いた「読み込んでいます」の行の高さ（下の余白を含む）。高さの上限の計算に入れる（design/adr/0042）
function loadingRowLength(list: HTMLElement) {
  const row = list.parentElement?.querySelector<HTMLElement>('[data-slot="select-loading"]');
  if (!row) return 0;
  return row.offsetHeight + parseFloat(getComputedStyle(row).marginBottom);
}

// 選んだ項目の印の色（design/adr/0047）。face は淡い面、ink は文字とチェック
// neutral の面は、hover のグレー（入力欄の塗り）と見分けられる濃さのグレー（--color-select-neutral-selected）
// focus は、フォーカスの枠線と線を部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）の色。線なので、ピンクは前景用
//   neutral は持たない（--color-focus のまま）。本体には OWN_FOCUS のクラスで、浮かぶ部分（シートの × など）には style で置く
const TONES: Record<SelectColor, { face: string; ink: string; focus?: string }> = {
  primary: {
    face: 'var(--color-primary-subtle)',
    ink: 'var(--color-on-primary-subtle)',
    focus: 'var(--color-primary)',
  },
  secondary: {
    face: 'var(--color-secondary-subtle)',
    ink: 'var(--color-on-secondary-subtle)',
    focus: 'var(--color-fg-secondary)',
  },
  neutral: { face: 'var(--color-select-neutral-selected)', ink: 'var(--color-fg)' },
};

// 本体（Trigger）に置く --color-own-focus。TONES の focus と同じ値（Tailwind が読めるよう、クラスは文字列のまま書く）
const OWN_FOCUS: Record<SelectColor, string> = {
  primary: '[--color-own-focus:var(--color-primary)]',
  secondary: '[--color-own-focus:var(--color-fg-secondary)]',
  neutral: '',
};

// 選んだ項目の見た目を、部品の色から作る（ADR-0053: 淡い面＋部品の色の文字とチェック）。浮かぶ部分（Popup）に置き、項目のクラスが読む
type TokenStyle = CSSProperties & Record<`--${string}`, string>;

function selectedTokens(color: SelectColor): TokenStyle {
  const { face, ink, focus } = TONES[color];
  return {
    ...(focus ? { '--color-own-focus': focus } : {}),
    '--color-select-item-selected': face,
    // 選んだ項目の hover。面を一段濃く（文字の色を 8% 混ぜる）
    '--color-select-item-selected-highlight': `color-mix(in oklab, ${face}, ${ink} 8%)`,
    '--color-on-select-item-selected': ink,
    '--color-select-check': ink,
  };
}

const styles = fieldStyles();

const defaultLoadedText = (count: number) => `${count} 件の選択肢`;

// 読み込みの知らせ（design/adr/0042）。本体のそばにいつも置く、見えない status の箱の中身
//   読み込んでいるあいだに開いた（開いているあいだに読み込みを始めた）: loadingText
//   開いたまま読み込みが終わった: loadedText（選択肢の数）。閉じたら空に戻す
interface LoadingAnnouncement {
  open: boolean;
  loading: boolean;
  text: string;
}

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
        'group/option flex min-h-(--size-control) cursor-pointer items-center gap-(--space-control-x) rounded-[calc(var(--radius-control)-var(--select-popup-padding))] px-[calc(var(--space-control-x)-var(--select-popup-padding))] outline-none select-none',
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
        {/* 選んだ項目のラベルの太さ（--select-item-selected-weight）。2行目（note）は変えない */}
        <BaseSelect.ItemText
          id={note ? labelId : undefined}
          className="group-data-selected/option:[font-weight:var(--select-item-selected-weight)]"
        >
          {item.label}
        </BaseSelect.ItemText>
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

interface DragSample {
  y: number;
  t: number;
}

// 離したときの縦の速さ（px/ms。下向きが正）。離す直前 velocityWindow の間の動きから出す
function releaseVelocity(samples: DragSample[], y: number, t: number) {
  const first = samples.find((sample) => t - sample.t <= SHEET_DRAG.velocityWindow);
  if (!first) return 0;
  return (y - first.y) / Math.max(t - first.t, SHEET_DRAG.minVelocityDuration);
}

// 本体の祖先に付いた密度（data-density）と大きい指用（coarse-large）。浮かぶ部分とシートは body の直下に出て、
// 途中の要素から引き継がないので、浮かぶ部分に写す。html に付いたものは body の直下にも効くので写さない
interface DensityScope {
  density?: string;
  large: boolean;
}

function readDensityScope(el: Element | null): DensityScope {
  if (!el) return { large: false };
  const root = el.ownerDocument.documentElement;
  const density = el.closest<HTMLElement>('[data-density]');
  const large = el.closest('.coarse-large');
  return {
    density: density && density !== root ? density.dataset.density : undefined,
    large: !!large && large !== root,
  };
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
  success,
  successMark = true,
  info,
  disabled,
  color = 'neutral',
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
  loadedText = defaultLoadedText,
  disabledIcon = 'show',
  className,
  ...rootProps
}: SelectProps) {
  const narrow = useNarrowScreen();
  const sheet = presentation === 'sheet' || (presentation === 'auto' && narrow);
  // 読み込んでいるあいだ（design/adr/0042）。blocking は開けず、値も変えられない（readOnly）。フォーカスは外さない
  // non-blocking は、開いた選択肢の最後に「読み込んでいます」の行を出す
  const loadingBlocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !loadingBlocking;
  // Form の送信中（後半の軸 38）も、同じく開けず値も変えられない。見た目は Field の data-loading="blocking"（押せない欄）
  // 読み込みと違い、選んだ値はそのまま出し（loadingText に置き換えない）、回る円は出さず、▼ は押せない Select と同じ色で残す
  const formLock = useFormSubmittingLock();
  const blocking = loadingBlocking || formLock.blocking;
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
  // つまみを引いているあいだの高さ。はじいて・引いて閉じたときは、閉じる動きが終わるまで残し、離した高さのまま下へ滑らせる
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  // 引いているあいだは、高さの動き（transition）を止める
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    y: number;
    height: number;
    moved: boolean;
    samples: DragSample[];
  } | null>(null);
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
    if (next) {
      setDetent(sheetDetent);
      setDragHeight(null);
    }
    setOpenState(next);
    onOpenChange?.(next);
    setClosing(!next && reason !== 'outside-press' && reason !== 'focus-out');
  };

  // 読み込みの知らせ（design/adr/0042）。開くと同時に DOM に入る箱は、読み上げソフトによっては読まれない。
  // aria-busy も多くの読み上げソフトで読まれない。そこで、閉じていても消えない見えない status の箱を本体のそばに置き、中身だけを入れ替える
  // 見える読み込み中の行は role の箱にしない（二重に読まないため）
  const [announcement, setAnnouncement] = useState<LoadingAnnouncement>(() => ({
    open,
    loading: loadingRow,
    text: open && loadingRow ? loadingText : '',
  }));
  if (announcement.open !== open || announcement.loading !== loadingRow) {
    let { text } = announcement;
    if (!open) text = '';
    else if (loadingRow) text = loadingText;
    else if (announcement.open && announcement.loading) text = loadedText(items.length);
    setAnnouncement({ open, loading: loadingRow, text });
  }

  // 本体の祖先に付いた data-density・coarse-large を、開くたびに読み、浮かぶ部分（Positioner）に写す
  // 描く前（layout effect）に読むので、開いた最初の描画から同じ高さになる
  const triggerRef = useRef<HTMLButtonElement>(null);
  // 浮かぶ選択肢と本体の間（4px）。エラーの欄は、開いているあいだも本体の外に離した線を引くので（後半の軸 41 の M）、線の外側から同じ間をあける
  // 線の太さと離し方は、描いている線（outline）から読む
  const popupSideOffset = () => {
    const gap = 4;
    const el = triggerRef.current;
    if (el?.closest('[data-invalid]') == null) return gap;
    const style = getComputedStyle(el);
    const width = parseFloat(style.outlineWidth);
    return width > 0 ? gap + width + parseFloat(style.outlineOffset) : gap;
  };
  const [densityScope, setDensityScope] = useState<DensityScope>({ large: false });
  useLayoutEffect(() => {
    if (!open) return;
    const next = readDensityScope(triggerRef.current);
    setDensityScope((prev) =>
      prev.density === next.density && prev.large === next.large ? prev : next
    );
  }, [open]);

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
  // いま開いている浮かぶ部分。画面の大きさが変わったときに測り直すため
  const popupEl = useRef<HTMLDivElement | null>(null);
  // シートの高さを測る。開いたとき・選択肢の大きさが変わったとき・画面の大きさが変わったときに呼ぶ
  // 読み込み中の行（一覧の下）も中身に入れる（design/adr/0042）
  const readSheetMetrics = useCallback(() => {
    const popup = popupEl.current;
    const list = listRef.current;
    if (!popup || !headerRef.current || !list) return;
    const style = getComputedStyle(popup);
    const frame =
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      parseFloat(style.borderTopWidth) +
      loadingRowLength(list);
    const header = headerRef.current.offsetHeight;
    const heights = optionHeights(list, 44);
    const screen = screenHeight(container);
    const next = {
      content: frame + header + listContentLength(list),
      half: Math.round(
        frame + header + peekLength(heights, screen * SHEET_HALF - frame - header, false)
      ),
      full: Math.round(screen * SHEET_FULL),
    };
    setMetrics((prev) =>
      prev && prev.content === next.content && prev.half === next.half && prev.full === next.full
        ? prev
        : next
    );
  }, [container]);
  const measure = useCallback(
    (popup: HTMLDivElement | null) => {
      observer.current?.disconnect();
      popupEl.current = popup;
      if (!popup || !listRef.current) return;
      readSheetMetrics();
      observer.current = new ResizeObserver(() => {
        readSheetMetrics();
        updateCues();
      });
      observer.current.observe(listRef.current);
    },
    [readSheetMetrics, updateCues]
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
    // 読み込み中の行は一覧の外にあるので、その分を一覧の上限から引く（行を含めた浮かぶ部分の高さを上限に収める）
    const limit =
      Math.min(screenHeight(container) * POPOVER_MAX, rowsLength(heights, maxRows) + padding) -
      loadingRowLength(list);
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
      popupEl.current = popup;
      if (!popup || !listRef.current) return;
      const update = () => {
        const list = listRef.current;
        // 本体の下の空き（--available-height）での上限にも、読み込み中の行の分を入れる
        if (list) list.style.setProperty('--select-popup-extra', `${loadingRowLength(list)}px`);
        if (popoverFit) fitPopover();
        updateCues();
      };
      requestAnimationFrame(update);
      observer.current = new ResizeObserver(update);
      observer.current.observe(listRef.current);
    },
    [fitPopover, popoverFit, updateCues]
  );

  // 開いたまま画面の大きさが変わったら、シートの半分の高さと、浮かぶ選択肢の高さの上限を測り直す
  useEffect(() => {
    if (!open) return undefined;
    const onResize = () => {
      if (!popupEl.current) return;
      if (sheet) {
        readSheetMetrics();
      } else if (popoverFit) {
        fitPopover();
      }
      updateCues();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, sheet, popoverFit, readSheetMetrics, fitPopover, updateCues]);

  const selected = selectedTokens(color);

  // 選択肢が長いときだけ、半分の高さで開いてつまみを出す。つまみを引くと高さが変わり、下へはじくか下まで引くと閉じる
  const long = sheet && sheetDetent === 'half' && !!metrics && metrics.content > metrics.half + 1;
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
    dragStart.current = {
      y: event.clientY,
      height: restingHeight,
      moved: false,
      samples: [{ y: event.clientY, t: event.timeStamp }],
    };
  };
  const onHandleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || !metrics) return;
    // 速さを出すための動きの記録。離す直前 velocityWindow の分だけ残す
    start.samples.push({ y: event.clientY, t: event.timeStamp });
    while (
      start.samples.length > 1 &&
      event.timeStamp - start.samples[0].t > SHEET_DRAG.velocityWindow
    ) {
      start.samples.shift();
    }
    const dy = event.clientY - start.y;
    if (!start.moved && Math.abs(dy) > SHEET_DRAG.moveSlop) {
      start.moved = true;
      setDragging(true);
    }
    if (start.moved) setDragHeight(Math.min(metrics.full, Math.max(0, start.height - dy)));
  };
  // 離したとき: はじいた（速さが flingVelocity 以上）ときは、その向きで、いまの高さの次の段へ動かす
  //   下へ: 半分より高ければ半分、半分以下なら閉じる（引いた距離が短くても閉じる）
  //   上へ: 半分より低ければ半分、半分以上なら高さいっぱい
  // はじかずに離したときは、半分の closeRatio より低ければ閉じ、それ以外は近い方の段に戻す
  // 閉じるときは、離した高さのまま、シートの閉じる動き（--duration-sheet・--ease-sheet）で下へ滑らせる
  // 動きを減らす設定では動きがない（motion-reduce）ので、すぐに閉じる
  const onHandleUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    dragStart.current = null;
    const height = dragHeight;
    setDragging(false);
    if (!start || !metrics) {
      setDragHeight(null);
      return;
    }
    // 引かずに押したときは、半分と高さいっぱいを切り替える
    if (!start.moved || height === null) {
      setDragHeight(null);
      setDetent(detent === 'half' ? 'full' : 'half');
      return;
    }
    const full = Math.min(metrics.content, metrics.full);
    const velocity =
      event.type === 'pointercancel'
        ? 0
        : releaseVelocity(start.samples, event.clientY, event.timeStamp);
    let target: SheetDetent | 'close';
    if (velocity >= SHEET_DRAG.flingVelocity) {
      target = height > metrics.half ? 'half' : 'close';
    } else if (velocity <= -SHEET_DRAG.flingVelocity) {
      target = height < metrics.half ? 'half' : 'full';
    } else if (height < metrics.half * SHEET_DRAG.closeRatio) {
      target = 'close';
    } else {
      target = Math.abs(height - metrics.half) <= Math.abs(height - full) ? 'half' : 'full';
    }
    if (target === 'close') {
      changeOpen(false);
      return;
    }
    setDragHeight(null);
    setDetent(target);
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
      success={success}
      info={info}
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
          // つまみで閉じたときに残した高さは、閉じる動きが終わってから消す
          onOpenChangeComplete={(next) => {
            if (!next) setDragHeight(null);
          }}
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
            ref={triggerRef}
            aria-describedby={messageIds}
            aria-disabled={blocking || undefined}
            aria-busy={loading || undefined}
            data-slot="control"
            data-closing={closing || undefined}
            onFocus={() => setClosing(false)}
            data-addon-shape={addonShape}
            className={controlBox({
              className: [
                'text-left data-popup-open:border-[color:var(--control-focus-line,var(--color-focus))] data-popup-open:bg-field-focus',
                blocking ? 'cursor-progress' : 'cursor-pointer',
                loading && 'relative',
                'data-closing:border-[color:var(--control-focus-line,var(--color-focus))] data-closing:bg-field-focus',
                // エラーの欄の離した線（controlBox）は、開いているあいだもフォーカス中と同じに引く
                '[&:is([data-popup-open],[data-closing])]:[outline-style:solid] [&:is([data-popup-open],[data-closing])]:[outline-width:var(--control-ring-width,0px)]',
                '[&:is([data-popup-open],[data-closing])]:[outline-offset:var(--focus-ring-offset)] [&:is([data-popup-open],[data-closing])]:[outline-color:var(--control-ring-color,var(--color-focus-ring))]',
                '[&:is([data-popup-open],[data-closing])]:ring-[length:var(--control-ring-inner,0px)] [&:is([data-popup-open],[data-closing])]:ring-[color:var(--color-focus-ring-inner)]',
                // フォーカスの枠線と線の色（部品の色 — ADR-0071 の M）
                OWN_FOCUS[color],
                '[--field-addon-pad:calc(var(--space-control-x)-var(--field-border-width))]',
              ],
            })}
          >
            {prefix != null && <FieldAddon>{prefix}</FieldAddon>}
            <BaseSelect.Value
              className="min-w-0 flex-1 truncate data-placeholder:text-fg-subtle"
              placeholder={loadingBlocking ? loadingText : placeholder}
            />
            {loading && loadingIndicator === 'spinner' && (
              <FieldSpinner
                className={
                  loadingBlocking ? undefined : 'me-[calc(var(--spacing)*2-var(--space-control-x))]'
                }
              />
            )}
            {/* 成功のチェック（後半の軸 37）。回る円と同じ場所（▼ の左）。待っているあいだは回る円を優先し、エラーのときは出さない */}
            {success && successMark && !error && !loading && (
              <FieldSuccessMark className="me-[calc(var(--spacing)*2-var(--space-control-x))]" />
            )}
            {/* ▼。Disabled のときはプレースホルダの場所の文と同じ色（--color-select-icon-disabled。disabledIcon="hide" で隠す）
              Form の送信中に止めているあいだ（data-loading="blocking"）も、押せない Select と同じ色で残す
              止めて読み込んでいるあいだは隠す */}
            <BaseSelect.Icon
              className={[
                'flex text-fg-muted group-data-disabled/field:text-[color:var(--color-select-icon-disabled,var(--color-fg-muted))]',
                'group-data-[loading=blocking]/field:text-[color:var(--color-select-icon-disabled,var(--color-fg-muted))]',
                (loadingBlocking || (disabled && disabledIcon === 'hide')) && 'hidden',
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
              選んだ項目は部品の色（color — selectedTokens）。見た目は design/tokens.css の --select-popup-*・--select-item-selected-*・--color-select-* で決める
              シートのときは、Base UI が付ける位置（インラインの style）を上書きして、画面の下に固定する
              本体の祖先に付いた data-density・coarse-large を写し、項目の高さと文字を本体とそろえる（readDensityScope） */}
            <BaseSelect.Positioner
              alignItemWithTrigger={false}
              collisionAvoidance={collisionAvoidance}
              sideOffset={popupSideOffset}
              data-presentation={sheet ? 'sheet' : 'popover'}
              data-density={densityScope.density}
              className={[
                'z-10 outline-none',
                densityScope.large && 'coarse-large',
                sheet &&
                  'inset-x-0! top-auto! bottom-0! left-0! flex max-h-[85%] flex-col [position:fixed]! [transform:none]!',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <BaseSelect.Popup
                ref={sheet ? measure : popoverCue || popoverFit ? observeCues : undefined}
                data-slot="select-popup"
                data-dragging={dragging || undefined}
                style={sheetHeight !== undefined ? { ...selected, height: sheetHeight } : selected}
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
                        'min-w-(--anchor-width) overflow-clip rounded-control py-0 [box-shadow:var(--shadow-select-popup)]',
                        // 開閉の動き（--select-popup-duration-in・-out・-ease・-shift — ADR-0054 の D）
                        // 本体の側から離れる向きにずれた位置から、濃さと一緒に滑る
                        // 動きを減らす設定では動かさず、すぐに出す・消す（原則3）
                        'transition-[opacity,translate] duration-(--select-popup-duration-in) ease-(--select-popup-ease) data-ending-style:duration-(--select-popup-duration-out)',
                        'data-ending-style:opacity-0 data-starting-style:opacity-0',
                        'data-ending-style:[translate:0_calc(var(--select-popup-shift)*-1)] data-starting-style:[translate:0_calc(var(--select-popup-shift)*-1)]',
                        'data-[side=top]:data-ending-style:[translate:0_var(--select-popup-shift)] data-[side=top]:data-starting-style:[translate:0_var(--select-popup-shift)]',
                        'motion-reduce:[transition:none]',
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
                                  kind === 'error' ? 'text-fg-danger' : 'text-fg-warning',
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
                          // --select-popup-extra は読み込み中の行の高さ（一覧の外にあるので、本体の下の空きから引く）
                          'max-h-[min(calc(var(--available-height)-var(--select-popup-extra,0px)),var(--select-popup-max-height,var(--available-height)))] overflow-y-auto',
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
                  選択肢の一覧（listbox）の中には選択肢しか置けないので、一覧のすぐ下に置く
                  読み上げは本体のそばの status の箱（select-status）が知らせるので、この行は role の箱にしない（二重に読まないため）
                  シートでも浮かぶ選択肢と同じ行（ADR-0055）。下の余白だけ、端末の安全領域の分を空ける */}
                {loadingRow && (
                  <div
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
          {/* 読み込みの知らせ（design/adr/0042）。Select を描いているあいだずっと置く、見えない status の箱（本体のすぐ後ろ）
              絶対配置なので、欄の並び（flex の間）には入らない。浮かぶ部分の外にあるが、Select は外を読み上げから隠さない（modal でも） */}
          <span role="status" data-slot="select-status" className="sr-only">
            {announcement.text}
          </span>
        </BaseSelect.Root>
      )}
    </Field>
  );
}
