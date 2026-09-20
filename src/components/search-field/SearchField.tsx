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

/** 虫眼鏡の置き方。inline: 塗りのない印を本体の内側に置く、none: 置かない */
export type SearchFieldIcon = 'inline' | 'none';

export interface SearchFieldProps extends Omit<
  TextFieldProps,
  'type' | 'value' | 'defaultValue' | 'onValueChange' | 'prefix' | 'suffix'
> {
  /** 値（制御するとき）。onValueChange と組にする */
  value?: string;
  /** はじめの値（制御しないとき） */
  defaultValue?: string;
  /** 値が変わったとき。消去のボタンと Esc で消したときも '' で呼ぶ */
  onValueChange?: (value: string) => void;
  /** 消去のボタンか Esc で値を消したとき。onValueChange('') のあとに呼ぶ */
  onClear?: () => void;
  /**
   * 虫眼鏡の置き方。inline は塗りのない印を本体の内側に置き、none は置きません。
   * 虫眼鏡は検索の欄だと伝える印で、押せません。グレー地の塊は押せるボタンの印なので、虫眼鏡には使いません
   * @default 'inline'
   */
  icon?: SearchFieldIcon;
  /**
   * 欄の前に付くもの。icon が none のときだけ置けます（虫眼鏡と同じ場所のため）
   */
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
  onClear,
  icon = 'inline',
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
    onClear?.();
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

  const iconNode =
    icon === 'inline' ? (
      // 押すと入力欄にフォーカスが移るよう、prefix の文字と同じ印（data-slot）を付ける。見た目は塗りのない印
      <span
        aria-hidden
        data-slot="field-addon"
        className="flex shrink-0 items-center ps-[calc(var(--spacing-control-x)-var(--field-border-width))] text-fg-muted group-data-disabled/field:text-(color:--color-on-field-disabled) [&+input]:ps-(--search-field-icon-gap)"
      >
        <MagnifyingGlassIcon />
      </span>
    ) : (
      prefix
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
