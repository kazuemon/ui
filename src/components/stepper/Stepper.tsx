'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  type ComponentProps,
  createContext,
  type ReactElement,
  type ReactNode,
  use,
  useId,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CheckMarkIcon, WarningCircleIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';

// 複数の段階の進み具合を示すナビゲーション（フォームのウィザードなど）。Tabs（同じ場所の中身を切り替える）とは違い、
//   Stepper は中身を持たず、印だけを並べる。中身の切り替えは使う側が value を見て行う（原則20: 部品は知らないことを決めない）
// 構造は <nav aria-label><ol><li>。役割は tablist/tab ではなく「進行状況」なので、各段は aria-current="step" を持つ
//   （原則にない判断ではなく、ARIA の aria-current の値そのものに step が定義されている）
// value は常に制御（いまの段の index）。ほかのライブラリ（MUI・Mantine・Ant Design）も同じ形で、defaultValue・非制御は持たない
// 段の状態（upcoming・current・completed）は、value と StepperStep の並び順（index）から内部で決める（Tabs の active に近い考え方）
//   クリックでの遷移は value を書き換えず、onStepClick(index) で使う側に知らせる（Mantine の onStepClick・Ant Design の onChange と同じ考え方）
//   onStepClick を渡したときだけ、完了した段（既定）が押せるボタンになる。渡さなければ、すべての段が表示専用（Ant Design の onChange と同じ）
// マーカー（印）は upcoming はグレーの輪郭、current は部品の色の塗り、completed は部品の色の塗り（variant="check" ならチェックに差し替え）
//   invalid（段ごと）は位置に関わらず danger の色と warning の印にする（原則6: 危険は明度を落とした赤）
// 連結線（connector）は、マーカーの左右（横並び）・上下（縦並び）半分ずつ。自分の状態だけで色が決まる
//   （before は「upcoming でない」＝進捗がここまで来た、after は「completed」＝ここを通り過ぎた）ので、隣の段の状態を見なくてよい
// 横並び（既定）はマーカーを上、ラベルを下（中央そろえ）。縦並びはマーカーを左、ラベルを右（Steps・Timeline と同じ考え方）
// フォーカスの線は、クリックできる段のボタン全体（マーカー＋ラベル）を囲む（focusRing）
const stepper = tv({
  slots: {
    root: 'w-full',
    list: 'flex list-none gap-(--stepper-gap) p-0',
    item: [
      'relative flex flex-1',
      'data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:items-center',
      'data-[orientation=vertical]:flex-none data-[orientation=vertical]:items-start',
    ],
    // 連結線（自分の状態だけで色が決まる）。横並びはマーカーの左右半分、縦並びはマーカーの下から次の段まで
    //   横並びは、段どうしのあいだ（ol の flex gap）の半分まで線を伸ばし、隣の段の線と gap の真ん中で継ぎ目なくつながる
    connectorBefore: [
      'absolute bg-(color:--stepper-line-color)',
      'data-[orientation=horizontal]:top-[calc(var(--stepper-marker-size)/2-var(--stepper-line-width)/2)] data-[orientation=horizontal]:h-(--stepper-line-width)',
      'data-[orientation=horizontal]:start-[calc(var(--stepper-gap)/-2)] data-[orientation=horizontal]:w-[calc(50%+var(--stepper-gap)/2-var(--stepper-marker-size)/2)]',
      'data-[orientation=vertical]:hidden',
    ],
    connectorAfter: [
      'absolute bg-(color:--stepper-line-color)',
      'data-[orientation=horizontal]:top-[calc(var(--stepper-marker-size)/2-var(--stepper-line-width)/2)] data-[orientation=horizontal]:h-(--stepper-line-width)',
      'data-[orientation=horizontal]:start-[calc(50%+var(--stepper-marker-size)/2)] data-[orientation=horizontal]:w-[calc(50%+var(--stepper-gap)/2-var(--stepper-marker-size)/2)]',
      // 縦並び: マーカーは control の先頭（items-start）に上端がそろうので、マーカーの下端は li の上端 + マーカーの高さ
      //   次の段の li は、この li の下端 + gap（ol の flex gap）から始まる。線は、その手前・先で少し離す（line-gap）
      'data-[orientation=vertical]:start-[calc(var(--stepper-marker-size)/2-var(--stepper-line-width)/2)] data-[orientation=vertical]:top-[calc(var(--stepper-marker-size)+var(--stepper-line-gap))] data-[orientation=vertical]:bottom-[calc(var(--stepper-line-gap)-var(--stepper-gap))] data-[orientation=vertical]:w-(--stepper-line-width)',
    ],
    // クリックできる段はボタン、そうでない段は div。どちらも同じ見た目
    control: [
      'relative z-1 flex cursor-default items-start gap-(--stepper-label-gap) rounded-(--radius-control)',
      'data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:items-center',
      'data-[clickable]:cursor-pointer',
      // hover・押下は、クリックできる段だけ（原則3）。塗りは --flat-bg（ADR-0112）
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'data-[clickable]:hover:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),transparent)]',
      'data-[clickable]:active:translate-y-(--flat-press-depth) data-[clickable]:active:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),transparent)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
    ],
    marker: [
      'inline-flex size-(--stepper-marker-size) shrink-0 items-center justify-center rounded-pill',
      'text-(length:--stepper-marker-text) leading-none font-bold tabular-nums',
      'bg-(color:--stepper-marker-bg) text-(color:--stepper-marker-fg)',
      '[box-shadow:inset_0_0_0_var(--stepper-marker-ring)_var(--stepper-marker-ring-color)]',
      // invalid は位置に関わらず danger（あとに置いて勝たせる — choice-styles の data-invalid と同じ考え方）
      'data-invalid:[--stepper-marker-bg:var(--color-danger-subtle)] data-invalid:[--stepper-marker-fg:var(--color-fg-danger)]',
      'data-invalid:[box-shadow:none]',
    ],
    markerIcon: 'size-(--stepper-marker-icon-size)',
    content:
      'flex flex-col gap-0.5 data-[orientation=horizontal]:items-center data-[orientation=horizontal]:text-center',
    label:
      'text-(length:--text-control) leading-(--leading-control) text-(color:--stepper-label-color)',
    description: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
  },
  variants: {
    orientation: {
      horizontal: { list: 'items-start' },
      vertical: { list: 'flex-col' },
    },
    // 利用者が選ぶ色（原則6）。current・completed のマーカーに使う。指定しないときはグレー
    color: {
      neutral: {
        root: '[--stepper-own-fg:var(--color-on-neutral-strong)] [--stepper-own:var(--color-neutral-strong)]',
      },
      primary: {
        root: '[--stepper-own-fg:var(--color-on-primary)] [--stepper-own:var(--color-primary)]',
      },
      secondary: {
        root: '[--stepper-own-fg:var(--color-on-secondary)] [--stepper-own:var(--color-secondary)]',
      },
    },
    // 段の状態。upcoming はグレーの輪郭、current・completed は部品の色の塗り
    status: {
      upcoming: {
        marker:
          '[--stepper-marker-bg:transparent] [--stepper-marker-fg:var(--color-fg-muted)] [--stepper-marker-ring-color:var(--color-line-strong)] [--stepper-marker-ring:var(--border-width-medium)]',
        connectorBefore: '[--stepper-line-color:var(--color-line)]',
        connectorAfter: '[--stepper-line-color:var(--color-line)]',
        label: '[--stepper-label-color:var(--color-fg-muted)]',
      },
      current: {
        marker:
          '[--stepper-marker-bg:var(--stepper-own)] [--stepper-marker-fg:var(--stepper-own-fg)] [--stepper-marker-ring-color:transparent] [--stepper-marker-ring:0px]',
        connectorBefore: '[--stepper-line-color:var(--stepper-own)]',
        connectorAfter: '[--stepper-line-color:var(--color-line)]',
        label: 'font-bold [--stepper-label-color:var(--color-fg)]',
      },
      completed: {
        marker:
          '[--stepper-marker-bg:var(--stepper-own)] [--stepper-marker-fg:var(--stepper-own-fg)] [--stepper-marker-ring-color:transparent] [--stepper-marker-ring:0px]',
        connectorBefore: '[--stepper-line-color:var(--stepper-own)]',
        connectorAfter: '[--stepper-line-color:var(--stepper-own)]',
        label: '[--stepper-label-color:var(--color-fg)]',
      },
    },
    // 押せない段（その段の disabled）。押せないボタンと同じ薄さ（原則13）
    disabled: {
      true: {
        control: 'cursor-not-allowed',
        marker: [
          '[--stepper-marker-bg:var(--color-neutral)] [--stepper-marker-fg:var(--color-on-neutral-disabled)] [--stepper-marker-ring:0px]',
          '[box-shadow:none]',
        ],
        label: '[--stepper-label-color:var(--color-on-neutral-disabled)]',
      },
      false: {},
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    color: 'neutral',
    status: 'upcoming',
    disabled: false,
  },
});

/** 並べる向き。horizontal は横に並べる（既定）。vertical は縦に積む */
export type StepperOrientation = 'horizontal' | 'vertical';

export type StepperColor = 'neutral' | 'primary' | 'secondary';

/**
 * 完了した段のマーカー。number は数字のまま色だけ変える（既定）。check はチェックの印に差し替える
 */
export type StepperVariant = 'number' | 'check';

export type StepperStepStatus = 'upcoming' | 'current' | 'completed';

interface StepperContextValue {
  orientation: StepperOrientation;
  variant: StepperVariant;
}

const StepperContext = createContext<StepperContextValue>({
  orientation: 'horizontal',
  variant: 'number',
});

interface StepperItemContextValue {
  number: number;
  status: StepperStepStatus;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (() => void) | undefined;
}

const StepperItemContext = createContext<StepperItemContextValue>({
  number: 1,
  status: 'upcoming',
  isFirst: true,
  isLast: true,
  onSelect: undefined,
});

export interface StepperProps extends Omit<ComponentProps<'nav'>, 'color' | 'children'> {
  /** いまの段の index（0 から数える。常に制御） */
  value: number;
  /**
   * 完了した段（既定）を押せるボタンにし、押すとその段の index を渡して呼びます。値の変更はしません（呼んだ側が `value` を書き換えます）。
   * 渡さないときは、すべての段が表示専用になります
   */
  onStepClick?: (index: number) => void;
  /**
   * 並べる向き。horizontal は横に並べてラベルを下に、vertical は縦に積んでラベルを右に置きます
   * @default 'horizontal'
   */
  orientation?: StepperOrientation;
  /**
   * 色。current・completed のマーカーの色です。primary・secondary は利用者が選ぶ色で、指定しないときはグレー（neutral）です
   * @default 'neutral'
   */
  color?: StepperColor;
  /**
   * 完了した段のマーカー。number は数字のまま色だけ変え、check はチェックの印に差し替えます
   * @default 'number'
   */
  variant?: StepperVariant;
  /**
   * 並び（nav）の読み上げの名前。画面には出ません
   * @default '進み具合'
   */
  accessibleName?: string;
  /** 並べる StepperStep */
  children?: ReactNode;
  /** いちばん外の要素（nav）に付きます */
  className?: string;
}

/**
 * 複数の段階の進み具合を示すナビゲーションです。StepperStep を、進む順に並べます。
 * `value`（いまの段の index）は常に制御です。中身の切り替えは持たないので、それを見て使う側が出します。
 * `onStepClick` を渡すと、完了した段（既定）が押せるボタンになります
 */
export function Stepper({
  value,
  onStepClick,
  orientation = 'horizontal',
  color,
  variant = 'number',
  accessibleName = '進み具合',
  className,
  children,
  ...props
}: StepperProps) {
  const items = Children.toArray(children) as ReactElement<StepperStepProps>[];
  const s = stepper({ orientation, color });

  return (
    <nav
      {...props}
      aria-label={accessibleName}
      data-slot="stepper"
      className={s.root({ className })}
    >
      {/* list-style: none の ol を Safari が一覧として読むよう、role="list" を明示する（Steps・Timeline と同じ） */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol role="list" data-orientation={orientation} className={s.list()}>
        <StepperContext value={{ orientation, variant }}>
          {items.map((item, index) => {
            const status: StepperStepStatus =
              index < value ? 'completed' : index === value ? 'current' : 'upcoming';
            const clickable = onStepClick != null && !item.props.disabled && status === 'completed';
            return (
              <StepperItemContext
                key={item.key ?? index}
                value={{
                  number: index + 1,
                  status,
                  isFirst: index === 0,
                  isLast: index === items.length - 1,
                  onSelect: clickable ? () => onStepClick(index) : undefined,
                }}
              >
                {item}
              </StepperItemContext>
            );
          })}
        </StepperContext>
      </ol>
    </nav>
  );
}

export interface StepperStepProps extends Omit<ComponentProps<'li'>, 'title'> {
  /** 段のラベル */
  label: ReactNode;
  /** ラベルの下に添える説明 */
  description?: ReactNode;
  /**
   * 位置に関わらず、この段をエラーの見た目（danger の色・warning の印）にします
   * @default false
   */
  invalid?: boolean;
  /**
   * この段を押せなくします。完了していても戻れません
   * @default false
   */
  disabled?: boolean;
  /** マーカーの中身を差し替えます（既定は番号、完了すると variant に従います） */
  icon?: ReactNode;
  /**
   * 描く要素（Base UI の render と同じ）。押せる段（完了した段）をリンクにするときに渡します
   */
  render?: ReactElement;
  /** 段（li）に付きます */
  className?: string;
}

/**
 * Stepper の 1 段です。Stepper の中に、進む順に並べます
 */
export function StepperStep({
  label,
  description,
  invalid = false,
  disabled = false,
  icon,
  render,
  className,
  ...props
}: StepperStepProps) {
  const { orientation, variant } = use(StepperContext);
  const { number, status, isFirst, isLast, onSelect } = use(StepperItemContext);
  const s = stepper({ orientation, status, disabled });
  const clickable = onSelect !== undefined;
  const labelId = useId();
  const descriptionId = useId();

  const markerContent =
    icon ??
    (invalid ? (
      <WarningCircleIcon className={s.markerIcon()} />
    ) : status === 'completed' && variant === 'check' ? (
      <CheckMarkIcon standalone className={s.markerIcon()} />
    ) : (
      number
    ));

  const content = (
    <>
      {/* 番号・印は見た目の飾り。読み上げの名前はラベルだけ（いまの段は aria-current が伝える） */}
      <span
        aria-hidden="true"
        data-slot="stepper-marker"
        data-invalid={invalid || undefined}
        className={s.marker()}
      >
        {markerContent}
      </span>
      <span data-orientation={orientation} className={s.content()}>
        <span id={labelId} data-slot="stepper-label" className={s.label()}>
          {label}
        </span>
        {description != null && (
          <span id={descriptionId} data-slot="stepper-description" className={s.description()}>
            {description}
          </span>
        )}
      </span>
    </>
  );

  // 読み上げの名前はラベルだけ（aria-labelledby）、説明は aria-describedby（design/props.md の description）
  const control = useRender({
    render: clickable ? render : <div />,
    defaultTagName: 'button',
    props: clickable
      ? {
          type: 'button',
          onClick: onSelect,
          'aria-current': status === 'current' ? ('step' as const) : undefined,
          'aria-labelledby': labelId,
          'aria-describedby': description != null ? descriptionId : undefined,
          'data-clickable': true,
          'data-orientation': orientation,
          className: s.control(),
          children: content,
        }
      : {
          // 見た目はボタンでも押せないので、読み上げにも「利用不可」と伝える（design/internal/link-parts.ts の disabledLinkProps と同じ考え方）
          //   薄い見た目（data-disabled）は、その段の disabled のときだけ。いまの段・これからの段は、押せなくても普通の見た目
          role: 'button',
          'aria-current': status === 'current' ? ('step' as const) : undefined,
          'aria-disabled': true,
          'aria-labelledby': labelId,
          'aria-describedby': description != null ? descriptionId : undefined,
          'data-disabled': disabled ? true : undefined,
          'data-orientation': orientation,
          className: s.control(),
          children: content,
        },
  });

  return (
    <li
      {...props}
      data-slot="stepper-step"
      data-orientation={orientation}
      className={s.item({ className })}
    >
      {!isFirst && (
        <span aria-hidden data-orientation={orientation} className={s.connectorBefore()} />
      )}
      {control}
      {!isLast && (
        <span aria-hidden data-orientation={orientation} className={s.connectorAfter()} />
      )}
    </li>
  );
}
