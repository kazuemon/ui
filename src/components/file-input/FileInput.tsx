'use client';

import { Field as BaseField } from '@base-ui/react/field';
import {
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type MouseEvent,
  type Ref,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Chip } from '../chip/Chip';
import { FieldAddon } from '../field-addon/FieldAddon';
import {
  type DropzoneRejection,
  type DropzoneValidateFile,
  evaluateDragItems,
  evaluateFiles,
  syncInputFiles,
} from '../../internal/dropzone-utils';
import { UploadIcon } from '../../internal/icons';
import { FieldBox, fieldInset } from '../../internal/field/FieldBox';
import { FieldClearButton } from '../../internal/field/FieldClearButton';
import { Field, useFieldState } from '../../internal/field/Field';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { useFormReset } from '../../internal/field/use-form-reset';
import { cn } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';

export type {
  DropzoneRejection as FileInputRejection,
  DropzoneRejectReason as FileInputRejectReason,
  DropzoneValidateFile as FileInputValidateFile,
} from '../../internal/dropzone-utils';

// ファイルを選ぶ入力欄（フォームの 1 行）。入力欄の仲間（原則8）。TextField と同じ高さ・塗り・枠線・Field の行を持ち、
//   押すとファイルの選択が開く。隠した本物の <input type="file"> を欄いっぱいに重ねる（Dropzone と同じ）。
//   クリック・キーボード・ドロップは、この input が直接受ける。値は File[]（選び直すと置き換える。ネイティブの input と同じ）
// 見た目の型（軸 620）・複数のときの出し方（軸 621）・ドロップの受け方（軸 622）は、比較のストーリーで決めている途中

/** 欄の見た目の型。attached は左端に接するグレーの塊、plain はアイコンと名前だけ */
export type FileInputVariant = 'plain' | 'attached';

/** 複数のファイルの出し方。first は「a.png ほか 2 件」、below は欄に件数・欄の下に Chip の列 */
export type FileInputMultipleDisplay = 'first' | 'below';

/** FileInput の本体（FileInputControl）の props。ラベル・キャプション・状態の文・押せない・必須・name は、包む Field に渡します */
export interface FileInputControlProps {
  /**
   * 欄の見た目の型。attached は左端に接するグレーの塊に「ファイルを選ぶ」（TextField の prefix と同じ作り）、
   * plain はアイコンと名前だけ
   * @default 'attached'
   */
  variant?: FileInputVariant;
  /**
   * 複数のファイルを選んだときの出し方。first は「a.png ほか 2 件」（欄は 1 行のまま）、
   * below は欄に「3 件のファイル」・欄の下に名前の Chip の列を置き、× で 1 つずつ外せる
   * @default 'first'
   */
  multipleDisplay?: FileInputMultipleDisplay;
  /** 受け付けるファイルの種類。<input type="file"> の accept と同じ書式（拡張子・MIME タイプ・"image/*"、","区切り） */
  accept?: string;
  /**
   * 複数のファイルを選べるか。<input type="file"> の multiple と同じ。選び直すと、いまの選択を置き換える
   * @default false
   */
  multiple?: boolean;
  /** 1 ファイルの大きさの上限（バイト）。超えたファイルは弾き、reason: 'maxSize' で伝える */
  maxSize?: number;
  /** 選べるファイルの数の上限。超える分は弾き、reason: 'maxFiles' で伝える */
  maxFiles?: number;
  /** ファイルを独自の条件で確かめる関数。受け付けないときは理由の文を返し、reason: 'custom' で伝える */
  validateFile?: DropzoneValidateFile;
  /** 値（制御）。選んだファイルの一覧 */
  value?: File[];
  /** はじめの値（非制御） */
  defaultValue?: File[];
  /** 値が変わるときに、受け付けた分の一覧を渡して呼ぶ */
  onValueChange?: (files: File[]) => void;
  /** 受け付けなかったファイルがあったときに呼ぶ。選ぶ・落とすたびに 1 回 */
  onFilesRejected?: (rejections: DropzoneRejection[]) => void;
  /**
   * 何も選んでいないときに出す文
   * @default '選択されていません'
   */
  placeholder?: string;
  /**
   * 選ぶ塊の文字（variant が attached のとき）
   * @default 'ファイルを選ぶ'
   */
  buttonText?: string;
  /**
   * ファイルを欄に落として選べるか。false のときは、落としても何も起きない
   * @default true
   */
  droppable?: boolean;
  /**
   * 選んだファイルを外すボタン（×）を右端に出すか。何も選んでいないときと、読み取り専用では出さない。
   * 押すと onValueChange([]) で知らせる
   * @default false
   */
  clearable?: boolean;
  /**
   * 外すボタンの読み上げの名前
   * @default '選んだファイルを外す'
   */
  clearName?: string;
  /**
   * 読み取り専用にする。選んだファイルは残るが、選び直せない。フォームでは値が送られる
   * @default false
   */
  readOnly?: boolean;
  /** 欄が属するフォームの id。フォームの外に置くときに使う */
  form?: string;
  /** 中の input（type="file"）への ref */
  inputRef?: Ref<HTMLInputElement>;
  /** 中の input に渡すもの（data-* など） */
  inputProps?: Omit<ComponentProps<'input'>, 'type' | 'accept' | 'multiple' | 'onChange'>;
  /** 本体（灰色の欄）に付くクラス */
  className?: string;
  'aria-describedby'?: string;
}

/**
 * ファイルを選ぶ欄の本体（組み立て用）。Field の中に置く。
 * 押せない・必須・エラーの状態と、説明のつながり、フォームに送る名前（name）は、包む Field から受け取ります
 */
export function FileInputControl({
  variant = 'attached',
  multipleDisplay = 'first',
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  validateFile,
  value,
  defaultValue,
  onValueChange,
  onFilesRejected,
  placeholder = '選択されていません',
  buttonText = 'ファイルを選ぶ',
  droppable = true,
  clearable = false,
  clearName = '選んだファイルを外す',
  readOnly,
  form,
  inputRef,
  inputProps,
  className,
  'aria-describedby': ariaDescribedBy,
}: FileInputControlProps) {
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  // 待っているあいだ止める・Form の送信中は、書き換えられない（フォーカスは外さない）
  const blocking = field?.blocking ?? false;
  const locked = readOnly || blocking;

  const [filesState, setFilesState] = useState<File[]>(() => defaultValue ?? []);
  const files = value ?? filesState;
  const setFiles = (next: File[]) => {
    if (value === undefined) setFilesState(next);
    onValueChange?.(next);
  };

  const [dragState, setDragState] = useState<'idle' | 'accept' | 'reject'>('idle');

  const inputElRef = useRef<HTMLInputElement | null>(null);
  // form を戻したら、はじめの値に戻す（ブラウザの reset は input の中身を空にするので、合わせ直す）
  const resetRef = useFormReset(() => {
    const initial = defaultValue ?? [];
    setFiles(initial);
    syncInputFiles(inputElRef.current, initial);
  }, value === undefined);
  const setControlRef = useMergedRefs(inputElRef, inputRef, resetRef);

  // 値が外から変わったときも、Form に送る input.files を値に合わせる
  useEffect(() => {
    syncInputFiles(inputElRef.current, files);
  }, [files]);

  const acceptIncoming = (incoming: File[], input: HTMLInputElement | null) => {
    // 選び直すと置き換える（ネイティブの欄と同じ）。数の上限・大きさ・種類は、Dropzone と同じ判定
    const { accepted, rejected } = evaluateFiles(incoming, {
      accept,
      multiple,
      maxSize,
      maxFiles,
      validateFile,
      currentCount: 0,
    });
    const next = accepted.length > 0 ? accepted : files;
    if (accepted.length > 0) setFiles(next);
    if (rejected.length > 0) onFilesRejected?.(rejected);
    syncInputFiles(input, value === undefined ? next : files);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (locked || disabled || !event.target.files) return;
    acceptIncoming(Array.from(event.target.files), event.currentTarget);
  };
  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    // 読み取り専用・送信中は、ファイルの選択を開かない（<input type="file"> は readOnly を持たない）
    if (locked) event.preventDefault();
  };
  // ドロップ（軸 622）: 受けないときは、ブラウザが input に直に落とすのも止める
  const canDrop = droppable && !locked && !disabled;
  const handleDragEnter = (event: DragEvent<HTMLInputElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    setDragState(
      evaluateDragItems(event.dataTransfer.items, { accept, multiple }) ? 'accept' : 'reject'
    );
  };
  const handleDragOver = (event: DragEvent<HTMLInputElement>) => {
    if (canDrop) event.preventDefault();
  };
  const handleDragLeave = (event: DragEvent<HTMLInputElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    setDragState('idle');
  };
  const handleDrop = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    setDragState('idle');
    if (!canDrop) return;
    acceptIncoming(Array.from(event.dataTransfer.files), event.currentTarget);
  };

  const below = multiple && multipleDisplay === 'below';
  // 「a.png ほか 2 件」は、長い名前だけを … で切り、「ほか 2 件」は残す
  const more = multiple && multipleDisplay === 'first' && files.length > 1;
  const nameText =
    files.length === 0
      ? placeholder
      : below
        ? `${files.length} 件のファイル`
        : files.length === 1 || !multiple || more
          ? files[0].name
          : `${files.length} 件のファイル`;

  // 外した Chip の × は DOM から消えるので、次の Chip の ×（なければ前の ×、1 つもなければ欄）へフォーカスを移す
  const listRef = useRef<HTMLUListElement>(null);
  const focusAfterRemove = useRef<number | null>(null);
  useEffect(() => {
    const index = focusAfterRemove.current;
    if (index === null) return;
    focusAfterRemove.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [];
    const target = buttons[Math.min(index, buttons.length - 1)] ?? inputElRef.current;
    target?.focus();
  });

  const removeAt = (index: number) => {
    if (locked || disabled) return;
    const next = files.filter((_, i) => i !== index);
    if (listRef.current?.contains(document.activeElement)) focusAfterRemove.current = index;
    setFiles(next);
    syncInputFiles(inputElRef.current, value === undefined ? next : files);
  };

  const button =
    variant === 'plain' ? (
      <UploadIcon standalone className="size-(--spacing-icon) shrink-0 text-fg-muted" />
    ) : null;

  const content = (
    <div
      data-slot="file-input-content"
      data-drag={dragState === 'idle' ? undefined : dragState}
      aria-hidden
      className={cn(
        'group/drag pointer-events-none flex min-w-0 flex-1 items-center gap-3 self-stretch',
        fieldInset
      )}
    >
      {button}
      <span className="flex min-w-0 gap-1">
        <span
          className={cn(
            'min-w-0 truncate',
            files.length === 0 && 'text-(color:--field-placeholder)'
          )}
        >
          {nameText}
        </span>
        {more && <span className="shrink-0">ほか {files.length - 1} 件</span>}
      </span>
    </div>
  );

  return (
    <>
      <FieldBox
        prefix={
          variant === 'attached' ? (
            <FieldAddon aria-hidden className="font-bold text-fg">
              {buttonText}
            </FieldAddon>
          ) : undefined
        }
        suffix={
          clearable ? (
            <FieldClearButton
              value={files.length > 0 ? 'x' : ''}
              onClear={() => {
                setFiles([]);
                // 値を渡されているときは、親が値を変えるまで今のファイルを送る（Chip を外すときと同じ）
                syncInputFiles(inputElRef.current, value === undefined ? [] : files);
              }}
              readOnly={readOnly}
              disabled={disabled}
              aria-label={clearName}
            />
          ) : undefined
        }
        addonShape="attached"
        readOnly={readOnly}
        disabled={disabled}
        loading={field?.loading ?? false}
        loadingIndicator="spinner"
        success={field?.messages.success}
        successMark
        error={field?.messages.error}
        describedBy={ariaDescribedBy}
        messageIds={field?.describedBy}
        className={cn(
          'relative',
          // 外すボタン・Chip の × は、欄いっぱいの input より手前に置く
          '[&_[data-slot=field-addon-button]]:relative [&_[data-slot=field-addon-button]]:z-10',
          // ファイルを持ってきたとき（ドラッグ中）の面と線。受け付けないときは危険の色
          'has-[[data-drag=accept]]:border-neutral-strong has-[[data-drag=accept]]:[--control-bg:var(--palette-gray-200)]',
          'has-[[data-drag=reject]]:border-(color:--color-fg-danger) has-[[data-drag=reject]]:[--control-bg:var(--color-danger-subtle)]',
          className
        )}
      >
        {(describedBy) => (
          <>
            {content}
            <BaseField.Control
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              required={false}
              aria-required={field?.required || undefined}
              aria-readonly={readOnly || undefined}
              aria-disabled={blocking || undefined}
              aria-busy={field?.loading || undefined}
              form={form}
              {...inputProps}
              ref={setControlRef}
              className={cn(
                'absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none disabled:cursor-not-allowed',
                locked && 'cursor-default',
                blocking && 'cursor-progress'
              )}
              aria-describedby={describedBy}
              onChange={handleChange}
              onClick={handleClick}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </>
        )}
      </FieldBox>
      {below && files.length > 0 && (
        // 欄の下の Chip の列（Dropzone のファイル一覧と同じ位置）。× で 1 つずつ外す
        <ul ref={listRef} data-slot="file-input-list" className="flex flex-wrap gap-1">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="min-w-0">
              <Chip
                readOnly={locked}
                disabled={disabled}
                onRemove={() => removeAt(index)}
                removeName={`${file.name} を外す`}
              >
                {file.name}
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** FileInput の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type FileInputBaseProps = FileInputControlProps &
  Omit<
    InputFieldProps,
    'placeholder' | 'prefix' | 'suffix' | 'addonShape' | 'hideSuccessMark' | 'loadingIndicator'
  >;

/** FileInput の props。label か accessibleName のどちらかが要ります */
export type FileInputProps = FieldNamed<FileInputBaseProps>;

/**
 * フォームの 1 行に収まる、ファイルを選ぶ入力欄
 */
export function FileInput(props: FileInputProps) {
  const [field, control] = splitFieldProps(props as FileInputBaseProps);
  return <Field {...field}>{() => <FileInputControl {...control} />}</Field>;
}
