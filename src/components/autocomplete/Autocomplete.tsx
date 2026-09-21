'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import { type ComponentProps, type ReactNode, useId, useMemo, useRef, useState } from 'react';

import {
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
} from '../../internal/field/Field';
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import { useFormSubmittingLock } from '../../internal/form-context';
import { XIcon } from '../../internal/icons';
import { ComboboxOption } from '../../internal/listbox/ComboboxOption';
import { type ListboxColor, selectedTokens } from '../../internal/listbox/listbox-colors';
import { flattenItems, isGroupedItems } from '../../internal/listbox/listbox-items';
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
import type { AutocompleteGroup, AutocompleteItem, AutocompleteItems } from './autocomplete-items';
import { AutocompleteScroll } from './AutocompleteScroll';

export type {
  AutocompleteGroup,
  AutocompleteItem,
  AutocompleteItemNote,
  AutocompleteItemNoteKind,
  AutocompleteItems,
} from './autocomplete-items';

/** 候補にあてた印の色。primary・secondary は利用者が選ぶ色、neutral は色を持たない（グレー） */
export type AutocompleteColor = ListboxColor;

/** まとまりの見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレー */
export type AutocompleteGroupLabelStyle = GroupLabelStyle;

/** 候補の出し方。popover: 本体の下に浮かべる、sheet: 画面の下から出すシート、auto: 指で操作していて画面が狭いときはシート */
export type AutocompletePresentation = OverlayPresentation;

/**
 * シートのときの、打つ欄の置き場所
 * field: 欄に残す（欄にフォーカスとキーボードが残り、候補だけがシートに出る）
 * inside: シートの中に移す（欄はボタンになり、シートの見出しの下に打つ欄が出る）
 */
export type AutocompleteSheetInput = 'field' | 'inside';

/**
 * 候補を開く契機
 * input: 文字を打ったあと（空にすると閉じる）。↓ キーでも開く
 * focus: 欄にフォーカスが入ったとき。空でも候補を出す
 * click: 欄を押したとき。空でも候補を出す
 */
export type AutocompleteOpenOn = 'input' | 'focus' | 'click';

/** onSelect が受け取る、候補を選んだときのイベント */
export interface AutocompleteSelectEvent {
  /**
   * 呼ぶと、選んだ文字を欄に入れず、候補も閉じません（欄は打っていた文字のまま）。
   * 候補を押して別の画面へ移すときなど、欄の文字を候補の文字に置き換えたくないときに使います
   */
  preventDefault: () => void;
  readonly defaultPrevented: boolean;
}

/**
 * 打った文字と候補を突き合わせる関数。true を返した候補を出す
 * 3 つ目の引数 `itemToString` は候補の文字（`label`）を返す。`Autocomplete.useFilter`（Base UI）の `contains` なども渡せる
 */
export type AutocompleteFilter = (
  item: AutocompleteItem,
  query: string,
  itemToString?: (item: AutocompleteItem) => string
) => boolean;

export interface AutocompleteProps extends FieldMarkProps {
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下
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
   * 成功の内容。本体の下に丸のチェックと緑の文字で出し、欄の端（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。error があるときは、欄の見た目はエラーを優先します
   */
  success?: ReactNode;
  /**
   * 成功のとき、欄の端にチェックを置くか。false では下の行だけを出します
   * @default true
   */
  successMark?: boolean;
  /** 情報の内容。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  info?: ReactNode;
  disabled?: boolean;
  /**
   * 読み取り専用にします。見た目は文字を打つ欄の読み取り専用と同じで、塗りを持たず、細い破線の輪郭と
   * 一段淡い値の文字になります。フォーカスでき、文字をなぞって写せます。
   * 打っても候補は開かず、文字も変わりません。消去のボタンも出しません。フォームでは文字が送られます
   * @default false
   */
  readOnly?: boolean;
  /**
   * 候補に印をあてるときの色（hover とキーボードの選択は、色を指定していても入力欄と同じグレーです）
   * 利用者が選ぶ primary・secondary に加え、色を持たない neutral（グレー）を選べます
   * @default 'neutral'
   */
  color?: AutocompleteColor;
  /**
   * 欄の頭に置く印（アイコンなど）。書かないときは何も置かず、飾りのない文字入力欄（TextField と同じ）です。
   * 虫眼鏡のような検索の印は、ここに渡します（例: `<Icon icon={MagnifyingGlassIcon} />`）。
   * 印は押せません。押せるものは置かないでください（グレー地の塊が押せるものの印のため）
   */
  icon?: ReactNode;
  /**
   * 候補。`AutocompleteItem[]`（そのまま並べる）か `AutocompleteGroup[]`（`label` と `items` のまとまり）で渡します。
   * 各候補に disabled（選べない）と note（ラベルの下の2行目）を付けられます。
   * 候補は提案です。候補にない文字も、そのまま打てます
   */
  items: AutocompleteItems;
  /**
   * 欄が空のときに出す候補（最近の検索など）。`items` と同じ形で、見出し付きのまとまりで渡すのが向きます。
   * 渡すと、欄が空のあいだは `items` の代わりにこれを出し、文字を打つと `items` の絞り込みに切り替わります。
   * 空でも開けるよう、`openOn` が `'input'` のときは `'focus'` として扱います（`'click'` はそのまま）。
   * 書かないときは、空のあいだは何も出しません
   */
  emptyItems?: AutocompleteItems;
  /**
   * まとまりの見出しの文字。label は入力欄のラベルと同じ太字、caption はキャプションと同じ小さいグレーです
   * @default 'label'
   */
  groupLabelStyle?: AutocompleteGroupLabelStyle;
  /**
   * まとまりのあいだに区切り線を引くか
   * @default false
   */
  groupSeparator?: boolean;
  /**
   * 空の欄に出す見本の文字。打った文字と見分けられるよう、「地名を打って探す」のように、
   * まだ打っていないと分かる書き方にします
   */
  placeholder?: string;
  /** 打った文字（制御するとき）。onValueChange と組にする。値は入力した文字列で、選んだ候補の文字も入る */
  value?: string;
  /** はじめの文字（制御しないとき） */
  defaultValue?: string;
  /** 文字が変わったとき。打ったときのほか、候補を選んで欄に入れたとき・消去のボタンで消したときも呼びます */
  onValueChange?: (value: string) => void;
  /**
   * 候補を選んだとき（押す・Enter）。選んだ候補を受け取ります。
   * 既定では、候補の文字を欄に入れて候補を閉じます。`event.preventDefault()` を呼ぶと、欄も候補もそのままにします
   * `onValueChange` は preventDefault を呼んだときは呼びません
   */
  onSelect?: (item: AutocompleteItem, event: AutocompleteSelectEvent) => void;
  /**
   * 候補を選んだあとに候補を閉じるか。false では、選んだ文字を欄に入れたまま候補を開いておきます
   * @default true
   */
  closeOnSelect?: boolean;
  /**
   * 候補を開く契機。input は文字を打ったあと（空にすると閉じる）、focus は欄にフォーカスが入ったとき、
   * click は欄を押したときで、focus と click は空でも候補を出します。どれでも ↓ キーで開きます
   * @default 'input'
   */
  openOn?: AutocompleteOpenOn;
  /**
   * 打った文字で候補を絞り込むか。
   * true（既定）は Base UI の既定（前後の空白を無視した部分一致）で絞り込みます。
   * 関数を渡すと、その条件で絞り込みます（例: 読み仮名でも当てる）。
   * false は部品の中では絞り込まず、`items` をそのまま出します。検索の API に問い合わせて `items` を差し替えるときに使います
   * @default true
   */
  filter?: boolean | AutocompleteFilter;
  /**
   * 矢印キーで印を移した候補の文字を、欄に仮に入れる（入力を候補に補正する）か。
   * 印を移すと欄の文字がその候補に変わり、Esc で打った文字に戻ります。Enter で確定します
   * @default false
   */
  completeInput?: boolean;
  /**
   * 打ち始めたときに、最初に当たった候補へ自動で印を移すか。true では Enter でその候補を選びます
   * @default false
   */
  autoHighlight?: boolean;
  /**
   * ソフトウェアキーボードの実行キーの見た目と働き。既定の `'enter'` は、キーを改行の形にして Enter を送ります。
   * 同じ画面に入力欄が並んでいると、書かないときのキーは「次へ」になり、印を移した候補を選べずに次の欄へ移ってしまいます。
   * 最後の欄で送信まで進めたいときなど、別の働きにしたいときだけ書き換えます
   * @default 'enter'
   */
  enterKeyHint?: ComponentProps<'input'>['enterKeyHint'];
  /**
   * 文字を消すボタン（×）を欄の端に出すか。文字があるあいだだけ出し、読み取り専用の欄では出しません
   * @default true
   */
  clearable?: boolean;
  /**
   * 消すボタンの読み上げの名前
   * @default '入力内容を消去'
   */
  clearLabel?: string;
  /**
   * 当たる候補がないときに出すもの（文字でも、リンクを含む要素でも渡せます）。
   * 書かないときは、当たる候補がなければ候補の面そのものを出しません
   */
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
   * 本体の祖先に付いた data-density と coarse-large は、描く場所がその外でも、浮かぶ候補に写します
   * @default document.body
   */
  container?: HTMLElement | null;
  /** 画面の端に当たったとき、候補を反対側に出すか・ずらすか。既定は Base UI のまま（反対側に出す） */
  collisionAvoidance?: ComponentProps<typeof BaseAutocomplete.Positioner>['collisionAvoidance'];
  /**
   * 候補の出し方。auto は指で操作していて画面が狭いときだけシートにします。popover はいつも浮かべ、
   * sheet はいつもシートにします。書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: AutocompletePresentation;
  /**
   * シートのときの、打つ欄の置き場所。打って絞り込むので、シートとソフトウェアキーボードが同時に出ます
   * field: 欄に残します。欄にフォーカスとキーボードが残り、候補だけがシートに出ます。シートは、キーボードに隠れない高さに収めます
   * inside: シートの中に移します。欄は押すと開くボタンになり、シートの見出しの下に打つ欄が出ます
   * @default 'inside'
   */
  sheetInput?: AutocompleteSheetInput;
  /**
   * シートの中に打つ欄を移したとき（sheetInput="inside"）、開いた瞬間に打つ欄へフォーカスを当てるか。
   * true では、開くとすぐソフトウェアキーボードが出て、その上に候補が見えます。false では、シートの面にフォーカスが残り、
   * 打つ欄を押すまでキーボードは出ません
   * @default true
   */
  sheetAutoFocus?: boolean;
  /**
   * シートの見出しの閉じるボタンのアイコン。check は ✓、x は ×、chevron は下向きの矢印です。
   * null はアイコンを出さず、文字だけにします（sheetCloseText も null のときは × を出します）
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
   * シートを開いたときの高さ。half は候補が長いときに半分の高さで開き、つまみを出します。full は高さいっぱいで開きます
   * 打つ欄をシートの中に置くとき（sheetInput="inside"）の既定は full、欄に残すとき（"field"）の既定は half です
   * @default 'full'（sheetInput="inside"）、'half'（sheetInput="field"）
   */
  sheetDetent?: SheetDetent;
  /**
   * シートで、候補の上下に続きがあることの見せ方。下の端はどれも内側の影です。上の端は、shadow は内側の影、
   * divider は区切り線（スクロールすると出る）、divider-always はいつも出す区切り線、
   * divider-shadow・divider-always-shadow は区切り線と内側の影の組み合わせです
   * @default 'divider-always-shadow'
   */
  sheetMoreCue?: SheetMoreCueKind;
  /**
   * 浮かぶ候補の高さの上限
   * none: 画面の端まで伸ばす。screen: 画面の高さの半分で、最後の項目を半分見せる
   * @default 'screen'
   */
  popoverMaxHeight?: 'none' | 'screen';
  /**
   * 候補を読み込んでいる。印を出し、本体に aria-busy を付ける
   * 読み込んでいるあいだに開くと、読み上げで loadingText を知らせ、開いたまま読み込みが終わると loadedText を知らせる
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込んでいるあいだの欄の扱い
   * non-blocking: 止めない。打てるままで、開くと候補の最後に loadingText の行を出す。回る円は欄の端
   * blocking: 止める。押せない欄と同じ見た目にし、プレースホルダの場所に loadingText を出す。開けない
   * @default 'non-blocking'
   */
  loadingBehavior?: FieldLoadingBehavior;
  /**
   * 読み込んでいるあいだの印。spinner は回る円、bar は下端に流れる線です
   * @default 'spinner'
   */
  loadingIndicator?: LoadingIndicator;
  /**
   * 読み込んでいるあいだの文。blocking ではプレースホルダの場所に、non-blocking では開いた候補の行に出す
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /**
   * 読み込みが終わったときに、読み上げで知らせる文です。候補の数を受け取って返します
   * @default (count) => `${count} 件の候補`
   */
  loadedText?: (count: number) => string;
  /** フォームに送るときの名前。送るのは欄の文字です */
  name?: string;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  className?: string;
}

const defaultLoadedText = (count: number) => `${count} 件の候補`;

/**
 * 文字を打つと、候補を提案してくれる入力欄
 * 値は打った文字そのもので、候補にない文字も打てます。候補を選ぶと、その文字が欄に入ります
 */
export function Autocomplete({
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
  icon,
  emptyItems,
  items,
  groupLabelStyle = 'label',
  groupSeparator = false,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  onSelect,
  closeOnSelect = true,
  openOn = 'input',
  filter = true,
  completeInput = false,
  autoHighlight = false,
  clearable = true,
  clearLabel = '入力内容を消去',
  enterKeyHint = 'enter',
  emptyText,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  container,
  collisionAvoidance,
  presentation,
  sheetInput = 'inside',
  sheetAutoFocus = true,
  sheetCloseIcon = 'check',
  sheetCloseText = '完了',
  sheetDetent: sheetDetentProp,
  sheetMoreCue = 'divider-always-shadow',
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
}: AutocompleteProps) {
  // 読み込んでいるあいだ。blocking は開けず、文字も変えられない
  const loadingBlocking = loading && loadingBehavior === 'blocking';
  const loadingRow = loading && !loadingBlocking;
  // Form の送信中も、同じく開けず文字も変えられない（見た目は Field の data-loading="blocking"）
  const formLock = useFormSubmittingLock();
  const blocking = loadingBlocking || formLock.blocking;
  // 読み取り専用: 文字を打つ欄の読み取り専用と同じ見た目にし、候補は開かない
  const locked = blocking || !!readOnly;
  const portalContainer = usePortalContainer(container);

  // 候補の出し方。指で操作していて画面が狭いときはシート
  const sheet = useSheetPresentation(presentation);
  // シートの中に打つ欄を移すか（sheetInput="inside"）。欄は押すと開くボタンになる
  const inputInSheet = sheet && sheetInput === 'inside';
  const sheetDetent: SheetDetent = sheetDetentProp ?? (sheetInput === 'inside' ? 'full' : 'half');
  // シートの見出しに出す欄の文。本体の下の行と同じ。両方渡したときはエラー → 警告の順
  const sheetId = useId();
  const sheetCaptionId = `${sheetId}caption`;
  const sheetMessages: SheetMessage[] = [];
  if (error) sheetMessages.push({ kind: 'error', content: error, id: `${sheetId}error` });
  if (warning) sheetMessages.push({ kind: 'warning', content: warning, id: `${sheetId}warning` });

  // 開閉は部品の中でも持つ（止めているあいだ開かせないため・フォーカスで開くため・シートの × とつまみで閉じるため）
  const [openState, setOpenState] = useState(defaultOpen);
  const open = locked ? false : (openProp ?? openState);
  // 開く前のスクロール位置。キーボードの出入りでブラウザがページをずらすので、閉じたあとに元へ戻す（sheetAutoFocus）
  const restoreScroll = useScrollRestore();
  const changeOpen = (next: boolean) => {
    if (next && locked) return;
    if (next) drag.reset();
    if (inputInSheet && sheetAutoFocus) restoreScroll(next);
    setOpenState(next);
    onOpenChange?.(next);
  };

  // 打った文字（制御しないときも、消去のボタンを出すために持つ）
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const text = value ?? innerValue;

  // 候補から選ぶとき、どの候補かを onSelect に渡す。押した候補（onPress）を覚えておき、Base UI の値の変更で使う
  const flat = useMemo(
    () => [...flattenItems(items), ...(emptyItems ? flattenItems(emptyItems) : [])],
    [items, emptyItems]
  );
  // 欄が空のあいだは emptyItems を出す。空でも開けるよう、開く契機の input は focus として扱う
  const shownItems = emptyItems && text === '' ? emptyItems : items;
  const effectiveOpenOn: AutocompleteOpenOn = emptyItems && openOn === 'input' ? 'focus' : openOn;
  // 絞り込み・補正の組み合わせを Base UI の mode に写す
  const filtering = filter !== false;
  const mode = completeInput ? (filtering ? 'both' : 'inline') : filtering ? 'list' : 'none';
  const pressedRef = useRef<AutocompleteItem | null>(null);
  // 選んだ操作が preventDefault された（欄も開閉も動かさない）ことを、続く開閉の通知に伝える
  const preventedRef = useRef(false);

  // 選択肢の一覧の見た目（src/internal/listbox）に渡す出し方
  const listPresentation: ListboxPresentation = sheet ? 'sheet' : 'popover';
  // 浮かぶ候補の寸法（高さの上限・続きの印）
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

  // 候補が長いときだけ、半分の高さで開いてつまみを出す
  const long = sheet && sheetDetent === 'half' && !!metrics && metrics.content > metrics.half + 1;
  const drag = useSheetDrag({ sheetDetent, metrics, long, onClose: () => changeOpen(false) });

  // 読み込みの知らせ。閉じていても消えない status の箱（Autocomplete.Status）の中身を入れ替える
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
  const setFieldElement = (el: HTMLElement | null) => {
    fieldRef.current = el;
  };
  // ソフトウェアキーボードを開く操作の中で出すための、見えない打つ欄（sheetAutoFocus）
  const keyboardProxy = useKeyboardProxy(sheetAutoFocus);
  // 浮かぶ候補とシートの外枠（src/internal/combobox-base）
  const popupShell = { sheet, densityScope, keyboardInset, keyboardShrink, sheetDetent };

  const selected = selectedTokens(color);
  const grouped = isGroupedItems(shownItems);

  const change = (next: string) => {
    if (value === undefined) setInnerValue(next);
    onValueChange?.(next);
  };

  const renderSheetClose = () => (
    <ComboboxSheetClose
      icon={sheetCloseIcon}
      text={sheetCloseText}
      onClose={() => changeOpen(false)}
    />
  );

  const renderClear = () =>
    clearable && !readOnly ? (
      <BaseAutocomplete.Clear
        tabIndex={0}
        render={
          <FieldAddonButton>
            <XIcon standalone />
          </FieldAddonButton>
        }
        disabled={blocking || disabled || undefined}
        data-slot="autocomplete-clear"
        aria-label={clearLabel}
      />
    ) : null;

  const inputClass = comboboxInputClass({ blocking, readOnly });

  // 欄の中身（打つ欄・端のボタン）。シートの中に打つ欄を移すとき（sheetInput="inside"）は、同じものをシートの見出しの下に置く
  const renderControl = (place: 'field' | 'sheet', messageIds: string | undefined) => {
    const inSheet = place === 'sheet';
    return (
      <BaseAutocomplete.InputGroup
        ref={inSheet ? undefined : setFieldElement}
        data-slot={inSheet ? 'autocomplete-sheet-input' : 'control'}
        data-field-readonly={readOnly || undefined}
        className={comboboxControl({ color, loading, className: ['group/cbx gap-0 px-0'] })}
      >
        {icon && (
          // 欄の頭の印。押せないので塗りのない印（SearchField の虫眼鏡と同じ）
          <span
            aria-hidden
            data-slot="field-addon"
            className="flex shrink-0 items-center ps-[calc(var(--spacing-control-x)-var(--field-border-width))] text-fg-muted group-data-disabled/field:text-(color:--color-on-field-disabled)"
          >
            {icon}
          </span>
        )}
        <BaseAutocomplete.Input
          enterKeyHint={enterKeyHint}
          aria-describedby={messageIds}
          aria-disabled={blocking || undefined}
          aria-busy={loading || undefined}
          placeholder={loadingBlocking ? loadingText : placeholder}
          // フォーカスで開く契機。シートの中の打つ欄は、すでに開いているので何もしない
          onFocus={() => {
            if (effectiveOpenOn === 'focus' && !inSheet && !open) changeOpen(true);
          }}
          onKeyDown={(event) => {
            // Esc は、開いていれば閉じるだけで、打った文字は消さない。閉じていれば何もしない（外の Esc に任せる）
            if (event.key === 'Escape' && !open) event.preventBaseUIHandler();
          }}
          className={`${inputClass} h-full ${icon ? 'ps-(--search-field-icon-gap) pe-(--spacing-control-x)' : controlInset}`}
        />
        {/* 待っているあいだの印。回る円は端のボタンの左、線は本体の下端 */}
        {loading && loadingIndicator === 'spinner' && (
          <FieldSpinner className={loadingBlocking ? controlInsetEnd : 'me-2'} />
        )}
        {/* 成功のチェック。回る円と同じ場所 */}
        {success && successMark && !error && !loading && <FieldSuccessMark className="me-2" />}
        {renderClear()}
        {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
      </BaseAutocomplete.InputGroup>
    );
  };

  // シートの中に打つ欄を移したとき（sheetInput="inside"）の本体。押すと開くボタンで、いまの文字を出す
  const renderTrigger = (messageIds: string | undefined) => (
    <>
      <BaseAutocomplete.Trigger
        ref={setFieldElement}
        onClick={
          sheetAutoFocus ? (event) => keyboardProxy.focusProxy(event.currentTarget) : undefined
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
            blocking ? 'cursor-progress' : readOnly ? 'cursor-default' : 'cursor-pointer',
          ],
        })}
      >
        {icon && (
          <span aria-hidden className="flex shrink-0 text-fg-muted">
            {icon}
          </span>
        )}
        {text ? (
          <span className="min-w-0 flex-1 truncate">{text}</span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-(color:--field-placeholder)">
            {loadingBlocking ? loadingText : placeholder}
          </span>
        )}
        {loading && loadingIndicator === 'spinner' && (
          <FieldSpinner className={loadingBlocking ? undefined : 'me-2'} />
        )}
        {success && successMark && !error && !loading && <FieldSuccessMark className="me-2" />}
        {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
      </BaseAutocomplete.Trigger>
      {keyboardProxy.proxy}
    </>
  );

  // 候補の1項目。選んだ状態を持たないので、選んだ印（チェック）は置かない
  // Base UI に渡す値は候補そのもので、押した候補を覚えて onSelect に渡す
  const renderOption = (item: AutocompleteItem) => (
    <ComboboxOption
      key={item.value}
      item={item}
      value={item}
      indicator={false}
      onPress={(pressed) => {
        pressedRef.current = pressed;
      }}
    />
  );

  // 候補の一覧（Base UI の List）。浮かべるときは、スクロールと余白を包む枠（AutocompleteScroll）の中に置く
  const renderList = (messageIds: string | undefined) => (
    <BaseAutocomplete.List
      ref={sheet ? listRef : undefined}
      aria-describedby={
        sheet
          ? [caption && sheetCaptionId, ...sheetMessages.map((message) => message.id)]
              .filter(Boolean)
              .join(' ') || undefined
          : messageIds
      }
      onScroll={sheet ? updateCues : undefined}
      className={
        sheet
          ? listboxList({ presentation: 'sheet', loadingRow, className: 'data-empty:py-0' })
          : 'block'
      }
    >
      {grouped
        ? (group: AutocompleteGroup, index: number) => (
            <ComboboxGroupSection
              key={index}
              group={group}
              separator={groupSeparator && index > 0}
              labelStyle={groupLabelStyle}
            >
              {(item) => renderOption(item)}
            </ComboboxGroupSection>
          )
        : (item: AutocompleteItem) => renderOption(item)}
    </BaseAutocomplete.List>
  );

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
      // シートの中に打つ欄を移したときの本体はボタンなので、ラベルは <label> にしない
      nativeLabel={!inputInSheet}
    >
      {(messageIds) => (
        <BaseAutocomplete.Root<AutocompleteItem>
          // 候補の形（並べるか・まとまりか）は、渡された配列から Base UI が見分ける
          items={shownItems as readonly AutocompleteItem[]}
          // 文字は部品が持ち、Base UI には制御して渡す。選んだ操作を preventDefault したときに、欄の文字を動かさないため
          value={text}
          onValueChange={(next, details) => {
            // 候補を選んだとき（押す・Enter）は onSelect に知らせる。preventDefault されたら、欄も開閉も動かさない
            if (details.reason === 'item-press') {
              const item = pressedRef.current ?? flat.find((candidate) => candidate.label === next);
              pressedRef.current = null;
              preventedRef.current = false;
              if (item && onSelect) {
                let prevented = false;
                onSelect(item, {
                  preventDefault: () => {
                    prevented = true;
                  },
                  get defaultPrevented() {
                    return prevented;
                  },
                });
                if (prevented) {
                  preventedRef.current = true;
                  details.cancel();
                  return;
                }
              }
            }
            change(next);
          }}
          mode={mode}
          filter={typeof filter === 'function' ? filter : undefined}
          autoHighlight={autoHighlight}
          openOnInputClick={effectiveOpenOn === 'click' || effectiveOpenOn === 'focus'}
          disabled={disabled}
          readOnly={locked || undefined}
          required={required}
          name={name}
          form={form}
          modal={modal}
          open={open}
          onOpenChange={(next, details) => {
            // 候補を選んだあとは、preventDefault されたときと、closeOnSelect が false のときは閉じない
            if (!next && details.reason === 'item-press') {
              if (preventedRef.current || !closeOnSelect) {
                preventedRef.current = false;
                details.cancel();
                return;
              }
            }
            changeOpen(next);
          }}
          // つまみで閉じたときに残した高さは、閉じる動きが終わってから消す
          onOpenChangeComplete={(next) => {
            if (!next) drag.clearDragHeight();
          }}
        >
          {inputInSheet ? renderTrigger(messageIds) : renderControl('field', messageIds)}
          {/* 読み込みの知らせ。Autocomplete を描いているあいだずっと置く、見えない status の箱 */}
          <BaseAutocomplete.Status data-slot="autocomplete-status" className="sr-only">
            {announcement}
          </BaseAutocomplete.Status>
          <BaseAutocomplete.Portal container={portalContainer}>
            {/* シートの中に打つ欄を移したときは、後ろの画面を暗くする。欄に打つ欄を残すときは暗くしない */}
            {inputInSheet && (
              <BaseAutocomplete.Backdrop className="fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--duration-sheet) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
            )}
            <BaseAutocomplete.Positioner
              collisionAvoidance={collisionAvoidance}
              sideOffset={() => popupSideOffset(fieldRef.current)}
              data-presentation={listPresentation}
              data-density={densityScope.density}
              style={comboboxPositionerStyle(popupShell)}
              className={comboboxPositionerClass(popupShell)}
            >
              <BaseAutocomplete.Popup
                finalFocus={
                  inputInSheet && sheetAutoFocus
                    ? () => {
                        // 閉じたら欄へフォーカスを戻す。戻すときにページをスクロールさせない
                        fieldRef.current?.focus({ preventScroll: true });
                        return false;
                      }
                    : undefined
                }
                initialFocus={
                  inputInSheet && sheetAutoFocus
                    ? () =>
                        document.querySelector<HTMLElement>(
                          '[data-slot="autocomplete-popup"] [data-slot="autocomplete-sheet-input"] input'
                        )
                    : undefined
                }
                ref={sheet ? measure : popoverFit ? observeCues : undefined}
                data-slot="autocomplete-popup"
                data-dragging={drag.dragging || undefined}
                style={comboboxPopupStyle({
                  selected,
                  sheet,
                  sheetDetent,
                  dragHeight: drag.sheetHeight,
                })}
                className={[
                  listboxPopup({ presentation: listPresentation }),
                  // 当たる候補がなく、出す文もないときは、面そのものを出さない（線だけが残らないように）
                  !sheet && !emptyText && !loadingRow && 'has-data-empty:hidden',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* シートの見出し: つまみ・ラベル・ヘルプテキスト・エラー・警告と、右上の閉じるボタン
                    打つ欄をシートに移したときは、その下に打つ欄を置く */}
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
                {/* 当たる候補がないときの行。読み上げにも知らせる箱なので、文がなくても要素は残す */}
                <ComboboxEmpty>{emptyText && !loading ? emptyText : null}</ComboboxEmpty>
                {long && <SheetMoreCue edge="top" sheet={sheet} sheetMoreCue={sheetMoreCue} />}
                {sheet ? (
                  renderList(messageIds)
                ) : (
                  <AutocompleteScroll viewportRef={listRef} loadingRow={loadingRow}>
                    {renderList(messageIds)}
                  </AutocompleteScroll>
                )}
                {long && <SheetMoreCue edge="bottom" sheet={sheet} sheetMoreCue={sheetMoreCue} />}
                {/* 止めずに読み込んでいるあいだ、候補の最後に出す行 */}
                {loadingRow && (
                  <ListboxLoadingRow
                    ref={loadingRowRef}
                    slot="autocomplete-loading"
                    presentation={listPresentation}
                  >
                    {loadingText}
                  </ListboxLoadingRow>
                )}
              </BaseAutocomplete.Popup>
            </BaseAutocomplete.Positioner>
          </BaseAutocomplete.Portal>
        </BaseAutocomplete.Root>
      )}
    </Field>
  );
}
