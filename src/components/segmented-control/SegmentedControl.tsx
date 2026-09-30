'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type Ref,
  useContext,
  useMemo,
  useRef,
} from 'react';

import { useSegmentedKnob } from './use-segmented-knob';
import { focusRing } from '../../internal/focus-styles';
import {
  type CaptionPlacement,
  Field,
  type FieldLabelLayoutProps,
  type FieldValidate,
  type FieldValidationMode,
  useFieldControlKind,
  useFieldState,
} from '../../internal/field/Field';
import type { FieldMarkProps } from '../../internal/field/FieldMark';
import {
  type FieldMessage,
  type FieldNamed,
  splitFieldProps,
} from '../../internal/field/input-field-props';
import { useChoiceLock } from '../../internal/form-context';
import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';

// SegmentedControl: 必ずどれか 1 つを選ぶ切り替え。値は design/tokens.css の --segmented-control-*
//   振る舞いと読み上げは Base UI の RadioGroup・Radio（role="radiogroup"・"radio"。矢印キーで移り、移った項目を選ぶ）
//   ToggleGroup（押す・外すボタンの並び）とは別の部品。選んでいるものをもう一度押しても外れず、値は空にならない
//   見た目: 入力欄と同じグレーの溝に、選んだ項目の下地（つまみ）を 1 つだけ置き、選んだ項目へ滑らせる（原則14。Tabs の印と同じ長さ・緩急）
//     つまみは 1 つの要素で描き、位置は use-segmented-knob.ts が測って CSS 変数に書く。測るまでは選んだ項目が自分で下地を塗る
//     つまみの面は variant（surface: 白い面と薄い影。filled: 部品の色の濃い塗り。soft: 部品の色の淡い面）、色は color（原則6）
//   項目は平らな押すもの: 選んでいない項目は hover で本文の色を淡く敷き、押すと沈む。選んだ項目は押しても変わらないので、hover も沈みもしない（原則3）
//   選んだ項目の文字は太くする。太くしても幅が変わらないよう、太字の写しを見えないまま重ねて幅を取っておく（Tabs と同じ）
//   押せない・読み取り専用・Form の送信中は、溝を押せない欄のグレーにし、つまみの影を消して色を薄くする（原則13・原則8）。位置で見分ける
//   エラーは溝を入力欄のエラーの淡い赤にする
//   形の props は、既定の値では何も足さず tokens.css の値のまま描き、ほかの値のときだけ部品の中で CSS 変数を差し替える
//     shape（溝の形。square（部品の角）が既定、circle（両端が丸い形）も選べる）・itemWidth（項目の幅。equal が既定、fit も選べる）
//     frame（溝の見せ方。field が既定、outline も選べる）・showDivider（選んでいない項目のあいだの仕切りの線）

export type SegmentedControlColor = 'neutral' | 'primary' | 'secondary';

/**
 * 選んだ項目の下地（つまみ）の面。surface: 白い面と薄い影（溝の中に浮く）。filled: 部品の色の濃い塗り。soft: 部品の色の淡い面
 */
export type SegmentedControlVariant = 'surface' | 'filled' | 'soft';

/** 溝の形。square は入力欄・ボタンと同じ角、circle は両端が丸い形（pill）。つまみと項目は同心の角になる */
export type SegmentedControlShape = 'square' | 'circle';

/** 項目の幅。equal はいちばん長い項目にそろえた均等、fit は文字に合わせる */
export type SegmentedControlItemWidth = 'equal' | 'fit';

/** 溝の見せ方。field は入力欄と同じグレーで塗る、outline は塗らずに細い境界線で囲む */
export type SegmentedControlFrame = 'field' | 'outline';

/** 選んだ項目が変わったときのつまみの動き。slide: 滑って移る（既定）。none: 動かさずすぐ切り替える */
export type SegmentedControlIndicatorMotion = 'slide' | 'none';

const segmented = tv({
  slots: {
    root: [
      'relative isolate inline-grid w-fit max-w-full auto-cols-(--segmented-control-columns) grid-flow-col items-stretch',
      'h-(--spacing-control) rounded-(--segmented-control-radius) p-(--segmented-control-pad)',
      'bg-(color:--segmented-control-bg) [--segmented-control-bg:var(--segmented-control-track-bg)]',
      'border-(length:--segmented-control-track-border-width) border-(color:--segmented-control-track-border-color)',
      // 項目とつまみの角は、溝の角から内側の余白を引いた同心の角（原則5）
      '[--segmented-control-item-radius:max(0px,calc(var(--segmented-control-radius)-var(--segmented-control-pad)-var(--segmented-control-track-border-width)))]',
      // エラー: 入力欄のエラーと同じ淡い赤
      'data-invalid:[--segmented-control-bg:var(--color-field-invalid)]',
      // 押せない・読み取り専用・送信中: 押せない欄のグレー。つまみは影を消し、色を薄くする（原則13）
      'data-disabled:[--segmented-control-bg:var(--color-field-disabled)]',
      'data-disabled:[--segmented-control-knob-opacity-now:var(--disabled-opacity)] data-disabled:[--segmented-control-knob-shadow-now:none]',
      '[--segmented-control-knob-opacity-now:1] [--segmented-control-knob-shadow-now:var(--segmented-control-knob-shadow-on)]',
      // 測るまでは、選んだ項目が自分で下地を塗る（つまみは出さない）
      '[&:not([data-knob-ready])_[data-slot=segmented-control-item][data-checked]]:bg-(color:--segmented-control-knob-bg)',
      '[&:not([data-knob-ready])_[data-slot=segmented-control-item][data-checked]]:shadow-(--segmented-control-knob-shadow-now)',
    ],
    knob: [
      'pointer-events-none absolute z-0 rounded-(--segmented-control-item-radius)',
      'top-(--segmented-control-knob-y) left-(--segmented-control-knob-x) h-(--segmented-control-knob-h) w-(--segmented-control-knob-w)',
      'bg-(color:--segmented-control-knob-bg) shadow-(--segmented-control-knob-shadow-now)',
      'opacity-[calc(var(--segmented-control-knob-opacity,0)*var(--segmented-control-knob-opacity-now))]',
      'in-data-knob-ready:[transition:left_var(--segmented-control-knob-motion)_var(--segmented-control-knob-ease),width_var(--segmented-control-knob-motion)_var(--segmented-control-knob-ease),top_var(--segmented-control-knob-motion)_var(--segmented-control-knob-ease),height_var(--segmented-control-knob-motion)_var(--segmented-control-knob-ease)]',
      'motion-reduce:[transition:none]',
    ],
    // 項目の升（Field.Item）。仕切りの線を描く。選んだ項目と、その隣では線を消す
    cell: [
      'relative flex min-w-0',
      "before:pointer-events-none before:absolute before:inset-y-[25%] before:-left-[calc(var(--segmented-control-divider-width)/2)] before:w-(--segmented-control-divider-width) before:bg-line before:content-['']",
      'first-of-type:before:hidden has-[[data-checked]]:before:opacity-0 [[data-slot=segmented-control-cell]:has([data-checked])+&]:before:opacity-0',
    ],
    item: [
      'relative z-1 inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center whitespace-nowrap select-none',
      'rounded-(--segmented-control-item-radius) px-(--spacing-control-x)',
      'text-(length:--text-control) leading-(--leading-control) text-fg-muted',
      // 選んだ項目: 太く、つまみの上の文字の色
      'data-checked:cursor-default data-checked:font-bold data-checked:text-(color:--segmented-control-knob-fg)',
      // hover と押下は、選んでいない押せる項目だけ（平らな押すもの。原則3）
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'not-data-checked:not-data-disabled:hover:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),transparent)]',
      'not-data-checked:not-data-disabled:active:translate-y-(--flat-press-depth) not-data-checked:not-data-disabled:active:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),transparent)]',
      // 押せない項目（グループごと、または 1 つだけ）
      'data-disabled:cursor-not-allowed data-disabled:text-on-field-disabled',
      'data-disabled:data-checked:text-(color:--segmented-control-knob-fg-disabled)',
      '[--focus-ring-offset:var(--segmented-control-focus-offset)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
    ],
    // 見える中身と、幅を取っておく太字の写し（同じ升に重ねる）
    inner: 'inline-grid',
    label: 'col-start-1 row-start-1 inline-flex items-center justify-center gap-2',
    sizer:
      'invisible col-start-1 row-start-1 inline-flex items-center justify-center gap-2 font-bold',
    icon: 'inline-flex shrink-0 [&_svg]:size-(--spacing-icon)',
  },
  variants: {
    // 部品の色（原則6）。own は濃い塗り、own-fg はその上の文字、own-subtle は淡い面、own-text は白い面・淡い面の上の文字
    color: {
      neutral: {
        root: [
          '[--segmented-control-own-fg:var(--color-on-neutral-strong)] [--segmented-control-own:var(--color-neutral-strong)]',
          '[--segmented-control-own-subtle:var(--segmented-control-neutral-subtle)] [--segmented-control-own-text:var(--color-fg)]',
        ],
      },
      primary: {
        root: [
          '[--segmented-control-own-fg:var(--color-on-primary)] [--segmented-control-own:var(--color-primary)]',
          '[--segmented-control-own-subtle:var(--color-primary-subtle)] [--segmented-control-own-text:var(--color-on-primary-subtle)]',
          '[--color-own-focus:var(--color-primary)]',
        ],
      },
      secondary: {
        root: [
          '[--segmented-control-own-fg:var(--color-on-secondary)] [--segmented-control-own:var(--color-fg-secondary)]',
          '[--segmented-control-own-subtle:var(--color-secondary-subtle)] [--segmented-control-own-text:var(--color-on-secondary-subtle)]',
          '[--color-own-focus:var(--color-fg-secondary)]',
        ],
      },
    },
    // つまみの面。各案が --segmented-control-knob-bg・-fg・-shadow-on・-fg-disabled を決めきる
    variant: {
      surface: {
        root: [
          '[--segmented-control-knob-bg:var(--color-surface)] [--segmented-control-knob-fg:var(--segmented-control-own-text)]',
          '[--segmented-control-knob-fg-disabled:var(--color-on-field-disabled)] [--segmented-control-knob-shadow-on:var(--segmented-control-knob-shadow)]',
        ],
      },
      filled: {
        root: [
          '[--segmented-control-knob-bg:var(--segmented-control-own)] [--segmented-control-knob-fg:var(--segmented-control-own-fg)]',
          '[--segmented-control-knob-fg-disabled:var(--segmented-control-own-fg)] [--segmented-control-knob-shadow-on:none]',
        ],
      },
      soft: {
        root: [
          '[--segmented-control-knob-bg:var(--segmented-control-own-subtle)] [--segmented-control-knob-fg:var(--segmented-control-own-text)]',
          '[--segmented-control-knob-fg-disabled:var(--color-on-field-disabled)] [--segmented-control-knob-shadow-on:none]',
        ],
      },
    },
    // 形。既定の値（square・equal・field・線なし）は tokens.css の値のまま描く
    shape: {
      square: {},
      circle: { root: '[--segmented-control-radius:var(--radius-pill)]' },
    },
    itemWidth: {
      equal: {},
      fit: { root: '[--segmented-control-columns:auto]' },
    },
    frame: {
      field: {},
      outline: {
        root: '[--segmented-control-track-bg:transparent] [--segmented-control-track-border-width:var(--border-width-thin)]',
      },
    },
    showDivider: {
      false: {},
      true: { root: '[--segmented-control-divider-width:var(--border-width-thin)]' },
    },
    // つまみの動き。none はすぐ切り替える。動きを減らす設定では、値によらず動かさない
    indicatorMotion: {
      slide: { root: '[--segmented-control-knob-motion:var(--segmented-control-knob-duration)]' },
      none: { root: '[--segmented-control-knob-motion:0ms]' },
    },
  },
  defaultVariants: {
    color: 'neutral',
    variant: 'surface',
    shape: 'square',
    itemWidth: 'equal',
    frame: 'field',
    showDivider: false,
    indicatorMotion: 'slide',
  },
});

const SegmentedControlContext = createContext<{ readOnly?: boolean } | null>(null);

/** SegmentedControl の本体（SegmentedControlControl）の props。見出し・キャプション・状態の文・押せない・必須は、包む Field に渡します */
export interface SegmentedControlControlProps<Value> extends Omit<
  ComponentProps<'div'>,
  'className' | 'color' | 'defaultValue' | 'onChange' | 'children'
> {
  /** 選んでいる値（制御） */
  value?: Value;
  /** はじめに選んでいる値（非制御）。必ずどれかを選んでおくため、どれかの項目の value を渡します */
  defaultValue?: Value;
  /** 選ぶ項目が変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: Value) => void;
  /** 属するフォームの id。フォームの外に置くときに使います */
  form?: string;
  /** 隠れた input への ref。フォーカスや検証の API に触るときに使います */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * 読み取り専用にします。押せないとき（`disabled`）と同じ見た目になりますが、フォーカスでき、
   * 読み上げでは「読み取り専用」と伝わります。押しても矢印キーでも選び直せません。フォームでは値が送られます
   * @default false
   */
  readOnly?: boolean;
  /**
   * 選んだ項目の色（原則6）。利用者が選ぶ primary・secondary に加え、色を持たない neutral を選べます。
   * variant="surface" では文字の色、filled・soft ではつまみの塗りに出ます
   * @default 'neutral'
   */
  color?: SegmentedControlColor;
  /**
   * 選んだ項目の下地（つまみ）の面。surface は白い面と薄い影で溝の中に浮かせ、filled は部品の色の濃い塗り、
   * soft は部品の色の淡い面にします
   * @default 'surface'
   */
  variant?: SegmentedControlVariant;
  /**
   * 溝の形。square は入力欄・ボタンと同じ角、circle は両端が丸い形（pill）にします。つまみと項目の角は、溝の角に合わせた同心の角になります
   * @default 'square'
   */
  shape?: SegmentedControlShape;
  /**
   * 項目の幅。equal はいちばん長い項目にそろえて均等にし、fit は項目ごとに文字の幅に合わせます
   * @default 'equal'
   */
  itemWidth?: SegmentedControlItemWidth;
  /**
   * 溝の見せ方。field は入力欄と同じグレーで塗り、outline は塗らずに細い境界線で囲みます
   * @default 'field'
   */
  frame?: SegmentedControlFrame;
  /**
   * 選んでいない項目どうしのあいだに、仕切りの細い線を引きます。つまみの両隣では消えます
   * @default false
   */
  showDivider?: boolean;
  /**
   * 選ぶ項目が変わったときのつまみの動き。slide は選んだ項目へ滑って移り、none はすぐ切り替えます。
   * 動きを減らす設定では、値によらず動かしません
   * @default 'slide'
   */
  indicatorMotion?: SegmentedControlIndicatorMotion;
  /** 並べる項目。SegmentedControlItem を value 付きで置きます */
  children: ReactNode;
}

/**
 * SegmentedControl の本体（組み立て用）。Field の中に置き、見出し・キャプション・状態の行は FieldLabel などで並べます。
 * 見出しはグループ（role="radiogroup"）の名前になり、キャプションと状態の行はグループにだけつなぎます
 */
export function SegmentedControlControl<Value>({
  value,
  defaultValue,
  onValueChange,
  form,
  inputRef,
  readOnly,
  color,
  variant,
  shape,
  itemWidth,
  frame,
  showDivider,
  indicatorMotion,
  children,
  ref,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SegmentedControlControlProps<Value>) {
  // 見出しは <label> ではなく、グループの名前として付ける。キャプションはグループにだけ付ける（原則15）
  useFieldControlKind({ nativeLabel: false, registerCaption: false });
  const field = useFieldState();
  const disabled = field?.disabled;
  // Form の送信中と読み取り専用は、選び直し（矢印キーを含む）を止め、押せないときと同じ見た目にする（原則8・原則13）
  const locked = useChoiceLock(disabled, readOnly);
  const context = useMemo(() => ({ readOnly: locked.readOnly }), [locked.readOnly]);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  useSegmentedKnob(rootRef);
  const s = segmented({ color, variant, shape, itemWidth, frame, showDivider, indicatorMotion });
  return (
    <SegmentedControlContext.Provider value={context}>
      <BaseRadioGroup<Value>
        {...props}
        ref={mergedRef}
        data-slot="segmented-control"
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
        form={form}
        inputRef={inputRef}
        disabled={disabled}
        // required は中の Radio の隠れた input にネイティブの required を付けてしまう（design/adr/0255 の影響）。
        // 渡さず、aria-required だけを直に付ける
        required={false}
        aria-required={field?.required || undefined}
        readOnly={locked.readOnly}
        aria-disabled={locked.ariaDisabled}
        aria-describedby={
          [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined
        }
        data-invalid={field?.invalid && !disabled ? '' : undefined}
        {...locked.data}
        className={s.root()}
      >
        <span aria-hidden data-slot="segmented-control-knob" className={s.knob()} />
        {children}
      </BaseRadioGroup>
    </SegmentedControlContext.Provider>
  );
}

export interface SegmentedControlItemProps extends Omit<
  ComponentProps<'span'>,
  'className' | 'color' | 'value' | 'onChange'
> {
  /** この項目の値。SegmentedControl の value と突き合わせ、選ばれているかが決まります */
  value: unknown;
  /**
   * 押せなくします。矢印キーでは飛ばします
   * @default false
   */
  disabled?: boolean;
  /** 文字の前に置くアイコン。部品の中の文字と並ぶ大きさになります。アイコンだけの項目には aria-label で名前を付けます */
  icon?: ReactNode;
  /** 項目の文字 */
  children?: ReactNode;
  /** 項目（role="radio" の要素）に付きます */
  className?: string;
}

/**
 * SegmentedControl の項目。SegmentedControl の中に value 付きで並べます
 */
export function SegmentedControlItem({
  value,
  disabled,
  icon,
  children,
  className,
  ...props
}: SegmentedControlItemProps) {
  const group = useContext(SegmentedControlContext);
  const s = segmented();
  const content = (
    <>
      {icon && <span className={s.icon()}>{icon}</span>}
      {children}
    </>
  );
  return (
    // 項目ごとに Field.Item で包み、グループの見出しと説明が項目 1 つずつの名前・説明に入らないようにする（原則15）
    <BaseField.Item disabled={disabled} data-slot="segmented-control-cell" className={s.cell()}>
      <BaseRadio.Root
        {...props}
        value={value}
        disabled={disabled}
        readOnly={group?.readOnly}
        data-slot="segmented-control-item"
        className={s.item({ className })}
      >
        <span className={s.inner()}>
          <span className={s.label()}>{content}</span>
          <span aria-hidden="true" className={s.sizer()}>
            {content}
          </span>
        </span>
      </BaseRadio.Root>
    </BaseField.Item>
  );
}

/** SegmentedControl の props から、label・accessibleName の組み合わせの決まりを外したもの */
export interface SegmentedControlBaseProps<Value>
  extends SegmentedControlControlProps<Value>, FieldMarkProps, FieldLabelLayoutProps {
  /** 見出し（太字）。グループ（role="radiogroup"）の名前になります */
  label?: ReactNode;
  /** 読み上げだけの名前。見える見出しを置かないとき（表示の切り替えなど）に要ります */
  accessibleName?: string;
  /** 見出しの補足（ヘルプテキスト） */
  caption?: ReactNode;
  /**
   * キャプションの場所。top は見出しと本体のあいだ、bottom は本体の下
   * @default 'top'
   */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。本体の下に丸の「!」と赤い文字で出し、溝を淡い赤にします */
  errorText?: FieldMessage;
  /** 警告の内容。本体の下に三角とオリーブ色の文字で出します。本体の見た目は変えません */
  warningText?: FieldMessage;
  /** 情報の内容。本体の下に丸の「i」と青い文字で出します。本体の見た目は変えません */
  infoText?: FieldMessage;
  /** フォームに送るときの名前 */
  name?: string;
  /** 値を確かめる関数です。選んでいる値とフォーム全体の値を受け取り、正しくないときはエラーの文を返します */
  validate?: FieldValidate;
  /**
   * 検証のタイミングです。Form の validationMode より、この指定が勝ちます
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * validationMode="onChange" のとき、validate を呼ぶまでの待ち時間（ミリ秒）です
   * @default 0
   */
  validationDebounceTime?: number;
  /**
   * 押せない（Disabled）状態にします。溝が押せない欄のグレーになり、つまみの影が消えます
   * @default false
   */
  disabled?: boolean;
  /**
   * 必須にします。グループに aria-required を付け、見出しの後ろに印を出します
   * @default false
   */
  required?: boolean;
  /** いちばん外の要素（見出し・本体・下の行をまとめた縦の並び）に付きます */
  className?: string;
}

/** SegmentedControl の props。label か accessibleName のどちらかが要ります */
export type SegmentedControlProps<Value> = FieldNamed<SegmentedControlBaseProps<Value>>;

/**
 * 必ずどれか 1 つを選ぶ切り替え。溝の中に項目を並べ、選んだ項目の下地（つまみ）がそこへ滑ります。
 * 読み上げはラジオのグループで、矢印キーで移ると、移った項目を選びます。選んでいる項目をもう一度押しても外れません
 */
export function SegmentedControl<Value>(props: SegmentedControlProps<Value>) {
  const [field, control] = splitFieldProps(props as SegmentedControlBaseProps<Value>);
  return (
    <Field {...field} nativeLabel={false} registerCaption={false}>
      {() => <SegmentedControlControl<Value> {...control} />}
    </Field>
  );
}
