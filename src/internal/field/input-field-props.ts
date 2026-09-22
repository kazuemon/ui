import type { ReactNode } from 'react';

import type {
  CaptionPlacement,
  FieldLoadingBehavior,
  FieldValidate,
  FieldValidationMode,
} from './Field';
import type { FieldMarkProps } from './FieldMark';
import type { AddonShape } from '../../components/field-addon/field-addon-context';
import type { LoadingIndicator } from '../../components/loading/Loading';

/**
 * 欄の下に出す状態メッセージ（errorText・warningText・successText・infoText）の型。
 * 文を渡すと出ます。真偽値は受けません（design/adr/0242）
 */
export type FieldMessage = Exclude<ReactNode, boolean>;

/** 文字を打つ欄（TextField・NumberField・DateField など）に共通の props */
export interface InputFieldProps extends FieldMarkProps {
  /** 本体の上に置く見出し。読み上げの名前にもなります */
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * 空の欄に出す見本の文字。値と見分けられるよう、「例: かずえもん」のように、見本だと分かる書き方にします。
   * 色は、文字の基準（4.5:1）を保つ淡さまでしか淡くできないため、書き方でも値と区別します
   */
  placeholder?: string;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下（design/adr/0041）
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。渡すと本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする */
  errorText?: FieldMessage;
  /** 警告の内容。渡すと本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない。errorText と両方あるときは、エラーの行の下に出す */
  warningText?: FieldMessage;
  /**
   * 成功の内容（「使えるユーザー名です」など）。渡すと本体の下に丸のチェックと緑の文字で出し、欄の右端（回る円の場所）にもチェックを置きます。
   * 欄の枠線は変えません。errorText があるときは、欄の見た目はエラーを優先します
   */
  successText?: FieldMessage;
  /**
   * 成功のとき、欄の右端に置くチェックを隠すか。下の行だけを出したいときに付けます
   * @default false
   */
  hideSuccessMark?: boolean;
  /** 情報の内容（「全角の数字を半角に直しました」など）。渡すと本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  infoText?: FieldMessage;
  /** ラベル・本体・キャプション・下の行を包むいちばん外の要素に付きます */
  className?: string;
  /**
   * 入力欄の前に付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す。
   * 文字は入力欄の説明としてまとめて読み上げられ、文字そのものは読み上げから外れる。`aria-label` などで同じ文を重ねると二重に読まれる
   */
  prefix?: ReactNode;
  /**
   * 入力欄の後ろに付くもの。文字を渡すとグレーのラベルになる。ボタンは FieldAddonButton を渡す。
   * 文字は prefix と同じく、入力欄の説明としてまとめて読み上げられる。
   * suffix のボタンは、パスワードの表示・非表示や入力内容の消去のように、入力欄の値に作用するものに限ります。
   * 検索のように実行するボタンは、欄の外に色付き・枠線のボタンとして置きます（design/adr/0168）
   */
  suffix?: ReactNode;
  /**
   * prefix・suffix の形。attached は本体の端に接する塊、floating は本体の内側に 4px 浮かせます。
   * floating は、欄の外形を入力欄だけのときと同じにしたいときや、グレーを軽く見せたいときに使います（design/adr/0035）
   * @default 'attached'
   */
  addonShape?: AddonShape;
  /**
   * 待っている（値を確かめている・送っているなど）。印を出し、aria-busy を付けます（design/adr/0042）
   * フォーム全体を送っているあいだは、欄ごとに渡さず、Form の submitting を使います
   * @default false
   */
  loading?: boolean;
  /**
   * 待っているあいだの欄の扱い（design/adr/0042）
   * non-blocking は書き換えられたままにします。blocking は押せない欄と同じ見た目にし、
   * 書き換えられなくします（readOnly・aria-disabled）。どちらもフォーカスは外さず、枠線と印は薄くしません
   * @default 'non-blocking'
   */
  loadingBehavior?: FieldLoadingBehavior;
  /**
   * 待っているあいだの印。spinner は右端（suffix の前）に回る円、bar は下端に流れる線です
   * @default 'spinner'
   */
  loadingIndicator?: LoadingIndicator;
  /**
   * 値を確かめる関数です（design/adr/0255）。いまの値とフォーム全体の値を受け取り、正しくないときはエラーの文
   * （複数あれば配列）を返します。何も返さない・null・空文字・空配列は「正しい」とみなします。非同期の関数も使えます。
   * 返したエラーの文は errorText と同じ行に出します。errorText があるときは、そちらを優先します。
   * react-hook-form などのライブラリを使うときは、ライブラリの検証結果を Form の `errors` に渡し、`validate` は使いません（二重に検証しないため）
   */
  validate?: FieldValidate;
  /**
   * 検証のタイミングです（design/adr/0255）。Form の validationMode より、この欄の指定が勝ちます
   * - `onSubmit`（既定）: フォームを送信したときに確かめます。以降は打つたびに確かめ直します
   * - `onBlur`: 欄を離れたときに確かめます
   * - `onChange`: 打つたびに確かめます
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * validationMode="onChange" のとき、validate を呼ぶまでの待ち時間（ミリ秒）です
   * @default 0
   */
  validationDebounceTime?: number;
}
