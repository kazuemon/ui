import type { MouseEvent } from 'react';

import { FieldAddonButton } from '../../components/field-addon/FieldAddon';
import { useFormSubmittingLock } from '../form-context';
import { XIcon } from '../icons';

export interface FieldClearButtonProps {
  /** 欄のいまの値。空なら出さない */
  value: string;
  /** 押したとき。値を空にするのは呼び出し側（値の状態は呼び出し側が持つ） */
  onClear: () => void;
  /** 欄が読み取り専用。値を変えられない欄には消す操作がないので、出さない */
  readOnly?: boolean;
  /**
   * 欄を止めている（押せない・loadingBehavior="blocking"）。押せない形で出す。
   * Form の送信中（blocking）はこの部品が自分で読む
   */
  disabled?: boolean;
  /** 読み上げの名前 */
  'aria-label'?: string;
}

/**
 * 入力内容を消すボタン（suffix に置く）。SearchField・Combobox などで共有する
 * 値を変えるボタンなので、欄を止めているあいだは一緒に止める（design/adr/0168）
 *   読み取り専用: 出さない。値を変えられない欄に、値を変える操作は置かない
 *   押せない・待っているあいだ止める・Form の送信中: 押せない形で出す。止めるたびに欄の幅が変わらないように
 * 押したら、欄の input にフォーカスを戻す（ボタンは値が空になると消えるので、フォーカスの行き先を残す）
 */
export function FieldClearButton({
  value,
  onClear,
  readOnly,
  disabled,
  'aria-label': ariaLabel = '入力内容を消去',
}: FieldClearButtonProps) {
  const formLock = useFormSubmittingLock();
  if (value === '' || readOnly) return null;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const input = event.currentTarget
      .closest('[data-slot="control"]')
      ?.querySelector<HTMLInputElement>('input');
    onClear();
    input?.focus();
  };
  return (
    <FieldAddonButton
      aria-label={ariaLabel}
      // 押せない欄では FieldAddonButton が欄の disabled を受け継ぐ。止めているあいだの分をここで足す
      disabled={disabled || formLock.blocking || undefined}
      onClick={handleClick}
    >
      <XIcon standalone />
    </FieldAddonButton>
  );
}
