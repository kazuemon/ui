import { Field as BaseField } from '@base-ui/react/field';
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import {
  type ComponentProps,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';

import { type CaptionPlacement, Field } from '../../internal/field/Field';
import { controlBox } from '../../internal/field/field-styles';
import { useFormSubmittingLock } from '../../internal/form-context';
import { scrollAreaStyles } from '../../internal/scroll-area-styles';
import { tv } from '../../internal/tv';
import { countGraphemes } from './count-graphemes';
import { useAutoHeight } from './use-auto-height';

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
    count:
      'self-end text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle tabular-nums',
    // 上限を超えた数（文字数の表示の左の数）。エラーの文字と同じ赤
    countOver: 'text-fg-danger',
    // 上限に近づいた数。警告は送信を止めないので、欄の見た目は変えず、数だけを警告の色にする（原則4）
    countNear: 'text-fg-warning',
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

export interface TextareaProps extends Omit<
  ComponentProps<'textarea'>,
  'className' | 'children' | 'rows'
> {
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない */
  caption?: ReactNode;
  /**
   * 空の欄に出す見本の文字。値と見分けられるよう、「例: UI を作っています」のように、見本だと分かる書き方にします。
   * 色は、文字の基準（4.5:1）を保つ淡さまでしか淡くできないため、書き方でも値と区別します
   */
  placeholder?: string;
  /**
   * キャプションの場所。top はラベルと本体のあいだ、bottom は本体の下
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。本体の下に丸の「!」と赤い文字で出し、欄をエラーの状態にする */
  error?: ReactNode;
  /** 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えない */
  warning?: ReactNode;
  /** 成功の内容。本体の下に丸のチェックと緑の文字で出す。欄の見た目は変えない */
  success?: ReactNode;
  /** 情報の内容。本体の下に丸の「i」と青い文字で出す。欄の見た目は変えない */
  info?: ReactNode;
  className?: string;
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
  /**
   * 文字数の上限。超えても打つのは止めず（貼り付けたあとで削れるように）、超えているあいだは文字数を必ず出して、数を赤にします。
   * 超えたとき・戻ったときは読み上げでも知らせます。欄の見た目は overCountInvalid で決めます。送信を止めるのは使う側です（超えていたら error を渡す）。
   * 打てなくする上限は、ブラウザの maxLength を使います
   */
  maxCount?: number;
  /**
   * maxCount を超えているあいだ、欄をエラーの状態（赤い枠線・aria-invalid）にするか。エラーの行は出しません。
   * false のときは、数を赤にするだけで、欄は変えません
   * @default true
   */
  overCountInvalid?: boolean;
  /**
   * 上限まで残りこの文字数になったら、上限に近づいたことを予告します。予告のあいだは showCount がなくても文字数を出し、
   * 数を警告の色にします。欄の見た目は変えません（警告は送信を止めないため）。0 を渡すと予告しません
   * @default Math.ceil(上限 / 10)（上限の 10%）
   */
  warnRemaining?: number;
  /**
   * 文字数を本体の右下の下に「12 / 200」の形で出すか。上限（maxCount か maxLength）があるときだけ出します。
   * maxCount を超えているあいだは、false でも出します
   * @default false
   */
  showCount?: boolean;
}

/**
 * 複数行のテキスト入力。見た目・状態・ラベルとキャプションの並びは TextField と同じです
 */
export function Textarea({
  label,
  caption,
  captionPlacement,
  error,
  warning,
  success,
  info,
  disabled,
  className,
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
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  'aria-invalid': ariaInvalid,
  ...props
}: TextareaProps) {
  const id = useId();
  // Form の送信中（ADR-0059）。押せない欄と同じ見た目にし、書き換えを止める。フォーカスは外さない
  const blocking = useFormSubmittingLock().blocking;
  const [manual, setManual] = useState(false);
  // 押せないとき・止めているあいだは、つまみも使えない
  const canResize = resizable && !disabled && !blocking;
  const styles = textarea({ resizable: canResize, manual: canResize && manual });
  const scrollStyles = scrollAreaStyles({ scrollbar: 'always' });
  const low = Math.max(1, minRows);
  const high = Math.max(low, maxRows);

  const { ref: autoHeightRef, fit } = useAutoHeight();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const setInput = useCallback(
    (element: HTMLTextAreaElement | null) => {
      inputRef.current = element;
      autoHeightRef(element);
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
    },
    [autoHeightRef, ref]
  );

  // 枠の上を押したとき。右下のつまみなら、利用者が高さを決めたとみなす。
  // それ以外（つまみで広げて、中身の下に空いたところ）は、欄にフォーカスを移す
  const onViewportPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const corner = 20;
    if (canResize && event.clientX > rect.right - corner && event.clientY > rect.bottom - corner) {
      setManual(true);
      return;
    }
    event.preventDefault();
    inputRef.current?.focus();
  };

  // 文字数。値を渡されたときはその長さ、渡されないときは打った長さを数える。数えるのは見えている文字（書記素）
  const [typed, setTyped] = useState(() => countGraphemes(String(defaultValue ?? '')));
  const length = value != null ? countGraphemes(String(value)) : typed;
  // 上限は、柔らかい上限（maxCount）を先に使う。maxLength はブラウザが打つのを止めるので、超えない
  const limit = maxCount ?? maxLength;
  const over = maxCount != null && length > maxCount;
  // 上限に近づいたことの予告。残りが warnRemaining 以下になったら、数を警告の色にして出す
  //   既定は上限の 10%（上限が小さい欄で、打ちはじめから警告にならない割合）。空のうちは予告しない
  const nearAt = warnRemaining ?? (limit != null ? Math.ceil(limit / 10) : 0);
  const near = !over && limit != null && nearAt > 0 && length > 0 && limit - length <= nearAt;
  const counted = (showCount && limit != null) || over || near;
  const countId = `${id}count`;
  // 超えたとき・戻ったときに、1 回だけ読み上げで知らせる（打つたびには知らせない — ADR-0044 と同じく polite）
  // 初めから超えているとき（値を入れて描いたとき）は知らせず、フォーカスしたときの説明で伝える
  const [overState, setOverState] = useState({ over, notice: '' });
  if (overState.over !== over) {
    setOverState({
      over,
      notice: over ? `${maxCount}文字を超えています` : `${maxCount}文字以内に戻りました`,
    });
  }
  const describe = (messageIds: string | undefined) =>
    [ariaDescribedBy, counted ? countId : undefined, messageIds].filter(Boolean).join(' ') ||
    undefined;
  return (
    <Field
      label={label}
      caption={caption}
      captionPlacement={captionPlacement}
      error={error}
      invalid={over && overCountInvalid}
      warning={warning}
      success={success}
      info={info}
      disabled={disabled}
      className={className}
    >
      {(messageIds) => (
        <>
          <div
            data-slot="control"
            data-field-readonly={readOnly || undefined}
            className={controlBox({ className: styles.box() })}
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
                        {...props}
                        ref={setInput}
                        rows={low}
                        maxLength={maxLength}
                        onChange={(event) => {
                          setTyped(countGraphemes(event.currentTarget.value));
                          fit();
                          onChange?.(event);
                        }}
                      />
                    }
                    className={styles.input({ className: blocking && 'cursor-progress' })}
                    style={style}
                    disabled={disabled}
                    readOnly={blocking || readOnly}
                    aria-disabled={blocking || ariaDisabled}
                    aria-invalid={(over && overCountInvalid) || ariaInvalid}
                    aria-describedby={describe(messageIds)}
                    value={value}
                    defaultValue={defaultValue}
                  />
                </BaseScrollArea.Content>
              </BaseScrollArea.Viewport>
              <BaseScrollArea.Scrollbar orientation="vertical" className={scrollStyles.scrollbar()}>
                <BaseScrollArea.Thumb
                  data-slot="scroll-area-thumb"
                  className={scrollStyles.thumb()}
                />
              </BaseScrollArea.Scrollbar>
            </BaseScrollArea.Root>
          </div>
          {counted && (
            // 読み上げは欄の説明として、フォーカスしたときに 1 回読む（打つたびには知らせない）
            // 超えたことは、数の赤だけでなく文でも伝える
            <div id={countId} className={styles.count()}>
              <span aria-hidden>
                <span className={over ? styles.countOver() : near ? styles.countNear() : undefined}>
                  {length}
                </span>{' '}
                / {limit}
              </span>
              <span className="sr-only">
                {over
                  ? `${limit}文字を超えています。いま${length}文字`
                  : near
                    ? `${limit}文字まで。いま${length}文字。残り${limit - length}文字`
                    : `${limit}文字まで。いま${length}文字`}
              </span>
            </div>
          )}
          {maxCount != null && (
            // 超えた・戻ったの知らせ。いつも置いた live region に文を入れる（ADR-0044 と同じ）
            <div aria-live="polite" className="sr-only">
              {overState.notice}
            </div>
          )}
        </>
      )}
    </Field>
  );
}
