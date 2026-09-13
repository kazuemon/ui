import {
  type ComponentProps,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { focusRing } from './focus-styles';
import { FormSubmitContext } from './form-context';
import { Link } from './Link';
import { Notice } from './Notice';

/** エラーの一覧の1行 */
interface ErrorEntry {
  /** エラーの行の id。本体の説明（aria-describedby）に入っている */
  messageId: string;
  /** 本体（入力欄・Select のボタン）の id。リンクの先 */
  controlId: string;
  /** 欄の名前（ラベルの文字）。一覧のリンクで、エラーの文の前に置く */
  label: string;
  /** エラーの文。一覧のリンクの文にする（欄の下の文と同じ言葉） */
  text: string;
}

// 一覧のリンクの文（design/adr/0044 の追記）: 「欄の名前: エラーの文」。名前もエラーの文も同じ太さ
// 名前は、欄の下の文には書かれていないことが多い（「数字が入っていません」）ため、一覧でどの欄か分かるように足す
const entryText = ({ label, text }: ErrorEntry) => (label ? `${label}: ${text}` : text);

const defaultSummaryTitle = (count: number) => `入力を確かめてください（${count}件）`;

// 本体は、エラーの行を説明（aria-describedby）に持つ要素（TextField の入力欄、Select のボタン）
const controlOf = (form: HTMLFormElement, messageId: string) =>
  form.querySelector<HTMLElement>(`[aria-describedby~="${CSS.escape(messageId)}"]`);

// 開いているエラーの行（Field の data-slot="field-message"）を、見た目の順（DOM の順）に集める
// 警告は送信を止めないので入れない（エラーと警告が両方ある欄も、エラーの行だけ）
// 欄の名前は、同じ欄（行の箱の親）のラベル（data-slot="field-label"）の文字
function collectErrors(form: HTMLFormElement): ErrorEntry[] {
  const entries: ErrorEntry[] = [];
  for (const region of form.querySelectorAll(
    '[data-slot="field-message"][data-open][data-kind="error"]'
  )) {
    const line = region.querySelector<HTMLElement>('[id]');
    const control = line && controlOf(form, line.id);
    if (!line || !control) continue;
    const label = region.parentElement?.querySelector(':scope > [data-slot="field-label"]');
    entries.push({
      messageId: line.id,
      controlId: control.id,
      label: (label?.textContent ?? '').trim(),
      text: (line.textContent ?? '').trim(),
    });
  }
  return entries;
}

const sameEntries = (a: ErrorEntry[], b: ErrorEntry[]) =>
  a.length === b.length &&
  a.every(
    (entry, i) =>
      entry.messageId === b[i].messageId &&
      entry.controlId === b[i].controlId &&
      entry.label === b[i].label &&
      entry.text === b[i].text
  );

// 欄へフォーカスを移し、欄全体（ラベルからエラーの行まで）が見えるようにスクロールする
// select: 入力した文字を選ぶ（Base UI の Form と同じ。送信したときだけ）
function focusField(form: HTMLFormElement, messageId: string, select: boolean) {
  const control = controlOf(form, messageId);
  if (!control) return;
  control.focus({ preventScroll: true });
  if (select && control instanceof HTMLInputElement) control.select();
  const region = form
    .querySelector(`#${CSS.escape(messageId)}`)
    ?.closest('[data-slot="field-message"]');
  region?.parentElement?.scrollIntoView({ block: 'nearest' });
}

export interface FormProps extends ComponentProps<'form'> {
  /**
   * 送信したときのエラーの知らせ方（design/adr/0044）
   * false: エラーのある最初の欄へフォーカスを移し、入力した文字を選ぶ。その欄の名前と説明（キャプション → エラー）が読まれる
   * true: フォームの上にエラーの一覧（危険のお知らせ。題と、各欄へのリンク「欄の名前: エラーの文」）を出し、一覧へフォーカスを移す。長いフォーム向け
   * @default false
   */
  errorSummary?: boolean;
  /**
   * エラーの一覧の題です。errorSummary が true のときだけ使います
   * @default (count) => `入力を確かめてください（${count}件）`
   */
  errorSummaryTitle?: (count: number) => string;
  /**
   * ブラウザの既定の検証エラー表示（吹き出し）を出すかどうかです。false にすると、欄の下の行（Field）だけで知らせます。
   * このシステムは自前の form を使うため、既定でブラウザの吹き出しを止めています
   * @default false
   */
  noValidate?: boolean;
}

/**
 * フォーム（design/adr/0044）
 * 値を確かめるのはアプリ（onSubmit の中で、各欄の error・warning を決める）。Form は、その描画のあとでフォーカスを移す
 * 中の欄の行は、欄を離れたときやあとから確かめたときに出ると、polite で知らせる。送信で出たときは知らせない（移った先で読むため）
 * 既定では noValidate（ブラウザの吹き出しを出さず、欄の下の行で知らせる）
 */
export function Form({
  errorSummary = false,
  errorSummaryTitle = defaultSummaryTitle,
  noValidate = true,
  onSubmit,
  ref,
  children,
  ...props
}: FormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [submitCount, setSubmitCount] = useState(0);
  // エラーの一覧。focus は、一覧へフォーカスを移した送信の回数（送信のたびに移す。中身が変わっただけでは移さない）
  const [summary, setSummary] = useState<{ entries: ErrorEntry[]; focus: number } | null>(null);
  const errorSummaryRef = useRef(errorSummary);
  useLayoutEffect(() => {
    errorSummaryRef.current = errorSummary;
  });
  const setRefs = useCallback(
    (node: HTMLFormElement | null) => {
      formRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  // アプリの onSubmit（各欄のエラーを決める）と送信の回数を、同じ描画で反映する
  const handleSubmit: NonNullable<FormProps['onSubmit']> = (event) => {
    onSubmit?.(event);
    setSubmitCount((count) => count + 1);
  };

  // 送信で出たエラーが描かれたあと: 最初のエラーの欄か、エラーの一覧へフォーカスを移す
  useLayoutEffect(() => {
    const form = formRef.current;
    if (!submitCount || !form) return;
    const entries = collectErrors(form);
    if (errorSummaryRef.current) {
      setSummary(entries.length ? { entries, focus: submitCount } : null);
      return;
    }
    setSummary(null);
    if (entries[0]) focusField(form, entries[0].messageId, true);
  }, [submitCount]);

  const summaryFocus = summary?.focus;
  useLayoutEffect(() => {
    if (summaryFocus) summaryRef.current?.focus();
  }, [summaryFocus]);

  // 一覧を出しているあいだは、欄のエラーの変化に合わせて一覧を直す。直した欄は一覧から消え、なくなると一覧を閉じる
  const summaryShown = summary !== null;
  useEffect(() => {
    const form = formRef.current;
    if (!summaryShown || !form) return undefined;
    const observer = new MutationObserver(() => {
      const entries = collectErrors(form);
      setSummary((current) => {
        if (!current || sameEntries(current.entries, entries)) return current;
        return entries.length ? { ...current, entries } : null;
      });
    });
    observer.observe(form, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-open', 'data-kind', 'aria-describedby'],
    });
    return () => observer.disconnect();
  }, [summaryShown]);

  const context = useMemo(() => ({ submitCount }), [submitCount]);
  return (
    <FormSubmitContext.Provider value={context}>
      <form {...props} ref={setRefs} noValidate={noValidate} onSubmit={handleSubmit}>
        {summary && (
          // エラーの一覧（GOV.UK の error summary の形）。危険のお知らせ（design/adr/0043）で描く
          // フォーカスを移して読ませるので、お知らせの role の箱（alert）は使わない。移ると「題、グループ」と中身が読まれる
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="group"
            aria-labelledby={titleId}
            data-slot="form-error-summary"
            className={[
              'rounded-(--notice-radius)',
              ...focusRing,
              '[transition:outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
            ].join(' ')}
          >
            <Notice
              tone="danger"
              live={false}
              title={<span id={titleId}>{errorSummaryTitle(summary.entries.length)}</span>}
            >
              {/* 項目の間は、欄の中の行の間と同じ --space-field-gap（指用 8px・マウス用 6px — design/adr/0044 の追記）
                題と最初の項目の間も同じにする（お知らせの題と本文の間 2px に、差の分を足す）。題が最初の項目にだけ寄って見えないように */}
              <ul className="mt-[calc(var(--space-field-gap)-2px)] flex flex-col gap-(--space-field-gap)">
                {summary.entries.map((entry) => (
                  <li key={entry.messageId}>
                    <Link
                      href={entry.controlId ? `#${entry.controlId}` : '#'}
                      onClick={(event) => {
                        event.preventDefault();
                        if (formRef.current) focusField(formRef.current, entry.messageId, false);
                      }}
                    >
                      {entryText(entry)}
                    </Link>
                  </li>
                ))}
              </ul>
            </Notice>
          </div>
        )}
        {children}
      </form>
    </FormSubmitContext.Provider>
  );
}
