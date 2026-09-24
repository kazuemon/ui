'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import { type ReactNode, useState } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { useNarrowScreen } from '../../internal/sheet/use-narrow-screen';
import { XIcon } from '../../internal/icons';
import { NoticeIcon } from '../../internal/notice-surface/NoticeIcon';
import {
  type NoticeStatus,
  type NoticeSurfaceStatus,
  type NoticeVariant,
  noticeSurface,
} from '../../internal/notice-surface/notice-surface';
import { tv, SCOPE_CLASS } from '../../internal/tv';
import { usePortalContainer } from '../../internal/ui-config';

// 一定の時間で消えるお知らせ（トースト）— 軸 147・148
//   見た目はお知らせ（Notice）と同じ面（src/internal/notice-surface）。働きが同じものは同じ見た目にする
//   ページの上に重なるレイヤーなので、Notice と違って影と輪郭を持つ（原則1）。角は部品の角（原則5）
//   色は状態の色（原則6）。読み上げは危険だけが割り込む（priority: high）。ほかは静かに知らせる
//   出る場所と積み方は軸 148 で決める。いまの既定は「右下に、新しいものを手前にして重ねる」
//     stack="stacked": 手前の 1 枚だけを見せ、後ろは少しだけのぞかせる。載せる・触れると開いて全部見える（Base UI の data-expanded）
//     stack="list": 重ねずに縦に並べる
//   指で操作していて画面が狭いときは、左右の余白を残して幅いっぱいにする（原則11）
//   既定では自動で消えない。消えるまでの時間を決めたときだけ、面の下に残り時間の線を引く（読んでいるあいだは止まる）
//   はじいて消せる（Base UI の swipeDirection）。出入りは浮かぶ面と同じ動き（--popup-*）で、動きを減らす設定では動かさない

/** 面の見た目（軸 147）。soft は淡い色の面、filled は白文字が載る濃い塗り */
export type ToastVariant = Extract<NoticeVariant, 'soft' | 'filled'>;

/** 出る場所。auto は、指で操作していて画面が狭いときは下の中央、それ以外は右下 */
export type ToastPosition =
  | 'auto'
  | 'bottom-end'
  | 'bottom-center'
  | 'bottom-start'
  | 'top-end'
  | 'top-center'
  | 'top-start';

/** 積み方。auto は、少ないうちは並べて、STACK_FROM 枚めから重ねる。stacked はいつも重ね、list はいつも並べる */
export type ToastStack = 'auto' | 'stacked' | 'list';

/** auto で重ね始める枚数（軸 148）。いちど重ねたら、全部消えるまで重ねたまま */
const STACK_FROM = 4;

/**
 * auto のときの積み方を決める（軸 148）
 * 4 枚めから重ね、全部消えるまで重ねたまま。読んでいるあいだ（載せている・キーボードで入っている）は変えない
 * （減るたびに切り替わると、読んでいる途中で形が急に変わるため）
 */
function nextStacked(
  stacked: boolean,
  { auto, reading, count }: { auto: boolean; reading: boolean; count: number }
) {
  if (!auto || reading) return stacked;
  if (count === 0) return false;
  if (count >= STACK_FROM) return true;
  return stacked;
}

const toastStyles = tv({
  slots: {
    viewport: [
      'group/toast-viewport fixed z-50 flex w-(--toast-width) max-w-[calc(100vw-var(--toast-inset)*2)]',
      // 画面が狭いときは、左右の余白を残して幅いっぱい（原則11）
      'max-[480px]:w-[calc(100vw-var(--toast-inset)*2)]',
    ],
    // 1 枚ずつの箱。位置と動きだけを持ち、面は content が持つ
    root: [
      // 重ねるときは transform、並べるときは translate で動かすので、どちらも移り変わりに入れる
      'w-full [transition:transform_var(--toast-duration)_var(--toast-ease),translate_var(--toast-duration)_var(--toast-ease),opacity_var(--toast-duration)_var(--toast-ease),height_var(--duration-fast)_var(--toast-ease)]',
      'motion-reduce:[transition:none]',
      'data-ending-style:opacity-0 data-limited:opacity-0 data-starting-style:opacity-0',
      'data-swiping:[transition:none]',
    ],
    content: [
      'relative w-full [box-shadow:var(--toast-shadow),inset_0_0_0_var(--border-width-thin)_var(--toast-line)]',
      // 残り時間の線の色は、題とアイコンと同じ状態の色。お知らせの面が置く変数なので、面の要素で受け取る
      //   （:root のトークンに書くと、そこで解決されてしまい色が決まらない）
      '[--toast-progress-color:var(--notice-icon-color)]',
      '[transition:opacity_var(--toast-duration)_var(--toast-ease)] motion-reduce:[transition:none]',
    ],
    text: 'flex min-w-0 flex-1 flex-col gap-0.5',
    // 残り時間の線（消えるまでの時間を決めたときだけ出す）。面の下の端に、角丸に沿って引く
    progress: [
      'pointer-events-none absolute inset-x-0 bottom-0 h-(--toast-progress-height) overflow-hidden',
      'rounded-b-control',
    ],
    // 時間いっぱいから 0 へ縮む。読んでいるあいだ（載せる・触れる・キーボードで入る）は、Base UI が時間を止めるので線も止める
    progressBar: [
      'h-full w-full origin-left bg-(color:--toast-progress-color) opacity-(--toast-progress-opacity)',
      '[animation:toast-progress_var(--toast-progress-duration)_linear_forwards]',
      'group-data-expanded/toast-viewport:[animation-play-state:paused]',
    ],
    title: 'font-bold text-(color:--notice-title-color)',
    description: '',
    actions:
      'mt-1 flex flex-wrap items-center gap-2 [&_a]:font-bold [&>a:not(.inline-flex)]:-my-0.5',
    close: [
      // Notice の × と同じ（1行目の中央にそろえ、上と右にはみ出す）
      '-my-[calc((var(--spacing-control)_-_var(--leading-control))_/_2)] -mr-[calc((var(--spacing-control)_-_var(--leading-control))_/_2)]',
      'grid size-(--spacing-control) shrink-0 cursor-pointer place-items-center rounded-control',
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'hover:[--flat-bg:color-mix(in_oklab,var(--notice-fg)_var(--flat-hover-mix),transparent)]',
      'active:translate-y-(--flat-press-depth) active:[--flat-bg:color-mix(in_oklab,var(--notice-fg)_var(--flat-press-mix),transparent)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
      ...focusRing,
    ],
  },
  variants: {
    position: {
      'bottom-end': { viewport: 'right-(--toast-inset) bottom-(--toast-inset)' },
      'bottom-center': {
        viewport: 'bottom-(--toast-inset) left-1/2 -translate-x-1/2',
      },
      'bottom-start': { viewport: 'bottom-(--toast-inset) left-(--toast-inset)' },
      'top-end': { viewport: 'top-(--toast-inset) right-(--toast-inset)' },
      'top-center': { viewport: 'top-(--toast-inset) left-1/2 -translate-x-1/2' },
      'top-start': { viewport: 'top-(--toast-inset) left-(--toast-inset)' },
    },
    outline: {
      true: {},
      // 輪郭なし（軸 147 の D）。影だけで浮きを見せる
      false: { content: '[--toast-line:transparent]' },
    },
    stack: {
      // 重ねる: 手前の 1 枚だけを見せ、後ろは --toast-peek だけのぞかせて少し縮める
      //   開いている（載せている・触れている・キーボードで入った）あいだは、--toast-gap ずつ離して全部見せる
      stacked: {
        root: [
          'absolute inset-x-0 [--toast-scale:calc(max(0,1-(var(--toast-index)*var(--toast-scale-step))))]',
          '[--toast-h:var(--toast-frontmost-height,var(--toast-height))] [--toast-shrink:calc(1-var(--toast-scale))]',
          '[--toast-open-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--toast-gap)*-1)+var(--toast-swipe-movement-y))]',
          'z-[calc(50-var(--toast-index))] h-(--toast-h) data-expanded:h-(--toast-height)',
          // 重なりのあいだの隙間を埋めて、マウスが抜けないようにする
          "after:absolute after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full after:content-['']",
        ],
        // 後ろの面は消さない。のぞいた縁の色で、何枚たまっているかが分かる
        content: '',
      },
      // 並べる: ふつうの縦の並び。隙間は --toast-gap
      list: { root: 'relative' },
    },
  },
  compoundVariants: [
    // 重ねるときの向き（下から出るか上から出るか）で、のぞかせる向き・寄せる先・出入りの向きを変える
    {
      stack: 'stacked',
      position: ['bottom-end', 'bottom-center', 'bottom-start'],
      class: {
        viewport: 'flex-col-reverse',
        root: [
          'bottom-0 origin-bottom after:top-full',
          '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-h))))_scale(var(--toast-scale))]',
          'data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-open-y))]',
          'data-starting-style:[transform:translateY(calc(100%+var(--toast-inset)))]',
          '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(calc(100%+var(--toast-inset)))]',
        ],
      },
    },
    {
      stack: 'stacked',
      position: ['top-end', 'top-center', 'top-start'],
      class: {
        viewport: 'flex-col',
        root: [
          'top-0 origin-top after:bottom-full',
          '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek))+(var(--toast-shrink)*var(--toast-h))))_scale(var(--toast-scale))]',
          'data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-open-y)*-1))]',
          'data-starting-style:[transform:translateY(calc(-100%-var(--toast-inset)))]',
          '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(calc(-100%-var(--toast-inset)))]',
        ],
      },
    },
    // 並べるときは、新しいものが下（下から出す）・上（上から出す）に来る
    {
      stack: 'list',
      position: ['bottom-end', 'bottom-center', 'bottom-start'],
      class: {
        // 新しいものが、画面の端に近い側（下）に来る
        viewport: 'flex-col-reverse gap-(--toast-gap)',
        root: [
          'data-ending-style:translate-y-[calc(100%+var(--toast-inset))] data-starting-style:translate-y-[calc(100%+var(--toast-inset))]',
        ],
      },
    },
    {
      stack: 'list',
      position: ['top-end', 'top-center', 'top-start'],
      class: {
        // 新しいものが、画面の端に近い側（上）に来る
        viewport: 'flex-col gap-(--toast-gap)',
        root: [
          'data-ending-style:-translate-y-[calc(100%+var(--toast-inset))] data-starting-style:-translate-y-[calc(100%+var(--toast-inset))]',
        ],
      },
    },
  ],
  defaultVariants: { position: 'bottom-end', stack: 'list', outline: true },
});

/**
 * React の外（fetch の中など）からトーストを出すための道具。`ToastProvider` の `toastManager` に渡して使います
 */
export function createToastManager() {
  return BaseToast.createToastManager<ToastData>();
}

/** `createToastManager()` が返す道具 */
export type ToastManager = ReturnType<typeof createToastManager>;

/** トーストに持たせる内容。Base UI の toast の data に入れる */
export interface ToastData {
  /** 状態。情報・成功・警告・危険の色です。書かないときは色を持たないグレーです */
  status?: NoticeStatus;
  /** 面の見た目。書かないときは ToastProvider の variant です */
  variant?: ToastVariant;
  /** 1 行目の左に置くアイコン。書かないときは状態ごとのアイコン、false でなし */
  icon?: ReactNode | false;
  /** 本文の下に置く操作（白いボタンか文字のリンク） */
  actions?: ReactNode;
}

export interface ToastProviderProps {
  /** トーストを出せるようにする範囲。ふつうはアプリ全体を入れます */
  children?: ReactNode;
  /** 出す・閉じる・書き換えるための道具。React の外（fetch の中など）からトーストを出すときに、`createToastManager()` で作って渡します */
  toastManager?: ToastManager;
  /**
   * 消えるまでの時間（ミリ秒）。既定の 0 は、閉じるまで消えません。
   * 0 より大きい値を渡すと、その時間で消え、面の下に残り時間の線が出ます（読んでいるあいだは止まります）。
   * トーストごとに `useToast().show({ timeout })` でも決められます
   * @default 0
   */
  timeout?: number;
  /**
   * 同時に持つ数。超えた分は古いものから消えます
   * @default 5
   */
  limit?: number;
  /**
   * 出る場所。auto は、指で操作していて画面が狭いときは下の中央、それ以外は右下です
   * @default 'auto'
   */
  position?: ToastPosition;
  /**
   * 積み方。auto は、3 枚までは縦に並べ、4 枚めからは重ねます。いちど重ねたら、全部消えるまで重ねたままです
   * （読んでいる途中で形が変わらないように）。重ねると手前の 1 枚だけが見え、
   * 載せる・触れる・キーボードで入ると開いて全部見えます。stacked はいつも重ね、list はいつも並べます
   * @default 'auto'
   */
  stack?: ToastStack;
  /**
   * 面の見た目。soft は状態の色の淡い面、filled は白文字が載る濃い塗り（警告だけは黄色に濃紺）です
   * @default 'soft'
   */
  variant?: ToastVariant;
  /**
   * 面の細い輪郭を消すか。影だけで浮かせたいときに書きます
   * @default false
   */
  hideOutline?: boolean;
  /**
   * × の読み上げの名前
   * @default '閉じる'
   */
  closeName?: string;
  /**
   * 描く場所。書かないときは ThemeProvider の portalContainer に従います
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
}

/**
 * トーストを出せるようにします。アプリ全体を包み、どこからでも `useToast()` で出します
 */
export function ToastProvider({
  children,
  toastManager,
  timeout = 0,
  limit = 5,
  position = 'auto',
  stack = 'auto',
  variant = 'soft',
  hideOutline = false,
  closeName = '閉じる',
  portalContainer,
}: ToastProviderProps) {
  const target = usePortalContainer(portalContainer);
  return (
    <BaseToast.Provider timeout={timeout} limit={limit} toastManager={toastManager}>
      {children}
      <BaseToast.Portal className={SCOPE_CLASS} container={target}>
        <ToastViewport
          position={position}
          stack={stack}
          variant={variant}
          hideOutline={hideOutline}
          closeName={closeName}
          timeout={timeout}
        />
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

function ToastViewport({
  position,
  stack,
  variant,
  hideOutline,
  closeName,
  timeout,
}: {
  position: ToastPosition;
  stack: ToastStack;
  variant: ToastVariant;
  hideOutline: boolean;
  closeName: string;
  timeout: number;
}) {
  const { toasts } = BaseToast.useToastManager();
  // auto（軸 148）: 指で操作していて画面が狭いときは下の中央、それ以外は右下
  const narrow = useNarrowScreen();
  const place: Exclude<ToastPosition, 'auto'> =
    position === 'auto' ? (narrow ? 'bottom-center' : 'bottom-end') : position;

  // auto の積み方（軸 148）: 3 枚までは並べ、4 枚めから重ねる
  //   いちど重ねたら、全部消えるまで重ねたまま。読んでいるあいだ（載せている・キーボードで入っている）は切り替えない
  //   減るたびに積み方が変わると、読んでいる途中で形が急に変わるため
  const [stacked, setStacked] = useState(false);
  const [reading, setReading] = useState(false);
  const shouldStack = nextStacked(stacked, {
    auto: stack === 'auto',
    reading,
    count: toasts.length,
  });
  // 枚数が変わったときに、その場で積み方を決め直す（描くあいだの setState。React が commit の前にやり直す）
  if (shouldStack !== stacked) setStacked(shouldStack);

  const layout: Exclude<ToastStack, 'auto'> =
    stack === 'auto' ? (shouldStack ? 'stacked' : 'list') : stack;
  const s = toastStyles({ position: place, stack: layout, outline: !hideOutline });
  const fromTop = place.startsWith('top');
  return (
    <BaseToast.Viewport
      data-slot="toast-viewport"
      className={s.viewport()}
      onPointerEnter={() => setReading(true)}
      onPointerLeave={() => setReading(false)}
      onFocusCapture={() => setReading(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setReading(false);
      }}
    >
      {toasts.map((toast) => {
        const data: ToastData = toast.data ?? {};
        // 状態を書かないときは、色を持たないグレー
        const status: NoticeSurfaceStatus = data.status ?? 'neutral';
        const look = data.variant ?? variant;
        // 消えるまでの時間を決めたトーストにだけ、残り時間の線を出す
        const left = toast.timeout ?? timeout;
        return (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            swipeDirection={fromTop ? ['up', 'right'] : ['down', 'right']}
            data-slot="toast"
            data-status={status}
            className={s.root()}
          >
            <BaseToast.Content
              data-slot="toast-content"
              className={noticeSurface({
                variant: look,
                status,
                className: s.content(),
              })}
            >
              <NoticeIcon status={status} variant={look} icon={data.icon} />
              <div className={s.text()}>
                {toast.title ? (
                  <BaseToast.Title data-slot="toast-title" className={s.title()} />
                ) : null}
                {toast.description ? (
                  <BaseToast.Description
                    data-slot="toast-description"
                    className={s.description()}
                  />
                ) : null}
                {data.actions ? <div className={s.actions()}>{data.actions}</div> : null}
              </div>
              {left > 0 ? (
                <div aria-hidden="true" data-slot="toast-progress" className={s.progress()}>
                  <div
                    className={s.progressBar()}
                    style={{ ['--toast-progress-duration' as string]: `${left}ms` }}
                  />
                </div>
              ) : null}
              <BaseToast.Close aria-label={closeName} className={s.close()}>
                {/* アイコン単体なので Bold（design/adr/0018） */}
                <XIcon standalone />
              </BaseToast.Close>
            </BaseToast.Content>
          </BaseToast.Root>
        );
      })}
    </BaseToast.Viewport>
  );
}

/** トーストを出すときに渡すもの */
export interface ToastOptions extends ToastData {
  /** 太字の題 */
  title?: ReactNode;
  /** 本文 */
  description?: ReactNode;
  /** 消えるまでの時間（ミリ秒）。0 で消えません。指定しないときは ToastProvider の timeout です */
  timeout?: number;
  /** 同じ id で出すと、前のトーストを書き換えて時間を数え直します */
  id?: string;
  /** 閉じたあとに呼ばれます */
  onClosed?: () => void;
}

/**
 * トーストを出す・閉じる・書き換える。`ToastProvider` の中で使います
 *
 * 危険（`status: 'danger'`）だけは読み上げに割り込み、ほかは静かに知らせます（原則6）
 */
export function useToast() {
  const manager = BaseToast.useToastManager<ToastData>();
  return {
    /** トーストを出す。返る id で、あとから閉じたり書き換えたりできます */
    show: ({ title, description, timeout, id, onClosed, ...data }: ToastOptions) =>
      manager.add({
        title,
        description,
        timeout,
        id,
        onClose: onClosed,
        // 危険だけが割り込む（原則6）
        priority: data.status === 'danger' ? 'high' : 'low',
        type: data.status ?? 'neutral',
        data,
      }),
    /** トーストを閉じる。id を渡さないと、出ているものをすべて閉じます */
    close: manager.close,
    /** 出したトーストを書き換える */
    update: manager.update,
    /**
     * Promise の間、待ち・成功・失敗のトーストを順に出します。
     * それぞれに、題や本文（`ToastOptions` と同じもの）か、文字だけを渡します
     */
    promise: manager.promise,
    /** いま出ているトースト */
    toasts: manager.toasts,
  };
}
