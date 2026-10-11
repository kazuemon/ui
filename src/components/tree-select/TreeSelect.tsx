'use client';

import { Field as BaseField } from '@base-ui/react/field';
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type Ref,
  useId,
  useMemo,
  useState,
} from 'react';

import { selectClearButton, selectClearField, selectClearTrigger } from '../select/Select';
import { FieldAddonButton } from '../field-addon/FieldAddon';
import {
  ancestorsOf,
  indexTree,
  leafSetOf,
  toggleLeaves,
  type TreeNode,
  type TreeSelectItem,
  type TreeSelectMultipleValue,
  valuesOf,
} from './tree-select-items';
import { TreeSelectPanel } from './TreeSelectPanel';
import { ComboboxTriggerChips } from '../../internal/combobox-base/ComboboxChips';
import { Field, useFieldControlKind, useFieldState } from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import { type FieldNamed, splitFieldProps } from '../../internal/field/input-field-props';
import { CaretDownIcon, XIcon } from '../../internal/icons';
import {
  type ListboxColor,
  OWN_FOCUS,
  selectedTokens,
} from '../../internal/listbox/listbox-colors';
import type { ListboxFieldProps } from '../../internal/listbox/listbox-field-props';
import type { ListboxValue } from '../../internal/listbox/use-listbox-option';
import type { PopupProps, PositionerProps } from '../../internal/overlay/overlay-props';
import { PickerOverlay, pickerOpenLook } from '../../internal/picker/PickerOverlay';
import {
  type OverlayPresentation,
  useSheetPresentation,
} from '../../internal/sheet/use-narrow-screen';
import { cn } from '../../internal/tv';
import { useControlled } from '../../internal/use-controlled';

export type { TreeSelectItem, TreeSelectMultipleValue } from './tree-select-items';

// 木をたどって選ぶ欄。欄は Select と同じ形（押すと開くボタン・右端の ▼）、開いた面の中は Tree と同じ行・字下げ・案内線
//   面は欄の下に浮かべ、指で操作していて画面が狭いときはシートにする（DatePicker・TimePicker と同じ PickerOverlay — 原則16）
//   1 つ選ぶ形: 行を押すと選んで閉じる。親の行を選べるか（parentSelectable）は軸 645
//   複数選ぶ形（multiple）: 行の頭にチェックボックス。親を選ぶと中もすべて入り、一部なら中間の印。外に渡す値の畳み方（multipleValue）は軸 646
//   欄に出す文: 1 つ選ぶ形は valueDisplay（軸 643。既定はパスで、親と区切りは一段淡く — pathVariant）、複数選ぶ形は multipleDisplay（軸 644）
//   値を消す ×（clearable）は Select と同じ形（欄の右端に重ねる）
//   読み取り専用・押せない・待っているあいだ止める欄・Form の送信中は開かない（値を変える操作なので — ADR-0168）

/** 欄に出す文。path は親からのパス（「デザイン / 原則」）、last は選んだ行の名前だけ（Cascader と同じ値） */
export type TreeSelectValueDisplay = 'path' | 'last';

/** パスの親と区切りの文字の色。muted は一段淡く（選んだ行の名前が先に目に入る）、default は本文と同じ色 */
export type TreeSelectPathVariant = 'muted' | 'default';

/** 複数選ぶ形の、欄に出す文。chips は選んだ行をチップで並べ（欄が伸びる）、text は名前を「、」でつないで 1 行に収めます */
export type TreeSelectMultipleDisplay = 'chips' | 'text';

/** TreeSelect の値の型。単数では `Value | null`、`multiple` では `Value[]` です */
export type TreeSelectValue<
  Value extends ListboxValue = string,
  Multiple extends boolean = false,
> = Multiple extends true ? Value[] : Value | null;

// パスの区切り。文字の前後に空きを取る（Breadcrumb の区切りと同じ向き）
const PATH_SEPARATOR = ' / ';

/** TreeSelect の本体（TreeSelectControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface TreeSelectControlProps<
  Value extends ListboxValue = string,
  Multiple extends boolean = false,
> {
  /** 木の行。`{ value, label }` に、入れ子の行を `children` で渡します。選べない行には `disabled`、頭のアイコンは `icon` です */
  items: TreeSelectItem<Value>[];
  /**
   * 複数選べるようにします。行の頭にチェックボックスを出し、親を選ぶと中もすべて選びます。値は配列になります
   * @default false
   */
  multiple?: Multiple;
  /** 選んだ値（制御）。単数では `Value | null`、`multiple` では `Value[]` */
  value?: TreeSelectValue<NoInfer<Value>, Multiple>;
  /** はじめの値（非制御）。単数では `Value | null`、`multiple` では `Value[]` */
  defaultValue?: TreeSelectValue<NoInfer<Value>, Multiple>;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: TreeSelectValue<Value, Multiple>) => void;
  /**
   * 複数選ぶ形で、外に渡す値のまとめ方。leaves は葉（子のない行）だけ、parents は中をすべて選んだ親を親の値 1 つに畳み、
   * all は親と葉の両方を並べます。親の値を受け取ったときは、その中をすべて選んだものとして読みます
   * @default 'leaves'
   */
  multipleValue?: TreeSelectMultipleValue;
  /**
   * 1 つ選ぶ形で、親の行を選べるか。false では、親の行を押すと開け閉めだけをし、葉だけを選べます。
   * true では、行を押すと選び、開け閉めは左の印で行います
   * @default true
   */
  parentSelectable?: boolean;
  /**
   * 1 つ選ぶ形の、欄に出す文。path は親からのパス、last は選んだ行の名前だけです。
   * 長いときは親の側から省きます
   * @default 'path'
   */
  valueDisplay?: TreeSelectValueDisplay;
  /**
   * valueDisplay="path" のときの、パスの親と区切りの文字の色。muted は一段淡く、default は本文と同じ色です
   * @default 'muted'
   */
  pathVariant?: TreeSelectPathVariant;
  /**
   * 複数選ぶ形の、欄に出す文。chips は選んだ行をチップで並べ（欄の高さが伸びます）、text は名前を「、」でつないで 1 行に収めます
   * @default 'chips'
   */
  multipleDisplay?: TreeSelectMultipleDisplay;
  /** はじめに開いている親の行の値（非制御）。書かないときは、選んだ値の祖先を開きます */
  defaultExpanded?: Value[];
  /** 開いている親の行の値（制御） */
  expanded?: Value[];
  /** 親の行の開閉が変わるときに、開いている行の値を渡して呼びます */
  onExpandedChange?: (expanded: Value[]) => void;
  /**
   * 選んだ行の印（面・文字・チェック・チェックボックス）の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレーです（原則6）
   * @default 'neutral'
   */
  color?: ListboxColor;
  /**
   * 何も選んでいないときに出す文字。「選んでください」のように、まだ選んでいないと分かる書き方にします
   * @default '選んでください'
   */
  placeholder?: string;
  /**
   * 読み取り専用にします。見た目は Select の読み取り専用と同じで、押しても開きません。フォームでは値が送られます
   * @default false
   */
  readOnly?: boolean;
  /**
   * 選んだ値を消すボタン（×）を欄の端に出すか。何も選んでいないときと、読み取り専用の欄では出しません
   * @default false
   */
  clearable?: boolean;
  /**
   * 消すボタンの読み上げの名前
   * @default multiple ? '選んだ項目をすべて消去' : '選んだ項目を消去'
   */
  clearName?: string;
  /** 面が開いているか（制御） */
  open?: boolean;
  /**
   * はじめに面が開いているか（非制御）
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます */
  onOpenChange?: (open: boolean) => void;
  /**
   * 出し方。auto は指で操作していて画面が狭いときだけ、画面の下から出すシートにします。popover はいつも欄のそばに浮かべ、sheet はいつもシートにします
   * 書かないときは ThemeProvider の presentation に従います
   * @default 'auto'
   */
  presentation?: OverlayPresentation;
  /**
   * 面を描く場所。ThemeProvider でまとめて指定できます
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /** 面（Popup）に足す props（id・data-*・aria-*・ref・className など） */
  popupProps?: PopupProps;
  /** 位置を決める要素（Positioner）に足す props。位置の基準は、書かないときは欄の外枠です */
  positionerProps?: PositionerProps;
  /**
   * 面を閉じるボタンの読み上げの名前（シートの ×）
   * @default '閉じる'
   */
  closeName?: string;
  /** 欄が属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /** 本体（面を開くボタン）に付くクラス */
  className?: string;
}

/** TreeSelect の外枠（Field）が受け持つ props */
interface TreeSelectFieldProps extends ListboxFieldProps {
  /**
   * 押せない（Disabled）状態にします。押しても開かず、フォームでは値が送られません
   * @default false
   */
  disabled?: boolean;
  /** フォームに送るときの名前。値は文字にして送られます。multiple では同じ名前で複数送られます */
  name?: string;
}

/** TreeSelect の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type TreeSelectBaseProps<
  Value extends ListboxValue = string,
  Multiple extends boolean = false,
> = Omit<TreeSelectControlProps<Value, Multiple>, 'className'> & TreeSelectFieldProps;

/** TreeSelect の props。label か accessibleName のどちらかが要ります */
export type TreeSelectProps<
  Value extends ListboxValue = string,
  Multiple extends boolean = false,
> = FieldNamed<TreeSelectBaseProps<Value, Multiple>>;

/**
 * 木をたどって選ぶ欄の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・必須の状態と、説明のつながりは、包む Field から受け取ります。面の名前は Field のラベルです
 */
export function TreeSelectControl<
  Value extends ListboxValue = string,
  Multiple extends boolean = false,
>({
  items,
  multiple: multipleProp,
  value: valueProp,
  defaultValue,
  onValueChange,
  multipleValue = 'leaves',
  parentSelectable = true,
  valueDisplay = 'path',
  pathVariant = 'muted',
  multipleDisplay = 'chips',
  defaultExpanded,
  expanded: expandedProp,
  onExpandedChange,
  color = 'neutral',
  placeholder = '選んでください',
  readOnly = false,
  clearable = false,
  clearName,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  presentation,
  portalContainer,
  popupProps,
  positionerProps,
  closeName = '閉じる',
  form,
  inputRef,
  className,
}: TreeSelectControlProps<Value, Multiple>) {
  const field = useFieldState();
  // 本体はボタンなので、ラベルを <label> にしない
  useFieldControlKind({ nativeLabel: false });
  const multiple = multipleProp ?? false;
  const disabled = field?.disabled ?? false;
  const blocking = field?.blocking ?? false;
  const index = useMemo(() => indexTree(items as TreeSelectItem<ListboxValue>[]), [items]);
  const sheet = useSheetPresentation(presentation);

  // 値。中では文字か数（ListboxValue）として持ち、onValueChange に渡すときに Value に戻す
  const [current, changeValue] = useControlled<ListboxValue | ListboxValue[] | null>(
    valueProp,
    (defaultValue as ListboxValue | ListboxValue[] | null | undefined) ?? (multiple ? [] : null),
    onValueChange as ((next: ListboxValue | ListboxValue[] | null) => void) | undefined
  );
  const values = useMemo<ListboxValue[]>(
    () => (Array.isArray(current) ? current : current == null ? [] : [current]),
    [current]
  );
  const checkedLeaves = useMemo(() => leafSetOf(index, values), [index, values]);
  // 欄に出す行とフォームに送る値。複数選ぶ形は、受け取った値を multipleValue のまとめ方にそろえる（親に畳んだら親の名前）
  const shownNodes = (multiple ? valuesOf(index, checkedLeaves, multipleValue) : values)
    .map((value) => index.byValue.get(value))
    .filter((node): node is TreeNode => node != null);

  // 開いている親の行。書かないときは、はじめの値の祖先を開く（開いたときに選んだ行が見える）
  const [expandedValues, setExpandedValues] = useControlled<ListboxValue[]>(
    expandedProp,
    () =>
      (defaultExpanded as ListboxValue[] | undefined) ??
      Array.from(
        new Set(shownNodes.flatMap((node) => ancestorsOf(node).map((parent) => parent.value)))
      ),
    onExpandedChange as ((next: ListboxValue[]) => void) | undefined
  );
  const expanded = useMemo(() => new Set(expandedValues), [expandedValues]);
  const changeExpanded = (value: ListboxValue, open: boolean) => {
    if (expanded.has(value) === open) return;
    setExpandedValues(
      open ? [...expandedValues, value] : expandedValues.filter((v) => v !== value)
    );
  };

  const locked = readOnly || disabled || blocking;
  const [openState, setOpenState] = useState(defaultOpen);
  const open = (openProp ?? openState) && !locked;
  // 開く口を押して開いたときだけ、木の行へフォーカスを移す（はじめから開いているときは動かさない）
  const [openedByUser, setOpenedByUser] = useState(false);
  const changeOpen = (next: boolean) => {
    if (next && locked) return;
    setOpenedByUser(next);
    setOpenState(next);
    onOpenChange?.(next);
  };

  const pick = (node: TreeNode) => {
    if (multiple) {
      changeValue(valuesOf(index, toggleLeaves(node, checkedLeaves), multipleValue));
      return;
    }
    changeValue(node.value);
    changeOpen(false);
  };

  const hasValue = values.length > 0;
  const showClear = clearable && !readOnly && hasValue;
  const label = field?.label ?? field?.accessibleName;
  const treeName = typeof label === 'string' ? label : (field?.accessibleName ?? '選択肢');

  const panel = (
    <TreeSelectPanel
      index={index}
      multiple={multiple}
      selected={multiple ? null : (values[0] ?? null)}
      checkedLeaves={checkedLeaves}
      expanded={expanded}
      onExpandedChange={changeExpanded}
      onPick={pick}
      parentSelectable={parentSelectable}
      color={color}
      label={treeName}
      autoFocus={openedByUser}
      sheet={sheet}
    />
  );

  const { className: popupClassName, style: popupStyle, ...restPopupProps } = popupProps ?? {};

  return (
    <PickerOverlay
      open={open}
      onOpenChange={changeOpen}
      // 面の名前は欄のラベル
      title={label ?? treeName}
      presentation={presentation}
      portalContainer={portalContainer}
      positionerProps={positionerProps}
      popupProps={{
        ...restPopupProps,
        className: popupClassName,
        style: { ...selectedTokens(color), ...popupStyle },
      }}
      // 余白は木の枠が持つ（Select の浮かぶ選択肢と同じ）。幅は中身の幅で、欄より狭いときは欄の幅まで広げる
      popoverClassName="w-max min-w-(--anchor-width) overflow-clip"
      panel={panel}
      closeName={closeName}
    >
      {(renderTrigger) => {
        const trigger = (
          <TreeSelectButton
            nodes={shownNodes}
            multiple={multiple}
            valueDisplay={valueDisplay}
            pathVariant={pathVariant}
            multipleDisplay={multipleDisplay}
            placeholder={placeholder}
            readOnly={readOnly}
            color={color}
            showClear={showClear}
            form={form}
            inputRef={inputRef}
            className={className}
            renderTrigger={renderTrigger}
          />
        );
        if (!clearable) return trigger;
        // 消すボタン（Select と同じ）。本体はボタンなので中に置けず、本体と × を包んで × を本体の上に重ねる
        //   値の有無にかかわらず包む（× を消したときに本体を作り直すと、本体に戻したフォーカスが外れるため）
        return (
          <div data-slot="select-field" className={selectClearField}>
            {trigger}
            {showClear && (
              <FieldAddonButton
                data-select-clear=""
                aria-label={clearName ?? (multiple ? '選んだ項目をすべて消去' : '選んだ項目を消去')}
                disabled={blocking || disabled || undefined}
                onClick={(event) => {
                  const control =
                    event.currentTarget.parentElement?.querySelector<HTMLElement>(
                      '[data-slot="control"]'
                    );
                  changeValue(multiple ? [] : null);
                  control?.focus();
                }}
                className={selectClearButton}
              >
                <XIcon standalone />
              </FieldAddonButton>
            )}
          </div>
        );
      }}
    </PickerOverlay>
  );
}

/**
 * 木をたどって選ぶ欄です。開いた面の木から、1 つ（`multiple` では複数）を選びます
 */
export function TreeSelect<Value extends ListboxValue = string, Multiple extends boolean = false>(
  props: TreeSelectProps<Value, Multiple>
) {
  const [field, control] = splitFieldProps(props as TreeSelectBaseProps<Value, Multiple>);
  return (
    <Field
      {...field}
      // 開いているあいだ、欄をフォーカス中と同じ見た目にする（Select・DatePicker と同じ）
      className={cn(pickerOpenLook, field.className)}
      nativeLabel={false}
    >
      {() => <TreeSelectControl<Value, Multiple> {...control} />}
    </Field>
  );
}

interface TreeSelectButtonProps {
  nodes: TreeNode[];
  multiple: boolean;
  valueDisplay: TreeSelectValueDisplay;
  pathVariant: TreeSelectPathVariant;
  multipleDisplay: TreeSelectMultipleDisplay;
  placeholder: string;
  readOnly: boolean;
  color: ListboxColor;
  showClear: boolean;
  form: string | undefined;
  inputRef: Ref<HTMLInputElement> | undefined;
  className: string | undefined;
  renderTrigger: (element: ReactElement<ComponentProps<'button'>>) => ReactElement;
}

// 欄（面を開くボタン）。見た目は Select の本体と同じ。ラベル・キャプション・状態の行は、包む Field が並べる
function TreeSelectButton({
  nodes,
  multiple,
  valueDisplay,
  pathVariant,
  multipleDisplay,
  placeholder,
  readOnly,
  color,
  showClear,
  form,
  inputRef,
  className,
  renderTrigger,
}: TreeSelectButtonProps) {
  const field = useFieldState();
  const valueId = useId();
  const blocking = field?.blocking ?? false;
  const disabled = field?.disabled ?? false;
  const chips = multiple && multipleDisplay === 'chips' && nodes.length > 0;
  const formValues = nodes.map((node) => String(node.value));
  return (
    <BaseField.Control
      value={formValues.join(',')}
      disabled={disabled}
      render={(controlProps) => (
        <>
          {renderTrigger(
            <button
              type="button"
              id={controlProps.id}
              // 名前はラベル、続けて選んだ値（または見本の文字）を読む
              aria-labelledby={[controlProps['aria-labelledby'], valueId].filter(Boolean).join(' ')}
              aria-describedby={field?.describedBy}
              aria-required={field?.required || undefined}
              aria-disabled={blocking || undefined}
              aria-readonly={readOnly || undefined}
              aria-busy={field?.loading || undefined}
              disabled={disabled}
              data-slot="control"
              data-field-readonly={readOnly || undefined}
              className={controlBox({
                className: [
                  'text-left',
                  chips && 'h-auto min-h-(--spacing-control) flex-wrap py-(--spacing)',
                  blocking ? 'cursor-progress' : readOnly ? 'cursor-default' : 'cursor-pointer',
                  OWN_FOCUS[color],
                  showClear && selectClearTrigger,
                  className,
                ],
              })}
            >
              <span id={valueId} className="flex min-w-0 flex-1">
                <TreeSelectValueText
                  nodes={nodes}
                  multiple={multiple}
                  valueDisplay={valueDisplay}
                  pathVariant={pathVariant}
                  multipleDisplay={multipleDisplay}
                  placeholder={placeholder}
                  color={color}
                  disabled={disabled || blocking}
                />
              </span>
              {/* ▼ は押せない意味の説明（塗りのないアイコン — 原則8）。ボタン全体が押せる。Select の ▼ と同じ色 */}
              <span
                aria-hidden
                className={cn(
                  'flex shrink-0 group-data-disabled/field:text-fg-subtle group-data-[loading=blocking]/field:text-fg-subtle',
                  readOnly ? 'text-fg-subtle' : 'text-fg-muted'
                )}
              >
                <CaretDownIcon />
              </span>
            </button>
          )}
          {/* 検証に使う input（Base UI の Field.Control が持つ）。1 つ選ぶ形は、これがフォームに送る値も持つ */}
          <input
            ref={(element) => {
              const ref = controlProps.ref;
              if (typeof ref === 'function') ref(element);
              else if (ref) (ref as { current: HTMLInputElement | null }).current = element;
              if (typeof inputRef === 'function') inputRef(element);
              else if (inputRef)
                (inputRef as { current: HTMLInputElement | null }).current = element;
            }}
            type="hidden"
            // Base UI の Field.Control は、Field.Root の name を render の props に入れる（型の HTMLProps には無い）
            name={multiple ? undefined : (controlProps as { name?: string }).name}
            form={form}
            value={formValues.join(',')}
            disabled={disabled}
          />
          {/* 複数選ぶ形は、同じ名前で 1 つずつ送る（Select の multiple と同じ） */}
          {multiple &&
            formValues.map((value) => (
              <input
                key={value}
                type="hidden"
                name={(controlProps as { name?: string }).name}
                form={form}
                value={value}
                disabled={disabled}
              />
            ))}
        </>
      )}
    />
  );
}

// 欄に出す文。値がないときは見本の文字
function TreeSelectValueText({
  nodes,
  multiple,
  valueDisplay,
  pathVariant,
  multipleDisplay,
  placeholder,
  color,
  disabled,
}: {
  nodes: TreeNode[];
  multiple: boolean;
  valueDisplay: TreeSelectValueDisplay;
  pathVariant: TreeSelectPathVariant;
  multipleDisplay: TreeSelectMultipleDisplay;
  placeholder: string;
  color: ListboxColor;
  disabled: boolean;
}): ReactNode {
  if (nodes.length === 0)
    return <span className="min-w-0 truncate text-(color:--field-placeholder)">{placeholder}</span>;
  if (multiple) {
    if (multipleDisplay === 'chips')
      return (
        <ComboboxTriggerChips
          values={nodes.map((node) => node.value)}
          labelOf={new Map(nodes.map((node) => [node.value, node.label]))}
          color={color}
          chipSize="md"
          disabled={disabled}
        />
      );
    return <span className="min-w-0 truncate">{nodes.map((node) => node.label).join('、')}</span>;
  }
  const [node] = nodes as [TreeNode];
  const parents = valueDisplay === 'last' ? [] : ancestorsOf(node);
  if (parents.length === 0) return <span className="min-w-0 truncate">{node.label}</span>;
  // パス。長いときは親の側から省き、選んだ行の名前を残す
  //   親と区切りは pathVariant で淡くする（軸 643）。押せない欄では淡くしない（押せない文字の色より親だけ濃く見えるため）
  return (
    <span className="flex min-w-0">
      <span
        data-slot="tree-select-path"
        className={cn('min-w-0 truncate', pathVariant === 'muted' && !disabled && 'text-fg-muted')}
      >
        {parents.map((parent) => parent.label).join(PATH_SEPARATOR)}
      </span>
      <span
        className={cn(
          'shrink-0 whitespace-pre',
          pathVariant === 'muted' && !disabled && 'text-fg-muted'
        )}
      >
        {PATH_SEPARATOR}
      </span>
      <span className="max-w-full shrink-0 truncate">{node.label}</span>
    </span>
  );
}
