'use client';

import { Field as BaseField } from '@base-ui/react/field';
import {
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { FieldAddonButton } from '../field-addon/FieldAddon';
import { Field, FieldSpinner, useFieldState } from '../../internal/field/Field';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { useFormReset } from '../../internal/field/use-form-reset';
import { focusRing } from '../../internal/focus-styles';
import { CheckMarkIcon, PencilSimpleIcon, XIcon } from '../../internal/icons';
import { cn, tv } from '../../internal/tv';
import { useControlled } from '../../internal/use-controlled';
import { useMergedRefs } from '../../internal/use-merged-refs';

/**
 * 文字のときの鉛筆の出し方。subtle はふだん淡く置いて載せると濃く、hover は載せたときだけ出す
 */
export type EditableEditIndicator = 'subtle' | 'hover';

/** 欄の外へ出たとき（フォーカスが外れたとき）の扱い。commit は確定、cancel は取り消し */
export type EditableBlurBehavior = 'commit' | 'cancel';

// ふだんは文字、押すと入力欄（原則8: 編集できる欄はグレーの塗り）。入力欄は TextField・Textarea と同じ本体（controlBox）
// 文字と入力欄は同じ格子の 1 つの升に重ねる。左右の余白・枠線の幅・行の高さを入力欄とそろえ、切り替えても文字の位置を動かさない
//   文字の側は、入力欄の枠線と同じ幅の透明な線を持つ。複数行では、上下の余白も Textarea と同じ計算にする
// 文字のときの印は、hover で敷く入力欄のグレーの淡い面と、文字の後ろの鉛筆（文字と同じ大きさ、文字から 8px 離す）
// 書き換えているあいだは、TextField にフォーカスしたときと同じ（グレーの面＋フォーカスの枠線）
const editable = tv({
  slots: {
    root: [
      'grid w-full min-w-0 grid-cols-[minmax(0,1fr)]',
      // 1 行の高さは入力欄（--spacing-control）と同じ。複数行の上下の余白は Textarea と同じ（1 行のときの高さが入力欄と同じになる値）
      '[--editable-lh:var(--leading-input)]',
      '[--editable-py:calc((var(--spacing-control)-var(--editable-lh))/2-var(--field-border-width))]',
    ],
    preview: [
      'group/preview col-start-1 row-start-1 flex w-full min-w-0 items-center gap-2 rounded-control text-start',
      'min-h-(--spacing-control) border-(length:--field-border-width) border-transparent',
      'px-[calc(var(--spacing-control-x)-var(--field-border-width))] text-input text-fg',
      '[--spacing-icon:var(--spacing-icon-input)]',
      // 塗りは登録した変数 --control-bg で動かす（入力欄と同じ。ADR-0112）
      'bg-(color:--control-bg) [transition-property:--control-bg,border-color,outline-color,outline-offset] duration-(--duration-field) ease-press [--control-bg:transparent] motion-reduce:transition-none',
      ...focusRing,
      // エラーのときは、入力欄と同じく赤い枠線と淡い赤の塗り（原則2）。押せないときは引かない（Field が --field-invalid-border を置かない）
      'group-data-invalid/field:border-[color:var(--field-invalid-border,transparent)] group-data-invalid/field:[--control-bg:var(--color-field-invalid)]',
    ],
    previewText: 'min-w-0',
    // 鉛筆。ふだんは淡く、hover で濃くする（DataTable の並べ替えの印と同じ見せ方）
    // 鉛筆は文字と同じ大きさ。濃さは editIndicator で選ぶ（ふだんの濃さ --editable-cue-icon-idle、載せる・キーボードで止まると濃く）
    previewIcon: [
      'inline-flex shrink-0 text-fg-subtle opacity-(--editable-cue-icon-idle)',
      'transition-opacity duration-(--duration-field) ease-press motion-reduce:transition-none',
    ],
    box: 'col-start-1 row-start-1',
    input:
      'h-full w-full min-w-0 bg-transparent outline-none placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
  },
  variants: {
    // 押して書き換えられるときだけ、文字のときの印を出す
    interactive: {
      true: {
        preview: [
          'cursor-text hover:[--control-bg:var(--color-field)]',
          'group-data-invalid/field:hover:[--control-bg:var(--color-field-invalid)]',
        ],
        previewIcon: 'group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100',
      },
      false: { previewIcon: 'hidden' },
    },
    multiline: {
      true: {
        preview: 'items-start py-(--editable-py) leading-(--editable-lh) whitespace-pre-wrap',
        previewText: 'break-words',
        // 鉛筆は 1 行目の真ん中にそろえる
        previewIcon: 'h-(--editable-lh) items-center',
        box: 'h-auto items-stretch',
        input:
          'block [field-sizing:content] resize-none overflow-hidden py-(--editable-py) leading-(--editable-lh)',
      },
      false: { previewText: 'truncate' },
    },
    // 鉛筆の出し方。subtle はふだん淡く置き、hover は載せたときだけ出す
    //   hover: 指では載せられないので、指の密度（--density-coarse が 1）ではいつも淡く出す（原則16）
    editIndicator: {
      subtle: { previewIcon: '[--editable-cue-icon-idle:var(--editable-cue-icon-subtle-opacity)]' },
      hover: {
        previewIcon:
          '[--editable-cue-icon-idle:calc(var(--density-coarse)*var(--editable-cue-icon-subtle-opacity))]',
      },
    },
    // 押せないとき（原則13）: 文字を薄くする。止めているあいだ（Form の送信中など）も同じ
    disabled: {
      true: {
        preview: 'cursor-not-allowed text-(color:--color-on-field-disabled)',
      },
    },
    // 書き換えているあいだは、文字の側を見えなくする（升の大きさは残す）。そうでないあいだは、入力欄の側を透明にする
    //   入力欄は透明でも置いたままにする。Form が値を読み、送信でエラーのときにフォーカスを移せるように
    editing: {
      true: { preview: 'invisible' },
      false: { box: 'pointer-events-none opacity-0' },
    },
  },
});

/** Editable の本体（EditableControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface EditableControlProps extends Pick<
  InputFieldProps,
  'placeholder' | 'loadingIndicator' | 'hideSuccessMark'
> {
  /** 値（制御）。書き換えている途中の文字も含みます */
  value?: string;
  /**
   * はじめの値（非制御）
   * @default ''
   */
  defaultValue?: string;
  /** 値が変わるときに、次の値を渡して呼びます。打つたびと、取り消して元の値に戻すときに呼ばれます */
  onValueChange?: (value: string) => void;
  /** 確定したとき（Enter・欄の外へ出た・確定のボタン）に、確定した値を渡して呼びます。値が変わっていなくても呼びます */
  onValueCommitted?: (value: string) => void;
  /** 書き換えているか（制御） */
  editing?: boolean;
  /**
   * はじめに書き換えている状態にするか（非制御）
   * @default false
   */
  defaultEditing?: boolean;
  /** 書き換えを始める・終えるときに、次の状態を渡して呼びます */
  onEditingChange?: (editing: boolean) => void;
  /**
   * 複数行にするか。Enter で改行し、Ctrl（Mac では ⌘）＋ Enter で確定します
   * @default false
   */
  multiline?: boolean;
  /**
   * 読み取り専用にします。文字として出すだけで、押しても書き換えになりません
   * @default false
   */
  readOnly?: boolean;
  /**
   * 欄の外へ出たとき（フォーカスが外れたとき）の扱い。commit は確定、cancel は取り消して元の値に戻します
   * @default 'commit'
   */
  blurBehavior?: EditableBlurBehavior;
  /**
   * 文字のとき、文字の後ろに置く鉛筆の出し方。subtle はふだん淡く置き、載せる（キーボードで止まる）と濃くします。
   * hover は載せたときだけ出します（指で操作しているときは、載せられないのでいつも淡く出します）。読み取り専用と押せないときは出しません
   * @default 'subtle'
   */
  editIndicator?: EditableEditIndicator;
  /**
   * 書き換えているあいだ、欄の右端に確定（✓）と取り消し（×）のボタンを出すか
   * @default false
   */
  showActions?: boolean;
  /**
   * 文字のときの、押すと書き換えられることの読み上げ。値とラベルのあとに読みます
   * @default '編集'
   */
  editName?: string;
  /**
   * 確定のボタンの読み上げの名前
   * @default '確定'
   */
  commitName?: string;
  /**
   * 取り消しのボタンの読み上げの名前
   * @default '取り消し'
   */
  cancelName?: string;
  /** 中の input（複数行では textarea）に渡すもの（class・data-*・autoComplete など） */
  inputProps?: ComponentProps<'input'>;
  /** 本体（文字と入力欄を重ねる枠）に付くクラス */
  className?: string;
}

/**
 * Editable の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラーの状態と、説明のつながり（aria-describedby）は、包む Field から受け取ります
 */
export function EditableControl({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onValueCommitted,
  editing: editingProp,
  defaultEditing = false,
  onEditingChange,
  placeholder,
  multiline = false,
  readOnly = false,
  blurBehavior = 'commit',
  showActions = false,
  editIndicator = 'subtle',
  editName = '編集',
  commitName = '確定',
  cancelName = '取り消し',
  loadingIndicator = 'spinner',
  hideSuccessMark = false,
  inputProps,
  className,
}: EditableControlProps) {
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  // 止めているあいだ（loadingBehavior="blocking"・Form の送信中）は、押せないときと同じく書き換えを始めない
  const blocking = field?.blocking ?? false;
  const [value, setValue] = useControlled(valueProp, defaultValue, onValueChange);
  const [editingState, setEditing] = useControlled(editingProp, defaultEditing, onEditingChange);
  const interactive = !disabled && !readOnly && !blocking;
  // 押せない・読み取り専用のあいだは、書き換えの状態を渡されても文字として出す
  const editing = editingState && !disabled && !readOnly;
  const id = useId();
  const valueId = `${id}value`;
  const hintId = `${id}hint`;
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  // 書き換えを始めたときの値。取り消すとこの値に戻す
  const original = useRef(value);
  // 書き換えを終えたあと、文字の側にフォーカスを戻すか（キーボード・ボタンで終えたとき）
  const returnFocus = useRef(false);
  const wasEditing = useRef(editing);
  // ラベルの id。文字の側（ボタン）の名前を「ラベル → 値 → 編集」の順で組む
  const [labelId, setLabelId] = useState<string>();
  useLayoutEffect(() => {
    const label = rootRef.current
      ?.closest('[data-slot="field"]')
      ?.querySelector<HTMLElement>('[data-slot="field-label"]');
    setLabelId(label?.id || undefined);
  }, []);

  useLayoutEffect(() => {
    const started = editing && !wasEditing.current;
    const ended = !editing && wasEditing.current;
    wasEditing.current = editing;
    if (started) {
      original.current = value;
      const input = inputRef.current;
      input?.focus();
      input?.select();
    }
    if (ended && returnFocus.current) previewRef.current?.focus();
    returnFocus.current = false;
    // 書き換えを始めた・終えたときだけ動かす（value は始めたときの値を読むだけ）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const start = () => {
    if (!interactive || editing) return;
    setEditing(true);
  };
  const finish = (commit: boolean, refocus: boolean) => {
    if (!editing) return;
    // 止めているあいだ（書き換えの途中で blocking になったとき）は、確定せずに書き換えたままにする
    if (commit && blocking) return;
    if (commit) onValueCommitted?.(value);
    else if (value !== original.current) setValue(original.current);
    returnFocus.current = refocus;
    setEditing(false);
  };

  // 値を渡されないときは、form を戻したらはじめの値に戻し、書き換えも終える
  const resetRef = useFormReset(() => {
    setValue(defaultValue);
    if (editing) setEditing(false);
  }, valueProp === undefined);
  const mergedInputRef = useMergedRefs(inputRef, resetRef, inputProps?.ref);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    inputProps?.onKeyDown?.(event as KeyboardEvent<HTMLInputElement>);
    if (event.defaultPrevented || !editing) return;
    // かな漢字変換の確定の Enter・Esc は、欄の確定・取り消しにしない
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      // 包む面（Dialog・Popover）を閉じない
      event.stopPropagation();
      finish(false, true);
    } else if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      finish(true, true);
    }
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!editing) return;
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    finish(blurBehavior === 'commit', false);
  };

  const styles = editable({
    editIndicator,
    multiline,
    disabled: disabled || blocking,
    editing,
    interactive,
  });
  const empty = value === '';
  const actions =
    showActions && editing ? (
      <>
        <FieldAddonButton
          aria-label={commitName}
          disabled={blocking || undefined}
          onClick={() => finish(true, true)}
        >
          <CheckMarkIcon standalone />
        </FieldAddonButton>
        <FieldAddonButton aria-label={cancelName} onClick={() => finish(false, true)}>
          <XIcon standalone />
        </FieldAddonButton>
      </>
    ) : null;
  const { className: inputClassName, ...restInputProps } = inputProps ?? {};
  // 複数行で値が改行で終わるとき、文字の側の最後の空の行も高さに数える
  const shown = multiline && value.endsWith('\n') ? `${value} ` : value;

  return (
    <div
      ref={rootRef}
      data-slot="editable"
      data-editing={editing || undefined}
      className={styles.root({ className })}
      onBlur={onBlur}
    >
      {readOnly ? (
        // 読み取り専用は、押しても書き換えにならない。ただの文字として出す
        <div data-slot="editable-preview" className={styles.preview()}>
          <span id={valueId} className={styles.previewText()}>
            {shown}
          </span>
        </div>
      ) : (
        <button
          ref={previewRef}
          type="button"
          data-slot="editable-preview"
          className={styles.preview()}
          disabled={disabled || undefined}
          aria-disabled={blocking || undefined}
          aria-labelledby={[labelId, valueId, hintId].filter(Boolean).join(' ')}
          aria-describedby={field?.describedBy}
          aria-hidden={editing || undefined}
          tabIndex={editing ? -1 : undefined}
          onClick={start}
        >
          <span
            id={valueId}
            className={styles.previewText({
              className: empty ? 'text-(color:--field-placeholder)' : undefined,
            })}
          >
            {empty ? placeholder : shown}
          </span>
          <span id={hintId} hidden>
            {editName}
          </span>
          <span className={styles.previewIcon()}>
            <PencilSimpleIcon className="size-[1em] shrink-0" />
          </span>
          {loading && loadingIndicator === 'spinner' && !editing && (
            <FieldSpinner className="ms-auto" />
          )}
        </button>
      )}
      <FieldBox
        suffix={actions}
        addonShape="attached"
        readOnly={readOnly}
        disabled={disabled}
        loading={loading && editing}
        loadingIndicator={loadingIndicator}
        success={editing ? field?.messages.success : undefined}
        successMark={!hideSuccessMark}
        error={field?.messages.error}
        messageIds={field?.describedBy}
        focusTarget={(box) => box.querySelector<HTMLElement>('input, textarea')}
        className={styles.box()}
      >
        {(describedBy) => (
          <BaseField.Control
            render={
              multiline ? (
                <textarea
                  {...(restInputProps as ComponentProps<'textarea'>)}
                  ref={mergedInputRef}
                  rows={1}
                />
              ) : (
                <input {...restInputProps} ref={mergedInputRef} />
              )
            }
            className={cn(
              styles.input(),
              fieldInset,
              blocking && 'cursor-progress',
              inputClassName
            )}
            disabled={disabled}
            required={false}
            aria-required={field?.required || undefined}
            readOnly={blocking || readOnly}
            aria-disabled={blocking || undefined}
            aria-busy={loading || undefined}
            aria-describedby={describedBy}
            // 文字の側を出しているあいだは、入力欄を読み上げと Tab の順から外す（値は Form に渡すので置いたまま）
            aria-hidden={!editing || undefined}
            tabIndex={editing ? undefined : -1}
            placeholder={placeholder}
            value={value}
            onValueChange={(next) => setValue(next)}
            onKeyDown={onKeyDown}
            // ラベルを押した・Form がエラーの欄へフォーカスを移したときは、書き換えを始める
            onFocus={() => start()}
          />
        )}
      </FieldBox>
    </div>
  );
}

/** Editable の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type EditableBaseProps = EditableControlProps &
  Omit<InputFieldProps, 'prefix' | 'suffix' | 'addonShape'>;

/** Editable の props。label か accessibleName のどちらかが要ります */
export type EditableProps = FieldNamed<EditableBaseProps>;

/**
 * ふだんは文字として見え、押すと（またはフォーカスして Enter で）その場で書き換えられる欄。
 * Enter か欄の外へ出ると確定し、Esc で取り消します。見出しの名前の変更や表のセルに使います
 */
export function Editable(props: EditableProps) {
  const [field, control] = splitFieldProps(props);
  return <Field {...field}>{() => <EditableControl {...control} />}</Field>;
}
