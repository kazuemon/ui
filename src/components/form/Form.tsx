'use client';

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

import type { OptionalMark, RequiredMark } from '../../internal/field/FieldMark';
import { focusRing } from '../../internal/focus-styles';
import { FormSubmitContext, type FormSubmittingBehavior } from '../../internal/form-context';
import { UIConfigContext, useUIConfig } from '../../internal/ui-config';
import { Link } from '../link/Link';
import { Notice } from '../notice/Notice';
import {
  type ErrorEntry,
  entryText,
  collectErrors,
  sameEntries,
  focusField,
  focusStayedAt,
  submitterOf,
  defaultSubmitButton,
} from './form-dom';

const defaultSummaryTitle = (count: number) => `入力を確かめてください（${count}件）`;

export interface FormProps extends ComponentProps<'form'> {
  /**
   * 送信したときのエラーの知らせ方（design/adr/0044）
   * false: エラーのある最初の欄へフォーカスを移し、入力した文字を選ぶ。その欄の名前と説明（キャプション → エラー）が読まれる
   * true: フォームの上にエラーの一覧（危険のお知らせ。題と、各欄へのリンク「欄の名前: エラーの文」）を出し、一覧へフォーカスを移す。長いフォーム向け
   * @default false
   */
  showErrorSummary?: boolean;
  /**
   * エラーの一覧の題です。showErrorSummary が true のときだけ使います
   * @default (count) => `入力を確かめてください（${count}件）`
   */
  errorSummaryTitle?: (count: number) => string;
  /**
   * ブラウザの既定の検証（吹き出し）を止めるかどうかです。true（既定）では吹き出しを出さず、欄の下の行（Field）だけで知らせます。
   * false にすると、required などのブラウザの検証が働き、吹き出しも出ます
   * @default true
   */
  noValidate?: boolean;
  /**
   * フォーム全体を送っている（返事を待っている）。中の欄に配り、submittingBehavior の形で止めます。
   * 送っているあいだの送信（Enter など）は、onSubmit を呼ばずに止めます。
   * 中の送信のボタン（type="submit" の Button）は、loading を渡さなくても送信中になります。
   * 回る円は押したボタンにだけ出し、ほかの送信のボタンは押せない見た目にするだけです。
   * Enter で送ったときは、フォームの最初の送信のボタンに出します（ブラウザの既定と同じ）。
   * true から false に戻した描画でエラーの行があれば、送信したときと同じく、最初のエラーの欄（showErrorSummary のときはエラーの一覧）へフォーカスを移します。
   * サーバーから返ってきたエラーは、submitting を false にするのと同じ描画で渡してください。先に渡すと、送っているあいだに読み上げられ、フォーカスが移った先でもう一度読まれます。あとに渡すと、フォーカスは移りません。
   * サーバーから返ってきたエラーは、submitting を false にするのと同じ描画で渡します。
   * 送ったときの場所（押した送信のボタン、Enter を押した欄）にフォーカスが残っているときだけ移し、送っているあいだに別の欄へ移っていたら、フォーカスは動かさず、行を読み上げで知らせます
   * @default false
   */
  submitting?: boolean;
  /**
   * 送っているあいだの欄の扱い（後半の軸 38）。
   * blocking は、押せない欄の見た目にし、書き換えを止めます（印は出さず、フォーカスは外さず、値も送られます）。
   * none は欄を何も変えません。下書きの自動保存のように、送っているあいだに書き換えても困らないフォームで使います
   * @default 'blocking'
   */
  submittingBehavior?: FormSubmittingBehavior;
  /**
   * このフォームの欄の、必須の印の形の既定。欄の requiredMark を書いたときは、そちらが勝ちます。
   * asterisk（赤い「*」）にするときは、「* は必須の項目です」の一文をフォームの先頭などに置いてください（文は使う側が書きます）
   * @default 'tag'
   */
  requiredMark?: RequiredMark;
  /**
   * このフォームの欄の、任意の印の形の既定。text は required でない欄の見出しの後ろに「任意」を出します。
   * 欄の optionalMark を書いたときは、そちらが勝ちます
   * @default 'none'
   */
  optionalMark?: OptionalMark;
}

/**
 * フォーム（design/adr/0044）
 * 値を確かめるのはアプリ（onSubmit の中で、各欄の error・warning を決める）。Form は、その描画のあとでフォーカスを移す
 * 送信中（submitting）が終わった描画でも、送ったときの場所にフォーカスが残っていれば、同じくフォーカスを移す（サーバーから返ってきたエラー）
 * 中の欄の行は、欄を離れたときやあとから確かめたときに出ると、polite で知らせる。送信で出たとき（送信中が終わってフォーカスを移したときも）は知らせない（移った先で読むため）
 * 既定では noValidate（ブラウザの吹き出しを出さず、欄の下の行で知らせる）
 */
export function Form({
  showErrorSummary = false,
  errorSummaryTitle = defaultSummaryTitle,
  noValidate = true,
  submitting = false,
  submittingBehavior = 'blocking',
  requiredMark,
  optionalMark,
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
  const errorSummaryRef = useRef(showErrorSummary);
  useLayoutEffect(() => {
    errorSummaryRef.current = showErrorSummary;
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
  // 送っているあいだの送信（Enter など）は、onSubmit を呼ばずに止める（二重に送らない）
  // 押した送信のボタン。送っているあいだ、中の送信のボタン（Button）に配る。印はこのボタンにだけ出る
  const [submitter, setSubmitter] = useState<Element | null>(null);
  const wasSubmitting = useRef(submitting);
  // 送ったときにフォーカスのあった場所（押した送信のボタン、Enter を押した欄、body）。送信中が終わったときに比べる
  const [origin, setOrigin] = useState<Element | null>(null);
  const handleSubmit: NonNullable<FormProps['onSubmit']> = (event) => {
    if (submitting) {
      event.preventDefault();
      return;
    }
    setSubmitter(submitterOf(event));
    setOrigin(event.currentTarget.ownerDocument.activeElement);
    onSubmit?.(event);
    setSubmitCount((count) => count + 1);
  };

  // 送信中が終わった描画（submitting が true から false）: 送ったときの場所にフォーカスが残っていれば、エラーへフォーカスを移す回数を増やす
  // 欄の行が、同じ描画で「送信で出た」と分かるように、描画の中で決める（アプリがエラーを渡すのと submitting を false にするのが同じ描画のとき）
  // 送っているあいだに別の欄へ移っていたら増やさない。フォーカスを奪わず、行は polite で知らせる
  const [settle, setSettle] = useState({ submitting, count: 0 });
  if (settle.submitting !== submitting) {
    const stayed = !submitting && focusStayedAt(origin);
    setSettle({ submitting, count: stayed ? settle.count + 1 : settle.count });
    if (!submitting) setOrigin(null);
  }
  const focusCount = submitCount + settle.count;

  // 送信なしに submitting になったとき（アプリが直に切り替えたとき）は、最初の送信のボタンに印を出す
  // 送り終えたら忘れる。次に送信なしで submitting になったとき、前に押したボタンに出さないため
  //   送り終えるまでは忘れない（押してから、アプリが待ったあとで submitting にしても、押したボタンに出す）
  useLayoutEffect(() => {
    const form = formRef.current;
    if (submitting && !submitter && form) setSubmitter(defaultSubmitButton(form));
    else if (!submitting && wasSubmitting.current) setSubmitter(null);
    wasSubmitting.current = submitting;
  }, [submitting, submitter]);

  // 送信で出たエラー（送信中が終わったときに出たエラーも）が描かれたあと: 最初のエラーの欄か、エラーの一覧へフォーカスを移す
  useLayoutEffect(() => {
    const form = formRef.current;
    if (!focusCount || !form) return;
    const entries = collectErrors(form);
    if (errorSummaryRef.current) {
      setSummary(entries.length ? { entries, focus: focusCount } : null);
      return;
    }
    setSummary(null);
    if (entries[0]) focusField(form, entries[0].messageId, true);
  }, [focusCount]);

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

  // 印の既定は、外の ThemeProvider に重ねる（書いた値だけが勝つ）
  const outerConfig = useUIConfig();
  const uiConfig = useMemo(
    () =>
      requiredMark === undefined && optionalMark === undefined
        ? outerConfig
        : {
            ...outerConfig,
            requiredMark: requiredMark ?? outerConfig.requiredMark,
            optionalMark: optionalMark ?? outerConfig.optionalMark,
          },
    [outerConfig, requiredMark, optionalMark]
  );
  const context = useMemo(
    () => ({
      focusCount,
      submitting,
      submittingBehavior,
      submitter: submitting ? submitter : null,
    }),
    [focusCount, submitting, submittingBehavior, submitter]
  );
  return (
    <FormSubmitContext.Provider value={context}>
      <UIConfigContext value={uiConfig}>
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
                'rounded-control',
                ...focusRing,
                '[transition:outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
              ].join(' ')}
            >
              <Notice
                status="danger"
                live={false}
                title={<span id={titleId}>{errorSummaryTitle(summary.entries.length)}</span>}
              >
                {/* 項目の間は、欄の中の行の間と同じ --spacing-field-gap（指用 8px・マウス用 6px — design/adr/0044 の追記）
                題と最初の項目の間も同じにする（お知らせの題と本文の間 2px に、差の分を足す）。題が最初の項目にだけ寄って見えないように */}
                <ul className="mt-[calc(var(--spacing-field-gap)-var(--spacing)*0.5)] flex flex-col gap-(--spacing-field-gap)">
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
      </UIConfigContext>
    </FormSubmitContext.Provider>
  );
}
