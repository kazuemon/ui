'use client';

import { Form as BaseForm } from '@base-ui/react/form';
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';

import type { FieldValidationMode } from '../../internal/field/Field';
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

/** Form の errors（design/adr/0255）。キーは欄の name、値はエラーの文（複数あれば配列） */
export type FormErrors = Record<string, string | string[]>;

export interface FormProps extends ComponentProps<'form'> {
  /**
   * 送信したときのエラーの知らせ方（design/adr/0044）
   * false: エラーのある最初の欄へフォーカスを移し、入力した文字を選ぶ。その欄の名前と説明（キャプション → エラー）が読まれる
   * true: フォームの上にエラーの一覧（危険のお知らせ。題と、各欄へのリンク「欄の名前: エラーの文」）を出し、一覧へフォーカスを移す。長いフォーム向け
   * @default false
   */
  showErrorSummary?: boolean;
  /**
   * サーバーなど、外から返ってきた検証エラーです（design/adr/0255）。キーは欄の name（Field・TextField などに渡した name）、
   * 値はエラーの文（複数あれば配列）です。name が一致する欄の下の行に出し、その欄をエラーの状態にします。
   * その欄に errorText も渡しているときは、errorText を優先します。
   * react-hook-form などのライブラリを使うときは、ライブラリの検証結果をここに渡し、欄の validate は使いません（二重に検証しないため）。
   * submitting を false にするのと同じ描画で渡してください（下の submitting の説明と同じ理由です）
   */
  errors?: FormErrors;
  /**
   * どの欄にも結び付かないエラーの文です（「通信できませんでした」「このメールアドレスはすでに登録されています」など）。
   * フォームの上に危険のお知らせとして出します。showErrorSummary のときは、エラーの一覧と一緒に出します。
   * 送信したとき（submitting を false に戻したときも）に渡されていれば、このお知らせへフォーカスを移します。
   * サーバーから返ってきたときは、errors と同じく submitting を false にするのと同じ描画で渡してください
   */
  formErrorText?: ReactNode;
  /**
   * 送信したとき（Base UI の検証を通ったとき）に、欄の名前と値の組を1つのオブジェクトにして呼びます（design/adr/0255・0243）。
   * 渡すと、ブラウザの既定の送信（ページ遷移）は起きません。onSubmit（下の、DOM のイベントを受け取るもの）と両方渡したときは、
   * onSubmit を先に呼びます
   */
  onFormSubmit?: (values: Record<string, unknown>) => void;
  /**
   * このフォームの欄の、検証のタイミングの既定です（design/adr/0255）。欄の validationMode を書いたときは、そちらが勝ちます
   * @default 'onSubmit'
   */
  validationMode?: FieldValidationMode;
  /**
   * エラーの一覧の題です。showErrorSummary が true のときだけ使います
   * @default (count) => `入力を確かめてください（${count}件）`
   */
  errorSummaryTitle?: (count: number) => string;
  /**
   * ブラウザの既定の検証（吹き出し）を止めるかどうかです。true（既定）では吹き出しを出さず、欄の下の行（Field）だけで知らせます。
   * `required` はどの欄もブラウザの制約にしていないので、false にしても吹き出しは出ません。
   * `inputProps` で `type="email"`・`pattern`・`minLength` などブラウザの制約になる属性を自分で渡したときだけ、
   * false でその制約の吹き出しが働きます（design/adr/0255 の影響）
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
 * フォーム（design/adr/0044・0255）。Base UI の Form の上に作り直しています
 * 値を確かめるのはアプリ（onSubmit・onFormSubmit の中で各欄の error・warning を決めるか、欄の validate を使うか、errors を渡す）。
 * Form は、その描画のあとでフォーカスを移す
 * ブラウザネイティブの検証には寄せません。欄は required を渡してもブラウザの制約（`required` 属性）は付けず、aria-required だけで
 * 必須であることを伝えます。送信を止め、行の文を出すのは欄の validate・Form の errors だけです（design/adr/0255 の影響）
 * 送信中（submitting）が終わった描画でも、送ったときの場所にフォーカスが残っていれば、同じくフォーカスを移す（サーバーから返ってきたエラー・errors）
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
  errors,
  formErrorText,
  onFormSubmit,
  validationMode,
  onSubmit,
  ref,
  children,
  ...props
}: FormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const formErrorId = useId();
  const [submitCount, setSubmitCount] = useState(0);
  // エラーの一覧
  const [summary, setSummary] = useState<{ entries: ErrorEntry[] } | null>(null);
  // フォームの上のお知らせ（エラーの一覧・formErrorText）へフォーカスを移した送信の回数（送信のたびに移す。中身が変わっただけでは移さない）
  const [panelFocus, setPanelFocus] = useState(0);
  const errorSummaryRef = useRef(showErrorSummary);
  const hasFormError = formErrorText != null && formErrorText !== false && formErrorText !== '';
  const formErrorRef = useRef(hasFormError);
  useLayoutEffect(() => {
    errorSummaryRef.current = showErrorSummary;
    formErrorRef.current = hasFormError;
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
  // Base UI に送信を止めるかを確かめさせているあいだ（送信のイベントの中だけ）。欄は、アプリが決めたエラー（errorText）を
  // Base UI の invalid に渡さない（useAppInvalid）。止めるのは欄の validate と errors だけにする（design/adr/0255）
  const [checkingSubmit, setCheckingSubmit] = useState(false);
  // 送信のイベント（Base UI の Form の onSubmit を包む）。送信の回数（focusCount のもと）は、Base UI の検証とアプリの onSubmit と
  // 同じリスナーの中で数える。人が押した送信では、キャプチャとバブルのリスナーのあいだで React が描くので、キャプチャで数えると
  // エラーの行が出る前の描画でフォーカスの仕組みが動いてしまう。Base UI が欄の validate で止めた（onSubmit を呼ばない）ときも数える
  const handleSubmitEvent = (
    event: Parameters<NonNullable<FormProps['onSubmit']>>[0],
    baseSubmit: FormProps['onSubmit']
  ) => {
    const pressed = submitterOf(event);
    // 送ったときにフォーカスのあった場所。Base UI が止めてフォーカスを移す前に読む
    const focused = event.currentTarget.ownerDocument.activeElement;
    // 欄の invalid を外した形を、Base UI の欄の登録まで描いてから確かめさせる。確かめ終えたら戻す（同じ描画にまとめるので、外した形は画面に出ない）
    flushSync(() => setCheckingSubmit(true));
    try {
      baseSubmit?.(event);
    } finally {
      setCheckingSubmit(false);
      // 送っているあいだの送信は数えない（handleSubmit が onSubmit を呼ばずに止める）
      if (!submitting) {
        setSubmitter(pressed);
        setOrigin(focused);
        setSubmitCount((count) => count + 1);
      }
    }
  };
  const handleSubmit: NonNullable<FormProps['onSubmit']> = (event) => {
    if (submitting) {
      event.preventDefault();
      return;
    }
    onSubmit?.(event);
  };
  // Base UI の Form は、onSubmit のあとに続けて onFormSubmit を呼ぶ（送っているあいだの判定を挟まない）ので、ここでも確かめる
  const handleFormSubmit = onFormSubmit
    ? (values: Record<string, unknown>) => {
        if (submitting) return;
        onFormSubmit(values);
      }
    : undefined;

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

  // 送信で出たエラー（送信中が終わったときに出たエラーも）が描かれたあと: 最初のエラーの欄か、フォームの上のお知らせへフォーカスを移す
  // どの欄にも結び付かないエラー（formErrorText）があるときは、欄より先にお知らせへ移す
  useLayoutEffect(() => {
    const form = formRef.current;
    if (!focusCount || !form) return;
    const entries = collectErrors(form);
    const summaryShown = errorSummaryRef.current && entries.length > 0;
    setSummary(summaryShown ? { entries } : null);
    if (summaryShown || formErrorRef.current) {
      setPanelFocus(focusCount);
      return;
    }
    if (entries[0]) focusField(form, entries[0].messageId, true);
  }, [focusCount]);

  useLayoutEffect(() => {
    if (panelFocus) summaryRef.current?.focus();
  }, [panelFocus]);

  // 一覧を出しているあいだは、欄のエラーの変化に合わせて一覧を直す。直した欄は一覧から消え、なくなると一覧を閉じる
  const summaryShown = summary !== null;
  useEffect(() => {
    const form = formRef.current;
    if (!summaryShown || !form) return undefined;
    const observer = new MutationObserver(() => {
      const entries = collectErrors(form);
      setSummary((current) => {
        if (!current || sameEntries(current.entries, entries)) return current;
        return entries.length ? { entries } : null;
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
      checkingSubmit,
    }),
    [focusCount, submitting, submittingBehavior, submitter, checkingSubmit]
  );
  return (
    <FormSubmitContext.Provider value={context}>
      <UIConfigContext value={uiConfig}>
        <BaseForm<Record<string, unknown>>
          {...props}
          ref={setRefs}
          noValidate={noValidate}
          errors={errors}
          validationMode={validationMode}
          onSubmit={handleSubmit}
          onFormSubmit={handleFormSubmit}
          render={(formProps) => (
            <form
              {...formProps}
              onSubmit={(event) => handleSubmitEvent(event, formProps.onSubmit)}
            />
          )}
        >
          {(summary || hasFormError) && (
            // フォームの上のお知らせ。どの欄にも結び付かないエラー（formErrorText）と、エラーの一覧（GOV.UK の error summary の形）
            // どちらも危険のお知らせ（design/adr/0043）で描く。フォーカスを移して読ませるので、お知らせの role の箱（alert）は使わない
            // 移ると「題、グループ」と中身が読まれる
            // 両方あるときは、どの欄にも結び付かないエラーを別のお知らせにして一覧の上に置く。間は欄の中の行の間と同じ
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="group"
              aria-labelledby={summary ? titleId : formErrorId}
              data-slot="form-error-summary"
              className={[
                'flex flex-col gap-(--spacing-field-gap) rounded-control',
                ...focusRing,
                '[transition:outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
              ].join(' ')}
            >
              {hasFormError && (
                <Notice status="danger" live={false}>
                  <span id={formErrorId}>{formErrorText}</span>
                </Notice>
              )}
              {summary && (
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
                            if (formRef.current)
                              focusField(formRef.current, entry.messageId, false);
                          }}
                        >
                          {entryText(entry)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Notice>
              )}
            </div>
          )}
          {children}
        </BaseForm>
      </UIConfigContext>
    </FormSubmitContext.Provider>
  );
}
