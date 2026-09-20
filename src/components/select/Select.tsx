'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { type DensityScope, readDensityScope } from '../../internal/density-scope';
import {
  type CaptionPlacement,
  Field,
  type FieldLoadingBehavior,
  FieldLoadingBar,
  FieldSpinner,
  FieldSuccessMark,
} from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import { useFormSubmittingLock } from '../../internal/form-context';
import type { AddonShape } from '../field-addon/field-addon-context';
import { FieldAddon } from '../field-addon/FieldAddon';
import { CaretDownIcon } from '../../internal/icons';
import type { LoadingIndicator } from '../loading/Loading';
import {
  type ListboxColor,
  OWN_FOCUS,
  selectedTokens,
} from '../../internal/listbox/listbox-colors';
import { ListboxLoadingRow } from '../../internal/listbox/ListboxLoadingRow';
import {
  listboxList,
  type ListboxPresentation,
  listboxPopup,
} from '../../internal/listbox/listbox-styles';
import { SheetCloseButton, SheetHeader } from '../../internal/sheet/SheetHeader';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import type { SheetMoreCue as SheetMoreCueKind } from '../../internal/sheet/SheetMoreCue';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { SelectOption, type SelectItem } from './SelectOption';
import { type SheetMessage, SheetFieldTitle } from '../../internal/sheet/SheetFieldTitle';
import { useListboxLayout } from '../../internal/listbox/use-listbox-layout';
import { type SheetDetent, useSheetDrag } from '../../internal/sheet/use-sheet-drag';
import { usePortalContainer } from '../../internal/ui-config';
import type { FieldMarkProps } from '../../internal/field/FieldMark';

/**
 * 選んだ項目の印の色。primary・secondary は利用者が選ぶ色、neutral は色を持たない（グレー）— 原則6、design/adr/0047
 */
export type SelectColor = ListboxColor;
export type { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
export type { SelectItem, SelectItemNote, SelectItemNoteKind } from './SelectOption';
export type { SheetDetent } from '../../internal/sheet/use-sheet-drag';

/** 選択肢の出し方。popover: 本体の下に浮かべる、sheet: 画面の下から出すシート、auto: 指で操作していて画面が狭いときはシート */
export type SelectPresentation = OverlayPresentation;

export interface SelectProps extends FieldMarkProps {
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
   * 読み取り専用にします。見た目は文字を打つ欄の読み取り専用と同じで、塗りを持たず、細い破線の輪郭と一段淡い値の文字になります。
   * フォーカスでき、値をなぞって写せます。読み上げでは「読み取り専用」と伝わります。
   * 押しても選択肢は開かず、キーボードでも値は変わりません。フォームでは値が送られます（押せない欄は送られません）
   * @default false
   */
  readOnly?: boolean;
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
  /**
   * 何も選んでいないときに出す文字。選んだ値と見分けられるよう、「選んでください」のように、まだ選んでいないと分かる書き方にします。
   * 選択肢の名前（「東京都」など）をそのまま書くと、選んだ値に見えます
   */
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
   * 書かないときは ThemeProvider の presentation に従います
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
  sheetMoreCue?: SheetMoreCueKind;
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
   * Disabled のときの ▼。show はプレースホルダの場所の文と同じ色（--color-fg-subtle）で出し、hide は隠します
   * @default 'show'
   */
  disabledIcon?: 'show' | 'hide';
  className?: string;
}

const defaultLoadedText = (count: number) => `${count} 件の選択肢`;

// 読み込みの知らせ（design/adr/0042）。本体のそばにいつも置く、見えない status の箱の中身
//   読み込んでいるあいだに開いた（開いているあいだに読み込みを始めた）: loadingText
//   開いたまま読み込みが終わった: loadedText（選択肢の数）。閉じたら空に戻す
interface LoadingAnnouncement {
  open: boolean;
  loading: boolean;
  text: string;
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
  readOnly,
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
  presentation,
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
  required,
  requiredMark,
  optionalMark,
  className,
  ...rootProps
}: SelectProps) {
  const sheet = useSheetPresentation(presentation);
  // 読み込んでいるあいだ（design/adr/0042）。blocking は開けず、値も変えられない（readOnly）。フォーカスは外さない
  // non-blocking は、開いた選択肢の最後に「読み込んでいます」の行を出す
  const loadingBlocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !loadingBlocking;
  // Form の送信中（後半の軸 38）も、同じく開けず値も変えられない。見た目は Field の data-loading="blocking"（押せない欄）
  // 読み込みと違い、選んだ値はそのまま出し（loadingText に置き換えない）、回る円は出さず、▼ は押せない Select と同じ色で残す
  const portalContainer = usePortalContainer(container);
  const formLock = useFormSubmittingLock();
  const blocking = loadingBlocking || formLock.blocking;
  // 読み取り専用（軸 177）。見た目は文字を打つ欄の読み取り専用にそろえる（ADR-0170。本体に data-field-readonly を置き、
  //   塗りなし・細い破線の輪郭・値は一段淡いグレー・フォーカスで破線が枠線に変わる）
  //   Base UI の readOnly で値を固定し、aria-readonly で「読み取り専用」と伝える（aria-disabled は付けない）
  //   フォーカスは外さず、値も送る。選択肢は開かない（値を選び直せないので、開いても読める以上のことができない）
  const locked = blocking || !!readOnly;
  // シートの見出しに出す欄の文（design/adr/0044）。本体の下の行と同じ。両方渡したときは両方、エラー → 警告の順（design/adr/0041 の追記）
  const sheetId = useId();
  const sheetCaptionId = `${sheetId}caption`;
  const sheetMessages: SheetMessage[] = [];
  if (error) sheetMessages.push({ kind: 'error', content: error, id: `${sheetId}error` });
  if (warning) sheetMessages.push({ kind: 'warning', content: warning, id: `${sheetId}warning` });

  // 開閉は部品の中でも持つ（シートの × とつまみで閉じるため）
  const [openState, setOpenState] = useState(defaultOpen);
  const open = locked ? false : (openProp ?? openState);
  // 選んだ・Esc・×・つまみで閉じたときは、フォーカスが本体に戻るまで、開いているときと同じ見た目を保つ（data-closing）
  // Base UI は閉じる動きが終わってからフォーカスを本体に戻すので、そのあいだ本体の青い枠線が一瞬消えていた
  // 外を押して閉じたときは、押した先にフォーカスが移るので保たない
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (!closing) return undefined;
    const id = setTimeout(() => setClosing(false), 600);
    return () => clearTimeout(id);
  }, [closing]);

  // 選択肢の一覧の見た目（src/internal/listbox）に渡す出し方
  const listPresentation: ListboxPresentation = sheet ? 'sheet' : 'popover';
  const popoverCue = !sheet && popoverMoreCue === 'shadow';
  const popoverFit = !sheet && popoverMaxHeight === 'screen';
  const { headerRef, listRef, loadingRowRef, metrics, updateCues, measure, observeCues } =
    useListboxLayout({
      open,
      sheet,
      popoverFit,
      container: portalContainer,
    });

  // 選択肢が長いときだけ、半分の高さで開いてつまみを出す
  const long = sheet && sheetDetent === 'half' && !!metrics && metrics.content > metrics.half + 1;
  const drag = useSheetDrag({ sheetDetent, metrics, long, onClose: () => changeOpen(false) });

  const changeOpen = (next: boolean, reason?: string) => {
    if (next && locked) return;
    if (next) drag.reset();
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

  const selected = selectedTokens(color);

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
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
      nativeLabel={false}
    >
      {(messageIds) => (
        <BaseSelect.Root
          items={items}
          disabled={disabled}
          required={required}
          readOnly={locked || undefined}
          open={open}
          onOpenChange={(next, details) => changeOpen(next, details.reason)}
          // つまみで閉じたときに残した高さは、閉じる動きが終わってから消す
          onOpenChangeComplete={(next) => {
            if (!next) drag.clearDragHeight();
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
            data-field-readonly={readOnly || undefined}
            data-closing={closing || undefined}
            onFocus={() => setClosing(false)}
            data-addon-shape={addonShape}
            className={controlBox({
              className: [
                'text-left data-popup-open:border-[color:var(--control-focus-line,var(--color-focus))] data-popup-open:[--control-bg:var(--color-field-focus)]',
                // 読み取り専用は文字の欄と同じで、押せない欄の禁止の形にはしない。値はなぞって写せる
                blocking
                  ? 'cursor-progress'
                  : readOnly
                    ? 'cursor-default select-text'
                    : 'cursor-pointer',
                loading && 'relative',
                'data-closing:border-[color:var(--control-focus-line,var(--color-focus))] data-closing:[--control-bg:var(--color-field-focus)]',
                // エラーの欄の離した線（controlBox）は、開いているあいだもフォーカス中と同じに引く
                '[&:is([data-popup-open],[data-closing])]:[outline-style:solid] [&:is([data-popup-open],[data-closing])]:[outline-width:var(--control-ring-width,0px)]',
                '[&:is([data-popup-open],[data-closing])]:[outline-offset:var(--focus-ring-offset)] [&:is([data-popup-open],[data-closing])]:[outline-color:var(--control-ring-color,var(--color-focus-ring))]',
                '[&:is([data-popup-open],[data-closing])]:ring-[length:var(--control-ring-inner,0px)] [&:is([data-popup-open],[data-closing])]:ring-[color:var(--color-focus-ring-inner)]',
                // フォーカスの枠線と線の色（部品の色 — ADR-0071 の M）
                OWN_FOCUS[color],
                '[--field-addon-pad:calc(var(--spacing-control-x)-var(--field-border-width))]',
              ],
            })}
          >
            {prefix != null && <FieldAddon>{prefix}</FieldAddon>}
            <BaseSelect.Value
              className="min-w-0 flex-1 truncate data-placeholder:text-(color:--field-placeholder)"
              placeholder={loadingBlocking ? loadingText : placeholder}
            />
            {loading && loadingIndicator === 'spinner' && (
              <FieldSpinner
                className={
                  loadingBlocking
                    ? undefined
                    : 'me-[calc(var(--spacing)*2-var(--spacing-control-x))]'
                }
              />
            )}
            {/* 成功のチェック（後半の軸 37）。回る円と同じ場所（▼ の左）。待っているあいだは回る円を優先し、エラーのときは出さない */}
            {success && successMark && !error && !loading && (
              <FieldSuccessMark className="me-[calc(var(--spacing)*2-var(--spacing-control-x))]" />
            )}
            {/* ▼。Disabled のときはプレースホルダの場所の文と同じ色（--color-fg-subtle。disabledIcon="hide" で隠す）
              Form の送信中に止めているあいだ（data-loading="blocking"）も、押せない Select と同じ色で残す
              止めて読み込んでいるあいだは隠す
              読み取り専用（軸 177）では残すが、押せない Select と同じ色まで淡くする。塗りのないアイコンは押せない意味の印（ADR-0190）で、
              選ぶ欄だと分かる形を残しつつ、押せるようには見せない */}
            <BaseSelect.Icon
              className={[
                'flex group-data-disabled/field:text-fg-subtle',
                readOnly ? 'text-fg-subtle' : 'text-fg-muted',
                'group-data-[loading=blocking]/field:text-fg-subtle',
                (loadingBlocking || (disabled && disabledIcon === 'hide')) && 'hidden',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <CaretDownIcon />
            </BaseSelect.Icon>
            {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
          </BaseSelect.Trigger>
          <BaseSelect.Portal container={portalContainer}>
            {/* シートのときは、後ろの画面を暗くする（--color-backdrop） */}
            {sheet && (
              <BaseSelect.Backdrop className="fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--duration-sheet) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
            )}
            {/* 浮かぶ部分は、白い面に細い境界線とやわらかい影（浮かぶ UI の影は重なりを表す — design/adr/0036）
              選んだ項目は部品の色（color — selectedTokens）。見た目は design/tokens.css の --select-popup-*・--select-item-selected-*・--color-select-* で決める
              シートのときは、Base UI が付ける位置（インラインの style）を上書きして、画面の下に固定する
              本体の祖先に付いた data-density・coarse-large を写し、項目の高さと文字を本体とそろえる（readDensityScope） */}
            <BaseSelect.Positioner
              alignItemWithTrigger={false}
              collisionAvoidance={collisionAvoidance}
              sideOffset={popupSideOffset}
              data-presentation={listPresentation}
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
                data-dragging={drag.dragging || undefined}
                style={
                  drag.sheetHeight !== undefined
                    ? { ...selected, height: drag.sheetHeight }
                    : selected
                }
                className={listboxPopup({ presentation: listPresentation })}
              >
                {sheet && (
                  <SheetHeader
                    ref={headerRef}
                    handle={long}
                    onPointerDown={drag.handlers.onPointerDown}
                    onPointerMove={drag.handlers.onPointerMove}
                    onPointerUp={drag.handlers.onPointerUp}
                    onPointerCancel={drag.handlers.onPointerUp}
                    className={long ? 'cursor-grab touch-none' : undefined}
                    // 選ばずに閉じる。Tab では止まらない（開いた直後のフォーカスを選んだ項目に置くため）。キーボードでは Esc で閉じる
                    close={<SheetCloseButton tabIndex={-1} onClick={() => changeOpen(false)} />}
                  >
                    <SheetFieldTitle
                      label={label}
                      caption={caption}
                      captionId={sheetCaptionId}
                      messages={sheetMessages}
                    />
                  </SheetHeader>
                )}
                {(long || popoverCue) && (
                  <SheetMoreCue edge="top" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                )}
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
                  className={listboxList({ presentation: listPresentation, loadingRow })}
                >
                  {items.map((item) => (
                    <SelectOption key={item.value} item={item} />
                  ))}
                </BaseSelect.List>
                {(long || popoverCue) && (
                  <SheetMoreCue edge="bottom" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                )}
                {/* 止めずに読み込んでいるあいだ、選択肢の最後に出す行（design/adr/0042）
                  読み上げは本体のそばの status の箱（select-status）が知らせるので、この行は role の箱にしない（二重に読まないため） */}
                {loadingRow && (
                  <ListboxLoadingRow
                    ref={loadingRowRef}
                    slot="select-loading"
                    presentation={listPresentation}
                  >
                    {loadingText}
                  </ListboxLoadingRow>
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
