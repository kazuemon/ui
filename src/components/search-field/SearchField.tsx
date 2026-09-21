'use client';

import { type ReactNode, useState } from 'react';

import { TextField, type TextFieldProps } from '../text-field/TextField';
import { FieldClearButton } from '../../internal/field/FieldClearButton';
import { MagnifyingGlassIcon } from '../../internal/icons';
import { useFormSubmittingLock } from '../../internal/form-context';

// Base UI の input が渡すイベント（preventBaseUIHandler を持つ）
type InputEventOf<K extends 'onChange' | 'onKeyDown'> = Parameters<
  NonNullable<TextFieldProps[K]>
>[0];

export interface SearchFieldProps extends Omit<TextFieldProps, 'type' | 'prefix' | 'suffix'> {
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
}

/**
 * 検索の語を打つ欄。値があるあいだ、右端に消去のボタンを出し、Esc でも消せます
 * 実行（「検索」）のボタンは欄の外に置きます。Enter はフォームを送ります
 */
export function SearchField({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onCleared,
  hideSearchIcon = false,
  prefix,
  className,
  disabled,
  readOnly,
  loading,
  loadingBehavior,
  onChange,
  onKeyDown,
  ...props
}: SearchFieldProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = valueProp ?? innerValue;
  const formLock = useFormSubmittingLock();
  // 値を変えるもの（消去のボタン・Esc）は、欄と一緒に止める（design/adr/0168）
  const blocking = (loading && loadingBehavior === 'blocking') || formLock.blocking;
  const locked = disabled || readOnly || blocking;

  const change = (next: string) => {
    if (valueProp === undefined) setInnerValue(next);
    onValueChange?.(next);
  };
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
    <TextField
      {...props}
      type="search"
      enterKeyHint={props.enterKeyHint ?? 'search'}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      readOnly={readOnly}
      loading={loading}
      loadingBehavior={loadingBehavior}
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
          disabled={disabled || (loading && loadingBehavior === 'blocking')}
        />
      }
    />
  );
}
