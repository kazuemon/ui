'use client';

import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { FieldAddonButton } from '../field-addon/FieldAddon';
import { TextField, type TextFieldProps } from '../text-field/TextField';
import { EyeIcon, EyeSlashIcon } from '../../internal/icons';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'suffix'> {
  /**
   * ブラウザとパスワード管理の補完。ログインの欄は current-password、登録や変更で新しく決める欄は new-password にします
   * @default 'current-password'
   */
  autoComplete?: string;
  /**
   * 表示の切り替えのボタンの、読み上げの名前。押しているかは aria-pressed で伝えるので、名前は変えません
   * @default 'パスワードを表示'
   */
  toggleName?: string;
}

function inputOf(button: HTMLElement | null) {
  return button?.closest('[data-slot="control"]')?.querySelector('input') ?? null;
}

/**
 * パスワードを打つ欄。右端のボタンで伏せ字と文字の表示を切り替えます
 * 切り替えは見え方だけを変えるので、欄を止めているあいだ（待っているあいだ・送信中・読み取り専用）も押せます。押せない欄では押せません
 * フォームを送ると、伏せ字に戻します
 */
export function PasswordField({
  autoComplete = 'current-password',
  toggleName = 'パスワードを表示',
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 送ったら伏せ字に戻す。画面に残った文字を、あとから覗かれないように
  useEffect(() => {
    const form = inputOf(buttonRef.current)?.form;
    if (!form) return undefined;
    const hide = () => setVisible(false);
    form.addEventListener('submit', hide);
    return () => form.removeEventListener('submit', hide);
  }, []);

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    // 打っている途中にマウスで押したときは、フォーカスを欄に残し、続けて打てるようにする
    if (document.activeElement === inputOf(event.currentTarget)) event.preventDefault();
  };
  // 切り替えても、カーソルの位置を保つ。type を変えると位置が失われるブラウザがあるので、切り替えたあとに戻す
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const input = inputOf(event.currentTarget);
    const start = input?.selectionStart ?? null;
    const end = input?.selectionEnd ?? null;
    flushSync(() => setVisible((current) => !current));
    // 欄にフォーカスがあるときだけ戻す（フォーカスのない欄に選択を置くと、フォーカスを奪うブラウザがある）
    if (input && start !== null && end !== null && document.activeElement === input) {
      input.setSelectionRange(start, end);
    }
  };

  return (
    <TextField
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      {...props}
      autoComplete={autoComplete}
      type={visible ? 'text' : 'password'}
      suffix={
        <FieldAddonButton
          ref={buttonRef}
          aria-label={toggleName}
          aria-pressed={visible}
          onMouseDown={handleMouseDown}
          onClick={toggle}
        >
          {visible ? <EyeSlashIcon standalone /> : <EyeIcon standalone />}
        </FieldAddonButton>
      }
    />
  );
}
