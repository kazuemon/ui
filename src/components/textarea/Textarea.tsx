'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import {
  type ComponentProps,
  type CSSProperties,
  type PointerEvent,
  useRef,
  useState,
} from 'react';

import {
  Field,
  FieldLoadingBar,
  FieldSpinner,
  FieldSuccessMark,
  useFieldState,
} from '../../internal/field/Field';
import { FieldCount } from '../../internal/field/FieldCount';
import {
  type FieldCountProps,
  isOverCount,
  useFieldCount,
  useTypedCount,
} from '../../internal/field/use-field-count';
import { controlBox } from '../../internal/field/field-styles';
import { useFormReset } from '../../internal/field/use-form-reset';
import {
  type FieldNamed,
  type InputFieldProps,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { scrollAreaStyles } from '../../internal/scroll-area-styles';
import { cn, tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { useAutoHeight } from './use-auto-height';

// 右下のつまみとみなす角の幅（px）。つまみはブラウザが描く（resize: vertical）ので、トークンや密度では変わらない。
//   押した位置との比べに使うので、CSS の値ではなく JS の数で持つ
const RESIZE_GRIP_HIT = 20;

// 本体は TextField と同じ（原則8: 編集できる欄はグレーの塗り。フォーカス・エラー・押せない・止めているあいだも controlBox）
// 高さ（軸 98）: textarea は中身の高さに伸ばし（field-sizing: content。対応していないブラウザは use-auto-height）、
//   外側のスクロールする枠（Base UI の ScrollArea）を minRows〜maxRows の高さにする。maxRows を超えたら枠の中でスクロールし、
//   つまみは ScrollArea と同じ見た目（scrollAreaStyles）。端の影はないので、ScrollArea の影なしと同じく、つまみはいつも出す
// 右下のつまみ（resizable）は枠に付ける。利用者が一度動かしたら、その高さを優先する（maxRows の上限を外し、伸びるのも止まる）
// 行の高さと上下の余白は TextField とそろえる（軸 98）: 行は文字を打つ欄の行の高さ、上下の余白は 1 行ぶんの高さが
//   TextField（--spacing-control）と同じになる値。密度で変わる値を読むので、欄の要素で計算する（--textarea-lh・--textarea-py）
const textarea = tv({
  slots: {
    box: 'relative h-auto items-stretch gap-0 px-0',
    // 枠。角は本体の枠線の内側に合わせる
    root: 'w-full rounded-[calc(var(--radius-control)-var(--field-border-width))]',
    viewport: [
      'max-h-(--textarea-max-height) min-h-(--textarea-min-height) [overflow:auto]! rounded-[inherit] outline-none',
      // キャレットを見える位置に送るとき（打つ・矢印・Ctrl+Home など）、上下の余白ごと見せる
      // キャレットの矩形は字の高さで、行の高さより上下に少し小さいので、その差も足す
      'scroll-py-[calc(var(--textarea-py)+(var(--textarea-lh)-var(--text-input))/2)]',
    ],
    input: [
      'block [field-sizing:content] w-full min-w-0 resize-none overflow-hidden bg-transparent outline-none',
      'placeholder:text-(color:--field-placeholder) disabled:cursor-not-allowed',
      'px-[calc(var(--spacing-control-x)-var(--field-border-width))] py-(--textarea-py) leading-(--textarea-lh)',
      'min-h-(--textarea-min-height)',
    ],
  },
  variants: {
    resizable: {
      // 右下のつまみ。枠のつまみ（スクロール）とは、下の端で重ならないようにする
      true: { viewport: 'resize-y', root: '[&>[data-orientation=vertical]]:mb-4' },
      false: { viewport: 'resize-none' },
    },
    // 利用者がつまみで高さを変えたあとは、上限の行数で止めない
    manual: { true: { viewport: 'max-h-none' } },
  },
});

// 行の高さと上下の余白（欄の要素と枠の要素で、それぞれ計算する）と、行数からの高さ
const heightVars = (
  minRows: number,
  maxRows: number
): CSSProperties & Record<`--${string}`, string> => ({
  '--textarea-lh': 'var(--leading-input)',
  '--textarea-py':
    'calc((var(--spacing-control) - var(--textarea-lh)) / 2 - var(--field-border-width))',
  '--textarea-min-height': `calc(${minRows} * var(--textarea-lh) + 2 * var(--textarea-py))`,
  '--textarea-max-height': `calc(${maxRows} * var(--textarea-lh) + 2 * var(--textarea-py))`,
});

/** Textarea の本体（TextareaControl）の props。ラベル・キャプション・状態の文は、包む Field に渡します */
export interface TextareaControlProps
  extends
    Omit<
      ComponentProps<'textarea'>,
      | 'className'
      | 'children'
      | 'rows'
      | 'value'
      | 'defaultValue'
      | 'disabled'
      | 'required'
      | 'name'
    >,
    Pick<InputFieldProps, 'loadingIndicator' | 'hideSuccessMark'>,
    FieldCountProps {
  /**
   * 空の欄に出す見本の文字。値と見分けられるよう、「例: UI を作っています」のように、見本だと分かる書き方にします。
   * 色は、文字の基準（4.5:1）を保つ淡さまでしか淡くできないため、書き方でも値と区別します
   */
  placeholder?: string;
  /** 値（制御） */
  value?: string;
  /** はじめの値（非制御） */
  defaultValue?: string;
  /** 値が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: string) => void;
  /** 中の textarea に渡すもの（class・data-*・autoComplete など） */
  inputProps?: ComponentProps<'textarea'>;
  /**
   * いちばん低いときの行数。空のときもこの高さです
   * @default 3
   */
  minRows?: number;
  /**
   * 入力に合わせて伸ばす上限の行数。超えたら欄の中でスクロールします。minRows と同じにすると、高さが変わらない欄になります
   * @default 8
   */
  maxRows?: number;
  /**
   * 右下のつまみで、利用者が高さを変えられるか。一度変えたら、その高さのまま（入力に合わせて伸びるのは止まり、maxRows を超えても広げられます）
   * @default true
   */
  resizable?: boolean;
  /** 本体（灰色の欄）に付くクラス */
  className?: string;
}

/**
 * 複数行のテキスト入力の本体（組み立て用）。Field の中に置き、ラベル・キャプション・状態の行は FieldLabel などで並べます。
 * 押せない・待っている・エラー・成功の状態と、説明のつながり（aria-describedby）は、包む Field から受け取ります。
 * 文字数（showCount）は本体のすぐ下に出します。maxCount を超えたときの欄の赤い枠線は、内蔵の形（Textarea）だけで引きます
 */
export function TextareaControl({
  loadingIndicator = 'spinner',
  hideSuccessMark = false,
  inputProps,
  minRows = 3,
  maxRows = 8,
  resizable = true,
  maxCount,
  overCountInvalid = true,
  warnRemaining,
  showCount = false,
  readOnly,
  style,
  value,
  defaultValue,
  maxLength,
  onChange,
  onValueChange,
  className,
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-invalid': ariaInvalid,
  'aria-busy': ariaBusy,
  ...props
}: TextareaControlProps) {
  const field = useFieldState();
  const disabled = field?.disabled ?? false;
  const loading = field?.loading ?? false;
  const errorText = field?.messages.error;
  const successText = field?.messages.success;
  const messageIds = field?.describedBy;
  // Form の送信中（ADR-0059）。押せない欄と同じ見た目にし、書き換えを止める。フォーカスは外さない
  // 待っているあいだ（loading）の blocking も同じ（design/adr/0042）
  const blocking = field?.blocking ?? false;
  const [manual, setManual] = useState(false);
  // 押せないとき・止めているあいだは、つまみも使えない
  const canResize = resizable && !disabled && !blocking;
  const styles = textarea({ resizable: canResize, manual: canResize && manual });
  const scrollStyles = scrollAreaStyles({ scrollbar: 'always' });
  const low = Math.max(1, minRows);
  const high = Math.max(low, maxRows);

  const { ref: autoHeightRef, fit } = useAutoHeight();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  // 文字数。値を渡されたときはその長さ、渡されないときは打った長さを数える。数えるのは見えている文字（書記素）
  const { length, onTyped } = useTypedCount(value, defaultValue);
  // 値を渡されないときは、form を戻したら（reset）文字数と高さもはじめの値に合わせ、onValueChange でも知らせる
  //   （ブラウザは textarea の文字だけを戻し、change を起こさない）
  const resetRef = useFormReset(() => {
    onTyped(defaultValue ?? '');
    fit();
    onValueChange?.(defaultValue ?? '');
  }, value === undefined);
  const setInput = useMergedRefs(inputRef, autoHeightRef, inputProps?.ref, ref, resetRef);

  // 枠の上を押したとき。右下のつまみなら、利用者が高さを決めたとみなす。
  // それ以外（つまみで広げて、中身の下に空いたところ）は、欄にフォーカスを移す
  const onViewportPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (
      canResize &&
      event.clientX > rect.right - RESIZE_GRIP_HIT &&
      event.clientY > rect.bottom - RESIZE_GRIP_HIT
    ) {
      setManual(true);
      return;
    }
    event.preventDefault();
    inputRef.current?.focus();
  };

  const {
    over,
    describedBy: countDescribedBy,
    count,
  } = useFieldCount({
    length,
    maxCount,
    maxLength,
    warnRemaining,
    showCount,
  });
  const describedBy =
    [ariaDescribedBy, countDescribedBy, messageIds].filter(Boolean).join(' ') || undefined;
  return (
    <>
      <div
        data-slot="control"
        data-field-readonly={readOnly || undefined}
        className={controlBox({ className: [styles.box(), className] })}
        style={heightVars(low, high)}
      >
        <BaseScrollArea.Root
          data-slot="textarea-scroll"
          className={scrollStyles.root({ className: styles.root() })}
        >
          <BaseScrollArea.Viewport
            // 枠には Tab で止めない（止まるのは欄だけ）。キーボードでは、欄の中でキャレットを動かしてスクロールする
            tabIndex={-1}
            className={styles.viewport()}
            onPointerDown={onViewportPointerDown}
          >
            <BaseScrollArea.Content style={{ minWidth: 0 }}>
              <BaseField.Control
                // Base UI の Field.Control を textarea で描く。値・検証・ラベルとのつなぎは Field.Control が受け持つ
                // textarea の props（onChange・ref など）は描く要素に渡し、Base UI が自分の props と合わせる（ハンドラーは両方呼ぶ）
                render={
                  <textarea
                    {...inputProps}
                    {...props}
                    ref={setInput}
                    rows={low}
                    maxLength={maxLength}
                    onChange={(event) => {
                      onTyped(event.currentTarget.value);
                      fit();
                      onChange?.(event);
                    }}
                  />
                }
                className={cn(
                  styles.input({ className: blocking && 'cursor-progress' }),
                  inputProps?.className
                )}
                style={style}
                disabled={disabled}
                // required はブラウザのネイティブな検証を起こすので渡さない（design/adr/0255 の影響）
                // aria-required だけで必須であることを伝える
                required={false}
                aria-required={field?.required || undefined}
                readOnly={blocking || readOnly}
                aria-disabled={blocking || ariaDisabled}
                aria-invalid={(over && overCountInvalid) || ariaInvalid}
                aria-busy={loading || ariaBusy}
                aria-describedby={describedBy}
                value={value}
                defaultValue={defaultValue}
                onValueChange={onValueChange && ((next) => onValueChange(next))}
              />
            </BaseScrollArea.Content>
          </BaseScrollArea.Viewport>
          <BaseScrollArea.Scrollbar orientation="vertical" className={scrollStyles.scrollbar()}>
            <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={scrollStyles.thumb()} />
          </BaseScrollArea.Scrollbar>
        </BaseScrollArea.Root>
        {/* 待っているあいだの印と成功のチェック（design/adr/0042・ADR-0058）。
                1 行の欄では右端（suffix の前）に置くが、Textarea は高さがあるので、本体の右上に置く */}
        {(loading && loadingIndicator === 'spinner') ||
        (successText && !hideSuccessMark && !errorText && !loading) ? (
          <span className="pointer-events-none absolute end-0 top-0 flex h-(--spacing-control) items-center pe-[calc(var(--spacing-control-x)-var(--field-border-width))]">
            {loading ? <FieldSpinner /> : <FieldSuccessMark />}
          </span>
        ) : null}
        {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
      </div>
      <FieldCount {...count} />
    </>
  );
}

/** Textarea の props から、label・accessibleName の組み合わせの決まりを外したもの */
export type TextareaBaseProps = Omit<TextareaControlProps, 'className'> &
  Omit<InputFieldProps, 'prefix' | 'suffix' | 'addonShape' | 'placeholder'> & {
    /** 中の textarea に渡すもの（class・data-*・autoComplete など）。欄の外枠には className を使います */
    inputProps?: ComponentProps<'textarea'>;
  };

/** Textarea の props。label か accessibleName のどちらかが要ります */
export type TextareaProps = FieldNamed<TextareaBaseProps>;

/**
 * 複数行のテキスト入力。見た目・状態・ラベルとキャプションの並びは TextField と同じです
 */
export function Textarea(props: TextareaProps) {
  const [field, control] = splitFieldProps(props as TextareaBaseProps);
  // 文字数の上限（maxCount）を超えたら、欄をエラーの状態にする（overCountInvalid）。本体と同じく、打った値の文字を数える
  const { length, onTyped } = useTypedCount(control.value, control.defaultValue);
  const over = isOverCount(length, control.maxCount);
  const { onValueChange } = control;
  return (
    <Field {...field} invalid={over && (control.overCountInvalid ?? true)}>
      {() => (
        <TextareaControl
          {...control}
          onValueChange={(next) => {
            onTyped(next);
            onValueChange?.(next);
          }}
        />
      )}
    </Field>
  );
}
