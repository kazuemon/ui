'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type ComboboxChipSize,
  comboboxChipMaxWidthStyle,
  comboboxControl,
  comboboxInputClass,
  controlInsetEnd,
} from '../../internal/combobox-base/combobox-control-styles';
import {
  ComboboxEmpty,
  ComboboxGroupSection,
  ComboboxSheetClose,
} from '../../internal/combobox-base/ComboboxParts';
import {
  comboboxPopupStyle,
  comboboxPositionerClass,
  comboboxPositionerStyle,
} from '../../internal/combobox-base/combobox-popup-styles';
import { useDensityScope } from '../../internal/density-scope';
import {
  Field,
  type FieldLoadingBehavior,
  type FieldValidate,
  FieldLoadingBar,
  FieldSpinner,
  FieldSuccessMark,
  useFieldState,
} from '../../internal/field/Field';
import {
  type FieldMessage,
  type FieldNamed,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { XIcon } from '../../internal/icons';
import { ComboboxOption } from '../../internal/listbox/ComboboxOption';
import { type ListboxColor, selectedTokens } from '../../internal/listbox/listbox-colors';
import {
  type ListboxFieldProps,
  defaultLoadedSuggestionsText,
} from '../../internal/listbox/listbox-field-props';
import {
  type ListboxItems,
  type NormalizedListboxGroup,
  flattenItems,
  isGroupedItems,
  labelMap,
  normalizeItems,
} from '../../internal/listbox/listbox-items';
import {
  type ListboxInputProps,
  type ListboxSlotProps,
  mergeSlotClass,
  joinIds,
} from '../../internal/listbox/listbox-slot-props';
import type { ListboxItem } from '../../internal/listbox/use-listbox-option';
import { popupSideOffset } from '../../internal/listbox/listbox-measure';
import { ListboxLoadingRow } from '../../internal/listbox/ListboxLoadingRow';
import {
  type GroupLabelStyle,
  type ListboxPresentation,
  listboxPopup,
} from '../../internal/listbox/listbox-styles';
import { ListboxScroll } from '../../internal/listbox/ListboxScroll';
import { useListboxLayout } from '../../internal/listbox/use-listbox-layout';
import { useLoadingAnnouncement } from '../../internal/listbox/use-loading-announcement';
import { SheetFieldTitle } from '../../internal/sheet/SheetFieldTitle';
import { useSheetMessages } from '../../internal/sheet/use-sheet-messages';
import { SheetHeader } from '../../internal/sheet/SheetHeader';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import type { SheetMoreCue as SheetMoreCueKind } from '../../internal/sheet/SheetMoreCue';
import { useKeyboardInset, useKeyboardShrink } from '../../internal/sheet/use-keyboard-inset';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { type SheetDetent, useSheetDrag } from '../../internal/sheet/use-sheet-drag';
import { chipHeightValue } from '../../internal/small-parts-size';
import { usePortalContainer } from '../../internal/ui-config';
import { useControlled } from '../../internal/use-controlled';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { DISMISS_REASONS, ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import { FieldAddonButton } from '../field-addon/FieldAddon';
import type { LoadingIndicator } from '../loading/Loading';
import {
  commitTags,
  splitBySeparators,
  takeTags,
  type TagsInputRejectReason,
} from './tags-input-commit';
import { TagsFeedbackContext, tagsRejectText, useTagsFeedback } from './tags-input-feedback';
import { TagsInputChips } from './TagsInputChips';

export type { TagsInputRejectReason } from './tags-input-commit';

/**
 * 打った文字と候補を突き合わせる関数。`Combobox.useFilter`（Base UI）の `contains` などを渡す
 * null を渡すと、部品の中では絞り込まず、渡された候補をそのまま出す（外で絞り込むとき）
 */
export type TagsInputFilter = (
  item: ListboxItem,
  query: string,
  itemToString?: (item: ListboxItem) => string
) => boolean;

const defaultSeparators = [','];
const defaultChipRemoveName = (label: string) => `${label} を外す`;
// 貼り付けでは、区切りの文字に加えて、改行とタブでも分ける
const pasteBreaks = ['\r\n', '\n', '\r', '\t'];

/** TagsInput の本体（TagsInputControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface TagsInputControlProps {
  /**
   * 成功のとき、本体の端に置くチェックを隠すか。true では下の行だけを出します
   * @default false
   */
  hideSuccessMark?: boolean;
  /**
   * 読み取り専用にします。見た目は文字を打つ欄の読み取り専用と同じで、塗りを持たず、細い破線の輪郭と
   * 一段淡い値の文字になります。フォーカスでき、値をなぞって写せます。
   * 打ってもタグにならず、候補も開きません。消去のボタンとチップの × も出しません。フォームでは値が送られます
   * @default false
   */
  readOnly?: boolean;
  /**
   * チップと候補の印の色。利用者が選ぶ primary・secondary に加え、色を持たない neutral（グレー）を選べます（原則6）
   * @default 'neutral'
   */
  color?: ListboxColor;
  /** いまのタグ（制御） */
  value?: string[];
  /** はじめのタグ（非制御） */
  defaultValue?: string[];
  /** タグが変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string[]) => void;
  /** 打っている文字（制御） */
  inputValue?: string;
  /** はじめの打っている文字（非制御） */
  defaultInputValue?: string;
  /** 打っている文字が変わるときに、次の文字を渡して呼びます。外で候補を引くときは、この文字で問い合わせます */
  onInputValueChange?: (inputValue: string) => void;
  /**
   * タグの区切りにする文字。打っている途中でも、貼り付けたときでも、この文字で分けてタグにします。
   * Enter と、貼り付けたときの改行・タブは、ここに書かなくても区切りです
   * @default [',']
   */
  separators?: string[];
  /**
   * 同じ文字のタグを 2 つ以上足せるか。false では足さず、すでにあるチップを一瞬強調します
   * @default false
   */
  allowDuplicates?: boolean;
  /** タグの数の上限。書かないときは上限なしです */
  max?: number;
  /**
   * タグ 1 つずつを、タグにしてよいかを確かめる関数。打った文字と、足す前のタグの並びを受け取り、通らないときはエラーの文を返します（通るときは null）。
   * 通らなかった文字はチップにならず、返した文を本体の下のエラーの行に出します。欄全体（タグの並び）を確かめるときは validate を使います
   */
  validateTag?: (tag: string, tags: string[]) => ReactNode;
  /**
   * フォーカスが外れたときに、打っている途中の文字をタグにするか
   * @default true
   */
  commitOnBlur?: boolean;
  /**
   * ソフトウェアキーボードの実行キーの見た目と働き。既定の `'enter'` は、キーを改行の形にして Enter を送ります。
   * 同じ画面に入力欄が並んでいると、書かないときのキーは「次へ」になり、Enter がタグにならずに次の欄へ移ってしまいます。
   * 最後の欄で送信まで進めたいときなど、別の働きにしたいときだけ書き換えます
   * @default 'enter'
   */
  enterKeyHint?: ComponentProps<'input'>['enterKeyHint'];
  /** タグにならなかったとき（重複・上限・validateTag）。弾かれた文字と理由を受け取ります */
  onReject?: (tag: string, reason: TagsInputRejectReason) => void;
  /**
   * タグにならなかったときに、本体の下へ一瞬だけ出す文。理由と弾かれた文字を受け取り、出さないときは false を返します。
   * 丸の「i」と青い文字（`info` の行）で出し、チップの強調と同じ長さで消えます。文は呼び出し側が書きます（原則20）
   *
   * `info` も渡しているときは、そのあいだだけ同じ行の文が入れ替わり、消えると元の `info` に戻ります。
   * 行の高さは変わりません。読み上げは、行ではなく見えない `role="status"` の箱が担うので、
   * 戻ったときに元の `info` が読み直されることはありません。`error`・`warning`・`success` は別の行なので影響しません
   */
  rejectMessage?: (reason: TagsInputRejectReason, tag: string) => ReactNode | false;
  /**
   * 空の欄に出す見本の文字。「打って Enter で足す」のように、どうすると足せるかが分かる書き方にします
   */
  placeholder?: string;
  /**
   * 打っているあいだに出す候補。渡さないときは候補を出しません（打った文字だけがタグになります）。
   * 1 つの候補は、文字だけ（ラベルも同じ文字）か `{ label, value }` で渡します。候補にない文字も、そのままタグになります
   */
  items?: ListboxItems;
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
   * 打った文字と候補を突き合わせる関数。書かないときは Base UI の既定（前後の空白を無視した部分一致）です。
   * null にすると部品の中では絞り込まず、`items`（または `filteredItems`）をそのまま出します
   */
  filter?: TagsInputFilter | null;
  /** 外で絞り込んだ候補。渡すと、部品の中の絞り込みの代わりにこれを出します */
  filteredItems?: ListboxItems;
  /**
   * 打ち始めたときに、最初に当たった候補へ自動で印を移すか。
   * true では、打ってすぐ Enter を押すと、打った文字ではなく印の付いた候補がタグになります
   * @default false
   */
  autoHighlight?: boolean;
  /**
   * 欄を押したときに候補を開くか。false では、文字を打ったときだけ開きます
   * @default false
   */
  openOnInputClick?: boolean;
  /**
   * タグをすべて消すボタン（×）を欄の端に出すか。タグがないときと、読み取り専用の欄では出しません
   * @default true
   */
  clearable?: boolean;
  /**
   * 消すボタンの読み上げの名前
   * @default 'タグをすべて消去'
   */
  clearName?: string;
  /**
   * チップの × の読み上げの名前を作る関数。何を外すのかが分かる文にします
   * @default (label) => `${label} を外す`
   */
  chipRemoveName?: (label: string) => string;
  /**
   * 欄に並ぶチップのまとまりの読み上げの名前
   * @default '追加したタグ'
   */
  chipsName?: string;
  /**
   * チップの最大幅（CSS の長さ。例: '120px'、'10rem'）。超えた文字は … で省略します。
   * 書かないときはチップを切らず、欄の幅いっぱいまで伸びます
   */
  chipMaxWidth?: string;
  /**
   * チップの大きさ（Chip の size にそのまま渡します。ADR-0259）。
   * 既定の md は今までの欄の中のチップと同じ高さです。sm は Tag と同じ高さ、lg は部品の高さです
   * @default 'md'
   */
  chipSize?: ComboboxChipSize;
  /**
   * 欄の中にタグを並べる行数の上限。書かないときは、行が増えるたびに欄が高くなります（既定）。
   * 指定すると、その行数で欄の高さが止まり、あふれた分は縦にスクロールします。
   * 続きがあることは端の内側の影で見せ、つまみは欄に載せたときとスクロールしているあいだに出します
   *
   * 1 を渡したときだけは折り返さず、1 行のまま横にスクロールします。1 行で折り返すと、
   * タグを 1 つ足すたびに見えている中身がそっくり入れ替わってしまうためです
   */
  maxRows?: number;
  /** 当たる候補がないときに出す文 */
  emptyText?: ReactNode;
  /** 候補を開いているか（制御） */
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
   * 浮かぶ候補を描く場所。ThemeProvider でまとめて指定できます
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /**
   * 浮かぶ候補の面（Popup）に広げる props。id・data-*・aria-* や、面だけに足すクラスを渡します。
   * className は部品のクラスに重ねます
   */
  popupProps?: ListboxSlotProps;
  /**
   * 浮かぶ候補の位置を決める要素（Positioner）に広げる props。画面の端に当たったときの逃がし方（collisionAvoidance）も、ここに渡します。
   * className は部品のクラスに重ねます
   */
  positionerProps?: ListboxSlotProps &
    Pick<ComponentProps<typeof BaseCombobox.Positioner>, 'collisionAvoidance' | 'anchor'>;
  /**
   * 欄の中の打つ欄（input）に広げる props。autoComplete・inputMode・ref などを渡します。
   * className は部品のクラスに重ねます。onKeyDown などのハンドラーは、部品の処理の前に呼びます。
   * aria-describedby は、部品の説明（キャプション・状態の行）の前につなぎます
   */
  inputProps?: ListboxInputProps;
  /**
   * 候補の出し方。auto は指で操作していて画面が狭いときだけシートにします。popover はいつも浮かべ、
   * sheet はいつもシートにします。打つ欄は欄に残り、候補だけがシートに出ます（design/adr/0037）
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * シートを開いたときの高さ。half は候補が長いときに半分の高さで開き、つまみを出します。full は高さいっぱいで開きます
   * 打つ欄は欄に残るので、既定は half です（full で開くと、シートが欄を覆います）
   * @default 'half'
   */
  sheetDetent?: SheetDetent;
  /**
   * シートで、候補の上下に続きがあることの見せ方
   * @default 'divider-always-shadow'
   */
  sheetMoreCue?: SheetMoreCueKind;
  /**
   * 浮かぶ候補で、上下に続きがあることを内側の影で見せるか。none は見せません
   * @default 'shadow'
   */
  popoverMoreCue?: 'none' | 'shadow';
  /**
   * 浮かぶ候補の高さの上限
   * none: 画面の端まで伸ばす。screen: 画面の高さの半分で、最後の候補を半分見せる
   * @default 'screen'
   */
  popoverMaxHeight?: 'none' | 'screen';
  /**
   * 読み込んでいるあいだの印。spinner は回る円、bar は下端に流れる線です
   * @default 'spinner'
   */
  loadingIndicator?: LoadingIndicator;
  /**
   * 読み込んでいるあいだの文
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /**
   * 読み込みが終わったときに、読み上げで知らせる文です。候補の数を受け取って返します
   * @default (count) => `${count} 件の候補`
   */
  loadedText?: (count: number) => string;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
}

/** TagsInput の外枠（Field）が受け持つ props */
interface TagsInputFieldProps extends ListboxFieldProps {
  /**
   * 成功の内容。本体の下に丸のチェックと緑の文字で出し、本体の端（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。errorText があるときは、欄の見た目はエラーを優先します
   */
  successText?: FieldMessage;
  /**
   * 押せない（Disabled）状態にします。打てず、候補も開かず、フォームでは値が送られません
   * @default false
   */
  disabled?: boolean;
  /** フォームに送るときの名前。タグの数だけ、同じ名前で送られます */
  name?: string;
  /**
   * 欄全体を確かめる関数です（design/adr/0255）。タグの並び（`string[]`）とフォーム全体の値を受け取り、正しくないとき
   * （1 つもないとき・多すぎるときなど）はエラーの文（複数あれば配列）を返します。errorText があるときは、そちらを優先します。
   * タグ 1 つずつを確かめるときは validateTag を使います
   */
  validate?: FieldValidate;
  /**
   * 候補を読み込んでいる（design/adr/0042）。印を出し、本体に aria-busy を付ける
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込んでいるあいだの欄の扱い（design/adr/0042）
   * non-blocking: 止めない。打てるままで、開くと候補の最後に loadingText の行を出す
   * blocking: 止める。押せない欄と同じ見た目にし、プレースホルダの場所に loadingText を出す
   * @default 'non-blocking'
   */
  loadingBehavior?: FieldLoadingBehavior;
}

/** TagsInput の props から、label・accessibleName の組み合わせの決まりを外したもの。TagsInput を包む部品が継ぎます */
export type TagsInputBaseProps = TagsInputControlProps & TagsInputFieldProps;

/** TagsInput の props。label か accessibleName のどちらかが要ります */
export type TagsInputProps = FieldNamed<TagsInputBaseProps>;

/**
 * 打った文字をタグにして並べる欄の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・読み込んでいる・エラー・成功の状態と、説明のつながり（aria-describedby）は、包む Field から受け取ります。
 * 組み立てでは、validateTag を通らなかった文と rejectMessage の文は、本体の下の行には出ず、読み上げで知らせます
 */
export function TagsInputControl({
  hideSuccessMark = false,
  readOnly,
  color = 'neutral',
  value: valueProp,
  defaultValue,
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue,
  onInputValueChange,
  separators = defaultSeparators,
  allowDuplicates = false,
  max,
  validateTag,
  commitOnBlur = true,
  enterKeyHint = 'enter',
  onReject,
  rejectMessage,
  placeholder,
  items,
  groupLabelStyle = 'label',
  showGroupSeparator = false,
  filter,
  filteredItems,
  autoHighlight = false,
  openOnInputClick = false,
  clearable = true,
  clearName = 'タグをすべて消去',
  chipRemoveName = defaultChipRemoveName,
  chipsName = '追加したタグ',
  chipMaxWidth,
  chipSize = 'md',
  maxRows,
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
  sheetDetent = 'half',
  sheetMoreCue = 'divider-always-shadow',
  popoverMoreCue = 'shadow',
  popoverMaxHeight = 'screen',
  loadingIndicator = 'spinner',
  loadingText = '読み込んでいます',
  loadedText = defaultLoadedSuggestionsText,
  form,
}: TagsInputControlProps) {
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  const loadingBehavior: FieldLoadingBehavior = field?.loadingBehavior ?? 'non-blocking';
  const required = field?.required ?? false;
  // シートの見出しに出す欄の文。見えるラベルがないときは、読み上げの名前を見出しにする
  const label = field?.label ?? field?.accessibleName;
  const caption = field?.caption;
  const warningText = field?.messages.warning;
  const successText = field?.messages.success;
  const messageIds = field?.describedBy;
  // 弾いた・通らなかったことの合図。内蔵の形（TagsInput）では、外枠の側で持ち、Field の下の行にも出す
  const outer = useContext(TagsFeedbackContext);
  const ownFeedback = useTagsFeedback();
  const { invalidMessage, setInvalidMessage, controlRef, flash, fire } =
    outer?.feedback ?? ownFeedback;
  // 利用者が渡した info。内蔵の形では、Field の info は弾いた文と入れ替えたあとのものなので、元の文を受け取る
  const infoText = outer ? outer.info : field?.messages.info;
  // 読み込んでいるあいだ（design/adr/0042）。blocking は開けず、タグも変えられない
  const loadingBlocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !loadingBlocking;
  // Form の送信中も、同じく開けず変えられない
  const blocking = field?.blocking ?? false;
  // 読み取り専用（ADR-0170）: 文字を打つ欄の読み取り専用と同じ見た目にし、候補は開かない
  const locked = blocking || !!readOnly;
  const portalContainer = usePortalContainer(portalContainerProp);
  // 候補を渡さないときは、浮かぶ部分をいっさい描かない（打った文字だけがタグになる）
  const hasItems = items !== undefined;

  // 値は部品の中でも持てる（制御しないとき）
  const [values, setValues] = useControlled<string[]>(
    valueProp,
    () => defaultValue ?? [],
    onValueChange
  );
  const [text, setText] = useControlled(
    inputValueProp,
    () => defaultInputValue ?? '',
    onInputValueChange
  );

  // IME の変換中（変換中の Enter と区切りの文字では確定しない）
  const composing = useRef(false);
  // 候補に印が付いているか（Enter を候補に渡すか、打った文字をタグにするかの分かれ目）
  const highlighted = useRef<string | undefined>(undefined);

  /** タグの候補を足す。弾かれたものは合図と、validateTag の文で見せる */
  const addTags = (candidates: string[]) => {
    const result = commitTags(values, candidates, { allowDuplicates, max, validateTag });
    if (result.added.length > 0) {
      setValues(result.next);
      setInvalidMessage(null);
    }
    if (result.rejected) {
      const { tag, reason, message } = result.rejected;
      fire({ tag, reason });
      setInvalidMessage(reason === 'invalid' ? message : null);
      onReject?.(tag, reason);
    }
    return result;
  };

  /** 打っている文字を、そのままタグにする（Enter・フォーカスが外れたとき） */
  const commitText = () => {
    if (text.trim() === '') return;
    const result = addTags(splitBySeparators(text, separators));
    // validateTag を通らなかった文字は、直せるように欄へ残す（エラーの行もそのあいだ出したままにする）
    if (result.added.length === 0 && result.rejected?.reason === 'invalid') return;
    setText('');
  };

  /** 打っている文字が変わったとき。区切りで終わった分をタグにし、切れ端は欄に残す */
  const changeText = (next: string) => {
    if (invalidMessage) setInvalidMessage(null);
    if (composing.current || locked) {
      setText(next);
      return;
    }
    const { tags, rest } = takeTags(next, separators);
    if (tags.length === 0) {
      setText(next);
      return;
    }
    addTags(tags);
    setText(rest);
  };

  // 候補を選んだとき・チップを外したとき・消去したとき。足すものは重複・上限・validateTag を通す
  const changeValues = (next: string[]) => {
    const added = next.filter((item) => !values.includes(item));
    if (added.length === 0) {
      setValues(next);
      return;
    }
    addTags(added);
  };

  // Backspace の1回目。最後のチップへフォーカスを移す（2回目の Backspace で消える）
  const focusLastChip = () => {
    const chips = controlRef.current?.querySelectorAll<HTMLElement>(
      '[data-slot="tags-input-chip"]'
    );
    chips?.[chips.length - 1]?.focus();
  };

  // 開閉は部品の中でも持つ（止めているあいだ・候補がないときは開かせない）
  const [openState, setOpenState] = useState(defaultOpen);
  const open = locked || !hasItems ? false : (openProp ?? openState);
  const changeOpen = (next: boolean) => {
    if (next && (locked || !hasItems)) return;
    if (next) drag.reset();
    setOpenState(next);
    onOpenChange?.(next);
  };

  // 文字だけで渡された候補は { label, value } にそろえる（ラベルも同じ文字）
  const shownItems = useMemo(() => (items ? normalizeItems(items) : undefined), [items]);
  const shownFilteredItems = useMemo(
    () => (filteredItems ? normalizeItems(filteredItems) : undefined),
    [filteredItems]
  );
  // Base UI には、候補から値とラベルを引く collection を渡す
  const collection = useMemo(
    () =>
      shownItems
        ? BaseCombobox.createItems<ListboxItem, string>(shownItems, {
            getValue: (item) => item.value,
            getLabel: (item) => item.label,
          })
        : undefined,
    [shownItems]
  );
  const flat = useMemo(() => (shownItems ? flattenItems(shownItems) : []), [shownItems]);
  const labelOf = useMemo(() => labelMap(flat), [flat]);

  // シートの見出しに出す欄の文（design/adr/0044）。本体の下の行と同じ
  const shownError = field?.messages.error ?? invalidMessage;
  const rejectText = tagsRejectText(flash, rejectMessage);
  // 弾いた文の読み上げ。内蔵の形では、利用者が info を渡していて、同じ行の文が入れ替わるときだけ、見えない箱で知らせる
  //   （下の TagsInput を参照）。組み立てでは下の行に出ないので、いつも見えない箱を置き、validateTag を通らなかった文も知らせる
  const announceReject = outer ? Boolean(rejectMessage) && Boolean(infoText) : true;
  const statusText = outer ? rejectText : (rejectText ?? invalidMessage);
  const {
    captionId: sheetCaptionId,
    messages: sheetMessages,
    listDescribedBy: sheetListDescribedBy,
  } = useSheetMessages({ error: shownError, warning: warningText, caption });

  // 候補の出し方（design/adr/0037・原則16）。打つ欄は欄に残り、候補だけがシートに出る
  const sheet = useSheetPresentation(presentation) && hasItems;
  const listPresentation: ListboxPresentation = sheet ? 'sheet' : 'popover';
  const popoverCue = !sheet && popoverMoreCue === 'shadow';
  const popoverFit = !sheet && popoverMaxHeight === 'screen';
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
  const long = sheet && sheetDetent === 'half' && !!metrics && metrics.content > metrics.half + 1;
  const drag = useSheetDrag({ sheetDetent, metrics, long, onClose: () => changeOpen(false) });

  const announcement = useLoadingAnnouncement({
    open,
    loadingRow,
    loadingText,
    loadedText,
    count: flat.length,
  });

  const { anchorRef: fieldRef, scope: densityScope } = useDensityScope<HTMLElement>(open);
  const setControlElement = (el: HTMLDivElement | null) => {
    controlRef.current = el;
    fieldRef.current = el;
  };
  const popupShell = { sheet, densityScope, keyboardInset, keyboardShrink, sheetDetent };

  const chipStyle = comboboxChipMaxWidthStyle(chipMaxWidth);
  // 欄に置く変数。打つ欄の高さをチップにそろえ（--combobox-chip-height）、行数の上限（maxRows）があれば
  // チップを並べる枠（TagsInputChips）が読む変数も足す
  //   2 行以上: その行数の高さで止めて縦にスクロールする。1 行分の高さはチップの高さ（ADR-0217・0259）
  //   1 行: 折り返さず、横にスクロールする（1 行で折り返すと、1 つ足すたびに見える中身が入れ替わる）
  const rowsStyle = useMemo<CSSProperties>(() => {
    const rowHeight = chipHeightValue[chipSize];
    const base: CSSProperties = { '--combobox-chip-height': rowHeight } as CSSProperties;
    if (maxRows === undefined) return base;
    if (maxRows <= 1) {
      return {
        ...base,
        '--tags-input-wrap': 'nowrap',
        '--tags-input-chip-shrink': '0',
        '--tags-input-content-min-width': 'max-content',
      } as CSSProperties;
    }
    return {
      ...base,
      // 行の高さ × 行数 ＋ 行のあいだの間 ＋ 枠の上下の余白
      '--tags-input-max-height': `calc(${maxRows} * (${rowHeight} + var(--spacing)) + var(--spacing))`,
    } as CSSProperties;
  }, [maxRows, chipSize]);
  const selected = selectedTokens(color);
  const grouped = isGroupedItems(shownFilteredItems ?? shownItems ?? []);
  const inputClass = comboboxInputClass({ blocking, readOnly });

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

  return (
    <BaseCombobox.Root<string, true, ListboxItem>
      items={collection}
      multiple
      value={values}
      onValueChange={(next) => changeValues(next)}
      inputValue={text}
      onInputValueChange={(next) => changeText(next)}
      onItemHighlighted={(item) => {
        highlighted.current = item;
      }}
      filter={filter}
      filteredItems={shownFilteredItems}
      autoHighlight={autoHighlight}
      openOnInputClick={openOnInputClick && hasItems}
      disabled={disabled}
      readOnly={locked || undefined}
      // required は隠れた input にネイティブの required を付け、送信時にブラウザが確かめて止めてしまう
      // （design/adr/0255 の影響）。渡さず、Input に直に付けた aria-required だけで伝える
      required={false}
      // name は包む Field から Base UI が読む
      form={form}
      modal={modal}
      open={open}
      onOpenChange={(next, details) => {
        // 外を押して閉じない・Esc で閉じない設定のときは、閉じる合図を取り消す（ADR-0251）
        if (!next && !dismissible && DISMISS_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        changeOpen(next);
      }}
      onOpenChangeComplete={(next) => {
        if (!next) drag.clearDragHeight();
        onOpenChangeComplete?.(next);
      }}
    >
      <BaseCombobox.InputGroup
        ref={setControlElement}
        data-slot="control"
        data-field-readonly={readOnly || undefined}
        // 行数の上限（maxRows）。枠とチップが読む変数を、欄に置く
        style={rowsStyle}
        className={comboboxControl({
          color,
          loading,
          // タグが増えたときの伸び方は、チップを並べる箱（TagsInputChips）が持つ。
          // 端の消去 × は欄の側に残し、チップだけが流れる
          className: ['group/tags h-auto min-h-(--spacing-control) gap-0 px-0'],
        })}
      >
        <TagsInputChips
          labelOf={labelOf}
          chipsName={chipsName}
          chipRemoveName={chipRemoveName}
          color={color}
          chipSize={chipSize}
          readOnly={readOnly}
          disabled={disabled || blocking}
          chipStyle={chipStyle}
          flashTag={flash?.reason === 'duplicate' ? flash.tag : undefined}
        >
          {(chips) => (
            <BaseCombobox.Input
              // 利用者の props は先に広げ、部品の振る舞いと説明が上書きされないようにする。利用者のハンドラーは部品の処理の前に呼ぶ
              {...inputRest}
              aria-describedby={joinIds(inputRest['aria-describedby'], messageIds)}
              aria-required={required || undefined}
              aria-disabled={blocking || undefined}
              aria-busy={loading || undefined}
              // ソフトウェアキーボードの実行キー。既定では Enter を送るキーにする（enterKeyHint）
              enterKeyHint={enterKeyHint}
              placeholder={loadingBlocking ? loadingText : chips.length > 0 ? '' : placeholder}
              onCompositionStart={(event) => {
                inputRest.onCompositionStart?.(event);
                composing.current = true;
              }}
              onCompositionEnd={(event) => {
                inputRest.onCompositionEnd?.(event);
                composing.current = false;
                // 変換が終わった文字にも区切りが混ざりうる（「、」を区切りにしたときなど）
                changeText(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                inputRest.onKeyDown?.(event);
                if (locked) return;
                // IME の変換中は、Enter も区切りの文字も確定に使わない
                //   Android の IME は、変換していないあいだも keyCode に 229 を送ることがあるので、
                //   229 だけでは変換中と決めない（key が Enter なら、そのまま確定に使う）
                const composingNow =
                  composing.current ||
                  event.nativeEvent.isComposing ||
                  (event.which === 229 && event.key !== 'Enter');
                if (composingNow) return;
                if (event.key === 'Enter') {
                  // 候補に印が付いているときは、その候補を選ぶ（Base UI に任せる）
                  if (open && highlighted.current !== undefined) return;
                  event.preventBaseUIHandler();
                  // 打っている途中の文字は、フォームを送らずにタグにする
                  if (text !== '') event.preventDefault();
                  commitText();
                  return;
                }
                if (event.key === 'Escape' && !open) {
                  // Base UI の既定はタグもすべて消すので、打っている文字だけを消す
                  event.preventBaseUIHandler();
                  if (text !== '') {
                    event.preventDefault();
                    setText('');
                  }
                  return;
                }
                if (event.key === 'Backspace' && text === '' && values.length > 0) {
                  // 1回目は最後のチップを選ぶだけ（Base UI の既定はすぐ消す）
                  event.preventBaseUIHandler();
                  event.preventDefault();
                  focusLastChip();
                }
              }}
              onPaste={(event) => {
                inputRest.onPaste?.(event);
                if (locked) return;
                const clip = event.clipboardData?.getData('text') ?? '';
                const parts = splitBySeparators(clip, [...separators, ...pasteBreaks])
                  .map((part) => part.trim())
                  .filter(Boolean);
                // 区切りのない貼り付けは、ふつうに欄へ入れる
                if (parts.length <= 1) return;
                event.preventDefault();
                addTags(parts);
              }}
              onBlur={(event) => {
                inputRest.onBlur?.(event);
                if (!commitOnBlur || locked) return;
                const next = event.relatedTarget;
                // チップ・× や候補へ移ったときは、まだ欄の中にいる
                if (
                  next instanceof HTMLElement &&
                  (controlRef.current?.contains(next) ||
                    next.closest('[data-slot="tags-input-popup"]'))
                )
                  return;
                commitText();
              }}
              className={mergeSlotClass(
                `${inputClass} h-(--combobox-chip-height) min-w-16`,
                inputClassName
              )}
            />
          )}
        </TagsInputChips>
        {loading && loadingIndicator === 'spinner' && (
          <FieldSpinner className={loadingBlocking ? controlInsetEnd : 'me-2'} />
        )}
        {successText && !hideSuccessMark && !shownError && !loading && (
          <FieldSuccessMark className="me-2" />
        )}
        {clearable && !readOnly && (
          <BaseCombobox.Clear
            tabIndex={0}
            render={
              <FieldAddonButton>
                <XIcon standalone />
              </FieldAddonButton>
            }
            disabled={blocking || disabled || undefined}
            data-slot="tags-input-clear"
            aria-label={clearName}
          />
        )}
        {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
      </BaseCombobox.InputGroup>
      {/* 弾いたことの読み上げ。ふだんは本体の下の行がすでに読み上げの箱なので置かない（二重に読ませない — 原則15）。
              利用者が info を渡していて、同じ行の文が入れ替わるときだけ、行の代わりにこの箱が知らせる
              文が出ていないあいだも箱は残す（あとから現れる箱は読まれないため — ADR-0055） */}
      {announceReject && (
        <div role="status" data-slot="tags-input-reject-status" className="sr-only">
          {statusText}
        </div>
      )}
      {hasItems && (
        <>
          <BaseCombobox.Status data-slot="tags-input-status" className="sr-only">
            {announcement}
          </BaseCombobox.Status>
          <BaseCombobox.Portal container={portalContainer}>
            <BaseCombobox.Positioner
              sideOffset={() => popupSideOffset(fieldRef.current)}
              {...positionerRest}
              data-presentation={listPresentation}
              data-density={densityScope.density}
              style={{ ...comboboxPositionerStyle(popupShell), ...positionerStyle }}
              className={mergeSlotClass(comboboxPositionerClass(popupShell), positionerClassName)}
            >
              <BaseCombobox.Popup
                {...popupRest}
                ref={popupRef}
                data-slot="tags-input-popup"
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
                {/* シートの見出し（design/adr/0037）。打つ欄は欄に残る（欄にフォーカスとキーボードが残り、
                        候補だけがシートに出る）ので、シートの中に打つ欄は置かない */}
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
                        <ComboboxSheetClose
                          icon="check"
                          text="完了"
                          onClose={() => changeOpen(false)}
                        />
                      }
                    >
                      <SheetFieldTitle
                        label={label}
                        caption={caption}
                        captionId={sheetCaptionId}
                        messages={sheetMessages}
                      />
                    </SheetHeader>
                  </div>
                )}
                <ComboboxEmpty>{emptyText && !loading ? emptyText : null}</ComboboxEmpty>
                <ListboxScroll
                  presentation={listPresentation}
                  loadingRow={loadingRow}
                  viewportRef={listRef}
                  onScroll={sheet || popoverCue ? updateCues : undefined}
                  viewportClassName="has-data-empty:py-0"
                  before={
                    (long || popoverCue) && (
                      <SheetMoreCue edge="top" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                    )
                  }
                  after={
                    (long || popoverCue) && (
                      <SheetMoreCue edge="bottom" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                    )
                  }
                >
                  <BaseCombobox.List aria-describedby={sheet ? sheetListDescribedBy : messageIds}>
                    {grouped
                      ? (group: NormalizedListboxGroup, index: number) => (
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
                </ListboxScroll>
                {loadingRow && (
                  <ListboxLoadingRow
                    ref={loadingRowRef}
                    slot="tags-input-loading"
                    presentation={listPresentation}
                  >
                    {loadingText}
                  </ListboxLoadingRow>
                )}
              </BaseCombobox.Popup>
            </BaseCombobox.Positioner>
          </BaseCombobox.Portal>
        </>
      )}
    </BaseCombobox.Root>
  );
}

/**
 * 打った文字をタグにして並べる入力欄
 */
export function TagsInput(props: TagsInputProps) {
  const [field, control] = splitFieldProps(props);
  const feedback = useTagsFeedback();
  const error = field.error ?? feedback.invalidMessage;
  const rejectText = tagsRejectText(feedback.flash, control.rejectMessage);
  // 利用者がいつも info を渡している欄では、弾いた文が同じ行に入れ替わって入る。
  //   行は読み上げの箱（aria-live）なので、文をそのまま差し替えると、弾いた文と、戻ってきた元の info の両方が読まれる。
  //   そこで、読み上げに渡る中身（元の info）は見えない形で置いたままにし、見える文だけを差し替える。
  //   弾いた文の読み上げは、本体の見えない status の箱が担う（1 回だけ読まれる）
  const info =
    rejectText != null && Boolean(field.info) ? (
      <>
        <span className="sr-only">{field.info}</span>
        <span aria-hidden>{rejectText}</span>
      </>
    ) : (
      (rejectText ?? field.info)
    );
  return (
    <TagsFeedbackContext value={{ feedback, info: field.info }}>
      <Field {...field} error={error} info={info}>
        {() => <TagsInputControl {...control} />}
      </Field>
    </TagsFeedbackContext>
  );
}
