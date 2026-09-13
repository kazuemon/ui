import { Field as BaseField } from '@base-ui/react/field';
import { type ReactNode, useContext, useId, useState } from 'react';

import { fieldStyles } from './field-styles';
import { FormSubmitContext } from './form-context';
import { WarningCircleIcon, WarningIcon } from './icons';
import { LoadingBar, Spinner } from './Loading';

/** キャプション（ヘルプテキスト）の場所。top: ラベルと本体のあいだ（既定）、bottom: 本体の下 */
export type CaptionPlacement = 'top' | 'bottom';

/**
 * 待っているあいだ（loading）の欄の扱い（design/adr/0042）
 * non-blocking: 止めない。書き換えられ、Select は開ける（既定）
 * blocking: 止める。押せない欄と同じ見た目にし、書き換えられない・開けない。フォーカスは外さない
 */
export type FieldLoadingBehavior = 'blocking' | 'non-blocking';

/** 待っているあいだの印。spinner: 右端に回る円（既定）、bar: 下端（枠線の内側）に流れる線 */
export type FieldLoadingIndicator = 'spinner' | 'bar';

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

/** エラー・警告の行の種類 */
type MessageKind = 'error' | 'warning';

// エラー・警告の行の読み上げと動き（design/adr/0044）。エラーの行と警告の行で、別々に持つ
interface MessageState {
  /** いまの文の見分け（文字のときはその文）。文がないときは null */
  key: string | null;
  /** 最後に見た、Form の送信の回数 */
  submitCount: number;
  /** 送信で出た（変わった）文。読み上げで知らせない（箱を aria-live="off" にする） */
  quiet: boolean;
  /** 文が出る・変わるたびに増やす。行を描き直して、読み上げに「足された」と伝える */
  generation: number;
  /** 閉じる動きのあいだ残す、最後の文 */
  last: ReactNode;
}

/**
 * エラーか警告の行を包む箱（design/adr/0044）。文がなくてもいつも置き、読み上げの live region（polite）にする
 * エラーと警告は別の箱にし、両方あるときは両方出す（エラー → 警告。design/adr/0041 の追記）
 * 読み上げ（polite・送信で出た文は off）と開閉の動きは、箱ごとに働く
 * 行のアイコンは文と並ぶので線は Regular（design/adr/0018）
 */
function FieldMessageLine({
  kind,
  content,
  id,
}: {
  kind: MessageKind;
  content: ReactNode;
  id: string;
}) {
  const styles = fieldStyles();
  const open = Boolean(content);
  const text = typeof content === 'string' || typeof content === 'number' ? String(content) : '';
  const key = open ? text : null;
  // 読み上げ（design/adr/0044）: 行は、いつも置いた箱（aria-live="polite"）の中に出す。出たときと変わったときに、いまの読み上げのあとで読む
  //   送信で出た（変わった）文は知らせない。Form がフォーカスを移した先（最初のエラーの欄の説明か、エラーの一覧）で読むため
  //   送信の回数は、アプリがエラーを決めるのと同じ描画で増えるので、その描画で変わった文を「送信で出た」とみなす
  const submitCount = useContext(FormSubmitContext)?.submitCount ?? 0;
  const [state, setState] = useState<MessageState>(() => ({
    key,
    submitCount,
    quiet: false,
    generation: 0,
    last: open ? content : null,
  }));
  if (state.key !== key || state.submitCount !== submitCount) {
    const changed = state.key !== key;
    setState({
      key,
      submitCount,
      quiet: changed ? state.submitCount !== submitCount : state.quiet,
      generation: changed && key !== null ? state.generation + 1 : state.generation,
      last: open ? content : state.last,
    });
  }
  // 動き（design/adr/0044）: 行の高さと濃さを開き、閉じる。閉じるあいだは最後の文を残す（説明からは外し、読み上げでも隠す）
  const shown = open ? content : state.last;
  const Icon = kind === 'error' ? WarningCircleIcon : WarningIcon;
  return (
    <div
      data-slot="field-message"
      data-kind={kind}
      data-open={open ? '' : undefined}
      aria-live={state.quiet ? 'off' : 'polite'}
      className={styles.messageRegion()}
    >
      <div className={styles.messageClip()}>
        {shown ? (
          <div
            key={state.generation}
            id={open ? id : undefined}
            aria-hidden={open ? undefined : true}
            className={styles.message({
              className: [
                styles.messageLine(),
                kind === 'error' ? 'text-danger' : 'text-fg-warning',
              ].join(' '),
            })}
          >
            <Icon className={styles.messageIcon()} />
            <span className="min-w-0">{shown}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface FieldProps {
  /** 本体の上に置く太字のラベル */
  label: ReactNode;
  /** 補足（ヘルプテキスト）。エラー・警告のあいだも消えない。省略してもレイアウトは崩れない */
  caption?: ReactNode;
  /** キャプションの場所。既定は top（ラベルのすぐ下）。bottom は本体の下で、エラー・警告はその下に足す */
  captionPlacement?: CaptionPlacement;
  /** エラーの内容。渡すとエラーの状態になり、本体の下に丸の「!」と赤い文字で出す */
  error?: ReactNode;
  /**
   * 警告の内容。本体の下に三角とオリーブ色の文字で出す。欄の見た目は変えず、エラーの状態にもしない
   * error と両方あるときは両方出す。エラーの行が上、警告の行がその下（design/adr/0041 の追記）
   */
  warning?: ReactNode;
  /** 押せない（Disabled）状態にする */
  disabled?: boolean;
  /** 待っている（確かめている・読み込んでいる）。root に data-loading（loadingBehavior の値）を付ける */
  loading?: boolean;
  /** 待っているあいだの欄の扱い。blocking では、本体を押せない欄と同じ見た目にする（controlBox）。既定は non-blocking */
  loadingBehavior?: FieldLoadingBehavior;
  className?: string;
  /**
   * 本体。関数を渡すと、キャプションとエラー・警告の id を、見た目の順（キャプション → エラー → 警告）で受け取る
   * 本体の aria-describedby の先に渡すと、読み上げの説明の順が、表示や消える順によらず見た目の順になる
   */
  children: ReactNode | ((describedBy: string | undefined) => ReactNode);
  /** ラベルを <label> で描くか。Select のように本体がボタンの部品では false にする */
  nativeLabel?: boolean;
}

/**
 * ラベル / 本体 / キャプションの3層（原則4）。フォーム部品の外枠
 * 並びは ラベル → キャプション → 本体 → エラー → 警告（captionPlacement="bottom" では ラベル → 本体 → キャプション → エラー → 警告）
 * DOM の順も見た目の順と同じにする（design/adr/0041）
 */
export function Field({
  label,
  caption,
  captionPlacement = 'top',
  error,
  warning,
  disabled,
  loading,
  loadingBehavior = 'non-blocking',
  className,
  children,
  nativeLabel = true,
}: FieldProps) {
  const styles = fieldStyles();
  const id = useId();
  const captionId = `${id}caption`;
  const errorId = `${id}error`;
  const warningId = `${id}warning`;
  const captionNode = caption ? (
    <BaseField.Description id={captionId} className={styles.caption()}>
      {caption}
    </BaseField.Description>
  ) : null;
  // 警告も説明につなぐが、欄をエラーの状態にしない
  const describedBy =
    [captionNode && captionId, error ? errorId : null, warning ? warningId : null]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <BaseField.Root
      invalid={error ? true : undefined}
      disabled={disabled}
      data-loading={loading ? loadingBehavior : undefined}
      className={styles.root({ className })}
    >
      {/* data-slot="field-label": Form のエラーの一覧が、欄の名前として読む（design/adr/0044 の追記） */}
      <BaseField.Label
        data-slot="field-label"
        className={styles.label()}
        nativeLabel={nativeLabel}
        render={nativeLabel ? undefined : <div />}
      >
        {label}
      </BaseField.Label>
      {captionPlacement === 'top' && captionNode}
      {typeof children === 'function' ? children(describedBy) : children}
      {captionPlacement === 'bottom' && captionNode}
      <FieldMessageLine kind="error" content={error} id={errorId} />
      <FieldMessageLine kind="warning" content={warning} id={warningId} />
    </BaseField.Root>
  );
}
