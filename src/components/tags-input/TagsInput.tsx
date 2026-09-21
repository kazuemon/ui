'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type ComboboxChipSize,
  comboboxChipStyle,
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
  type CaptionPlacement,
  Field,
  type FieldLoadingBehavior,
  FieldLoadingBar,
  FieldSpinner,
  FieldSuccessMark,
} from '../../internal/field/Field';
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import { useFormSubmittingLock } from '../../internal/form-context';
import { XIcon } from '../../internal/icons';
import { ComboboxOption } from '../../internal/listbox/ComboboxOption';
import { type ListboxColor, selectedTokens } from '../../internal/listbox/listbox-colors';
import { flattenItems, isGroupedItems, labelMap } from '../../internal/listbox/listbox-items';
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
import { FieldAddonButton } from '../field-addon/FieldAddon';
import type { LoadingIndicator } from '../loading/Loading';
import {
  commitTags,
  splitBySeparators,
  takeTags,
  type TagsInputRejectReason,
} from './tags-input-commit';
import type { TagsInputGroup, TagsInputItem, TagsInputItems } from './tags-input-items';
import { TagsInputChips } from './TagsInputChips';
import { useTagsFlash } from './use-tags-flash';

export type {
  TagsInputGroup,
  TagsInputItem,
  TagsInputItemNote,
  TagsInputItemNoteKind,
  TagsInputItems,
} from './tags-input-items';
export type { TagsInputRejectReason } from './tags-input-commit';

/** チップと、候補の印の色。primary・secondary は利用者が選ぶ色、neutral は色を持たない（グレー） */
export type TagsInputColor = ListboxColor;

/** まとまりの見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレー */
export type TagsInputGroupLabelStyle = GroupLabelStyle;

/** 候補の出し方。popover: 本体の下に浮かべる、sheet: 画面の下から出すシート、auto: 指で操作していて画面が狭いときはシート */
export type TagsInputPresentation = OverlayPresentation;

/** チップの高さ。compact は部品の高さより一段小さく、regular はそれより少し大きくする */
export type TagsInputChipSize = ComboboxChipSize;

/**
 * 打った文字と候補を突き合わせる関数。`Combobox.useFilter`（Base UI）の `contains` などを渡す
 * null を渡すと、部品の中では絞り込まず、渡された候補をそのまま出す（外で絞り込むとき）
 */
export type TagsInputFilter = (
  item: TagsInputItem,
  query: string,
  itemToString?: (item: TagsInputItem) => string
) => boolean;

const defaultSeparators = [','];
const defaultLoadedText = (count: number) => `${count} 件の候補`;
const defaultChipRemoveLabel = (label: string) => `${label} を外す`;
// 貼り付けでは、区切りの文字に加えて、改行とタブでも分ける
const pasteBreaks = ['\r\n', '\n', '\r', '\t'];

export interface TagsInputProps extends FieldMarkProps {
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下（design/adr/0041）
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする */
  error?: ReactNode;
  /**
   * 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない
   * error と両方あるときは、エラーの行の下に出す
   */
  warning?: ReactNode;
  /**
   * 成功の内容。本体の下に丸のチェックと緑の文字で出し、本体の端（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。error があるときは、欄の見た目はエラーを優先します
   */
  success?: ReactNode;
  /**
   * 成功のとき、本体の端にチェックを置くか。false では下の行だけを出します
   * @default true
   */
  successMark?: boolean;
  /** 情報の内容。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  info?: ReactNode;
  disabled?: boolean;
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
  color?: TagsInputColor;
  /** いまのタグ（制御するとき）。onValueChange と組にします */
  value?: string[];
  /** はじめのタグ（制御しないとき） */
  defaultValue?: string[];
  /** タグが変わったとき */
  onValueChange?: (value: string[]) => void;
  /** 打っている文字（制御するとき） */
  inputValue?: string;
  /** はじめの打っている文字（制御しないとき） */
  defaultInputValue?: string;
  /** 打っている文字が変わったとき。外で候補を引くときは、この文字で問い合わせます */
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
   * タグにしてよいかを確かめる関数。通らないときはエラーの文を返します（通るときは null）。
   * 通らなかった文字はチップにならず、返した文を本体の下のエラーの行に出します
   */
  validate?: (tag: string, tags: string[]) => ReactNode;
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
  /** タグにならなかったとき（重複・上限・validate）。弾かれた文字と理由を受け取ります */
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
   * 候補にない文字も、そのままタグになります
   */
  items?: TagsInputItems;
  /**
   * まとまりの見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレーです
   * @default 'label'
   */
  groupLabelStyle?: TagsInputGroupLabelStyle;
  /**
   * まとまりのあいだに区切り線を引くか
   * @default false
   */
  groupSeparator?: boolean;
  /**
   * 打った文字と候補を突き合わせる関数。書かないときは Base UI の既定（前後の空白を無視した部分一致）です。
   * null にすると部品の中では絞り込まず、`items`（または `filteredItems`）をそのまま出します
   */
  filter?: TagsInputFilter | null;
  /** 外で絞り込んだ候補。渡すと、部品の中の絞り込みの代わりにこれを出します */
  filteredItems?: TagsInputItems;
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
  clearLabel?: string;
  /**
   * チップの × の読み上げの名前を作る関数。何を外すのかが分かる文にします
   * @default (label) => `${label} を外す`
   */
  chipRemoveLabel?: (label: string) => string;
  /**
   * 欄に並ぶチップのまとまりの読み上げの名前
   * @default '追加したタグ'
   */
  chipsLabel?: string;
  /**
   * チップの最大幅（CSS の長さ。例: '120px'、'10rem'）。超えた文字は … で省略します。
   * 書かないときはチップを切らず、欄の幅いっぱいまで伸びます
   */
  chipMaxWidth?: string;
  /**
   * チップの高さ。compact は部品の高さより一段小さく、regular はそれより少し大きくします
   * @default 'compact'
   */
  chipSize?: TagsInputChipSize;
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
  /** 候補を開いているか。開閉を外から決めるときに使う */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか
   * @default false
   */
  modal?: boolean;
  /**
   * 浮かぶ候補を描く場所
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 画面の端に当たったとき、候補を反対側に出すか・ずらすか。既定は Base UI のまま（反対側に出す） */
  collisionAvoidance?: ComponentProps<typeof BaseCombobox.Positioner>['collisionAvoidance'];
  /**
   * 候補の出し方。auto は指で操作していて画面が狭いときだけシートにします。popover はいつも浮かべ、
   * sheet はいつもシートにします。打つ欄は欄に残り、候補だけがシートに出ます（design/adr/0037）
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: TagsInputPresentation;
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
  /** フォームに送るときの名前。タグの数だけ、同じ名前で送られます */
  name?: string;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  className?: string;
}

/**
 * 打った文字をタグにして並べる入力欄
 */
export function TagsInput({
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
  value: valueProp,
  defaultValue,
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue,
  onInputValueChange,
  separators = defaultSeparators,
  allowDuplicates = false,
  max,
  validate,
  commitOnBlur = true,
  enterKeyHint = 'enter',
  onReject,
  rejectMessage,
  placeholder,
  items,
  groupLabelStyle = 'label',
  groupSeparator = false,
  filter,
  filteredItems,
  autoHighlight = false,
  openOnInputClick = false,
  clearable = true,
  clearLabel = 'タグをすべて消去',
  chipRemoveLabel = defaultChipRemoveLabel,
  chipsLabel = '追加したタグ',
  chipMaxWidth,
  chipSize = 'compact',
  maxRows,
  emptyText,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = false,
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
  name,
  form,
  required,
  requiredMark,
  optionalMark,
  className,
}: TagsInputProps) {
  // 読み込んでいるあいだ（design/adr/0042）。blocking は開けず、タグも変えられない
  const loadingBlocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !loadingBlocking;
  // Form の送信中も、同じく開けず変えられない
  const formLock = useFormSubmittingLock();
  const blocking = loadingBlocking || formLock.blocking;
  // 読み取り専用（ADR-0170）: 文字を打つ欄の読み取り専用と同じ見た目にし、候補は開かない
  const locked = blocking || !!readOnly;
  const portalContainer = usePortalContainer(container);
  // 候補を渡さないときは、浮かぶ部分をいっさい描かない（打った文字だけがタグになる）
  const hasItems = items !== undefined;

  // 値は部品の中でも持てる（制御しないとき）
  const [valueState, setValueState] = useState<string[]>(() => defaultValue ?? []);
  const values = valueProp ?? valueState;
  const setValues = (next: string[]) => {
    if (valueProp === undefined) setValueState(next);
    onValueChange?.(next);
  };
  const [textState, setTextState] = useState(() => defaultInputValue ?? '');
  const text = inputValueProp ?? textState;
  const setText = (next: string) => {
    if (inputValueProp === undefined) setTextState(next);
    onInputValueChange?.(next);
  };

  // validate を通らなかったときの文。次に足せたときと、打ち直したときに消す
  const [invalidMessage, setInvalidMessage] = useState<ReactNode>(null);
  // 弾いたことの一瞬の合図（軸 261）。欄の計算済みの値から、見せる長さを読む
  const controlRef = useRef<HTMLDivElement | null>(null);
  const { flash, fire } = useTagsFlash(controlRef);
  // IME の変換中（変換中の Enter と区切りの文字では確定しない）
  const composing = useRef(false);
  // 候補に印が付いているか（Enter を候補に渡すか、打った文字をタグにするかの分かれ目）
  const highlighted = useRef<string | undefined>(undefined);

  /** タグの候補を足す。弾かれたものは合図と、validate の文で見せる */
  const addTags = (candidates: string[]) => {
    const result = commitTags(values, candidates, { allowDuplicates, max, validate });
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
    // validate を通らなかった文字は、直せるように欄へ残す（エラーの行もそのあいだ出したままにする）
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

  // 候補を選んだとき・チップを外したとき・消去したとき。足すものは重複・上限・validate を通す
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

  // Base UI には、候補から値とラベルを引く collection を渡す
  const collection = useMemo(
    () =>
      items
        ? BaseCombobox.createItems<TagsInputItem, string>(items, {
            getValue: (item) => item.value,
            getLabel: (item) => item.label,
          })
        : undefined,
    [items]
  );
  const flat = useMemo(() => (items ? flattenItems(items) : []), [items]);
  const labelOf = useMemo(() => labelMap(flat), [flat]);

  // シートの見出しに出す欄の文（design/adr/0044）。本体の下の行と同じ
  const sheetId = useId();
  const sheetCaptionId = `${sheetId}caption`;
  const shownError = error ?? invalidMessage;
  // 弾いたことを、本体の下の行でも一瞬だけ知らせる。文は呼び出し側が書く（原則20）
  const rejected = flash && rejectMessage ? rejectMessage(flash.reason, flash.tag) : null;
  const rejectText = rejected === false ? null : rejected;
  // 利用者がいつも info を渡している欄では、弾いた文が同じ行に入れ替わって入る。
  //   行は読み上げの箱（aria-live）なので、文をそのまま差し替えると、弾いた文と、戻ってきた元の info の両方が読まれる。
  //   そこで、読み上げに渡る中身（元の info）は見えない形で置いたままにし、見える文だけを差し替える。
  //   弾いた文の読み上げは、下の見えない status の箱が担う（1 回だけ読まれる）
  const infoConflict = rejectText != null && Boolean(info);
  const shownInfo = infoConflict ? (
    <>
      <span className="sr-only">{info}</span>
      <span aria-hidden>{rejectText}</span>
    </>
  ) : (
    (rejectText ?? info)
  );
  // 見えている行が読み上げないとき（元の info と入れ替わるとき）だけ、見えない箱で知らせる
  const announceReject = Boolean(rejectMessage) && Boolean(info);
  const sheetMessages: SheetMessage[] = [];
  if (shownError) sheetMessages.push({ kind: 'error', content: shownError, id: `${sheetId}error` });
  if (warning) sheetMessages.push({ kind: 'warning', content: warning, id: `${sheetId}warning` });

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

  const chipStyle = comboboxChipStyle(chipMaxWidth, chipSize);
  // 行数の上限（maxRows）。欄に置いた変数を、チップを並べる枠（TagsInputChips）が読む
  //   2 行以上: その行数の高さで止めて縦にスクロールする。1 行分の高さはチップの高さ（ADR-0217。regular は一段大きい）
  //   1 行: 折り返さず、横にスクロールする（1 行で折り返すと、1 つ足すたびに見える中身が入れ替わる）
  const rowsStyle = useMemo<CSSProperties | undefined>(() => {
    if (maxRows === undefined) return undefined;
    if (maxRows <= 1) {
      return {
        '--tags-input-wrap': 'nowrap',
        '--tags-input-chip-shrink': '0',
        '--tags-input-content-min-width': 'max-content',
      } as CSSProperties;
    }
    const rowHeight =
      chipSize === 'regular'
        ? 'calc(var(--spacing-control) - var(--spacing) * 2)'
        : 'var(--combobox-chip-height)';
    return {
      // 行の高さ × 行数 ＋ 行のあいだの間 ＋ 枠の上下の余白
      '--tags-input-max-height': `calc(${maxRows} * (${rowHeight} + var(--spacing)) + var(--spacing))`,
    } as CSSProperties;
  }, [maxRows, chipSize]);
  const selected = selectedTokens(color);
  const grouped = isGroupedItems(filteredItems ?? items ?? []);
  const inputClass = comboboxInputClass({ blocking, readOnly });

  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={shownError}
      warning={warning}
      success={success}
      info={shownInfo}
      disabled={disabled}
      loading={loading}
      loadingBehavior={loadingBehavior}
      required={required}
      requiredMark={requiredMark}
      optionalMark={optionalMark}
      className={className}
    >
      {(messageIds) => (
        <BaseCombobox.Root<string, true, TagsInputItem>
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
          filteredItems={filteredItems}
          autoHighlight={autoHighlight}
          openOnInputClick={openOnInputClick && hasItems}
          disabled={disabled}
          readOnly={locked || undefined}
          required={required}
          name={name}
          form={form}
          modal={modal}
          open={open}
          onOpenChange={(next) => changeOpen(next)}
          onOpenChangeComplete={(next) => {
            if (!next) drag.clearDragHeight();
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
              chipsLabel={chipsLabel}
              chipRemoveLabel={chipRemoveLabel}
              color={color}
              readOnly={readOnly}
              disabled={disabled || blocking}
              chipStyle={chipStyle}
              flashTag={flash?.reason === 'duplicate' ? flash.tag : undefined}
            >
              {(chips) => (
                <BaseCombobox.Input
                  aria-describedby={messageIds}
                  aria-disabled={blocking || undefined}
                  aria-busy={loading || undefined}
                  // ソフトウェアキーボードの実行キー。既定では Enter を送るキーにする（enterKeyHint）
                  enterKeyHint={enterKeyHint}
                  placeholder={loadingBlocking ? loadingText : chips.length > 0 ? '' : placeholder}
                  onCompositionStart={() => {
                    composing.current = true;
                  }}
                  onCompositionEnd={(event) => {
                    composing.current = false;
                    // 変換が終わった文字にも区切りが混ざりうる（「、」を区切りにしたときなど）
                    changeText(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
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
                  className={`${inputClass} h-(--combobox-chip-height) min-w-16`}
                />
              )}
            </TagsInputChips>
            {loading && loadingIndicator === 'spinner' && (
              <FieldSpinner className={loadingBlocking ? controlInsetEnd : 'me-2'} />
            )}
            {success && successMark && !shownError && !loading && (
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
                aria-label={clearLabel}
              />
            )}
            {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
          </BaseCombobox.InputGroup>
          {/* 弾いたことの読み上げ。ふだんは本体の下の行がすでに読み上げの箱なので置かない（二重に読ませない — 原則15）。
              利用者が info を渡していて、同じ行の文が入れ替わるときだけ、行の代わりにこの箱が知らせる
              文が出ていないあいだも箱は残す（あとから現れる箱は読まれないため — ADR-0055） */}
          {announceReject && (
            <div role="status" data-slot="tags-input-reject-status" className="sr-only">
              {rejectText}
            </div>
          )}
          {hasItems && (
            <>
              <BaseCombobox.Status data-slot="tags-input-status" className="sr-only">
                {announcement}
              </BaseCombobox.Status>
              <BaseCombobox.Portal container={portalContainer}>
                <BaseCombobox.Positioner
                  collisionAvoidance={collisionAvoidance}
                  sideOffset={() => popupSideOffset(fieldRef.current)}
                  data-presentation={listPresentation}
                  data-density={densityScope.density}
                  style={comboboxPositionerStyle(popupShell)}
                  className={comboboxPositionerClass(popupShell)}
                >
                  <BaseCombobox.Popup
                    ref={sheet ? measure : popoverCue || popoverFit ? observeCues : undefined}
                    data-slot="tags-input-popup"
                    data-dragging={drag.dragging || undefined}
                    style={comboboxPopupStyle({
                      selected,
                      sheet,
                      sheetDetent,
                      dragHeight: drag.sheetHeight,
                    })}
                    className={listboxPopup({ presentation: listPresentation })}
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
                    {(long || popoverCue) && (
                      <SheetMoreCue edge="top" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                    )}
                    <BaseCombobox.List
                      ref={listRef}
                      aria-describedby={
                        sheet
                          ? [
                              caption && sheetCaptionId,
                              ...sheetMessages.map((message) => message.id),
                            ]
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
                        ? (group: TagsInputGroup, index: number) => (
                            <ComboboxGroupSection
                              key={index}
                              group={group}
                              separator={groupSeparator && index > 0}
                              labelStyle={groupLabelStyle}
                            >
                              {(item) => <ComboboxOption key={item.value} item={item} />}
                            </ComboboxGroupSection>
                          )
                        : (item: TagsInputItem) => <ComboboxOption key={item.value} item={item} />}
                    </BaseCombobox.List>
                    {(long || popoverCue) && (
                      <SheetMoreCue edge="bottom" sheet={sheet} sheetMoreCue={sheetMoreCue} />
                    )}
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
      )}
    </Field>
  );
}
