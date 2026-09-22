'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { type ComponentProps, type ReactNode, useId, useMemo, useState } from 'react';

import { ComboboxChips, ComboboxTriggerChips } from '../../internal/combobox-base/ComboboxChips';
import {
  type ComboboxChipSize,
  comboboxChipHeightStyle,
  comboboxChipMaxWidthStyle,
  comboboxControl,
  comboboxInputClass,
  controlInset,
  controlInsetEnd,
} from '../../internal/combobox-base/combobox-control-styles';
import {
  ComboboxEmpty,
  ComboboxGroupSection,
  ComboboxSheetClose,
  type ComboboxSheetCloseIcon,
} from '../../internal/combobox-base/ComboboxParts';
import {
  comboboxPopupStyle,
  comboboxPositionerClass,
  comboboxPositionerStyle,
  comboboxSheetInputClass,
} from '../../internal/combobox-base/combobox-popup-styles';
import { useKeyboardProxy } from '../../internal/combobox-base/use-keyboard-proxy';
import { useScrollRestore } from '../../internal/combobox-base/use-scroll-restore';
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
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import type { FieldMessage } from '../../internal/field/input-field-props';
import { useFormSubmittingLock } from '../../internal/form-context';
import { CaretDownIcon, XIcon } from '../../internal/icons';
import { ComboboxOption } from '../../internal/listbox/ComboboxOption';
import { type ListboxColor, selectedTokens } from '../../internal/listbox/listbox-colors';
import { OUTSIDE_REASONS } from '../../internal/listbox/listbox-dismiss';
import {
  type ListboxGroup,
  type ListboxItems,
  flattenItems,
  isGroupedItems,
  labelMap,
} from '../../internal/listbox/listbox-items';
import {
  type ListboxInputProps,
  type ListboxSlotProps,
  mergeSlotClass,
} from '../../internal/listbox/listbox-slot-props';
import type { ListboxItem } from '../../internal/listbox/use-listbox-option';
import { popupSideOffset } from '../../internal/listbox/listbox-measure';
import { ListboxLoadingRow } from '../../internal/listbox/ListboxLoadingRow';
import {
  type GroupLabelStyle,
  listboxList,
  type ListboxPresentation,
  listboxPopup,
} from '../../internal/listbox/listbox-styles';
import { useListboxLayout } from '../../internal/listbox/use-listbox-layout';
import { useLoadingAnnouncement } from '../../internal/listbox/use-loading-announcement';
import { type SheetMessage, SheetFieldTitle } from '../../internal/sheet/SheetFieldTitle';
import { SheetHeader } from '../../internal/sheet/SheetHeader';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import type { SheetMoreCue as SheetMoreCueKind } from '../../internal/sheet/SheetMoreCue';
import { useKeyboardInset, useKeyboardShrink } from '../../internal/sheet/use-keyboard-inset';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { type SheetDetent, useSheetDrag } from '../../internal/sheet/use-sheet-drag';
import { usePortalContainer } from '../../internal/ui-config';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import { FieldAddonButton } from '../field-addon/FieldAddon';
import type { LoadingIndicator } from '../loading/Loading';

/**
 * シートのときの、打つ欄の置き場所
 * field: 欄に残す（欄にフォーカスとキーボードが残り、選択肢だけがシートに出る）
 * inside: シートの中に移す（欄はボタンになり、シートの見出しの下に打つ欄が出る）
 */
export type ComboboxSheetInput = 'field' | 'inside';

/**
 * 打った文字と選択肢を突き合わせる関数。`Combobox.useFilter`（Base UI）の `contains` などを渡す
 * null を渡すと、部品の中では絞り込まず、渡された選択肢をそのまま出す（外で絞り込むとき）
 */
export type ComboboxFilter = (
  item: ListboxItem,
  query: string,
  itemToString?: (item: ListboxItem) => string
) => boolean;

/**
 * Combobox の値の型。単数では `string | null`、`multiple` では `string[]` です
 */
export type ComboboxValue<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string | null;

export interface ComboboxProps<Multiple extends boolean = false> extends FieldMarkProps {
  /** 本体の上に置く太字のラベル。読み上げの名前にもなります */
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下（design/adr/0041）
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする */
  errorText?: FieldMessage;
  /**
   * 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない
   * errorText と両方あるときは、エラーの行の下に出す
   */
  warningText?: FieldMessage;
  /**
   * 成功の内容。本体の下に丸のチェックと緑の文字で出し、本体の ▼ の左（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。errorText があるときは、欄の見た目はエラーを優先します
   */
  successText?: FieldMessage;
  /**
   * 成功のとき、本体の ▼ の左に置くチェックを隠すか。true では下の行だけを出します
   * @default false
   */
  hideSuccessMark?: boolean;
  /** 情報の内容。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  infoText?: FieldMessage;
  /**
   * 押せない（Disabled）状態にします。打てず、選択肢も開かず、フォームでは値が送られません
   * @default false
   */
  disabled?: boolean;
  /**
   * 読み取り専用にします。見た目は文字を打つ欄の読み取り専用と同じで、塗りを持たず、細い破線の輪郭と
   * 一段淡い値の文字になります。フォーカスでき、値をなぞって写せます。
   * 打っても選択肢は開かず、値も変わりません。消去のボタンとチップの × も出しません。フォームでは値が送られます
   * @default false
   */
  readOnly?: boolean;
  /**
   * 選んだ項目の印（面・文字・チェック）とチップの色。利用者が選ぶ primary・secondary に加え、
   * 色を持たない neutral（グレー）を選べます（原則6）。hover とキーボードの選択は、色を指定していても入力欄と同じグレーです
   * @default 'neutral'
   */
  color?: ListboxColor;
  /**
   * 選択肢。`ListboxItem[]`（そのまま並べる）か `ListboxGroup[]`（`label` と `items` のまとまり）で渡します。
   * 各項目に disabled（選べない）と note（ラベルの下の2行目）を付けられます（design/adr/0044）
   */
  items: ListboxItems;
  /**
   * まとまりの見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレーです
   * @default 'label'
   */
  groupLabelStyle?: GroupLabelStyle;
  /**
   * まとまりのあいだに区切り線を引くか
   * @default false
   */
  showGroupSeparator?: boolean;
  /**
   * 空の欄に出す見本の文字。選んだ値と見分けられるよう、「探して選んでください」のように、
   * まだ選んでいないと分かる書き方にします
   */
  placeholder?: string;
  /**
   * スマホのキーボードの実行キーの表示。
   * Enter は候補の選択に使うので、欄が並んでいても「次へ」にせず、Enter を欄へ届けます
   * @default 'enter'
   */
  enterKeyHint?: ComponentProps<'input'>['enterKeyHint'];
  /**
   * 複数選べるようにします。選んだ項目は欄の中にチップで並び、欄の高さが伸びます。
   * 値は文字の配列になり、フォームでは同じ名前で複数送られます
   * 値の型（`ComboboxValue`）はこの props から決まるので、`multiple` か `multiple={true}` と直に書きます。
   * 変数（`boolean` の値）を渡すと、単数と複数の両方を受ける広い型になります
   * @default false
   */
  multiple?: Multiple;
  /** 選んだ値（制御）。単数では `string | null`、`multiple` では `string[]` */
  value?: ComboboxValue<Multiple>;
  /** はじめの値（非制御）。単数では `string | null`、`multiple` では `string[]` */
  defaultValue?: ComboboxValue<Multiple>;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: ComboboxValue<Multiple>) => void;
  /** 打っている文字（制御）。外で絞り込むときに使います */
  inputValue?: string;
  /** はじめの打っている文字（非制御） */
  defaultInputValue?: string;
  /** 打っている文字が変わるときに、次の文字を渡して呼びます。外で絞り込むときは、この文字で問い合わせます */
  onInputValueChange?: (inputValue: string) => void;
  /**
   * 打った文字と選択肢を突き合わせる関数。書かないときは Base UI の既定（前後の空白を無視した部分一致）です。
   * null にすると部品の中では絞り込まず、`items`（または `filteredItems`）をそのまま出します
   */
  filter?: ComboboxFilter | null;
  /**
   * 外で絞り込んだ選択肢。渡すと、部品の中の絞り込みの代わりにこれを出します。
   * `items` には、選んだ項目を残したままにします（選んだ値のラベルを引けなくなるため）
   */
  filteredItems?: ListboxItems;
  /**
   * 打ち始めたときに、最初に当たった選択肢へ自動で印を移すか
   * @default false
   */
  autoHighlight?: boolean;
  /**
   * 欄を押したときに選択肢を開くか。false では ▼ を押すか、文字を打ったときだけ開きます
   * @default true
   */
  openOnInputClick?: boolean;
  /**
   * 値を消すボタン（×）を欄の端に出すか。単数では選んだ値と打った文字を、`multiple` では選んだ項目をすべて消します。
   * 何も選んでいないときと、読み取り専用の欄では出しません
   * @default true
   */
  clearable?: boolean;
  /**
   * 消すボタンの読み上げの名前。書かないときは、単数では「入力内容を消去」、`multiple` では「選んだ項目をすべて消去」です
   */
  clearName?: string;
  /**
   * チップの × の読み上げの名前を作る関数。何を外すのかが分かる文にします
   * @default (label) => `${label} を外す`
   */
  chipRemoveName?: (label: string) => string;
  /**
   * 欄に並ぶチップのまとまりの読み上げの名前
   * @default '選んだ項目'
   */
  chipsName?: string;
  /** 当たる選択肢がないときに出す文 */
  emptyText?: ReactNode;
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
   * @default false
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
   * 浮かぶ選択肢を描く場所
   * 本体の祖先に付いた data-density と coarse-large は、描く場所がその外でも、浮かぶ選択肢に写します
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
    Pick<ComponentProps<typeof BaseCombobox.Positioner>, 'collisionAvoidance' | 'anchor'>;
  /**
   * 欄の中の打つ欄（input）に広げる props。autoComplete・inputMode・ref などを渡します。
   * className は部品のクラスに重ねます
   */
  inputProps?: ListboxInputProps;
  /**
   * 選択肢の出し方。auto は指で操作していて画面が狭いときだけシートにします。popover はいつも浮かべ、
   * sheet はいつもシートにします。シートにするのは指の動きを減らすためで、狭さそのものが理由ではありません（design/adr/0037）
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * シートのときの、打つ欄の置き場所。Combobox は打って絞り込むので、シートとソフトウェアキーボードが同時に出ます
   * field: 欄に残します。欄にフォーカスとキーボードが残り、選択肢だけがシートに出ます。シートは、キーボードに隠れない高さに収めます
   * inside: シートの中に移します。欄は押すと開くボタンになり、シートの見出しの下に打つ欄が出ます（複数選ぶときのチップもシートの中です）
   * @default 'inside'
   */
  sheetInput?: ComboboxSheetInput;
  /**
   * シートの中に打つ欄を移したとき（sheetInput="inside"）、開いた瞬間に打つ欄へフォーカスを当てるか。
   * true では、開くとすぐソフトウェアキーボードが出て、その上に選択肢が見えます。false では、シートの面にフォーカスが残り、
   * 打つ欄を押すまでキーボードは出ません（選択肢を眺めて選ぶだけの使い方に向きます）
   * @default true
   */
  focusInputOnOpen?: boolean;
  /**
   * シートの見出しの閉じるボタンのアイコン。check は ✓（選び終えた）、x は ×、chevron は下向きの矢印（下げる）です。
   * null はアイコンを出さず、文字だけにします（sheetCloseText も null のときは × を出します）
   * 欄の中の消去 ×（値を消す）と見分けるため、既定は ✓ です
   * @default 'check'
   */
  sheetCloseIcon?: ComboboxSheetCloseIcon;
  /**
   * シートの見出しの閉じるボタンの文字。そのまま見える文字で、読み上げの名前にもなります。
   * null は文字を出さず、アイコンだけにします（読み上げの名前は「閉じる」です）
   * @default '完了'
   */
  sheetCloseText?: string | null;
  /**
   * シートを開いたときの高さ。half は選択肢が長いときに半分の高さで開き、つまみを出します。full は高さいっぱいで開きます
   * つまみを引くと高さが変わります。上へはじくと高さいっぱいに広がり、下へはじくと、引いた距離が短くても一段下がります（半分からは閉じる）
   * 打つ欄をシートの中に置くとき（sheetInput="inside"）の既定は full、欄に残すとき（"field"）の既定は half です。
   * 欄に残すときに full で開くと、シートが欄を覆ってしまいます
   * @default 'full'（sheetInput="inside"）、'half'（sheetInput="field"）
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
   * non-blocking: 止めない。打てるままで、開くと選択肢の最後に loadingText の行を出す。回る円は ▼ の左
   * blocking: 止める。押せない欄と同じ見た目にし、プレースホルダの場所に loadingText を出す。▼ を隠し、開けない
   * @default 'non-blocking'
   */
  loadingBehavior?: FieldLoadingBehavior;
  /**
   * 読み込んでいるあいだの印。spinner は回る円、bar は下端に流れる線です
   * @default 'spinner'
   */
  loadingIndicator?: LoadingIndicator;
  /**
   * 読み込んでいるあいだの文。blocking ではプレースホルダの場所に、non-blocking では開いた選択肢の行に出す
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /**
   * 読み込みが終わったときに、読み上げで知らせる文です。選択肢の数を受け取って返します
   * @default (count) => `${count} 件の選択肢`
   */
  loadedText?: (count: number) => string;
  /**
   * 押せないとき（Disabled）の ▼ を隠すか。false ではプレースホルダの場所の文と同じ色で出します
   * @default false
   */
  hideCaretOnDisabled?: boolean;
  /**
   * 欄の端の ▼ の出し方。always はいつも出し、never は出さず、empty-only は値（消すボタン）があるあいだ隠します
   * @default 'always'
   */
  chevron?: 'always' | 'never' | 'empty-only';
  /**
   * `multiple` のチップの最大幅（CSS の長さ。例: '120px'、'10rem'）。超えた文字は … で省略します。
   * 書かないときはチップを切らず、欄の幅いっぱいまで伸びます（欄の幅を超える分だけ … で省略します）
   */
  chipMaxWidth?: string;
  /**
   * `multiple` のチップの大きさ（Chip の size にそのまま渡します。ADR-0259）。
   * 既定の md は今までの欄の中のチップと同じ高さです。sm は Tag と同じ高さ、lg は部品の高さです
   * @default 'md'
   */
  chipSize?: ComboboxChipSize;
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
  /** 欄の外枠（ラベル・本体・下の行をまとめた縦の並び）に付きます */
  className?: string;
}

const defaultLoadedText = (count: number) => `${count} 件の選択肢`;
const defaultChipRemoveName = (label: string) => `${label} を外す`;

/**
 * Base UI から来た値を onValueChange に渡す
 * 値の型は multiple の有無で決まるので（ComboboxValue）、Base UI 側の広い型からここで橋渡しする
 */
function emitValue<Multiple extends boolean>(
  onValueChange: (value: ComboboxValue<Multiple>) => void,
  next: string | string[] | null
) {
  (onValueChange as (value: string | string[] | null) => void)(next);
}

/**
 * 選択肢を打って絞り込み、選ぶ入力欄
 */
export function Combobox<Multiple extends boolean = false>({
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
  groupLabelStyle = 'label',
  showGroupSeparator = false,
  placeholder,
  enterKeyHint = 'enter',
  multiple: multipleProp,
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  filter,
  filteredItems,
  autoHighlight = false,
  openOnInputClick = true,
  clearable = true,
  clearName,
  chipRemoveName = defaultChipRemoveName,
  chipsName = '選んだ項目',
  emptyText,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  modal = false,
  dismissible = true,
  closeOnEscape = true,
  portalContainer: portalContainerProp,
  popupProps,
  positionerProps,
  inputProps,
  presentation,
  sheetInput = 'inside',
  focusInputOnOpen = true,
  sheetCloseIcon = 'check',
  sheetCloseText = '完了',
  sheetDetent: sheetDetentProp,
  sheetMoreCue = 'divider-always-shadow',
  popoverMoreCue = 'shadow',
  popoverMaxHeight = 'screen',
  loading = false,
  loadingBehavior = 'non-blocking',
  loadingIndicator = 'spinner',
  loadingText = '読み込んでいます',
  loadedText = defaultLoadedText,
  hideCaretOnDisabled = false,
  chevron = 'always',
  chipMaxWidth,
  chipSize = 'md',
  name,
  validate,
  validationMode,
  validationDebounceTime,
  form,
  required,
  requiredMark,
  optionalMark,
  className,
}: ComboboxProps<Multiple>) {
  // multiple は型（ComboboxValue）を決めるので props では Multiple のまま受け、中では boolean として扱う
  const multiple = multipleProp ?? false;
  // 読み込んでいるあいだ（design/adr/0042）。blocking は開けず、値も変えられない
  const loadingBlocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !loadingBlocking;
  // Form の送信中も、同じく開けず値も変えられない（見た目は Field の data-loading="blocking"）
  const formLock = useFormSubmittingLock();
  const blocking = loadingBlocking || formLock.blocking;
  // 読み取り専用（ADR-0170）: 文字を打つ欄の読み取り専用と同じ見た目にし、選択肢は開かない
  const locked = blocking || !!readOnly;
  const portalContainer = usePortalContainer(portalContainerProp);

  // 選択肢の出し方（design/adr/0037・原則16）。指で操作していて画面が狭いときはシート
  const sheet = useSheetPresentation(presentation);
  // シートの中に打つ欄を移すか（sheetInput="inside"）。欄は押すと開くボタンになる
  const inputInSheet = sheet && sheetInput === 'inside';
  const sheetDetent: SheetDetent = sheetDetentProp ?? (sheetInput === 'inside' ? 'full' : 'half');
  // シートの見出しに出す欄の文（design/adr/0044）。本体の下の行と同じ。両方渡したときはエラー → 警告の順
  const sheetId = useId();
  const sheetCaptionId = `${sheetId}caption`;
  const sheetMessages: SheetMessage[] = [];
  if (errorText) sheetMessages.push({ kind: 'error', content: errorText, id: `${sheetId}error` });
  if (warningText)
    sheetMessages.push({ kind: 'warning', content: warningText, id: `${sheetId}warning` });

  // 開閉は部品の中でも持つ（止めているあいだ開かせないため・シートの × とつまみで閉じるため）
  // 開いているあいだは本体をフォーカス中と同じ見た目にする
  const [openState, setOpenState] = useState(defaultOpen);
  const open = locked ? false : (openProp ?? openState);
  // 開く前のスクロール位置。キーボードの出入りでブラウザがページをずらすので、閉じたあとに元へ戻す（focusInputOnOpen）
  const restoreScroll = useScrollRestore();
  const changeOpen = (next: boolean) => {
    if (next && locked) return;
    if (next) drag.reset();
    if (inputInSheet && focusInputOnOpen) restoreScroll(next);
    setOpenState(next);
    onOpenChange?.(next);
  };

  // 値は文字（value）で持つ。Base UI には、項目から値とラベルを引く collection を渡す
  //   こうすると、選んだ値・フォームに送る値・絞り込みの当たり先が、すべて items の label・value から決まる
  const collection = useMemo(
    () =>
      BaseCombobox.createItems<ListboxItem, string>(items, {
        getValue: (item) => item.value,
        getLabel: (item) => item.label,
      }),
    [items]
  );
  // 値からラベルを引く（チップの文字）。外で絞り込んで項目が消えても、items に残っていれば引ける
  const flat = useMemo(() => flattenItems(items), [items]);
  const labelOf = useMemo(() => labelMap(flat), [flat]);

  // 選択肢の一覧の見た目（src/internal/listbox）に渡す出し方
  const listPresentation: ListboxPresentation = sheet ? 'sheet' : 'popover';
  // 浮かぶ選択肢の寸法（高さの上限・続きの印）
  const popoverCue = !sheet && popoverMoreCue === 'shadow';
  const popoverFit = !sheet && popoverMaxHeight === 'screen';
  // ソフトウェアキーボードが隠している高さ。シートは、その分だけ持ち上げて見えている範囲に収める
  const keyboardInset = useKeyboardInset(sheet);
  const keyboardShrink = useKeyboardShrink(sheet);
  const { headerRef, listRef, loadingRowRef, metrics, updateCues, measure, observeCues } =
    useListboxLayout({
      open,
      sheet,
      popoverFit,
      container: portalContainer,
      insetBottom: keyboardShrink,
    });

  // 選択肢が長いときだけ、半分の高さで開いてつまみを出す（design/adr/0037）
  const long = sheet && sheetDetent === 'half' && !!metrics && metrics.content > metrics.half + 1;
  const drag = useSheetDrag({ sheetDetent, metrics, long, onClose: () => changeOpen(false) });

  // 読み込みの知らせ（design/adr/0042、ADR-0055）。閉じていても消えない status の箱（Combobox.Status）の中身を入れ替える
  const announcement = useLoadingAnnouncement({
    open,
    loadingRow,
    loadingText,
    loadedText,
    count: flat.length,
  });

  // 本体の祖先に付いた data-density・coarse-large を、開くたびに読み、浮かぶ部分に写す
  // 本体は、ふだんは打つ欄（InputGroup）、シートの中に打つ欄を移したときは押すボタン（Trigger）
  const { anchorRef: fieldRef, scope: densityScope } = useDensityScope<HTMLElement>(open);
  // 本体は InputGroup（div）と Trigger（button）のどちらにもなるので、要素の型を問わない関数で受ける
  const setFieldElement = (el: HTMLElement | null) => {
    fieldRef.current = el;
  };
  // ソフトウェアキーボードを開く操作の中で出すための、見えない打つ欄（focusInputOnOpen）
  const keyboardProxy = useKeyboardProxy(focusInputOnOpen);
  // 浮かぶ選択肢とシートの外枠（src/internal/combobox-base）。シートは、キーボードが隠している分だけ持ち上げて残りに収める
  const popupShell = { sheet, densityScope, keyboardInset, keyboardShrink, sheetDetent };

  const chipStyle = comboboxChipMaxWidthStyle(chipMaxWidth);
  // 打つ欄を、欄の中のチップと同じ高さにそろえる（h-(--combobox-chip-height)）
  const chipHeightStyle = comboboxChipHeightStyle(chipSize);
  const selected = selectedTokens(color);
  const grouped = isGroupedItems(filteredItems ?? items);

  // <部位>Props（ADR-0250）。className は部品のクラスに重ね、ref は内部の ref とつなぐ
  const {
    className: popupClassName,
    ref: popupUserRef,
    style: popupStyle,
    ...popupRest
  } = popupProps ?? {};
  const {
    className: positionerClassName,
    style: positionerStyle,
    ...positionerRest
  } = positionerProps ?? {};
  const { className: inputClassName, ...inputRest } = inputProps ?? {};
  const popupOwnRef = sheet ? measure : popoverCue || popoverFit ? observeCues : undefined;
  const popupRef = useMergedRefs<HTMLDivElement>(popupOwnRef, popupUserRef);

  // 欄の中身（入力欄・チップ）。multiple ではチップと入力欄を Chips の中に並べる（← で チップへ移れる）
  const inputClass = comboboxInputClass({ blocking, readOnly });

  // シートの見出しの閉じるボタン。アイコンと文字の組み合わせは、sheetCloseIcon・sheetCloseText で選ぶ
  const renderSheetClose = () => (
    <ComboboxSheetClose
      icon={sheetCloseIcon}
      text={sheetCloseText}
      onClose={() => changeOpen(false)}
    />
  );

  const renderClear = () =>
    clearable && !readOnly ? (
      <BaseCombobox.Clear
        tabIndex={0}
        // 中身は render に渡す要素の側に置く（Base UI は、渡した要素の children をそのまま使う）
        render={
          <FieldAddonButton>
            <XIcon standalone />
          </FieldAddonButton>
        }
        disabled={blocking || disabled || undefined}
        data-slot="combobox-clear"
        aria-label={clearName ?? (multiple ? '選んだ項目をすべて消去' : '入力内容を消去')}
      />
    ) : null;

  // 欄の中身（打つ欄・チップ・端のボタン）。multiple ではチップと打つ欄を Chips の中に並べる（← でチップへ移れる）
  // シートの中に打つ欄を移すとき（sheetInput="inside"）は、同じものをシートの見出しの下に置く
  // 並びと余白は src/internal/combobox-base（TagsInput と共有）
  const renderControl = (place: 'field' | 'sheet', messageIds: string | undefined) => {
    const inSheet = place === 'sheet';
    return (
      <BaseCombobox.InputGroup
        ref={inSheet ? undefined : setFieldElement}
        data-slot={inSheet ? 'combobox-sheet-input' : 'control'}
        data-field-readonly={readOnly || undefined}
        style={multiple ? chipHeightStyle : undefined}
        className={comboboxControl({
          color,
          loading,
          className: [
            'group/cbx gap-0 px-0',
            multiple && 'h-auto min-h-(--spacing-control) flex-wrap',
          ],
        })}
      >
        {multiple ? (
          <ComboboxChips
            labelOf={labelOf}
            chipsName={chipsName}
            chipRemoveName={chipRemoveName}
            color={color}
            chipSize={chipSize}
            readOnly={readOnly}
            disabled={disabled || blocking}
            chipStyle={chipStyle}
          >
            {(values) => (
              <BaseCombobox.Input
                aria-describedby={messageIds}
                enterKeyHint={enterKeyHint}
                aria-disabled={blocking || undefined}
                aria-busy={loading || undefined}
                placeholder={loadingBlocking ? loadingText : values.length > 0 ? '' : placeholder}
                {...inputRest}
                className={mergeSlotClass(
                  `${inputClass} h-(--combobox-chip-height) min-w-16`,
                  inputClassName
                )}
              />
            )}
          </ComboboxChips>
        ) : (
          <BaseCombobox.Input
            aria-describedby={messageIds}
            enterKeyHint={enterKeyHint}
            aria-disabled={blocking || undefined}
            aria-busy={loading || undefined}
            placeholder={loadingBlocking ? loadingText : placeholder}
            {...inputRest}
            className={mergeSlotClass(`${inputClass} h-full ${controlInset}`, inputClassName)}
          />
        )}
        {/* 待っているあいだの印（design/adr/0042）。回る円は ▼ の左、線は本体の下端 */}
        {loading && loadingIndicator === 'spinner' && (
          <FieldSpinner className={loadingBlocking ? controlInsetEnd : 'me-2'} />
        )}
        {/* 成功のチェック（ADR-0058 の C）。回る円と同じ場所 */}
        {successText && !hideSuccessMark && !errorText && !loading && (
          <FieldSuccessMark className="me-2" />
        )}
        {/* ▼（原則8: 塗りのないアイコンは押せない意味の印）。欄のどこを押しても開くので、それ自体は押すものにしない
            シートの中の打つ欄には出さない（すでに開いていて、押して開くものではないため） */}
        {!inSheet &&
          chevron !== 'never' &&
          !(loadingBlocking || (disabled && hideCaretOnDisabled)) && (
            <BaseCombobox.Icon
              className={[
                'flex shrink-0 group-data-disabled/field:text-fg-subtle',
                readOnly ? 'text-fg-subtle' : 'text-fg-muted',
                'group-data-[loading=blocking]/field:text-fg-subtle',
                controlInsetEnd,
                chevron === 'empty-only' && 'group-has-data-[slot=combobox-clear]/cbx:hidden',
              ].join(' ')}
            >
              <CaretDownIcon />
            </BaseCombobox.Icon>
          )}
        {renderClear()}
        {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
      </BaseCombobox.InputGroup>
    );
  };

  // シートの中に打つ欄を移したとき（sheetInput="inside"）の本体。押すと開くボタンで、形は Select の本体と同じ
  // 選んだ値は文字（単数）かチップ（multiple）で出す。チップの × はボタンの中に置けないので、外す操作はシートの中で行う
  const renderTrigger = (messageIds: string | undefined) => (
    <>
      <BaseCombobox.Trigger
        ref={setFieldElement}
        onClick={
          focusInputOnOpen ? (event) => keyboardProxy.focusProxy(event.currentTarget) : undefined
        }
        aria-describedby={messageIds}
        aria-disabled={blocking || undefined}
        aria-busy={loading || undefined}
        data-slot="control"
        data-field-readonly={readOnly || undefined}
        className={comboboxControl({
          color,
          loading,
          className: [
            'text-left',
            multiple && 'h-auto min-h-(--spacing-control) flex-wrap py-(--spacing)',
            blocking ? 'cursor-progress' : readOnly ? 'cursor-default' : 'cursor-pointer',
          ],
        })}
      >
        <BaseCombobox.Value>
          {(selectedValue: string | string[] | null) => {
            const values = Array.isArray(selectedValue) ? selectedValue : [];
            if (multiple && values.length > 0) {
              return (
                <ComboboxTriggerChips
                  values={values}
                  labelOf={labelOf}
                  color={color}
                  chipSize={chipSize}
                  disabled={disabled || blocking}
                  chipStyle={chipStyle}
                />
              );
            }
            const single = !multiple && typeof selectedValue === 'string' ? selectedValue : null;
            if (single) {
              return (
                <span className="min-w-0 flex-1 truncate">{labelOf.get(single) ?? single}</span>
              );
            }
            return (
              <span className="min-w-0 flex-1 truncate text-(color:--field-placeholder)">
                {loadingBlocking ? loadingText : placeholder}
              </span>
            );
          }}
        </BaseCombobox.Value>
        {loading && loadingIndicator === 'spinner' && (
          <FieldSpinner className={loadingBlocking ? undefined : 'me-2'} />
        )}
        {successText && !hideSuccessMark && !errorText && !loading && (
          <FieldSuccessMark className="me-2" />
        )}
        {chevron !== 'never' && !(loadingBlocking || (disabled && hideCaretOnDisabled)) && (
          <BaseCombobox.Icon
            className={[
              'flex shrink-0 group-data-disabled/field:text-fg-subtle',
              readOnly ? 'text-fg-subtle' : 'text-fg-muted',
              'group-data-[loading=blocking]/field:text-fg-subtle',
            ].join(' ')}
          >
            <CaretDownIcon />
          </BaseCombobox.Icon>
        )}
        {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
      </BaseCombobox.Trigger>
      {keyboardProxy.proxy}
    </>
  );

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
      // シートの中に打つ欄を移したときの本体はボタンなので、ラベルは <label> にしない（Select と同じ）
      nativeLabel={!inputInSheet}
      name={name}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
    >
      {(messageIds) => (
        <BaseCombobox.Root<string, boolean, ListboxItem>
          items={collection}
          multiple={multiple}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange ? (next) => emitValue(onValueChange, next) : undefined}
          inputValue={inputValue}
          defaultInputValue={defaultInputValue}
          onInputValueChange={(next) => onInputValueChange?.(next)}
          filter={filter}
          filteredItems={filteredItems}
          autoHighlight={autoHighlight}
          openOnInputClick={openOnInputClick}
          disabled={disabled}
          readOnly={locked || undefined}
          required={required}
          name={name}
          form={form}
          modal={modal}
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
            changeOpen(next);
          }}
          // つまみで閉じたときに残した高さは、閉じる動きが終わってから消す
          onOpenChangeComplete={(next) => {
            if (!next) drag.clearDragHeight();
            onOpenChangeComplete?.(next);
          }}
        >
          {inputInSheet ? renderTrigger(messageIds) : renderControl('field', messageIds)}
          {/* 読み込みの知らせ（ADR-0055）。Combobox を描いているあいだずっと置く、見えない status の箱 */}
          <BaseCombobox.Status data-slot="combobox-status" className="sr-only">
            {announcement}
          </BaseCombobox.Status>
          <BaseCombobox.Portal container={portalContainer}>
            {/* シートの中に打つ欄を移したときは、後ろの画面を暗くする（design/adr/0037）
                欄に打つ欄を残すとき（sheetInput="field"）は暗くしない。欄はシートの外にあり、打っているあいだも読めるようにするため */}
            {inputInSheet && (
              <BaseCombobox.Backdrop className="fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--duration-sheet) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
            )}
            {/* シートのときは、Base UI が付ける位置（インラインの style）を上書きして、画面の下に固定する
                ソフトウェアキーボードが隠している分（--visualViewport）だけ持ち上げ、残りの高さに収める */}
            <BaseCombobox.Positioner
              sideOffset={() => popupSideOffset(fieldRef.current)}
              {...positionerRest}
              data-presentation={listPresentation}
              data-density={densityScope.density}
              style={{ ...comboboxPositionerStyle(popupShell), ...positionerStyle }}
              className={mergeSlotClass(comboboxPositionerClass(popupShell), positionerClassName)}
            >
              <BaseCombobox.Popup
                finalFocus={
                  inputInSheet && focusInputOnOpen
                    ? () => {
                        // 閉じたら欄へフォーカスを戻す。戻すときにページをスクロールさせない
                        fieldRef.current?.focus({ preventScroll: true });
                        return false;
                      }
                    : undefined
                }
                initialFocus={
                  inputInSheet && focusInputOnOpen
                    ? () =>
                        document.querySelector<HTMLElement>(
                          '[data-slot="combobox-popup"] [data-slot="combobox-sheet-input"] input'
                        )
                    : undefined
                }
                {...popupRest}
                ref={popupRef}
                data-slot="combobox-popup"
                data-dragging={drag.dragging || undefined}
                style={{
                  ...comboboxPopupStyle({
                    selected,
                    sheet,
                    sheetDetent,
                    dragHeight: drag.sheetHeight,
                  }),
                  ...popupStyle,
                }}
                className={mergeSlotClass(
                  listboxPopup({ presentation: listPresentation }),
                  popupClassName
                )}
              >
                {/* シートの見出し（design/adr/0037）: つまみ・ラベル・ヘルプテキスト・エラー・警告と、右上の ×
                    打つ欄をシートに移したときは、その下に打つ欄を置く。高さを測る箱は見出しと打つ欄の両方を囲む */}
                {sheet && (
                  <div ref={headerRef} className="flex shrink-0 flex-col">
                    <SheetHeader
                      handle={long}
                      onPointerDown={drag.handlers.onPointerDown}
                      onPointerMove={drag.handlers.onPointerMove}
                      onPointerUp={drag.handlers.onPointerUp}
                      onPointerCancel={drag.handlers.onPointerUp}
                      className={long ? 'cursor-grab touch-none' : undefined}
                      close={
                        // 閉じるは、見出しとヘルプテキストのまとまりの上下中央に置く。
                        // 見出しの行の中央からは、ヘルプテキストの行（と間の 2px）の半分だけ下がる。エラー・警告の行は数えない（出入りで動かないように）
                        caption || inputInSheet ? (
                          <div className="mt-[calc((var(--leading-caption)+2px)/2)]">
                            {renderSheetClose()}
                          </div>
                        ) : (
                          renderSheetClose()
                        )
                      }
                    >
                      <SheetFieldTitle
                        label={label}
                        caption={caption}
                        captionId={sheetCaptionId}
                        messages={sheetMessages}
                        reserveCaption={inputInSheet}
                      />
                    </SheetHeader>
                    {inputInSheet && (
                      <div className={comboboxSheetInputClass}>
                        {renderControl('sheet', undefined)}
                      </div>
                    )}
                  </div>
                )}
                {/* 当たる選択肢がないときの行。読み上げにも知らせる箱なので、文がなくても要素は残す */}
                <ComboboxEmpty>{emptyText && !loading ? emptyText : null}</ComboboxEmpty>
                {(long || popoverCue) && (
                  <SheetMoreCue edge="top" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                )}
                {/* 一覧の説明（design/adr/0044）: ヘルプテキスト → 欄のエラー → 警告
                    シートは見出しの文を、浮かぶ選択肢は本体の上下の文（本体の説明と同じ）を指す */}
                <BaseCombobox.List
                  ref={listRef}
                  aria-describedby={
                    sheet
                      ? [caption && sheetCaptionId, ...sheetMessages.map((message) => message.id)]
                          .filter(Boolean)
                          .join(' ') || undefined
                      : messageIds
                  }
                  onScroll={sheet || popoverCue ? updateCues : undefined}
                  className={listboxList({
                    presentation: listPresentation,
                    loadingRow,
                    className: 'data-empty:py-0',
                  })}
                >
                  {grouped
                    ? (group: ListboxGroup, index: number) => (
                        <ComboboxGroupSection
                          key={index}
                          group={group}
                          separator={showGroupSeparator && index > 0}
                          labelStyle={groupLabelStyle}
                        >
                          {(item) => <ComboboxOption key={item.value} item={item} />}
                        </ComboboxGroupSection>
                      )
                    : (item: ListboxItem) => <ComboboxOption key={item.value} item={item} />}
                </BaseCombobox.List>
                {(long || popoverCue) && (
                  <SheetMoreCue edge="bottom" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                )}
                {/* 止めずに読み込んでいるあいだ、選択肢の最後に出す行（design/adr/0042） */}
                {loadingRow && (
                  <ListboxLoadingRow
                    ref={loadingRowRef}
                    slot="combobox-loading"
                    presentation={listPresentation}
                  >
                    {loadingText}
                  </ListboxLoadingRow>
                )}
              </BaseCombobox.Popup>
            </BaseCombobox.Positioner>
          </BaseCombobox.Portal>
        </BaseCombobox.Root>
      )}
    </Field>
  );
}
