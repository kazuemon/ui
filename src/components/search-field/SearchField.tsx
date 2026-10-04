'use client';

import { type ReactNode, useState } from 'react';

import {
  type TextFieldBaseProps,
  TextFieldControl,
  type TextFieldControlProps,
} from '../text-field/TextField';
import { Field, useFieldState } from '../../internal/field/Field';
import { FieldClearButton } from '../../internal/field/FieldClearButton';
import { useFormReset } from '../../internal/field/use-form-reset';
import { type FieldNamed, splitFieldProps } from '../../internal/field/input-field-props';
import { MagnifyingGlassIcon } from '../../internal/icons';
import { useMergedRefs } from '../../internal/use-merged-refs';

// Base UI の input が渡すイベント（preventBaseUIHandler を持つ）
type InputEventOf<K extends 'onChange' | 'onKeyDown'> = Parameters<
  NonNullable<TextFieldBaseProps[K]>
>[0];

// 検索の欄が持たない TextField の props。消すボタンはいつも出し、文字数は数えない
type NotInSearch = 'clearable' | 'maxCount' | 'overCountInvalid' | 'warnRemaining' | 'showCount';

/** 検索の欄だけが持つ props。外枠（SearchField）と本体（SearchFieldControl）が同じものを受けます */
interface SearchOwnProps {
  /** 値（制御）。消去のボタンと Esc で消したときも onValueChange('') で知らせます */
  value?: string;
  /** はじめの値（非制御） */
  defaultValue?: string;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string) => void;
  /** 消去のボタンか Esc で値を消したあとに呼びます。onValueChange('') のあとです */
  onCleared?: () => void;
  /**
   * 本体の内側の虫眼鏡を隠すか。虫眼鏡は検索の欄だと伝える印で、押せません。
   * グレー地の塊は押せるボタンの印なので、虫眼鏡には使いません
   * @default false
   */
  hideSearchIcon?: boolean;
  /** 欄の前に付くもの。hideSearchIcon のときだけ置けます（虫眼鏡と同じ場所のため） */
  prefix?: ReactNode;
  /**
   * 消去のボタンの読み上げの名前
   * @default '入力内容を消去'
   */
  clearName?: string;
}

export interface SearchFieldBaseProps
  extends
    Omit<TextFieldBaseProps, 'type' | 'prefix' | 'suffix' | NotInSearch | keyof SearchOwnProps>,
    SearchOwnProps {}

/** SearchField の本体（SearchFieldControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface SearchFieldControlProps
  extends
    Omit<TextFieldControlProps, 'type' | 'prefix' | 'suffix' | NotInSearch | keyof SearchOwnProps>,
    SearchOwnProps {}

/** SearchField の props。label か accessibleName のどちらかが要ります */
export type SearchFieldProps = FieldNamed<SearchFieldBaseProps>;

/**
 * 検索の欄の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 値があるあいだ右端に消去のボタンを出し、Esc でも消せます。押せない・止めている状態は、包む Field から受け取ります
 */
export function SearchFieldControl({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onCleared,
  hideSearchIcon = false,
  prefix,
  clearName,
  className,
  readOnly,
  onChange,
  onKeyDown,
  ...props
}: SearchFieldControlProps) {
  const field = useFieldState();
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = valueProp ?? innerValue;
  const disabled = field?.disabled ?? false;
  // 値を変えるもの（消去のボタン・Esc）は、欄と一緒に止める（design/adr/0168）
  const locked = disabled || readOnly || (field?.blocking ?? false);

  const change = (next: string) => {
    if (valueProp === undefined) setInnerValue(next);
    onValueChange?.(next);
  };
  // 値を渡されないときは、form を戻したらはじめの値に戻す（消すボタンが出たまま残らないように）
  const resetRef = useFormReset(() => change(defaultValue ?? ''), valueProp === undefined);
  const inputRef = useMergedRefs(props.ref, resetRef);
  const clear = () => {
    change('');
    onCleared?.();
  };

  const handleChange = (event: InputEventOf<'onChange'>) => {
    onChange?.(event);
    change(event.target.value);
  };
  const handleKeyDown = (event: InputEventOf<'onKeyDown'>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    // Esc で消す。空のときは何もしない（Dialog を閉じるなど、外の Esc に任せる）
    // ブラウザの既定（type="search" の Esc）でも消えるので、既定を止めて、消すのはこちらだけにする
    if (event.key === 'Escape' && value !== '' && !locked) {
      event.preventDefault();
      event.stopPropagation();
      clear();
    }
  };

  const iconNode = hideSearchIcon ? (
    prefix
  ) : (
    // 押すと入力欄にフォーカスが移るよう、prefix の文字と同じ印（data-slot）を付ける。見た目は塗りのない印
    <span
      aria-hidden
      data-slot="field-addon"
      className="flex shrink-0 items-center ps-[calc(var(--spacing-control-x)-var(--field-border-width))] text-fg-muted group-data-disabled/field:text-(color:--color-on-field-disabled) [&+input]:ps-(--search-field-icon-gap)"
    >
      <MagnifyingGlassIcon />
    </span>
  );

  return (
    <TextFieldControl
      {...props}
      ref={inputRef}
      type="search"
      enterKeyHint={props.enterKeyHint ?? 'search'}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      // ブラウザの既定の ×（WebKit・Blink）は消し、消去のボタンを出す
      className={[
        '[&_input::-webkit-search-cancel-button]:appearance-none [&_input::-webkit-search-decoration]:appearance-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      prefix={iconNode}
      suffix={
        <FieldClearButton
          value={value}
          onClear={clear}
          readOnly={readOnly}
          disabled={disabled}
          aria-label={clearName}
        />
      }
    />
  );
}

/**
 * 検索の語を打つ欄。値があるあいだ、右端に消去のボタンを出し、Esc でも消せます
 * 実行（「検索」）のボタンは欄の外に置きます。Enter はフォームを送ります
 */
export function SearchField(props: SearchFieldProps) {
  const [field, control] = splitFieldProps(props as SearchFieldBaseProps);
  return <Field {...field}>{() => <SearchFieldControl {...control} />}</Field>;
}
