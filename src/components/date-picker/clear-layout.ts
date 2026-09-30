'use client';

import { createContext } from 'react';

// 値を消すボタン（clearable）の置き方。軸 392 の 2 ラウンド目で比べている途中の切り替え（公開しない）
//   決定: before-trigger・hide（ADR は記録のときに振る）。記録のときに部品で畳んで、このファイルを消す
//   並びは DOM の順で変える（CSS の order で入れ替えると、Tab の順と見た目の順がずれるため）。だからトークンではなく、ここで切り替える
//   position   end: 右端（暦のボタンが内側へずれる。Combobox の ▼ と × と同じ — ADR-0216）
//              before-trigger: 暦のボタンの左。暦のボタンは右端から動かない
//   whenEmpty  hide: 値がないときは出さない
//              disabled: 値がないときも押せない形で出す（場所がいつも同じ。止めた欄の消去のボタンと同じ考え — FieldClearButton）
export interface DatePickerClearLayout {
  position: 'end' | 'before-trigger';
  whenEmpty: 'hide' | 'disabled';
}

export const DatePickerClearLayoutContext = createContext<DatePickerClearLayout>({
  position: 'before-trigger',
  whenEmpty: 'hide',
});
