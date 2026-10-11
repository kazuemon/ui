'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { Fragment, type ReactNode, type Ref, useId, useState } from 'react';

import { type CascaderItem, type CascaderValueItem, itemsOnPath } from './cascader-items';
import {
  type CascaderParentSelect,
  CascaderPanel,
  type CascaderSheetNavigation,
} from './CascaderPanel';
import { Field, useFieldControlKind, useFieldState } from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import { type FieldNamed, splitFieldProps } from '../../internal/field/input-field-props';
import { CaretDownIcon } from '../../internal/icons';
import {
  type ListboxColor,
  OWN_FOCUS,
  selectedTokens,
} from '../../internal/listbox/listbox-colors';
import type { ListboxFieldProps } from '../../internal/listbox/listbox-field-props';
import type { PopupProps, PositionerProps } from '../../internal/overlay/overlay-props';
import { PickerOverlay, pickerOpenLook } from '../../internal/picker/PickerOverlay';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';
import { useControlled } from '../../internal/use-controlled';

export type { CascaderItem, CascaderValueItem } from './cascader-items';
export type { CascaderParentSelect, CascaderSheetNavigation } from './CascaderPanel';

// 段をたどって選ぶ欄。親を選ぶと次の段が開き、最後の段（子のない選択肢）まで行くと決まる
//   欄は Select と同じ形のボタン（押すと開く。右端に ▼）。値は段ごとの value の並び（道筋）
//   開いた面は欄の左端にそろえて下に浮かべる（DatePicker・TimePicker と同じ PickerOverlay）。段を横に並べる（CascaderPanel）
//   指で操作していて画面が狭いときは、画面の下から出すシートにし、1 段ずつ滑らせて進む（原則16）
//   開いているあいだ、欄はフォーカス中と同じ見た目を保つ（pickerOpenLook）

/** 欄に出す文。path は道筋をすべて（「東京都 / 渋谷区」）、last は最後の段だけ（「渋谷区」） */
export type CascaderValueDisplay = 'path' | 'last';

/** Cascader の本体（CascaderControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface CascaderControlProps<Value extends CascaderValueItem = string> {
  /**
   * 選択肢の木。`children` を持つ選択肢は次の段を開く親、持たない選択肢は選ぶと決まる葉です。
   * 値の型（文字か数）が `value`・`onValueChange` の型になります
   */
  items: CascaderItem<Value>[];
  /** 選んだ値（制御）。1 段目から順に、段ごとの選択肢の value を並べた配列です。何も選んでいないときは空の配列です */
  value?: Value[];
  /** はじめの値（非制御）。並べ方は value と同じです */
  defaultValue?: Value[];
  /** 値が決まったときに、段ごとの value の並びを渡して呼びます */
  onValueChange?: (value: Value[]) => void;
  /**
   * 何も選んでいないときに出す文字。選んだ値と見分けられるよう、まだ選んでいないと分かる書き方にします
   * @default '選んでください'
   */
  placeholder?: string;
  /**
   * 欄に出す文。path は 1 段目からの道筋をすべて（「東京都 / 渋谷区」）、last は最後の段だけ（「渋谷区」）です。
   * 欄が狭いときは、path では前の段から縮めて切り、最後の段を残します
   * @default 'path'
   */
  valueDisplay?: CascaderValueDisplay;
  /**
   * valueDisplay="path" のときの、段のあいだの区切り。読み上げでは読みません。null では区切らずに続けて書きます（「東京都渋谷区」）
   * @default '/'
   */
  separator?: ReactNode;
  /** 欄に出す選んだ値の見せ方。値があるときだけ、段ごとの選択肢を渡して呼びます。書くと valueDisplay・separator は使いません */
  renderValue?: (items: CascaderItem<Value>[]) => ReactNode;
  /**
   * 親にマウスを載せて少し待つと、次の段を開くか（Menu の入れ子と同じ）。開いている次の段へ斜めに動かすあいだは、途中でかすめた親では開きません。
   * 開いた直後や段が増えた直後は、ポインターが動くまで開きません。false では、親を押すか → キーで開きます。指で操作するときと、シートではいつも押して開きます
   * @default true
   */
  openOnHover?: boolean;
  /**
   * 途中の段（親）で決められるか。none は最後の段まで行かないと決まりません（親を押すと次の段が開くだけです）。
   * row は次の段の先頭に、親そのものを選ぶ行（parentRowLabel。「東京都 のすべて」）を置きます
   * @default 'none'
   */
  parentSelect?: CascaderParentSelect;
  /**
   * parentSelect="row" のときの、親そのものを選ぶ行の文字
   * @default (item) => `${item.label} のすべて`
   */
  parentRowLabel?: (item: CascaderItem<Value>) => string;
  /**
   * 選んだ値の印（面・文字・チェック）の色。hover とたどっている段の塗りは、色を指定していても入力欄と同じグレーです
   * @default 'neutral'
   */
  color?: ListboxColor;
  /**
   * 読み取り専用にします。見た目は Select の読み取り専用と同じで、押しても開きません。フォームでは値が送られます
   * @default false
   */
  readOnly?: boolean;
  /** 開いているか（制御） */
  open?: boolean;
  /**
   * はじめに開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /**
   * 開く面の出し方。auto は指で操作していて画面が狭いときだけシートにします。popover はいつも浮かべ、sheet はいつもシートにします。
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 浮かぶ面・シートを描く場所。ThemeProvider でまとめて指定できます
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 浮かぶ面（シートでは面）に広げる props。className は部品のクラスに重ねます */
  popupProps?: PopupProps;
  /** 浮かぶ面の位置を決める要素（Positioner）に広げる props。className は部品のクラスに重ねます */
  positionerProps?: PositionerProps;
  /**
   * シートで前の段へ戻る手段。back は段の上に「‹ 親の名前」の行を置きます。
   * tabs は上に段ごとのタブ（選んだ選択肢の名前。まだ選んでいない段は placeholder）を並べ、押すとその段へ戻ります
   * @default 'back'
   */
  sheetNavigation?: CascaderSheetNavigation;
  /**
   * 段に選ぶものがないとき（children が空の配列）に出す文
   * @default '選択肢がありません'
   */
  emptyText?: ReactNode;
  /**
   * シートの、閉じるボタン（×）の読み上げの名前
   * @default '閉じる'
   */
  closeName?: string;
  /**
   * シートの、前の段へ戻る行の読み上げの補足。行は親の名前を見せ、続けてこの文を読みます
   * @default '戻る'
   */
  backName?: string;
  /**
   * 親の選択肢の読み上げの補足（次の段があること）
   * @default '次の段があります'
   */
  parentHintText?: string;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 本体（面を開くボタン）に付くクラス */
  className?: string;
}

/** Cascader の外枠（Field）が受け持つ props */
interface CascaderFieldProps extends ListboxFieldProps {
  /**
   * 押せない（Disabled）状態にします。押しても開かず、フォームでは値が送られません
   * @default false
   */
  disabled?: boolean;
  /** フォームに送るときの名前。段ごとの value を、1 段目から順に同じ名前で送ります（FormData の getAll で道筋になります） */
  name?: string;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
}

/** Cascader の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type CascaderBaseProps<Value extends CascaderValueItem = string> = Omit<
  CascaderControlProps<Value>,
  'className'
> &
  CascaderFieldProps;

/** Cascader の props。label か accessibleName のどちらかが要ります */
export type CascaderProps<Value extends CascaderValueItem = string> = FieldNamed<
  CascaderBaseProps<Value>
>;

const defaultParentRowLabel = (item: CascaderItem<CascaderValueItem>) => `${item.label} のすべて`;

/**
 * 段をたどって選ぶ欄の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・エラー・必須の状態と、説明のつながりは、包む Field から受け取ります。開いた面の名前は Field のラベルです
 */
export function CascaderControl<Value extends CascaderValueItem = string>({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = '選んでください',
  valueDisplay = 'path',
  separator = '/',
  renderValue,
  openOnHover = true,
  parentSelect = 'none',
  parentRowLabel = defaultParentRowLabel,
  color = 'neutral',
  readOnly,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  presentation,
  portalContainer,
  popupProps,
  positionerProps,
  sheetNavigation = 'back',
  emptyText = '選択肢がありません',
  closeName = '閉じる',
  backName = '戻る',
  parentHintText = '次の段があります',
  form,
  inputRef,
  className,
}: CascaderControlProps<Value> & Pick<CascaderFieldProps, 'inputRef'>) {
  // 本体はボタンなので、ラベルを <label> にしない
  useFieldControlKind({ nativeLabel: false });
  const field = useFieldState();
  const valueId = useId();
  const blocking = field?.blocking ?? false;
  // PickerOverlay と同じ判定。シートでは段を 1 つずつ出す
  const sheet = useSheetPresentation(presentation);
  const [value, changeValue] = useControlled<Value[]>(valueProp, defaultValue ?? [], onValueChange);

  // 読み取り専用・押せない・Form の送信中は開かない（値を変える操作なので — ADR-0168）
  const locked = !!readOnly || !!field?.disabled || blocking;
  const [openState, setOpenState] = useState(defaultOpen);
  const open = (openProp ?? openState) && !locked;
  // 押して開いたときだけ、面の中へフォーカスを移す（はじめから開いているときは動かさない）
  const [openedByUser, setOpenedByUser] = useState(false);
  // いまたどっている道筋。開くたびに、決まっている値から始める
  const [activePath, setActivePath] = useState<Value[]>(value);
  const changeOpen = (next: boolean) => {
    if (next && locked) return;
    if (next) setActivePath(value);
    setOpenedByUser(next);
    setOpenState(next);
    onOpenChange?.(next);
  };

  const pick = (path: Value[]) => {
    changeValue(path);
    changeOpen(false);
  };

  const selectedItems = itemsOnPath(items, value);
  const hasValue = selectedItems.length > 0;
  const label = field?.label ?? field?.accessibleName;
  const rootName = typeof label === 'string' ? label : (field?.accessibleName ?? '選択肢');

  const valueText = !hasValue ? (
    placeholder
  ) : renderValue ? (
    renderValue(selectedItems)
  ) : valueDisplay === 'last' ? (
    <span className="min-w-0 truncate">{selectedItems.at(-1)?.label}</span>
  ) : (
    // 道筋をすべて出す。狭いときは前の段から縮め、最後の段を残す。区切りは読み上げから外す
    selectedItems.map((item, index) => {
      const lastItem = index === selectedItems.length - 1;
      return (
        <Fragment key={index}>
          {index > 0 && separator != null && separator !== '' && (
            <>
              {' '}
              <span
                aria-hidden
                data-slot="cascader-separator"
                className="mx-[0.3em] shrink-0 text-fg-subtle"
              >
                {separator}
              </span>{' '}
            </>
          )}
          <span
            data-slot="cascader-value-item"
            className={cn('truncate', lastItem ? 'min-w-0 shrink-[0.001]' : 'min-w-[1em] shrink')}
          >
            {item.label}
          </span>
        </Fragment>
      );
    })
  );

  const panel = (
    <div
      data-slot="cascader-popup-content"
      className="text-input [--spacing-icon:var(--spacing-icon-input)]"
      style={selectedTokens(color)}
    >
      <CascaderPanel<Value>
        items={items}
        value={value}
        activePath={activePath}
        onActivePathChange={setActivePath}
        onPick={pick}
        sheet={sheet}
        rootName={rootName}
        openOnHover={openOnHover}
        parentSelect={parentSelect}
        parentRowLabel={parentRowLabel}
        emptyText={emptyText}
        backName={backName}
        parentHintText={parentHintText}
        autoFocus={openedByUser}
        sheetNavigation={sheetNavigation}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <PickerOverlay
      open={open}
      onOpenChange={changeOpen}
      title={label ?? rootName}
      presentation={presentation}
      portalContainer={portalContainer}
      popupProps={popupProps}
      positionerProps={positionerProps}
      popoverClassName="overflow-clip"
      panel={panel}
      closeName={closeName}
      // フォーカスを面の中に閉じ込める（段のあいだは Tab でも移れる）。開いたときは、たどっている段の項目へ部品が移す
      trapFocus
    >
      {(renderTrigger) => (
        <BaseField.Control
          value={value.map(String).join('/')}
          disabled={field?.disabled}
          render={(controlProps) => (
            <>
              {renderTrigger(
                <button
                  type="button"
                  id={controlProps.id}
                  // 名前はラベル、続けて選んだ値（または見本の文字）を読む
                  aria-labelledby={[controlProps['aria-labelledby'], valueId]
                    .filter(Boolean)
                    .join(' ')}
                  aria-describedby={field?.describedBy}
                  aria-required={field?.required || undefined}
                  aria-disabled={blocking || undefined}
                  aria-readonly={readOnly || undefined}
                  disabled={field?.disabled}
                  data-slot="control"
                  data-field-readonly={readOnly || undefined}
                  className={controlBox({
                    className: [
                      'text-left',
                      blocking ? 'cursor-progress' : readOnly ? 'cursor-default' : 'cursor-pointer',
                      OWN_FOCUS[color],
                      className,
                    ],
                  })}
                >
                  <span
                    id={valueId}
                    data-slot="cascader-value"
                    className={cn(
                      'flex min-w-0 flex-1 items-baseline',
                      !hasValue && 'truncate text-(color:--field-placeholder)'
                    )}
                  >
                    {valueText}
                  </span>
                  {/* ▼。押せない・読み取り専用では淡くする（Select と同じ） */}
                  <span
                    aria-hidden
                    className={cn(
                      'flex group-data-disabled/field:text-fg-subtle group-data-[loading=blocking]/field:text-fg-subtle',
                      readOnly ? 'text-fg-subtle' : 'text-fg-muted'
                    )}
                  >
                    <CaretDownIcon />
                  </span>
                </button>
              )}
              {/* 検証とフォーカスのための input（Field につなぐ）。送る値は段ごとの input に置く */}
              <input
                ref={(element) => {
                  const ref = controlProps.ref;
                  if (typeof ref === 'function') ref(element);
                  else if (ref) (ref as { current: HTMLInputElement | null }).current = element;
                  if (typeof inputRef === 'function') inputRef(element);
                  else if (inputRef) inputRef.current = element;
                }}
                type="hidden"
                value={value.map(String).join('/')}
                disabled={field?.disabled}
              />
              {value.map((segment, index) => (
                <input
                  key={index}
                  type="hidden"
                  // Base UI の Field.Control は、Field.Root の name を render の props に入れる（型の HTMLProps には無い）
                  name={(controlProps as { name?: string }).name}
                  form={form}
                  value={String(segment)}
                  disabled={field?.disabled}
                />
              ))}
            </>
          )}
        />
      )}
    </PickerOverlay>
  );
}

/**
 * 段をたどって選ぶ欄。親を選ぶと次の段が開き、最後の段まで行くと決まります（都道府県と市区町村、カテゴリの階層など）
 */
export function Cascader<Value extends CascaderValueItem = string>(props: CascaderProps<Value>) {
  const [field, { inputRef, ...control }] = splitFieldProps(props as CascaderBaseProps<Value>);
  return (
    <Field
      {...field}
      // 開いているあいだ、欄をフォーカス中と同じ見た目にする（Select・DatePicker と同じ）
      className={cn(pickerOpenLook, field.className)}
      nativeLabel={false}
    >
      {() => <CascaderControl<Value> {...control} inputRef={inputRef} />}
    </Field>
  );
}
