'use client';

import { Field as BaseField } from '@base-ui/react/field';
import {
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  Fragment,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { VariantProps } from 'tailwind-variants';

import { UploadIcon } from './dropzone-icons';
import {
  type DropzoneRejection,
  type DropzoneValidateFile,
  evaluateDragItems,
  evaluateFiles,
  formatAccept,
  formatFileSize,
  syncInputFiles,
} from './dropzone-utils';
import { Button } from '../button/Button';
import type { ChoiceColor } from '../../internal/choice/choice-styles';
import {
  type CaptionPlacement,
  Field,
  type FieldLabelLayoutProps,
  type FieldValidate,
  type FieldValidationMode,
  useFieldState,
} from '../../internal/field/Field';
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import {
  type FieldMessage,
  type FieldNamed,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { useChoiceLock } from '../../internal/form-context';
import { cn, tv } from '../../internal/tv';

export type {
  DropzoneRejectReason,
  DropzoneRejection,
  DropzoneValidateFile,
} from './dropzone-utils';

// ファイルを落として選ぶ場所。入力欄の仲間（原則8）だが、値は文字ではなくファイルの一覧なので、
//   Slider・Switch と同じく読み取り専用と Form の送信中は「押せないときと同じ見た目」（useChoiceLock）にする。
//   TextField の破線（ADR-0170）は文字を編集する欄のための形なので、ここでは採らない
// 本体は、隠した本物の <input type="file">（BaseField.Control）を、見た目の箱いっぱいに重ねる（opacity 0）。
//   クリック・キーボード（Enter・Space）・ドラッグ＆ドロップは、すべてこの input が直接受ける。
//   input の上に何もないので、dragenter/dragleave の数え方の落とし穴（子要素をまたぐたびに発火する）が起きない
// 枠・塗り（ADR-0330。決定: 面だけ（filled）を既定にし、現行の点線（dashed）・実線（outline）も variant で選べる）
// ドラッグ中の色（ADR-0331。決定: 面＋線のまま。色は color props に従う。既定は neutral。受け付けないときは常に危険の色）
const dropzoneBox = tv({
  base: [
    'group/dropzone relative flex w-full flex-col items-center overflow-hidden rounded-control',
    'min-h-(--dropzone-min-height)',
    'border-(length:--border-width-thick) border-(color:--dropzone-border-color) bg-(color:--dropzone-bg)',
    '[transition-property:background-color,border-color] duration-(--duration-field) ease-press motion-reduce:transition-none',
    // hover（原則3）: フォーカス中は変えない。:hover は input が覆っていても箱の祖先として効く
    'hover:not-focus-within:[--dropzone-bg:var(--dropzone-bg-hover)]',
    // フォーカス（原則2）: マウスでの押下でも枠線を変える。外側の線はキーボードのときだけ（has-focus-visible）
    'focus-within:border-(color:--color-focus)',
    '[outline-width:0px] [outline-offset:var(--focus-ring-offset)] [outline-color:transparent] [outline-style:solid]',
    'has-[:focus-visible]:[outline-width:var(--focus-ring-width)] has-[:focus-visible]:[outline-color:var(--color-focus-ring)]',
    // ファイルを上に持ってきた（ADR-0331）: 受け付けるときは color の面＋線、受け付けないときはいつも危険の面＋線
    'data-[drag=accept]:border-(color:--dropzone-drag-accept-border) data-[drag=accept]:bg-(color:--dropzone-drag-accept-bg)',
    'data-[drag=reject]:border-(color:--color-fg-danger) data-[drag=reject]:bg-(color:--color-danger-subtle)',
    // エラー（原則2）: 押せない・読み取り専用のときは優先しない（原則13）
    'data-invalid:not-data-disabled:border-(color:--color-fg-danger) data-invalid:not-data-disabled:bg-(color:--color-danger-subtle)',
    // 押せない・読み取り専用・送信中（原則13・Slider と同じ useChoiceLock）: 浮かず、塗り・枠線・文字を薄くする。variant によらず同じ見た目
    'data-disabled:cursor-not-allowed data-disabled:border-(color:--color-line) data-disabled:bg-(color:--color-field-disabled)',
    'data-disabled:hover:[--dropzone-bg:var(--color-field-disabled)]',
  ],
  variants: {
    // 枠の見せ方（ADR-0330）。filled（既定）は枠線なしでグレーの面（原則8）、outline は実線、dashed は点線
    variant: {
      filled: [
        '[border-style:solid] [--dropzone-border-color:transparent]',
        '[--dropzone-bg-hover:var(--color-field-hover)] [--dropzone-bg:var(--color-field)]',
      ],
      outline: [
        '[border-style:solid] [--dropzone-border-color:var(--color-line-strong)]',
        '[--dropzone-bg-hover:var(--color-field-hover)] [--dropzone-bg:transparent]',
      ],
      dashed: [
        '[border-style:dashed] [--dropzone-border-color:var(--color-line-strong)]',
        '[--dropzone-bg-hover:var(--color-field-hover)] [--dropzone-bg:transparent]',
      ],
    },
    // ファイルを受け付けるときの色（ADR-0331）。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレー（原則6）
    color: {
      primary:
        '[--dropzone-drag-accept-bg:var(--color-primary-subtle)] [--dropzone-drag-accept-border:var(--color-primary)]',
      secondary:
        '[--dropzone-drag-accept-bg:var(--color-secondary-subtle)] [--dropzone-drag-accept-border:var(--color-fg-secondary)]',
      neutral:
        '[--dropzone-drag-accept-bg:var(--palette-gray-200)] [--dropzone-drag-accept-border:var(--color-neutral-strong)]',
    },
  },
  defaultVariants: { variant: 'filled', color: 'neutral' },
});

// 中身の並べ方（ADR-0332。決定: 縦に積む形のまま。横1列の案と切り替えのトークンは畳んだ）
const dropzoneContent = tv({
  base: 'pointer-events-none flex w-full flex-col items-center justify-center gap-(--dropzone-content-gap) p-(--dropzone-padding) text-center',
});

/** 枠の見せ方。filled は枠線なしのグレーの面（既定）、outline は実線、dashed は点線 */
export type DropzoneVariant = NonNullable<VariantProps<typeof dropzoneBox>['variant']>;

export type DropzoneButtonColor = 'white' | 'primary';

/** Dropzone の本体（DropzoneControl）の props。見出し・キャプション・状態の文・押せない・必須・name は、包む Field に渡します */
export interface DropzoneControlProps {
  /**
   * 枠の見せ方。filled は枠線なしのグレーの面、outline は実線、dashed は点線
   * @default 'filled'
   */
  variant?: DropzoneVariant;
  /**
   * ファイルを受け付けるときの面と線の色。primary・secondary は利用者が選ぶ色、neutral は色を持たないグレー（原則6）。
   * 受け付けないときは、この props によらずいつも危険の色
   * @default 'neutral'
   */
  color?: ChoiceColor;
  /**
   * 中の「ファイルを選択」ボタンの色。white は白い面に輪郭と影、primary は primary の塗り。
   * どちらも地のグレーの面と色の差があり、ボタンだと分かる
   * @default 'white'
   */
  buttonColor?: DropzoneButtonColor;
  /** 受け付けるファイルの種類。<input type="file"> の accept と同じ書式（拡張子・MIME タイプ・"image/*"、","区切り） */
  accept?: string;
  /**
   * 複数のファイルを選べるか。<input type="file"> の multiple と同じ
   * @default false
   */
  multiple?: boolean;
  /** 1 ファイルの大きさの上限（バイト）。超えたファイルは弾き、reason: 'maxSize' で伝える */
  maxSize?: number;
  /** 選べるファイルの数の上限。すでに選んだ分を含めて超えるファイルは弾き、reason: 'maxFiles' で伝える */
  maxFiles?: number;
  /**
   * ファイルを独自の条件で確かめる関数。受け付けないときは理由の文を返し、そのファイルは弾いて reason: 'custom' と返した文（message）で伝える。
   * 種類（accept）と大きさ（maxSize）を通ったファイルだけを確かめ、弾いたファイルは数の上限（maxFiles）に数えない
   */
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
   * 読み取り専用にする。選んだファイルは残るが、選び直せない。押せないときと同じ見た目で、フォーカスはでき、
   * フォームでは値が送られる（Slider・Switch と同じ useChoiceLock）
   * @default false
   */
  readOnly?: boolean;
  /** Dropzone が属するフォームの id。フォームの外に置くときに使う */
  form?: string;
  /** 中の input（type="file"）への ref */
  inputRef?: Ref<HTMLInputElement>;
  /** 中の input に渡すもの（data-* など）。className は Dropzone の className を使う */
  inputProps?: Omit<ComponentProps<'input'>, 'type' | 'accept' | 'multiple' | 'onChange'>;
  /**
   * 箱の中身。渡さないときは、アイコン・案内の文・「ファイルを選択」の見た目のボタンを既定で出す
   * 箱の外側はどこを押してもファイル選択が開くので、渡す中身は説明のためだけに置く（実際に押せるようにはならない）
   */
  children?: ReactNode;
  'aria-describedby'?: string;
}

/**
 * ファイルを落とす・押して選ぶ場所の本体（組み立て用）。Field の中に置き、見出し・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・必須・エラーの状態と、説明のつながり（aria-describedby）と、フォームに送る名前（name）は、包む Field から受け取ります
 */
export function DropzoneControl({
  variant,
  color,
  buttonColor = 'white',
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  validateFile,
  value,
  defaultValue,
  onValueChange,
  onFilesRejected,
  readOnly,
  form,
  inputRef,
  inputProps,
  children,
  'aria-describedby': ariaDescribedBy,
}: DropzoneControlProps) {
  // 読み取り専用・Form の送信中は、押せないときと同じ見た目にし、値を変えない（Slider・Switch と同じ useChoiceLock）
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const locked = useChoiceLock(disabled, readOnly);
  const dimmed = disabled || locked.data['data-disabled'] !== undefined;

  const [filesState, setFilesState] = useState<File[]>(() => defaultValue ?? []);
  const files = value ?? filesState;
  const setFiles = (next: File[]) => {
    if (value === undefined) setFilesState(next);
    onValueChange?.(next);
  };

  const [dragState, setDragState] = useState<'idle' | 'accept' | 'reject'>('idle');
  // dragenter・dragleave の数を数える必要はない（input が箱いっぱいを覆い、子要素を持たないため。
  // 子要素をまたぐたびに dragleave→dragenter が発火する落とし穴は、覆う要素を1つだけにすることで避けている）

  // 利用者の inputRef（HTMLInputElement）を、BaseField.Control の ref（HTMLElement）につなぐ
  // （既定で <input> を描くので、実体は必ず HTMLInputElement）
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const setControlRef = (node: HTMLElement | null) => {
    const input = node as HTMLInputElement | null;
    inputElRef.current = input;
    if (typeof inputRef === 'function') inputRef(input);
    else if (inputRef) Object.assign(inputRef, { current: input });
  };

  // 値が外から変わったとき（value で親が 1 つ外した、など）も、Form に送る input.files を値に合わせる
  useEffect(() => {
    syncInputFiles(inputElRef.current, files);
  }, [files]);

  const acceptIncoming = (incoming: File[], input: HTMLInputElement | null) => {
    const { accepted, rejected } = evaluateFiles(incoming, {
      accept,
      multiple,
      maxSize,
      maxFiles,
      validateFile,
      currentCount: multiple ? files.length : 0,
    });
    const next = multiple ? [...files, ...accepted] : accepted.length > 0 ? accepted : files;
    if (accepted.length > 0) setFiles(next);
    if (rejected.length > 0) onFilesRejected?.(rejected);
    // Form に送るときの値。ブラウザは input.files に代入できるので、ここで合わせ直す
    // （すべて受け付けなかったときは値が変わらず、上の effect が走らないので、ここでも合わせる）。
    // 非制御は受け入れた値に、制御は今の value に合わせる。親が値を採ったら、上の effect が新しい値に合わせる
    syncInputFiles(input, value === undefined ? next : files);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (dimmed || !event.target.files) return;
    acceptIncoming(Array.from(event.target.files), event.currentTarget);
  };

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    // 読み取り専用（送信中も同じ）は、ネイティブの disabled を付けない代わりに、開く既定の動作だけを止める
    // （<input type="file"> は readOnly を持たないため）。マウスでもキーボード（Enter・Space）でも click が起きる
    if (locked.readOnly) event.preventDefault();
  };

  const handleDragEnter = (event: DragEvent<HTMLInputElement>) => {
    if (dimmed) return;
    event.preventDefault();
    setDragState(
      evaluateDragItems(event.dataTransfer.items, { accept, multiple }) ? 'accept' : 'reject'
    );
  };

  const handleDragOver = (event: DragEvent<HTMLInputElement>) => {
    if (dimmed) return;
    // dragover の既定の動作を止めないと drop が発生しない
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLInputElement>) => {
    if (dimmed) return;
    event.preventDefault();
    setDragState('idle');
  };

  // 案内の2行目（原則にない判断）: accept・multiple・maxSize・maxFiles から、条件があるものだけをつなぐ
  //   accept は形式名（PNG・JPEG・画像）で見せる。大きさの数と単位は、行の途中で割れないようにまとめる
  const hint: ReactNode[] = [
    accept && `対応形式: ${formatAccept(accept)}`,
    multiple ? 'まとめて選べます' : '1 つだけ選べます',
    maxSize != null && (
      <>
        1 つ <span className="whitespace-nowrap">{formatFileSize(maxSize)}</span> まで
      </>
    ),
    maxFiles != null && `最大 ${maxFiles} 件`,
  ].filter(Boolean);

  const handleDrop = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    setDragState('idle');
    if (dimmed) return;
    acceptIncoming(Array.from(event.dataTransfer.files), event.currentTarget);
  };

  return (
    <div
      data-slot="dropzone"
      data-drag={dragState === 'idle' ? undefined : dragState}
      data-disabled={dimmed || undefined}
      data-invalid={field?.invalid ? '' : undefined}
      className={dropzoneBox({ variant, color })}
    >
      <div aria-hidden className={dropzoneContent()}>
        {children ?? (
          <>
            <UploadIcon className="size-(--dropzone-icon-size) shrink-0 text-fg-muted group-data-disabled/dropzone:text-(color:--color-on-field-disabled)" />
            <div className="flex flex-col gap-1">
              <p className="font-bold text-fg group-data-disabled/dropzone:text-(color:--color-on-field-disabled)">
                ここにファイルをドラッグ、またはクリックして選択
              </p>
              <p className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle group-data-disabled/dropzone:text-(color:--color-on-field-disabled)">
                {hint.map((part, index) => (
                  <Fragment key={index}>
                    {index > 0 && ' ・ '}
                    {part}
                  </Fragment>
                ))}
              </p>
            </div>
            {/* ボタンの色（ADR-0334。決定: 白い面を既定にし、primary の塗りも選べる。線だけのボタンは地の面と差がなく、ボタンに見えない） */}
            <Button
              type="button"
              variant="filled"
              color={buttonColor}
              tabIndex={-1}
              disabled={dimmed}
              className="pointer-events-none"
            >
              ファイルを選択
            </Button>
          </>
        )}
      </div>
      <BaseField.Control
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        required={false}
        aria-required={field?.required || undefined}
        aria-readonly={locked.readOnlyLook || undefined}
        aria-disabled={locked.ariaDisabled}
        form={form}
        {...inputProps}
        ref={setControlRef}
        className={cn(
          'absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none disabled:cursor-not-allowed'
        )}
        aria-describedby={
          [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') || undefined
        }
        onChange={handleChange}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
}

/** Dropzone の props から、label・accessibleName の組み合わせの決まりを外したもの */
export interface DropzoneBaseProps
  extends DropzoneControlProps, FieldMarkProps, FieldLabelLayoutProps {
  /** 本体の上に置く見出し。読み上げの名前にもなります */
  label?: ReactNode;
  /** 読み上げだけの名前。見える見出しを置かないときに要ります */
  accessibleName?: string;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。渡すと本体の下に丸の「!」と赤い文字で出し、本体をエラーの状態にする */
  errorText?: FieldMessage;
  /** 警告の内容。渡すと本体の下に三角とオリーブ色の文字で出す。本体の見た目は変えない */
  warningText?: FieldMessage;
  /** 成功の内容。渡すと本体の下に丸のチェックと緑の文字で出す。本体の見た目は変えない */
  successText?: FieldMessage;
  /** 情報の内容。渡すと本体の下に丸の「i」と青い文字で出す。本体の見た目は変えない */
  infoText?: FieldMessage;
  /**
   * 押せない（Disabled）状態にする。フォームでは値が送られない
   * @default false
   */
  disabled?: boolean;
  /** フォームに送るときの名前。<input type="file"> の name と同じ */
  name?: string;
  /**
   * 値を確かめる関数。いまの値とフォーム全体の値を受け取り、正しくないときはエラーの文を返す。
   * 返したエラーの文は errorText と同じ行に出す。errorText があるときは、そちらを優先する
   */
  validate?: FieldValidate;
  /**
   * 検証のタイミング。Form の validationMode より、この欄の指定が勝つ
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * validationMode="onChange" のとき、validate を呼ぶまでの待ち時間（ミリ秒）
   * @default 0
   */
  validationDebounceTime?: number;
  /** ラベル・本体・キャプション・下の行を包むいちばん外の要素に付く */
  className?: string;
}

/** Dropzone の props。label か accessibleName のどちらかが要ります */
export type DropzoneProps = FieldNamed<DropzoneBaseProps>;

/**
 * ファイルを落とす・押して選ぶ場所。画像やドキュメントをアップロードする画面で使う（アップロードそのものは行わない）
 */
export function Dropzone(props: DropzoneProps) {
  const [field, control] = splitFieldProps(props as DropzoneBaseProps);
  return <Field {...field}>{() => <DropzoneControl {...control} />}</Field>;
}
