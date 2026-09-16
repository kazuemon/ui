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
import { type LoadingIndicator, Spinner } from '../loading/Loading';
import { OWN_FOCUS, type SelectColor, selectedTokens } from './select-colors';
import { SelectMoreCue, type SheetMoreCue } from './SelectMoreCue';
import { SelectOption, type SelectItem } from './SelectOption';
import { type SheetMessage, SelectSheetHeader } from './SelectSheetHeader';
import { usePopupLayout } from './use-popup-layout';
import { useNarrowScreen } from './use-narrow-screen';
import { type SheetDetent, useSheetDrag } from './use-sheet-drag';

export type { SelectColor } from './select-colors';
export type { SheetMoreCue } from './SelectMoreCue';
export type { SelectItem, SelectItemNote, SelectItemNoteKind } from './SelectOption';
export type { SheetDetent } from './use-sheet-drag';

/** 選択肢の出し方。popover: 本体の下に浮かべる、sheet: 画面の下から出すシート、auto: 指で操作していて画面が狭いときはシート */
export type SelectPresentation = 'popover' | 'sheet' | 'auto';

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
  const sheetMessages: SheetMessage[] = [];
  if (error) sheetMessages.push({ kind: 'error', content: error, id: `${sheetId}error` });
  if (warning) sheetMessages.push({ kind: 'warning', content: warning, id: `${sheetId}warning` });

  // 開閉は部品の中でも持つ（シートの × とつまみで閉じるため）
  const [openState, setOpenState] = useState(defaultOpen);
  const open = blocking ? false : (openProp ?? openState);
  // 選んだ・Esc・×・つまみで閉じたときは、フォーカスが本体に戻るまで、開いているときと同じ見た目を保つ（data-closing）
  // Base UI は閉じる動きが終わってからフォーカスを本体に戻すので、そのあいだ本体の青い枠線が一瞬消えていた
  // 外を押して閉じたときは、押した先にフォーカスが移るので保たない
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (!closing) return undefined;
    const id = setTimeout(() => setClosing(false), 600);
    return () => clearTimeout(id);
  }, [closing]);

  const popoverCue = !sheet && popoverMoreCue === 'shadow';
  const popoverFit = !sheet && popoverMaxHeight === 'screen';
  const { headerRef, listRef, metrics, updateCues, measure, observeCues } = usePopupLayout({
    open,
    sheet,
    popoverFit,
    container,
  });

  // 選択肢が長いときだけ、半分の高さで開いてつまみを出す
  const long = sheet && sheetDetent === 'half' && !!metrics && metrics.content > metrics.half + 1;
  const drag = useSheetDrag({ sheetDetent, metrics, long, onClose: () => changeOpen(false) });

  const changeOpen = (next: boolean, reason?: string) => {
    if (next && blocking) return;
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
                '[--field-addon-pad:calc(var(--spacing-control-x)-var(--field-border-width))]',
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
              止めて読み込んでいるあいだは隠す */}
            <BaseSelect.Icon
              className={[
                'flex text-fg-muted group-data-disabled/field:text-fg-subtle',
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
                data-dragging={drag.dragging || undefined}
                style={
                  drag.sheetHeight !== undefined
                    ? { ...selected, height: drag.sheetHeight }
                    : selected
                }
                className={[
                  // 選択肢の文字は欄の値と同じ大きさ（指でも 16px）。選んだ値が欄に入っても大きさが変わらない
                  'p-(--select-popup-padding) text-input text-fg outline-none [--spacing-icon:var(--spacing-icon-input)]',
                  'border-(length:--border-width-thin) border-surface-line bg-surface',
                  sheet
                    ? [
                        // シート: 上の角だけ丸め、下から滑り出る。高さはつまみに合わせて動く（引いているあいだは動きを止める）
                        // 下端は端末の安全領域の分だけ空ける
                        'flex min-h-0 w-full flex-col rounded-t-card border-x-0 border-b-0 [box-shadow:var(--shadow-select-sheet)]',
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
                {sheet && (
                  <SelectSheetHeader
                    ref={headerRef}
                    long={long}
                    label={label}
                    caption={caption}
                    captionId={sheetCaptionId}
                    messages={sheetMessages}
                    onClose={() => changeOpen(false)}
                    {...drag.handlers}
                  />
                )}
                {(long || popoverCue) && (
                  <SelectMoreCue edge="top" sheet={sheet} sheetMoreCue={sheetMoreCue} />
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
                {(long || popoverCue) && (
                  <SelectMoreCue edge="bottom" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                )}
                {/* 止めずに読み込んでいるあいだ、選択肢の最後に出す行（design/adr/0042）。選べない。高さと左の余白は項目と同じ
                  選択肢の一覧（listbox）の中には選択肢しか置けないので、一覧のすぐ下に置く
                  読み上げは本体のそばの status の箱（select-status）が知らせるので、この行は role の箱にしない（二重に読まないため）
                  シートでも浮かぶ選択肢と同じ行（ADR-0055）。下の余白だけ、端末の安全領域の分を空ける */}
                {loadingRow && (
                  <div
                    data-slot="select-loading"
                    className={[
                      'flex h-(--spacing-control) shrink-0 items-center gap-2 px-[calc(var(--spacing-control-x)-var(--select-popup-padding))] text-fg-muted select-none',
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
