'use client';

// このファイルは @base-ui/react/internals/form-context を読みます（useFormFieldErrors）。
// Form の errors（サーバーのエラーなど）を読む形が、公開の部位（BaseField.Validity など）に無いためです
// （design/adr/0255）。公開 API に無いので internals を読む。Base UI を上げるときに確かめる
import { Field as BaseField } from '@base-ui/react/field';
import type { FieldValidityState } from '@base-ui/react/field';
import { useFormContext } from '@base-ui/react/internals/form-context';
import { type ReactNode, useContext, useId, useState } from 'react';

import { FieldMark, type FieldMarkProps } from './FieldMark';
import { fieldStyles } from './field-styles';
import { FormSubmitContext, useFormSubmittingLock } from '../form-context';
import { CheckCircleIcon, CheckIcon, InfoIcon, WarningCircleIcon, WarningIcon } from '../icons';
import { LoadingBar, Spinner } from '../../components/loading/Loading';

/**
 * 欄の検証のタイミング（design/adr/0255）。Base UI の Form・Field.Root の validationMode と同じ意味
 * onSubmit（既定）は送信したときだけ、onBlur は欄を離れたとき、onChange は打つたびに確かめる
 */
export type FieldValidationMode = 'onSubmit' | 'onBlur' | 'onChange';

/**
 * Field の検証の関数（design/adr/0255）。Base UI の Field.Root の validate と同じ形ですが、
 * Base UI の props の型は継がず、ここで宣言します（design/adr/0250）
 * いまの値とフォーム全体の値を受け取り、正しくないときはエラーの文（複数あれば配列）を返します。
 * 何も返さない・null・空文字・空配列は「正しい」とみなします。非同期の関数も使えます
 */
export type FieldValidate = (
  value: unknown,
  formValues: Record<string, unknown>
) => string | string[] | null | void | Promise<string | string[] | null | void>;

/**
 * Form の errors（design/adr/0255）を読みます。@base-ui/react の公開の部位には Form の errors を読む形がないため
 * （BaseField.Validity の error・errors は欄の validate・ネイティブの制約だけを表し、Form の errors とは合流しません。
 * 合流させているのは Base UI 自身の内部の Field.Error だけです）、内部の FormContext を読みます
 * （@base-ui/react/internals/form-context）。Base UI を上げるとき、この internals の形が変わっていないか確かめてください
 */
export function useFormFieldErrors(): Record<string, string | string[]> {
  return useFormContext().errors;
}

/**
 * Base UI が見つけた、この欄のエラー（Form の errors・validate の結果）を1つの ReactNode にまとめます（design/adr/0255）
 * name・disabled は呼び出し側の props をそのまま渡します。formErrors は useFormFieldErrors()、validity は
 * BaseField.Validity の render prop（公開 API）から渡します。フックではないので、render prop の中でも呼べます
 * Form の errors（サーバーのエラーなど）は validate の結果より勝ちます（Base UI の Field.Error と同じ順 — 二重に出さない）
 */
export function mergeBaseFieldError({
  name,
  disabled,
  formErrors,
  validity,
}: {
  name: string | undefined;
  disabled: boolean | undefined;
  formErrors: Record<string, string | string[]>;
  validity: FieldValidityState;
}): ReactNode {
  if (disabled) return undefined;
  const formError = name && Object.hasOwn(formErrors, name) ? formErrors[name] : null;
  if (formError && (!Array.isArray(formError) || formError.length)) return messageOf(formError);
  if (validity.errors.length > 1) return messageOf(validity.errors);
  return validity.error || undefined;
}

function messageOf(value: string | string[]): ReactNode {
  if (!Array.isArray(value)) return value;
  if (value.length <= 1) return value[0];
  return (
    <ul>
      {value.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

/** キャプション（ヘルプテキスト）の場所。top: ラベルと本体のあいだ（既定）、bottom: 本体の下 */
export type CaptionPlacement = 'top' | 'bottom';

/**
 * 待っているあいだ（loading）の欄の扱い（design/adr/0042）
 * non-blocking: 止めない。書き換えられ、Select は開ける（既定）
 * blocking: 止める。押せない欄と同じ見た目にし、書き換えられない・開けない。フォーカスは外さない
 */
export type FieldLoadingBehavior = 'blocking' | 'non-blocking';

/** 欄の右端に置く回る円。色は Select の ▼ と同じ（--color-fg-muted）。止めているあいだも薄くしない */
export function FieldSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="field-spinner"
      className={['flex shrink-0 items-center text-fg-muted', className].filter(Boolean).join(' ')}
    >
      <Spinner />
    </span>
  );
}

/**
 * 成功のとき欄の右端に置くチェック（ADR-0058 の C）。回る円と同じ場所に置く
 * 出すかどうかは、部品の hideSuccessMark で決める。読み上げは下の成功の行が担うので、読ませない
 */
export function FieldSuccessMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="field-success-mark"
      className={['flex shrink-0 items-center text-fg-success', className]
        .filter(Boolean)
        .join(' ')}
    >
      <CheckIcon />
    </span>
  );
}

/**
 * 欄の下端（枠線の内側）に流す線。色は本文の色の 60%（グレーのボタンの線と同じ）
 * 本体（relative）の中に置き、本体の角丸で切り抜く
 */
export function FieldLoadingBar() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[calc(var(--radius-control)-var(--field-border-width))]"
    >
      <LoadingBar className="bg-fg" />
    </span>
  );
}

/** 本体の下の行の種類。並びもこの順（重いものが上） */
export type MessageKind = 'error' | 'warning' | 'success' | 'info';

// 行のアイコンと文字の色（原則6: 情報は丸の「i」、成功は丸のチェック、警告は三角、危険は丸の「!」）
// 白地の文字: エラー --color-danger（6.71）、警告 --color-fg-warning（5.09）、成功 --color-fg-success（5.02）、情報 --color-fg-info（5.10）
const messageLook: Record<MessageKind, { Icon: typeof WarningIcon; tone: string }> = {
  error: { Icon: WarningCircleIcon, tone: 'text-fg-danger' },
  warning: { Icon: WarningIcon, tone: 'text-fg-warning' },
  success: { Icon: CheckCircleIcon, tone: 'text-fg-success' },
  info: { Icon: InfoIcon, tone: 'text-fg-info' },
};

// 本体の下の行の読み上げと動き（design/adr/0044）。種類ごとに、別々に持つ
interface MessageState {
  /** いまの文の見分け（文字のときはその文）。文がないときは null */
  key: string | null;
  /** 最後に見た、Form がフォーカスを移しに行った回数（送信・送信中が終わったとき） */
  focusCount: number;
  /** 送信（送信中が終わったときも）で出た（変わった）文。読み上げで知らせない（箱を aria-live="off" にする） */
  quiet: boolean;
  /** 文が出る・変わるたびに増やす。行を描き直して、読み上げに「足された」と伝える */
  generation: number;
  /** 閉じる動きのあいだ残す、最後の文 */
  last: ReactNode;
}

/**
 * 本体の下の行（エラー・警告・成功・情報）を包む箱（design/adr/0044）。文がなくてもいつも置き、読み上げの live region（polite）にする
 * 種類ごとに別の箱にし、渡されたものはすべて出す（エラー → 警告 → 成功 → 情報。design/adr/0041 の追記）
 * 読み上げ（polite・送信で出た文は off）と開閉の動きは、箱ごとに働く
 * 行のアイコンは文と並ぶので線は Regular（design/adr/0018）
 * Field の外（1つだけ置く Checkbox）でも使う。行の id を本体の aria-describedby につなぐのは使う側
 * className: 箱の置き方を足す（格子の中に置くときの列、上の間の打ち消しをやめる mt-0 など）
 */
export function FieldMessageLine({
  kind,
  content,
  id,
  className,
}: {
  kind: MessageKind;
  content: ReactNode;
  id: string;
  className?: string;
}) {
  const styles = fieldStyles();
  const open = Boolean(content);
  const text = typeof content === 'string' || typeof content === 'number' ? String(content) : '';
  const key = open ? text : null;
  // 読み上げ（design/adr/0044）: 行は、いつも置いた箱（aria-live="polite"）の中に出す。出たときと変わったときに、いまの読み上げのあとで読む
  //   送信で出た（変わった）文は知らせない。Form がフォーカスを移した先（最初のエラーの欄の説明か、エラーの一覧）で読むため
  //   送信中が終わった描画（送ったときの場所にフォーカスが残っていたとき）で出た文も同じ。Form がそこでもフォーカスを移すため
  //   Form の回数（focusCount）は、アプリがエラーを決めるのと同じ描画で増えるので、その描画で変わった文を「送信で出た」とみなす
  const focusCount = useContext(FormSubmitContext)?.focusCount ?? 0;
  const [state, setState] = useState<MessageState>(() => ({
    key,
    focusCount,
    quiet: false,
    generation: 0,
    last: open ? content : null,
  }));
  if (state.key !== key || state.focusCount !== focusCount) {
    const changed = state.key !== key;
    setState({
      key,
      focusCount,
      quiet: changed ? state.focusCount !== focusCount : state.quiet,
      generation: changed && key !== null ? state.generation + 1 : state.generation,
      last: open ? content : state.last,
    });
  }
  // 動き（design/adr/0044）: 行の高さと濃さを開き、閉じる。閉じるあいだは最後の文を残す（説明からは外し、読み上げでも隠す）
  const shown = open ? content : state.last;
  const { Icon, tone } = messageLook[kind];
  return (
    <div
      data-slot="field-message"
      data-kind={kind}
      data-open={open ? '' : undefined}
      aria-live={state.quiet ? 'off' : 'polite'}
      className={styles.messageRegion({ className })}
    >
      <div className={styles.messageClip()}>
        {shown ? (
          <div
            key={state.generation}
            id={open ? id : undefined}
            aria-hidden={open ? undefined : true}
            className={styles.message({ className: [styles.messageLine(), tone].join(' ') })}
          >
            <Icon className={styles.messageIcon()} />
            <span className="min-w-0">{shown}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface FieldProps extends FieldMarkProps {
  /** 本体の上に置く太字のラベル */
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない。省略してもレイアウトは崩れない */
  caption?: ReactNode;
  /** キャプションの場所。既定は top（ラベルのすぐ下）。bottom は本体の下で、エラー・警告はその下に足す */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。渡すとエラーの状態になり、本体の下に丸の「!」と赤い文字で出す */
  error?: ReactNode;
  /** error がなくても、欄をエラーの状態（赤い枠線・aria-invalid）にする。エラーの行は出さない。Textarea の文字数の上限を超えたときに使う */
  invalid?: boolean;
  /**
   * 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えず、エラーの状態にもしない
   * error と両方あるときは両方出す。エラーの行が上、警告の行がその下（design/adr/0041 の追記）
   */
  warning?: ReactNode;
  /**
   * 成功の内容（「使えるユーザー名です」など）。本体の下に丸のチェックと緑の文字で出す（ADR-0058）
   * 欄の枠線は変えない。エラーがあるときは、エラーの見た目を優先する
   */
  success?: ReactNode;
  /** 情報の内容（「全角の数字を半角に直しました」など）。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない（後半の軸 37） */
  info?: ReactNode;
  /** 押せない（Disabled）状態にする */
  disabled?: boolean;
  /** 待っている（確かめている・読み込んでいる）。root に data-loading（loadingBehavior の値）を付ける */
  loading?: boolean;
  /** 待っているあいだの欄の扱い。blocking では、本体を押せない欄と同じ見た目にする（controlBox）。既定は non-blocking */
  loadingBehavior?: FieldLoadingBehavior;
  className?: string;
  /**
   * 本体。関数を渡すと、キャプションと本体の下の行の id を、見た目の順（キャプション → エラー → 警告 → 成功 → 情報）で受け取る
   * 本体の aria-describedby の先に渡すと、読み上げの説明の順が、表示や消える順によらず見た目の順になる
   */
  children: ReactNode | ((describedBy: string | undefined) => ReactNode);
  /** ラベルを <label> で描くか。Select のように本体がボタンの部品では false にする */
  nativeLabel?: boolean;
  /**
   * キャプションを Base UI の説明（Field.Description）として登録するか（既定は true）
   * false では素の p で描き、id は children に渡す describedBy だけでつなぐ
   * 中に選択肢（Field.Item）を並べるグループ（RadioGroup・CheckboxGroup）では false にする。
   * 登録すると、グループの説明が選択肢1つずつの aria-describedby にも入り、同じ文が繰り返し読まれる（原則15: 見えている文字を、二度読ませない）
   */
  registerCaption?: boolean;
  /**
   * フォームの中でこの欄を識別する名前です。Base UI の Form の errors（サーバーのエラーなど）は、この名前で欄に届きます（design/adr/0255）
   */
  name?: string;
  /**
   * 値を確かめる関数です。正しくないときに返したエラーの文は、error（errorText）と同じ行に出します。error があるときは、そちらを優先します。
   * react-hook-form などのライブラリを使うときは、ライブラリの検証結果を Form の `errors` に渡し、`validate` は使いません（二重に検証しないため）
   */
  validate?: FieldValidate;
  /**
   * 検証のタイミングです。Form の validationMode より、この欄の指定が勝ちます
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * validationMode="onChange" のとき、validate を呼ぶまでの待ち時間（ミリ秒）です
   * @default 0
   */
  validationDebounceTime?: number;
}

/**
 * ラベル / 本体 / キャプションの3層（原則4）。フォーム部品の外枠
 * 並びは ラベル → キャプション → 本体 → エラー → 警告 → 成功 → 情報（captionPlacement="bottom" では キャプションが本体のすぐ下）
 * DOM の順も見た目の順と同じにする（design/adr/0041）
 * Form の送信中（submittingBehavior="blocking"）は、data-loading="blocking"（押せない欄の見た目）にする
 */
export function Field({
  label,
  caption,
  captionPlacement = 'top',
  error,
  invalid,
  warning,
  success,
  info,
  disabled,
  loading,
  loadingBehavior = 'non-blocking',
  required,
  requiredMark,
  optionalMark,
  className,
  children,
  nativeLabel = true,
  registerCaption = true,
  name,
  validate,
  validationMode,
  validationDebounceTime,
}: FieldProps) {
  const styles = fieldStyles();
  const id = useId();
  const formLock = useFormSubmittingLock();
  const captionId = `${id}caption`;
  const ids: Record<MessageKind, string> = {
    error: `${id}error`,
    warning: `${id}warning`,
    success: `${id}success`,
    info: `${id}info`,
  };
  // グループ（registerCaption=false）では、Base UI に説明として登録しない。
  // 登録すると Field.Item（中の選択肢）にも伝わり、グループの説明が1つずつの選択肢でも読まれる（原則15）
  const captionNode = caption ? (
    registerCaption ? (
      <BaseField.Description id={captionId} className={styles.caption()}>
        {caption}
      </BaseField.Description>
    ) : (
      <p id={captionId} className={styles.caption()}>
        {caption}
      </p>
    )
  ) : null;
  // 待っているあいだの見た目（design/adr/0042）。Form の送信中に止めるときも、止める見た目（印は出さない）
  const loadingState = formLock.blocking ? 'blocking' : loading ? loadingBehavior : undefined;
  return (
    <BaseField.Root
      name={name}
      validate={validate}
      validationMode={validationMode}
      validationDebounceTime={validationDebounceTime}
      invalid={error || invalid ? true : undefined}
      disabled={disabled || undefined}
      data-loading={loadingState}
      // 成功の見た目（後半の軸 37）。エラーのときはエラーを優先する
      data-success={success && !error ? '' : undefined}
      className={styles.root({ className })}
    >
      {/* data-slot="field-label": Form のエラーの一覧が、欄の名前として読む（design/adr/0044 の追記）
          印（必須・任意）はラベルの中に置く。ラベルが折り返すと一緒に折り返し、読み上げと一覧からは外れる */}
      <BaseField.Label
        data-slot="field-label"
        className={styles.label()}
        nativeLabel={nativeLabel}
        render={nativeLabel ? undefined : <div />}
      >
        {label}
        <FieldMark required={required} requiredMark={requiredMark} optionalMark={optionalMark} />
      </BaseField.Label>
      <FieldBody
        captionNode={captionNode}
        captionId={captionId}
        captionPlacement={captionPlacement}
        error={error}
        warning={warning}
        success={success}
        info={info}
        ids={ids}
        name={name}
        disabled={disabled}
      >
        {children}
      </FieldBody>
    </BaseField.Root>
  );
}

// BaseField.Root の子。BaseField.Validity（公開 API）で、Base UI が見つけた検証結果を読む
function FieldBody({
  captionNode,
  captionId,
  captionPlacement,
  error,
  warning,
  success,
  info,
  ids,
  name,
  disabled,
  children,
}: {
  captionNode: ReactNode;
  captionId: string;
  captionPlacement: CaptionPlacement;
  error: ReactNode;
  warning: ReactNode;
  success: ReactNode;
  info: ReactNode;
  ids: Record<MessageKind, string>;
  name: string | undefined;
  disabled: boolean | undefined;
  children: FieldProps['children'];
}) {
  const formErrors = useFormFieldErrors();
  return (
    <BaseField.Validity>
      {(validity) => {
        // Base UI の検証（validate・Form の errors）が見つけたエラー。error（errorText）があれば、そちらを優先する
        const baseError = mergeBaseFieldError({ name, disabled, formErrors, validity });
        const messages: Record<MessageKind, ReactNode> = {
          error: error ?? baseError,
          warning,
          success,
          info,
        };
        const kinds = Object.keys(messages) as MessageKind[];
        // 警告・成功・情報も説明につなぐが、欄をエラーの状態にしない
        const describedBy =
          [captionNode && captionId, ...kinds.map((kind) => (messages[kind] ? ids[kind] : null))]
            .filter(Boolean)
            .join(' ') || undefined;
        return (
          <>
            {captionPlacement === 'top' && captionNode}
            {typeof children === 'function' ? children(describedBy) : children}
            {captionPlacement === 'bottom' && captionNode}
            {kinds.map((kind) => (
              <FieldMessageLine key={kind} kind={kind} content={messages[kind]} id={ids[kind]} />
            ))}
          </>
        );
      }}
    </BaseField.Validity>
  );
}
