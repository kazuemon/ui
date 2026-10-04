import type { FieldMessage, InputFieldProps } from '../field/input-field-props';
import type { ListboxValue } from './use-listbox-option';

// 選ぶ欄（Select・Combobox・Autocomplete・TagsInput）の外枠（Field）が受け持つ props のうち、4 つで同じもの
//   押せない・名前・読み込み・成功の文は、選択肢か候補か、▼ があるかで文が変わるので、部品ごとに書く
//   validate は TagsInput だけ受け取る値（タグの並び）が違うので、ほかの 3 つが Pick に足す

/** 選ぶ欄の外枠が受け持つ props（4 つの部品で同じもの） */
export interface ListboxFieldProps extends Pick<
  InputFieldProps,
  | 'label'
  | 'accessibleName'
  | 'size'
  | 'caption'
  | 'captionPlacement'
  | 'infoText'
  | 'validationMode'
  | 'validationDebounceTime'
  | 'required'
  | 'requiredMark'
  | 'optionalMark'
  | 'labelPlacement'
  | 'labelVariant'
  | 'narrowLabelPlacement'
> {
  /**
   * エラーの内容。本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする
   * シートでは、見出しのヘルプテキストの下にも同じ行を出す（浮かぶ選択肢には出さない）
   */
  errorText?: FieldMessage;
  /**
   * 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない
   * errorText と両方あるときは、エラーの行の下に出す
   * シートでは、見出しのヘルプテキストの下にも同じ行を出す（errorText と同じ。両方あるときはエラー → 警告）
   */
  warningText?: FieldMessage;
  /** 欄の外枠（ラベル・本体・下の行をまとめた縦の並び）に付きます */
  className?: string;
}

/** 読み込みが終わったときに知らせる文の既定（選択肢から選ぶ欄: Select・Combobox） */
export const defaultLoadedOptionsText = (count: number) => `${count} 件の選択肢`;
/** 読み込みが終わったときに知らせる文の既定（候補を出す欄: Autocomplete・TagsInput） */
export const defaultLoadedSuggestionsText = (count: number) => `${count} 件の候補`;

/**
 * Base UI から来た値を onValueChange に渡す
 * 値の型は multiple の有無で決まるので（SelectValue・ComboboxValue）、Base UI 側の広い型からここで橋渡しする
 */
export function emitListboxValue(
  onValueChange: (value: never) => void,
  next: ListboxValue | ListboxValue[] | null
) {
  (onValueChange as (value: ListboxValue | ListboxValue[] | null) => void)(next);
}
