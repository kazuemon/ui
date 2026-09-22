'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { type ComponentProps, type ReactNode, type Ref, useEffect, useId, useState } from 'react';

import { useDensityScope } from '../../internal/density-scope';
import {
  type CaptionPlacement,
  Field,
  type FieldLoadingBehavior,
  FieldLoadingBar,
  FieldSpinner,
  FieldSuccessMark,
  type FieldValidate,
  type FieldValidationMode,
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
import { OUTSIDE_REASONS } from '../../internal/listbox/listbox-dismiss';
import { type ListboxSlotProps, mergeSlotClass } from '../../internal/listbox/listbox-slot-props';
import type { ListboxItem } from '../../internal/listbox/use-listbox-option';
import { popupSideOffset } from '../../internal/listbox/listbox-measure';
import { ListboxLoadingRow } from '../../internal/listbox/ListboxLoadingRow';
import {
  listboxList,
  type ListboxPresentation,
  listboxPopup,
} from '../../internal/listbox/listbox-styles';
import { useLoadingAnnouncement } from '../../internal/listbox/use-loading-announcement';
import { SheetCloseButton, SheetHeader } from '../../internal/sheet/SheetHeader';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import type { SheetMoreCue as SheetMoreCueKind } from '../../internal/sheet/SheetMoreCue';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { SelectOption } from './SelectOption';
import { type SheetMessage, SheetFieldTitle } from '../../internal/sheet/SheetFieldTitle';
import { useListboxLayout } from '../../internal/listbox/use-listbox-layout';
import { type SheetDetent, useSheetDrag } from '../../internal/sheet/use-sheet-drag';
import { usePortalContainer } from '../../internal/ui-config';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import type { FieldMessage } from '../../internal/field/input-field-props';

export type { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
export type { SheetDetent } from '../../internal/sheet/use-sheet-drag';

/**
 * Select の値の型。単数では `string | null`、`multiple` では `string[]` です
 */
export type SelectValue<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string | null;

export interface SelectProps<Multiple extends boolean = false> extends FieldMarkProps {
  /** 本体の上に置く太字のラベル。読み上げの名前にもなります */
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
  errorText?: FieldMessage;
  /**
   * 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない
   * errorText と両方あるときは、エラーの行の下に出す（design/adr/0041 の追記）
   * シートでは、見出しのヘルプテキストの下にも同じ行を出す（errorText と同じ。両方あるときはエラー → 警告）
   */
  warningText?: FieldMessage;
  /**
   * 成功の内容（「お届けできます」など）。本体の下に丸のチェックと緑の文字で出し、本体の ▼ の左（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。errorText があるときは、欄の見た目はエラーを優先します
   */
  successText?: FieldMessage;
  /**
   * 成功のとき、本体の ▼ の左に置くチェックを隠すか。true では下の行だけを出します
   * @default false
   */
  hideSuccessMark?: boolean;
  /** 情報の内容（「前回と同じ時間帯を選んでいます」など）。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  infoText?: FieldMessage;
  /**
   * 押せない（Disabled）状態にします。押しても選択肢は開かず、フォームでは値が送られません
   * @default false
   */
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
  color?: ListboxColor;
  /**
   * 選択肢。各項目に disabled（選べない）と note（ラベルの下の2行目）を付けられる（design/adr/0044）
   * 選べない理由や警告の文は、呼び出し側が組み立てて渡す（書き方は実装ガイドラインで決める）。部品は渡された文をそのまま出す
   */
  items: ListboxItem[];
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
  /**
   * 複数選べるようにします。値は文字の配列になり、フォームでは同じ名前で複数送られます
   * @default false
   */
  multiple?: Multiple;
  /** 選んだ値（制御）。単数では `string | null`、`multiple` では `string[]` */
  value?: SelectValue<Multiple>;
  /** はじめの値（非制御）。単数では `string | null`、`multiple` では `string[]` */
  defaultValue?: SelectValue<Multiple>;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: SelectValue<Multiple>) => void;
  /** フォームに送るときの名前。multiple では同じ名前で複数送られます */
  name?: string;
  /**
   * 値を確かめる関数です（design/adr/0255）。いまの値とフォーム全体の値を受け取り、正しくないときはエラーの文
   * （複数あれば配列）を返します。返したエラーの文は errorText と同じ行に出します。errorText があるときは、そちらを優先します
   */
  validate?: FieldValidate;
  /**
   * 検証のタイミングです（design/adr/0255）。Form の validationMode より、この欄の指定が勝ちます
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * validationMode="onChange" のとき、validate を呼ぶまでの待ち時間（ミリ秒）です
   * @default 0
   */
  validationDebounceTime?: number;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /** 選択肢を開いているか（制御） */
  open?: boolean;
  /** はじめに開いているか（非制御） */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 開閉の動きが終わったあとに、そのときの開閉を渡して呼びます */
  onOpenChangeComplete?: (open: boolean) => void;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか
   * @default true
   */
  modal?: boolean;
  /**
   * 外を押したときに閉じるか。false では、選ぶか Esc（と×・つまみ）でしか閉じません
   * @default true
   */
  dismissible?: boolean;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * 浮かぶ選択肢（popover）・シート（sheet）を描く場所
   * 本体の祖先に付いた data-density と coarse-large は、描く場所がその外でも、浮かぶ選択肢とシートに写します
   * ThemeProvider でまとめて指定できます
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /**
   * 浮かぶ選択肢の面（Popup）に広げる props。id・data-*・aria-* や、面だけに足すクラスを渡します。
   * className は部品のクラスに重ねます
   */
  popupProps?: ListboxSlotProps;
  /**
   * 浮かぶ選択肢の位置を決める要素（Positioner）に広げる props。画面の端に当たったときの逃がし方（collisionAvoidance）も、ここに渡します。
   * className は部品のクラスに重ねます
   */
  positionerProps?: ListboxSlotProps &
    Pick<ComponentProps<typeof BaseSelect.Positioner>, 'collisionAvoidance' | 'anchor'>;
  /**
   * 選択肢の出し方。auto は指で操作していて画面が狭いときだけシートにします。popover はいつも浮かべ、
   * sheet はいつもシートにします。シートにするのは指の動きを減らすためで、狭さそのものが理由ではありません（design/adr/0037）
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
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
   * 押せないとき（Disabled）の ▼ を隠すか。false ではプレースホルダの場所の文と同じ色（--color-fg-subtle）で出します
   * @default false
   */
  hideCaretOnDisabled?: boolean;
  /** 欄の外枠（ラベル・本体・下の行をまとめた縦の並び）に付きます */
  className?: string;
}

const defaultLoadedText = (count: number) => `${count} 件の選択肢`;

/**
 * Base UI から来た値を onValueChange に渡す
 * 値の型は multiple の有無で決まるので（SelectValue）、Base UI 側の広い型からここで橋渡しする
 */
function emitValue<Multiple extends boolean>(
  onValueChange: (value: SelectValue<Multiple>) => void,
  next: string | string[] | null
) {
  (onValueChange as (value: string | string[] | null) => void)(next);
}

/**
 * 選択肢から1つを選ぶ入力欄
 */
export function Select<Multiple extends boolean = false>({
  label,
  caption,
  captionPlacement,
  errorText,
  warningText,
  successText,
  hideSuccessMark = false,
  infoText,
  disabled,
  readOnly,
  color = 'neutral',
  items,
  placeholder,
  prefix,
  addonShape = 'attached',
  multiple,
  value,
  defaultValue,
  onValueChange,
  name,
  validate,
  validationMode,
  validationDebounceTime,
  form,
  inputRef,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  modal,
  dismissible = true,
  closeOnEscape = true,
  portalContainer: portalContainerProp,
  popupProps,
  positionerProps,
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
  hideCaretOnDisabled = false,
  required,
  requiredMark,
  optionalMark,
  className,
}: SelectProps<Multiple>) {
  const sheet = useSheetPresentation(presentation);
  // 読み込んでいるあいだ（design/adr/0042）。blocking は開けず、値も変えられない（readOnly）。フォーカスは外さない
  // non-blocking は、開いた選択肢の最後に「読み込んでいます」の行を出す
  const loadingBlocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !loadingBlocking;
  // Form の送信中（後半の軸 38）も、同じく開けず値も変えられない。見た目は Field の data-loading="blocking"（押せない欄）
  // 読み込みと違い、選んだ値はそのまま出し（loadingText に置き換えない）、回る円は出さず、▼ は押せない Select と同じ色で残す
  const portalContainer = usePortalContainer(portalContainerProp);
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
  if (errorText) sheetMessages.push({ kind: 'error', content: errorText, id: `${sheetId}error` });
  if (warningText)
    sheetMessages.push({ kind: 'warning', content: warningText, id: `${sheetId}warning` });

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

  // 読み込みの知らせ（design/adr/0042）。閉じていても消えない見えない status の箱の中身を入れ替える
  const announcement = useLoadingAnnouncement({
    open,
    loadingRow,
    loadingText,
    loadedText,
    count: items.length,
  });

  // 本体の祖先に付いた data-density・coarse-large を、開くたびに読み、浮かぶ部分（Positioner）に写す
  // 描く前（layout effect）に読むので、開いた最初の描画から同じ高さになる
  const { anchorRef: triggerRef, scope: densityScope } = useDensityScope(open);

  const selected = selectedTokens(color);

  // <部位>Props（ADR-0250）。className は部品のクラスに重ね、ref は内部の ref とつなぐ
  const {
    className: popupClassName,
    ref: popupUserRef,
    style: popupStyle,
    ...popupRest
  } = popupProps ?? {};
  const { className: positionerClassName, ...positionerRest } = positionerProps ?? {};
  const popupOwnRef = sheet ? measure : popoverCue || popoverFit ? observeCues : undefined;
  const popupRef = useMergedRefs<HTMLDivElement>(popupOwnRef, popupUserRef);

  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={errorText}
      warning={warningText}
      success={successText}
      info={infoText}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
      nativeLabel={false}
      name={name}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
    >
      {(messageIds) => (
        <BaseSelect.Root<string, boolean>
          items={items}
          multiple={multiple}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange ? (next) => emitValue(onValueChange, next) : undefined}
          name={name}
          form={form}
          inputRef={inputRef}
          modal={modal}
          disabled={disabled}
          required={required}
          readOnly={locked || undefined}
          open={open}
          onOpenChange={(next, details) => {
            // 外を押して閉じない・Esc で閉じない設定のときは、閉じる合図を取り消す（ADR-0251）
            if (!next && !dismissible && OUTSIDE_REASONS.has(details.reason)) {
              details.cancel();
              return;
            }
            if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
              details.cancel();
              return;
            }
            changeOpen(next, details.reason);
          }}
          // つまみで閉じたときに残した高さは、閉じる動きが終わってから消す
          onOpenChangeComplete={(next) => {
            if (!next) drag.clearDragHeight();
            onOpenChangeComplete?.(next);
          }}
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
            {successText && !hideSuccessMark && !errorText && !loading && (
              <FieldSuccessMark className="me-[calc(var(--spacing)*2-var(--spacing-control-x))]" />
            )}
            {/* ▼。Disabled のときはプレースホルダの場所の文と同じ色（--color-fg-subtle。hideCaretOnDisabled で隠す）
              Form の送信中に止めているあいだ（data-loading="blocking"）も、押せない Select と同じ色で残す
              止めて読み込んでいるあいだは隠す
              読み取り専用（軸 177）では残すが、押せない Select と同じ色まで淡くする。塗りのないアイコンは押せない意味の印（ADR-0190）で、
              選ぶ欄だと分かる形を残しつつ、押せるようには見せない */}
            <BaseSelect.Icon
              className={[
                'flex group-data-disabled/field:text-fg-subtle',
                readOnly ? 'text-fg-subtle' : 'text-fg-muted',
                'group-data-[loading=blocking]/field:text-fg-subtle',
                (loadingBlocking || (disabled && hideCaretOnDisabled)) && 'hidden',
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
              sideOffset={() => popupSideOffset(triggerRef.current)}
              {...positionerRest}
              data-presentation={listPresentation}
              data-density={densityScope.density}
              className={mergeSlotClass(
                [
                  'z-10 outline-none',
                  densityScope.large && 'coarse-large',
                  sheet &&
                    'inset-x-0! top-auto! bottom-0! left-0! flex max-h-[85%] flex-col [position:fixed]! [transform:none]!',
                ]
                  .filter(Boolean)
                  .join(' '),
                positionerClassName
              )}
            >
              <BaseSelect.Popup
                {...popupRest}
                ref={popupRef}
                data-slot="select-popup"
                data-dragging={drag.dragging || undefined}
                style={
                  drag.sheetHeight !== undefined
                    ? { ...selected, height: drag.sheetHeight, ...popupStyle }
                    : { ...selected, ...popupStyle }
                }
                className={mergeSlotClass(
                  listboxPopup({ presentation: listPresentation }),
                  popupClassName
                )}
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
            {announcement}
          </span>
        </BaseSelect.Root>
      )}
    </Field>
  );
}
