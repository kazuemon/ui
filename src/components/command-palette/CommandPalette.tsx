'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { type CSSProperties, type ReactElement, type ReactNode, useId, useRef } from 'react';

import { ComboboxEmpty } from '../../internal/combobox-base/ComboboxParts';
import { useKeyboardProxy } from '../../internal/combobox-base/use-keyboard-proxy';
import { useDensityScope } from '../../internal/density-scope';
import { MagnifyingGlassIcon } from '../../internal/icons';
import { SHEET_FULL } from '../../internal/listbox/listbox-measure';
import type { GroupLabelStyle } from '../../internal/listbox/listbox-styles';
import type { ItemIconVariant } from '../../internal/menu/item-icon';
import { ESCAPE_REASONS } from '../../internal/overlay/close-reasons';
import {
  focusTargetRef,
  type OverlayFocusTarget,
  type OverlayModal,
  type PopupProps,
} from '../../internal/overlay/overlay-props';
import { ScrollFrame } from '../../internal/ScrollFrame';
import { SheetCloseButton } from '../../internal/sheet/SheetHeader';
import { sheetBackdropClass, sheetCloseButtonClass } from '../../internal/sheet/sheet-styles';
import { useKeyboardInset, useKeyboardShrink } from '../../internal/sheet/use-keyboard-inset';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';
import { usePortalContainer } from '../../internal/ui-config';
import { useControlled } from '../../internal/use-controlled';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { Kbd } from '../kbd/Kbd';
import type { MenuItemStatus } from '../menu/MenuItem';
import { menuGroupLabel, menuItem, menuSeparatorClass } from '../menu/menu-styles';
import { useOpenShortcut } from './use-open-shortcut';

/** 候補 1 つ。押すか Enter で、その場で実行する操作か、移る先です */
export interface CommandPaletteItem {
  /** 候補を見分ける値。同じ一覧の中で重ならないようにします */
  value: string;
  /** 候補に出る文字。読み上げの名前にもなり、打って探すときの当たり先にもなります */
  label: string;
  /** 文字には出さないが、打って探すときに当てる言葉（別名・英語名・読みなど） */
  keywords?: readonly string[];
  /** 文字の下の 2 行目。読み上げでは候補の説明になります */
  description?: ReactNode;
  /** 文字の前に置くアイコン（`<Icon icon={...} />`）。大きさと色は一覧が決めます */
  icon?: ReactNode;
  /** 右端に出すショートカット（例: 「Ctrl+S」）。表示だけで、キーの操作は使う側が付けます。シートでは出しません */
  shortcut?: ReactNode;
  /** 削除など、取り消せない操作。danger は文字とアイコンを危険の色にします */
  status?: MenuItemStatus;
  /** 選べない。矢印キーでは止まり、押しても実行しません */
  disabled?: boolean;
  /** 選んだときの処理。CommandPalette の onSelect より先に呼びます */
  onSelect?: () => void;
}

/** 候補のまとまり。`label` が見出しの文字、`items` がその中の候補 */
// 型（interface ではなく type）で書く: Base UI の Group は添字の署名を持つので、interface のままでは渡せない
export type CommandPaletteGroup = {
  /** まとまりの見出し */
  label: ReactNode;
  /** まとまりの中の候補 */
  items: readonly CommandPaletteItem[];
};

/** 候補。そのまま並べる配列か、まとまり（`CommandPaletteGroup[]`）の配列で渡します */
export type CommandPaletteItems = readonly CommandPaletteItem[] | readonly CommandPaletteGroup[];

/** onSelect が受け取る、候補を選んだときのイベント */
export interface CommandPaletteSelectEvent {
  /** 呼ぶと、面を閉じません（続けて別の候補を選ばせるときや、中身を入れ替えるとき） */
  preventDefault: () => void;
  readonly defaultPrevented: boolean;
}

/** 打った文字と候補を突き合わせる関数。true を返した候補を出します */
export type CommandPaletteFilter = (item: CommandPaletteItem, query: string) => boolean;

/** 中央に浮かべるときの幅の段。sm は Dialog の既定と同じ幅、md は既定、lg は候補の文字が長いとき */
export type CommandPaletteSize = 'sm' | 'md' | 'lg';

export interface CommandPaletteProps {
  /** 面と検索欄の読み上げの名前（例: 「コマンドを探す」）。題は画面に出しません */
  accessibleName: string;
  /** 候補。そのまま並べる配列か、見出し付きのまとまりの配列で渡します */
  items: CommandPaletteItems;
  /**
   * 候補を選んだとき（押す・Enter）に呼びます。候補の onSelect のあとです。
   * 既定では選んだあと面を閉じます。閉じないときは event.preventDefault() を呼びます
   */
  onSelect?: (item: CommandPaletteItem, event: CommandPaletteSelectEvent) => void;
  /** 空の検索欄に出す見本の文字（例: 「コマンドやページを探す」） */
  placeholder?: string;
  /** 当たる候補がないときに出す文。渡さないときは、候補の場所を閉じて検索欄だけにします */
  emptyText?: ReactNode;
  /**
   * 打った文字と候補を突き合わせる関数。書かないときは、文字（label）と keywords に打った文字を含む候補を出します
   * （大文字と小文字、全角と半角を区別しません）
   */
  filter?: CommandPaletteFilter;
  /** 打った文字（制御） */
  value?: string;
  /**
   * はじめの打った文字（非制御）。開き直すたびに、この文字に戻します
   * @default ''
   */
  defaultValue?: string;
  /** 打った文字が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string) => void;
  /**
   * 浮かべるときの幅の段。sm は 480px、md は 560px、lg は 640px です。シートで出すときは幅いっぱいです。
   * 狭い画面では、左右に余白を残して縮みます
   * @default 'md'
   */
  size?: CommandPaletteSize;
  /**
   * 下の帯のキー操作の案内（↑↓ 移動・Enter 実行・Esc 閉じる）を隠すか。指で操作するシートでは、いつも出しません
   * @default false
   */
  hideKeyHints?: boolean;
  /**
   * キー操作の案内の、↑↓ の横の文字
   * @default '移動'
   */
  moveHintLabel?: string;
  /**
   * キー操作の案内の、Enter の横の文字
   * @default '実行'
   */
  runHintLabel?: string;
  /**
   * キー操作の案内の、Esc の横の文字
   * @default '閉じる'
   */
  closeHintLabel?: string;
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
   * 候補の頭のアイコンの見せ方。plain はアイコンだけ、soft はグレーの角丸の箱に入れます（Menu の項目と同じ）
   * @default 'plain'
   */
  iconVariant?: ItemIconVariant;
  /** 開くボタン。Button などの要素を渡す。開閉を外から決めるときや、openShortcut だけで開くときは省ける */
  trigger?: ReactElement;
  /**
   * ページのどこで押しても開閉するキーの組み合わせ（例: 'mod+k'）。mod は Mac では ⌘、ほかでは Ctrl です。
   * ほかに ctrl・meta・alt・shift を「+」でつなぎます。書かないときは、キーでは開きません
   */
  openShortcut?: string;
  /** 開いているか（制御） */
  open?: boolean;
  /**
   * はじめに開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /** 開閉の動きが終わったあとに、次の値を渡して呼びます */
  onOpenChangeComplete?: (open: boolean) => void;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも浮かべ、sheet はいつもシートにします。
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 開いているあいだ、ほかの部分の操作とページのスクロールを止めるか。
   * passive は、裏を止めず後ろも暗くしませんが、外を押しても閉じません
   * @default true
   */
  modal?: OverlayModal;
  /**
   * 後ろの画面を押したときに閉じるか
   * @default true
   */
  dismissible?: boolean;
  /**
   * Esc（Android の戻る操作を含む）で閉じるか
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * 閉じる × の読み上げの名前。シートでは右上に、浮かべる面では Tab で止まったときだけ検索欄の右端に出ます
   * @default '閉じる'
   */
  closeName?: string;
  /** 開いた直後に焦点を当てる要素。要素そのものか、要素の ref を渡します。書かないときは検索欄。false は動かしません */
  autoFocus?: OverlayFocusTarget;
  /** 閉じたあとに焦点を戻す要素。要素そのものか、要素の ref を渡します。書かないときは開いたボタン */
  returnFocus?: OverlayFocusTarget;
  /**
   * 描く場所。トリガーの祖先に付いた data-density と coarse-large は、描く場所がその外でも写します。
   * まとめて決めるときは ThemeProvider の portalContainer を使います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref など） */
  popupProps?: PopupProps;
  /** 面（Popup）に足すクラス。幅を変えるときは w-* を渡す */
  className?: string;
}

const normalize = (text: string) => text.normalize('NFKC').toLowerCase();

/** 既定の突き合わせ: 文字と keywords に、打った文字を含むか */
const defaultFilter: CommandPaletteFilter = (item, query) => {
  const q = normalize(query.trim());
  if (!q) return true;
  return [item.label, ...(item.keywords ?? [])].some((text) => normalize(text).includes(q));
};

const isGrouped = (items: CommandPaletteItems): items is readonly CommandPaletteGroup[] => {
  const first = items[0];
  return typeof first === 'object' && first !== null && 'items' in first;
};

// 面: Dialog と同じ（白・細い輪郭・やわらかい影 — 原則1。部品を包むので角はカードの角 — 原則5）。後ろは暗くする
//   画面の上寄りに置く（打って候補が減っても、検索欄の位置が動かない）。上との間は --command-palette-offset
//   幅は size の段（--command-palette-width-sm・--command-palette-width・--command-palette-width-lg）
//   開閉は浮かぶ面と同じ動き（下に --popup-shift 寄った位置から、濃さと一緒に滑る）。動きを減らす設定では動かさない
// シート（指で操作していて画面が狭いとき — 原則16）: 画面の下から全高で出し、検索欄をシートの中に置いて開いた時点から打てる
//   ソフトウェアキーボードが隠している分だけ持ち上げ、見えている範囲に収める（Combobox のシートと同じ — ADR-0220）
const popupClass = {
  popover: [
    'relative flex max-h-full min-h-0 w-(--command-palette-width) max-w-full data-[size=lg]:[--command-palette-width:var(--command-palette-width-lg)] data-[size=sm]:[--command-palette-width:var(--command-palette-width-sm)] flex-col overflow-clip rounded-card shadow-overlay',
    'transition-[opacity,translate] duration-(--duration-normal) ease-(--ease-sheet) data-ending-style:duration-(--popup-duration-out)',
    'data-ending-style:opacity-0 data-starting-style:opacity-0',
    'data-ending-style:[translate:0_var(--popup-shift)] data-starting-style:[translate:0_var(--popup-shift)]',
  ].join(' '),
  sheet: [
    'fixed inset-x-0 flex min-h-0 flex-col rounded-t-card border-x-0 border-b-0 shadow-sheet',
    '[transition:translate_var(--duration-sheet)_var(--ease-sheet)] data-ending-style:translate-y-full data-starting-style:translate-y-full',
  ].join(' '),
};

/**
 * 打って探し、その場で実行する面。⌘K などで開き、検索欄と候補の一覧を持ちます
 */
export function CommandPalette({
  accessibleName,
  items,
  onSelect,
  placeholder,
  emptyText,
  filter = defaultFilter,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  size = 'md',
  hideKeyHints = false,
  moveHintLabel = '移動',
  runHintLabel = '実行',
  closeHintLabel = '閉じる',
  groupLabelStyle = 'label',
  showGroupSeparator = false,
  iconVariant = 'plain',
  trigger,
  openShortcut,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  presentation,
  modal = true,
  dismissible = true,
  closeOnEscape = true,
  closeName = '閉じる',
  autoFocus,
  returnFocus,
  portalContainer: container,
  popupProps,
  className,
}: CommandPaletteProps) {
  const [open, changeOpen] = useControlled(openProp, defaultOpen, onOpenChange);
  const [query, changeQuery] = useControlled(valueProp, defaultValue, onValueChange);
  useOpenShortcut(openShortcut, () => changeOpen(!open));

  const sheet = useSheetPresentation(presentation);
  const portalContainer = usePortalContainer(container);
  const { setAnchor, scope } = useDensityScope<HTMLElement>(open);
  const keyboardInset = useKeyboardInset(sheet && open);
  const keyboardShrink = useKeyboardShrink(sheet && open);
  // シートでは、開くボタンを押した操作の中で見えない打つ欄にフォーカスを当て、ソフトウェアキーボードを出しておく
  const keyboardProxy = useKeyboardProxy(sheet);

  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useMergedRefs<HTMLDivElement>(popupProps?.ref);

  const grouped = isGrouped(items);
  const passive = modal === 'passive';

  const select = (item: CommandPaletteItem) => {
    let prevented = false;
    item.onSelect?.();
    onSelect?.(item, {
      preventDefault: () => {
        prevented = true;
      },
      get defaultPrevented() {
        return prevented;
      },
    });
    if (!prevented) changeOpen(false);
  };

  const renderItem = (item: CommandPaletteItem) => (
    <CommandPaletteOption
      key={item.value}
      item={item}
      iconVariant={iconVariant}
      hideShortcut={sheet}
      // 押したときと、Enter（Base UI が印のある候補を押す）で実行する。選べない候補は Base UI が押させない
      onPress={() => select(item)}
    />
  );

  const {
    className: popupClassName,
    ref: _popupRef,
    style: popupStyle,
    ...popupRest
  } = popupProps ?? {};
  const sheetStyle: CSSProperties | undefined = sheet
    ? {
        bottom: keyboardInset,
        height: `calc((100% - ${keyboardShrink}px) * ${SHEET_FULL})`,
      }
    : undefined;

  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(next, details) => {
        if (!next && !closeOnEscape && ESCAPE_REASONS.has(details.reason)) {
          details.cancel();
          return;
        }
        changeOpen(next);
      }}
      onOpenChangeComplete={(next) => {
        // 開き直したときに前の文字が残らないよう、閉じ終えたら打った文字を戻す
        if (!next && valueProp === undefined) changeQuery(defaultValue);
        onOpenChangeComplete?.(next);
      }}
      modal={passive ? false : modal}
      disablePointerDismissal={!dismissible || passive}
    >
      {trigger ? (
        <>
          <BaseDialog.Trigger
            ref={setAnchor}
            render={trigger}
            onClick={sheet ? (event) => keyboardProxy.focusProxy(event.currentTarget) : undefined}
          />
          {keyboardProxy.proxy}
        </>
      ) : (
        <span ref={setAnchor} hidden />
      )}
      <BaseDialog.Portal container={portalContainer}>
        {modal === true && (
          <BaseDialog.Backdrop
            className={
              sheet
                ? sheetBackdropClass
                : 'fixed inset-0 z-10 bg-backdrop transition-opacity duration-(--duration-normal) ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none'
            }
          />
        )}
        <BaseDialog.Viewport
          data-slot="command-palette-viewport"
          className={[
            'fixed inset-0 z-10',
            !sheet &&
              'flex items-start justify-center overflow-hidden p-(--dialog-margin) pt-(--command-palette-offset)',
            modal !== true && 'pointer-events-none',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <BaseDialog.Popup
            initialFocus={focusTargetRef(autoFocus) ?? inputRef}
            finalFocus={focusTargetRef(returnFocus)}
            aria-label={accessibleName}
            data-slot="command-palette"
            data-presentation={sheet ? 'sheet' : 'popover'}
            data-size={size}
            data-density={scope.density}
            {...popupRest}
            ref={popupRef}
            style={{ ...sheetStyle, ...popupStyle }}
            className={[
              'border-(length:--border-width-thin) border-surface-line bg-surface text-(length:--text-control) leading-(--leading-control) text-fg outline-none motion-reduce:[transition:none]',
              popupClass[sheet ? 'sheet' : 'popover'],
              modal !== true && 'pointer-events-auto',
              scope.large && 'coarse-large',
              cn(className, popupClassName),
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <BaseAutocomplete.Root<CommandPaletteItem>
              inline
              open
              items={items as readonly CommandPaletteItem[]}
              value={query}
              onValueChange={(next, details) => {
                // 候補を選んだことでは文字を変えない（欄は打った文字のまま。実行は候補の onClick）
                if (details.reason === 'item-press') return;
                changeQuery(next);
              }}
              itemToStringValue={(item) => item.label}
              filter={(item, text) => filter(item, text)}
              // 最初の候補にいつも印をあて、打ってすぐ Enter で実行できるようにする
              autoHighlight="always"
              keepHighlight
            >
              <div
                data-slot="command-palette-input"
                className="flex h-(--command-palette-input-height) shrink-0 items-center"
              >
                {/* 欄の頭の虫眼鏡。押せないので塗りのない印（SearchField と同じ）。候補のアイコンと左をそろえる */}
                <span
                  aria-hidden
                  className="flex shrink-0 ps-(--spacing-control-x) text-fg-muted [&>svg]:size-(--spacing-icon)"
                >
                  <MagnifyingGlassIcon />
                </span>
                <BaseAutocomplete.Input
                  ref={inputRef}
                  aria-label={accessibleName}
                  placeholder={placeholder}
                  enterKeyHint="go"
                  className="h-full min-w-0 flex-1 bg-transparent ps-(--search-field-icon-gap) pe-(--spacing-control-x) text-input outline-none placeholder:text-(color:--field-placeholder)"
                />
                {/* 浮かべる面では、Tab で止まったときだけ見せる（指で読み上げを使う人が閉じ方を見つけられるように） */}
                <BaseDialog.Close
                  render={<SheetCloseButton label={closeName} />}
                  data-slot="command-palette-close"
                  // render の要素の見た目のクラスは className で上書きされるので、ここで合わせて渡す
                  className={cn(
                    sheetCloseButtonClass,
                    'me-(--spacing)',
                    !sheet && 'sr-only focus:not-sr-only'
                  )}
                />
              </div>
              {/* 候補の場所。当たる候補がなく、出す文もないときは、区切り線ごと閉じて検索欄だけにする */}
              <div
                data-slot="command-palette-results"
                className={[
                  'flex min-h-0 flex-col border-t-(length:--border-width-thin) border-surface-line',
                  sheet && 'flex-1',
                  emptyText == null && 'has-data-empty:hidden',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="px-(--spacing)">
                  <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                </div>
                <ScrollFrame
                  slot="command-palette-scroll"
                  className={sheet ? 'min-h-0 flex-1' : undefined}
                  focusable={false}
                  viewportClassName={[
                    'p-(--spacing) has-data-empty:py-0',
                    sheet
                      ? 'pb-[max(var(--spacing),env(safe-area-inset-bottom))]'
                      : 'max-h-(--command-palette-list-max-height)',
                  ].join(' ')}
                  contentStyle={{ minWidth: 0 }}
                  inlineEdges={false}
                  orientation="vertical"
                  scrollbarClassName="my-(--spacing)"
                >
                  <BaseAutocomplete.List className="block">
                    {grouped
                      ? (group: CommandPaletteGroup, index: number) => (
                          <BaseAutocomplete.Group key={index} items={group.items} className="block">
                            {showGroupSeparator && index > 0 && (
                              <BaseAutocomplete.Separator className={menuSeparatorClass} />
                            )}
                            <BaseAutocomplete.GroupLabel
                              className={menuGroupLabel({ style: groupLabelStyle })}
                            >
                              {group.label}
                            </BaseAutocomplete.GroupLabel>
                            <BaseAutocomplete.Collection>
                              {(item: CommandPaletteItem) => renderItem(item)}
                            </BaseAutocomplete.Collection>
                          </BaseAutocomplete.Group>
                        )
                      : (item: CommandPaletteItem) => renderItem(item)}
                  </BaseAutocomplete.List>
                </ScrollFrame>
              </div>
              {/* キー操作の案内。指で操作するシートでは出さない */}
              {!sheet && !hideKeyHints && (
                <div
                  data-slot="command-palette-footer"
                  className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t-(length:--border-width-thin) border-surface-line px-(--spacing-control-x) py-2 text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle"
                >
                  <span className="flex items-center gap-1">
                    <Kbd aria-label="上">↑</Kbd>
                    <Kbd aria-label="下">↓</Kbd>
                    {moveHintLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd>Enter</Kbd>
                    {runHintLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd>Esc</Kbd>
                    {closeHintLabel}
                  </span>
                </div>
              )}
            </BaseAutocomplete.Root>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

// 候補 1 行。見た目は Menu の項目と同じ（入力欄の仲間。hover とキーボードの印は入力欄の塗り — 原則3）
//   並び: [アイコン] [文字と 2 行目] [ショートカット]。2 行目とショートカットは、読み上げでは候補の説明
function CommandPaletteOption({
  item,
  iconVariant,
  hideShortcut,
  onPress,
}: {
  item: CommandPaletteItem;
  iconVariant: ItemIconVariant;
  hideShortcut: boolean;
  onPress: () => void;
}) {
  const id = useId();
  const { icon, description, status, disabled } = item;
  const shortcut = hideShortcut ? undefined : item.shortcut;
  const variant = icon != null ? iconVariant : 'plain';
  const s = menuItem({
    danger: status === 'danger',
    described: description != null,
    iconVariant: variant,
  });
  const describedBy =
    [description != null && `${id}description`, shortcut != null && `${id}shortcut`]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <BaseAutocomplete.Item
      value={item}
      disabled={disabled}
      onClick={onPress}
      data-slot="command-palette-item"
      data-status={status}
      aria-labelledby={describedBy ? `${id}label` : undefined}
      aria-describedby={describedBy}
      className={s.root()}
    >
      {icon != null && (
        <span aria-hidden className={s.icon()}>
          {icon}
        </span>
      )}
      <span className={s.label()}>
        <span id={`${id}label`} className={s.text()}>
          {item.label}
        </span>
        {description != null && (
          <span id={`${id}description`} className={s.description()}>
            {description}
          </span>
        )}
      </span>
      {shortcut != null && (
        <span id={`${id}shortcut`} className={s.shortcut()}>
          {shortcut}
        </span>
      )}
    </BaseAutocomplete.Item>
  );
}
