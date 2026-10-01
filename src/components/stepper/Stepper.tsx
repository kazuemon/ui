'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useId,
  useRef,
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
// マーカー（印）は upcoming はグレーの輪郭、current は部品の色の塗り、completed は部品の色の塗り
//   completed の中身は variant で選ぶ。check（既定、ADR-0318）はチェックの印、number は数字のまま
//   invalid（段ごと）は位置に関わらず danger の色と warning の印にする（原則6: 危険は明度を落とした赤）
// 連結線（connector）は、マーカーの左右（横並び）・上下（縦並び）半分ずつ。自分の状態だけで色が決まる
//   （before は「upcoming でない」＝進捗がここまで来た、after は「completed」＝ここを通り過ぎた）ので、隣の段の状態を見なくてよい
// 横並び（既定、ADR-0319）はマーカーを上、ラベルを下（中央そろえ）。縦並びはマーカーを左、ラベルを右（Steps・Timeline と同じ考え方）
// フォーカスの線は、クリックできる段のボタン全体（マーカー＋ラベル）を囲む（focusRing）
const stepper = tv({
  slots: {
    root: 'w-full',
    list: 'flex list-none gap-(--stepper-gap) p-0',
    item: [
      // --stepper-marker-offset: 縦並びで、マーカーがラベルの 1 行目より小さいとき（点）、行の真ん中にそろえるための下げ幅
      //   マーカーのほうが大きいとき（数字・印）は 0（ラベルをマーカーの上端にそろえる）。横並びでは使わない
      'relative flex flex-1',
      '[--stepper-marker-offset:0px] data-[orientation=vertical]:[--stepper-marker-offset:max(0px,calc((var(--stepper-label-leading)-var(--stepper-marker-size))/2))]',
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
      // 縦並び: マーカーは control の先頭（items-start）から --stepper-marker-offset 下がった位置にあるので、
      //   マーカーの下端は li の上端 + offset + マーカーの高さ。次の段の li は、この li の下端 + gap（ol の flex gap）から始まり、
      //   そのマーカーも offset 下がる。線は、その手前・先で少し離す（line-gap）
      'data-[orientation=vertical]:start-[calc(var(--stepper-marker-size)/2-var(--stepper-line-width)/2)] data-[orientation=vertical]:top-[calc(var(--stepper-marker-offset)+var(--stepper-marker-size)+var(--stepper-line-gap))] data-[orientation=vertical]:bottom-[calc(var(--stepper-line-gap)-var(--stepper-gap)-var(--stepper-marker-offset))] data-[orientation=vertical]:w-(--stepper-line-width)',
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
      'text-(length:--stepper-label-text) leading-(--stepper-label-leading) text-(color:--stepper-label-color)',
    description: 'text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle',
  },
  variants: {
    // 大きさの段（軸 464）。root で段の寸法を入れ、マーカー・線・ラベルが読む
    //   md のラベルは部品の文字（密度で変わる）。sm は --stepper-*-sm に差し替える
    size: {
      md: {
        root: '[--stepper-label-leading:var(--leading-control)] [--stepper-label-text:var(--text-control)]',
      },
      // sm のラベルは密度で変える（--density-coarse: 指用 1・マウス用 0 で、-fine と -coarse のあいだを選ぶ。.coarse-large と同じ式）
      sm: {
        root: [
          '[--stepper-gap:var(--stepper-gap-sm)] [--stepper-label-gap:var(--stepper-label-gap-sm)]',
          '[--stepper-marker-icon-size:var(--stepper-marker-icon-size-sm)] [--stepper-marker-size:var(--stepper-marker-size-sm)] [--stepper-marker-text:var(--stepper-marker-text-sm)]',
          '[--stepper-label-text:calc(var(--stepper-label-text-sm-fine)_+_var(--density-coarse)_*_(var(--stepper-label-text-sm-coarse)_-_var(--stepper-label-text-sm-fine)))]',
          '[--stepper-label-leading:calc(var(--stepper-label-leading-sm-fine)_+_var(--density-coarse)_*_(var(--stepper-label-leading-sm-coarse)_-_var(--stepper-label-leading-sm-fine)))]',
        ],
      },
    },
    // マーカーの形。dot は数字も印も持たない小さな点にする（大きさの段によらず同じ大きさ）。
    //   number・check は完了した段の中身の違いだけなので、ここでは分けない（StepperStep が中身を選ぶ）
    markerShape: {
      default: {},
      dot: {
        root: '[--stepper-marker-size:var(--stepper-dot-size)]',
        // 縦並びでは、ラベルの 1 行目の真ん中に下げる（--stepper-marker-offset）
        // 点のエラーの段: 淡い赤の塗りでは点が見えないので、濃い赤で塗る（原則6）
        marker: [
          'data-[orientation=vertical]:mt-(--stepper-marker-offset)',
          'data-invalid:[--stepper-marker-bg:var(--color-fg-danger)]',
        ],
      },
    },
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
    size: 'md',
    markerShape: 'default',
    orientation: 'horizontal',
    color: 'neutral',
    status: 'upcoming',
    disabled: false,
  },
});

/** 並べる向き。horizontal は横に並べる（既定）。vertical は縦に積む */
export type StepperOrientation = 'horizontal' | 'vertical';

export type StepperColor = 'neutral' | 'primary' | 'secondary';

/** 大きさ。sm はマーカーと文を一段小さくする */
export type StepperSize = 'sm' | 'md';

/**
 * マーカーの形。check は完了した段をチェックの印に差し替える（既定、ADR-0318）。number は数字のまま色だけ変える。
 * dot は数字も印も持たない小さな点にする
 */
export type StepperVariant = 'number' | 'check' | 'dot';

/** 段の状態。upcoming はまだ、current はいまの段、completed は済んだ段 */
export type StepperStepStatus = 'upcoming' | 'current' | 'completed';

interface StepperContextValue {
  orientation: StepperOrientation;
  variant: StepperVariant;
}

const StepperContext = createContext<StepperContextValue>({
  orientation: 'horizontal',
  variant: 'check',
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
   * マーカーの形。check は完了した段をチェックの印に差し替え、number は数字のまま色だけ変えます。
   * dot は数字も印も持たない小さな点にし、いちばん小さく収めます（完了といまの段は、点の色ではなくラベルの太さと線の色で見分けます）
   * @default 'check'
   */
  variant?: StepperVariant;
  /**
   * 大きさ。sm はマーカーとラベルを一段小さくし、段のあいだも詰めます。ダイアログやサイドバーの中など、狭い場所に置くときに使います
   * @default 'md'
   */
  size?: StepperSize;
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
  variant = 'check',
  size,
  accessibleName = '進み具合',
  className,
  children,
  ...props
}: StepperProps) {
  // StepperStep 以外（Fragment・文字列など）は並びから外す。isValidElement と型で確かめ、断定（as）はしない
  const items = Children.toArray(children).filter(
    (child): child is ReactElement<StepperStepProps> =>
      isValidElement(child) && child.type === StepperStep
  );
  const s = stepper({
    orientation,
    color,
    size,
    markerShape: variant === 'dot' ? 'dot' : 'default',
  });

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
            // 段ごとの status があればそれを使い、なければ value と並び順で決める
            const status: StepperStepStatus =
              item.props.status ??
              (index < value ? 'completed' : index === value ? 'current' : 'upcoming');
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
  /**
   * この段の状態を、value と並び順で決まるものから上書きします。順番どおりに進まないウィザードで、
   * 先の段を済ませた（completed）ときや、済ませた段をやり直し（upcoming）にするときに渡します。
   * upcoming はまだ、current はいまの段、completed は済んだ段です。書かないときは value と並び順で決まります
   */
  status?: StepperStepStatus;
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
  /** マーカーの中身を差し替えます（既定は番号、完了すると variant に従います）。variant が dot のときは描きません */
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
  status: _status,
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
  const dot = variant === 'dot';
  const s = stepper({ orientation, status, disabled, markerShape: dot ? 'dot' : 'default' });
  const clickable = onSelect !== undefined;
  const labelId = useId();
  const descriptionId = useId();
  const statusId = useId();

  // 点（variant="dot"）は中身を持たない（icon も描かない）
  const markerContent = dot
    ? null
    : (icon ??
      (invalid ? (
        <WarningCircleIcon className={s.markerIcon()} />
      ) : status === 'completed' && variant === 'check' ? (
        <CheckMarkIcon standalone className={s.markerIcon()} />
      ) : (
        number
      )));

  // マーカー（数字・チェック・警告アイコン）は見た目の飾りで aria-hidden。伝えている状態（完了・エラー）を
  //   見えない文で足し、aria-labelledby でラベルの後ろにつなぐ（いまの段は別に aria-current が伝える）
  const statusText = invalid ? 'エラー' : status === 'completed' ? '完了' : undefined;
  const labelledBy = statusText != null ? `${labelId} ${statusId}` : labelId;

  const content = (
    <>
      <span
        aria-hidden="true"
        data-slot="stepper-marker"
        data-invalid={invalid || undefined}
        data-orientation={orientation}
        className={s.marker()}
      >
        {markerContent}
      </span>
      {statusText != null && (
        <span id={statusId} className="sr-only">
          {statusText}
        </span>
      )}
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

  // クリックできる段（button）が、押されたあと（value が動いて completed でなくなる）に
  //   表示専用（div）へ入れ替わると、要素ごと作り直されてフォーカスが失われる。「押した」こと自体を ref のフラグで持ち、
  //   押していない段が（無関係な value の変更で）表示専用に変わっても、フォーカスは奪わない
  //   フラグは、この段が表示専用に変わった時点で消費して消す。いまの段になっていたときだけ、同じ場所へフォーカスを戻す
  //   （tabIndex=-1 でプログラム的に当てられるようにする）。押してから value が更新されるまでの非同期な間も、
  //   フラグは押しっぱなしのまま（clickable が変わらない）残るので、そのあとに戻ってきても働く
  const controlRef = useRef<HTMLElement>(null);
  const focusPendingRef = useRef(false);
  useEffect(() => {
    if (!clickable && focusPendingRef.current) {
      focusPendingRef.current = false;
      if (status === 'current') controlRef.current?.focus();
    }
  }, [clickable, status]);

  // 読み上げの名前はラベル＋状態（aria-labelledby）、説明は aria-describedby（design/props.md の description）
  const control = useRender({
    render: clickable ? render : <div />,
    ref: controlRef,
    defaultTagName: 'button',
    props: clickable
      ? {
          type: 'button',
          onClick: () => {
            focusPendingRef.current = true;
            onSelect();
          },
          'aria-current': status === 'current' ? ('step' as const) : undefined,
          'aria-labelledby': labelledBy,
          'aria-describedby': description != null ? descriptionId : undefined,
          'data-clickable': true,
          'data-orientation': orientation,
          className: s.control(),
          children: content,
        }
      : {
          // 押せない段はボタンではない（見た目だけ似ている）ので role・aria-disabled は付けない。
          //   いまの段はフォーカスを戻せるよう tabIndex=-1 にする（Tab では止まらない）
          tabIndex: status === 'current' ? -1 : undefined,
          'aria-current': status === 'current' ? ('step' as const) : undefined,
          'aria-labelledby': labelledBy,
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
